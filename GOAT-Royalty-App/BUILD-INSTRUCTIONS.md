# 🖥️ GOAT Royalty App - Desktop Application Build Instructions

## Overview
This guide explains how to build the GOAT Royalty App as desktop applications for Windows, macOS, and Linux.

## Important Note About Operating Systems

**❌ The operating system is NOT embedded in the apps.**

The built applications contain:
- ✅ Your GOAT Royalty App code
- ✅ Electron runtime (Chromium + Node.js)
- ✅ App resources and dependencies
- ❌ NO operating system embedded

Users must install the app on their own Windows, macOS, or Linux computer.

## Build Requirements

### System Requirements
- **Node.js**: v20.20.1 or higher
- **npm**: v11.11.1 or higher
- **Disk Space**: At least 2GB free space
- **OS**: Linux, macOS, or Windows (for building)

### Dependencies
```bash
npm install
```

## Build Methods

### Method 1: Using the Build Script (Recommended)

```bash
# Make the script executable
chmod +x build-desktop-apps.sh

# Run the build script
./build-desktop-apps.sh
```

This will build all three platforms in one go.

### Method 2: Building Individual Platforms

#### Windows (.exe)
```bash
npm run build:win
```

Output: `dist-electron/GOAT-Royalty-App-Setup.exe` (~150MB)

#### macOS (.dmg)
```bash
npm run build:mac
```

Output: `dist-electron/GOAT-Royalty-App.dmg` (~150MB)

#### Linux (AppImage + deb)
```bash
npm run build:linux
```

Output: 
- `dist-electron/GOAT-Royalty-App.AppImage` (~150MB)
- `dist-electron/goat-royalty-app_1.0.0_amd64.deb` (~150MB)

## Current Build Status

### ⚠️ Workspace Space Issue
The current workspace has limited disk space (93% used). Building Electron apps requires significant space for:

1. **Node.js downloads**: Electron runtime (~80MB)
2. **Build artifacts**: Temporary files during build (~500MB)
3. **Final output**: Built applications (~450MB total)

### Solution Options

#### Option 1: Build on Your Local Machine
```bash
# Clone the repository
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git
cd GOAT-Royalty-App

# Install dependencies
npm install

# Build for your platform
npm run build:win  # Windows
npm run build:mac  # macOS
npm run build:linux  # Linux
```

#### Option 2: Build on VPS
```bash
# SSH into your VPS
ssh root@93.127.214.171

# Clone and build
cd /opt
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git
cd GOAT-Royalty-App
npm install
npm run build:win
npm run build:mac
npm run build:linux
```

#### Option 3: Use GitHub Actions (Recommended)
Create a GitHub Actions workflow to build automatically on push:

```yaml
# .github/workflows/build.yml
name: Build Desktop Apps

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm install
      - run: npm run build:electron
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: dist-electron/*
```

## What Gets Built

### Windows Installer (.exe)
- **Format**: NSIS installer
- **Features**: 
  - Custom installation directory
  - Desktop shortcut
  - Start menu shortcut
  - Auto-update support
- **Size**: ~150MB

### macOS Disk Image (.dmg)
- **Format**: DMG disk image
- **Features**:
  - Drag-and-drop installation
  - Code signing ready
  - macOS Gatekeeper compatible
- **Architecture**: x64 and ARM64 (Apple Silicon)
- **Size**: ~150MB

### Linux Portable (AppImage)
- **Format**: AppImage (portable executable)
- **Features**:
  - No installation required
  - Runs on any Linux distribution
  - Self-contained
- **Size**: ~150MB

### Linux Package (.deb)
- **Format**: Debian package
- **Features**:
  - System integration
  - Dependency management
  - Easy updates
- **Size**: ~150MB

## Distribution

### Windows Distribution
```bash
# Share the .exe file
# Users run: GOAT-Royalty-App-Setup.exe
```

### macOS Distribution
```bash
# Share the .dmg file
# Users open and drag to Applications
```

### Linux Distribution
```bash
# Share the .AppImage file
# Users run: chmod +x GOAT-Royalty-App.AppImage && ./GOAT-Royalty-App.AppImage
```

## Troubleshooting

### Issue: "electron-builder: not found"
```bash
# Install electron-builder
npm install --save-dev electron-builder
```

### Issue: "no space left on device"
```bash
# Free up disk space
rm -rf node_modules
npm install
```

### Issue: Build fails on wrong platform
- Windows builds must be done on Windows
- macOS builds must be done on macOS
- Linux builds can be done on Linux

## Alternative: Web-Based Distribution

If building desktop apps is problematic, you can distribute the web version:

1. Deploy to VPS (already have scripts for this)
2. Share the URL: http://93.127.214.171
3. Users can access via any browser
4. Works on all platforms without installation

## Summary

- **Desktop apps are portable** but don't contain the OS
- **Build requires 2GB+ disk space** per platform
- **Best option**: Build on your local machine or use GitHub Actions
- **Alternative**: Web-based deployment (already configured)

## Next Steps

1. Choose a build method (local, VPS, or GitHub Actions)
2. Build the applications
3. Test on target platforms
4. Distribute to users

---

**Status**: Build script ready, awaiting sufficient disk space
**Last Updated**: 2026-03-24