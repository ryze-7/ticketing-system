import './load-env' // must stay first so DATABASE_URL is set before the db client loads
import { eq } from 'drizzle-orm'
import { db, schema } from '../lib/db'
import { hashPassword } from '../lib/password'

// Lock-out recovery: pnpm db:reset-password <email> <new-password>
async function main() {
  const [rawEmail, password] = process.argv.slice(2)
  if (!rawEmail || !password || password.length < 8) {
    console.log('Usage: pnpm db:reset-password <email> <new-password, 8+ characters>')
    process.exit(1)
  }
  const email = rawEmail.trim().toLowerCase()
  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) })
  if (!user) {
    console.error(`No user with email ${email}.`)
    process.exit(1)
  }

  const passwordHash = await hashPassword(password)
  await db
    .insert(schema.credentials)
    .values({ userId: user.id, passwordHash })
    .onConflictDoUpdate({ target: schema.credentials.userId, set: { passwordHash, updatedAt: new Date() } })
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, user.id)) // sign them out everywhere

  console.log(`Password updated for ${user.email}. Sign in, then change it from People → Reset password if you shared it.`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
