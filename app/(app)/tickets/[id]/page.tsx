import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Avatar } from '@/components/avatar'
import { CommentForm } from '@/components/comment-form'
import { TicketControls } from '@/components/ticket-controls'
import { isAgentRole, priorityStyles, statusStyles } from '@/lib/constants'
import { getTicket, listAgents } from '@/lib/queries'
import { getCurrentUser } from '@/lib/session'
import { timeAgo } from '@/lib/time'

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()

  const ticket = await getTicket(user, id)
  if (!ticket) notFound()

  const agent = isAgentRole(user.role)
  const agents = agent ? await listAgents() : []

  return (
    <>
      <Link href={agent ? '/tickets' : '/my-requests'} className="mb-5 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600">
        <ChevronLeft className="size-4" /> Back to tickets
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">REQ-{ticket.id}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{ticket.title}</h1>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <Avatar id={ticket.requester.id} name={ticket.requester.name} className="size-6 text-[9px]" />
              <span>{ticket.requester.name} · {ticket.team} · opened {timeAgo(ticket.createdAt)}</span>
            </div>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {ticket.description || <span className="text-slate-400">No additional details provided.</span>}
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Conversation</h2>
            {ticket.comments.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No replies yet.</p>
            ) : (
              <ul className="mt-5 space-y-5">
                {ticket.comments.map((c) => (
                  <li key={c.id} className="flex gap-3">
                    <Avatar id={c.author.id} name={c.author.name} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-semibold text-slate-800">{c.author.name}</span>
                        {isAgentRole(c.author.role) && <span className="ml-2 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">Support</span>}
                        <span className="ml-2 text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{c.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <CommentForm ticketId={ticket.id} />
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-950">Details</h2>
          {agent ? (
            <TicketControls
              ticketId={ticket.id}
              initial={{ status: ticket.status, priority: ticket.priority, team: ticket.team, assigneeId: ticket.assigneeId }}
              agents={agents.map((a) => ({ id: a.id, name: a.name }))}
            />
          ) : (
            <dl className="space-y-4 text-sm">
              <Row label="Status"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[ticket.status]}`}>{ticket.status}</span></Row>
              <Row label="Priority"><span className={`text-xs font-semibold ${priorityStyles[ticket.priority]}`}>{ticket.priority}</span></Row>
              <Row label="Team">{ticket.team}</Row>
              <Row label="Assignee">{ticket.assignee?.name ?? <span className="text-slate-400">Unassigned</span>}</Row>
            </dl>
          )}
          <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400">Last updated {timeAgo(ticket.updatedAt)}</p>
        </aside>
      </div>
    </>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</dt>
      <dd className="mt-1.5 text-slate-700">{children}</dd>
    </div>
  )
}
