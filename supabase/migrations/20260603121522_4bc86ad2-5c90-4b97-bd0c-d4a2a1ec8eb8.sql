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
    OR EXISTS (
      SELECT 1 FROM public.guests g
      WHERE g.id = (NULLIF((((current_setting('request.jwt.claims', true))::jsonb -> 'app_metadata') ->> 'guest_id'), ''))::uuid
        AND (
          (g.guest_type = 'full_day'::guest_type AND visibility IN ('day'::timeline_visibility, 'evening'::timeline_visibility))
          OR (g.guest_type::text = visibility::text)
        )
    )
  )
);