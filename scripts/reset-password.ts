import { db } from '@/lib/db' // Adjust this import based on where your db client is exported
import { users } from '@/lib/db/schema' // Adjust to your schema path
import { hashPassword } from '@/lib/password'
import { eq } from 'drizzle-orm'

async function reset() {
  const email = 'your-email@example.com' // Put your login email here
  const newPassword = 'myNewPassword123'  // Put your new password here
  
  const passwordHash = await hashPassword(newPassword)

  await db.update(users)
    .set({ passwordHash })
    .where(eq(users.email, email))

  console.log(`Password updated successfully for ${email}!`)
  process.exit(0)
}

reset().catch(console.error)