/**
 * GOAT Royalty App - Music Royalty Management Platform
 * Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST. All rights reserved.
 * 
 * Created: December 19, 2024
 * Authors: HARVEY L MILLER JR, JUAQUIN J MALPHURS, KEVIN W HALLINGQUEST
 * Version: 1.0
 * License: All Rights Reserved
 * 
 * Description: Spotify API authentication and integration
 * 
 * This software is the proprietary property of HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST
 * and is protected by copyright laws and international copyright treaties.
 * Unauthorized use, reproduction, or distribution is strictly prohibited.
 */

import axios from 'axios';
import errorHandler from '../../../lib/errorHandling';
import securityManager from '../../../lib/security';

// Spotify API configuration
const SPOTIFY_CONFIG = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI || `${process.env.NEXT_PUBLIC_API_URL}/api/spotify/callback`,
  scopes: [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-read'
  ].join(' ')
};

// Generate Spotify authorization URL
function getAuthURL(state) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CONFIG.clientId,
    scope: SPOTIFY_CONFIG.scopes,
    redirect_uri: SPOTIFY_CONFIG.redirectUri,
    state: state
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Exchange authorization code for access token
async function exchangeCodeForToken(code) {
  try {
    const credentials = Buffer.from(`${SPOTIFY_CONFIG.clientId}:${SPOTIFY_CONFIG.clientSecret}`).toString('base64');
    
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_CONFIG.redirectUri
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      success: true,
      data: {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        scope: response.data.scope
      }
    };
  } catch (error) {
    return errorHandler.handleApiError(error, 'spotify_token_exchange', { code });
  }
}

// Refresh access token
async function refreshToken(refreshToken) {
  try {
    const credentials = Buffer.from(`${SPOTIFY_CONFIG.clientId}:${SPOTIFY_CONFIG.clientSecret}`).toString('base64');
    
    const response = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      success: true,
      data: {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        scope: response.data.scope
      }
    };
  } catch (error) {
    return errorHandler.handleApiError(error, 'spotify_token_refresh', { refreshToken: '[REDACTED]' });
  }
}

// Get user profile from Spotify
async function getUserProfile(accessToken) {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return {
      success: true,
      data: {
        id: response.data.id,
        displayName: response.data.display_name,
        email: response.data.email,
        country: response.data.country,
        followers: response.data.followers.total,
        product: response.data.product,
        images: response.data.images
      }
    };
  } catch (error) {
    return errorHandler.handleApiError(error, 'spotify_user_profile', { accessToken: '[REDACTED]' });
  }
}

// Get user's top tracks
async function getUserTopTracks(accessToken, timeRange = 'medium_term', limit = 50) {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/me/top/tracks`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        time_range: timeRange, // short_term, medium_term, long_term
        limit: limit,
        offset: 0
      }
    });

    return {
      success: true,
      data: response.data.items.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(artist => artist.name),
        album: track.album.name,
        duration: track.duration_ms,
        popularity: track.popularity,
        explicit: track.explicit,
        previewUrl: track.preview_url,
        images: track.album.images,
        externalUrls: track.external_urls,
        uri: track.uri
      }))
    };
  } catch (error) {
    return errorHandler.handleApiError(error, 'spotify_top_tracks', { accessToken: '[REDACTED]', timeRange, limit });
  }
}

// Get user's saved tracks
async function getUserSavedTracks(accessToken, limit = 50, offset = 0) {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/me/tracks`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        limit: limit,
        offset: offset
      }
    });

    return {
      success: true,
      data: {
        total: response.data.total,
        items: response.data.items.map(item => ({
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map(artist => artist.name),
          album: item.track.album.name,
          duration: item.track.duration_ms,
          popularity: item.track.popularity,
          addedAt: item.added_at,
          previewUrl: item.track.preview_url,
          images: item.track.album.images,
          externalUrls: item.track.external_urls,
          uri: item.track.uri
        }))
      }
    };
  } catch (error) {
    return errorHandler.handleApiError(error, 'spotify_saved_tracks', { accessToken: '[REDACTED]', limit, offset });
  }
}

// Get track audio features
async function getTrackAudioFeatures(accessToken, trackIds) {
  try {
    const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds;
    
    const response = await axios.get(`https://api.spotify.com/v1/audio-features`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        ids: ids
      }
    });

    return {
      success: true,
      data: response.data.audio_features.map(features => ({
        id: features.id,
        danceability: features.danceability,
        energy: features.energy,
        key: features.key,
        loudness: features.loudness,
        mode: features.mode,
        speechiness: features.speechiness,
        acousticness: features.acousticness,
        instrumentalness: features.instrumentalness,
        liveness: features.liveness,
        valence: features.valence,
        tempo: features.tempo,
        duration: features.duration_ms,
        timeSignature: features.time_signature
      }))
    };
  } catch (error) {
    return errorHandler.handleApiError(error, 'spotify_audio_features', { accessToken: '[REDACTED]', trackIds });
  }
}

// API handler for Spotify authentication initiation
export default async function handler(req, res) {
  // Rate limiting
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const rateLimitResult = securityManager.rateLimit(`spotify_auth_${clientIP}`, 10, 60000); // 10 requests per minute
  
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: rateLimitResult.retryAfter
    });
  }

  try {
    if (req.method === 'GET') {
      // Generate and return authorization URL
      const state = securityManager.generateCSRFToken(req.session?.sessionId || 'anonymous');
      const authURL = getAuthURL(state);

      res.status(200).json({
        success: true,
        data: {
          authURL,
          state
        }
      });
    } else if (req.method === 'POST') {
      // Exchange code for token
      const { code, state } = req.body;

      if (!code) {
        return res.status(400).json({
          error: 'Authorization code is required'
        });
      }

      // Validate CSRF token if provided
      if (state && req.session?.sessionId) {
        if (!securityManager.validateCSRFToken(req.session.sessionId, state)) {
          securityManager.logSecurityEvent('INVALID_CSRF_TOKEN', { endpoint: 'spotify_auth' });
          return res.status(403).json({
            error: 'Invalid state parameter'
          });
        }
      }

      // Exchange code for access token
      const tokenResult = await exchangeCodeForToken(code);

      if (tokenResult.success) {
        // Get user profile
        const profileResult = await getUserProfile(tokenResult.data.accessToken);

        if (profileResult.success) {
          res.status(200).json({
            success: true,
            data: {
              ...tokenResult.data,
              user: profileResult.data
            }
          });
        } else {
          res.status(400).json(profileResult);
        }
      } else {
        res.status(400).json(tokenResult);
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    errorHandler.logError(error, { endpoint: 'spotify_auth', method: req.method });
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

// Export utility functions for other API endpoints
export {
  getAuthURL,
  exchangeCodeForToken,
  refreshToken,
  getUserProfile,
  getUserTopTracks,
  getUserSavedTracks,
  getTrackAudioFeatures
};