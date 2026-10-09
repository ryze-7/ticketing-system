import { CheckCircle2, Clock3, Ticket } from 'lucide-react'
import { redirect } from 'next/navigation'
import { TicketList } from '@/components/ticket-list'
import { isAgentRole } from '@/lib/constants'
import { getStats } from '@/lib/queries'
import { getCurrentUser } from '@/lib/session'
import { formatDuration } from '@/lib/time'

export default async function OverviewPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const [params, stats] = await Promise.all([searchParams, getStats(user)])
  const agent = isAgentRole(user.role)

  return (
    <>
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-indigo-600">Welcome back, {user.name.split(' ')[0]}</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">{agent ? 'Support overview' : 'Your requests'}</h1>
        <p className="mt-2 text-sm text-slate-500">Keep your requests moving and your team in the loop.</p>
      </div>

      <div className="mb-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open tickets" value={String(stats.open)} detail={`${stats.submittedToday} submitted in last 24h`} icon={<Ticket />} tone="bg-indigo-50 text-indigo-600" />
        <StatCard label="In progress" value={String(stats.inProgress)} detail={`${stats.waiting} waiting on a reply`} icon={<Clock3 />} tone="bg-violet-50 text-violet-600" />
        <StatCard label="Resolved this month" value={String(stats.resolvedMonth)} detail={`${stats.total} tickets total`} icon={<CheckCircle2 />} tone="bg-emerald-50 text-emerald-600" />
        <StatCard
          label="Avg. response time"
          value={stats.avgResponseSeconds != null ? formatDuration(stats.avgResponseSeconds) : '—'}
          detail={stats.responseSample ? `First reply, across ${stats.responseSample} tickets` : 'No replies yet'}
          icon={<Clock3 />}
          tone="bg-amber-50 text-amber-600"
        />
      </div>

      <TicketList
        user={user}
        params={params}
        title="Recent tickets"
        subtitle="Track and manage every request in one place."
        limit={8}
        footerLink={{ href: agent ? '/tickets' : '/my-requests', label: 'View all tickets' }}
      />
    </>
  )
}

function StatCard({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <div className={`flex size-8 items-center justify-center rounded-lg [&_svg]:size-4 ${tone}`}>{icon}</div>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  )
}

