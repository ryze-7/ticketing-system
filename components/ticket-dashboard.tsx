'use client'

import { useMemo, useState } from 'react'
import { Bell, CheckCircle2, ChevronDown, CircleHelp, Clock3, Filter, LayoutDashboard, LifeBuoy, Menu, MessageSquare, Plus, Search, Settings, SlidersHorizontal, Ticket, Users, X } from 'lucide-react'

const initialTickets = [
  { id: 'REQ-1048', title: 'Laptop cannot connect to warehouse Wi-Fi', requester: 'Priya Shah', team: 'Operations', priority: 'High', status: 'In progress', updated: '12 min ago', initials: 'PS', color: 'bg-violet-100 text-violet-700' },
  { id: 'REQ-1047', title: 'Add new driver to route planning tool', requester: 'Daniel Kim', team: 'Fleet', priority: 'Medium', status: 'Open', updated: '28 min ago', initials: 'DK', color: 'bg-sky-100 text-sky-700' },
  { id: 'REQ-1046', title: 'Printer not responding in dispatch office', requester: 'Amelia Fox', team: 'Dispatch', priority: 'Low', status: 'Open', updated: '1 hr ago', initials: 'AF', color: 'bg-amber-100 text-amber-700' },
  { id: 'REQ-1045', title: 'Request access to shipment reporting dashboard', requester: 'Marcus Lee', team: 'Finance', priority: 'Medium', status: 'Waiting', updated: '2 hrs ago', initials: 'ML', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'REQ-1044', title: 'Email delivery delayed for customer notifications', requester: 'Sofia Martinez', team: 'Customer Care', priority: 'High', status: 'Resolved', updated: 'Yesterday', initials: 'SM', color: 'bg-rose-100 text-rose-700' },
]

const statusStyles: Record<string, string> = { 'Open': 'bg-sky-50 text-sky-700', 'In progress': 'bg-violet-50 text-violet-700', Waiting: 'bg-amber-50 text-amber-700', Resolved: 'bg-emerald-50 text-emerald-700' }
const priorityStyles: Record<string, string> = { High: 'text-rose-600', Medium: 'text-amber-600', Low: 'text-emerald-600' }

