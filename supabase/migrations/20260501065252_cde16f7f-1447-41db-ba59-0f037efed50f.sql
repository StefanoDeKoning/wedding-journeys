ALTER TABLE public.guests
ADD COLUMN IF NOT EXISTS plus_one_allowed boolean NOT NULL DEFAULT false;