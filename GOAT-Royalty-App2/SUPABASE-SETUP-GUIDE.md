# Supabase Setup Guide for GOAT Royalty App

## ✅ What's Already Done

1. ✅ Supabase client installed (`@supabase/supabase-js`)
2. ✅ Configuration file created (`lib/supabase.js`)
3. ✅ Environment variables template created (`.env.local`)
4. ✅ Database backup restored (you completed this)

## 🔧 What You Need to Do Now

### Step 1: Add Your Supabase Credentials

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (goat-royalty-app or GOAT-Force)
3. Go to **Project Settings** → **API**
4. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

5. Open `.env.local` file in your GOAT-Royalty-App2 folder
6. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Verify Database Tables

Make sure your restored database has these tables:
- `royalties` - Payment and earnings data
- `tracks` - Music catalog
- `contracts` - Legal agreements
- `analytics` - Performance metrics
- `copyrights` - IP protection records

If any tables are missing, run the SQL scripts in Supabase SQL Editor.

### Step 3: Test the Connection

1. Start your app:
```bash
cd GOAT-Royalty-App2
npm run dev
```

2. Open http://localhost:3000
3. Check browser console for any Supabase connection errors

### Step 4: Update Components to Use Real Data

Now you need to update each component to fetch real data from Supabase instead of using mock data.

## 📝 Example: Update Dashboard Component

Here's how to update the Dashboard to use real Supabase data:

```javascript
// In components/GOATRoyaltyAppEnhanced.js or pages/index.js
import { supabase, supabaseHelpers } from '../lib/supabase'
import { useEffect, useState } from 'react'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const user = await supabaseHelpers.getCurrentUser()
        if (user) {
          const royalties = await supabaseHelpers.getRoyalties(user.id)
          
          // Calculate stats from real data
          const totalEarnings = royalties.reduce((sum, r) => sum + r.amount, 0)
          const pendingPayments = royalties
            .filter(r => r.status === 'pending')
            .reduce((sum, r) => sum + r.amount, 0)
          
          setStats({
            totalEarnings: `$${totalEarnings.toFixed(2)}`,
            pendingPayments: `$${pendingPayments.toFixed(2)}`,
            // ... more stats
          })
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {/* Display real stats */}
      <h2>Total Earnings: {stats?.totalEarnings}</h2>
      {/* ... rest of dashboard */}
    </div>
  )
}
```

## 🔐 Add Authentication (Optional but Recommended)

To add user login/signup:

1. Install NextAuth.js:
```bash
npm install next-auth @supabase/auth-helpers-nextjs
```

2. Create authentication pages
3. Protect routes that require login

## 📊 Database Schema Reference

### Royalties Table
```sql
CREATE TABLE royalties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2),
  source TEXT,
  date DATE,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tracks Table
```sql
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  artist TEXT,
  duration INTEGER,
  plays INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Contracts Table
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  party_name TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Analytics Table
```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  platform TEXT,
  metric_type TEXT,
  value INTEGER,
  date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Next Steps

1. **Add your Supabase credentials** to `.env.local`
2. **Test the connection** by running the app
3. **Update one component at a time** to use real data
4. **Add authentication** for user login
5. **Deploy to Vercel** when ready

## 💡 Tips

- Start with the Dashboard component first
- Test each component after updating it
- Keep the mock data as fallback for development
- Use Supabase's real-time features for live updates
- Enable Row Level Security (RLS) in Supabase for data protection

## 🆘 Troubleshooting

**"Invalid API key"**
- Check that you copied the correct anon key from Supabase dashboard
- Make sure there are no extra spaces in `.env.local`

**"Table does not exist"**
- Verify your database backup was restored correctly
- Check table names in Supabase Table Editor

**"User not authenticated"**
- You need to implement authentication first
- Or use a test user ID for development

## 📚 Resources

- Supabase Docs: https://supabase.com/docs
- Next.js + Supabase: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase Auth: https://supabase.com/docs/guides/auth

---

Need help? Let me know which component you want to update first!