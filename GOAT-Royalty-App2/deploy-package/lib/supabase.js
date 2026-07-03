// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using demo mode.')
}

export const supabase = createClient(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseAnonKey || 'demo-key'
)

// Helper functions for common operations
export const supabaseHelpers = {
  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Get user's royalties
  async getRoyalties(userId) {
    const { data, error } = await supabase
      .from('royalties')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get user's tracks
  async getTracks(userId) {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get user's contracts
  async getContracts(userId) {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get analytics data
  async getAnalytics(userId) {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30)
    
    if (error) throw error
    return data
  },

  // Add new royalty
  async addRoyalty(royaltyData) {
    const { data, error } = await supabase
      .from('royalties')
      .insert([royaltyData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Add new track
  async addTrack(trackData) {
    const { data, error } = await supabase
      .from('tracks')
      .insert([trackData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Update track
  async updateTrack(trackId, updates) {
    const { data, error } = await supabase
      .from('tracks')
      .update(updates)
      .eq('id', trackId)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Delete track
  async deleteTrack(trackId) {
    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', trackId)
    
    if (error) throw error
    return true
  }
}