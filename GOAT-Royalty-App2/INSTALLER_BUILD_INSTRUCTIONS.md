# GOAT Royalty App - Installer Build Instructions

## Overview

This document provides comprehensive instructions for building installer packages for the GOAT Royalty App across multiple platforms.

## Available Installer Formats

| Platform | Format | Description |
|----------|--------|-------------|
| Windows | `.exe` (NSIS) | Standard Windows installer with desktop/start menu shortcuts |
| Windows | `.exe` (Portable) | Standalone executable, no installation required |
| macOS | `.dmg` | macOS disk image installer (Intel x64 & Apple Silicon arm64) |
| Linux | `.AppImage` | Portable Linux application |
| Linux | `.deb` | Debian/Ubuntu package |
| Linux | `.tar.gz` | Portable Linux archive |

---

## Quick Start

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- Git

### Build Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build Next.js application
npm run build

# Build for specific platform
npm run build:win        # Windows EXE installer
npm run build:mac        # macOS DMG installer
npm run build:linux      # Linux packages
npm run build:portable   # Windows portable
npm run build:all        # All platforms
```

---

## GitHub Actions (Recommended)

The project includes a GitHub Actions workflow that automatically builds installers for all platforms.

### Automatic Builds

1. **Push to main/master**: Triggers builds for all platforms
2. **Tag push (v*)**: Creates a GitHub Release with all installers
3. **Manual trigger**: Use the "Build GOAT Royalty App Installers" workflow

### Downloading Artifacts

After a successful build:

1. Go to **Actions** → Select the build run
2. Scroll down to **Artifacts**
3. Download:
   - `windows-installers` - Windows EXE and Portable
   - `macos-installers` - macOS DMG files
   - `linux-installers` - Linux AppImage, DEB, and TAR.GZ

### Creating a Release

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will automatically:
# 1. Build all platform installers
# 2. Create a GitHub Release
# 3. Attach all installer files
```

---

## Local Build Instructions

### Windows Build

**Requirements:**
- Windows 10/11
- Node.js 20.x

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build Next.js
npm run build

# Build Windows installer
npm run build:win

# Or build portable only
npm run build:portable
```

**Output:**
- `dist/GOAT Royalty App-Setup-1.0.0.exe` - NSIS installer
- `dist/GOAT Royalty App-Portable-1.0.0.exe` - Portable version

### macOS Build

**Requirements:**
- macOS 10.15+ (Catalina or later)
- Xcode Command Line Tools: `xcode-select --install`
- Node.js 20.x

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build Next.js
npm run build

# Build macOS installer
npm run build:mac
```

**Output:**
- `dist/GOAT Royalty App-1.0.0-x64.dmg` - Intel Macs
- `dist/GOAT Royalty App-1.0.0-arm64.dmg` - Apple Silicon Macs

### Linux Build

**Requirements:**
- Ubuntu 18.04+ or compatible distribution
- Node.js 20.x
- Additional packages: `sudo apt-get install -y libarchive-tools rpm`

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build Next.js
npm run build

# Build Linux packages
npm run build:linux

# Or build specific format
npm run build:appimage  # AppImage only
npm run build:deb       # DEB package only
```

**Output:**
- `dist/GOAT Royalty App-1.0.0-x86_64.AppImage`
- `dist/goat-royalty-app_1.0.0_amd64.deb`
- `dist/goat-royalty-app-1.0.0.tar.gz`

---

## Build Configuration

The build configuration is in `electron-builder.yml`. Key settings:

### Application Identity

```yaml
appId: com.goatroyalty.app
productName: GOAT Royalty App
```

### Icons

Icons are located in `public/`:
- `icon.ico` - Windows icon
- `icon.icns` - macOS icon
- `icons/` - Linux icons (PNG format)

---

## Troubleshooting

### "No space left on device"

The Electron build process requires significant disk space (~2GB). Free up space or use GitHub Actions instead.

### "Module not found"

Install missing dependencies:
```bash
npm install --legacy-peer-deps
```

### Windows Build Fails on Linux/macOS

Windows builds require either:
1. Building on Windows
2. Using GitHub Actions (recommended)
3. Using Wine (experimental)

### macOS Code Signing

For production macOS builds, you'll need:
1. Apple Developer Certificate
2. Update `electron-builder.yml` with signing configuration

---

## Build Script Reference

| Script | Description |
|--------|-------------|
| `npm run build` | Build Next.js application |
| `npm run build:win` | Build Windows EXE installer |
| `npm run build:mac` | Build macOS DMG installer |
| `npm run build:linux` | Build Linux packages |
| `npm run build:portable` | Build Windows portable |
| `npm run build:all` | Build all platforms |
| `npm run release` | Build and publish to GitHub Releases |

---

## Support

For issues or questions, contact:
- Harvey L Miller Jr: harvey@goatroyaltyapp.com
- GitHub Issues: https://github.com/BrickSquadMonopoly/GOAT-Royalty-App2/issues