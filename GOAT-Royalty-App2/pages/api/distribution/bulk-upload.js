/**
 * Bulk Music Upload API Endpoint
 * Handles bulk upload of tracks to distribution services (DistroKid, TuneCore, CD Baby)
 */

import { DistroKidAPI, TuneCoreAPI, CDBabyAPI } from '../../../lib/music-distribution/distrokid.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      tracks, 
      service = 'distrokid',
      onProgress 
    } = req.body;

    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      return res.status(400).json({ 
        error: 'Tracks array is required' 
      });
    }

    // Get API credentials from environment
    let distributionService;
    
    switch (service.toLowerCase()) {
      case 'distrokid':
        if (!process.env.DISTROKID_API_KEY) {
          return res.status(500).json({ 
            error: 'DistroKid API key not configured',
            setupUrl: 'https://distrokid.com/api-settings/'
          });
        }
        distributionService = new DistroKidAPI(process.env.DISTROKID_API_KEY);
        break;
        
      case 'tunecore':
        if (!process.env.TUNECORE_API_KEY || !process.env.TUNECORE_API_SECRET) {
          return res.status(500).json({ 
            error: 'TuneCore API credentials not configured',
            setupUrl: 'https://www.tunecore.com/api'
          });
        }
        distributionService = new TuneCoreAPI(
          process.env.TUNECORE_API_KEY, 
          process.env.TUNECORE_API_SECRET
        );
        break;
        
      case 'cdbaby':
        if (!process.env.CDBABY_API_KEY) {
          return res.status(500).json({ 
            error: 'CD Baby API key not configured',
            setupUrl: 'https://members.cdbaby.com/api'
          });
        }
        distributionService = new CDBabyAPI(process.env.CDBABY_API_KEY);
        break;
        
      default:
        return res.status(400).json({ 
          error: 'Invalid distribution service. Use: distrokid, tunecore, or cdbaby' 
        });
    }

    // Execute bulk upload
    const results = await distributionService.bulkUpload(tracks, (progress) => {
      // In a real implementation, this would use WebSockets or Server-Sent Events
      console.log(`Upload progress: ${progress.percentage}%`);
    });

    // Calculate summary
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;

    res.status(200).json({
      success: true,
      service,
      summary: {
        total: tracks.length,
        successful,
        failed,
        successRate: ((successful / tracks.length) * 100).toFixed(1) + '%'
      },
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}