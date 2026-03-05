-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "Anyone can read comments"
  ON blog_comments FOR SELECT
  USING (true);

-- Anyone can insert comments (anonymous)
CREATE POLICY "Anyone can insert comments"
  ON blog_comments FOR INSERT
  WITH CHECK (true);

-- Only authenticated admin can delete
CREATE POLICY "Admin can delete comments"
  ON blog_comments FOR DELETE
  USING (auth.role() = 'authenticated');
