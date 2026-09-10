ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS ceremony_master_name text,
  ADD COLUMN IF NOT EXISTS ceremony_master_role text,
  ADD COLUMN IF NOT EXISTS ceremony_master_phone text,
  ADD COLUMN IF NOT EXISTS ceremony_master_email text;

CREATE TABLE public.playlist_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES public.playlist_songs(id) ON DELETE CASCADE,
  guest_id uuid NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (song_id, guest_id)
);

GRANT SELECT, INSERT, DELETE ON public.playlist_votes TO authenticated;
GRANT ALL ON public.playlist_votes TO service_role;

ALTER TABLE public.playlist_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wedding members read votes" ON public.playlist_votes
FOR SELECT TO authenticated
USING ((wedding_id = current_guest_wedding_id()) OR is_wedding_admin(auth.uid(), wedding_id));

CREATE POLICY "Guest inserts own vote" ON public.playlist_votes
FOR INSERT TO authenticated
WITH CHECK (
  wedding_id = current_guest_wedding_id()
  AND guest_id = (NULLIF((((current_setting('request.jwt.claims', true))::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::uuid
);

CREATE POLICY "Guest deletes own vote" ON public.playlist_votes
FOR DELETE TO authenticated
USING (
  wedding_id = current_guest_wedding_id()
  AND guest_id = (NULLIF((((current_setting('request.jwt.claims', true))::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::uuid
);

CREATE POLICY "Wedding admins manage votes" ON public.playlist_votes
FOR ALL TO authenticated
USING (is_wedding_admin(auth.uid(), wedding_id))
WITH CHECK (is_wedding_admin(auth.uid(), wedding_id));

-- Keep vote_count in sync
CREATE OR REPLACE FUNCTION public.tg_sync_song_vote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  if tg_op = 'INSERT' then
    update public.playlist_songs set vote_count = vote_count + 1 where id = new.song_id;
    return new;
  else
    update public.playlist_songs set vote_count = greatest(0, vote_count - 1) where id = old.song_id;
    return old;
  end if;
end;
$$;

CREATE TRIGGER playlist_votes_sync_count
AFTER INSERT OR DELETE ON public.playlist_votes
FOR EACH ROW EXECUTE FUNCTION public.tg_sync_song_vote_count();

-- Combined limit: songs + votes <= 3 per guest
CREATE OR REPLACE FUNCTION public.enforce_playlist_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  used int;
begin
  if new.guest_id is null then
    return new;
  end if;
  select (select count(*) from public.playlist_songs where guest_id = new.guest_id)
       + (select count(*) from public.playlist_votes where guest_id = new.guest_id)
    into used;
  if used >= 3 then
    raise exception 'You can use a maximum of 3 song requests (suggestions and votes combined).';
  end if;
  return new;
end;
$$;

CREATE TRIGGER playlist_votes_enforce_limit
BEFORE INSERT ON public.playlist_votes
FOR EACH ROW EXECUTE FUNCTION public.enforce_playlist_limit();