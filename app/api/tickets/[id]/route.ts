import { NextResponse } from 'next/server'
import { handleError, parseBody, parseId, requireUser } from '@/lib/api'
import { HttpError, updateTicket } from '@/lib/mutations'
import { getTicket } from '@/lib/queries'
import { updateTicketSchema } from '@/lib/validation'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser()
    const ticket = await getTicket(user, parseId((await params).id))
    if (!ticket) throw new HttpError(404, 'Ticket not found.')
    return NextResponse.json({ ticket })
  } catch (e) {
    return handleError(e)
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser()
    const id = parseId((await params).id)
    const patch = await parseBody(req, updateTicketSchema)
    const ticket = await updateTicket(user, id, patch)
    return NextResponse.json({ ticket })
  } catch (e) {
    return handleError(e)
  }
}
