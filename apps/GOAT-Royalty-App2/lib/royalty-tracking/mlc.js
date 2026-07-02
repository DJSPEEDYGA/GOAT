/**
 * MLC (Mechanical Licensing Collective) API Integration
 * Handles mechanical royalties for U.S. music tracks
 */

class MLCAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.themlc.com/v1';
  }

  /**
   * Get royalty data for a specific work
   * @param {string} isrc - ISRC code of the track
   */
  async getWorkRoyalties(isrc) {
    try {
      const response = await fetch(`${this.baseUrl}/works?isrc=${isrc}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`MLC API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseRoyaltyData(data);
    } catch (error) {
      console.error('MLC getWorkRoyalties error:', error);
      throw error;
    }
  }

  /**
   * Get all royalties for a member
   * @param {string} memberId - MLC member ID
   * @param {Object} params - Query parameters (date range, etc.)
   */
  async getMemberRoyalties(memberId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    
    try {
      const response = await fetch(
        `${this.baseUrl}/members/${memberId}/royalties?${queryString}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`MLC API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MLC getMemberRoyalties error:', error);
      throw error;
    }
  }

  /**
   * Get catalog with royalty summary
   * @param {string} memberId - MLC member ID
   */
  async getCatalogWithRoyalties(memberId) {
    try {
      const response = await fetch(`${this.baseUrl}/members/${memberId}/catalog`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`MLC API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MLC getCatalogWithRoyalties error:', error);
      throw error;
    }
  }

  /**
   * Get unpaid royalties
   * @param {string} memberId - MLC member ID
   */
  async getUnpaidRoyalties(memberId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/members/${memberId}/royalties/unpaid`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`MLC API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MLC getUnpaidRoyalties error:', error);
      throw error;
    }
  }

  /**
   * Get historical royalty data
   * @param {string} memberId - MLC member ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   */
  async getHistoricalRoyalties(memberId, startDate, endDate) {
    try {
      const response = await fetch(
        `${this.baseUrl}/members/${memberId}/royalties/history?start=${startDate}&end=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`MLC API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MLC getHistoricalRoyalties error:', error);
      throw error;
    }
  }

  /**
   * Register a new work with MLC
   * @param {Object} workData - Work registration data
   */
  async registerWork(workData) {
    try {
      const response = await fetch(`${this.baseUrl}/works`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isrc: workData.isrc,
          title: workData.title,
          artists: workData.artists,
          writers: workData.writers,
          publishers: workData.publishers,
          release_date: workData.releaseDate,
          audio_duration: workData.duration,
          genre: workData.genre
        })
      });

      if (!response.ok) {
        throw new Error(`MLC work registration error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MLC registerWork error:', error);
      throw error;
    }
  }

  /**
   * Get work usage data (streams, downloads)
   * @param {string} isrc - ISRC code
   * @param {Object} params - Query parameters
   */
  async getWorkUsage(isrc, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    
    try {
      const response = await fetch(
        `${this.baseUrl}/works/${isrc}/usage?${queryString}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`MLC API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MLC getWorkUsage error:', error);
      throw error;
    }
  }

  /**
   * Parse and format royalty data
   * @param {Object} data - Raw MLC data
   */
  parseRoyaltyData(data) {
    return {
      totalEarnings: data.total_earnings || 0,
      paidEarnings: data.paid_earnings || 0,
      unpaidEarnings: data.unpaid_earnings || 0,
      lastPaymentDate: data.last_payment_date || null,
      works: (data.works || []).map(work => ({
        isrc: work.isrc,
        title: work.title,
        totalStreams: work.total_streams || 0,
        mechanicalRoyalties: work.mechanical_royalties || 0,
        performanceRoyalties: work.performance_royalties || 0,
        lastActivityDate: work.last_activity_date || null
      })),
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * SoundExchange API Integration
 * Handles digital performance royalties for sound recordings
 */
class SoundExchangeAPI {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://api.soundexchange.com/v1';
  }

  /**
   * Get artist royalties
   * @param {string} artistId - SoundExchange artist ID
   */
  async getArtistRoyalties(artistId) {
    try {
      const response = await fetch(`${this.baseUrl}/artists/${artistId}/royalties`, {
        headers: {
          'X-API-Key': this.apiKey,
          'X-API-Secret': this.apiSecret,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`SoundExchange API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('SoundExchange getArtistRoyalties error:', error);
      throw error;
    }
  }

  /**
   * Get performance data for a sound recording
   * @param {string} isrc - ISRC code
   * @param {Object} params - Query parameters
   */
  async getPerformanceData(isrc, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    
    try {
      const response = await fetch(
        `${this.baseUrl}/recordings/${isrc}/performances?${queryString}`,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'X-API-Secret': this.apiSecret,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`SoundExchange API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('SoundExchange getPerformanceData error:', error);
      throw error;
    }
  }

  /**
   * Get quarterly royalty statements
   * @param {string} accountId - SoundExchange account ID
   * @param {number} year - Year
   * @param {number} quarter - Quarter (1-4)
   */
  async getQuarterlyStatement(accountId, year, quarter) {
    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/${accountId}/statements/${year}/Q${quarter}`,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'X-API-Secret': this.apiSecret,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`SoundExchange API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('SoundExchange getQuarterlyStatement error:', error);
      throw error;
    }
  }

  /**
   * Get all registered works for an artist
   * @param {string} artistId - SoundExchange artist ID
   */
  async getArtistCatalog(artistId) {
    try {
      const response = await fetch(`${this.baseUrl}/artists/${artistId}/recordings`, {
        headers: {
          'X-API-Key': this.apiKey,
          'X-API-Secret': this.apiSecret,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`SoundExchange API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('SoundExchange getArtistCatalog error:', error);
      throw error;
    }
  }

  /**
   * Get unclaimed royalties (royalty black box)
   */
  async getUnclaimedRoyalties() {
    try {
      const response = await fetch(`${this.baseUrl}/unclaimed/search`, {
        headers: {
          'X-API-Key': this.apiKey,
          'X-API-Secret': this.apiSecret,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`SoundExchange API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('SoundExchange getUnclaimedRoyalties error:', error);
      throw error;
    }
  }

  /**
   * Register a sound recording
   * @param {Object} recordingData - Recording registration data
   */
  async registerRecording(recordingData) {
    try {
      const response = await fetch(`${this.baseUrl}/recordings`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'X-API-Secret': this.apiSecret,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isrc: recordingData.isrc,
          title: recordingData.title,
          artist: recordingData.artist,
          label: recordingData.label,
          release_date: recordingData.releaseDate,
          duration: recordingData.duration,
          featured_artists: recordingData.featuredArtists || []
        })
      });

      if (!response.ok) {
        throw new Error(`SoundExchange recording registration error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('SoundExchange registerRecording error:', error);
      throw error;
    }
  }

  /**
   * Calculate royalty breakdown
   * @param {Object} performanceData - Performance data from API
   */
  calculateRoyaltyBreakdown(performanceData) {
    // SoundExchange pays 50% to copyright owners (labels), 45% to featured artists, 5% to non-featured
    const DISTRIBUTION = {
      copyrightOwner: 0.50,
      featuredArtist: 0.45,
      nonFeatured: 0.05
    };

    const totalRoyalty = performanceData.total_royalty || 0;

    return {
      totalRoyalty,
      copyrightOwnerShare: totalRoyalty * DISTRIBUTION.copyrightOwner,
      featuredArtistShare: totalRoyalty * DISTRIBUTION.featuredArtist,
      nonFeaturedShare: totalRoyalty * DISTRIBUTION.nonFeatured,
      totalPerformances: performanceData.total_performances || 0,
      averageRatePerPlay: performanceData.total_performances > 0 
        ? totalRoyalty / performanceData.total_performances 
        : 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Unified Royalty Aggregator
 * Combines data from MLC, SoundExchange, and other sources
 */
class RoyaltyAggregator {
  constructor(config) {
    this.mlc = new MLCAPI(config.mlcApiKey);
    this.soundExchange = new SoundExchangeAPI(config.soundExchangeApiKey, config.soundExchangeApiSecret);
  }

  /**
   * Get comprehensive royalty report for all sources
   * @param {Object} params - Query parameters
   */
  async getComprehensiveReport(params) {
    try {
      const [mlcData, soundExchangeData] = await Promise.all([
        this.mlc.getMemberRoyalties(params.mlcMemberId, params),
        this.soundExchange.getArtistRoyalties(params.soundExchangeArtistId)
      ]);

      return {
        mechanicalRoyalties: {
          source: 'MLC',
          total: mlcData.totalEarnings || 0,
          paid: mlcData.paidEarnings || 0,
          unpaid: mlcData.unpaidEarnings || 0,
          details: mlcData
        },
        performanceRoyalties: {
          source: 'SoundExchange',
          total: soundExchangeData.total_royalties || 0,
          details: soundExchangeData
        },
        combinedTotal: (mlcData.totalEarnings || 0) + (soundExchangeData.total_royalties || 0),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('RoyaltyAggregator error:', error);
      throw error;
    }
  }
}

module.exports = { MLCAPI, SoundExchangeAPI, RoyaltyAggregator };