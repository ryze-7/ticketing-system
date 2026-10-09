'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { PRIORITIES, STATUSES } from '@/lib/constants'

export function TicketFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [q, setQ] = useState(sp.get('q') ?? '')
  const status = sp.get('status') ?? ''
  const priority = sp.get('priority') ?? ''

  function update(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(sp.toString())
    for (const [k, v] of Object.entries(next)) v ? params.set(k, v) : params.delete(k)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  // Debounce typing so we don't query on every keystroke.
  useEffect(() => {
    if ((sp.get('q') ?? '') === q.trim()) return
    const t = setTimeout(() => update({ q: q.trim() || undefined }), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  return (
    <div className="flex gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tickets..." aria-label="Search tickets" className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none ring-indigo-500 placeholder:text-slate-400 focus:ring-2 sm:w-52" />
        </div>
        <select value={priority} onChange={(e) => update({ priority: e.target.value || undefined })} aria-label="Filter by priority" className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs outline-none ring-indigo-500 focus:ring-2">
          <option value="">Any priority</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
    </div>
  )
}

export function StatusTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const status = sp.get('status') ?? ''

  function select(s: string) {
    const params = new URLSearchParams(sp.toString())
    s ? params.set('status', s) : params.delete('status')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-5 pt-3 sm:px-6" role="tablist">
      {[{ v: '', label: 'All tickets' }, ...STATUSES.map((s) => ({ v: s as string, label: s as string }))].map((t) => (
        <button key={t.v} role="tab" aria-selected={status === t.v} onClick={() => select(t.v)} className={`whitespace-nowrap border-b-2 px-2 pb-3 text-xs font-semibold transition ${status === t.v ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
          {t.label}
        </button>
      ))}
    </div>
  )
}
