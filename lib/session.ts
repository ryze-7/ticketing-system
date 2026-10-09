import { eq, asc } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { db, schema } from '@/lib/db'

export const SESSION_COOKIE = 'relay_uid'

/**
 * DEMO AUTH: the "logged in" user is whichever user id is stored in a cookie
 * (switch with the user menu in the sidebar). Replace this one function with a
 * real auth provider (Auth.js, Clerk, Supabase Auth...) and the rest of the app
 * keeps working, since everything calls getCurrentUser().
 */
export const getCurrentUser = cache(async () => {
  const jar = await cookies()
  const id = Number(jar.get(SESSION_COOKIE)?.value)
  if (Number.isInteger(id) && id > 0) {
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, id) })
    if (user) return user
  }
  // Default to the first employee so the app opens straight into a usable state.
  const fallback = await db.query.users.findFirst({
    where: eq(schema.users.role, 'employee'),
    orderBy: asc(schema.users.id),
  })
  return fallback ?? null
})
