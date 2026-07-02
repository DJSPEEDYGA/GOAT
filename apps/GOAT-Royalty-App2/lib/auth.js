// GOAT Royalty App - Local Authentication
// Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST

// Local user session management
let currentUser = {
  id: 'demo-user',
  name: 'Harvey Miller DJ Speedy',
  email: 'harvey@goatroyaltyapp.com',
  role: 'artist',
  avatar: 'https://via.placeholder.com/100'
};

// Create local auth client (mock Supabase)
export function createClient() {
  return {
    auth: {
      signInWithOAuth: () => Promise.resolve({ data: { user: currentUser } }),
      signInWithPassword: () => Promise.resolve({ data: { user: currentUser } }),
      signUp: () => Promise.resolve({ data: { user: currentUser } }),
      signOut: () => {
        return Promise.resolve({ error: null });
      },
      getUser: () => Promise.resolve({ data: { user: currentUser } }),
      getSession: () => Promise.resolve({ data: { session: { user: currentUser } } }),
      resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
      updateUser: () => Promise.resolve({ data: { user: currentUser }, error: null }),
      onAuthStateChange: (callback) => {
        setTimeout(() => callback('SIGNED_IN', currentUser), 100);
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from: (table) => ({
      select: () => ({
        eq: () => ({
          data: mockData[table] || [],
          error: null
        }),
        single: () => ({
          data: mockData[table]?.[0] || null,
          error: null
        })
      }),
      insert: (data) => ({
        data: { ...data, id: Date.now() },
        error: null
      }),
      update: () => ({
        data: { id: 'demo-user', updated_at: new Date().toISOString() },
        error: null
      }),
      delete: () => ({
        data: null,
        error: null
      })
    })
  };
}

// Mock data for local development
const mockData = {
  users: [currentUser],
  profiles: [currentUser],
  tracks: [
    {
      id: 'track1',
      title: 'GOAT Anthem',
      artist: 'Harvey Miller DJ Speedy',
      user_id: 'demo-user'
    }
  ]
};

// Auth helper functions
export const auth = {
  // Sign up new user
  async signUp(email, password, metadata = {}) {
    return { 
      data: { 
        user: { 
          ...currentUser, 
          email, 
          ...metadata 
        } 
      }, 
      error: null 
    };
  },

  // Sign in existing user
  async signIn(email, password) {
    return { 
      data: { 
        user: { 
          ...currentUser, 
          email 
        } 
      }, 
      error: null 
    };
  },

  // Sign out
  async signOut() {
    return { error: null };
  },

  // Get current user
  async getUser() {
    return { user: currentUser, error: null };
  },

  // Get session
  async getSession() {
    return { 
      session: { 
        user: currentUser,
        access_token: 'demo-token',
        expires_at: Date.now() + 3600000
      }, 
      error: null 
    };
  },

  // Reset password
  async resetPassword(email) {
    return { data: {}, error: null };
  },

  // Update user
  async updateUser(updates) {
    currentUser = { ...currentUser, ...updates };
    return { data: { user: currentUser }, error: null };
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    setTimeout(() => callback('SIGNED_IN', currentUser), 100);
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
};

export { currentUser };