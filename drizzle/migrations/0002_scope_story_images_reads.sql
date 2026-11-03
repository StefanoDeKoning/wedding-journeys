DROP POLICY IF EXISTS "Anyone can view story images" ON storage.objects;
DROP POLICY IF EXISTS "Wedding admins read story images" ON storage.objects;
DROP POLICY IF EXISTS "Guests read story images of their wedding" ON storage.objects;

CREATE POLICY "Wedding admins read story images"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'story-images'
  AND public.is_wedding_admin(auth.uid(), NULLIF((storage.foldername(name))[1], '')::uuid)
);

CREATE POLICY "Guests read story images of their wedding"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'story-images'
  AND (storage.foldername(name))[1] = (public.current_guest_wedding_id())::text
);