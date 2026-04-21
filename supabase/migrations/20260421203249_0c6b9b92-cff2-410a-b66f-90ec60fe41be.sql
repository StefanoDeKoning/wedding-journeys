do $$ begin
  create type public.guest_type as enum ('day', 'evening');
exception when duplicate_object then null; end $$;

alter table public.weddings
  add column if not exists ceremony_at timestamptz,
  add column if not exists reception_at timestamptz,
  add column if not exists invitation_message text;

alter table public.guests
  add column if not exists guest_type public.guest_type not null default 'day';