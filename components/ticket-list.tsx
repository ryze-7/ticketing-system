import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Avatar } from '@/components/avatar'
import { StatusTabs, TicketFilters } from '@/components/ticket-filters'
import { PRIORITIES, STATUSES, priorityStyles, statusStyles, type Priority, type Status } from '@/lib/constants'
import { db, schema } from '@/lib/db'
import type { User } from '@/lib/db/schema'
import { listTickets, visibilityFilter } from '@/lib/queries'
import { timeAgo } from '@/lib/time'
import { and, eq } from 'drizzle-orm'

type SearchParams = Record<string, string | string[] | undefined>
const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export async function TicketList({
  user,
  params,
  title,
  subtitle,
  mineOnly,
  limit,
  footerLink,
}: {
  user: User
  params: SearchParams
  title: string
  subtitle: string
  mineOnly?: boolean
  limit?: number
  footerLink?: { href: string; label: string }
}) {
  const status = pick(params.status)
  const priority = pick(params.priority)
  const q = pick(params.q)

  const tickets = await listTickets(user, {
    status: STATUSES.includes(status as Status) ? (status as Status) : undefined,
    priority: PRIORITIES.includes(priority as Priority) ? (priority as Priority) : undefined,
    q,
    mineOnly,
    limit,
  })
  const total = await db.$count(
    schema.tickets,
    and(visibilityFilter(user), mineOnly ? eq(schema.tickets.requesterId, user.id) : undefined),
  )
  const filtered = Boolean(status || priority || q)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <TicketFilters />
      </div>
      <StatusTabs />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-6 py-4">Request</th>
              <th className="px-4 py-4">Requester</th>
              <th className="px-4 py-4">Assignee</th>
              <th className="px-4 py-4">Priority</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Updated</th>
              <th className="px-6 py-4"><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-t border-slate-100 text-sm transition hover:bg-slate-50/70">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <Avatar id={t.requester.id} name={t.requester.name} className="mt-0.5" />
                    <div>
                      <Link href={`/tickets/${t.id}`} className="font-semibold text-slate-800 hover:text-indigo-700">{t.title}</Link>
                      <p className="mt-1 text-xs text-slate-400">REQ-{t.id} · {t.team}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-xs text-slate-500">{t.requester.name}</td>
                <td className="px-4 py-4 text-xs text-slate-500">{t.assignee?.name ?? <span className="text-slate-300">Unassigned</span>}</td>
                <td className={`px-4 py-4 text-xs font-semibold ${priorityStyles[t.priority]}`}>{t.priority}</td>
                <td className="px-4 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[t.status]}`}>{t.status}</span></td>
                <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-400">{timeAgo(t.updatedAt)}</td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/tickets/${t.id}`} className="inline-flex rounded-md p-1 text-slate-400 hover:bg-slate-100" aria-label={`Open REQ-${t.id}`}><ChevronRight className="size-4" /></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 && (
          <div className="px-6 py-14 text-center text-sm text-slate-500">
            {filtered ? 'No tickets match your filters.' : 'No tickets yet. Use “New ticket” to create one.'}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
        <p className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-600">{tickets.length}</span> of {total} tickets
        </p>
        {footerLink && <Link href={footerLink.href} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">{footerLink.label} →</Link>}
      </div>
    </section>
  )
}
