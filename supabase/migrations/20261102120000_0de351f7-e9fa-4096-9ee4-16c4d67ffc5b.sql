-- Restrict todo_templates reads to platform owners.
-- The previous "Authenticated read templates" policy (USING true) let every
-- signed-in user, including guests, read all templates. Nothing on the client
-- needs that: platform owners read via "Platform owners manage templates",
-- and wedding admins only consume templates through the SECURITY DEFINER
-- function seed_todo_tasks_for_wedding (and the service-role signup flow).
DROP POLICY IF EXISTS "Authenticated read templates" ON public.todo_templates;
