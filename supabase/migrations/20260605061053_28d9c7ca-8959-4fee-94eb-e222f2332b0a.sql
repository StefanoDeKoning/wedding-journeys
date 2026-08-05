-- Prevent storing non-http(s) URLs (mitigates stored XSS via href injection)
ALTER TABLE public.playlist_songs
  ADD CONSTRAINT playlist_songs_spotify_url_http_only
  CHECK (spotify_url IS NULL OR spotify_url ~* '^https?://');

ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_maps_url_http_only
  CHECK (maps_url IS NULL OR maps_url ~* '^https?://');

ALTER TABLE public.wishlist_items
  ADD CONSTRAINT wishlist_items_external_url_http_only
  CHECK (external_url IS NULL OR external_url ~* '^https?://');

ALTER TABLE public.budget_items
  ADD CONSTRAINT budget_items_vendor_website_http_only
  CHECK (vendor_website IS NULL OR vendor_website ~* '^https?://');
