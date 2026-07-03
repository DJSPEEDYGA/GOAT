# 🔧 Windows Installation Fix Guide

## The Problem

You're getting an ESLint version conflict error when running `npm install`.

## ✅ Quick Fix (Use This)

Instead of `npm install`, use:

```cmd
npm install --legacy-peer-deps
```

Then continue with:

```cmd
npm run build
npm run build:win
```

---

## 📋 Complete Build Commands (Corrected)

Run these commands in order:

```cmd
# Step 1: Install dependencies (with fix)
npm install --legacy-peer-deps

# Step 2: Build Next.js app
npm run build

# Step 3: Build Windows executables
npm run build:win
```

---

## 🔍 What's Happening

- **ESLint Conflict**: Your project has ESLint 9.26.0, but Next.js wants ESLint 7 or 8
- **Solution**: `--legacy-peer-deps` tells npm to ignore this conflict
- **Safe**: This is a common workaround and won't break anything

---

## 🆘 If You Still Get Errors

### Error: "next is not recognized"

This means dependencies didn't install. Try:

```cmd
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Error: "Missing script: build:win"

This means you're in the wrong directory or have old code. Try:

```cmd
# Make sure you're in the right directory
cd ~/Documents/goat-royalty-app

# Pull latest changes
git pull origin main

# Install again
npm install --legacy-peer-deps
```

### Error: "electron-builder not found"

Install it globally:

```cmd
npm install -g electron-builder
npm run build:win
```

---

## 🎯 Alternative: Fix ESLint Version

If you want to fix the root cause, update package.json:

1. Open `package.json`
2. Find the `devDependencies` section
3. Change `"eslint": "9.26.0"` to `"eslint": "^8.0.0"`
4. Save and run `npm install`

---

## ✅ Verification

After `npm install --legacy-peer-deps`, verify:

```cmd
# Check if next is installed
npx next --version

# Check if electron-builder is installed
npx electron-builder --version

# List all scripts
npm run
```

You should see:
- `next` version (e.g., 14.2.33)
- `electron-builder` version (e.g., 24.13.2)
- All scripts including `build:win`

---

## 🚀 Full Working Example

```cmd
# Navigate to project
cd ~/Documents/goat-royalty-app

# Install with fix
npm install --legacy-peer-deps

# Verify installation
npx next --version
npx electron-builder --version

# Build Next.js
npm run build

# Build Windows .exe
npm run build:win

# Wait 10-15 minutes for first build
# Check dist/ folder for .exe files
```

---

## 📊 Expected Output

### After `npm install --legacy-peer-deps`:
```
added 416 packages in 15s
```

### After `npm run build`:
```
✓ Compiled successfully
✓ Generating static pages (3/3)
```

### After `npm run build:win`:
```
• electron-builder version=24.13.2
• building target=nsis file=dist/GOAT Royalty App Setup 1.0.0.exe
• building target=portable file=dist/GOAT-Royalty-App-Portable.exe
```

---

## 💡 Pro Tip

Add this to your workflow:

```cmd
# Create a build script
echo "npm install --legacy-peer-deps && npm run build && npm run build:win" > build.bat

# Then just run:
build.bat
```

---

## 🎉 Success!

Once you see files in the `dist/` folder, you're done! The .exe files are ready to use.

---

**Need more help?** Check the other guides:
- WINDOWS-BUILD-INSTRUCTIONS.md
- BUILD-EXE-GUIDE.md
- HOW-TO-GET-EXE.md