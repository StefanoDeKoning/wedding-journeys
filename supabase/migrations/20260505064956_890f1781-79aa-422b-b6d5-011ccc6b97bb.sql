ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS invitation_title text,
  ADD COLUMN IF NOT EXISTS invitation_content text,
  ADD COLUMN IF NOT EXISTS invitation_template text NOT NULL DEFAULT 'classic',
  ADD COLUMN IF NOT EXISTS invitation_visible boolean NOT NULL DEFAULT true;