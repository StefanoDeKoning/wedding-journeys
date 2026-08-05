-- 1. Extend guest_type enum to include 'full_day'
ALTER TYPE public.guest_type ADD VALUE IF NOT EXISTS 'full_day';

-- 2. Age type enum + column on guests
DO $$ BEGIN
  CREATE TYPE public.age_type AS ENUM ('adult', 'child');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS age_type public.age_type NOT NULL DEFAULT 'adult';

-- 3. RSVP attendance enum + column
DO $$ BEGIN
  CREATE TYPE public.rsvp_attendance AS ENUM ('day', 'evening', 'both');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.rsvp_responses
  ADD COLUMN IF NOT EXISTS attendance public.rsvp_attendance;

-- 4. Convert existing 'maybe' responses to 'no' (per product decision)
UPDATE public.rsvp_responses SET status = 'no' WHERE status = 'maybe';

-- 5. Allow primary admins to read auth users emails for co-admin listing
--    (handled via server function with admin client; no schema change needed)