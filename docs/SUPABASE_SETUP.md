# Supabase Setup for Cumulative Page Views

This guide explains how to set up Supabase for tracking cumulative page views that never reset (unlike the legacy Counter API which resets daily).

## Why Supabase?

- **Cumulative counting**: Views accumulate forever, never reset
- **Free tier**: 500MB database, unlimited API requests
- **Real-time**: Instant updates
- **Reliable**: Professional database service
- **Scalable**: Can add more analytics features later

## Setup Steps

### 1. Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### 2. Create Database Table

In your Supabase dashboard, go to SQL Editor and run this SQL:

```sql
-- Create page_views table
CREATE TABLE page_views (
  id SERIAL PRIMARY KEY,
  page TEXT UNIQUE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX page_views_page_idx ON page_views(page);

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

-- Optional: Insert initial data with current count
-- Replace 351 with your current view count from staging
INSERT INTO page_views (page, count) 
VALUES ('home', 351)
ON CONFLICT (page) DO NOTHING;
```

### 3. Get Your Credentials

1. Go to Settings > API
2. Copy your project URL (starts with `https://`)
3. Copy your `anon` public key (starts with `eyJ`)

### 4. Configure Environment Variables

Add to your `.env.development`, `.env.staging`, and `.env.production` files:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Test the Setup

Start your development server:

```bash
npm run dev
```

Check the browser console for logs like:
- `[VisitorCounter] using_supabase`
- `[VisitorCounter] supabase_success`

## Migration from Counter API

If you're migrating from the Counter API:

1. Note your current total views from staging/production
2. Set this as the initial count in the SQL above
3. Deploy with Supabase configuration
4. Verify the count continues from where you left off

## Row Level Security (Optional)

For production, you can add RLS policies:

```sql
-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access" ON page_views
FOR SELECT USING (true);

-- Allow public increment via RPC only
CREATE POLICY "Public increment via RPC" ON page_views
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update via RPC" ON page_views
FOR UPDATE USING (true);
```

## Monitoring

You can monitor page views in the Supabase dashboard:

1. Go to Table Editor > page_views
2. See real-time view counts
3. Export data for analytics

## Troubleshooting

**If Supabase fails:**
- The app will automatically fall back to Counter API
- Check browser console for error messages
- Verify your environment variables are correct

**Performance:**
- Supabase free tier has no API limits
- Response times should be under 100ms globally
- Consider upgrading for production workloads

## Future Enhancements

With Supabase set up, you can easily add:
- Per-page analytics
- Unique visitor tracking
- Geographic analytics
- Time-based analytics
- Custom events tracking