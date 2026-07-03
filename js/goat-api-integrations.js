/**
 * GOAT Royalty App - Secured API Integrations
 *
 * Browser code calls the GOAT API proxy only. Provider credentials belong in
 * the server-side api-server/.env file or a real secret manager, never in
 * browser requests.
 */

(function(global) {
  'use strict';

  const SERVER_BASE = (typeof window !== 'undefined' && window.GOAT_API_BASE)
    || (typeof window !== 'undefined' && window.location.protocol === 'file:' ? 'http://localhost:4000/api' : '/api');
  const OWNER_KEY_SESSION = 'goatOwnerApiKey';
  const LEGACY_VAULT_KEY = 'goatAPIVault';

  function getOwnerApiKey() {
    try {
      return sessionStorage.getItem(OWNER_KEY_SESSION) || localStorage.getItem(OWNER_KEY_SESSION) || '';
    } catch(e) {
      return '';
    }
  }

  function setOwnerApiKey(key, persist = false) {
    if (!key) return clearOwnerApiKey();
    sessionStorage.setItem(OWNER_KEY_SESSION, key);
    if (persist) {
      localStorage.setItem(OWNER_KEY_SESSION, key);
    } else {
      localStorage.removeItem(OWNER_KEY_SESSION);
    }
  }

  function clearOwnerApiKey() {
    sessionStorage.removeItem(OWNER_KEY_SESSION);
    localStorage.removeItem(OWNER_KEY_SESSION);
  }

  function ownerHeaders(headers) {
    const out = Object.assign({}, headers || {});
    const ownerKey = getOwnerApiKey();
    if (ownerKey) out['X-GOAT-Owner-Key'] = ownerKey;
    return out;
  }

  async function serverCall(method, path, body, isFormData) {
    const opts = {
      method,
      headers: ownerHeaders(isFormData ? {} : { 'Content-Type': 'application/json' })
    };
    if (body) opts.body = isFormData ? body : JSON.stringify(body);

    const res = await fetch(SERVER_BASE + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || data.message || `GOAT API proxy error: ${res.status}`);
    }
    return data;
  }

  function unsupportedFeature(name) {
    return Promise.reject(new Error(`${name} is not wired into the secured API proxy yet.`));
  }

  function loadKeys(service) {
    try {
      const vault = JSON.parse(localStorage.getItem(LEGACY_VAULT_KEY) || '{}');
      return vault[service] ? { legacyClientVaultPresent: true } : null;
    } catch(e) {
      return null;
    }
  }

  function clearLegacyClientVault() {
    localStorage.removeItem(LEGACY_VAULT_KEY);
  }

  const Spotify = {
    async getToken() {
      return serverCall('GET', '/spotify/token');
    },
    async searchArtist(name) {
      return serverCall('GET', '/spotify/search?q=' + encodeURIComponent(name) + '&type=artist&limit=10');
    },
    async getArtist(id) {
      return serverCall('GET', '/spotify/artist/' + encodeURIComponent(id));
    },
    async getArtistAlbums(id, limit = 50) {
      return serverCall('GET', `/spotify/artist/${encodeURIComponent(id)}/albums?limit=${encodeURIComponent(limit)}`);
    },
    async getArtistTopTracks(id, market = 'US') {
      return serverCall('GET', `/spotify/artist/${encodeURIComponent(id)}/top-tracks?market=${encodeURIComponent(market)}`);
    },
    async search(q, type = 'track,artist,album', limit = 20) {
      return serverCall('GET', `/spotify/search?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}&limit=${encodeURIComponent(limit)}`);
    },
    async getArtistRelated() { return unsupportedFeature('Spotify related artists'); },
    async getTrack() { return unsupportedFeature('Spotify track lookup'); },
    async getTrackAudioFeatures() { return unsupportedFeature('Spotify audio features'); },
    async getPlaylist() { return unsupportedFeature('Spotify playlist lookup'); }
  };

  const TikTok = {
    async getUserInfo() {
      return serverCall('GET', '/tiktok/user');
    },
    async listVideos(cursor = 0, count = 20) {
      return serverCall('POST', '/tiktok/videos/list', { cursor, max_count: count });
    },
    async uploadVideo(file, title, description) {
      const fd = new FormData();
      fd.append('video', file);
      fd.append('title', title || '');
      fd.append('description', description || '');
      return serverCall('POST', '/tiktok/upload', fd, true);
    },
    async getAnalytics() {
      return unsupportedFeature('TikTok analytics');
    }
  };

  const DistroKid = {
    async listReleases() {
      return serverCall('GET', '/distrokid/releases');
    },
    async getRelease(id) {
      return serverCall('GET', '/distrokid/releases/' + encodeURIComponent(id));
    },
    async createRelease(releaseData) {
      return serverCall('POST', '/distrokid/releases', releaseData);
    },
    async uploadTrack(file, releaseId) {
      const fd = new FormData();
      fd.append('audio', file);
      fd.append('releaseId', releaseId || '');
      return serverCall('POST', '/distrokid/upload-track', fd, true);
    },
    async getEarnings(startDate, endDate) {
      const qs = new URLSearchParams({ start: startDate || '', end: endDate || '' }).toString();
      return serverCall('GET', '/distrokid/earnings?' + qs);
    },
    async getStats(releaseId) {
      return serverCall('GET', releaseId ? '/distrokid/stats/' + encodeURIComponent(releaseId) : '/distrokid/stats');
    }
  };

  const AppleMusic = {
    async searchCatalog(term, types = 'songs,albums,artists') {
      return serverCall('GET', `/apple/search?term=${encodeURIComponent(term)}&types=${encodeURIComponent(types)}`);
    },
    async getArtist(id, storefront = 'us') {
      return serverCall('GET', `/apple/artist/${encodeURIComponent(id)}?storefront=${encodeURIComponent(storefront)}`);
    },
    async getAnalytics() {
      return unsupportedFeature('Apple Music analytics');
    }
  };

  const YouTube = {
    async search(q, maxResults = 25) {
      return serverCall('GET', `/youtube/search?q=${encodeURIComponent(q)}&maxResults=${encodeURIComponent(maxResults)}`);
    },
    async getChannel(channelId) {
      return serverCall('GET', '/youtube/channel/' + encodeURIComponent(channelId));
    },
    async getVideo() {
      return unsupportedFeature('YouTube video lookup');
    },
    async uploadVideo(file, title, description, tags) {
      const fd = new FormData();
      fd.append('video', file);
      fd.append('title', title || '');
      fd.append('description', description || '');
      fd.append('tags', Array.isArray(tags) ? tags.join(',') : (tags || ''));
      return serverCall('POST', '/youtube/upload', fd, true);
    }
  };

  const Distribution = {
    async distributeAll(release, platforms = ['distrokid']) {
      return serverCall('POST', '/distribute', { release, platforms });
    },
    async getStatus(id) {
      return serverCall('GET', '/distribute/status/' + encodeURIComponent(id));
    },
    async getAggregateStats(artistId) {
      const stats = { total: { streams: 0, downloads: 0, views: 0, earnings: 0 } };
      try {
        const sp = await Spotify.getArtist(artistId);
        stats.spotify = {
          followers: (sp.followers && sp.followers.total) || 0,
          popularity: sp.popularity || 0
        };
      } catch(e) {
        stats.spotify = { error: e.message };
      }

      try {
        const dk = await DistroKid.getStats();
        stats.distrokid = dk;
        if (dk.totalStreams) stats.total.streams += dk.totalStreams;
        if (dk.totalEarnings) stats.total.earnings += dk.totalEarnings;
      } catch(e) {
        stats.distrokid = { error: e.message };
      }

      return stats;
    }
  };

  async function health() {
    return serverCall('GET', '/health');
  }

  global.GoatAPI = {
    Spotify,
    TikTok,
    DistroKid,
    AppleMusic,
    YouTube,
    Distribution,
    health,
    serverCall,
    getOwnerApiKey,
    setOwnerApiKey,
    clearOwnerApiKey,
    loadKeys,
    clearLegacyClientVault
  };

})(typeof window !== 'undefined' ? window : this);
