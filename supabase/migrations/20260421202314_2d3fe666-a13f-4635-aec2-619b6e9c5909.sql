-- 1. Enum (skip if exists)
do $$ begin
  create type public.wedding_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

-- 2. Columns (idempotent)
alter table public.weddings add column if not exists wedding_name text;
alter table public.weddings add column if not exists bride_name text;
alter table public.weddings add column if not exists groom_name text;
alter table public.weddings add column if not exists location_name text;
alter table public.weddings add column if not exists location_address text;
alter table public.weddings add column if not exists maps_url text;
alter table public.weddings add column if not exists status public.wedding_status not null default 'draft';
alter table public.weddings add column if not exists rsvp_deadline timestamptz;

-- 3. Make legacy columns nullable
alter table public.weddings alter column couple_name_one drop not null;
alter table public.weddings alter column couple_name_two drop not null;

-- 4. Slug format constraint already exists from prior partial run - skip

-- 5. Slug availability function
create or replace function public.is_slug_available(_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (select 1 from public.weddings where slug = lower(_slug));
$$;

grant execute on function public.is_slug_available(text) to anon, authenticated;

-- 6. Update public read policy
drop policy if exists "Public can read public weddings" on public.weddings;
drop policy if exists "Public can read published weddings" on public.weddings;

create policy "Public can read published weddings"
on public.weddings
for select
to anon, authenticated
using (status = 'published' and is_public = true);

-- 7. Backfill names
update public.weddings
set
  bride_name = coalesce(bride_name, couple_name_one),
  groom_name = coalesce(groom_name, couple_name_two),
  wedding_name = coalesce(wedding_name, couple_name_one || ' & ' || couple_name_two)
where bride_name is null or groom_name is null or wedding_name is null;