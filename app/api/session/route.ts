import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handleError, parseBody } from '@/lib/api'
import { db, schema } from '@/lib/db'
import { HttpError } from '@/lib/mutations'
import { SESSION_COOKIE } from '@/lib/session'

// DEMO AUTH: switch the active user. Remove this route when real auth is added.
export async function POST(req: Request) {
  try {
    const { userId } = await parseBody(req, z.object({ userId: z.number().int().positive() }))
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) })
    if (!user) throw new HttpError(404, 'User not found.')
    const res = NextResponse.json({ user })
    res.cookies.set(SESSION_COOKIE, String(user.id), { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
    return res
  } catch (e) {
    return handleError(e)
  }
}
