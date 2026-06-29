/**
 * GOAT Royalty App — API Proxy Server
 * ------------------------------------
 * Handles server-side API calls that cannot run in the browser due to CORS
 * restrictions or require secret credentials:
 *   - TikTok for Business
 *   - DistroKid (worldwide distribution)
 *   - Spotify for Artists (analytics)
 *   - Apple Music for Artists
 *   - YouTube Data API v3 (uploads)
 *   - Multi-platform release orchestration
 *
 * Author: DJ Speedy / GOAT Force Records
 * 100% Master Ownership: DJ Speedy + Waka Flocka Flame
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// ---------------------------------------------------------------------------
//  MIDDLEWARE
// ---------------------------------------------------------------------------
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Rate limiting to protect upstream APIs
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// File upload config
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

// Ensure uploads dir exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

// ---------------------------------------------------------------------------
//  HEALTH / ROOT
// ---------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({
    name: 'GOAT Royalty API Proxy',
    version: '1.0.0',
    status: 'online',
    owner: 'DJ Speedy + Waka Flocka Flame',
    endpoints: [
      '/api/health',
      '/api/spotify/*',
      '/api/tiktok/*',
      '/api/distrokid/*',
      '/api/apple/*',
      '/api/youtube/*',
      '/api/distribute/*'
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
    services: {
      spotify: !!process.env.SPOTIFY_CLIENT_ID,
      tiktok: !!process.env.TIKTOK_CLIENT_KEY,
      distrokid: !!process.env.DISTROKID_API_KEY,
      apple: !!process.env.APPLE_TEAM_ID,
      youtube: !!process.env.YOUTUBE_API_KEY
    }
  });
});

// ---------------------------------------------------------------------------
//  SPOTIFY — Client Credentials + Analytics
// ---------------------------------------------------------------------------
let spotifyTokenCache = { token: null, expiresAt: 0 };

async function getSpotifyToken() {
  if (spotifyTokenCache.token && Date.now() < spotifyTokenCache.expiresAt) {
    return spotifyTokenCache.token;
  }
  const creds = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error_description || 'Spotify auth failed');
  spotifyTokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000
  };
  return data.access_token;
}

app.get('/api/spotify/token', async (req, res) => {
  try {
    const token = await getSpotifyToken();
    res.json({ ok: true, token, expires_in: 3600 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/spotify/search', async (req, res) => {
  try {
    const { q, type = 'track', limit = 20 } = req.query;
    if (!q) return res.status(400).json({ ok: false, error: 'Missing q' });
    const token = await getSpotifyToken();
    const r = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/spotify/artist/:id', async (req, res) => {
  try {
    const token = await getSpotifyToken();
    const r = await fetch(`https://api.spotify.com/v1/artists/${req.params.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/spotify/artist/:id/albums', async (req, res) => {
  try {
    const token = await getSpotifyToken();
    const r = await fetch(
      `https://api.spotify.com/v1/artists/${req.params.id}/albums?limit=50`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/spotify/artist/:id/top-tracks', async (req, res) => {
  try {
    const token = await getSpotifyToken();
    const market = req.query.market || 'US';
    const r = await fetch(
      `https://api.spotify.com/v1/artists/${req.params.id}/top-tracks?market=${market}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  TIKTOK for Business
//  Docs: https://developers.tiktok.com/doc/
// ---------------------------------------------------------------------------
app.post('/api/tiktok/oauth/token', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    const r = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri
      })
    });
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/tiktok/user/info', async (req, res) => {
  try {
    const token = req.headers['x-tiktok-token'] || process.env.TIKTOK_ACCESS_TOKEN;
    const r = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,username,display_name,avatar_url,follower_count,following_count,likes_count,video_count',
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/tiktok/videos/list', async (req, res) => {
  try {
    const token = req.headers['x-tiktok-token'] || process.env.TIKTOK_ACCESS_TOKEN;
    const r = await fetch(
      'https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,duration,cover_image_url,share_url,view_count,like_count,comment_count,share_count',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ max_count: 20 })
      }
    );
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/tiktok/video/upload', upload.single('video'), async (req, res) => {
  try {
    const token = req.headers['x-tiktok-token'] || process.env.TIKTOK_ACCESS_TOKEN;
    if (!req.file) return res.status(400).json({ ok: false, error: 'No video file' });

    // Step 1: init upload
    const initR = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        post_info: {
          title: req.body.title || 'GOAT Force Records',
          privacy_level: req.body.privacy || 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: req.file.size,
          chunk_size: req.file.size,
          total_chunk_count: 1
        }
      })
    });
    const initData = await initR.json();

    // Step 2: upload binary to returned URL (simplified single-chunk)
    if (initData.data && initData.data.upload_url) {
      const buf = fs.readFileSync(req.file.path);
      await fetch(initData.data.upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Range': `bytes 0-${req.file.size - 1}/${req.file.size}`
        },
        body: buf
      });
    }

    fs.unlink(req.file.path, () => {});
    res.json({ ok: true, publish_id: initData.data?.publish_id, raw: initData });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  DISTROKID (community DistroGo bearer-token compatible endpoint)
//  NOTE: DistroKid has no official public REST API. These endpoints assume
//  a DistroGo-style bearer token OR your own worldwide API access agreement.
// ---------------------------------------------------------------------------
const DK_BASE = process.env.DISTROKID_API_BASE || 'https://distrokid.com/api/v1';

async function dkRequest(endpoint, opts = {}) {
  const token = process.env.DISTROKID_API_KEY;
  const r = await fetch(`${DK_BASE}${endpoint}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'GOAT-Royalty-App/1.0',
      ...(opts.headers || {})
    }
  });
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { raw: text, status: r.status }; }
}

app.get('/api/distrokid/releases', async (req, res) => {
  try {
    res.json(await dkRequest('/releases'));
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/distrokid/releases', async (req, res) => {
  try {
    res.json(await dkRequest('/releases', {
      method: 'POST',
      body: JSON.stringify(req.body)
    }));
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/distrokid/earnings', async (req, res) => {
  try {
    const qs = new URLSearchParams(req.query).toString();
    res.json(await dkRequest(`/earnings?${qs}`));
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/distrokid/stats/:releaseId', async (req, res) => {
  try {
    res.json(await dkRequest(`/stats/${req.params.releaseId}`));
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/distrokid/upload-track', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: 'No audio file' });
    // Placeholder for binary upload — actual DistroKid upload flow depends on
    // your access agreement (presigned S3 URL or multipart form).
    const stat = fs.statSync(req.file.path);
    const record = {
      ok: true,
      file: req.file.originalname,
      size: stat.size,
      temp_id: path.basename(req.file.path),
      next: 'POST /api/distrokid/releases with this temp_id'
    };
    res.json(record);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  APPLE MUSIC (catalog search via developer token)
// ---------------------------------------------------------------------------
function getAppleDevToken() {
  // If APPLE_DEVELOPER_TOKEN is pre-generated (simpler), use it directly.
  if (process.env.APPLE_DEVELOPER_TOKEN) return process.env.APPLE_DEVELOPER_TOKEN;
  // Otherwise, you'd sign a JWT with APPLE_PRIVATE_KEY + APPLE_KEY_ID + APPLE_TEAM_ID
  throw new Error('APPLE_DEVELOPER_TOKEN not set. Generate a developer token with your MusicKit key.');
}

app.get('/api/apple/search', async (req, res) => {
  try {
    const token = getAppleDevToken();
    const { term, storefront = 'us', types = 'songs,artists,albums', limit = 20 } = req.query;
    const r = await fetch(
      `https://api.music.apple.com/v1/catalog/${storefront}/search?term=${encodeURIComponent(term)}&types=${types}&limit=${limit}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/apple/artist/:id', async (req, res) => {
  try {
    const token = getAppleDevToken();
    const storefront = req.query.storefront || 'us';
    const r = await fetch(
      `https://api.music.apple.com/v1/catalog/${storefront}/artists/${req.params.id}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  YOUTUBE DATA API v3
// ---------------------------------------------------------------------------
app.get('/api/youtube/search', async (req, res) => {
  try {
    const { q, maxResults = 10 } = req.query;
    const key = process.env.YOUTUBE_API_KEY;
    const r = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&maxResults=${maxResults}&type=video&key=${key}`
    );
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/youtube/channel/:id', async (req, res) => {
  try {
    const key = process.env.YOUTUBE_API_KEY;
    const r = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${req.params.id}&key=${key}`
    );
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/youtube/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: 'No video file' });
    const token = req.headers['x-youtube-token'] || process.env.YOUTUBE_OAUTH_TOKEN;
    if (!token) return res.status(401).json({ ok: false, error: 'YouTube OAuth token required (x-youtube-token header)' });

    const metadata = {
      snippet: {
        title: req.body.title || 'GOAT Force Records Release',
        description: req.body.description || '',
        tags: (req.body.tags || '').split(',').map(t => t.trim()).filter(Boolean),
        categoryId: req.body.categoryId || '10' // Music
      },
      status: {
        privacyStatus: req.body.privacy || 'public',
        selfDeclaredMadeForKids: false
      }
    };

    // Resumable upload init
    const initR = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': req.file.mimetype,
          'X-Upload-Content-Length': req.file.size
        },
        body: JSON.stringify(metadata)
      }
    );
    const uploadUrl = initR.headers.get('location');

    if (!uploadUrl) {
      const err = await initR.text();
      fs.unlink(req.file.path, () => {});
      return res.status(500).json({ ok: false, error: 'Failed to init upload', detail: err });
    }

    const buf = fs.readFileSync(req.file.path);
    const putR = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': req.file.mimetype, 'Content-Length': req.file.size },
      body: buf
    });
    const putData = await putR.json();
    fs.unlink(req.file.path, () => {});
    res.json({ ok: true, video: putData });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  DISTRIBUTE — orchestrates a release across ALL enabled platforms
// ---------------------------------------------------------------------------
app.post('/api/distribute', async (req, res) => {
  try {
    const { release, platforms = ['distrokid'] } = req.body;
    const results = {};

    if (platforms.includes('distrokid')) {
      try {
        results.distrokid = await dkRequest('/releases', {
          method: 'POST',
          body: JSON.stringify(release)
        });
      } catch (e) { results.distrokid = { error: e.message }; }
    }

    // Additional platforms (Spotify-for-Artists direct, Apple Music Connect)
    // require their own partner-ingest agreements — stub here.
    if (platforms.includes('spotify')) {
      results.spotify = { note: 'Spotify ingestion is delivered via DistroKid partnership. No direct endpoint required.' };
    }
    if (platforms.includes('apple')) {
      results.apple = { note: 'Apple Music ingestion delivered via DistroKid. Use Apple Music for Artists for analytics.' };
    }

    res.json({ ok: true, results, timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/distribute/status/:id', async (req, res) => {
  try {
    res.json(await dkRequest(`/releases/${req.params.id}/status`));
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  START
// ---------------------------------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🐐 GOAT Royalty API Proxy`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Time:  ${new Date().toISOString()}\n`);
});

module.exports = app;