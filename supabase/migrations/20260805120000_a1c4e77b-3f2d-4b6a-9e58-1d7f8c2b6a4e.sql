-- ============================================================
-- STORY CHAPTERS (couple-authored narrative, guest-facing)
-- ============================================================
create table if not exists public.story_chapters (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  position int not null default 0,
  chapter_label text,
  title text not null,
  body text not null,
  event_date date,
  illustration_motif text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.story_chapters enable row level security;

create trigger story_chapters_set_updated_at
before update on public.story_chapters
for each row execute function public.tg_set_updated_at();

create index if not exists idx_story_chapters_wedding on public.story_chapters(wedding_id);

-- Wedding members (guest or admin) read all chapters
create policy "Members read story chapters"
on public.story_chapters for select
to authenticated
using (
  wedding_id = public.current_guest_wedding_id()
  or public.is_wedding_admin(auth.uid(), wedding_id)
);

-- Only admins author the story
create policy "Wedding admins manage story chapters"
on public.story_chapters for all
to authenticated
using (public.is_wedding_admin(auth.uid(), wedding_id))
with check (public.is_wedding_admin(auth.uid(), wedding_id));

-- ============================================================
-- GUESTBOOK MESSAGES
-- ============================================================
do $$ begin
  create type public.guestbook_status as enum ('visible','hidden');
exception when duplicate_object then null; end $$;

create table if not exists public.guestbook_messages (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  author_name text not null,
  message text not null,
  status public.guestbook_status not null default 'visible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.guestbook_messages enable row level security;

create trigger guestbook_messages_set_updated_at
before update on public.guestbook_messages
for each row execute function public.tg_set_updated_at();

create index if not exists idx_guestbook_wedding on public.guestbook_messages(wedding_id);
create index if not exists idx_guestbook_guest on public.guestbook_messages(guest_id);

-- Members read visible messages; guest also reads their own regardless of status
create policy "Members read visible guestbook messages"
on public.guestbook_messages for select
to authenticated
using (
  (
    wedding_id = public.current_guest_wedding_id()
    and (
      status = 'visible'
      or guest_id = (nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::uuid
    )
  )
  or public.is_wedding_admin(auth.uid(), wedding_id)
);

-- Guests insert their own message
create policy "Guest inserts own guestbook message"
on public.guestbook_messages for insert
to authenticated
with check (
  wedding_id = public.current_guest_wedding_id()
  and guest_id = (nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::uuid
);

-- Guests delete their own message
create policy "Guest deletes own guestbook message"
on public.guestbook_messages for delete
to authenticated
using (
  wedding_id = public.current_guest_wedding_id()
  and guest_id = (nullif(((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::uuid
);

-- Admins manage all messages (moderation: hide/show/delete)
create policy "Wedding admins manage guestbook messages"
on public.guestbook_messages for all
to authenticated
using (public.is_wedding_admin(auth.uid(), wedding_id))
with check (public.is_wedding_admin(auth.uid(), wedding_id));
