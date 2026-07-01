// GOAT Royalty App - Local Database Interface (Mock Supabase)
// Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST

import { createClient } from './auth';

// Create local client instead of Supabase
const supabase = createClient();

// Local data storage
const localData = {
  tracks: [
    {
      id: 'track1',
      title: 'GOAT Anthem',
      artist: 'Harvey Miller DJ Speedy',
      user_id: 'demo-user',
      created_at: new Date().toISOString(),
      streams: 458239,
      revenue: 3421.50
    },
    {
      id: 'track2',
      title: 'Royalty Flow',
      artist: 'Harvey Miller DJ Speedy',
      user_id: 'demo-user',
      created_at: new Date().toISOString(),
      streams: 342156,
      revenue: 2851.75
    }
  ],
  royalties: [
    {
      id: 'royalty1',
      track_id: 'track1',
      amount: 3421.50,
      status: 'Collected',
      date: new Date().toISOString()
    }
  ],
  profiles: [
    {
      id: 'demo-user',
      name: 'Harvey Miller DJ Speedy',
      email: 'harvey@goatroyaltyapp.com',
      role: 'artist',
      created_at: new Date().toISOString()
    }
  ]
};

// Supabase helpers using local data
export const supabaseHelpers = {
  // Get user tracks
  async getUserTracks(userId) {
    return localData.tracks.filter(track => track.user_id === userId);
  },

  // Get user royalties
  async getUserRoyalties(userId) {
    return localData.royalties.filter(royalty => 
      localData.tracks.find(track => 
        track.id === royalty.track_id && track.user_id === userId
      )
    );
  },

  // Get user profile
  async getUserProfile(userId) {
    return localData.profiles.find(profile => profile.id === userId);
  },

  // Save track data
  async saveTrack(trackData) {
    const newTrack = {
      id: `track_${Date.now()}`,
      ...trackData,
      created_at: new Date().toISOString()
    };
    localData.tracks.push(newTrack);
    return newTrack;
  },

  // Update track data
  async updateTrack(trackId, updates) {
    const index = localData.tracks.findIndex(track => track.id === trackId);
    if (index !== -1) {
      localData.tracks[index] = { ...localData.tracks[index], ...updates };
      return localData.tracks[index];
    }
    return null;
  },

  // Delete track
  async deleteTrack(trackId) {
    const index = localData.tracks.findIndex(track => track.id === trackId);
    if (index !== -1) {
      const deleted = localData.tracks[index];
      localData.tracks.splice(index, 1);
      return deleted;
    }
    return null;
  }
};

// Export supabase client and helpers
export { supabase };
export default supabase;