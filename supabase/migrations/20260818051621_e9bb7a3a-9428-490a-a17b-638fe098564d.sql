ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS story_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS gallery_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS playlist_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS guestbook_enabled boolean NOT NULL DEFAULT true;