CREATE TABLE IF NOT EXISTS public.guestbook_messages (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  author_name text not null,
  message text not null,
  status text not null default 'visible' check (status in ('visible','hidden')),
  created_at timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS guestbook_messages_wedding_idx ON public.guestbook_messages(wedding_id);

CREATE TABLE IF NOT EXISTS public.story_chapters (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  position integer not null default 0,
  chapter_label text,
  title text not null,
  body text not null default '',
  event_date date,
  illustration_motif text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS story_chapters_wedding_idx ON public.story_chapters(wedding_id, position);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guestbook_messages TO authenticated;
GRANT ALL ON public.guestbook_messages TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_chapters TO authenticated;
GRANT ALL ON public.story_chapters TO service_role;

ALTER TABLE public.guestbook_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guestbook admins manage" ON public.guestbook_messages
  FOR ALL TO authenticated
  USING (public.is_wedding_admin(auth.uid(), wedding_id))
  WITH CHECK (public.is_wedding_admin(auth.uid(), wedding_id));

CREATE POLICY "guestbook guests read visible" ON public.guestbook_messages
  FOR SELECT TO authenticated
  USING (status = 'visible' AND wedding_id = public.current_guest_wedding_id());

CREATE POLICY "guestbook guests write" ON public.guestbook_messages
  FOR INSERT TO authenticated
  WITH CHECK (wedding_id = public.current_guest_wedding_id());

CREATE POLICY "story admins manage" ON public.story_chapters
  FOR ALL TO authenticated
  USING (public.is_wedding_admin(auth.uid(), wedding_id))
  WITH CHECK (public.is_wedding_admin(auth.uid(), wedding_id));

CREATE POLICY "story guests read" ON public.story_chapters
  FOR SELECT TO authenticated
  USING (wedding_id = public.current_guest_wedding_id());

CREATE TRIGGER story_chapters_updated_at BEFORE UPDATE ON public.story_chapters
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();