export function TicketDashboard() {
  const [tickets, setTickets] = useState(initialTickets)
  const [activeFilter, setActiveFilter] = useState('All tickets')
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const visibleTickets = useMemo(() => tickets.filter((ticket) => {
    const matchesSearch = `${ticket.id} ${ticket.title} ${ticket.requester}`.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = activeFilter === 'All tickets' || ticket.status === activeFilter
    return matchesSearch && matchesFilter
  }), [tickets, search, activeFilter])

  function createTicket(event: React.FormEvent) {
    event.preventDefault()
    if (!newTitle.trim()) return
    setTickets([{ id: `REQ-${1050 + tickets.length}`, title: newTitle, requester: 'You', team: 'Operations', priority: 'Medium', status: 'Open', updated: 'Just now', initials: 'YO', color: 'bg-indigo-100 text-indigo-700' }, ...tickets])
    setNewTitle('')
    setShowNew(false)
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-7"><div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm"><LifeBuoy className="size-5" /></div><span className="text-lg font-semibold tracking-tight">RelayDesk</span></div>
        <nav className="flex flex-1 flex-col gap-1 px-4 py-7" aria-label="Main navigation">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
          <button className="flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700"><LayoutDashboard className="size-4" /> Overview</button>
          <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50"><Ticket className="size-4" /> All tickets <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-xs">24</span></button>
          <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50"><MessageSquare className="size-4" /> My requests</button>
          <p className="px-3 pb-2 pt-8 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Manage</p>
          <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50"><Users className="size-4" /> People</button>
          <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50"><Settings className="size-4" /> Settings</button>
        </nav>
        <div className="m-4 rounded-2xl bg-slate-50 p-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-slate-700">Need a hand?</span><CircleHelp className="size-4 text-slate-400" /></div><p className="text-xs leading-5 text-slate-500">Check our quick guides or contact HR.</p><button className="mt-3 text-xs font-semibold text-indigo-600">Visit help center →</button></div>
        <div className="flex items-center gap-3 border-t border-slate-100 px-6 py-5"><div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">AR</div><div className="min-w-0"><p className="truncate text-sm font-semibold">Alex Roberts</p><p className="text-xs text-slate-400">Employee</p></div><ChevronDown className="ml-auto size-4 text-slate-400" /></div>
      </aside>

      <main className="lg:pl-64">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8"><button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open navigation"><Menu /></button><div className="relative ml-auto flex items-center gap-3"><button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50" aria-label="Notifications"><Bell className="size-5" /><span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-indigo-500 ring-2 ring-white" /></button><div className="hidden h-6 w-px bg-slate-200 sm:block" /><span className="hidden text-sm text-slate-500 sm:block">Tuesday, October 8</span></div></header>
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-indigo-600">Good morning, Alex</p><h1 className="text-3xl font-bold tracking-tight text-slate-950">Support overview</h1><p className="mt-2 text-sm text-slate-500">Keep your requests moving and your team in the loop.</p></div><button onClick={() => setShowNew(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"><Plus className="size-4" /> New request</button></div>
          <div className="mb-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Open tickets" value="12" detail="3 submitted today" icon={<Ticket />} tone="indigo" /><StatCard label="In progress" value="7" detail="2 need your reply" icon={<Clock3 />} tone="violet" /><StatCard label="Resolved this month" value="86" detail="14% faster than Sep" icon={<CheckCircle2 />} tone="emerald" /><StatCard label="Avg. response time" value="2h 14m" detail="Within team target" icon={<Clock3 />} tone="amber" /></div>
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="font-semibold text-slate-950">Recent tickets</h2><p className="mt-1 text-xs text-slate-500">Track and manage every request in one place.</p></div><div className="flex gap-2"><div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets..." className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none ring-indigo-500 placeholder:text-slate-400 focus:ring-2 sm:w-52" /></div><button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" aria-label="Filter tickets"><Filter className="size-4" /></button></div></div><div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-5 pt-3 sm:px-6">{['All tickets', 'Open', 'In progress', 'Waiting', 'Resolved'].map((filter) => <button key={filter} onClick={() => setActiveFilter(filter)} className={`whitespace-nowrap border-b-2 px-2 pb-3 text-xs font-semibold transition ${activeFilter === filter ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>{filter}</button>)}</div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"><th className="px-6 py-4">Request</th><th className="px-4 py-4">Requester</th><th className="px-4 py-4">Priority</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Updated</th><th className="px-6 py-4 text-right"><SlidersHorizontal className="ml-auto size-4" /></th></tr></thead><tbody>{visibleTickets.map((ticket) => <tr key={ticket.id} className="border-t border-slate-100 text-sm transition hover:bg-slate-50/70"><td className="px-6 py-4"><div className="flex items-start gap-3"><div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${ticket.color}`}>{ticket.initials}</div><div><p className="font-semibold text-slate-800">{ticket.title}</p><p className="mt-1 text-xs text-slate-400">{ticket.id} · {ticket.team}</p></div></div></td><td className="px-4 py-4 text-xs text-slate-500">{ticket.requester}</td><td className={`px-4 py-4 text-xs font-semibold ${priorityStyles[ticket.priority]}`}>{ticket.priority}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[ticket.status]}`}>{ticket.status}</span></td><td className="px-4 py-4 text-xs text-slate-400">{ticket.updated}</td><td className="px-6 py-4 text-right"><button className="rounded-md p-1 text-slate-400 hover:bg-slate-100" aria-label={`Open ${ticket.id}`}><ChevronDown className="size-4 -rotate-90" /></button></td></tr>)}</tbody></table>{visibleTickets.length === 0 && <div className="px-6 py-14 text-center text-sm text-slate-500">No tickets match your search.</div>}</div><div className="flex items-center justify-between border-t border-slate-100 px-6 py-4"><p className="text-xs text-slate-400">Showing <span className="font-semibold text-slate-600">{visibleTickets.length}</span> of {tickets.length} tickets</p><button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View all tickets →</button></div></section>
        </div>
      </main>
      {showNew && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4" role="dialog" aria-modal="true"><form onSubmit={createTicket} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-lg font-bold">Create a new request</h2><p className="mt-1 text-sm text-slate-500">Tell the IT team what you need help with.</p></div><button type="button" onClick={() => setShowNew(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close"><X className="size-5" /></button></div><label className="text-xs font-semibold text-slate-700" htmlFor="request-title">What can we help with?</label><textarea id="request-title" autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Example: I need access to..." className="mt-2 min-h-28 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none ring-indigo-500 focus:ring-2" /><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setShowNew(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">Cancel</button><button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Submit request</button></div></form></div>}
    </div>
  )
}

function StatCard({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: React.ReactNode; tone: string }) { const tones: Record<string, string> = { indigo: 'bg-indigo-50 text-indigo-600', violet: 'bg-violet-50 text-violet-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600' }; return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate-500">{label}</p><div className={`flex size-8 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</div></div><p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div> }

export default TicketDashboard
