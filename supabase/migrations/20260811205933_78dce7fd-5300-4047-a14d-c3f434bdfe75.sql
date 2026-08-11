
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  actor_client text,
  source text NOT NULL DEFAULT 'mcp',
  tool_name text NOT NULL,
  action text NOT NULL,
  content_type text,
  content_id uuid,
  result text NOT NULL DEFAULT 'success',
  error_message text,
  previous_values jsonb,
  new_values jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
CREATE INDEX audit_logs_content_idx ON public.audit_logs (content_type, content_id);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Staff can write audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TABLE public.mcp_capabilities (
  key text PRIMARY KEY,
  label text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.mcp_capabilities TO authenticated;
GRANT ALL ON public.mcp_capabilities TO service_role;

ALTER TABLE public.mcp_capabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read mcp capabilities" ON public.mcp_capabilities
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins manage mcp capabilities" ON public.mcp_capabilities
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER mcp_capabilities_updated BEFORE UPDATE ON public.mcp_capabilities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.mcp_capabilities (key, label, enabled, sort_order) VALUES
  ('read',   'القراءة والبحث في المحتوى', true, 1),
  ('create', 'إنشاء محتوى جديد', true, 2),
  ('update', 'تعديل المحتوى', true, 3),
  ('publish','نشر وإلغاء نشر المحتوى', true, 4),
  ('moderate','مراجعة التعليقات والمساهمات والإعلانات', true, 5),
  ('delete', 'حذف المحتوى (أرشفة)', false, 6);
