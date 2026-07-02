/**
 * GOAT Royalty App - Music Royalty Management Platform
 * Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST. All rights reserved.
 * 
 * Created: December 19, 2024
 * Authors: HARVEY L MILLER JR, JUAQUIN J MALPHURS, KEVIN W HALLINGQUEST
 * Version: 1.0
 * License: All Rights Reserved
 * 
 * Description: Spotify analytics and royalty calculation API
 * 
 * This software is the proprietary property of HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST
 * and is protected by copyright laws and international copyright treaties.
 * Unauthorized use, reproduction, or distribution is strictly prohibited.
 */

import axios from 'axios';
import errorHandler from '../../../lib/errorHandling';
import securityManager from '../../../lib/security';
import { refreshToken, getUserTopTracks, getUserSavedTracks, getTrackAudioFeatures } from './auth';

// Spotify royalty calculation rates (approximate, varies by country and label)
const ROYALTY_RATES = {
  streaming: {
    free: 0.0003,    // ~$0.0003 per stream for free tier
    premium: 0.0043   // ~$0.0043 per stream for premium tier
  },
  countries: {
    US: 0.0038,
    UK: 0.0045,
    DE: 0.0041,
    FR: 0.0039,
    CA: 0.0037,
    AU: 0.0035,
    default: 0.0030
  }
};

// Calculate estimated royalties based on streaming data
function calculateRoyalties(streamingData, userCountry = 'US') {
  const countryRate = ROYALTY_RATES.countries[userCountry] || ROYALTY_RATES.countries.default;
  
  const calculations = {
    totalStreams: 0,
    estimatedRoyalties: 0,
    breakdown: {
      freeStreams: 0,
      premiumStreams: 0,
      freeRoyalties: 0,
      premiumRoyalties: 0
    },
    monthlyProjection: 0,
    yearlyProjection: 0
  };

  // Simulate streaming data (in real app, this would come from Spotify's streaming API)
  streamingData.forEach(track => {
    // Simulate stream counts based on track popularity
    const streamEstimate = Math.floor(track.popularity * 10); // Simplified estimation
    const freeStreams = Math.floor(streamEstimate * 0.3); // 30% from free tier
    const premiumStreams = streamEstimate - freeStreams;

    const freeRoyalties = freeStreams * ROYALTY_RATES.streaming.free;
    const premiumRoyalties = premiumStreams * ROYALTY_RATES.streaming.premium;

    calculations.totalStreams += streamEstimate;
    calculations.breakdown.freeStreams += freeStreams;
    calculations.breakdown.premiumStreams += premiumStreams;
    calculations.breakdown.freeRoyalties += freeRoyalties;
    calculations.breakdown.premiumRoyalties += premiumRoyalties;
    calculations.estimatedRoyalties += freeRoyalties + premiumRoyalties;
  });

  // Calculate projections
  calculations.monthlyProjection = calculations.estimatedRoyalties * 4; // Assume data is for 1 week
  calculations.yearlyProjection = calculations.estimatedRoyalties * 52;

  return calculations;
}

// Get user's streaming analytics
async function getStreamingAnalytics(accessToken, timeRange = 'medium_term') {
  try {
    // Get user's top tracks
    const topTracksResult = await getUserTopTracks(accessToken, timeRange, 50);
    if (!topTracksResult.success) {
      return topTracksResult;
    }

    // Get audio features for analytics
    const trackIds = topTracksResult.data.map(track => track.id);
    const audioFeaturesResult = await getTrackAudioFeatures(accessToken, trackIds);
    
    // Combine track data with audio features
    const enhancedTracks = topTracksResult.data.map((track, index) => ({
      ...track,
      audioFeatures: audioFeaturesResult.success ? audioFeaturesResult.data[index] || null : null
    }));

    // Calculate analytics
    const analytics = {
      tracks: enhancedTracks,
      summary: {
        totalTracks: enhancedTracks.length,
        averagePopularity: enhancedTracks.reduce((sum, track) => sum + track.popularity, 0) / enhancedTracks.length,
        averageDuration: enhancedTracks.reduce((sum, track) => sum + track.duration, 0) / enhancedTracks.length,
        genres: calculateGenreDistribution(enhancedTracks),
        audioAnalysis: calculateAudioAnalysis(enhancedTracks)
      },
      royaltyCalculations: calculateRoyalties(enhancedTracks)
    };

    return {
      success: true,
      data: analytics
    };
  } catch (error) {
    return errorHandler.handleApiError(error, 'spotify_streaming_analytics', { accessToken: '[REDACTED]', timeRange });
  }
}

// Calculate genre distribution (simplified based on audio features)
function calculateGenreDistribution(tracks) {
  const genres = {
    'Electronic': 0,
    'Pop': 0,
    'Rock': 0,
    'Hip-Hop': 0,
    'Jazz': 0,
    'Classical': 0,
    'Other': 0
  };

  tracks.forEach(track => {
    if (!track.audioFeatures) {
      genres.Other++;
      return;
    }

    const features = track.audioFeatures;
    let genre = 'Other';

    // Simple genre classification based on audio features
    if (features.danceability > 0.8 && features.energy > 0.7) {
      genre = 'Electronic';
    } else if (features.danceability > 0.7 && features.valence > 0.6) {
      genre = 'Pop';
    } else if (features.energy > 0.8 && features.loudness > -5) {
      genre = 'Rock';
    } else if (features.speechiness > 0.3 && features.danceability > 0.6) {
      genre = 'Hip-Hop';
    } else if (features.acousticness > 0.7 && features.instrumentalness > 0.5) {
      genre = 'Jazz';
    } else if (features.acousticness > 0.8 && features.instrumentalness > 0.8) {
      genre = 'Classical';
    }

    genres[genre]++;
  });

  // Convert to percentages
  const total = tracks.length;
  Object.keys(genres).forEach(genre => {
    genres[genre] = Math.round((genres[genre] / total) * 100);
  });

  return genres;
}

