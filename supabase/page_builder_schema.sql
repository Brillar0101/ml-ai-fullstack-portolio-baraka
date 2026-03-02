-- ============================================
-- Page Builder Schema for Supabase
-- Run this in your Supabase SQL Editor
-- ============================================

-- Table 1: Stores the live/published version of each page
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT UNIQUE NOT NULL,
  page_title TEXT NOT NULL,
  craft_state JSONB NOT NULL,
  meta JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table 2: Version history for undo/restore
CREATE TABLE IF NOT EXISTS page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES page_content(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  craft_state JSONB NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_id, version_number)
);

-- Table 3: Global site settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_page_content_slug ON page_content(page_slug);
CREATE INDEX IF NOT EXISTS idx_page_versions_page ON page_versions(page_id, version_number DESC);

-- RLS Policies
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read published pages
CREATE POLICY "Public read published pages"
  ON page_content FOR SELECT
  USING (is_published = true);

-- Anyone can read settings
CREATE POLICY "Public read settings"
  ON site_settings FOR SELECT
  USING (true);

-- Note: Add admin write policies based on your auth setup
-- Example for GitHub OAuth admins:
-- CREATE POLICY "Admins can manage pages"
--   ON page_content FOR ALL
--   USING (auth.uid() IN (SELECT github_user_id FROM admin_users));
