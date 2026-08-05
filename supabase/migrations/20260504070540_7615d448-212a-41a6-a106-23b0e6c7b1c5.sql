CREATE TABLE public.budget_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_id uuid NOT NULL,
  name text NOT NULL,
  estimated_cost numeric(12,2) NOT NULL DEFAULT 0,
  actual_cost numeric(12,2),
  notes text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_budget_items_wedding ON public.budget_items(wedding_id);

ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wedding admins manage budget"
  ON public.budget_items
  FOR ALL
  TO authenticated
  USING (public.is_wedding_admin(auth.uid(), wedding_id))
  WITH CHECK (public.is_wedding_admin(auth.uid(), wedding_id));

CREATE TRIGGER tg_budget_items_updated_at
  BEFORE UPDATE ON public.budget_items
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();