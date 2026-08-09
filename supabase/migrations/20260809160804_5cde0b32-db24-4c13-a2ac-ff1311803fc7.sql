
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- split public-read policies so anon never evaluates is_admin()
DROP POLICY "locations public read" ON public.locations;
CREATE POLICY "locations anon read" ON public.locations FOR SELECT TO anon USING (published);
CREATE POLICY "locations auth read" ON public.locations FOR SELECT TO authenticated USING (published OR public.is_admin());

DROP POLICY "people public read" ON public.people;
CREATE POLICY "people anon read" ON public.people FOR SELECT TO anon USING (published);
CREATE POLICY "people auth read" ON public.people FOR SELECT TO authenticated USING (published OR public.is_admin());

DROP POLICY "events public read" ON public.historical_events;
CREATE POLICY "events anon read" ON public.historical_events FOR SELECT TO anon USING (published);
CREATE POLICY "events auth read" ON public.historical_events FOR SELECT TO authenticated USING (published OR public.is_admin());

DROP POLICY "articles public read" ON public.articles;
CREATE POLICY "articles anon read" ON public.articles FOR SELECT TO anon USING (published);
CREATE POLICY "articles auth read" ON public.articles FOR SELECT TO authenticated USING (published OR public.is_admin());

DROP POLICY "archive public read" ON public.archive_items;
CREATE POLICY "archive anon read" ON public.archive_items FOR SELECT TO anon USING (published);
CREATE POLICY "archive auth read" ON public.archive_items FOR SELECT TO authenticated USING (published OR public.is_admin());

DROP POLICY "documents public read" ON public.documents;
CREATE POLICY "documents anon read" ON public.documents FOR SELECT TO anon USING (published);
CREATE POLICY "documents auth read" ON public.documents FOR SELECT TO authenticated USING (published OR public.is_admin());

DROP POLICY "approved comments public" ON public.comments;
CREATE POLICY "comments anon read" ON public.comments FOR SELECT TO anon USING (status = 'approved');
CREATE POLICY "comments auth read" ON public.comments FOR SELECT TO authenticated USING (status = 'approved' OR public.is_admin());

DROP POLICY "active ads public" ON public.advertisements;
CREATE POLICY "ads anon read" ON public.advertisements FOR SELECT TO anon USING (
  status = 'approved'
  AND (start_date IS NULL OR start_date <= current_date)
  AND (end_date IS NULL OR end_date >= current_date)
);
CREATE POLICY "ads auth read" ON public.advertisements FOR SELECT TO authenticated USING (
  public.is_admin() OR (
    status = 'approved'
    AND (start_date IS NULL OR start_date <= current_date)
    AND (end_date IS NULL OR end_date >= current_date)
  )
);
