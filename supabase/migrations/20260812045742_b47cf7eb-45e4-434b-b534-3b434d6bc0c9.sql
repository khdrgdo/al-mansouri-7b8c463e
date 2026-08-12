CREATE TABLE public.publish_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  actor_client text,
  tool_name text NOT NULL DEFAULT 'publish_batch',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  skipped jsonb NOT NULL DEFAULT '[]'::jsonb,
  rolled_back_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.publish_batches TO authenticated;
GRANT ALL ON public.publish_batches TO service_role;
ALTER TABLE public.publish_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read publish batches" ON public.publish_batches
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins can insert publish batches" ON public.publish_batches
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update publish batches" ON public.publish_batches
  FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());