/**
 * 🔌 GOAT Force — Supabase Client
 * Project: xmvlnonsxmrpvlssjstl.supabase.co
 * 
 * Loads via CDN (no build step needed). Exposes window.goatDB with helpers:
 *   - goatDB.saveFan({email,name,artist,source})
 *   - goatDB.listFans()
 *   - goatDB.saveAgentConversation(agentId, messages)
 *   - goatDB.loadAgentHistory(agentId)
 *   - goatDB.signIn(email, password)
 *   - goatDB.signUp(email, password)
 *   - goatDB.signOut()
 *   - goatDB.currentUser()
 */
(function(){
  const SUPABASE_URL = 'https://xmvlnonsxmrpvlssjstl.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtdmxub25zeG1ycHZsc3Nqc3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExODY5MzEsImV4cCI6MjA3Njc2MjkzMX0.29rr7p9mzPAyjRmnASo6c9rVZES211oFip1fh-chOtA';

  // Inject Supabase SDK from CDN if not already loaded
  function ensureSDK(cb){
    if (window.supabase && window.supabase.createClient){ cb(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
    s.onload = cb;
    s.onerror = () => { console.warn('Supabase SDK failed to load — falling back to REST'); cb(); };
    document.head.appendChild(s);
  }

  let client = null;
  function getClient(){
    if (client) return client;
    if (window.supabase && window.supabase.createClient){
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return client;
  }

  // REST fallback (works without SDK)
  async function rest(path, options={}){
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...(options.headers||{})
      }
    });
    if (!r.ok){
      const txt = await r.text();
      throw new Error(`Supabase ${r.status}: ${txt.slice(0,200)}`);
    }
    return r.json();
  }

  const goatDB = {
    url: SUPABASE_URL,
    ready: false,

    async init(){
      return new Promise(resolve => {
        ensureSDK(() => { this.ready = true; getClient(); resolve(true); });
      });
    },

    // ========== FANS ==========
    async saveFan({email, name='', artist='goat-force', source='web', consent=true, phone=''}){
      try {
        const data = await rest('fans', {
          method: 'POST',
          body: JSON.stringify({ email, name, artist, source, consent, phone, created_at: new Date().toISOString() })
        });
        return { ok: true, fan: data[0] };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    },

    async listFans(){
      try {
        const data = await rest('fans?select=*&order=created_at.desc&limit=500');
        return { ok: true, fans: data };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    },

    async countFans(artist=null){
      try {
        const q = artist ? `fans?select=id&artist=eq.${artist}` : 'fans?select=id';
        const r = await fetch(`${SUPABASE_URL}/rest/v1/${q}`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'count=exact'
          }
        });
        const count = parseInt(r.headers.get('content-range')?.split('/')[1] || '0');
        return { ok: true, count };
      } catch (e) { return { ok:false, error:e.message }; }
    },

    // ========== AGENT CONVERSATIONS ==========
    async saveAgentMessage(agent_id, role, content, user_id=null){
      try {
        const data = await rest('agent_messages', {
          method: 'POST',
          body: JSON.stringify({ agent_id, role, content, user_id, created_at: new Date().toISOString() })
        });
        return { ok: true, msg: data[0] };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    },

    async loadAgentHistory(agent_id, limit=50){
      try {
        const data = await rest(`agent_messages?agent_id=eq.${agent_id}&select=*&order=created_at.desc&limit=${limit}`);
        return { ok: true, messages: data.reverse() };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    },

    // ========== AUTH ==========
    async signUp(email, password){
      const c = getClient();
      if (!c) return { ok:false, error:'SDK not loaded' };
      const { data, error } = await c.auth.signUp({ email, password });
      return error ? { ok:false, error:error.message } : { ok:true, user:data.user };
    },

    async signIn(email, password){
      const c = getClient();
      if (!c) return { ok:false, error:'SDK not loaded' };
      const { data, error } = await c.auth.signInWithPassword({ email, password });
      return error ? { ok:false, error:error.message } : { ok:true, user:data.user, session:data.session };
    },

    async signOut(){
      const c = getClient();
      if (!c) return { ok:false };
      await c.auth.signOut();
      return { ok:true };
    },

    async currentUser(){
      const c = getClient();
      if (!c) return null;
      const { data } = await c.auth.getUser();
      return data?.user || null;
    },

    // ========== SETUP SQL (run once in Supabase SQL editor) ==========
    setupSQL: `
-- Run this once in Supabase SQL Editor (https://supabase.com/dashboard/project/xmvlnonsxmrpvlssjstl/sql)
CREATE TABLE IF NOT EXISTS fans (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  artist TEXT DEFAULT 'goat-force',
  source TEXT,
  consent BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_messages (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS smart_links (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  artist TEXT,
  spotify_url TEXT,
  apple_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,
  clicks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security: public can INSERT fans (with consent), read their own
ALTER TABLE fans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can opt-in" ON fans FOR INSERT TO anon WITH CHECK (consent = true);
CREATE POLICY "Owner reads all" ON fans FOR SELECT TO authenticated USING (true);

ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own conversations" ON agent_messages FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

ALTER TABLE smart_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read links" ON smart_links FOR SELECT TO anon USING (true);
CREATE POLICY "Owner manages links" ON smart_links FOR ALL TO authenticated USING (true);
    `.trim()
  };

  window.goatDB = goatDB;
  // Auto-init
  goatDB.init().then(() => console.log('✅ goatDB ready'));
})();