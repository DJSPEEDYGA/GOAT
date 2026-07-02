/**
 * GOAT Royalty App - Search API
 * Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST. All rights reserved.
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ 
        error: 'Search query is required',
        results: []
      });
    }

    // Demo data for Harvey Miller's catalog
    const demoCatalog = [
      {
        id: 'track1',
        title: 'GOAT Anthem',
        artist: 'Harvey Miller DJ Speedy',
        isrc: 'USTC12345678',
        duration: '3:45',
        genre: 'Hip-Hop',
        streams: 458239,
        revenue: 3421.50,
        releaseDate: '2024-01-15',
        platforms: ['Spotify', 'Apple Music', 'YouTube'],
        royaltyStatus: 'Collected',
        lastClaim: '2024-11-01'
      },
      {
        id: 'track2',
        title: 'Royalty Flow',
        artist: 'Harvey Miller DJ Speedy',
        isrc: 'USTC12345679',
        duration: '4:12',
        genre: 'Hip-Hop',
        streams: 342156,
        revenue: 2851.75,
        releaseDate: '2024-02-20',
        platforms: ['Spotify', 'Apple Music'],
        royaltyStatus: 'Pending',
        lastClaim: '2024-10-28'
      },
      {
        id: 'track3',
        title: 'Million Dreams',
        artist: 'Harvey Miller DJ Speedy',
        isrc: 'USTC12345680',
        duration: '3:58',
        genre: 'R&B',
        streams: 298456,
        revenue: 2234.25,
        releaseDate: '2024-03-10',
        platforms: ['Spotify', 'Apple Music', 'Tidal'],
        royaltyStatus: 'Collected',
        lastClaim: '2024-11-01'
      },
      {
        id: 'track4',
        title: 'Atlanta Nights',
        artist: 'DJ Speedy',
        isrc: 'USTC12345681',
        duration: '3:32',
        genre: 'Electronic',
        streams: 156789,
        revenue: 1175.92,
        releaseDate: '2024-04-05',
        platforms: ['Spotify', 'SoundCloud'],
        royaltyStatus: 'Processing',
        lastClaim: '2024-10-30'
      }
    ];

    // Search logic
    const searchQuery = q.toLowerCase().trim();
    const results = demoCatalog.filter(track => 
      track.title.toLowerCase().includes(searchQuery) ||
      track.artist.toLowerCase().includes(searchQuery) ||
      track.isrc.toLowerCase().includes(searchQuery) ||
      track.genre.toLowerCase().includes(searchQuery)
    );

    // Add search metadata
    const searchResults = {
      query: q,
      totalResults: results.length,
      searchTime: Date.now(),
      results: results.map(track => ({
        ...track,
        matchScore: calculateMatchScore(track, searchQuery)
      })),
      suggestions: generateSuggestions(searchQuery, demoCatalog)
    };

    // Log search for analytics
    console.log(`Search performed: "${q}" - ${results.length} results found`);

    return res.status(200).json(searchResults);

  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({ 
      error: 'Search failed',
      message: error.message,
      results: []
    });
  }
}

// Calculate match score for relevance
function calculateMatchScore(track, query) {
  let score = 0;
  
  if (track.title.toLowerCase().includes(query)) score += 50;
  if (track.artist.toLowerCase().includes(query)) score += 30;
  if (track.isrc.toLowerCase().includes(query)) score += 20;
  if (track.genre.toLowerCase().includes(query)) score += 10;
  
  return score;
}

// Generate search suggestions
function generateSuggestions(query, catalog) {
  const allTitles = catalog.map(t => t.title);
  const allArtists = [...new Set(catalog.map(t => t.artist))];
  
  return [
    ...allTitles.filter(t => t.toLowerCase().includes(query) && t.toLowerCase() !== query).slice(0, 2),
    ...allArtists.filter(a => a.toLowerCase().includes(query) && a.toLowerCase() !== query).slice(0, 2)
  ].slice(0, 3);
}