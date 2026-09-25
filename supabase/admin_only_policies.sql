-- Restrict "admin" policies to actual admins.
--
-- The earlier policies checked auth.role() = 'authenticated'. GitHub sign-in is
-- open to any GitHub account, so any stranger who signed in could read every
-- analytics event and delete any blog comment through the REST API, even
-- though the UI hid the admin pages from them.
--
-- is_admin() uses the same rule as AuthContext.checkAdmin: the signed-in
-- user's id must appear in admin_users.github_user_id. SECURITY DEFINER lets
-- it read admin_users regardless of that table's own RLS.
--
-- Run once in the Supabase SQL editor. Safe to re-run.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE github_user_id::text = auth.uid()::text
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

DROP POLICY IF EXISTS "Admin can read analytics" ON analytics_events;
CREATE POLICY "Admin can read analytics"
  ON analytics_events FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete comments" ON blog_comments;
CREATE POLICY "Admin can delete comments"
  ON blog_comments FOR DELETE
  USING (public.is_admin());

-- Bound what an anonymous insert can store, so the open insert policy cannot
-- be used to dump large payloads into the table. NOT VALID skips checking
-- existing rows; new rows must comply.
ALTER TABLE analytics_events DROP CONSTRAINT IF EXISTS analytics_events_sizes;
ALTER TABLE analytics_events ADD CONSTRAINT analytics_events_sizes CHECK (
  length(event_type) <= 40
  AND coalesce(length(page_path), 0) <= 500
  AND coalesce(length(post_slug), 0) <= 200
  AND coalesce(length(referrer), 0) <= 2000
  AND coalesce(length(user_agent), 0) <= 500
  AND coalesce(pg_column_size(metadata), 0) <= 2000
) NOT VALID;

CREATE INDEX IF NOT EXISTS analytics_events_session_idx
  ON analytics_events ((metadata->>'session'));
