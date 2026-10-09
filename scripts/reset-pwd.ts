import path from 'node:path'
import dotenv from 'dotenv'
import postgres from 'postgres'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { hashPassword } from '../lib/password'

async function run() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set in .env.local')
  }

  const sql = postgres(connectionString, { ssl: 'require' })
  const email = 'shourya.kashyap.05@gmail.com'
  const passwordHash = await hashPassword('password123')

  // 1. Get the user id for your email
  const users = await sql`SELECT id FROM users WHERE email = ${email}`
  if (users.length === 0) {
    throw new Error(`User with email ${email} not found in users table.`)
  }
  const userId = users[0].id

  // 2. Update the credentials table
  await sql`
    INSERT INTO credentials (user_id, password_hash, updated_at)
    VALUES (${userId}, ${passwordHash}, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET password_hash = ${passwordHash}, updated_at = NOW()
  `

  console.log('Success! Password updated to: password123')
  await sql.end()
  process.exit(0)
}

run().catch((err) => {
  console.error('Error updating password:', err)
  process.exit(1)
})