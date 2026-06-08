-- ============================================================
-- Discover AI — Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT UNIQUE NOT NULL,
  slug      TEXT UNIQUE NOT NULL,
  description TEXT,
  icon      TEXT
);

-- MCP listings table
CREATE TABLE IF NOT EXISTS mcps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  category_slug   TEXT REFERENCES categories(slug) ON DELETE SET NULL,
  language        TEXT,
  repo_url        TEXT UNIQUE NOT NULL,
  website_url     TEXT,
  stars           INTEGER DEFAULT 0,
  last_commit_at  TIMESTAMPTZ,
  is_maintained   BOOLEAN DEFAULT true,
  prompts         JSONB DEFAULT '[]',      -- [{title, prompt}]
  tags            TEXT[] DEFAULT '{}',
  install_command TEXT,
  verified        BOOLEAN DEFAULT false,   -- Stage 2 feature
  submitted_by    TEXT DEFAULT 'team',     -- 'team' | 'vendor'
  listed_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX IF NOT EXISTS mcps_search_idx
  ON mcps USING GIN (
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
  );

-- Index for category filtering
CREATE INDEX IF NOT EXISTS mcps_category_idx ON mcps(category_slug);

-- Index for maintained status filtering
CREATE INDEX IF NOT EXISTS mcps_maintained_idx ON mcps(is_maintained);

-- Index for sorting by stars
CREATE INDEX IF NOT EXISTS mcps_stars_idx ON mcps(stars DESC);

-- Vendor submissions table (for self-submit form in Week 4)
CREATE TABLE IF NOT EXISTS submissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_url    TEXT NOT NULL,
  name        TEXT,
  description TEXT,
  category_slug TEXT,
  contact_email TEXT,
  status      TEXT DEFAULT 'pending',  -- pending | approved | rejected
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Seed categories
-- ============================================================
INSERT INTO categories (name, slug, description, icon) VALUES
  ('Dev Tools',       'dev-tools',    'Git, code execution, IDEs, editors',         '🛠️'),
  ('Data & Databases','data',         'Postgres, SQLite, CSV, spreadsheets',         '🗄️'),
  ('Communication',   'communication','Slack, Gmail, Discord, Teams',                '💬'),
  ('Productivity',    'productivity', 'Calendar, notes, tasks, docs',                '✅'),
  ('Web & Search',    'web-search',   'Browsers, search engines, scraping',          '🔍'),
  ('Cloud & Infra',   'cloud-infra',  'AWS, Docker, Kubernetes, CI/CD',              '☁️'),
  ('Security',        'security',     'Auth, secrets management, scanning',          '🔐'),
  ('Finance',         'finance',      'Stripe, accounting, invoicing',               '💰'),
  ('AI & ML',         'ai-ml',        'Model APIs, embeddings, vector databases',    '🤖'),
  ('Other',           'other',        'Everything else',                             '📦')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Helper: updated_at auto-update trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS mcps_updated_at ON mcps;
CREATE TRIGGER mcps_updated_at
  BEFORE UPDATE ON mcps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security (run before going public)
-- ============================================================
-- With RLS enabled, the public anon key can only do what a policy allows.
-- The data scripts use the SERVICE ROLE key, which bypasses RLS entirely,
-- so collect / sync / curate keep working without any policy.

ALTER TABLE mcps        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Public read-only access for the frontend (anon + logged-in users).
DROP POLICY IF EXISTS "public read mcps" ON mcps;
CREATE POLICY "public read mcps"
  ON mcps FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public read categories" ON categories;
CREATE POLICY "public read categories"
  ON categories FOR SELECT TO anon, authenticated USING (true);

-- Vendor self-submit form (Week 4): anyone may INSERT a submission,
-- but nobody can read others' submissions with the anon key.
DROP POLICY IF EXISTS "public insert submissions" ON submissions;
CREATE POLICY "public insert submissions"
  ON submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Note: no INSERT/UPDATE/DELETE policies on mcps or categories — writes are
-- service-role only. The anon key cannot modify the catalog.
