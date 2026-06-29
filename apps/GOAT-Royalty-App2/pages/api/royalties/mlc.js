/**
 * MLC Royalties API Endpoint
 * Fetches mechanical royalty data from the Mechanical Licensing Collective
 */

import { MLCAPI } from '../../../lib/royalty-tracking/mlc.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { isrc, memberId, action } = req.query;

    // Check for API key
    if (!process.env.MLC_API_KEY) {
      return res.status(200).json({
        success: true,
        demo_mode: true,
        message: 'MLC API key not configured — showing demo data',
        setupInstructions: {
          step1: 'Register at https://www.themlc.com/',
          step2: 'Get your API key from the member portal',
          step3: 'Add MLC_API_KEY to your environment variables'
        },
        summary: {
          totalEarnings: 4523.67,
          paidEarnings: 3215.45,
          unpaidEarnings: 1308.22,
          lastPaymentDate: '2025-02-15',
          totalWorks: 284,
          totalStreams: 12500000
        },
        topWorks: [
          { isrc: 'USRC12345678', title: 'Flame On', streams: 2840000, royalties: 892.45 },
          { isrc: 'USRC12345679', title: 'GOAT Force', streams: 1920000, royalties: 653.20 },
          { isrc: 'USRC12345680', title: 'Studio Session', streams: 1540000, royalties: 487.67 }
        ]
      });
    }

    const mlc = new MLCAPI(process.env.MLC_API_KEY);

    let result;

    switch (action) {
      case 'unpaid':
        // Get unpaid royalties
        result = await mlc.getUnpaidRoyalties(memberId);
        break;
        
      case 'catalog':
        // Get catalog with royalties
        result = await mlc.getCatalogWithRoyalties(memberId);
        break;
        
      case 'history':
        // Get historical royalties
        const { startDate, endDate } = req.query;
        result = await mlc.getHistoricalRoyalties(memberId, startDate, endDate);
        break;
        
      case 'work':
        // Get specific work royalties
        if (!isrc) {
          return res.status(400).json({ error: 'ISRC is required for work lookup' });
        }
        result = await mlc.getWorkRoyalties(isrc);
        break;
        
      default:
        // Get member royalties summary
        if (!memberId) {
          return res.status(400).json({ 
            error: 'Member ID is required. Pass as ?memberId=YOUR_ID' 
          });
        }
        result = await mlc.getMemberRoyalties(memberId);
    }

    res.status(200).json({
      success: true,
      source: 'MLC - Mechanical Licensing Collective',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('MLC API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch MLC royalties',
      message: error.message 
    });
  }
}