'use client'
import { LogoMark } from '@/components/logo'
import { LogoFull } from '@/components/logo'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { LayoutDashboard, LifeBuoy, LogOut, Menu, MessageSquare, Plus, Ticket, Users, X } from 'lucide-react'
import { NewRequestDialog } from '@/components/new-request-dialog'
import { api } from '@/lib/client'
import { avatarColors } from '@/lib/constants'
import { initials } from '@/lib/time'
import { cn } from '@/lib/utils'

type ShellUser = { id: number; name: string; role: string; team: string }

const roleLabel: Record<string, string> = { employee: 'Employee', agent: 'Support agent', admin: 'Admin' }

export function AppShell({
  user,
  ticketCount,
  children,
}: {
  user: ShellUser
  ticketCount: number
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [today, setToday] = useState('')

  // Rendered client-side so it uses the visitor's timezone, not the server's.
  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))
  }, [])
  useEffect(() => setMenuOpen(false), [pathname])

  const sidebar = <SidebarContent user={user} ticketCount={ticketCount} pathname={pathname} />

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">{sidebar}</aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-950/30" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
            <button className="absolute right-3 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" onClick={() => setMenuOpen(false)} aria-label="Close navigation">
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="lg:pl-64">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <button className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu /></button>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden min-h-5 text-sm text-slate-500 sm:block">{today}</span>
            <button onClick={() => setShowNew(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700">
              <Plus className="size-4" /> New ticket
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">{children}</div>
      </main>

      {showNew && <NewRequestDialog defaultTeam={user.team} onClose={() => setShowNew(false)} />}
    </div>
  )
}

function NavLink({ href, icon, children, badge, pathname }: { href: string; icon: React.ReactNode; children: React.ReactNode; badge?: number; pathname: string }) {
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm', active ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-500 hover:bg-slate-50')}>
      {icon}
      {children}
      {badge !== undefined && <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{badge}</span>}
    </Link>
  )
}

function SidebarContent({ user, ticketCount, pathname }: { user: ShellUser; ticketCount: number; pathname: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const isAgent = user.role !== 'employee'

  function signOut() {
    startTransition(async () => {
      await api('/api/auth/logout', 'POST', {})
      router.push('/login')
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex h-20 shrink-0 items-center border-b border-slate-100 px-7">
        <LogoFull className="h-9 w-auto" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-7" aria-label="Main navigation">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
        <NavLink href="/" pathname={pathname} icon={<LayoutDashboard className="size-4" />}>Overview</NavLink>
        {isAgent && <NavLink href="/tickets" pathname={pathname} icon={<Ticket className="size-4" />} badge={ticketCount}>All tickets</NavLink>}
        <NavLink href="/my-requests" pathname={pathname} icon={<MessageSquare className="size-4" />} badge={isAgent ? undefined : ticketCount}>My requests</NavLink>
        {isAgent && (
          <>
            <p className="px-3 pb-2 pt-8 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Manage</p>
            <NavLink href="/people" pathname={pathname} icon={<Users className="size-4" />}>People</NavLink>
          </>
        )}
      </nav>

      <div className="shrink-0 border-t border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold', avatarColors[user.id % avatarColors.length])}>{initials(user.name)}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-slate-400">{roleLabel[user.role] ?? user.role}</p>
          </div>
        </div>
        <button onClick={signOut} disabled={pending} className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60">
          <LogOut className="size-4" /> {pending ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </>
  )
}
