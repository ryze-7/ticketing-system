# RelayDesk

Ticketing system: Next.js 16 + Postgres (Drizzle ORM). Employees raise tickets; agents and admins triage, assign and reply.

## Run locally

```bash
pnpm install
cp .env.example .env.local      # then put your real DATABASE_URL in .env.local
pnpm db:push                    # create / update tables
pnpm dev
```

Open http://localhost:3000. **The first account you create becomes the admin.**

## Accounts

- Anyone can sign up at `/signup` (they start as an *employee*). Set `ALLOW_SIGNUP=false` to close public sign-up.
- Admins can add people with a temporary password, change roles, and reset passwords from the **People** page.
- Passwords are hashed with scrypt; sessions are random tokens stored hashed in the database (30 days, httpOnly cookie).

| Role | Can do |
| --- | --- |
| employee | Create tickets, see and reply to their own tickets |
| agent | See all tickets, change status/priority/team/assignee, reply, view People |
| admin | Everything above, plus add people, change roles, reset passwords |

## Start fresh (remove all users and tickets)

```bash
pnpm db:wipe          # shows which database it would wipe
pnpm db:wipe --yes    # actually wipes it
```

## Deploy to Vercel

1. Create a Postgres database (Vercel → Storage → Neon, or a Supabase pooled URL). Make sure `DATABASE_URL` is set for Production.
2. Create the tables once from your machine: `DATABASE_URL="<prod url>" pnpm db:push`.
3. Deploy, open the site, and sign up. That first account is your admin. Then consider setting `ALLOW_SIGNUP=false`.

## Layout

- `lib/db/schema.ts`: users, credentials (password hashes, kept separate on purpose), sessions, tickets, comments
- `lib/session.ts`: sessions and `getCurrentUser()`; `lib/users.ts`: sign-up and admin user management
- `lib/queries.ts` / `lib/mutations.ts`: reads, writes and ticket permission rules
- `app/api/*`: REST endpoints (`/api/auth/*`, `/api/users`, `/api/tickets`); `app/(app)/*`: signed-in pages; `app/(auth)/*`: login and sign-up
