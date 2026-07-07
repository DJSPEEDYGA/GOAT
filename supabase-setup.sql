-- ============================================================
-- GOAT Force Supabase Setup SQL
-- Project: xmvlnonsxmrpvlssjstl
-- Run ONCE in: https://supabase.com/dashboard/project/xmvlnonsxmrpvlssjstl/sql
-- ============================================================

-- FANS table (fan opt-ins, email captures)
CREATE TABLE IF NOT EXISTS fans (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  phone       TEXT,
  artist      TEXT DEFAULT 'goat-force',
  source      TEXT,
  consent     BOOLEAN DEFAULT true,
  tags        TEXT[],
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- AGENT MESSAGES table (Oscar + all crew chat history)
CREATE TABLE IF NOT EXISTS agent_messages (
  id          BIGSERIAL PRIMARY KEY,
  agent_id    TEXT NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agent_messages_agent_id ON agent_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_created  ON agent_messages(created_at DESC);

-- SMART LINKS table (DSP smart links)
CREATE TABLE IF NOT EXISTS smart_links (
  id           BIGSERIAL PRIMARY KEY,
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT,
  artist       TEXT,
  spotify_url  TEXT,
  apple_url    TEXT,
  youtube_url  TEXT,
  tiktok_url   TEXT,
  clicks       INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── Row Level Security ────────────────────────────────────────

-- FANS
ALTER TABLE fans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can opt-in" ON fans;
CREATE POLICY "Anyone can opt-in"    ON fans FOR INSERT TO anon WITH CHECK (consent = true);
DROP POLICY IF EXISTS "Owner reads all fans" ON fans;
CREATE POLICY "Owner reads all fans" ON fans FOR SELECT TO authenticated USING (true);

-- AGENT MESSAGES
-- Oscar server writes as anon (no auth token) — allow anon INSERT
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Oscar server can write messages" ON agent_messages;
CREATE POLICY "Oscar server can write messages"
  ON agent_messages FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users see own messages" ON agent_messages;
CREATE POLICY "Authenticated users see own messages"
  ON agent_messages FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- SMART LINKS
ALTER TABLE smart_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read links" ON smart_links;
CREATE POLICY "Public can read links"  ON smart_links FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Owner manages links" ON smart_links;
CREATE POLICY "Owner manages links"    ON smart_links FOR ALL TO authenticated USING (true);
