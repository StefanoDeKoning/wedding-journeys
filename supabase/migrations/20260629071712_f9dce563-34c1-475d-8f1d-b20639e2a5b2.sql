-- Make invitation codes globally unique across all weddings.
CREATE UNIQUE INDEX IF NOT EXISTS guests_invitation_code_global_key
  ON public.guests (invitation_code);