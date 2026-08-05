-- ─────────────────────────────────────────────────────────────────────────────
-- 1.  Add storage_limit_bytes to weddings
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.weddings
  add column if not exists storage_limit_bytes bigint not null default 2147483648;  -- 2 GiB

-- ─────────────────────────────────────────────────────────────────────────────
-- 2.  guest_groups
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.guest_groups (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  color text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (wedding_id, name)
);

create index if not exists guest_groups_wedding_idx on public.guest_groups (wedding_id);

alter table public.guest_groups enable row level security;

create policy "Wedding admins manage guest groups"
  on public.guest_groups for all
  to authenticated
  using (public.is_wedding_admin(auth.uid(), wedding_id))
  with check (public.is_wedding_admin(auth.uid(), wedding_id));

create policy "Wedding members read guest groups"
  on public.guest_groups for select
  to authenticated
  using (wedding_id = public.current_guest_wedding_id());

create trigger trg_guest_groups_updated
  before update on public.guest_groups
  for each row execute function public.tg_set_updated_at();

alter table public.guests
  add column if not exists guest_group_id uuid references public.guest_groups(id) on delete set null;

create index if not exists guests_group_idx on public.guests (guest_group_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3.  seating_tables + seat_assignments
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.seating_tables (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  seat_count int not null check (seat_count between 1 and 30),
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (wedding_id, name)
);

create index if not exists seating_tables_wedding_idx on public.seating_tables (wedding_id);

alter table public.seating_tables enable row level security;

create policy "Wedding admins manage seating tables"
  on public.seating_tables for all
  to authenticated
  using (public.is_wedding_admin(auth.uid(), wedding_id))
  with check (public.is_wedding_admin(auth.uid(), wedding_id));

create policy "Wedding members read seating tables"
  on public.seating_tables for select
  to authenticated
  using (wedding_id = public.current_guest_wedding_id());

create trigger trg_seating_tables_updated
  before update on public.seating_tables
  for each row execute function public.tg_set_updated_at();

create table if not exists public.seat_assignments (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  table_id uuid not null references public.seating_tables(id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  seat_index int not null check (seat_index >= 0),
  created_at timestamptz not null default now(),
  unique (guest_id),
  unique (table_id, seat_index)
);

create index if not exists seat_assignments_wedding_idx on public.seat_assignments (wedding_id);
create index if not exists seat_assignments_table_idx on public.seat_assignments (table_id);

alter table public.seat_assignments enable row level security;

create policy "Wedding admins manage seat assignments"
  on public.seat_assignments for all
  to authenticated
  using (public.is_wedding_admin(auth.uid(), wedding_id))
  with check (public.is_wedding_admin(auth.uid(), wedding_id));

create policy "Guest reads own seat"
  on public.seat_assignments for select
  to authenticated
  using (
    wedding_id = public.current_guest_wedding_id()
    and guest_id = nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), '')::uuid
  );

create or replace function public.enforce_seat_requires_attending()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rsvp_status text;
begin
  select status::text into rsvp_status
  from public.rsvp_responses
  where guest_id = new.guest_id;

  if rsvp_status is null or rsvp_status <> 'yes' then
    raise exception 'Only guests with RSVP = attending can be seated';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_seat_assignments_require_attending on public.seat_assignments;
create trigger trg_seat_assignments_require_attending
  before insert or update on public.seat_assignments
  for each row execute function public.enforce_seat_requires_attending();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4.  timeline_events
-- ─────────────────────────────────────────────────────────────────────────────

do $$ begin
  create type public.timeline_visibility as enum ('all', 'day', 'evening');
exception when duplicate_object then null; end $$;

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  event_time time not null,
  title text not null,
  description text,
  visibility public.timeline_visibility not null default 'all',
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists timeline_events_wedding_idx on public.timeline_events (wedding_id, event_time);

alter table public.timeline_events enable row level security;

create policy "Wedding admins manage timeline"
  on public.timeline_events for all
  to authenticated
  using (public.is_wedding_admin(auth.uid(), wedding_id))
  with check (public.is_wedding_admin(auth.uid(), wedding_id));

create policy "Wedding members read timeline"
  on public.timeline_events for select
  to authenticated
  using (
    wedding_id = public.current_guest_wedding_id()
    and (
      visibility = 'all'
      or visibility::text = (
        select g.guest_type::text
        from public.guests g
        where g.id = nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), '')::uuid
      )
    )
  );

create policy "Public reads all-visibility timeline of published weddings"
  on public.timeline_events for select
  to anon, authenticated
  using (
    visibility = 'all'
    and exists (
      select 1 from public.weddings w
      where w.id = wedding_id and w.status = 'published' and w.is_public = true
    )
  );

create trigger trg_timeline_events_updated
  before update on public.timeline_events
  for each row execute function public.tg_set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5.  audit_log
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  actor_user_id uuid,
  actor_label text,
  action text not null,
  target_type text,
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_wedding_idx on public.audit_log (wedding_id, created_at desc);

alter table public.audit_log enable row level security;

create policy "Wedding admins read audit log"
  on public.audit_log for select
  to authenticated
  using (public.is_wedding_admin(auth.uid(), wedding_id));

create policy "Wedding admins insert audit log"
  on public.audit_log for insert
  to authenticated
  with check (public.is_wedding_admin(auth.uid(), wedding_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- 6.  Helper: storage usage per wedding
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.wedding_storage_used(_wedding_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(size_bytes), 0)::bigint
  from public.photos
  where wedding_id = _wedding_id;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7.  Soft-archive then delete retention helper
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.apply_guest_data_retention()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  archive_cutoff date := (now() - interval '3 months')::date;
  delete_cutoff  date := (now() - interval '6 months')::date;
begin
  update public.guests g
  set first_name = 'Guest',
      last_name  = '',
      email      = null,
      notes      = null,
      updated_at = now()
  from public.weddings w
  where g.wedding_id = w.id
    and w.wedding_date is not null
    and w.wedding_date < archive_cutoff
    and w.wedding_date >= delete_cutoff
    and (g.first_name <> 'Guest' or g.last_name <> '' or g.email is not null);

  update public.rsvp_responses r
  set comments = null,
      plus_one_name = null,
      dietary_other = null,
      updated_at = now()
  from public.weddings w
  where r.wedding_id = w.id
    and w.wedding_date is not null
    and w.wedding_date < archive_cutoff
    and w.wedding_date >= delete_cutoff;

  delete from public.photos p
  using public.weddings w
  where p.wedding_id = w.id
    and w.wedding_date is not null
    and w.wedding_date < delete_cutoff;

  delete from public.guests g
  using public.weddings w
  where g.wedding_id = w.id
    and w.wedding_date is not null
    and w.wedding_date < delete_cutoff;
end;
$$;
