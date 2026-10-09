import { and, eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { isAgentRole, type Priority, type Status } from '@/lib/constants'
import type { User } from '@/lib/db/schema'
import { visibilityFilter } from '@/lib/queries'

const { tickets, comments, users } = schema

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export async function createTicket(
  user: User,
  input: { title: string; description: string; priority: Priority; team: string },
) {
  const [ticket] = await db
    .insert(tickets)
    .values({ ...input, requesterId: user.id })
    .returning()
  return ticket
}

export async function updateTicket(
  user: User,
  id: number,
  patch: { status?: Status; priority?: Priority; team?: string; assigneeId?: number | null },
) {
  if (!isAgentRole(user.role)) throw new HttpError(403, 'Only agents can change ticket details.')

  const existing = await db.query.tickets.findFirst({ where: eq(tickets.id, id) })
  if (!existing) throw new HttpError(404, 'Ticket not found.')

  if (patch.assigneeId != null) {
    const assignee = await db.query.users.findFirst({ where: eq(users.id, patch.assigneeId) })
    if (!assignee || !isAgentRole(assignee.role)) throw new HttpError(400, 'Assignee must be an agent or admin.')
  }

  const values: Partial<typeof tickets.$inferInsert> = { ...patch, updatedAt: new Date() }
  if (patch.status && patch.status !== existing.status) {
    values.resolvedAt = patch.status === 'Resolved' ? new Date() : null
  }

  const [updated] = await db.update(tickets).set(values).where(eq(tickets.id, id)).returning()
  return updated
}

export async function addComment(user: User, ticketId: number, body: string) {
  const ticket = await db.query.tickets.findFirst({
    where: and(eq(tickets.id, ticketId), visibilityFilter(user)),
  })
  if (!ticket) throw new HttpError(404, 'Ticket not found.')

  const [comment] = await db.insert(comments).values({ ticketId, authorId: user.id, body }).returning()

  // A requester replying to a ticket that was waiting on them puts it back in motion.
  const values: Partial<typeof tickets.$inferInsert> = { updatedAt: new Date() }
  if (user.id === ticket.requesterId && ticket.status === 'Waiting') values.status = 'In progress'
  await db.update(tickets).set(values).where(eq(tickets.id, ticketId))

  return comment
}
