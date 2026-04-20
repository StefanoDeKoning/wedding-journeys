-- =========================================================
-- Enums
-- =========================================================
create type public.app_role as enum ('platform_owner');
create type public.wedding_role as enum ('primary_admin', 'secondary_admin');

-- =========================================================
-- Tables
-- =========================================================
create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  couple_name_one text not null,
  couple_name_two text not null,
  wedding_date date,
  is_public boolean not null default true,
  primary_admin_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weddings_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 60)
);

create index weddings_primary_admin_idx on public.weddings(primary_admin_id);

create table public.wedding_members (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.wedding_role not null,
  created_at timestamptz not null default now(),
  unique (wedding_id, user_id)
);

create index wedding_members_user_idx on public.wedding_members(user_id);
create index wedding_members_wedding_idx on public.wedding_members(wedding_id);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  invitation_code text not null,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (wedding_id, invitation_code),
  constraint guests_first_name_len check (char_length(first_name) between 1 and 80),
  constraint guests_last_name_len  check (char_length(last_name)  between 1 and 80),
  constraint guests_code_format    check (invitation_code ~ '^[A-Z0-9-]{4,32}$')
);

create index guests_wedding_idx on public.guests(wedding_id);
create index guests_lookup_idx on public.guests(wedding_id, lower(first_name), lower(last_name), invitation_code);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- =========================================================
-- Updated-at trigger
-- =========================================================
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger weddings_set_updated_at
before update on public.weddings
for each row execute function public.tg_set_updated_at();

create trigger guests_set_updated_at
before update on public.guests
for each row execute function public.tg_set_updated_at();

-- =========================================================
-- Security definer helpers (no recursion)
-- =========================================================
create or replace function public.has_platform_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create or replace function public.has_wedding_role(_user_id uuid, _wedding_id uuid, _role public.wedding_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.wedding_members
    where user_id = _user_id and wedding_id = _wedding_id and role = _role
  );
$$;

create or replace function public.is_wedding_admin(_user_id uuid, _wedding_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_platform_role(_user_id, 'platform_owner')
    or exists (
      select 1 from public.wedding_members
      where user_id = _user_id and wedding_id = _wedding_id
    );
$$;

-- Reads wedding_id from the guest session's JWT app_metadata.
create or replace function public.current_guest_wedding_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select nullif(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'wedding_id'),
    ''
  )::uuid;
$$;

-- =========================================================
-- Enable RLS
-- =========================================================
alter table public.weddings enable row level security;
alter table public.wedding_members enable row level security;
alter table public.guests enable row level security;
alter table public.user_roles enable row level security;

-- =========================================================
-- Policies: weddings
-- =========================================================
create policy "Public can read public weddings"
on public.weddings for select
to anon, authenticated
using (is_public = true);

create policy "Admins read their weddings"
on public.weddings for select
to authenticated
using (public.is_wedding_admin(auth.uid(), id));

create policy "Guests read their wedding"
on public.weddings for select
to authenticated
using (id = public.current_guest_wedding_id());

create policy "Authenticated can create wedding as primary admin"
on public.weddings for insert
to authenticated
with check (primary_admin_id = auth.uid());

create policy "Admins update their wedding"
on public.weddings for update
to authenticated
using (public.is_wedding_admin(auth.uid(), id))
with check (public.is_wedding_admin(auth.uid(), id));

create policy "Primary admin or platform owner deletes wedding"
on public.weddings for delete
to authenticated
using (
  public.has_platform_role(auth.uid(), 'platform_owner')
  or public.has_wedding_role(auth.uid(), id, 'primary_admin')
);

-- =========================================================
-- Policies: wedding_members
-- =========================================================
create policy "Members read own wedding members"
on public.wedding_members for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_wedding_admin(auth.uid(), wedding_id)
);

create policy "Primary admin or platform owner manages members"
on public.wedding_members for insert
to authenticated
with check (
  public.has_platform_role(auth.uid(), 'platform_owner')
  or public.has_wedding_role(auth.uid(), wedding_id, 'primary_admin')
);

create policy "Primary admin or platform owner updates members"
on public.wedding_members for update
to authenticated
using (
  public.has_platform_role(auth.uid(), 'platform_owner')
  or public.has_wedding_role(auth.uid(), wedding_id, 'primary_admin')
)
with check (
  public.has_platform_role(auth.uid(), 'platform_owner')
  or public.has_wedding_role(auth.uid(), wedding_id, 'primary_admin')
);

create policy "Primary admin or platform owner removes members"
on public.wedding_members for delete
to authenticated
using (
  public.has_platform_role(auth.uid(), 'platform_owner')
  or public.has_wedding_role(auth.uid(), wedding_id, 'primary_admin')
);

-- Bootstrap: when a wedding is created, the creator must be able to insert
-- themselves as primary_admin in wedding_members.
create policy "Creator inserts self as primary admin"
on public.wedding_members for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'primary_admin'
  and exists (
    select 1 from public.weddings w
    where w.id = wedding_id and w.primary_admin_id = auth.uid()
  )
);

-- =========================================================
-- Policies: guests
-- =========================================================
create policy "Wedding admins manage guests"
on public.guests for all
to authenticated
using (public.is_wedding_admin(auth.uid(), wedding_id))
with check (public.is_wedding_admin(auth.uid(), wedding_id));

create policy "Guest reads own row"
on public.guests for select
to authenticated
using (
  wedding_id = public.current_guest_wedding_id()
  and id = nullif(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'guest_id'),
    ''
  )::uuid
);

-- =========================================================
-- Policies: user_roles
-- =========================================================
create policy "Users read own platform roles"
on public.user_roles for select
to authenticated
using (user_id = auth.uid());

create policy "Platform owners read all roles"
on public.user_roles for select
to authenticated
using (public.has_platform_role(auth.uid(), 'platform_owner'));

create policy "Platform owners insert roles"
on public.user_roles for insert
to authenticated
with check (public.has_platform_role(auth.uid(), 'platform_owner'));

create policy "Platform owners delete roles"
on public.user_roles for delete
to authenticated
using (public.has_platform_role(auth.uid(), 'platform_owner'));