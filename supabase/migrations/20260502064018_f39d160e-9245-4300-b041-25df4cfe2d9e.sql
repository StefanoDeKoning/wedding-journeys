
-- Enums
CREATE TYPE public.todo_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.todo_status AS ENUM ('todo', 'in_progress', 'done');

-- Templates (global)
CREATE TABLE public.todo_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  relative_days_before INTEGER,
  priority public.todo_priority NOT NULL DEFAULT 'medium',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.todo_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read templates"
ON public.todo_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Platform owners manage templates"
ON public.todo_templates FOR ALL TO authenticated
USING (public.has_platform_role(auth.uid(), 'platform_owner'))
WITH CHECK (public.has_platform_role(auth.uid(), 'platform_owner'));

CREATE TRIGGER trg_todo_templates_updated
BEFORE UPDATE ON public.todo_templates
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Tasks (per wedding)
CREATE TABLE public.todo_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  deadline DATE,
  status public.todo_status NOT NULL DEFAULT 'todo',
  priority public.todo_priority NOT NULL DEFAULT 'medium',
  created_from_template BOOLEAN NOT NULL DEFAULT false,
  template_id UUID,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_todo_tasks_wedding ON public.todo_tasks(wedding_id);

ALTER TABLE public.todo_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wedding admins manage tasks"
ON public.todo_tasks FOR ALL TO authenticated
USING (public.is_wedding_admin(auth.uid(), wedding_id))
WITH CHECK (public.is_wedding_admin(auth.uid(), wedding_id));

CREATE TRIGGER trg_todo_tasks_updated
BEFORE UPDATE ON public.todo_tasks
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Function: seed tasks for a wedding from current templates
CREATE OR REPLACE FUNCTION public.seed_todo_tasks_for_wedding(_wedding_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count INTEGER := 0;
  w_date DATE;
BEGIN
  IF NOT public.is_wedding_admin(auth.uid(), _wedding_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT wedding_date INTO w_date FROM public.weddings WHERE id = _wedding_id;

  INSERT INTO public.todo_tasks
    (wedding_id, title, description, category, deadline, priority, created_from_template, template_id, position)
  SELECT
    _wedding_id,
    t.title,
    t.description,
    t.category,
    CASE
      WHEN w_date IS NOT NULL AND t.relative_days_before IS NOT NULL
      THEN w_date - t.relative_days_before
      ELSE NULL
    END,
    t.priority,
    true,
    t.id,
    t.position
  FROM public.todo_templates t
  WHERE NOT EXISTS (
    SELECT 1 FROM public.todo_tasks tt
    WHERE tt.wedding_id = _wedding_id AND tt.template_id = t.id
  );

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

-- Seed default templates
INSERT INTO public.todo_templates (title, description, category, relative_days_before, priority, position) VALUES
('Book the venue', 'Visit and confirm the ceremony and reception venue.', 'Venue', 365, 'high', 10),
('Send save-the-dates', 'Notify guests of the wedding date.', 'Stationery', 240, 'medium', 20),
('Hire photographer', 'Choose and book your wedding photographer.', 'Photography', 270, 'high', 30),
('Book caterer', 'Confirm menu, dietary options, and tasting.', 'Catering', 210, 'high', 40),
('Order wedding dress', 'Allow time for fittings and alterations.', 'Clothing', 240, 'high', 50),
('Order suits', 'Book groom and groomsmen attire.', 'Clothing', 180, 'medium', 60),
('Book band or DJ', 'Confirm music and ceremony soundtrack.', 'Music', 180, 'high', 70),
('Send invitations', 'Mail invitations and collect RSVPs.', 'Stationery', 90, 'high', 80),
('Order flowers and decor', 'Confirm bouquets, centerpieces, and styling.', 'Decorations', 120, 'medium', 90),
('Book officiant', 'Confirm celebrant and ceremony script.', 'Legal', 180, 'high', 100),
('Apply for marriage license', 'Check local legal requirements and timing.', 'Legal', 30, 'high', 110),
('Final headcount to caterer', 'Share final guest count and dietary needs.', 'Catering', 14, 'high', 120),
('Final dress fitting', 'Last alterations before the big day.', 'Clothing', 14, 'medium', 130),
('Confirm timeline with vendors', 'Share final-day timeline with all suppliers.', 'Venue', 7, 'high', 140),
('Pack for honeymoon', 'Tickets, passports, and luggage ready.', 'General', 3, 'medium', 150);
