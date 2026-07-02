# 🔧 Supabase Credentials Guide for GOAT Royalty App

## 📋 Current Issue
Your app is showing connection errors because it's using placeholder Supabase credentials:
- URL: `https://your-project-ref.supabase.co` ❌ (placeholder)
- API Key: `your_anon_key_here` ❌ (placeholder)

## 🚀 Step-by-Step Solution

### Step 1: Access Your Supabase Dashboard
1. **Go to:** https://supabase.com/dashboard
2. **Sign in** with your account (GitHub/Email/SSO)

### Step 2: Find Your Project Credentials
1. **Select your project** from the dashboard
2. **Go to Settings** → **API** (left sidebar)
3. **Copy these values:**

   **Project URL:**
   ```
   https://[your-actual-project-ref].supabase.co
   ```

   **anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **service_role key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 3: Update Your Environment File
Edit `.env.local` in your project root:

```bash
# Replace with YOUR ACTUAL credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

### Step 4: Set Up Database Tables
1. **Go to:** SQL Editor in your Supabase project
2. **Click:** "New query"
3. **Paste:** Contents of `SQL-SCRIPTS.sql` from your project
4. **Click:** "Run"

### Step 5: Test the Connection
```bash
node test-supabase-connection.js
```

**Expected Success Output:**
```
🔍 Testing Supabase Connection...

Project URL: https://your-actual-project-ref.supabase.co
API Key: ✅ Found

📡 Connecting to Supabase...
✅ Connection successful!
✅ Database tables found!
```

## 🔍 What to Look For in Supabase Dashboard

### Project URL Location:
- Settings → API → Project URL
- Format: `https://xyzabc123.supabase.co`

### API Keys Location:
- Settings → API → API Keys
- **anon key** (for client-side use)
- **service_role key** (for server-side use)

## 🛠️ Quick Copy-Paste Template

Use this template for your `.env.local` file:

```bash
# GOAT Royalty App - Supabase Configuration
# Replace the values below with your actual Supabase credentials

NEXT_PUBLIC_SUPABASE_URL=https://[PASTE-YOUR-PROJECT-URL-HERE]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[PASTE-YOUR-ANON-KEY-HERE]
SUPABASE_SERVICE_ROLE_KEY=[PASTE-YOUR-SERVICE-ROLE-KEY-HERE]

# OpenAI API Key (for Ms Vanessa AI)
OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 🎯 After Updating Credentials

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Access your app:** http://localhost:3001

3. **Verify Supabase integration:**
   - Check browser console for connection status
   - Test user registration/login
   - Try creating a track or royalty entry

## 🔧 Troubleshooting

### If connection still fails:
1. **Check project is active** (not paused)
2. **Verify URL format** (no trailing slash)
3. **Ensure API keys are complete** (no cutoff text)
4. **Check for typos** in credentials

### Common URL format mistakes:
- ❌ `https://projectref.supabase.co/` (extra slash)
- ❌ `https:// projectref.supabase.co` (extra space)
- ✅ `https://projectref.supabase.co` (correct)

### Common API key mistakes:
- ❌ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (truncated)
- ✅ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6I...` (complete)

## ✅ Verification Checklist

- [ ] Signed into Supabase dashboard
- [ ] Selected correct project
- [ ] Copied Project URL correctly
- [ ] Copied anon public key
- [ ] Copied service_role key
- [ ] Updated .env.local file
- [ ] Restarted development server
- [ ] Test connection passes
- [ ] Database tables created
- [ ] App connects to Supabase successfully

Once you complete these steps, your GOAT Royalty App will be fully connected to your Supabase database!