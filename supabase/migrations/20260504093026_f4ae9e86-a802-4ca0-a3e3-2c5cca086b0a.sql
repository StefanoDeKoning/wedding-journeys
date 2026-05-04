
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  notes TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendors_wedding ON public.vendors(wedding_id);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wedding admins manage vendors"
ON public.vendors
FOR ALL
TO authenticated
USING (public.is_wedding_admin(auth.uid(), wedding_id))
WITH CHECK (public.is_wedding_admin(auth.uid(), wedding_id));

CREATE TRIGGER set_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.budget_items
  ADD COLUMN vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL;
CREATE INDEX idx_budget_items_vendor ON public.budget_items(vendor_id);

ALTER TABLE public.todo_tasks
  ADD COLUMN vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  ADD COLUMN budget_item_id UUID REFERENCES public.budget_items(id) ON DELETE SET NULL;
CREATE INDEX idx_todo_tasks_vendor ON public.todo_tasks(vendor_id);
CREATE INDEX idx_todo_tasks_budget_item ON public.todo_tasks(budget_item_id);
