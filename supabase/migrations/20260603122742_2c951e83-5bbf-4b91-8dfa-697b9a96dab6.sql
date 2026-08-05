ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS wishlist_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  external_url text,
  price_text text,
  position integer NOT NULL DEFAULT 0,
  -- future-ready reservation fields (unused for now)
  reserved_by_guest_id uuid,
  reserved_by_name text,
  reserved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.wishlist_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wedding admins manage wishlist"
ON public.wishlist_items
FOR ALL
TO authenticated
USING (public.is_wedding_admin(auth.uid(), wedding_id))
WITH CHECK (public.is_wedding_admin(auth.uid(), wedding_id));

CREATE POLICY "Wedding members read wishlist"
ON public.wishlist_items
FOR SELECT
TO authenticated
USING (wedding_id = public.current_guest_wedding_id());

CREATE POLICY "Public reads wishlist of published weddings"
ON public.wishlist_items
FOR SELECT
TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM public.weddings w
  WHERE w.id = wishlist_items.wedding_id
    AND w.status = 'published'
    AND w.is_public = true
    AND w.wishlist_enabled = true
));

CREATE INDEX idx_wishlist_items_wedding ON public.wishlist_items(wedding_id, position);

CREATE TRIGGER tg_wishlist_items_updated_at
BEFORE UPDATE ON public.wishlist_items
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();