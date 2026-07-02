# SUPER GOAT ROYALTIES APP - Installer Build Guide

## Complete Guide for Building Desktop Installers

This guide provides step-by-step instructions for creating downloadable installer packages for the **SUPER GOAT ROYALTIES APP** on Windows, macOS, and Linux platforms.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Platform-Specific Builds](#platform-specific-builds)
4. [Build Outputs](#build-outputs)
5. [Troubleshooting](#troubleshooting)
6. [Distribution](#distribution)

---

## Prerequisites

### System Requirements
- **Node.js** v18.x or higher
- **npm** v9.x or higher
- **Git** for cloning the repository
- **8GB+ free disk space** (for building all platforms)

### Platform-Specific Requirements

#### Windows
- Windows 10/11 (64-bit)
- Visual Studio Build Tools (optional, for native modules)

#### macOS
- macOS 10.15+ (Catalina or later)
- Xcode Command Line Tools: `xcode-select --install`

#### Linux
- Ubuntu 18.04+ or equivalent
- Build essentials: `sudo apt-get install build-essential`

---

## Quick Start

### Step 1: Clone the Repository

```bash
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build All Installers

```bash
# Make the build script executable (Linux/macOS)
chmod +x build-installers.sh

# Run the build script
./build-installers.sh
```

Or use npm commands directly:

```bash
# Build Next.js app first
npm run build

# Then build platform-specific installers
npm run build:win          # Windows EXE installer
npm run build:portable     # Windows Portable version
npm run electron:build:mac # macOS DMG
npm run electron:build:linux # Linux packages
```

---

## Platform-Specific Builds

### Windows EXE Installer

The Windows installer uses NSIS (Nullsoft Scriptable Install System) for a professional installation experience.

```bash
# Build Windows installer only
npm run build:win
```

**Output:** `dist/SUPER GOAT ROYALTIES APP-1.0.0-x64-Setup.exe`

**Features:**
- Professional installation wizard
- Desktop shortcut creation
- Start menu integration
- Uninstaller included
- Automatic updates support

### Windows Portable Version

A standalone executable that runs without installation. Perfect for USB drives or restricted environments.

```bash
# Build portable version only
npm run build:portable
```

**Output:** `dist/SUPER GOAT ROYALTIES APP-1.0.0-x64-Portable.exe`

**Features:**
- No installation required
- Runs from any location
- Perfect for USB drives
- Leaves no registry entries

### macOS DMG Installer

Creates a macOS disk image with drag-and-drop installation.

```bash
# Build macOS DMG (best run on macOS)
npm run electron:build:mac
```

**Output:** 
- `dist/SUPER GOAT ROYALTIES APP-1.0.0-x64.dmg` (Intel)
- `dist/SUPER GOAT ROYALTIES APP-1.0.0-arm64.dmg` (Apple Silicon)

**Note:** Building macOS apps on Linux/Windows is possible but may have limitations. For production macOS builds, use a macOS machine.

### Linux Packages

Creates multiple Linux package formats for maximum compatibility.

```bash
# Build Linux packages
npm run electron:build:linux
```

**Outputs:**
- `dist/SUPER GOAT ROYALTIES APP-1.0.0-x64.AppImage` (Universal)
- `dist/super-goat-royalties-app_1.0.0_amd64.deb` (Debian/Ubuntu)
- `dist/super-goat-royalties-app-1.0.0-x64.tar.gz` (Portable)

---

## Build Outputs

After a successful build, the `dist/` directory will contain:

```
dist/
├── SUPER GOAT ROYALTIES APP-1.0.0-x64-Setup.exe     # Windows Installer
├── SUPER GOAT ROYALTIES APP-1.0.0-x64-Portable.exe  # Windows Portable
├── SUPER GOAT ROYALTIES APP-1.0.0-x64.dmg           # macOS Intel
├── SUPER GOAT ROYALTIES APP-1.0.0-arm64.dmg         # macOS Apple Silicon
├── SUPER GOAT ROYALTIES APP-1.0.0-x64.AppImage      # Linux Universal
├── super-goat-royalties-app_1.0.0_amd64.deb         # Debian/Ubuntu
└── super-goat-royalties-app-1.0.0-x64.tar.gz        # Linux Portable
```

---

## Troubleshooting

### Common Issues

#### "Cannot find module 'electron'"
```bash
# Install Electron as a dev dependency
npm install electron --save-dev
```

#### "ENOENT: no such file or directory, open 'icon.ico'"
```bash
# Icons are already in public/ folder. Verify:
ls -la public/icon.*

# If missing, regenerate:
npx electron-icon-builder --input=public/icon.png --output=public
```

#### Build fails with memory error
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### macOS build fails on Linux
Building macOS apps on Linux requires additional setup and may not produce properly signed apps. For production macOS builds:
1. Use a macOS machine
2. Or use GitHub Actions with macOS runners

### Clean Build

If you encounter persistent issues:

```bash
# Remove all build artifacts
rm -rf dist/ .next/ node_modules/

# Reinstall and rebuild
npm install
npm run build
```

---

## Distribution

### Hosting Installers

1. **GitHub Releases** (Recommended)
   - Upload installers to GitHub Releases
   - Users get automatic update notifications
   - Version history maintained

2. **Website Download Page**
   - Host installers on your website
   - Provide clear download links for each platform

3. **Cloud Storage**
   - AWS S3, Google Cloud Storage, or Azure Blob
   - CDN integration for fast global downloads

### Code Signing (Recommended for Production)

#### Windows
```bash
# Sign with a code signing certificate
npx electron-builder --win --x64 --sign
```

#### macOS
```bash
# Notarize with Apple
npx electron-builder --mac --x64 --publish onTag
```

### Auto-Update Configuration

The app is configured for automatic updates. To enable:

1. Set up a release server or use GitHub Releases
2. Update `package.json` with your release URL:
```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "DJSPEEDYGA",
      "repo": "GOAT-Royalty-App2"
    }
  }
}
```

---

## Quick Reference Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run build` | Build Next.js application |
| `npm run build:win` | Build Windows EXE installer |
| `npm run build:portable` | Build Windows Portable |
| `npm run electron:build:mac` | Build macOS DMG |
| `npm run electron:build:linux` | Build Linux packages |
| `./build-installers.sh` | Build all platforms |

---

## Support

For issues or questions:
- **Email:** info@goatroyaltyapp.com
- **GitHub:** https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/issues

---

**Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST. All rights reserved.**