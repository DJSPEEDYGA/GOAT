/**
 * TikTok Creator Marketplace API Endpoint
 * Enhanced integration for music performance tracking and creator analytics
 */

import { TikTokCreatorMarketplaceAPI } from '../../../lib/tiktok/creator-marketplace.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, musicId, creatorId, videoId, campaignId } = req.query;

    // Check for API credentials
    if (!process.env.TIKTOK_CLIENT_ID || !process.env.TIKTOK_CLIENT_SECRET) {
      return res.status(200).json({
        success: true,
        demo_mode: true,
        message: 'TikTok Creator Marketplace API credentials not configured — showing demo data',
        setupInstructions: {
          step1: 'Apply for TikTok for Business access at https://business-api.tiktok.com/',
          step2: 'Create an app in the TikTok Developer Portal',
          step3: 'Add TIKTOK_CLIENT_ID and TIKTOK_CLIENT_SECRET to environment variables'
        },
        analytics: {
          musicId: musicId || 'demo',
          totalVideos: 347,
          totalViews: 8036000,
          totalLikes: 517800,
          totalComments: 23200,
          totalShares: 15400,
          engagementRate: 6.44,
          estimatedRoyalty: 401.80,
          topRegions: ['United States', 'United Kingdom', 'Canada', 'Australia'],
          creatorDemographics: {
            totalCreators: 245,
            avgFollowerCount: 125000,
            topCategory: 'Music'
          }
        },
        topVideos: [
          { 
            videoId: '7234567890123456789',
            title: 'Waka Flocka - Flame On 🔥',
            creator: '@dj.speedy',
            views: 2840000,
            likes: 184200,
            comments: 8200,
            engagementRate: 6.49
          },
          { 
            videoId: '7234567890123456790',
            title: 'GOAT Force - New Beat',
            creator: '@officialgoat',
            views: 1920000,
            likes: 124800,
            comments: 5600,
            engagementRate: 6.50
          }
        ]
      });
    }

    const tiktok = new TikTokCreatorMarketplaceAPI(
      process.env.TIKTOK_CLIENT_ID,
      process.env.TIKTOK_CLIENT_SECRET
    );

    // Get access token from session or database
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (accessToken) {
      tiktok.setAccessToken(accessToken);
    }

    let result;

    switch (action) {
      case 'analytics':
        // Get music analytics
        if (!musicId) {
          return res.status(400).json({ error: 'Music ID is required for analytics' });
        }
        result = await tiktok.getMusicAnalytics(musicId);
        break;

      case 'videos':
        // Get videos using music
        if (!musicId) {
          return res.status(400).json({ error: 'Music ID is required for videos lookup' });
        }
        const pageSize = req.query.pageSize || 20;
        result = await tiktok.getMusicVideos(musicId, { pageSize });
        break;

      case 'video-analytics':
        // Get detailed video analytics
        if (!videoId) {
          return res.status(400).json({ error: 'Video ID is required for video analytics' });
        }
        result = await tiktok.getVideoAnalytics(videoId);
        break;

      case 'creators':
        // Get creators who used music
        if (!musicId) {
          return res.status(400).json({ error: 'Music ID is required for creators lookup' });
        }
        result = await tiktok.getMusicCreators(musicId, {
          minFollowers: req.query.minFollowers || 0,
          pageSize: req.query.pageSize || 20
        });
        break;

      case 'creator-profile':
        // Get creator profile
        if (!creatorId) {
          return res.status(400).json({ error: 'Creator ID is required for profile lookup' });
        }
        result = await tiktok.getCreatorProfile(creatorId);
        break;

      case 'creator-performance':
        // Get creator performance metrics
        if (!creatorId) {
          return res.status(400).json({ error: 'Creator ID is required' });
        }
        const { startDate, endDate } = req.query;
        result = await tiktok.getCreatorPerformance(creatorId, { startDate, endDate });
        break;

      case 'trending':
        // Get trending music
        result = await tiktok.getTrendingMusic({
          country: req.query.country || 'US',
          category: req.query.category || 'music',
          count: req.query.count || 50
        });
        break;

      case 'royalties':
        // Get estimated royalties
        if (!musicId) {
          return res.status(400).json({ error: 'Music ID is required for royalty estimation' });
        }
        result = await tiktok.getEstimatedRoyalties(musicId, {
          perView: parseFloat(req.query.perView) || 0.00002,
          perEngagement: parseFloat(req.query.perEngagement) || 0.0001
        });
        break;

      case 'report':
        // Get comprehensive music report
        if (!musicId) {
          return res.status(400).json({ error: 'Music ID is required for comprehensive report' });
        }
        result = await tiktok.getComprehensiveMusicReport(musicId);
        break;

      case 'search-creators':
        // Search for creators (POST request)
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed for creator search' });
        }
        const criteria = req.body;
        result = await tiktok.searchCreators(criteria);
        break;

      default:
        return res.status(400).json({ 
          error: 'Invalid action. Valid actions: analytics, videos, video-analytics, creators, creator-profile, creator-performance, trending, royalties, report, search-creators' 
        });
    }

    res.status(200).json({
      success: true,
      source: 'TikTok Creator Marketplace API',
      action,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('TikTok Creator Marketplace API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch TikTok data',
      message: error.message 
    });
  }
}