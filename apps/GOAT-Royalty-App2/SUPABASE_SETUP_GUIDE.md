# Supabase Setup Guide for GOAT Royalty App

## 🚀 Quick Setup Instructions

To fix your Supabase integration and connect your GOAT Royalty App to a real database, follow these steps:

### Step 1: Create/Access Your Supabase Project

1. **Go to Supabase Dashboard:** https://supabase.com/dashboard
2. **Sign in** with your account or create a new one
3. **Create a new project** or select an existing one
4. **Note your project URL** (it looks like: `https://your-project-ref.supabase.co`)

### Step 2: Get Your API Keys

1. In your Supabase project, go to **Settings** → **API Keys**
2. **Copy the Project URL** 
3. **Copy the "anon public" key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)
4. **Copy the "service_role" key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

### Step 3: Update Environment Variables

Edit the `.env.local` file in your GOAT Royalty App root directory:

```bash
# Replace these with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

### Step 4: Set Up Database Tables

1. **Go to SQL Editor:** In your Supabase project, click **SQL Editor** in the left sidebar
2. **Create a new query**
3. **Copy and paste** the contents of `SQL-SCRIPTS.sql` from your project
4. **Click "Run"** to create all required tables

### Step 5: Enable Row Level Security (RLS)

1. **Go to Authentication** → **Policies** in your Supabase project
2. **Enable RLS** on all tables (tracks, royalties, profiles, etc.)
3. **Add policies** to allow users to access their own data

### Step 6: Test the Connection

1. **Run the test script:**
   ```bash
   node test-supabase-connection.js
   ```

2. **Expected output:**
   ```
   🔍 Testing Supabase Connection...
   
   Project URL: https://your-project-ref.supabase.co
   API Key: ✅ Found
   
   📡 Connecting to Supabase...
   ✅ Connection successful!
   ✅ Database tables found!
   ```

### Step 7: Start Your Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your app:** http://localhost:3000

3. **Test functionality:**
   - User registration/login
   - Track creation
   - Royalty tracking
   - Analytics dashboard

---

## 🔧 Alternative: Use Existing Project

If you already have a Supabase project with the reference `xmvlnonsxmrpvlssjstl`:

1. **Check if the project is active** (not paused)
2. **Verify the API keys** are correct
3. **Run the SQL scripts** to create tables
4. **Update the .env.local** with the correct keys

---

## 🛠️ Troubleshooting

### Common Issues:

1. **"Project not found" error**
   - Check your project URL is correct
   - Ensure the project is active (not paused)

2. **"Invalid API key" error**
   - Verify you're using the correct keys
   - Make sure you're using the "anon" key for client-side operations

3. **"Tables not found" error**
   - Run the SQL-SCRIPTS.sql in Supabase SQL Editor
   - Check that all tables were created successfully

4. **"Permission denied" errors**
   - Enable Row Level Security (RLS)
   - Create appropriate policies for user access

### Get Help:

- **Supabase Docs:** https://supabase.com/docs
- **Support:** https://supabase.com/support
- **Community:** https://github.com/supabase/supabase/discussions

---

## 📋 Required Tables

The following tables will be created by `SQL-SCRIPTS.sql`:

- `profiles` - User profiles and settings
- `tracks` - Music tracks and metadata
- `royalties` - Royalty payments and earnings
- `contracts` - Recording and publishing contracts
- `analytics` - Streaming and performance analytics
- `copyrights` - Copyright information and registrations
- `payments` - Payment transactions and history

---

## 🔒 Security Notes

- **Never expose your service_role key** in client-side code
- **Always use environment variables** for sensitive data
- **Enable Row Level Security** to protect user data
- **Regularly rotate your API keys** for security

---

## ✅ Verification Checklist

- [ ] Supabase project created and active
- [ ] API keys copied to .env.local
- [ ] Database tables created via SQL scripts
- [ ] Row Level Security enabled
- [ ] Test connection passes
- [ ] Application connects successfully
- [ ] User authentication works
- [ ] Data operations (CRUD) function correctly

Once all these steps are completed, your GOAT Royalty App will be fully integrated with Supabase and ready for production use!