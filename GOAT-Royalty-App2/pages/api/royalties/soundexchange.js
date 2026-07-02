/**
 * SoundExchange Royalties API Endpoint
 * Fetches performance royalty data from SoundExchange
 */

import { SoundExchangeAPI } from '../../../lib/royalty-tracking/mlc.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { artistId, accountId, action, isrc } = req.query;

    // Check for API credentials
    if (!process.env.SOUNDEXCHANGE_API_KEY || !process.env.SOUNDEXCHANGE_API_SECRET) {
      return res.status(200).json({
        success: true,
        demo_mode: true,
        message: 'SoundExchange API credentials not configured — showing demo data',
        setupInstructions: {
          step1: 'Register at https://www.soundexchange.com/',
          step2: 'Get your API credentials from the member portal',
          step3: 'Add SOUNDEXCHANGE_API_KEY and SOUNDEXCHANGE_API_SECRET to environment variables'
        },
        summary: {
          totalRoyalties: 7842.53,
          copyrightOwnerShare: 3921.27,
          featuredArtistShare: 3529.14,
          nonFeaturedShare: 392.13,
          totalPerformances: 8450000,
          averageRatePerPlay: 0.00093
        },
        topPerformances: [
          { isrc: 'USRC12345678', title: 'Flame On', performances: 2840000, royalties: 2641.20 },
          { isrc: 'USRC12345679', title: 'GOAT Force', performances: 1920000, royalties: 1785.60 },
          { isrc: 'USRC12345680', title: 'Studio Session', performances: 1540000, royalties: 1432.20 }
        ],
        lastUpdated: new Date().toISOString()
      });
    }

    const soundExchange = new SoundExchangeAPI(
      process.env.SOUNDEXCHANGE_API_KEY,
      process.env.SOUNDEXCHANGE_API_SECRET
    );

    let result;

    switch (action) {
      case 'performance':
        // Get performance data for a recording
        if (!isrc) {
          return res.status(400).json({ error: 'ISRC is required for performance lookup' });
        }
        result = await soundExchange.getPerformanceData(isrc);
        break;
        
      case 'catalog':
        // Get artist catalog
        if (!artistId) {
          return res.status(400).json({ error: 'Artist ID is required for catalog lookup' });
        }
        result = await soundExchange.getArtistCatalog(artistId);
        break;
        
      case 'statement':
        // Get quarterly statement
        if (!accountId) {
          return res.status(400).json({ error: 'Account ID is required for statement lookup' });
        }
        const { year, quarter } = req.query;
        if (!year || !quarter) {
          return res.status(400).json({ error: 'Year and quarter are required (e.g., ?year=2025&quarter=1)' });
        }
        result = await soundExchange.getQuarterlyStatement(accountId, year, quarter);
        break;
        
      case 'unclaimed':
        // Get unclaimed royalties
        result = await soundExchange.getUnclaimedRoyalties();
        break;
        
      default:
        // Get artist royalties summary
        if (!artistId) {
          return res.status(400).json({ 
            error: 'Artist ID is required. Pass as ?artistId=YOUR_ID' 
          });
        }
        result = await soundExchange.getArtistRoyalties(artistId);
    }

    res.status(200).json({
      success: true,
      source: 'SoundExchange - Performance Royalties',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('SoundExchange API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch SoundExchange royalties',
      message: error.message 
    });
  }
}