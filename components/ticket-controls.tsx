'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { api } from '@/lib/client'
import { PRIORITIES, STATUSES, TEAMS } from '@/lib/constants'

type Agent = { id: number; name: string }
type Values = { status: string; priority: string; team: string; assigneeId: number | null }

const select = 'mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm outline-none ring-indigo-500 focus:ring-2 disabled:opacity-60'
const label = 'text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400'

export function TicketControls({ ticketId, initial, agents }: { ticketId: number; initial: Values; agents: Agent[] }) {
  const router = useRouter()
  const [values, setValues] = useState<Values>(initial)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function change(patch: Partial<Values>) {
    const previous = values
    setValues({ ...values, ...patch }) // optimistic
    setError('')
    startTransition(async () => {
      try {
        await api(`/api/tickets/${ticketId}`, 'PATCH', patch)
        router.refresh()
      } catch (e) {
        setValues(previous)
        setError(e instanceof Error ? e.message : 'Could not update ticket.')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={label} htmlFor="c-status">Status</label>
        <select id="c-status" className={select} value={values.status} disabled={pending} onChange={(e) => change({ status: e.target.value })}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="c-priority">Priority</label>
        <select id="c-priority" className={select} value={values.priority} disabled={pending} onChange={(e) => change({ priority: e.target.value })}>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="c-team">Team</label>
        <select id="c-team" className={select} value={values.team} disabled={pending} onChange={(e) => change({ team: e.target.value })}>
          {TEAMS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="c-assignee">Assignee</label>
        <select id="c-assignee" className={select} value={values.assigneeId ?? ''} disabled={pending} onChange={(e) => change({ assigneeId: e.target.value ? Number(e.target.value) : null })}>
          <option value="">Unassigned</option>
          {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700" role="alert">{error}</p>}
    </div>
  )
}
