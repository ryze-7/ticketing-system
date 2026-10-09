# RelayDesk

Ticketing system: Next.js 16 + Postgres (Drizzle ORM). Employees raise tickets; agents/admins triage, assign and reply.

## Run locally

```bash
pnpm install
docker compose up -d            # local Postgres (or use a Neon/Supabase URL instead)
cp .env.example .env.local      # set DATABASE_URL
pnpm db:push                    # create tables
pnpm db:seed                    # demo users + tickets (pnpm db:reset wipes and reseeds)
pnpm dev
```

Use **"Demo: switch user"** in the sidebar to act as an employee, agent or admin.

## Deploy to Vercel

1. Create a Postgres database: Vercel dashboard → Storage → Neon (it sets `DATABASE_URL` for you), or paste a Supabase **pooled** connection string.
2. Push the schema to that database once, from your machine:
   `DATABASE_URL="<prod url>" pnpm db:push` (add `pnpm db:seed` if you want demo data).
3. Deploy / redeploy. Make sure `DATABASE_URL` is set for Production.

## How it works

- `lib/db/schema.ts` – users, tickets, comments. Ticket ids start at 1001 (shown as REQ-1001).
- `lib/queries.ts` / `lib/mutations.ts` – all reads/writes and the permission rules
  (employees only see their own tickets; only agents/admins can edit status, priority, team, assignee).
- `app/api/*` – REST endpoints used by the UI (`/api/tickets`, `/api/tickets/:id`, `/api/tickets/:id/comments`).
- `app/(app)/*` – pages: overview, all tickets, my requests, ticket detail, people.

## Important: auth is a demo

`lib/session.ts` trusts a cookie, so **anyone can switch to the admin user**. That is fine for a demo, but do not put real
data behind it. Replace `getCurrentUser()` (and delete `app/api/session`) with a real provider (Auth.js, Clerk, Supabase Auth);
nothing else needs to change.
