/**
 * GOAT Royalty App - Analytics Data Processor
 * Processes streaming analytics and performance data
 */

const fs = require('fs');
const path = require('path');

function processAnalyticsData() {
  const recordingsPath = path.join(__dirname, '../data/analytics/recordings-all.csv');
  const audienceStatsPath = path.join(__dirname, '../data/analytics/Full Audience Stats.csv');
  const playlistsPath = path.join(__dirname, '../data/analytics/playlists-last5years.csv');
  
  // Process recordings data
  const recordingsData = processCSVFile(recordingsPath, 'recordings');
  
  // Process audience stats
  const audienceData = processCSVFile(audienceStatsPath, 'audience-stats');
  
  // Process playlists data
  const playlistsData = processCSVFile(playlistsPath, 'playlists');
  
  // Create comprehensive analytics dashboard
  const analyticsDashboard = createAnalyticsDashboard(recordingsData, audienceData, playlistsData);
  
  // Save processed data
  saveAnalyticsData(recordingsData, audienceData, playlistsData, analyticsDashboard);
  
  console.log('📊 Analytics Data Processing Complete!');
  console.log(`🎵 Recordings: ${recordingsData.records.length} tracks`);
  console.log(`👥 Audience Stats: ${audienceData.records.length} days`);
  console.log(`🎶 Playlists: ${playlistsData.records.length} playlists`);
  
  return analyticsDashboard;
}

function processCSVFile(filePath, dataType) {
  try {
    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^\ufeff/, '').replace(/"/g, ''));
    const records = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = parseCSVLine(lines[i]);
        const record = {};
        
        headers.forEach((header, index) => {
          record[header.replace(/\s+/g, '_').toLowerCase()] = values[index] || '';
        });
        
        // Add processing metadata
        record.data_type = dataType;
        record.processed_date = new Date().toISOString();
        record.record_id = `${dataType}_${i}`;
        
        // Process specific data types
        if (dataType === 'recordings') {
          record.streams = parseInt(record.streams) || 0;
          record.listeners = parseInt(record.listeners) || 0;
          record.saves = parseInt(record.saves) || 0;
          record.release_date = record.release_date || '';
        } else if (dataType === 'audience-stats') {
          record.listeners = parseInt(record.listeners) || 0;
          record.streams = parseInt(record.streams) || 0;
          record.followers = parseInt(record.followers) || 0;
          record.date = record.date || '';
        } else if (dataType === 'playlists') {
          record.listeners = parseInt(record.listeners) || 0;
          record.streams = parseInt(record.streams) || 0;
          record.title = record.title || '';
          record.author = record.author || '';
        }
        
        records.push(record);
      }
    }
    
    return {
      data_type: dataType,
      total_records: records.length,
      records: records,
      processed_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { data_type: dataType, records: [], error: error.message };
  }
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(item => item.replace(/^"|"$/g, ''));
}

function createAnalyticsDashboard(recordingsData, audienceData, playlistsData) {
  // Calculate recordings statistics
  const totalStreams = recordingsData.records.reduce((sum, record) => sum + record.streams, 0);
  const totalListeners = recordingsData.records.reduce((sum, record) => sum + record.listeners, 0);
  const avgStreamsPerTrack = totalStreams / recordingsData.records.length;
  
  // Find top performing tracks
  const topTracks = recordingsData.records
    .sort((a, b) => b.streams - a.streams)
    .slice(0, 10);
  
  // Calculate audience growth
  const audienceGrowth = calculateAudienceGrowth(audienceData.records);
  
  // Find top playlists
  const topPlaylists = playlistsData.records
    .sort((a, b) => b.listeners - a.listeners)
    .slice(0, 10);
  
  return {
    overview: {
      total_tracks: recordingsData.records.length,
      total_streams: totalStreams,
      total_listeners: totalListeners,
      average_streams_per_track: Math.round(avgStreamsPerTrack),
      total_playlist_reach: playlistsData.records.reduce((sum, record) => sum + record.listeners, 0)
    },
    top_performing_tracks: topTracks,
    audience_growth: audienceGrowth,
    top_playlists: topPlaylists,
    generated_at: new Date().toISOString()
  };
}

function calculateAudienceGrowth(audienceRecords) {
  if (audienceRecords.length < 2) return [];
  
  const sortedRecords = audienceRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
  const growth = [];
  
  for (let i = 1; i < sortedRecords.length; i++) {
    const current = sortedRecords[i];
    const previous = sortedRecords[i - 1];
    
    growth.push({
      date: current.date,
      followers: current.followers,
      follower_growth: current.followers - previous.followers,
      streams: current.streams,
      stream_growth: current.streams - previous.streams,
      listeners: current.listeners,
      listener_growth: current.listeners - previous.listeners
    });
  }
  
  return growth.slice(-30); // Return last 30 days
}

function saveAnalyticsData(recordingsData, audienceData, playlistsData, dashboard) {
  const outputDir = path.join(__dirname, '../processed-analytics');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save individual datasets
  fs.writeFileSync(
    path.join(outputDir, 'recordings-data.json'),
    JSON.stringify(recordingsData, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'audience-stats.json'),
    JSON.stringify(audienceData, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'playlists-data.json'),
    JSON.stringify(playlistsData, null, 2)
  );
  
  // Save analytics dashboard
  fs.writeFileSync(
    path.join(outputDir, 'analytics-dashboard.json'),
    JSON.stringify(dashboard, null, 2)
  );
  
  // Create CSV summary for dashboard
  createDashboardCSV(dashboard, outputDir);
}

function createDashboardCSV(dashboard, outputDir) {
  const csvHeaders = [
    'Track Title',
    'Streams',
    'Listeners',
    'Saves',
    'Release Date'
  ];
  
  const csvRows = dashboard.top_performing_tracks.map(track => [
    track.song || track.title || '',
    track.streams,
    track.listeners,
    track.saves,
    track.release_date
  ]);
  
  const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
  
  fs.writeFileSync(
    path.join(outputDir, 'top-tracks-summary.csv'),
    csvContent
  );
}

// Run the processor
if (require.main === module) {
  processAnalyticsData();
}

module.exports = { processAnalyticsData, processCSVFile, createAnalyticsDashboard };