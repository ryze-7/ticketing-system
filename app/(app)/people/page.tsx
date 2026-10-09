import { redirect } from 'next/navigation'
import { Avatar } from '@/components/avatar'
import { isAgentRole } from '@/lib/constants'
import { listPeople } from '@/lib/queries'
import { getCurrentUser } from '@/lib/session'

const roleStyles: Record<string, string> = {
  employee: 'bg-slate-100 text-slate-600',
  agent: 'bg-violet-50 text-violet-700',
  admin: 'bg-indigo-50 text-indigo-700',
}

export default async function PeoplePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/')
  if (!isAgentRole(user.role)) redirect('/')
  const people = await listPeople()

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">People</h1>
        <p className="mt-2 text-sm text-slate-500">Everyone who can raise or work on tickets.</p>
      </div>
      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-6 py-4">Person</th>
              <th className="px-4 py-4">Role</th>
              <th className="px-4 py-4">Team</th>
              <th className="px-4 py-4">Requested</th>
              <th className="px-4 py-4">Assigned (active)</th>
            </tr>
          </thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 text-sm">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar id={p.id} name={p.name} />
                    <div>
                      <p className="font-semibold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${roleStyles[p.role]}`}>{p.role}</span></td>
                <td className="px-4 py-4 text-xs text-slate-500">{p.team}</td>
                <td className="px-4 py-4 text-xs text-slate-500">{p.requested}</td>
                <td className="px-4 py-4 text-xs text-slate-500">{isAgentRole(p.role) ? p.assigned : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
