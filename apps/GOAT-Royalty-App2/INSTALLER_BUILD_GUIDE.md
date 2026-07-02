# 📦 SUPER GOAT ROYALTIES APP - Installer Build Guide

## Overview

This guide provides step-by-step instructions for creating production-ready installer packages for Windows, macOS, and Linux.

---

## 🛠️ Prerequisites

### Required Tools (All Platforms)
```bash
# Node.js 18+ and npm
node --version  # Should be 18.x or higher
npm --version

# Install Electron and build tools
npm install --save-dev electron electron-builder

# Install additional dependencies
npm install --save-dev electron-packager electron-installer-dmg
```

### Platform-Specific Requirements

**For Windows EXE (on Linux):**
```bash
# Install Wine for Windows builds on Linux
sudo apt update
sudo apt install wine64 wine32

# Or use Docker for consistent builds
docker pull electronuserland/electron-builder:wine
```

**For macOS DMG (Recommended: Build on macOS):**
- Requires macOS machine with Xcode
- Alternative: Use GitHub Actions for cloud builds

**For Linux Packages:**
```bash
# For .deb
sudo apt install fakeroot dpkg-dev

# For .AppImage
npm install --save-dev electron-builder
```

---

## 🚀 Quick Start - Build All Platforms

```bash
# One command to build all platforms
npm run build:all
```

---

## 📋 Detailed Build Instructions

### 1. Windows EXE Installer

#### Build Command:
```bash
# Build Windows installer on Linux
npm run build:win

# Or using Docker (recommended for consistency)
docker run --rm -ti -v ${PWD}:/project -w /project electronuserland/electron-builder:wine npm run build:win
```

#### Output:
- `dist/SUPER-GOAT-ROYALTIES-APP-Setup-1.0.0.exe` - Full installer
- `dist/SUPER-GOAT-ROYALTIES-APP-Portable-1.0.0.exe` - Portable version

#### Features:
- Desktop shortcut creation
- Start menu integration
- Uninstaller included
- Auto-update support ready

---

### 2. macOS DMG Installer

#### Build Command:
```bash
# Build macOS DMG (requires macOS)
npm run build:mac

# Or use GitHub Actions for cloud build (recommended)
# See .github/workflows/build-desktop-apps.yml
```

#### Output:
- `dist/SUPER-GOAT-ROYALTIES-APP-1.0.0.dmg`
- `dist/SUPER-GOAT-ROYALTIES-APP-1.0.0-mac.zip`

#### macOS Specific:
- Code signing ready (set CSC_LINK and CSC_KEY_PASSWORD)
- Notarization support
- Universal binary (Intel + Apple Silicon)

---

### 3. Linux Packages

#### Build All Linux Formats:
```bash
npm run build:linux
```

#### Individual Formats:
```bash
# .deb (Debian/Ubuntu)
npm run build:linux:deb

# .AppImage (Universal Linux)
npm run build:linux:appimage

# .tar.gz (Portable)
npm run build:linux:tarball
```

#### Output:
- `dist/super-goat-royalties-app_1.0.0_amd64.deb`
- `dist/SUPER-GOAT-ROYALTIES-APP-1.0.0.AppImage`
- `dist/super-goat-royalties-app-1.0.0.tar.gz`

---

## 🔧 Configuration Files

The following configuration files are included:

1. **electron-builder.yml** - Main build configuration
2. **electron-builder.json** - Alternative JSON config
3. **build/** - Platform-specific assets (icons, etc.)

---

## 🎨 Including Assets

### Icons Required:
```
build/
├── icon.ico        # Windows icon (256x256)
├── icon.icns       # macOS icon (512x512)
├── icon.png        # Linux icon (512x512)
├── background.png  # DMG background (optional)
└── installer.ico   # Custom installer icon (optional)
```

### Creating Icons:
```bash
# Install icon creation tool
npm install -g electron-icon-maker

# Generate all icons from a single 1024x1024 PNG
electron-icon-maker --input=logo.png --output=./build
```

---

## 🌐 Distribution

### Option 1: GitHub Releases
```bash
# Create a release with all installers
gh release create v1.0.0 dist/* --title "v1.0.0 - Initial Release"
```

### Option 2: AWS S3
```bash
aws s3 sync dist/ s3://your-bucket/downloads/
```

### Option 3: Download Page
A download page is provided at `public/download.html`

---

## 🧪 Testing Installers

### Windows:
```bash
# Run in Wine for testing
wine dist/SUPER-GOAT-ROYALTIES-APP-Setup-1.0.0.exe
```

### Linux:
```bash
# Test AppImage
chmod +x dist/SUPER-GOAT-ROYALTIES-APP-1.0.0.AppImage
./dist/SUPER-GOAT-ROYALTIES-APP-1.0.0.AppImage

# Test .deb
sudo dpkg -i dist/super-goat-royalties-app_1.0.0_amd64.deb
```

### macOS:
```bash
# Test DMG
open dist/SUPER-GOAT-ROYALTIES-APP-1.0.0.dmg
```

---

## 📊 Build Matrix

| Platform | Format | Build On | Output Size |
|----------|--------|----------|-------------|
| Windows | .exe | Linux/macOS/Windows | ~150MB |
| Windows | Portable | Linux/macOS/Windows | ~150MB |
| macOS | .dmg | macOS | ~200MB |
| Linux | .AppImage | Linux | ~180MB |
| Linux | .deb | Linux | ~160MB |
| Linux | .tar.gz | Linux | ~140MB |

---

## 🔐 Security Considerations

1. **Code Signing** (Production):
   - Windows: Set `WIN_CSC_LINK` and `WIN_CSC_KEY_PASSWORD`
   - macOS: Set `CSC_LINK` and `CSC_KEY_PASSWORD`

2. **Environment Variables**:
   ```bash
   # Never commit these
   export WIN_CSC_LINK=/path/to/certificate.pfx
   export WIN_CSC_KEY_PASSWORD=your-password
   export CSC_LINK=/path/to/certificate.p12
   export CSC_KEY_PASSWORD=your-password
   ```

---

## 🆘 Troubleshooting

### Common Issues:

**"Cannot find module 'electron'"**
```bash
npm install electron --save-dev
```

**"Wine not found" (Windows build on Linux)**
```bash
sudo apt install wine64
```

**"Code signing failed"**
- Verify certificate paths
- Check password environment variables

**"DMG creation failed"**
- Build on macOS or use GitHub Actions

---

## 📝 Next Steps

1. Run `npm install` to ensure all dependencies
2. Place your logo.png in the build directory
3. Run `npm run build:all` to create all installers
4. Test each installer on respective platforms
5. Upload to distribution platform

---

*Generated for SUPER GOAT ROYALTIES APP*
*Build once, deploy everywhere!*