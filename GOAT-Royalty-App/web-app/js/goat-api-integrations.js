/**
 * ============================================================
 * GOAT ROYALTY APP — API INTEGRATIONS
 * ============================================================
 * Client-side wrapper for TikTok, DistroKid, Spotify, Apple Music,
 * and YouTube APIs. Reads keys from the encrypted API Vault.
 *
 * For production use:
 *  - Spotify: Browser-safe for public data endpoints (client credentials flow)
 *  - TikTok: Requires server-side OAuth proxy (no browser CORS allowed)
 *  - DistroKid: Requires server-side proxy (no public API)
 *  - Apple Music: Requires server-side JWT signing
 *  - YouTube Data: Some endpoints browser-safe with API key
 *
 * For "live" distribution uploads, create server endpoints at:
 *   POST /api/tiktok/upload
 *   POST /api/distrokid/release
 *   POST /api/youtube/upload
 *   GET  /api/spotify/artist-stats
 *   GET  /api/apple/analytics
 * ============================================================
 */

(function(global) {
  'use strict';

  const VAULT_KEY = 'GOAT-ROYALTY-V1-' + (navigator.userAgent.length * 7).toString();
  const SERVER_BASE = (typeof window !== 'undefined' && window.GOAT_API_BASE) || '/api';

  function decrypt(b64) {
    if (!b64) return '';
    try {
      const str = atob(b64);
      let out = '';
      for (let i = 0; i < str.length; i++) {
        out += String.fromCharCode(str.charCodeAt(i) ^ VAULT_KEY.charCodeAt(i % VAULT_KEY.length));
      }
      return out;
    } catch(e) { return ''; }
  }

  function loadKeys(service) {
    const vault = JSON.parse(localStorage.getItem('goatAPIVault') || '{}');
    if (!vault[service]) return null;
    const out = {};
    Object.keys(vault[service]).forEach(k => {
      out[k] = decrypt(vault[service][k]);
    });
    return out;
  }

  // ============================================================
  // SPOTIFY API
  // ============================================================
  const Spotify = {
    _token: null,
    _tokenExpires: 0,

    async getToken() {
      if (this._token && Date.now() < this._tokenExpires) return this._token;
      const keys = loadKeys('spotify');
      if (!keys || !keys['sp-clientId'] || !keys['sp-clientSecret']) {
        throw new Error('Spotify keys not configured in API Vault');
      }
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(keys['sp-clientId'] + ':' + keys['sp-clientSecret'])
        },
        body: 'grant_type=client_credentials'
      });
      const data = await res.json();
      if (!data.access_token) throw new Error(data.error_description || 'Token failed');
      this._token = data.access_token;
      this._tokenExpires = Date.now() + (data.expires_in - 60) * 1000;
      return this._token;
    },

    async get(endpoint) {
      const token = await this.getToken();
      const res = await fetch('https://api.spotify.com/v1' + endpoint, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      return res.json();
    },

    async searchArtist(name) {
      return this.get('/search?q=' + encodeURIComponent(name) + '&type=artist&limit=10');
    },
    async getArtist(id) { return this.get('/artists/' + id); },
    async getArtistAlbums(id, limit = 50) { return this.get(`/artists/${id}/albums?limit=${limit}`); },
    async getArtistTopTracks(id, market = 'US') { return this.get(`/artists/${id}/top-tracks?market=${market}`); },
    async getArtistRelated(id) { return this.get(`/artists/${id}/related-artists`); },
    async getTrack(id) { return this.get('/tracks/' + id); },
    async getTrackAudioFeatures(id) { return this.get('/audio-features/' + id); },
    async getPlaylist(id) { return this.get('/playlists/' + id); },
    async search(q, type = 'track,artist,album', limit = 20) {
      return this.get(`/search?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}`);
    }
  };

  // ============================================================
  // TIKTOK API (server-proxied for CORS reasons)
  // ============================================================
  const TikTok = {
    async getUserInfo() {
      return this._serverCall('GET', '/tiktok/user');
    },
    async listVideos(cursor = 0, count = 20) {
      return this._serverCall('POST', '/tiktok/videos/list', { cursor, max_count: count });
    },
    async uploadVideo(file, title, description) {
      const fd = new FormData();
      fd.append('video', file);
      fd.append('title', title);
      fd.append('description', description);
      return this._serverCall('POST', '/tiktok/upload', fd, true);
    },
    async getAnalytics(videoId) {
      return this._serverCall('GET', '/tiktok/analytics/' + videoId);
    },
    async _serverCall(method, path, body, isFormData) {
      const keys = loadKeys('tiktok');
      if (!keys) throw new Error('TikTok keys not configured');
      const opts = {
        method,
        headers: isFormData ? {} : { 'Content-Type': 'application/json' }
      };
      opts.headers['X-TikTok-Client'] = keys['tt-clientKey'] || '';
      if (keys['tt-accessToken']) opts.headers['X-TikTok-Token'] = keys['tt-accessToken'];
      if (body) opts.body = isFormData ? body : JSON.stringify(body);
      const res = await fetch(SERVER_BASE + path, opts);
      if (!res.ok) throw new Error('TikTok API error: ' + res.status);
      return res.json();
    }
  };

  // ============================================================
  // DISTROKID API (server-proxied)
  // ============================================================
  const DistroKid = {
    async listReleases() {
      return this._serverCall('GET', '/distrokid/releases');
    },
    async getRelease(id) {
      return this._serverCall('GET', '/distrokid/releases/' + id);
    },
    async createRelease(releaseData) {
      return this._serverCall('POST', '/distrokid/releases', releaseData);
    },
    async uploadTrack(file, releaseId) {
      const fd = new FormData();
      fd.append('track', file);
      fd.append('releaseId', releaseId);
      return this._serverCall('POST', '/distrokid/upload', fd, true);
    },
    async getEarnings(startDate, endDate) {
      return this._serverCall('GET', `/distrokid/earnings?start=${startDate}&end=${endDate}`);
    },
    async getStats() {
      return this._serverCall('GET', '/distrokid/stats');
    },
    async _serverCall(method, path, body, isFormData) {
      const keys = loadKeys('distrokid');
      if (!keys || !keys['dk-bearer']) throw new Error('DistroKid bearer token not set');
      const opts = {
        method,
        headers: isFormData ? {} : { 'Content-Type': 'application/json' }
      };
      opts.headers['X-DK-Bearer'] = keys['dk-bearer'];
      if (keys['dk-userId']) opts.headers['X-DK-User-Id'] = keys['dk-userId'];
      if (body) opts.body = isFormData ? body : JSON.stringify(body);
      const res = await fetch(SERVER_BASE + path, opts);
      if (!res.ok) throw new Error('DistroKid API error: ' + res.status);
      return res.json();
    }
  };

  // ============================================================
  // APPLE MUSIC API (server-proxied for JWT signing)
  // ============================================================
  const AppleMusic = {
    async searchCatalog(term, types = 'songs,albums,artists') {
      return this._serverCall('GET', `/apple/search?term=${encodeURIComponent(term)}&types=${types}`);
    },
    async getArtist(id, storefront = 'us') {
      return this._serverCall('GET', `/apple/artists/${storefront}/${id}`);
    },
    async getAnalytics(resourceId) {
      return this._serverCall('GET', '/apple/analytics/' + resourceId);
    },
    async _serverCall(method, path, body) {
      const keys = loadKeys('apple');
      if (!keys) throw new Error('Apple Music keys not configured');
      const opts = { method, headers: { 'Content-Type': 'application/json' } };
      opts.headers['X-Apple-Team-Id'] = keys['am-teamId'] || '';
      opts.headers['X-Apple-Key-Id'] = keys['am-keyId'] || '';
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(SERVER_BASE + path, opts);
      if (!res.ok) throw new Error('Apple Music API error: ' + res.status);
      return res.json();
    }
  };

  // ============================================================
  // YOUTUBE API (some browser-safe, some server-proxied)
  // ============================================================
  const YouTube = {
    async search(q, maxResults = 25) {
      const keys = loadKeys('youtube');
      if (!keys || !keys['yt-apiKey']) throw new Error('YouTube API key not configured');
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&maxResults=${maxResults}&key=${keys['yt-apiKey']}`;
      const res = await fetch(url);
      return res.json();
    },
    async getChannel(channelId) {
      const keys = loadKeys('youtube');
      if (!keys || !keys['yt-apiKey']) throw new Error('YouTube API key not configured');
      const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${keys['yt-apiKey']}`;
      const res = await fetch(url);
      return res.json();
    },
    async getVideo(videoId) {
      const keys = loadKeys('youtube');
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${keys['yt-apiKey']}`;
      const res = await fetch(url);
      return res.json();
    },
    async uploadVideo(file, title, description, tags) {
      // Requires OAuth — server-proxied
      const fd = new FormData();
      fd.append('video', file);
      fd.append('title', title);
      fd.append('description', description);
      fd.append('tags', JSON.stringify(tags || []));
      const res = await fetch(SERVER_BASE + '/youtube/upload', { method: 'POST', body: fd });
      return res.json();
    }
  };

  // ============================================================
  // DISTRIBUTION MANAGER — Orchestrates releases across all DSPs
  // ============================================================
  const Distribution = {
    /**
     * Distribute a release to multiple platforms at once.
     * @param {Object} release - Release data (title, artist, files, etc.)
     * @param {Array<string>} platforms - ['spotify', 'tiktok', 'distrokid', 'apple', 'youtube']
     */
    async distributeAll(release, platforms) {
      const results = {};
      const tasks = platforms.map(async (p) => {
        try {
          if (p === 'distrokid') {
            results[p] = await DistroKid.createRelease(release);
          } else if (p === 'tiktok') {
            results[p] = { status: 'queued', note: 'TikTok requires video asset' };
          } else {
            results[p] = { status: 'routed_through_distrokid', note: 'Spotify/Apple/YouTube distribution handled by DistroKid aggregator' };
          }
        } catch(e) {
          results[p] = { error: e.message };
        }
      });
      await Promise.all(tasks);
      return results;
    },

    /**
     * Get aggregate analytics across all platforms.
     */
    async getAggregateStats(artistId) {
      const stats = { total: { streams: 0, downloads: 0, views: 0, earnings: 0 } };
      try {
        const sp = await Spotify.getArtist(artistId);
        stats.spotify = { followers: sp.followers?.total || 0, popularity: sp.popularity || 0 };
      } catch(e) { stats.spotify = { error: e.message }; }

      try {
        const dk = await DistroKid.getStats();
        stats.distrokid = dk;
        if (dk.totalStreams) stats.total.streams += dk.totalStreams;
        if (dk.totalEarnings) stats.total.earnings += dk.totalEarnings;
      } catch(e) { stats.distrokid = { error: e.message }; }

      return stats;
    }
  };

  // ============================================================
  // EXPORT
  // ============================================================
  global.GoatAPI = {
    Spotify,
    TikTok,
    DistroKid,
    AppleMusic,
    YouTube,
    Distribution,
    loadKeys
  };

})(typeof window !== 'undefined' ? window : this);