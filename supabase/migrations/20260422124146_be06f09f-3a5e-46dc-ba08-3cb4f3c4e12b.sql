-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type public.rsvp_status as enum ('yes','no','maybe');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.photo_status as enum ('pending','approved','hidden');
exception when duplicate_object then null; end $$;

-- ============================================================
-- RSVP RESPONSES
-- ============================================================
create table if not exists public.rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  status public.rsvp_status not null,
  plus_one_name text,
  dietary_tags text[] not null default '{}',
  dietary_other text,
  comments text,
  edited_by_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guest_id)
);

alter table public.rsvp_responses enable row level security;

create trigger rsvp_responses_set_updated_at
before update on public.rsvp_responses
for each row execute function public.tg_set_updated_at();

create index if not exists idx_rsvp_wedding on public.rsvp_responses(wedding_id);

-- Guests read their own RSVP
create policy "Guest reads own rsvp"
on public.rsvp_responses for select
to authenticated
using (
  wedding_id = public.current_guest_wedding_id()
  and guest_id = (nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::uuid
);

-- Guests insert/update their own RSVP
create policy "Guest writes own rsvp"
on public.rsvp_responses for insert
to authenticated
with check (
  wedding_id = public.current_guest_wedding_id()
  and guest_id = (nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::uuid
);

create policy "Guest updates own rsvp"
on public.rsvp_responses for update
to authenticated
using (
  wedding_id = public.current_guest_wedding_id()
  and guest_id = (nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::uuid
)
with check (
  wedding_id = public.current_guest_wedding_id()
  and guest_id = (nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::uuid
);

-- Admins manage all RSVPs
create policy "Wedding admins manage rsvps"
on public.rsvp_responses for all
to authenticated
using (public.is_wedding_admin(auth.uid(), wedding_id))
with check (public.is_wedding_admin(auth.uid(), wedding_id));

-- ============================================================
-- PLAYLIST SONGS
-- ============================================================
create table if not exists public.playlist_songs (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  submitted_by_name text not null,
  title text not null,
  artist text not null,
  spotify_url text,
  vote_count int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.playlist_songs enable row level security;

create trigger playlist_songs_set_updated_at
before update on public.playlist_songs
for each row execute function public.tg_set_updated_at();

create index if not exists idx_playlist_wedding on public.playlist_songs(wedding_id);
create index if not exists idx_playlist_guest on public.playlist_songs(guest_id);

-- Anyone in the wedding (guest or admin) can read songs
create policy "Wedding members read songs"
on public.playlist_songs for select
to authenticated
using (
  wedding_id = public.current_guest_wedding_id()
  or public.is_wedding_admin(auth.uid(), wedding_id)
);

-- Guests insert their own songs
create policy "Guest inserts own song"
on public.playlist_songs for insert
to authenticated
with check (
  wedding_id = public.current_guest_wedding_id()
  and guest_id = (nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::uuid
);

-- Guests delete their own songs
create policy "Guest deletes own song"
on public.playlist_songs for delete
to authenticated
using (
  wedding_id = public.current_guest_wedding_id()
  and guest_id = (nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::uuid
);

-- Admins manage all songs
create policy "Wedding admins manage songs"
on public.playlist_songs for all
to authenticated
using (public.is_wedding_admin(auth.uid(), wedding_id))
with check (public.is_wedding_admin(auth.uid(), wedding_id));

-- Enforce 3-song limit per guest
create or replace function public.enforce_playlist_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  song_count int;
begin
  if new.guest_id is null then
    return new;
  end if;
  select count(*) into song_count
  from public.playlist_songs
  where guest_id = new.guest_id;
  if song_count >= 3 then
    raise exception 'You can suggest a maximum of 3 songs.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_playlist_limit on public.playlist_songs;
create trigger trg_playlist_limit
before insert on public.playlist_songs
for each row execute function public.enforce_playlist_limit();

-- ============================================================
-- PHOTOS
-- ============================================================
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  uploader_name text not null,
  storage_path text not null,
  caption text,
  size_bytes bigint not null default 0,
  status public.photo_status not null default 'approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.photos enable row level security;

create trigger photos_set_updated_at
before update on public.photos
for each row execute function public.tg_set_updated_at();

create index if not exists idx_photos_wedding on public.photos(wedding_id);
create index if not exists idx_photos_guest on public.photos(guest_id);
create index if not exists idx_photos_status on public.photos(status);

-- Wedding members read approved photos; guest reads own (any status); admin reads all
create policy "Members read approved photos"
on public.photos for select
to authenticated
using (
  (
    wedding_id = public.current_guest_wedding_id()
    and (
      status = 'approved'
      or guest_id = (nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::uuid
    )
  )
  or public.is_wedding_admin(auth.uid(), wedding_id)
);

-- Guests insert their own photo records
create policy "Guest inserts own photo"
on public.photos for insert
to authenticated
with check (
  wedding_id = public.current_guest_wedding_id()
  and guest_id = (nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::uuid
);

-- Guests delete their own photo
create policy "Guest deletes own photo"
on public.photos for delete
to authenticated
using (
  wedding_id = public.current_guest_wedding_id()
  and guest_id = (nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::uuid
);

-- Admins manage all photos
create policy "Wedding admins manage photos"
on public.photos for all
to authenticated
using (public.is_wedding_admin(auth.uid(), wedding_id))
with check (public.is_wedding_admin(auth.uid(), wedding_id));

-- ============================================================
-- STORAGE BUCKET for photos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('wedding-photos', 'wedding-photos', true)
on conflict (id) do nothing;

-- Public read of approved photos (bucket is public, but keep an explicit policy)
create policy "Public read wedding photos"
on storage.objects for select
to public
using (bucket_id = 'wedding-photos');

-- Authenticated guests can upload into their wedding folder
-- Path format: {wedding_id}/{guest_id}/{filename}
create policy "Guests upload into own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'wedding-photos'
  and (storage.foldername(name))[1] = public.current_guest_wedding_id()::text
  and (storage.foldername(name))[2] = (nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::text
);

-- Guests can delete their own files
create policy "Guests delete own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'wedding-photos'
  and (storage.foldername(name))[1] = public.current_guest_wedding_id()::text
  and (storage.foldername(name))[2] = (nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::text
);