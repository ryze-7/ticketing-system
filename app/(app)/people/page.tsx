import { redirect } from 'next/navigation'
import { Avatar } from '@/components/avatar'
import { AddPersonButton, PersonActions } from '@/components/people-admin'
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
  if (!user) redirect('/login')
  if (!isAgentRole(user.role)) redirect('/')
  const people = await listPeople()
  const isAdmin = user.role === 'admin'

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">People</h1>
          <p className="mt-2 text-sm text-slate-500">Everyone who can raise or work on tickets.</p>
        </div>
        {isAdmin && <AddPersonButton />}
      </div>
      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-6 py-4">Person</th>
              <th className="px-4 py-4">Role</th>
              <th className="px-4 py-4">Team</th>
              <th className="px-4 py-4">Requested</th>
              <th className="px-4 py-4">Assigned (active)</th>
              {isAdmin && <th className="px-4 py-4">Manage</th>}
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
                {isAdmin && <td className="px-4 py-4"><PersonActions id={p.id} role={p.role} isSelf={p.id === user.id} /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
