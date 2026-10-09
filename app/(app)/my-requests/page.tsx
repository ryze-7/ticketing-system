import { redirect } from 'next/navigation'
import { TicketList } from '@/components/ticket-list'
import { getCurrentUser } from '@/lib/session'

export default async function MyRequestsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">My requests</h1>
        <p className="mt-2 text-sm text-slate-500">Tickets you have submitted.</p>
      </div>
      <TicketList user={user} params={await searchParams} title="Your tickets" subtitle="Follow up on anything you have asked for." mineOnly />
    </>
  )
}
