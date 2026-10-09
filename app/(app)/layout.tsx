import { redirect } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { db, schema } from '@/lib/db'
import { visibilityFilter } from '@/lib/queries'
import { getCurrentUser } from '@/lib/session'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const ticketCount = await db.$count(schema.tickets, visibilityFilter(user))

  return (
    <AppShell user={{ id: user.id, name: user.name, role: user.role, team: user.team }} ticketCount={ticketCount}>
      {children}
    </AppShell>
  )
}
