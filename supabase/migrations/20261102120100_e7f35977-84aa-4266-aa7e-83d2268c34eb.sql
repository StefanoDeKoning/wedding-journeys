-- Scope story-images reads to the wedding that owns the file.
-- "Anyone can view story images" let anon and every signed-in user download
-- any story image. Story chapters are only readable by wedding admins and the
-- wedding's own guests, so mirror that here (same pattern as wedding-photos).
-- Files are stored as `<wedding_id>/<uuid>.<ext>` and served via signed URLs,
-- which require SELECT on storage.objects.
DROP POLICY IF EXISTS "Anyone can view story images" ON storage.objects;

CREATE POLICY "Wedding admins read story images"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'story-images'
  AND public.is_wedding_admin(
    auth.uid(),
    NULLIF((storage.foldername(name))[1], '')::uuid
  )
);

CREATE POLICY "Guests read story images of their wedding"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'story-images'
  AND (storage.foldername(name))[1] = (public.current_guest_wedding_id())::text
);

-- Public buckets serve files without any RLS check; keep this one private.
UPDATE storage.buckets SET public = false WHERE id = 'story-images';
