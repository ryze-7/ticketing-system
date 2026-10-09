import './load-env' // must stay first so DATABASE_URL is set before the db client loads
import { sql } from 'drizzle-orm'
import { db } from '../lib/db'

async function main() {
  const host = new URL(process.env.DATABASE_URL!).host
  if (!process.argv.includes('--yes')) {
    console.log(`This DELETES ALL users, tickets and comments in the database at:\n  ${host}\n`)
    console.log('Re-run with --yes to confirm:  pnpm db:wipe --yes')
    process.exit(1)
  }
  await db.execute(sql`truncate table comments, tickets, sessions, credentials, users restart identity cascade`)
  console.log(`Wiped ${host}. The next person to sign up becomes the admin.`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
