import { NextResponse } from 'next/server'
import { handleError } from '@/lib/api'
import { destroySession } from '@/lib/session'

export async function POST() {
  try {
    await destroySession()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return handleError(e)
  }
}
