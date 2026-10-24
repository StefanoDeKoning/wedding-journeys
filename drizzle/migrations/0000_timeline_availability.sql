ALTER TABLE public.weddings ADD COLUMN timeline_available boolean NOT NULL DEFAULT false;

CREATE POLICY "Timeline release gates guest reads"
ON public.timeline_events AS RESTRICTIVE
FOR SELECT TO anon, authenticated
USING (
  public.is_wedding_admin(auth.uid(), wedding_id)
  OR EXISTS (
    SELECT 1 FROM public.weddings w
    WHERE w.id = timeline_events.wedding_id AND w.timeline_available = true
  )
);