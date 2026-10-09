import { LifeBuoy } from 'lucide-react'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { getCurrentUser } from '@/lib/session'
import { isSignupOpen } from '@/lib/users'
import { LogoFull } from '@/components/logo'

export const metadata = { title: 'Sign in · IT Support' }

export default async function LoginPage() {
  if (await getCurrentUser()) redirect('/')
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f7f8fc] p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-20 shrink-0 items-center border-b border-slate-100 px-7">
          <LogoFull className="h-9 w-auto" />
        </div>
        {/* <span className="text-lg font-semibold tracking-tight">INDOLOG</span> */}
      </div>
      <AuthForm mode="login" signupOpen={await isSignupOpen()} />
    </main>
  )
}
