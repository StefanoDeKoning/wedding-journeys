# Self-hosting OurJourney with Docker + PostgreSQL

OurJourney runs on Lovable Cloud (managed Postgres + Auth) by default, but the
schema is portable plain SQL. You can run a private copy locally — for
development, demos, or as a fallback to the hosted platform.

## What you get

- **Postgres 16** — holds every wedding's tables, with strict per-tenant
  isolation enforced by Row Level Security (the `wedding_id` column is on
  every wedding-specific row).
- **Supabase Studio (optional)** — visual table editor and SQL runner.
- **Migrations folder** — every `supabase/migrations/*.sql` file is applied
  on first boot in filename order.

> The Lovable hosted environment uses Supabase under the hood. The same
> migrations work locally; the only difference is that auth and storage are
> not provisioned by this compose file (use the Supabase CLI or hosted Lovable
> Cloud for those).

## Prerequisites

- Docker Desktop or Docker Engine 24+
- `docker compose` v2

## Quick start

```bash
# from the repo root
cp .env.example .env.local      # then edit values as needed
docker compose -f docker/docker-compose.yml up -d

# Postgres is now on localhost:54329
# Studio (if started) is on http://localhost:54323
```

The compose file:

1. Starts Postgres with the `OURJOURNEY_DB_PASSWORD` you set.
2. Mounts `./supabase/migrations` and runs every `*.sql` file once on first boot.
3. Mounts a named volume `ourjourney_pgdata` so data survives restarts.

## Pointing the app at local Postgres

The app talks to Supabase via the publishable anon key. To run fully local you
either:

- **Use the Supabase CLI** (`npx supabase start`) — it provisions Postgres,
  GoTrue (auth), Storage, and the Studio in one go and applies the same
  `supabase/migrations` folder. This is the closest match to production.
- **Bring-your-own Postgres** — point `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
  and `SUPABASE_SERVICE_ROLE_KEY` at any Supabase-compatible deployment.

## Tenant isolation guarantees

Every wedding-specific row has a `wedding_id` foreign key. RLS policies use
two helper functions:

- `is_wedding_admin(user_id, wedding_id)` — true for platform owners and
  any user listed in `wedding_members` for that wedding.
- `current_guest_wedding_id()` — reads `wedding_id` from the guest's JWT
  `app_metadata`, so guests can only see rows scoped to the wedding they
  signed into.

A misconfigured query cannot return another wedding's data — Postgres rejects
it at the row level.

## Backup

```bash
docker compose -f docker/docker-compose.yml exec db \
  pg_dump -U ourjourney ourjourney > backups/ourjourney-$(date +%F).sql
```

Restore by piping the dump back through `psql` against a fresh database.
