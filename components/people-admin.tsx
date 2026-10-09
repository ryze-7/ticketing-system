'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { UserPlus, X } from 'lucide-react'
import { api } from '@/lib/client'
import { ROLES, TEAMS } from '@/lib/constants'

const field = 'mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-indigo-500 focus:ring-2'
const label = 'text-xs font-semibold text-slate-700'

/** Readable temporary password, no look-alike characters (0/O, 1/l/I). */
function generatePassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

export function AddPersonButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', team: 'Operations', role: 'employee', password: '' })
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)
  const [busy, setBusy] = useState(false)

  function reset() {
    setOpen(false)
    setCreated(null)
    setError('')
    setForm({ name: '', email: '', team: 'Operations', role: 'employee', password: '' })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/api/users', 'POST', form)
      setCreated({ email: form.email, password: form.password })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create user.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={() => { setForm((f) => ({ ...f, password: generatePassword() })); setOpen(true) }} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700">
        <UserPlus className="size-4" /> Add person
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <h2 className="text-lg font-bold">{created ? 'Account created' : 'Add a person'}</h2>
              <button onClick={reset} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close"><X className="size-5" /></button>
            </div>

            {created ? (
              <>
                <p className="text-sm text-slate-600">Share these sign-in details with them. This password is shown only now.</p>
                <dl className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                  <div><dt className="text-xs text-slate-400">Email</dt><dd className="font-mono">{created.email}</dd></div>
                  <div><dt className="text-xs text-slate-400">Temporary password</dt><dd className="font-mono">{created.password}</dd></div>
                </dl>
                <button onClick={reset} className="mt-5 h-10 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700">Done</button>
              </>
            ) : (
              <form onSubmit={submit}>
                <label className={label} htmlFor="p-name">Full name</label>
                <input id="p-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
                <label className={`${label} mt-4 block`} htmlFor="p-email">Email</label>
                <input id="p-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className={label} htmlFor="p-role">Role</label>
                    <select id="p-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={`${field} capitalize`}>
                      {ROLES.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label} htmlFor="p-team">Team</label>
                    <select id="p-team" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} className={field}>
                      {TEAMS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <label className={`${label} mt-4 block`} htmlFor="p-pass">Temporary password</label>
                <div className="flex gap-2">
                  <input id="p-pass" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${field} font-mono`} />
                  <button type="button" onClick={() => setForm({ ...form, password: generatePassword() })} className="mt-1.5 shrink-0 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50">Generate</button>
                </div>
                {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700" role="alert">{error}</p>}
                <button type="submit" disabled={busy} className="mt-6 h-10 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{busy ? 'Creating…' : 'Create account'}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export function PersonActions({ id, role, isSelf }: { id: number; role: string; isSelf: boolean }) {
  const router = useRouter()
  const [value, setValue] = useState(role)
  const [error, setError] = useState('')
  const [resetting, setResetting] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [done, setDone] = useState('')
  const [pending, startTransition] = useTransition()

  function changeRole(next: string) {
    const prev = value
    setValue(next)
    setError('')
    startTransition(async () => {
      try {
        await api(`/api/users/${id}`, 'PATCH', { role: next })
        router.refresh()
      } catch (e) {
        setValue(prev)
        setError(e instanceof Error ? e.message : 'Could not change role.')
      }
    })
  }

  function savePassword() {
    setError('')
    startTransition(async () => {
      try {
        await api(`/api/users/${id}`, 'PATCH', { password: newPassword })
        setDone(newPassword)
        setResetting(false)
        setNewPassword('')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not reset password.')
      }
    })
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex items-center gap-2">
        <select aria-label="Role" value={value} disabled={isSelf || pending} title={isSelf ? 'You cannot change your own role' : undefined} onChange={(e) => changeRole(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs capitalize outline-none ring-indigo-500 focus:ring-2 disabled:opacity-60">
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
        {!resetting && <button onClick={() => { setDone(''); setNewPassword(generatePassword()); setResetting(true) }} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Reset password</button>}
      </div>
      {resetting && (
        <div className="flex items-center gap-2">
          <input aria-label="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-8 w-36 rounded-lg border border-slate-200 px-2 font-mono text-xs outline-none ring-indigo-500 focus:ring-2" />
          <button onClick={savePassword} disabled={pending || newPassword.length < 8} className="text-xs font-semibold text-indigo-600 disabled:opacity-50">Save</button>
          <button onClick={() => setResetting(false)} className="text-xs text-slate-400">Cancel</button>
        </div>
      )}
      {done && <p className="text-xs text-emerald-700">Password set to <span className="font-mono">{done}</span>. Share it with them.</p>}
      {error && <p className="text-xs text-rose-700" role="alert">{error}</p>}
    </div>
  )
}
