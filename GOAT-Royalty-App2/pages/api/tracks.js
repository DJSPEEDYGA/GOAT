// Tracks API Endpoint
// Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST

import { withCors } from '../../lib/cors'
import fs from 'fs'
import path from 'path'

// Parse CSV catalog data as fallback
function loadCatalogTracks() {
  const tracks = [];
  const catalogFiles = [
    'WorksCatalog2 HARVEY L MILLER WRITERS.csv',
    'WorksCatalogFASTASSMAN PUBLISHING INC ASCAP.csv',
    'FASTASSMAN_MUSIC_CATALOG.csv'
  ];

  for (const file of catalogFiles) {
    try {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());
        const headers = lines[0] ? lines[0].split(',').map(h => h.trim().replace(/"/g, '')) : [];
        
        for (let i = 1; i < Math.min(lines.length, 50); i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const track = {};
          headers.forEach((h, idx) => {
            track[h] = values[idx] || '';
          });
          track._source = file.includes('HARVEY') ? 'Harvey L Miller' : 'FASTASSMAN Publishing';
          tracks.push(track);
        }
      }
    } catch (err) {
      console.warn(`Could not load ${file}:`, err.message);
    }
  }

  return tracks;
}

// Sample tracks for demo
const sampleTracks = [
  { id: 1, title: "Trap Symphony", artist: "DJ Speedy", genre: "Hip-Hop/Trap", bpm: 140, key: "C Minor", streams: 2450000, revenue: "$14,700", status: "Published", platform: "All Platforms" },
  { id: 2, title: "Southern Anthem", artist: "DJ Speedy ft. Gucci Mane", genre: "Southern Hip-Hop", bpm: 128, key: "G Minor", streams: 5800000, revenue: "$34,800", status: "Published", platform: "Spotify, Apple Music" },
  { id: 3, title: "ATL Nights", artist: "DJ Speedy", genre: "R&B/Hip-Hop", bpm: 95, key: "Eb Major", streams: 1200000, revenue: "$7,200", status: "Published", platform: "All Platforms" },
  { id: 4, title: "Crown Royal", artist: "DJ Speedy ft. Waka Flocka", genre: "Trap", bpm: 145, key: "A Minor", streams: 3400000, revenue: "$20,400", status: "Published", platform: "Spotify, YouTube" },
  { id: 5, title: "Empire State of Grind", artist: "DJ Speedy", genre: "Hip-Hop", bpm: 110, key: "D Minor", streams: 890000, revenue: "$5,340", status: "Published", platform: "All Platforms" },
  { id: 6, title: "Midnight Hustle", artist: "DJ Speedy", genre: "Trap/R&B", bpm: 132, key: "F Minor", streams: 1750000, revenue: "$10,500", status: "Published", platform: "Apple Music, Tidal" },
  { id: 7, title: "GOAT Mode", artist: "DJ Speedy", genre: "Trap", bpm: 150, key: "Bb Minor", streams: 4200000, revenue: "$25,200", status: "Published", platform: "All Platforms" },
  { id: 8, title: "Royalty Flow", artist: "DJ Speedy ft. Outkast", genre: "Southern Hip-Hop", bpm: 98, key: "Ab Major", streams: 8900000, revenue: "$53,400", status: "Published", platform: "All Platforms" },
  { id: 9, title: "Diamond Dreams", artist: "DJ Speedy", genre: "R&B", bpm: 88, key: "C Major", streams: 670000, revenue: "$4,020", status: "Draft", platform: "Pending" },
  { id: 10, title: "Fastassman Anthem", artist: "FASTASSMAN", genre: "Hip-Hop", bpm: 136, key: "E Minor", streams: 3100000, revenue: "$18,600", status: "Published", platform: "All Platforms" }
];

async function tracksHandler(req, res) {
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { source, limit, search } = req.query;
        
        let tracks = [...sampleTracks];
        
        // Try to load catalog data
        const catalogTracks = loadCatalogTracks();
        
        // Filter by search
        if (search) {
          const q = search.toLowerCase();
          tracks = tracks.filter(t => 
            t.title.toLowerCase().includes(q) || 
            t.artist.toLowerCase().includes(q) ||
            t.genre.toLowerCase().includes(q)
          );
        }

        // Limit results
        const maxResults = parseInt(limit) || 50;
        tracks = tracks.slice(0, maxResults);

        return res.status(200).json({
          success: true,
          tracks,
          catalogCount: catalogTracks.length,
          totalInCatalog: 3650,
          stats: {
            totalTracks: 3650,
            publishedTracks: sampleTracks.filter(t => t.status === 'Published').length,
            draftTracks: sampleTracks.filter(t => t.status === 'Draft').length,
            totalStreams: sampleTracks.reduce((sum, t) => sum + t.streams, 0),
            totalRevenue: '$194,160'
          }
        });
      }

      case 'POST': {
        const { trackData } = req.body;
        if (!trackData || !trackData.title) {
          return res.status(400).json({ error: 'Track title is required' });
        }
        const newTrack = {
          id: Date.now(),
          ...trackData,
          streams: 0,
          revenue: '$0',
          status: 'Draft',
          createdAt: new Date().toISOString()
        };
        return res.status(201).json({ success: true, track: newTrack });
      }

      case 'PUT': {
        const { trackId, updateData } = req.body;
        if (!trackId) {
          return res.status(400).json({ error: 'Track ID is required' });
        }
        return res.status(200).json({ 
          success: true, 
          track: { id: trackId, ...updateData, updatedAt: new Date().toISOString() }
        });
      }

      case 'DELETE': {
        const { trackId: deleteTrackId } = req.body;
        if (!deleteTrackId) {
          return res.status(400).json({ error: 'Track ID is required' });
        }
        return res.status(200).json({ success: true, message: 'Track deleted successfully' });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Tracks API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export default withCors(tracksHandler);