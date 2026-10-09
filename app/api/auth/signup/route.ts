import { NextResponse } from 'next/server'
import { handleError, parseBody } from '@/lib/api'
import { createSession } from '@/lib/session'
import { registerUser } from '@/lib/users'
import { signupSchema } from '@/lib/validation'

export async function POST(req: Request) {
  try {
    const user = await registerUser(await parseBody(req, signupSchema))
    await createSession(user.id)
    return NextResponse.json({ user }, { status: 201 })
  } catch (e) {
    return handleError(e)
  }
}
