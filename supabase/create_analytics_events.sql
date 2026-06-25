-- Analytics events: page views + blog engagement.
-- Writers: usePageTracking (page_view), BlogPostPage (engagement),
-- trackEvent (generic). Reader: the admin Analytics dashboard.
-- Safe to run more than once.

CREATE TABLE IF NOT EXISTS analytics_events (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type   TEXT NOT NULL,            -- 'page_view' | 'engagement' | ...
  page_path    TEXT,                     -- e.g. /blog/probabilistic-nature
  post_slug    TEXT,                     -- blog slug, when relevant
  referrer     TEXT,
  user_agent   TEXT,
  scroll_depth INT,                      -- engagement: max scroll %
  time_on_page INT,                      -- engagement: seconds
  metadata     JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookups for the dashboard's "events of type X since date" query.
CREATE INDEX IF NOT EXISTS analytics_events_type_created_idx
  ON analytics_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_path_idx
  ON analytics_events (page_path);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors may record events, but never read them back.
DROP POLICY IF EXISTS "Anyone can insert analytics" ON analytics_events;
CREATE POLICY "Anyone can insert analytics"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- Only the signed-in admin can read traffic data (keeps visitor data private).
DROP POLICY IF EXISTS "Admin can read analytics" ON analytics_events;
CREATE POLICY "Admin can read analytics"
  ON analytics_events FOR SELECT
  USING (auth.role() = 'authenticated');
