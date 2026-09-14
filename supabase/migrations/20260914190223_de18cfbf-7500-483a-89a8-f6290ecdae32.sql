CREATE POLICY "Anyone can view story images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'story-images');

CREATE POLICY "Wedding admins upload story images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'story-images' AND public.is_wedding_admin(auth.uid(), NULLIF((storage.foldername(name))[1], '')::uuid));

CREATE POLICY "Wedding admins update story images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'story-images' AND public.is_wedding_admin(auth.uid(), NULLIF((storage.foldername(name))[1], '')::uuid));

CREATE POLICY "Wedding admins delete story images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'story-images' AND public.is_wedding_admin(auth.uid(), NULLIF((storage.foldername(name))[1], '')::uuid));