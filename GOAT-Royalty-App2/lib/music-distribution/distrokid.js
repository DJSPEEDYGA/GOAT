/**
 * DistroKid API Integration
 * Handles bulk music upload and distribution to TikTok, Spotify, Apple Music, etc.
 */

class DistroKidAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.distrokid.com/v1';
  }

  /**
   * Upload a single track
   * @param {Object} trackData - Track metadata and audio file
   */
  async uploadTrack(trackData) {
    const formData = new FormData();
    formData.append('audio_file', trackData.audioFile);
    formData.append('title', trackData.title);
    formData.append('artist', trackData.artist);
    formData.append('album', trackData.album || '');
    formData.append('genre', trackData.genre);
    formData.append('release_date', trackData.releaseDate);
    formData.append('explicit', trackData.explicit ? 'true' : 'false');
    formData.append('isrc', trackData.isrc || '');
    formData.append('upc', trackData.upc || '');
    
    // TikTok-specific settings
    formData.append('tik_tok_enabled', 'true');
    formData.append('tik_tok_clip_start', trackData.tikTokClipStart || 0);
    formData.append('tik_tok_clip_duration', trackData.tikTokClipDuration || 15);

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`DistroKid API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('DistroKid upload error:', error);
      throw error;
    }
  }

  /**
   * Bulk upload multiple tracks
   * @param {Array} tracks - Array of track data objects
   * @param {Function} onProgress - Progress callback
   */
  async bulkUpload(tracks, onProgress = null) {
    const results = [];
    const total = tracks.length;

    for (let i = 0; i < tracks.length; i++) {
      try {
        const result = await this.uploadTrack(tracks[i]);
        results.push({
          track: tracks[i].title,
          status: 'success',
          data: result
        });
      } catch (error) {
        results.push({
          track: tracks[i].title,
          status: 'error',
          error: error.message
        });
      }

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: total,
          percentage: ((i + 1) / total) * 100
        });
      }
    }

    return results;
  }

  /**
   * Get distribution status for a track
   * @param {string} trackId - DistroKid track ID
   */
  async getDistributionStatus(trackId) {
    try {
      const response = await fetch(`${this.baseUrl}/tracks/${trackId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get distribution status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('DistroKid status error:', error);
      throw error;
    }
  }

  /**
   * Get list of distributed platforms for a track
   * @param {string} trackId - DistroKid track ID
   */
  async getDistributedPlatforms(trackId) {
    try {
      const response = await fetch(`${this.baseUrl}/tracks/${trackId}/platforms`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get platforms: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('DistroKid platforms error:', error);
      throw error;
    }
  }

  /**
   * Get earnings/royalties from DistroKid
   * @param {Object} params - Query parameters (date range, etc.)
   */
  async getEarnings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    
    try {
      const response = await fetch(`${this.baseUrl}/earnings?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get earnings: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('DistroKid earnings error:', error);
      throw error;
    }
  }

  /**
   * Generate ISRC codes for tracks
   * @param {number} count - Number of ISRC codes to generate
   */
  async generateISRC(count = 1) {
    try {
      const response = await fetch(`${this.baseUrl}/isrc/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate ISRC: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('DistroKid ISRC generation error:', error);
      throw error;
    }
  }
}

/**
 * TuneCore API Integration
 * Alternative distribution service
 */
class TuneCoreAPI {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://api.tunecore.com/v2';
  }

  async uploadTrack(trackData) {
    // Similar implementation to DistroKid
    const response = await fetch(`${this.baseUrl}/products`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'X-API-Secret': this.apiSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product: {
          product_type: 'single',
          name: trackData.title,
          artist_name: trackData.artist,
          genre_id: trackData.genreId,
          release_date: trackData.releaseDate,
          explicit_content: trackData.explicit || false,
          tracks: [{
            title: trackData.title,
            audio_file_url: trackData.audioFileUrl,
            isrc: trackData.isrc,
            track_number: 1
          }],
          stores: ['spotify', 'apple_music', 'tiktok', 'amazon', 'deezer', 'tidal']
        }
      })
    });

    return await response.json();
  }

  async bulkUpload(tracks, onProgress = null) {
    const results = [];
    const total = tracks.length;

    for (let i = 0; i < tracks.length; i++) {
      try {
        const result = await this.uploadTrack(tracks[i]);
        results.push({ track: tracks[i].title, status: 'success', data: result });
      } catch (error) {
        results.push({ track: tracks[i].title, status: 'error', error: error.message });
      }

      if (onProgress) {
        onProgress({ current: i + 1, total, percentage: ((i + 1) / total) * 100 });
      }
    }

    return results;
  }

  async getEarnings(startDate, endDate) {
    const response = await fetch(
      `${this.baseUrl}/earnings?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          'X-API-Key': this.apiKey,
          'X-API-Secret': this.apiSecret,
        }
      }
    );

    return await response.json();
  }
}

/**
 * CD Baby API Integration
 * Another distribution service option
 */
class CDBabyAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.cdbaby.com/v1';
  }

  async uploadTrack(trackData) {
    const response = await fetch(`${this.baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_type: 'single',
        title: trackData.title,
        artist: trackData.artist,
        genre: trackData.genre,
        release_date: trackData.releaseDate,
        audio_file_url: trackData.audioFileUrl,
        isrc: trackData.isrc,
        stores: ['spotify', 'apple_music', 'tiktok', 'amazon_music', 'tidal', 'deezer']
      })
    });

    return await response.json();
  }

  async bulkUpload(tracks, onProgress = null) {
    const results = [];
    
    for (let i = 0; i < tracks.length; i++) {
      try {
        const result = await this.uploadTrack(tracks[i]);
        results.push({ track: tracks[i].title, status: 'success', data: result });
      } catch (error) {
        results.push({ track: tracks[i].title, status: 'error', error: error.message });
      }

      if (onProgress) {
        onProgress({ current: i + 1, total: tracks.length, percentage: ((i + 1) / tracks.length) * 100 });
      }
    }

    return results;
  }

  async getRoyalties(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseUrl}/royalties?${queryString}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    return await response.json();
  }
}

module.exports = { DistroKidAPI, TuneCoreAPI, CDBabyAPI };