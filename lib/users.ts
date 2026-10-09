import { eq, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import type { Role, Team } from '@/lib/constants'
import { HttpError } from '@/lib/mutations'
import { hashPassword } from '@/lib/password'

const { users, credentials, sessions } = schema

/** Set ALLOW_SIGNUP=false to close public sign-up once your team has accounts. */
const signupEnabled = () => process.env.ALLOW_SIGNUP !== 'false'

/** Sign-up is always open for the very first account, which becomes the admin. */
export async function isSignupOpen() {
  const accounts = await db.$count(credentials)
  return accounts === 0 || signupEnabled()
}

export async function registerUser(input: { name: string; email: string; password: string; team: Team }) {
  const passwordHash = await hashPassword(input.password)
  return db.transaction(async (tx) => {
    // Serialise sign-ups so two people racing can't both become the first admin.
    await tx.execute(sql`select pg_advisory_xact_lock(7001)`)
    const first = (await tx.$count(credentials)) === 0
    if (!first && !signupEnabled()) throw new HttpError(403, 'Sign-up is closed. Ask an admin to create your account.')

    const taken = await tx.query.users.findFirst({ where: eq(users.email, input.email) })
    if (taken) throw new HttpError(409, 'An account with this email already exists.')

    const [user] = await tx
      .insert(users)
      .values({ name: input.name, email: input.email, team: input.team, role: first ? 'admin' : 'employee' })
      .returning()
    await tx.insert(credentials).values({ userId: user.id, passwordHash })
    return user
  })
}

export async function adminCreateUser(input: { name: string; email: string; password: string; team: Team; role: Role }) {
  const passwordHash = await hashPassword(input.password)
  return db.transaction(async (tx) => {
    const taken = await tx.query.users.findFirst({ where: eq(users.email, input.email) })
    if (taken) throw new HttpError(409, 'An account with this email already exists.')
    const [user] = await tx
      .insert(users)
      .values({ name: input.name, email: input.email, team: input.team, role: input.role })
      .returning()
    await tx.insert(credentials).values({ userId: user.id, passwordHash })
    return user
  })
}

export async function adminUpdateUser(
  actorId: number,
  targetId: number,
  patch: { role?: Role; team?: Team; password?: string },
) {
  const target = await db.query.users.findFirst({ where: eq(users.id, targetId) })
  if (!target) throw new HttpError(404, 'User not found.')
  if (patch.role && targetId === actorId && patch.role !== target.role) {
    throw new HttpError(400, 'You cannot change your own role. Ask another admin.')
  }

  const { password, ...profile } = patch
  if (Object.keys(profile).length > 0) await db.update(users).set(profile).where(eq(users.id, targetId))

  if (password) {
    const passwordHash = await hashPassword(password)
    await db
      .insert(credentials)
      .values({ userId: targetId, passwordHash })
      .onConflictDoUpdate({ target: credentials.userId, set: { passwordHash, updatedAt: new Date() } })
    // A reset signs that person out everywhere (but keeps the admin who did it signed in).
    if (targetId !== actorId) await db.delete(sessions).where(eq(sessions.userId, targetId))
  }
}
