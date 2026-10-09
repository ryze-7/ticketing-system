import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const globalForDb = globalThis as unknown as { pgClient?: ReturnType<typeof postgres> }

function createClient() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.')
  }
  return postgres(url, {
    // Required for pooled connections (Neon / Supabase pgbouncer) and harmless locally.
    prepare: false,
    // Serverless functions: keep the pool tiny in production.
    max: process.env.NODE_ENV === 'production' ? 1 : 10,
  })
}

const client = globalForDb.pgClient ?? createClient()
if (process.env.NODE_ENV !== 'production') globalForDb.pgClient = client

export const db = drizzle(client, { schema, casing: 'snake_case' })
export { schema }
