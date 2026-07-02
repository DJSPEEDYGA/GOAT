/**
 * TikTok Creator Marketplace API Integration
 * Full integration for music performance tracking, creator analytics, and engagement data
 */

class TikTokCreatorMarketplaceAPI {
  constructor(appId, appSecret) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.baseUrl = 'https://business-api.tiktok.com/open_api/v1.3';
    this.accessToken = null;
  }

  /**
   * Set access token for authenticated requests
   * @param {string} token - OAuth access token
   */
  setAccessToken(token) {
    this.accessToken = token;
  }

  /**
   * Get authorized headers
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get creator profile information
   * @param {string} creatorId - TikTok creator ID
   */
  async getCreatorProfile(creatorId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/creator/profile/?creator_id=${creatorId}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`TikTok API error: ${data.message}`);
      }

      return data.data;
    } catch (error) {
      console.error('TikTok getCreatorProfile error:', error);
      throw error;
    }
  }

  /**
   * Search for creators by criteria
   * @param {Object} criteria - Search criteria
   */
  async searchCreators(criteria) {
    try {
      const response = await fetch(`${this.baseUrl}/creator/search/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          filters: {
            follower_count: criteria.followerCountRange,
            engagement_rate: criteria.engagementRateRange,
            country: criteria.countries || [],
            interest_category: criteria.categories || []
          },
          pagination: {
            page: criteria.page || 1,
            page_size: criteria.pageSize || 20
          }
        })
      });

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`TikTok API error: ${data.message}`);
      }

      return data.data;
    } catch (error) {
      console.error('TikTok searchCreators error:', error);
      throw error;
    }
  }

  /**
   * Get music usage analytics
   * @param {string} musicId - TikTok music/sound ID
   */
  async getMusicAnalytics(musicId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/music/analytics/?music_id=${musicId}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`TikTok API error: ${data.message}`);
      }

      return {
        musicId: musicId,
        totalVideos: data.data.total_videos || 0,
        totalViews: data.data.total_views || 0,
        totalLikes: data.data.total_likes || 0,
        totalShares: data.data.total_shares || 0,
        totalComments: data.data.total_comments || 0,
        engagementRate: this.calculateEngagementRate(data.data),
        dailyTrends: data.data.daily_trends || [],
        topRegions: data.data.top_regions || [],
        creatorDemographics: data.data.creator_demographics || {},
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('TikTok getMusicAnalytics error:', error);
      throw error;
    }
  }

  /**
   * Get videos using a specific music track
   * @param {string} musicId - TikTok music/sound ID
   * @param {Object} params - Query parameters
   */
  async getMusicVideos(musicId, params = {}) {
    try {
      const queryString = new URLSearchParams({
        music_id: musicId,
        page: params.page || 1,
        page_size: params.pageSize || 20,
        sort_by: params.sortBy || 'views'
      }).toString();

      const response = await fetch(
        `${this.baseUrl}/music/videos/?${queryString}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`TikTok API error: ${data.message}`);
      }

      return data.data;
    } catch (error) {
      console.error('TikTok getMusicVideos error:', error);
      throw error;
    }
  }

  /**
   * Get detailed video analytics
   * @param {string} videoId - TikTok video ID
   */
  async getVideoAnalytics(videoId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/video/analytics/?video_id=${videoId}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`TikTok API error: ${data.message}`);
      }

      return {
        videoId: videoId,
        views: data.data.views || 0,
        likes: data.data.likes || 0,
        comments: data.data.comments || 0,
        shares: data.data.shares || 0,
        saves: data.data.saves || 0,
        averageWatchTime: data.data.average_watch_time || 0,
        completionRate: data.data.completion_rate || 0,
        engagementRate: this.calculateEngagementRate(data.data),
        demographics: data.data.demographics || {},
        trafficSources: data.data.traffic_sources || [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('TikTok getVideoAnalytics error:', error);
      throw error;
    }
  }

  /**
   * Get creator performance metrics
   * @param {string} creatorId - TikTok creator ID
   * @param {Object} dateRange - Date range for analytics
   */
  async getCreatorPerformance(creatorId, dateRange) {
    try {
      const response = await fetch(`${this.baseUrl}/creator/performance/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          creator_id: creatorId,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
          metrics: ['views', 'likes', 'comments', 'shares', 'engagement_rate', 'follower_growth']
        })
      });

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`TikTok API error: ${data.message}`);
      }

      return data.data;
    } catch (error) {
      console.error('TikTok getCreatorPerformance error:', error);
      throw error;
    }
  }

  /**
   * Get music trending data
   * @param {Object} params - Query parameters
   */
  async getTrendingMusic(params = {}) {
    try {
      const queryString = new URLSearchParams({
        country: params.country || 'US',
        category: params.category || 'music',
        period: params.period || '7d',
        count: params.count || 50
      }).toString();

      const response = await fetch(
        `${this.baseUrl}/music/trending/?${queryString}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`TikTok API error: ${data.message}`);
      }

      return data.data;
    } catch (error) {
      console.error('TikTok getTrendingMusic error:', error);
      throw error;
    }
  }

  /**
   * Create a campaign to promote music
   * @param {Object} campaignData - Campaign configuration
   */
  async createMusicCampaign(campaignData) {
    try {
      const response = await fetch(`${this.baseUrl}/campaign/create/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          campaign_name: campaignData.name,
          campaign_type: 'MUSIC_PROMOTION',
          objective: campaignData.objective || 'REACH',
          budget: campaignData.budget,
          schedule: {
            start_time: campaignData.startDate,
            end_time: campaignData.endDate
          },
          targeting: {
            age_groups: campaignData.targetAgeGroups || [],
            genders: campaignData.targetGenders || [],
            locations: campaignData.targetLocations || [],
            interests: campaignData.targetInterests || []
          },
          creative: {
            music_id: campaignData.musicId,
            call_to_action: campaignData.callToAction || 'listen_now'
          }
        })
      });

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`TikTok API error: ${data.message}`);
      }

      return data.data;
    } catch (error) {
      console.error('TikTok createMusicCampaign error:', error);
      throw error;
    }
  }

  /**
   * Get campaign analytics
   * @param {string} campaignId - Campaign ID
   */
  async getCampaignAnalytics(campaignId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/campaign/analytics/?campaign_id=${campaignId}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`TikTok API error: ${data.message}`);
      }

      return data.data;
    } catch (error) {
      console.error('TikTok getCampaignAnalytics error:', error);
      throw error;
    }
  }

  /**
   * Calculate engagement rate
   * @param {Object} data - Video or music data
   */
  calculateEngagementRate(data) {
    const views = data.views || data.total_views || 0;
    const likes = data.likes || data.total_likes || 0;
    const comments = data.comments || data.total_comments || 0;
    const shares = data.shares || data.total_shares || 0;
    
    if (views === 0) return 0;
    
    return ((likes + comments + shares) / views) * 100;
  }

  /**
   * Get creators who used specific music
   * @param {string} musicId - TikTok music/sound ID
   * @param {Object} params - Query parameters
   */
  async getMusicCreators(musicId, params = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/music/creators/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          music_id: musicId,
          filters: {
            min_followers: params.minFollowers || 0,
            min_views: params.minViews || 0,
            sort_by: params.sortBy || 'views'
          },
          pagination: {
            page: params.page || 1,
            page_size: params.pageSize || 20
          }
        })
      });

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`TikTok API error: ${data.message}`);
      }

      return data.data;
    } catch (error) {
      console.error('TikTok getMusicCreators error:', error);
      throw error;
    }
  }

  /**
   * Get estimated royalties based on TikTok performance
   * @param {string} musicId - TikTok music/sound ID
   * @param {Object} royaltyRates - Custom royalty rates
   */
  async getEstimatedRoyalties(musicId, royaltyRates = {}) {
    try {
      const analytics = await this.getMusicAnalytics(musicId);
      
      // Default TikTok Creator Fund rates (approximate)
      const rates = {
        perView: royaltyRates.perView || 0.00002, // $0.02 per 1000 views
        perEngagement: royaltyRates.perEngagement || 0.0001,
        ...royaltyRates
      };

      const viewRoyalty = analytics.totalViews * rates.perView;
      const engagementRoyalty = (analytics.totalLikes + analytics.totalComments + analytics.totalShares) * rates.perEngagement;
      
      return {
        musicId,
        estimatedRoyalty: viewRoyalty + engagementRoyalty,
        breakdown: {
          viewBased: viewRoyalty,
          engagementBased: engagementRoyalty,
          totalViews: analytics.totalViews,
          totalEngagements: analytics.totalLikes + analytics.totalComments + analytics.totalShares
        },
        rates,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('TikTok getEstimatedRoyalties error:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive music report
   * @param {string} musicId - TikTok music/sound ID
   */
  async getComprehensiveMusicReport(musicId) {
    try {
      const [analytics, videos, creators, royalties] = await Promise.all([
        this.getMusicAnalytics(musicId),
        this.getMusicVideos(musicId, { pageSize: 10 }),
        this.getMusicCreators(musicId, { pageSize: 10 }),
        this.getEstimatedRoyalties(musicId)
      ]);

      return {
        musicId,
        analytics,
        topVideos: videos.videos || [],
        topCreators: creators.creators || [],
        estimatedRoyalties: royalties,
        reportGeneratedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('TikTok getComprehensiveMusicReport error:', error);
      throw error;
    }
  }
}

/**
 * TikTok Music Distribution Manager
 * Handles publishing and distribution of music to TikTok
 */
class TikTokMusicDistribution {
  constructor(appId, appSecret) {
    this.marketplace = new TikTokCreatorMarketplaceAPI(appId, appSecret);
  }

  /**
   * Register a new music track with TikTok
   * @param {Object} musicData - Music metadata
   */
  async registerMusic(musicData) {
    // This would typically go through a music distributor
    // but we can track the registration status here
    return {
      status: 'pending',
      musicId: null,
      message: 'Music registration submitted. Use a distribution partner (DistroKid, TuneCore, etc.) for official release.',
      metadata: {
        title: musicData.title,
        artist: musicData.artist,
        isrc: musicData.isrc,
        duration: musicData.duration,
        submittedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Track music performance across TikTok
   * @param {Array} musicIds - Array of TikTok music IDs
   */
  async batchTrackPerformance(musicIds) {
    const results = [];
    
    for (const musicId of musicIds) {
      try {
        const report = await this.marketplace.getComprehensiveMusicReport(musicId);
        results.push({
          musicId,
          status: 'success',
          report
        });
      } catch (error) {
        results.push({
          musicId,
          status: 'error',
          error: error.message
        });
      }
    }

    return {
      totalTracks: musicIds.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      results,
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = { TikTokCreatorMarketplaceAPI, TikTokMusicDistribution };