
ALTER TABLE public.timeline_events
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'custom',
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;

-- Update public/guest read policies to respect is_visible
DROP POLICY IF EXISTS "Public reads all-visibility timeline of published weddings" ON public.timeline_events;
CREATE POLICY "Public reads all-visibility timeline of published weddings"
ON public.timeline_events
FOR SELECT
TO anon, authenticated
USING (
  is_visible = true
  AND visibility = 'all'::timeline_visibility
  AND EXISTS (
    SELECT 1 FROM public.weddings w
    WHERE w.id = timeline_events.wedding_id
      AND w.status = 'published'::wedding_status
      AND w.is_public = true
  )
);

DROP POLICY IF EXISTS "Wedding members read timeline" ON public.timeline_events;
CREATE POLICY "Wedding members read timeline"
ON public.timeline_events
FOR SELECT
TO authenticated
USING (
  is_visible = true
  AND wedding_id = current_guest_wedding_id()
  AND (
    visibility = 'all'::timeline_visibility
    OR (visibility)::text = (
      SELECT (g.guest_type)::text
      FROM guests g
      WHERE g.id = (NULLIF((((current_setting('request.jwt.claims'::text, true))::jsonb -> 'app_metadata'::text) ->> 'guest_id'::text), ''::text))::uuid
    )
  )
);
