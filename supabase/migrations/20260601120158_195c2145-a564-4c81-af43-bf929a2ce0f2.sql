-- Add new fields to budget_items and embed optional vendor info
ALTER TABLE public.budget_items
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS paid_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vendor_name text,
  ADD COLUMN IF NOT EXISTS vendor_contact_name text,
  ADD COLUMN IF NOT EXISTS vendor_email text,
  ADD COLUMN IF NOT EXISTS vendor_phone text,
  ADD COLUMN IF NOT EXISTS vendor_website text,
  ADD COLUMN IF NOT EXISTS vendor_notes text;

-- Migrate existing vendor links into embedded vendor data on the budget item
UPDATE public.budget_items b
SET vendor_name = v.name,
    vendor_contact_name = v.contact_name,
    vendor_email = v.email,
    vendor_phone = v.phone,
    vendor_website = v.website,
    vendor_notes = v.notes
FROM public.vendors v
WHERE b.vendor_id = v.id AND b.vendor_name IS NULL;

-- Drop vendor_id columns and the vendors table
ALTER TABLE public.budget_items DROP COLUMN IF EXISTS vendor_id;
ALTER TABLE public.todo_tasks DROP COLUMN IF EXISTS vendor_id;
DROP TABLE IF EXISTS public.vendors;
