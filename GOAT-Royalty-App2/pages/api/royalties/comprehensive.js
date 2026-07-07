/**
 * Comprehensive Royalties API Endpoint
 * Combines data from MLC, SoundExchange, TikTok, and other platforms
 */

import { RoyaltyAggregator } from '../../../lib/royalty-tracking/mlc.js';
import { TikTokCreatorMarketplaceAPI } from '../../../lib/tiktok/creator-marketplace.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mlcMemberId, soundExchangeArtistId, tiktokMusicId, period } = req.query;

    // Check if API keys are configured
    const hasMLC = process.env.MLC_API_KEY;
    const hasSoundExchange = process.env.SOUNDEXCHANGE_API_KEY && process.env.SOUNDEXCHANGE_API_SECRET;
    const hasTikTok = process.env.TIKTOK_CLIENT_ID && process.env.TIKTOK_CLIENT_SECRET;

    // If no APIs configured, return comprehensive demo data
    if (!hasMLC && !hasSoundExchange && !hasTikTok) {
      return res.status(200).json({
        success: true,
        demo_mode: true,
        message: 'No royalty APIs configured — showing comprehensive demo data',
        summary: {
          totalRoyalties: 12366.20,
          mechanicalRoyalties: 4523.67,
          performanceRoyalties: 7842.53,
          tiktokRoyalties: 401.80,
          currency: 'USD',
          period: '2025-03'
        },
        breakdown: {
          mechanical: {
            source: 'MLC',
            totalEarnings: 4523.67,
            paidEarnings: 3215.45,
            unpaidEarnings: 1308.22,
            totalWorks: 284,
            totalStreams: 12500000
          },
          performance: {
            source: 'SoundExchange',
            totalRoyalties: 7842.53,
            copyrightOwnerShare: 3921.27,
            featuredArtistShare: 3529.14,
            nonFeaturedShare: 392.13,
            totalPerformances: 8450000
          },
          tiktok: {
            source: 'TikTok Creator Marketplace',
            estimatedRoyalty: 401.80,
            totalVideos: 347,
            totalViews: 8036000,
            engagementRate: 6.44
          }
        },
        topEarningTracks: [
          {
            isrc: 'USRC12345678',
            title: 'Flame On',
            mechanical: 892.45,
            performance: 2641.20,
            tiktok: 142.00,
            total: 3675.65
          },
          {
            isrc: 'USRC12345679',
            title: 'GOAT Force',
            mechanical: 653.20,
            performance: 1785.60,
            tiktok: 96.00,
            total: 2534.80
          },
          {
            isrc: 'USRC12345680',
            title: 'Studio Session',
            mechanical: 487.67,
            performance: 1432.20,
            tiktok: 77.00,
            total: 1996.87
          }
        ],
        monthlyTrends: [
          { month: '2025-03', total: 4122.07 },
          { month: '2025-02', total: 4156.53 },
          { month: '2025-01', total: 4087.60 }
        ],
        recommendations: [
          'Consider registering 15 unclaimed works with SoundExchange',
          'MLC unpaid royalties of $1,308.22 can be claimed',
          'TikTok engagement rate of 6.44% is above average'
        ],
        lastUpdated: new Date().toISOString()
      });
    }

    // Initialize services with available credentials
    let mlc = null;
    let soundExchange = null;
    let tiktok = null;

    if (hasMLC) {
      const { MLCAPI, SoundExchangeAPI } = await import('../../../lib/royalty-tracking/mlc.js');
      mlc = new MLCAPI(process.env.MLC_API_KEY);
    }

    if (hasSoundExchange) {
      const { SoundExchangeAPI } = await import('../../../lib/royalty-tracking/mlc.js');
      soundExchange = new SoundExchangeAPI(
        process.env.SOUNDEXCHANGE_API_KEY,
        process.env.SOUNDEXCHANGE_API_SECRET
      );
    }

    if (hasTikTok) {
      tiktok = new TikTokCreatorMarketplaceAPI(
        process.env.TIKTOK_CLIENT_ID,
        process.env.TIKTOK_CLIENT_SECRET
      );
    }

    // Fetch data from all available sources
    const results = {
      timestamp: new Date().toISOString(),
      sources: {},
      summary: {
        totalRoyalties: 0,
        mechanicalRoyalties: 0,
        performanceRoyalties: 0,
        tiktokRoyalties: 0
      }
    };

    try {
      if (mlc && mlcMemberId) {
        const mlcData = await mlc.getMemberRoyalties(mlcMemberId, { period });
        results.sources.mlc = {
          status: 'success',
          data: mlcData,
          totalEarnings: mlcData.totalEarnings || 0
        };
        results.summary.mechanicalRoyalties += mlcData.totalEarnings || 0;
      }
    } catch (error) {
      results.sources.mlc = {
        status: 'error',
        error: error.message
      };
    }

    try {
      if (soundExchange && soundExchangeArtistId) {
        const seData = await soundExchange.getArtistRoyalties(soundExchangeArtistId);
        results.sources.soundexchange = {
          status: 'success',
          data: seData,
          totalRoyalties: seData.total_royalties || 0
        };
        results.summary.performanceRoyalties += seData.total_royalties || 0;
      }
    } catch (error) {
      results.sources.soundexchange = {
        status: 'error',
        error: error.message
      };
    }

    try {
      if (tiktok && tiktokMusicId) {
        const ttData = await tiktok.getEstimatedRoyalties(tiktokMusicId);
        results.sources.tiktok = {
          status: 'success',
          data: ttData,
          estimatedRoyalty: ttData.estimatedRoyalty || 0
        };
        results.summary.tiktokRoyalties += ttData.estimatedRoyalty || 0;
      }
    } catch (error) {
      results.sources.tiktok = {
        status: 'error',
        error: error.message
      };
    }

    // Calculate total
    results.summary.totalRoyalties = 
      results.summary.mechanicalRoyalties +
      results.summary.performanceRoyalties +
      results.summary.tiktokRoyalties;

    res.status(200).json({
      success: true,
      ...results
    });

  } catch (error) {
    console.error('Comprehensive royalties API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch comprehensive royalties',
      message: error.message 
    });
  }
}