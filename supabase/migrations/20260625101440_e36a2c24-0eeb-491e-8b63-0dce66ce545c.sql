
-- 1. Restrict is_wedding_admin to only known admin roles (defense in depth).
CREATE OR REPLACE FUNCTION public.is_wedding_admin(_user_id uuid, _wedding_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  select
    public.has_platform_role(_user_id, 'platform_owner')
    or exists (
      select 1 from public.wedding_members
      where user_id = _user_id
        and wedding_id = _wedding_id
        and role in ('primary_admin','secondary_admin')
    );
$$;

-- 2. Stop broadcasting guest PII and RSVP data over Realtime.
ALTER PUBLICATION supabase_realtime DROP TABLE public.guests;
ALTER PUBLICATION supabase_realtime DROP TABLE public.rsvp_responses;

-- 3. Storage: drop broad anon-readable policy and replace with scoped policies.
DROP POLICY IF EXISTS "Public read wedding photos" ON storage.objects;

CREATE POLICY "Wedding admins read wedding photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'wedding-photos'
  AND public.is_wedding_admin(
    auth.uid(),
    NULLIF((storage.foldername(name))[1], '')::uuid
  )
);

CREATE POLICY "Guests read photos of their wedding"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'wedding-photos'
  AND (storage.foldername(name))[1] = (public.current_guest_wedding_id())::text
);

-- 4. Revoke EXECUTE on SECURITY DEFINER functions that should not be callable
--    by anonymous or signed-in clients. Helpers used inside RLS policy
--    expressions (has_platform_role, has_wedding_role, is_wedding_admin,
--    current_guest_wedding_id) must remain executable by `authenticated` so
--    policy evaluation keeps working; we still revoke them from `anon`.

REVOKE EXECUTE ON FUNCTION public.apply_guest_data_retention()              FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_playlist_limit()                  FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_seat_requires_attending()         FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_slug_available(text)                   FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at()                       FROM anon, authenticated, PUBLIC;

-- Called only by authenticated wedding admins:
REVOKE EXECUTE ON FUNCTION public.seed_todo_tasks_for_wedding(uuid)         FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.wedding_storage_used(uuid)                FROM anon, PUBLIC;

-- RLS helpers: revoke from anon only.
REVOKE EXECUTE ON FUNCTION public.has_platform_role(uuid, app_role)         FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_wedding_role(uuid, uuid, wedding_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_wedding_admin(uuid, uuid)              FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.current_guest_wedding_id()                FROM anon, PUBLIC;
