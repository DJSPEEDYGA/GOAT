/**
 * GOAT Royalty App - Analytics API
 * Provides access to streaming analytics and performance data
 */

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGetAnalytics(req, res);
        break;
      case 'POST':
        await handleSearchAnalytics(req, res);
        break;
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Analytics API Error:', error);
    res.status(500).json({ 
      error: 'Analytics operation failed',
      details: error.message 
    });
  }
}

async function handleGetAnalytics(req, res) {
  try {
    const dashboardPath = path.join(process.cwd(), 'processed-analytics', 'analytics-dashboard.json');
    
    if (!fs.existsSync(dashboardPath)) {
      return res.status(404).json({ error: 'Analytics dashboard not found. Please process analytics data first.' });
    }

    const dashboardData = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));
    
    // Get detailed data
    const recordingsPath = path.join(process.cwd(), 'processed-analytics', 'recordings-data.json');
    const audiencePath = path.join(process.cwd(), 'processed-analytics', 'audience-stats.json');
    const playlistsPath = path.join(process.cwd(), 'processed-analytics', 'playlists-data.json');
    
    const detailedData = {
      recordings: fs.existsSync(recordingsPath) ? JSON.parse(fs.readFileSync(recordingsPath, 'utf8')) : null,
      audience: fs.existsSync(audiencePath) ? JSON.parse(fs.readFileSync(audiencePath, 'utf8')) : null,
      playlists: fs.existsSync(playlistsPath) ? JSON.parse(fs.readFileSync(playlistsPath, 'utf8')) : null
    };
    
    res.status(200).json({
      success: true,
      dashboard: dashboardData,
      detailed_data: detailedData,
      last_updated: dashboardData.generated_at
    });

  } catch (error) {
    console.error('Error reading analytics data:', error);
    res.status(500).json({ error: 'Failed to read analytics data' });
  }
}

async function handleSearchAnalytics(req, res) {
  try {
    const { searchTerm, dataType, sortBy, limit } = req.body;
    
    const recordingsPath = path.join(process.cwd(), 'processed-analytics', 'recordings-data.json');
    
    if (!fs.existsSync(recordingsPath)) {
      return res.status(404).json({ error: 'Analytics data not found' });
    }

    const recordingsData = JSON.parse(fs.readFileSync(recordingsPath, 'utf8'));
    let results = [...recordingsData.records];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(record => 
        (record.song || record.title || '').toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    if (sortBy) {
      results.sort((a, b) => {
        switch (sortBy) {
          case 'streams':
            return b.streams - a.streams;
          case 'listeners':
            return b.listeners - a.listeners;
          case 'saves':
            return b.saves - a.saves;
          case 'date':
            return new Date(b.release_date) - new Date(a.release_date);
          default:
            return 0;
        }
      });
    }
    
    // Apply limit
    if (limit && parseInt(limit) > 0) {
      results = results.slice(0, parseInt(limit));
    }
    
    res.status(200).json({
      success: true,
      results: results,
      total_found: results.length,
      total_catalog: recordingsData.records.length
    });

  } catch (error) {
    console.error('Error searching analytics data:', error);
    res.status(500).json({ error: 'Failed to search analytics data' });
  }
}