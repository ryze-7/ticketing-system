import './load-env' // must stay first so DATABASE_URL is set before the db client loads
import { sql } from 'drizzle-orm'
import { db, schema } from '../lib/db'
import type { Priority, Status } from '../lib/constants'

const { users, tickets, comments } = schema
const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000)

async function main() {
  const count = await db.$count(users)
  if (count > 0 && !process.argv.includes('--force')) {
    console.log('Database already has users. Use --force to wipe and reseed.')
    process.exit(0)
  }

  // Wipe everything and reset ID counters so tickets start again at REQ-1001
  await db.execute(sql`truncate table comments, tickets, users restart identity cascade`)

  const inserted = await db
    .insert(users)
    .values([
      { name: 'Alex Roberts', email: 'alex@relaydesk.test', role: 'employee', team: 'Operations' },
      { name: 'Priya Shah', email: 'priya@relaydesk.test', role: 'employee', team: 'Operations' },
      { name: 'Daniel Kim', email: 'daniel@relaydesk.test', role: 'employee', team: 'Fleet' },
      { name: 'Amelia Fox', email: 'amelia@relaydesk.test', role: 'employee', team: 'Dispatch' },
      { name: 'Marcus Lee', email: 'marcus@relaydesk.test', role: 'employee', team: 'Finance' },
      { name: 'Sofia Martinez', email: 'sofia@relaydesk.test', role: 'employee', team: 'Customer Care' },
      { name: 'Jordan Blake', email: 'jordan@relaydesk.test', role: 'agent', team: 'IT' },
      { name: 'Taylor Nguyen', email: 'taylor@relaydesk.test', role: 'admin', team: 'IT' },
    ])
    .returning()
  const u = Object.fromEntries(inserted.map((x) => [x.name.split(' ')[0], x]))

  const seedTickets: Array<{
    title: string; description: string; requester: string; assignee?: string
    team: string; priority: Priority; status: Status; created: number
  }> = [
    { title: 'Email delivery delayed for customer notifications', description: 'Order confirmation emails are arriving 30+ minutes late.', requester: 'Sofia', assignee: 'Taylor', team: 'Customer Care', priority: 'High', status: 'Resolved', created: 60 * 30 },
    { title: 'Request access to shipment reporting dashboard', description: 'Need read access for month-end reconciliation.', requester: 'Marcus', assignee: 'Jordan', team: 'Finance', priority: 'Medium', status: 'Waiting', created: 60 * 5 },
    { title: 'Printer not responding in dispatch office', description: 'Label printer shows offline since this morning.', requester: 'Amelia', team: 'Dispatch', priority: 'Low', status: 'Open', created: 60 * 2 },
    { title: 'Add new driver to route planning tool', description: 'New hire starting Monday, needs an account and route access.', requester: 'Daniel', team: 'Fleet', priority: 'Medium', status: 'Open', created: 90 },
    { title: 'Laptop cannot connect to warehouse Wi-Fi', description: 'Connects fine elsewhere but drops on the warehouse floor.', requester: 'Priya', assignee: 'Jordan', team: 'Operations', priority: 'High', status: 'In progress', created: 45 },
    { title: 'Request second monitor for planning desk', description: 'Route planning is much slower on a single screen.', requester: 'Alex', assignee: 'Jordan', team: 'Operations', priority: 'Low', status: 'In progress', created: 60 * 26 },
    { title: 'Cannot log in to shipment tracking portal', description: 'Password reset email never arrives.', requester: 'Alex', team: 'Operations', priority: 'Medium', status: 'Open', created: 20 },
  ]

  for (const t of seedTickets) {
    const createdAt = ago(t.created)
    const [row] = await db
      .insert(tickets)
      .values({
        title: t.title, description: t.description, team: t.team,
        priority: t.priority, status: t.status,
        requesterId: u[t.requester].id, assigneeId: t.assignee ? u[t.assignee].id : null,
        createdAt, updatedAt: ago(Math.max(5, t.created / 3)),
        resolvedAt: t.status === 'Resolved' ? ago(t.created / 2) : null,
      })
      .returning()

    if (t.assignee) {
      await db.insert(comments).values([
        { ticketId: row.id, authorId: u[t.assignee].id, body: 'Thanks for reporting this. I am looking into it now.', createdAt: new Date(createdAt.getTime() + 18 * 60_000) },
        { ticketId: row.id, authorId: u[t.requester].id, body: 'Appreciate it. Let me know if you need anything from me.', createdAt: new Date(createdAt.getTime() + 25 * 60_000) },
      ])
    }
  }

  console.log(`Seeded ${inserted.length} users and ${seedTickets.length} tickets.`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
