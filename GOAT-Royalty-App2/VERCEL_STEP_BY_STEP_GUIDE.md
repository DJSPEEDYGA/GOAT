# GOAT Royalty App - Complete Vercel Setup Guide

## 🎯 Your Goal
Get your GOAT Royalty App deployed correctly on **goatroyaltyapp.org**, **goatroyaltyapp.net**, **goatroyaltyapp.com**, and **goatforce.cloud** using Vercel.

---

## 📋 Prerequisites Check
✅ You have a GitHub repository: `DJSPEEDYGA/GOAT-Royalty-App2`  
✅ You have a Vercel account  
✅ You're ready to follow these steps one by one

---

## 🚀 Step-by-Step Vercel Setup

### STEP 1: Access Your Vercel Dashboard
1. Go to **https://vercel.com** in your browser
2. Click **"Login"** or **"Sign Up"** in the top right
3. Sign in using your email or preferred method (Google, GitHub, GitLab)
4. If you're new, you'll see a welcome screen

### STEP 2: Connect GitHub to Vercel
1. Once logged in, you should see your **Dashboard**
2. Look for the **"Add New..."** button (top right corner)
3. Click **"Add New..."** → **"Project"**
4. You'll see a list of Git providers (GitHub, GitLab, Bitbucket)
5. Click **"Import"** under the **GitHub** section
6. If prompted, click **"Connect to GitHub"** and authorize Vercel
7. Vercel will ask for permissions - click **"Install Vercel"** or **"Authorize"**

### STEP 3: Import Your Repository
1. After connecting GitHub, you'll see a list of your repositories
2. Find **`DJSPEEDYGA/GOAT-Royalty-App2`** in the list
3. Click the **"Import"** button next to it

### STEP 4: Configure Project Settings
You'll see a **"Configure Project"** page with these options:

#### Framework Preset
- **Framework**: Next.js (should be detected automatically)
- **Root Directory**: `./` (keep as is)
- **Build Command**: `npm run build` (should be auto-filled)
- **Output Directory**: `.next` (should be auto-filled)

#### Environment Variables
You need to add these environment variables:
1. Look for the **"Environment Variables"** section
2. Click **"Add New"** for each variable:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: (your Supabase URL from previous setup)
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: (your Supabase Anon Key from previous setup)
```

```
Name: GOOGLE_AI_API_KEY
Value: (your Google Gemini API Key)
```

#### Important Notes
- If you don't have these keys handy, you can skip them for now and add them later
- The app may still work without them (some features might be limited)

### STEP 5: Deploy the Project
1. Scroll to the bottom of the page
2. Click the big **"Deploy"** button
3. Vercel will start building your project (this takes 2-5 minutes)
4. You'll see build logs scrolling by
5. Wait for **"Production Deployment"** to show **"Ready"** ✅

### STEP 6: Get Your Vercel URL
1. Once deployment is complete, Vercel will show you a random URL like:
   - `https://goat-royalty-app-xxxxx.vercel.app`
2. Click this link to see your app live!
3. Verify that your GOAT Royalty App is showing correctly

---

## 🌐 STEP 7: Add Your Custom Domains

### For goatroyaltyapp.org
1. In your Vercel dashboard, click on your project
2. Go to the **"Settings"** tab (top navigation)
3. Click **"Domains"** in the left sidebar
4. Enter **`goatroyaltyapp.org`** in the input field
5. Click **"Add"**
6. Vercel will give you DNS settings to update
7. **IMPORTANT**: Go to your domain registrar (where you bought the domain)
8. Update your DNS settings to point to Vercel:
   - Add a **CNAME record** pointing to `cname.vercel-dns.com`
   - Or update your nameservers to Vercel's nameservers (easier option)
9. Wait for DNS to propagate (can take 10 minutes to 48 hours)

### Repeat for Other Domains
Follow the same steps for:
- `goatroyaltyapp.net`
- `goatroyaltyapp.com`
- `goatforce.cloud`

---

## 🔧 Troubleshooting Common Issues

### Issue 1: "Repository Not Found"
**Solution**: Make sure you're logged into the correct GitHub account that has access to `DJSPEEDYGA/GOAT-Royalty-App2`

### Issue 2: Build Fails
**Solution**: Check the build logs. Common reasons:
- Missing dependencies
- Incorrect build command
- Missing environment variables

### Issue 3: Domain Not Working
**Solution**: 
- Wait at least 48 hours for DNS propagation
- Check your DNS settings using tools like `dig` or `nslookup`
- Make sure you're using the correct DNS records provided by Vercel

### Issue 4: Wrong App Showing
**Solution**: 
- Make sure you imported the correct repository
- Check that the build output directory is `.next` (not `out` or `dist`)
- Clear your browser cache and reload

---

## ✅ Verification Checklist

After deployment, verify:
- [ ] Your app loads at the Vercel URL
- [ ] All pages work (Home, Voice Studio, etc.)
- [ ] No broken images or assets
- [ ] Fonts display correctly
- [ ] Navigation links work
- [ ] Mobile version works (test on phone)
- [ ] goatroyaltyapp.org shows the correct app
- [ ] goatroyaltyapp.net shows the correct app
- [ ] goatroyaltyapp.com shows the correct app
- [ ] goatforce.cloud shows the correct app

---

## 🎉 What's Next?

Once your Vercel deployment is working:
1. We'll add the beat-making features (Logic Pro style)
2. Integrate NinjaTech download capability
3. Add crypto mining features
4. Create downloadable builds (EXE, DMG, Portable)

---

## 💡 Tips for Success

1. **Take Your Time**: Don't rush through the steps
2. **Read Carefully**: Each step is important
3. **Ask for Help**: If you get stuck, let me know exactly what step you're on and what you see
4. **Screenshots Help**: If you can, take screenshots when something doesn't work
5. **Check Logs**: Vercel provides detailed build logs - use them to troubleshoot

---

## 📞 Need Help?

If you encounter any issues, tell me:
1. What step you're on
2. What you see on your screen
3. Any error messages you're getting
4. What you expected to happen vs. what actually happened

I'll help you fix it! 🚀