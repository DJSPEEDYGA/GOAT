# Example: Updating Components to Use Real Supabase Data

## ✅ Your Setup is Complete!
- Supabase connected and working
- All database tables ready
- Helper functions available in `lib/supabase.js`

## 📝 Example 1: Update Dashboard with Real Data

Here's how to update the Dashboard section to show real earnings from your database:

### Current Code (Mock Data)
```javascript
// In components/GOATRoyaltyAppEnhanced.js - Dashboard section
const stats = {
  totalEarnings: "$847,392.50",
  pendingPayments: "$124,850.00",
  activeContracts: 23,
  totalTracks: 156
}
```

### Updated Code (Real Data)
```javascript
import { supabase, supabaseHelpers } from '../lib/supabase'
import { useEffect, useState } from 'react'

function Dashboard() {
  const [stats, setStats] = useState({
    totalEarnings: "$0.00",
    pendingPayments: "$0.00",
    activeContracts: 0,
    totalTracks: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Get current user (you'll need auth setup for this)
        const user = await supabaseHelpers.getCurrentUser()
        
        if (user) {
          // Get all royalties
          const royalties = await supabaseHelpers.getRoyalties(user.id)
          
          // Calculate total earnings
          const totalEarnings = royalties
            .filter(r => r.status === 'paid')
            .reduce((sum, r) => sum + parseFloat(r.amount), 0)
          
          // Calculate pending payments
          const pendingPayments = royalties
            .filter(r => r.status === 'pending')
            .reduce((sum, r) => sum + parseFloat(r.amount), 0)
          
          // Get contracts count
          const { data: contracts } = await supabase
            .from('contracts')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('status', 'active')
          
          // Get tracks count
          const { data: tracks } = await supabase
            .from('tracks')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
          
          setStats({
            totalEarnings: `$${totalEarnings.toFixed(2)}`,
            pendingPayments: `$${pendingPayments.toFixed(2)}`,
            activeContracts: contracts?.length || 0,
            totalTracks: tracks?.length || 0
          })
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboardData()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  return (
    <div>
      {/* Your existing dashboard UI with real stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Earnings" value={stats.totalEarnings} />
        <StatCard title="Pending Payments" value={stats.pendingPayments} />
        <StatCard title="Active Contracts" value={stats.activeContracts} />
        <StatCard title="Total Tracks" value={stats.totalTracks} />
      </div>
    </div>
  )
}
```

## 📝 Example 2: Update Music Studio with Real Tracks

### Current Code (Mock Data)
```javascript
const tracks = [
  { id: 1, title: "Summer Vibes", artist: "DJ Speedy", plays: 15420 },
  { id: 2, title: "Night Drive", artist: "DJ Speedy", plays: 8930 },
  // ... more mock tracks
]
```

### Updated Code (Real Data)
```javascript
import { supabaseHelpers } from '../lib/supabase'
import { useEffect, useState } from 'react'

function MusicStudio() {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTracks() {
      try {
        const user = await supabaseHelpers.getCurrentUser()
        if (user) {
          const userTracks = await supabaseHelpers.getTracks(user.id)
          setTracks(userTracks)
        }
      } catch (error) {
        console.error('Error loading tracks:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadTracks()
  }, [])

  // Function to add new track
  const handleAddTrack = async (trackData) => {
    try {
      const user = await supabaseHelpers.getCurrentUser()
      const newTrack = await supabaseHelpers.addTrack({
        ...trackData,
        user_id: user.id
      })
      setTracks([newTrack, ...tracks])
    } catch (error) {
      console.error('Error adding track:', error)
    }
  }

  if (loading) {
    return <div>Loading tracks...</div>
  }

  return (
    <div>
      {/* Your existing music studio UI */}
      {tracks.map(track => (
        <TrackItem key={track.id} track={track} />
      ))}
    </div>
  )
}
```

## 📝 Example 3: Add New Royalty Payment

```javascript
import { supabaseHelpers } from '../lib/supabase'

async function addRoyaltyPayment() {
  try {
    const user = await supabaseHelpers.getCurrentUser()
    
    const newRoyalty = await supabaseHelpers.addRoyalty({
      user_id: user.id,
      amount: 1250.50,
      source: 'Streaming',
      platform: 'Spotify',
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    })
    
    console.log('Royalty added:', newRoyalty)
  } catch (error) {
    console.error('Error adding royalty:', error)
  }
}
```

## 🔐 Adding Authentication (Required for User-Specific Data)

To make the app work with real user accounts, you need to add authentication:

### Step 1: Install Auth Helper
```bash
npm install @supabase/auth-helpers-nextjs
```

### Step 2: Create Auth Context
```javascript
// lib/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

### Step 3: Wrap Your App
```javascript
// pages/_app.js
import { AuthProvider } from '../lib/AuthContext'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}

export default MyApp
```

### Step 4: Create Login Page
```javascript
// pages/login.js
import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSignIn = async (e) => {
    e.preventDefault()
    const { error } = await signIn(email, password)
    if (!error) {
      router.push('/')
    } else {
      alert(error.message)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    const { error } = await signUp(email, password)
    if (!error) {
      alert('Check your email for confirmation link!')
    } else {
      alert(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
        <h1 className="text-2xl font-bold text-white mb-6">GOAT Royalty App</h1>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-700 text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-700 text-white"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSignIn}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Sign In
            </button>
            <button
              onClick={handleSignUp}
              className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

## 🎯 Priority Order for Updating Components

1. **Dashboard** (Most important - shows overview)
2. **Music Studio** (Core feature - track management)
3. **Tracking Dashboard** (Analytics data)
4. **IP Protection Vault** (Document storage)
5. **Contracts** (Legal agreements)
6. **Other components** (As needed)

## 💡 Tips

- Start with one component at a time
- Test each component after updating
- Keep mock data as fallback during development
- Use loading states for better UX
- Handle errors gracefully
- Enable Supabase real-time subscriptions for live updates

## 🆘 Common Issues

**"User not authenticated"**
- You need to implement authentication first
- Or use a test user ID for development

**"Permission denied"**
- Check Row Level Security (RLS) policies in Supabase
- Make sure user is logged in

**"Data not showing"**
- Check browser console for errors
- Verify data exists in Supabase Table Editor
- Test queries in Supabase SQL Editor

## 📚 Next Steps

1. Add authentication (login/signup)
2. Update Dashboard component
3. Update Music Studio component
4. Test with real data
5. Deploy to Vercel

---

Your app is now ready to use real data! Start with the Dashboard and work your way through each component.