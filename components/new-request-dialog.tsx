'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { api } from '@/lib/client'
import { PRIORITIES, TEAMS } from '@/lib/constants'

const field =
  'mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none ring-indigo-500 focus:ring-2'

export function NewRequestDialog({ defaultTeam, onClose }: { defaultTeam: string; onClose: () => void }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [team, setTeam] = useState(TEAMS.includes(defaultTeam as never) ? defaultTeam : 'Operations')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { ticket } = await api<{ ticket: { id: number } }>('/api/tickets', 'POST', {
        title,
        description,
        priority,
        team,
      })
      onClose()
      router.push(`/tickets/${ticket.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Create a new ticket</h2>
            <p className="mt-1 text-sm text-slate-500">Tell the IT team what you need help with.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>

        <label className="text-xs font-semibold text-slate-700" htmlFor="req-title">Summary</label>
        <input id="req-title" autoFocus required minLength={3} maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Example: I need access to the reporting dashboard" className={field} />

        <label className="mt-4 block text-xs font-semibold text-slate-700" htmlFor="req-desc">Details (optional)</label>
        <textarea id="req-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What happened? What have you tried?" className={`${field} min-h-24 resize-none`} />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700" htmlFor="req-priority">Priority</label>
            <select id="req-priority" value={priority} onChange={(e) => setPriority(e.target.value)} className={field}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700" htmlFor="req-team">Your team</label>
            <select id="req-team" value={team} onChange={(e) => setTeam(e.target.value)} className={field}>
              {TEAMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700" role="alert">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={submitting} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {submitting ? 'Submitting…' : 'Submit ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}
