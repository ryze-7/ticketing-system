'use client'
import { LogoFull } from '@/components/logo'
import { LogoMark } from '@/components/logo'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { api } from '@/lib/client'
import { TEAMS } from '@/lib/constants'

const input =
  'mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-indigo-500 focus:ring-2'
const label = 'text-xs font-semibold text-slate-700'

export function AuthForm({ mode, signupOpen, firstUser }: { mode: 'login' | 'signup'; signupOpen: boolean; firstUser?: boolean }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [team, setTeam] = useState('Operations')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const signup = mode === 'signup'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api(signup ? '/api/auth/signup' : '/api/auth/login', 'POST', signup ? { name, email, password, team } : { email, password })
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <h1 className="text-xl font-bold tracking-tight text-slate-950">{signup ? 'Create your account' : 'Sign in'}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {signup
          ? firstUser
            ? 'You are the first user, so this account will be the admin.'
            : 'Use your work email.'
          : 'Welcome back to IT Support.'}
      </p>

      {signup && (
        <>
          <label className={`${label} mt-5 block`} htmlFor="name">Full name</label>
          <input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={input} />
        </>
      )}

      <label className={`${label} mt-4 block`} htmlFor="email">Email</label>
      <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />

      <label className={`${label} mt-4 block`} htmlFor="password">Password</label>
      <input id="password" type="password" required minLength={signup ? 8 : 1} autoComplete={signup ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
      {signup && <p className="mt-1 text-xs text-slate-400">At least 8 characters.</p>}

      {signup && (
        <>
          <label className={`${label} mt-4 block`} htmlFor="team">Your team</label>
          <select id="team" value={team} onChange={(e) => setTeam(e.target.value)} className={input}>
            {TEAMS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </>
      )}

      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700" role="alert">{error}</p>}

      <button type="submit" disabled={busy} className="mt-6 h-10 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
        {busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}
      </button>

      <p className="mt-5 text-center text-xs text-slate-500">
        {signup ? (
          <>Already have an account? <Link href="/login" className="font-semibold text-indigo-600">Sign in</Link></>
        ) : signupOpen ? (
          <>New here? <Link href="/signup" className="font-semibold text-indigo-600">Create an account</Link></>
        ) : (
          'Need an account? Ask an admin to create one for you.'
        )}
      </p>
    </form>
  )
}