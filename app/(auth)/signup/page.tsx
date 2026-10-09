import { LifeBuoy } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { db, schema } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { isSignupOpen } from '@/lib/users'
import { LogoFull } from '@/components/logo'
export const metadata = { title: 'Create account · INDOLOG' }

export default async function SignupPage() {
  if (await getCurrentUser()) redirect('/')
  const [open, accounts] = await Promise.all([isSignupOpen(), db.$count(schema.credentials)])
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f7f8fc] p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-20 shrink-0 items-center border-b border-slate-100 px-7">
          <LogoFull className="h-9 w-auto" />
        </div>
        {/* <span className="text-lg font-semibold tracking-tight">RelayDesk</span> */}
      </div>
      {open ? (
        <AuthForm mode="signup" signupOpen firstUser={accounts === 0} />
      ) : (
        <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <h1 className="text-lg font-bold text-slate-950">Sign-up is closed</h1>
          <p className="mt-2 text-sm text-slate-500">Ask an admin to create an account for you, then <Link href="/login" className="font-semibold text-indigo-600">sign in</Link>.</p>
        </div>
      )}
    </main>
  )
}
