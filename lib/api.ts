import { NextResponse } from 'next/server'
import type { ZodType } from 'zod'
import { getCurrentUser } from '@/lib/session'
import { HttpError } from '@/lib/mutations'

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) throw new HttpError(401, 'No user found. Run `pnpm db:seed` to create demo users.')
  return user
}

export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.')
  }
  const result = schema.safeParse(json)
  if (!result.success) {
    const issue = result.error.issues[0]
    throw new HttpError(400, `${issue.path.join('.') || 'body'}: ${issue.message}`)
  }
  return result.data
}

export function parseId(raw: string) {
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Invalid ticket id.')
  return id
}

export function handleError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  console.error(error)
  return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
}
