import { NextResponse } from 'next/server'
import { handleError, parseBody, requireAdmin } from '@/lib/api'
import { adminCreateUser } from '@/lib/users'
import { adminCreateUserSchema } from '@/lib/validation'

export async function POST(req: Request) {
  try {
    await requireAdmin()
    const user = await adminCreateUser(await parseBody(req, adminCreateUserSchema))
    return NextResponse.json({ user }, { status: 201 })
  } catch (e) {
    return handleError(e)
  }
}
