# 🪟 Building Windows Executables on Linux VPS

## ⚠️ Current Issue
Building Windows `.exe` files on Linux requires **Wine** (Windows emulator).

## 🎯 Solution 1: Install Wine (Recommended for VPS)

### Step 1: Install Wine
```bash
# Update package list
sudo apt update

# Install Wine
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install -y wine64 wine32

# Verify installation
wine --version
```

### Step 2: Build Windows App
```bash
cd /var/www/goat-app
npm run electron:build:win
```

**Pros:**
- ✅ Build directly on VPS
- ✅ No need to download/upload files
- ✅ Fast once Wine is installed

**Cons:**
- ⚠️ Wine installation takes 5-10 minutes
- ⚠️ Uses ~500MB disk space

---

## 🎯 Solution 2: Use GitHub Actions (EASIEST - No Wine Needed!)

This builds automatically on GitHub's servers (Windows, Mac, Linux).

### Step 1: Create GitHub Actions Workflow

I'll create this file for you. It will automatically build Windows, Mac, and Linux versions when you push code.

### Step 2: Push Code to GitHub
```bash
cd /var/www/goat-app
git add .
git commit -m "Add GitHub Actions for automated builds"
git push origin main
```

### Step 3: Download Built Apps
1. Go to: https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/actions
2. Click on the latest workflow run
3. Download the artifacts (Windows .exe, Mac .dmg, Linux AppImage)

**Pros:**
- ✅ No Wine installation needed
- ✅ Builds for ALL platforms (Windows, Mac, Linux)
- ✅ Professional CI/CD setup
- ✅ Free on GitHub

**Cons:**
- ⏱️ Takes 10-15 minutes per build
- 📶 Requires internet connection

---

## 🎯 Solution 3: Build on Windows Machine

If you have access to a Windows computer:

### Step 1: Clone Repository
```bash
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build
```bash
npm run electron:build:win
```

**Pros:**
- ✅ Native Windows build (fastest)
- ✅ No Wine needed
- ✅ Can test immediately

**Cons:**
- 💻 Requires Windows machine
- 📥 Need to download repository

---

## 🎯 Solution 4: Build Portable Version (No Installer)

Build a portable version that doesn't require installation:

### Update package.json
```json
"build": {
  "win": {
    "target": [
      {
        "target": "portable",
        "arch": ["x64"]
      }
    ]
  }
}
```

Then run:
```bash
npm run electron:build:win
```

---

## 📊 Comparison Table

| Solution | Time | Disk Space | Platforms | Difficulty |
|----------|------|------------|-----------|------------|
| Wine on VPS | 15 min | 500MB | Windows only | Medium |
| GitHub Actions | 10-15 min | 0MB | All 3 | Easy |
| Windows PC | 5 min | 0MB | Windows only | Easy |
| Portable | 15 min | 500MB | Windows only | Medium |

---

## 🚀 My Recommendation

**Use GitHub Actions (Solution 2)** because:
1. ✅ Builds for Windows, Mac, AND Linux
2. ✅ No Wine installation needed
3. ✅ Professional setup
4. ✅ Free and automated
5. ✅ Can download anytime

I'll set this up for you now!

---

## 🆘 Quick Fix (If You Need .exe NOW)

If you need the Windows executable immediately:

```bash
# Install Wine (takes 5-10 minutes)
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install -y wine64 wine32

# Build Windows app
cd /var/www/goat-app
npm run electron:build:win

# Find the .exe file
ls -lh dist/*.exe
```

The `.exe` file will be in the `dist/` folder.