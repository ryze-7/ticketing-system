import { and, asc, desc, eq, ilike, inArray, or, sql, type SQL } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { isAgentRole, type Priority, type Status } from '@/lib/constants'
import type { User } from '@/lib/db/schema'

const { tickets, users, comments } = schema

/** Employees only ever see their own tickets; agents and admins see everything. */
export function visibilityFilter(user: User): SQL | undefined {
  return isAgentRole(user.role) ? undefined : eq(tickets.requesterId, user.id)
}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`)

export type TicketFilters = {
  status?: Status
  priority?: Priority
  q?: string
  mineOnly?: boolean
  limit?: number
}

export async function listTickets(user: User, f: TicketFilters = {}) {
  const conditions: (SQL | undefined)[] = [visibilityFilter(user)]
  if (f.mineOnly) conditions.push(eq(tickets.requesterId, user.id))
  if (f.status) conditions.push(eq(tickets.status, f.status))
  if (f.priority) conditions.push(eq(tickets.priority, f.priority))

  const q = f.q?.trim()
  if (q) {
    const like = `%${escapeLike(q)}%`
    const idPart = q.replace(/^req-?/i, '').trim()
    conditions.push(
      or(
        ilike(tickets.title, like),
        idPart ? sql`cast(${tickets.id} as text) like ${`%${escapeLike(idPart)}%`}` : undefined,
        inArray(tickets.requesterId, db.select({ id: users.id }).from(users).where(ilike(users.name, like))),
      ),
    )
  }

  return db.query.tickets.findMany({
    where: and(...conditions),
    with: { requester: true, assignee: true },
    orderBy: desc(tickets.updatedAt),
    limit: f.limit,
  })
}

export async function getTicket(user: User, id: number) {
  const ticket = await db.query.tickets.findFirst({
    where: and(eq(tickets.id, id), visibilityFilter(user)),
    with: {
      requester: true,
      assignee: true,
      comments: { with: { author: true }, orderBy: asc(comments.createdAt) },
    },
  })
  return ticket ?? null
}

export async function listAgents() {
  return db.query.users.findMany({
    where: inArray(users.role, ['agent', 'admin']),
    orderBy: asc(users.name),
  })
}

export async function listPeople() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      team: users.team,
      // Raw qualified SQL: Drizzle omits table prefixes in single-table selects,
      // which would make `id` inside the subquery resolve to tickets.id.
      requested: sql<number>`(select count(*) from "tickets" t where t."requester_id" = "users"."id")`.mapWith(Number),
      assigned: sql<number>`(select count(*) from "tickets" t where t."assignee_id" = "users"."id" and t."status" <> 'Resolved')`.mapWith(Number),
    })
    .from(users)
    .orderBy(asc(users.name))
}

export async function getStats(user: User) {
  const scope = visibilityFilter(user)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const dayAgo = new Date(now.getTime() - 24 * 3600 * 1000)

  const [counts] = await db
    .select({
      open: sql<number>`count(*) filter (where ${tickets.status} = 'Open')`.mapWith(Number),
      inProgress: sql<number>`count(*) filter (where ${tickets.status} = 'In progress')`.mapWith(Number),
      waiting: sql<number>`count(*) filter (where ${tickets.status} = 'Waiting')`.mapWith(Number),
      resolvedMonth: sql<number>`count(*) filter (where ${tickets.status} = 'Resolved' and ${tickets.resolvedAt} >= ${monthStart.toISOString()})`.mapWith(Number),
      submittedToday: sql<number>`count(*) filter (where ${tickets.createdAt} >= ${dayAgo.toISOString()})`.mapWith(Number),
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(tickets)
    .where(scope)

  // Average time from ticket creation to the first reply from an agent/admin.
  const firstReplies = db
    .select({
      ticketId: comments.ticketId,
      firstAt: sql<Date>`min(${comments.createdAt})`.as('first_at'),
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.authorId))
    .where(inArray(users.role, ['agent', 'admin']))
    .groupBy(comments.ticketId)
    .as('first_replies')

  const [resp] = await db
    .select({
      avgSeconds: sql<number | null>`avg(extract(epoch from (${firstReplies.firstAt} - ${tickets.createdAt})))`.mapWith(Number),
      n: sql<number>`count(*)`.mapWith(Number),
    })
    .from(tickets)
    .innerJoin(firstReplies, eq(firstReplies.ticketId, tickets.id))
    .where(scope)

  return { ...counts, avgResponseSeconds: resp.n > 0 ? resp.avgSeconds : null, responseSample: resp.n }
}

