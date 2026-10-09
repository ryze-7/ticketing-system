import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { handleError, parseBody } from '@/lib/api'
import { db, schema } from '@/lib/db'
import { HttpError } from '@/lib/mutations'
import { dummyHash, verifyPassword } from '@/lib/password'
import { createSession } from '@/lib/session'
import { loginSchema } from '@/lib/validation'

export async function POST(req: Request) {
  try {
    const { email, password } = await parseBody(req, loginSchema)
    const [row] = await db
      .select({ user: schema.users, hash: schema.credentials.passwordHash })
      .from(schema.users)
      .innerJoin(schema.credentials, eq(schema.credentials.userId, schema.users.id))
      .where(eq(schema.users.email, email))
      .limit(1)

    // Always run one verification so response time doesn't reveal whether the email exists.
    const ok = await verifyPassword(password, row?.hash ?? (await dummyHash()))
    if (!row || !ok) throw new HttpError(401, 'Incorrect email or password.')

    await createSession(row.user.id)
    return NextResponse.json({ user: row.user })
  } catch (e) {
    return handleError(e)
  }
}
