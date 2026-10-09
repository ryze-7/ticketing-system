import { redirect } from 'next/navigation'
import { TicketList } from '@/components/ticket-list'
import { isAgentRole } from '@/lib/constants'
import { getCurrentUser } from '@/lib/session'

export default async function AllTicketsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!isAgentRole(user.role)) redirect('/my-requests')

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">All tickets</h1>
        <p className="mt-2 text-sm text-slate-500">Every request across the company.</p>
      </div>
      <TicketList user={user} params={await searchParams} title="Tickets" subtitle="Search, filter and open any request." />
    </>
  )
}
