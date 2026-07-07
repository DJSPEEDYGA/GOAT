import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const baseDir = path.join(process.cwd());
    
    // Publishing data
    const publishingPath = path.join(baseDir, 'FASTASSMAN_MUSIC_CATALOG.csv');
    const publishingExists = fs.existsSync(publishingPath);
    let publishingCount = 0;
    if (publishingExists) {
      const content = fs.readFileSync(publishingPath, 'utf8');
      publishingCount = content.split('\n').length - 1; // Exclude header
    }

    // ASAP Catalog data
    const asapPath = path.join(baseDir, 'processed-catalogs', 'asap-catalog.json');
    const asapExists = fs.existsSync(asapPath);
    let asapCount = 0;
    if (asapExists) {
      const content = fs.readFileSync(asapPath, 'utf8');
      const data = JSON.parse(content);
      asapCount = data.totalWorks || 0;
    }

    // Analytics data
    const analyticsPath = path.join(baseDir, 'processed-analytics', 'analytics-summary.json');
    const analyticsExists = fs.existsSync(analyticsPath);
    let analyticsData = {};
    if (analyticsExists) {
      analyticsData = JSON.parse(fs.readFileSync(analyticsPath, 'utf8'));
    }

    const summary = {
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        publishing: {
          integrated: publishingExists,
          totalTracks: publishingCount,
          source: 'FASTASSMAN Music Catalog'
        },
        asapCatalog: {
          integrated: asapExists,
          totalWorks: asapCount,
          source: 'ASAP Publishing Catalog'
        },
        analytics: {
          integrated: analyticsExists,
          recordings: analyticsData.recordings || 0,
          performances: analyticsData.performances || 0,
          source: 'Analytics Data'
        }
      },
      features: {
        videoGraphics: true,
        audioVisualization: true,
        enhancedUI: true,
        realTimeData: true
      }
    };

    res.status(200).json(summary);
  } catch (error) {
    console.error('Summary API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}