// Calculate audio analysis summary
function calculateAudioAnalysis(tracks) {
  const validTracks = tracks.filter(track => track.audioFeatures);
  
  if (validTracks.length === 0) {
    return null;
  }

  const analysis = {
    danceability: {
      average: validTracks.reduce((sum, track) => sum + track.audioFeatures.danceability, 0) / validTracks.length,
      min: Math.min(...validTracks.map(track => track.audioFeatures.danceability)),
      max: Math.max(...validTracks.map(track => track.audioFeatures.danceability))
    },
    energy: {
      average: validTracks.reduce((sum, track) => sum + track.audioFeatures.energy, 0) / validTracks.length,
      min: Math.min(...validTracks.map(track => track.audioFeatures.energy)),
      max: Math.max(...validTracks.map(track => track.audioFeatures.energy))
    },
    valence: {
      average: validTracks.reduce((sum, track) => sum + track.audioFeatures.valence, 0) / validTracks.length,
      min: Math.min(...validTracks.map(track => track.audioFeatures.valence)),
      max: Math.max(...validTracks.map(track => track.audioFeatures.valence))
    },
    tempo: {
      average: Math.round(validTracks.reduce((sum, track) => sum + track.audioFeatures.tempo, 0) / validTracks.length),
      min: Math.min(...validTracks.map(track => track.audioFeatures.tempo)),
      max: Math.max(...validTracks.map(track => track.audioFeatures.tempo))
    }
  };

  // Add mood classification
  analysis.moodClassification = classifyMood(analysis);

  return analysis;
}

// Classify mood based on audio features
function classifyMood(analysis) {
  const { valence, energy, danceability } = analysis;
  
  const avgValence = valence.average;
  const avgEnergy = energy.average;
  const avgDanceability = danceability.average;

  let mood = 'Neutral';
  
  if (avgValence > 0.7 && avgEnergy > 0.7 && avgDanceability > 0.7) {
    mood = 'Upbeat & Energetic';
  } else if (avgValence > 0.6 && avgEnergy < 0.4) {
    mood = 'Happy & Relaxed';
  } else if (avgValence < 0.4 && avgEnergy < 0.4) {
    mood = 'Melancholic';
  } else if (avgValence < 0.4 && avgEnergy > 0.7) {
    mood = 'Aggressive';
  } else if (avgEnergy > 0.6 && avgDanceability > 0.6) {
    mood = 'Dance-oriented';
  } else if (avgAcousticness > 0.6) {
    mood = 'Acoustic & Intimate';
  }

  return mood;
}

// Get detailed royalty breakdown
function getDetailedRoyaltyBreakdown(royaltyCalculations) {
  const breakdown = {
    totalRoyalties: royaltyCalculations.estimatedRoyalties,
    streamingBreakdown: royaltyCalculations.breakdown,
    projections: {
      monthly: royaltyCalculations.monthlyProjection,
      yearly: royaltyCalculations.yearlyProjection
    },
    performanceMetrics: {
      royaltyPerStream: royaltyCalculations.estimatedRoyalties / royaltyCalculations.totalStreams,
      averageStreamValue: calculateAverageStreamValue(royaltyCalculations),
      topPerformingStreams: getTopPerformingStreams(royaltyCalculations)
    }
  };

  return breakdown;
}

// Calculate average stream value
function calculateAverageStreamValue(calculations) {
  const totalRoyalties = calculations.breakdown.freeRoyalties + calculations.breakdown.premiumRoyalties;
  const totalStreams = calculations.breakdown.freeStreams + calculations.breakdown.premiumStreams;
  
  return totalStreams > 0 ? totalRoyalties / totalStreams : 0;
}

// Get top performing streams (simplified)
function getTopPerformingStreams(calculations) {
  return {
    freeTier: {
      streams: calculations.breakdown.freeStreams,
      royalties: calculations.breakdown.freeRoyalties,
      averageValue: calculations.breakdown.freeRoyalties / calculations.breakdown.freeStreams
    },
    premiumTier: {
      streams: calculations.breakdown.premiumStreams,
      royalties: calculations.breakdown.premiumRoyalties,
      averageValue: calculations.breakdown.premiumRoyalties / calculations.breakdown.premiumStreams
    }
  };
}

// API handler for Spotify analytics
export default async function handler(req, res) {
  // Rate limiting
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const rateLimitResult = securityManager.rateLimit(`spotify_analytics_${clientIP}`, 20, 60000); // 20 requests per minute
  
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: rateLimitResult.retryAfter
    });
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed'
      });
    }

    const { accessToken, timeRange = 'medium_term', userCountry = 'US' } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        error: 'Access token is required'
      });
    }

    // Get streaming analytics
    const analyticsResult = await getStreamingAnalytics(accessToken, timeRange);

    if (analyticsResult.success) {
      // Add detailed royalty breakdown
      analyticsResult.data.detailedRoyalties = getDetailedRoyaltyBreakdown(analyticsResult.data.royaltyCalculations);

      res.status(200).json({
        success: true,
        data: analyticsResult.data
      });
    } else {
      res.status(400).json(analyticsResult);
    }
  } catch (error) {
    errorHandler.logError(error, { endpoint: 'spotify_analytics', method: req.method });
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

// Export utility functions
export {
  calculateRoyalties,
  getStreamingAnalytics,
  getDetailedRoyaltyBreakdown
};