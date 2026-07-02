# 🚨 Emergency Fix Guide - Git Conflict & Missing Dependencies

## The Problems

1. ❌ Git refusing to merge (unrelated histories)
2. ❌ Missing `build:win` script in your local package.json
3. ❌ Missing `@supabase/supabase-js` dependency
4. ❌ Your local code is out of sync with GitHub

---

## ✅ SOLUTION: Fresh Start (Recommended)

The easiest fix is to start fresh with the correct code from GitHub:

### Step 1: Backup Your Current Work (Optional)

```cmd
cd ~/Documents
mv goat-royalty-app goat-royalty-app-backup
```

### Step 2: Clone Fresh from GitHub

```cmd
cd ~/Documents
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2
```

### Step 3: Install Dependencies

```cmd
npm install --legacy-peer-deps
```

### Step 4: Add Missing Supabase Dependency

```cmd
npm install @supabase/supabase-js --legacy-peer-deps
```

### Step 5: Build Next.js

```cmd
npm run build
```

### Step 6: Build Windows .exe

```cmd
npm run build:win
```

---

## 🔧 Alternative: Fix Current Directory

If you want to fix your current directory instead:

### Step 1: Force Pull Latest Changes

```cmd
cd ~/Documents/goat-royalty-app
git fetch origin main
git reset --hard origin/main
```

⚠️ **Warning**: This will overwrite your local changes!

### Step 2: Install All Dependencies

```cmd
npm install --legacy-peer-deps
npm install @supabase/supabase-js --legacy-peer-deps
```

### Step 3: Verify Scripts

```cmd
npm run
```

You should see `build:win` in the list.

### Step 4: Build

```cmd
npm run build
npm run build:win
```

---

## 📋 Complete Working Commands (Fresh Start)

Copy and paste these commands one by one:

```cmd
# Navigate to Documents
cd ~/Documents

# Backup old folder (optional)
mv goat-royalty-app goat-royalty-app-old

# Clone fresh from GitHub
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git

# Enter directory
cd GOAT-Royalty-App2

# Install dependencies
npm install --legacy-peer-deps

# Add Supabase
npm install @supabase/supabase-js --legacy-peer-deps

# Build Next.js
npm run build

# Build Windows .exe
npm run build:win
```

---

## 🔍 Why This Happened

1. **Git Conflict**: Your local repository has different history than GitHub
2. **Old Code**: Your local `package.json` is missing recent updates
3. **Missing Dependency**: Supabase wasn't in the original dependencies list

---

## ✅ Verification Steps

After fresh clone, verify:

```cmd
# Check you're in the right directory
pwd
# Should show: /c/Users/COMPUTER 1/Documents/GOAT-Royalty-App2

# Check package.json has build:win
cat package.json | grep "build:win"
# Should show: "build:win": "npm run build && electron-builder --win",

# Check dependencies installed
ls node_modules/@supabase
# Should show: supabase-js folder

# List available scripts
npm run
# Should show build:win in the list
```

---

## 🎯 Expected Timeline

- **Clone**: 1-2 minutes
- **npm install**: 3-5 minutes
- **npm run build**: 1-2 minutes
- **npm run build:win**: 10-15 minutes (first time)

**Total**: ~20 minutes

---

## 🆘 If You Still Get Errors

### Error: "Module not found: @supabase/supabase-js"

```cmd
npm install @supabase/supabase-js --legacy-peer-deps
```

### Error: "Missing script: build:win"

```cmd
# You're in the wrong directory or have old code
# Do a fresh clone as shown above
```

### Error: "fatal: refusing to merge"

```cmd
# Don't try to merge - do a fresh clone instead
cd ~/Documents
rm -rf goat-royalty-app
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
```

---

## 💡 Pro Tip

After successful build, you can rename the folder:

```cmd
cd ~/Documents
mv GOAT-Royalty-App2 goat-royalty-app
```

---

## 🎉 Success Indicators

You'll know it worked when:

1. ✅ `npm run` shows `build:win` script
2. ✅ `npm run build` completes without errors
3. ✅ `npm run build:win` starts building
4. ✅ `dist/` folder appears with .exe files

---

## 📞 Quick Reference

**Fresh Start Commands:**
```cmd
cd ~/Documents
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2
npm install --legacy-peer-deps
npm install @supabase/supabase-js --legacy-peer-deps
npm run build
npm run build:win
```

**That's it!** 🚀