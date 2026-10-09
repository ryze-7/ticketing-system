import { NextResponse } from 'next/server'
import { handleError, parseBody, requireUser } from '@/lib/api'
import { PRIORITIES, STATUSES, type Priority, type Status } from '@/lib/constants'
import { createTicket } from '@/lib/mutations'
import { listTickets } from '@/lib/queries'
import { createTicketSchema } from '@/lib/validation'

export async function GET(req: Request) {
  try {
    const user = await requireUser()
    const p = new URL(req.url).searchParams
    const status = p.get('status') as Status | null
    const priority = p.get('priority') as Priority | null
    const tickets = await listTickets(user, {
      status: status && STATUSES.includes(status) ? status : undefined,
      priority: priority && PRIORITIES.includes(priority) ? priority : undefined,
      q: p.get('q') ?? undefined,
      mineOnly: p.get('mine') === '1',
    })
    return NextResponse.json({ tickets })
  } catch (e) {
    return handleError(e)
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const input = await parseBody(req, createTicketSchema)
    const ticket = await createTicket(user, input)
    return NextResponse.json({ ticket }, { status: 201 })
  } catch (e) {
    return handleError(e)
  }
}
