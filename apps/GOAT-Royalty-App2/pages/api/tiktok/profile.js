/**
 * 🐐 GOAT Royalty App — TikTok Profile API (tikapi)
 * Fetches TikTok user profiles, videos, search, trending via tikapi SDK
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */

import { getUserProfile, getUserVideos, getTrending, searchUsers, searchVideos, getHashtagInfo } from '../../../lib/tiktok/tikapi-service.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, username, secUid, query, hashtag, cursor } = req.method === 'GET' ? req.query : req.body;
    const apiKey = req.headers['x-tikapi-key'] || process.env.TIKAPI_KEY || null;

    let result;

    switch (action || 'profile') {
      case 'profile':
        // Get user profile
        if (!username) {
          return res.status(400).json({ error: 'Username is required', usage: '/api/tiktok/profile?action=profile&username=djspeedy' });
        }
        result = await getUserProfile(username, apiKey);
        break;

      case 'videos':
        // Get user videos (needs secUid from profile lookup)
        if (!secUid) {
          return res.status(400).json({ error: 'secUid is required. First fetch profile to get secUid.', usage: '/api/tiktok/profile?action=videos&secUid=xxx' });
        }
        result = await getUserVideos(secUid, cursor || '', apiKey);
        break;

      case 'trending':
        // Get trending feed
        result = await getTrending(apiKey);
        break;

      case 'search-users':
        // Search for users
        if (!query) {
          return res.status(400).json({ error: 'Query is required', usage: '/api/tiktok/profile?action=search-users&query=dj+speedy' });
        }
        result = await searchUsers(query, cursor || '', apiKey);
        break;

      case 'search-videos':
        // Search for videos
        if (!query) {
          return res.status(400).json({ error: 'Query is required', usage: '/api/tiktok/profile?action=search-videos&query=goat+force' });
        }
        result = await searchVideos(query, cursor || '', apiKey);
        break;

      case 'hashtag':
        // Get hashtag info
        if (!hashtag) {
          return res.status(400).json({ error: 'Hashtag is required', usage: '/api/tiktok/profile?action=hashtag&hashtag=goatforce' });
        }
        result = await getHashtagInfo(hashtag, apiKey);
        break;

      default:
        return res.status(400).json({
          error: 'Invalid action',
          validActions: ['profile', 'videos', 'trending', 'search-users', 'search-videos', 'hashtag'],
          examples: {
            profile: '/api/tiktok/profile?action=profile&username=djspeedy',
            videos: '/api/tiktok/profile?action=videos&secUid=xxx',
            trending: '/api/tiktok/profile?action=trending',
            searchUsers: '/api/tiktok/profile?action=search-users&query=goat+force',
            searchVideos: '/api/tiktok/profile?action=search-videos&query=atlanta+trap',
            hashtag: '/api/tiktok/profile?action=hashtag&hashtag=goatforce',
          }
        });
    }

    return res.status(200).json({
      success: true,
      action: action || 'profile',
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('TikTok Profile API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch TikTok data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}