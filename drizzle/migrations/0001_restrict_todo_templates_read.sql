DROP POLICY IF EXISTS "Authenticated read templates" ON public.todo_templates;
CREATE POLICY "Wedding admins read templates" ON public.todo_templates
FOR SELECT TO authenticated
USING (
  public.has_platform_role(auth.uid(), 'platform_owner')
  OR EXISTS (SELECT 1 FROM public.wedding_members wm WHERE wm.user_id = auth.uid())
);