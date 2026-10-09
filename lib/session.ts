import { and, eq, gt } from 'drizzle-orm'
import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { db, schema } from '@/lib/db'

export const SESSION_COOKIE = 'relay_session'
const SESSION_DAYS = 30
const sha256 = (v: string) => createHash('sha256').update(v).digest('hex')

export async function createSession(userId: number) {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000)
  await db.insert(schema.sessions).values({ tokenHash: sha256(token), userId, expiresAt })
  ;(await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  })
}

export async function destroySession() {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.tokenHash, sha256(token)))
  jar.delete(SESSION_COOKIE)
}

/** The signed-in user, or null. Everything in the app goes through this one function. */
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return null
  const [row] = await db
    .select({ user: schema.users })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.tokenHash, sha256(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1)
  return row?.user ?? null
})
