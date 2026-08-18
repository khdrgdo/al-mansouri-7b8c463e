-- Comments become instantly public on submit (like Facebook) instead of
-- sitting in a moderation queue — this is a deliberate behavior change,
-- not a bug fix. The admin's existing delete power ("admins delete
-- comments" policy, unchanged) is the after-the-fact safety net, same as
-- most social platforms use for comments specifically. This is distinct
-- from "المساهمات" (submissions via /contribute → the `submissions`
-- table), which keep full pre-publish admin review — that policy is
-- untouched by this migration.

ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments(parent_id);

DROP POLICY IF EXISTS "anyone can submit comment" ON public.comments;
CREATE POLICY "anyone can submit comment" ON public.comments
  FOR INSERT TO public
  WITH CHECK (
    status = 'approved'
    AND reported = false
    AND length(trim(author_name)) BETWEEN 2 AND 80
    AND length(trim(body)) BETWEEN 2 AND 2000
  );
