-- Enables the already-existing 'editor' role (until now unused at the RLS
-- layer — every content table's write policy was is_admin()-only) to act
-- as a "sub-admin": can publish articles/archive items/locations/people
-- directly, but only the real admin can grant/revoke that role (existing
-- "admins manage roles" policy on user_roles is already admin-only —
-- unchanged here).

ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS email text;

-- email/display_name are stored redundantly here (rather than joined from
-- auth.users) because PostgREST doesn't expose the auth schema to the
-- client — the admin UI needs a way to list sub-admins by name/email
-- without needing service_role or a server-side join.

DROP POLICY IF EXISTS "articles admin write" ON public.articles;
CREATE POLICY "articles staff write" ON public.articles
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "archive admin write" ON public.archive_items;
CREATE POLICY "archive staff write" ON public.archive_items
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "locations admin write" ON public.locations;
CREATE POLICY "locations staff write" ON public.locations
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "people admin write" ON public.people;
CREATE POLICY "people staff write" ON public.people
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'editor'));

-- historical_events intentionally left admin-only: not one of the four
-- content types the admin asked sub-admins to be able to publish.
