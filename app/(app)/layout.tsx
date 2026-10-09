import { asc } from 'drizzle-orm'
import { AppShell } from '@/components/app-shell'
import { db, schema } from '@/lib/db'
import { visibilityFilter } from '@/lib/queries'
import { getCurrentUser } from '@/lib/session'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc] p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">Database is empty</h1>
          <p className="mt-2 text-sm text-slate-500">
            The tables exist but there are no users yet. Run <code className="rounded bg-slate-100 px-1.5 py-0.5">pnpm db:seed</code> to
            create demo users and tickets, then refresh.
          </p>
        </div>
      </div>
    )
  }

  const [users, ticketCount] = await Promise.all([
    db.query.users.findMany({ orderBy: asc(schema.users.id), columns: { id: true, name: true, role: true, team: true } }),
    db.$count(schema.tickets, visibilityFilter(user)),
  ])

  return (
    <AppShell user={{ id: user.id, name: user.name, role: user.role, team: user.team }} users={users} ticketCount={ticketCount}>
      {children}
    </AppShell>
  )
}
