-- Perhitsiksha Page Views Database Setup
-- Run this in your Supabase SQL Editor

-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  page TEXT UNIQUE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS page_views_page_idx ON page_views(page);

-- Create RPC function for atomic increment
CREATE OR REPLACE FUNCTION increment_page_views(page_name TEXT)
RETURNS TABLE(count INTEGER) AS $$
BEGIN
  -- Insert or update the page view count atomically
  INSERT INTO page_views (page, count, last_updated)
  VALUES (page_name, 1, NOW())
  ON CONFLICT (page)
  DO UPDATE SET 
    count = page_views.count + 1,
    last_updated = NOW();
  
  -- Return the updated count
  RETURN QUERY 
  SELECT page_views.count 
  FROM page_views 
  WHERE page_views.page = page_name;
END;
$$ LANGUAGE plpgsql;

-- Insert initial data with current count from staging (351 total views)
-- This maintains continuity from Counter API + base count
INSERT INTO page_views (page, count, last_updated) 
VALUES ('home', 351, NOW())
ON CONFLICT (page) 
DO UPDATE SET 
  count = CASE 
    WHEN page_views.count < 351 THEN 351 
    ELSE page_views.count 
  END,
  last_updated = NOW();

-- Optional: Enable Row Level Security (RLS) for production
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY IF NOT EXISTS "Public read access" ON page_views
FOR SELECT USING (true);

-- Allow public increment via RPC only
CREATE POLICY IF NOT EXISTS "Public increment via RPC" ON page_views
FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Public update via RPC" ON page_views
FOR UPDATE USING (true);

-- Verify setup
SELECT 
  'Setup complete! Current count:' as status,
  count as current_views,
  last_updated
FROM page_views 
WHERE page = 'home';