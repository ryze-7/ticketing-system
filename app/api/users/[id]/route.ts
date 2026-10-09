import { NextResponse } from 'next/server'
import { handleError, parseBody, parseId, requireAdmin } from '@/lib/api'
import { adminUpdateUser } from '@/lib/users'
import { adminUpdateUserSchema } from '@/lib/validation'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    const id = parseId((await params).id)
    await adminUpdateUser(admin.id, id, await parseBody(req, adminUpdateUserSchema))
    return NextResponse.json({ ok: true })
  } catch (e) {
    return handleError(e)
  }
}
