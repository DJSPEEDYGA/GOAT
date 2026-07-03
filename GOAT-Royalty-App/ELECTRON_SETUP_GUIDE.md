# Electron Self-Contained App Setup Guide

## Overview

This guide explains how to set up and build the self-contained GOAT Royalty App using Electron. The app will be available as a standalone executable for Windows 11, macOS, and Linux.

## Prerequisites

### Required Tools

1. **Node.js** (v18 or higher)
   - Download from https://nodejs.org/

2. **Git**
   - Download from https://git-scm.com/

3. **Platform-specific build tools**:

   **Windows:**
   - Visual Studio Build Tools (for building native modules)
   - Download from https://visualstudio.microsoft.com/visual-cpp-build-tools/
   
   **macOS:**
   - Xcode Command Line Tools
   ```bash
   xcode-select --install
   ```
   
   **Linux:**
   - Build essentials
   ```bash
   sudo apt-get install build-essential libnss3-dev
   ```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git
cd GOAT-Royalty-App
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Electron runtime
- Electron Builder for packaging
- All application dependencies
- Development tools

### 3. Create Build Resources Directory

```bash
mkdir -p build
```

### 4. Add Application Icons

Place your app icons in the `build/` directory:
- `icon.ico` - Windows icon (256x256)
- `icon.icns` - macOS icon
- `icon.png` - Linux icon (512x512)

If you don't have these icons yet, you can create them from a single PNG image using online tools like:
- https://cloudconvert.com/png-to-ico
- https://cloudconvert.com/png-to-icns

## Development Mode

### Run in Development Mode

Run both the web server and Electron app simultaneously:

```bash
npm run dev
```

This starts:
- Web server on http://localhost:3000
- Electron app pointing to the dev server

### Run Electron Only (if server is already running)

```bash
npm run dev:electron
```

### Run Web Server Only

```bash
npm run dev:web
```

## Building the Application

### Build for Current Platform

```bash
npm run build
```

This will:
1. Build the web application
2. Package everything into an Electron app
3. Create an installer in `dist-electron/`

### Build for Specific Platform

**Windows:**
```bash
npm run build:win
```
Output: `GOAT Royalty App Setup.exe` (NSIS installer)

**macOS:**
```bash
npm run build:mac
```
Output: `GOAT Royalty App.dmg`

**Linux:**
```bash
npm run build:linux
```
Output: `GOAT Royalty App.AppImage` and `.deb` package

## Project Structure

```
goat-royalty-app/
├── app/
│   └── main/
│       ├── index.js           # Main Electron entry point
│       ├── self-healing.js    # Self-healing system
│       └── self-building.js   # Self-building system
├── build/                     # Build resources (icons)
│   ├── icon.ico              # Windows icon
│   ├── icon.icns             # macOS icon
│   └── icon.png              # Linux icon
├── src/
│   ├── server.js             # Express server
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   └── models/               # Data models
├── client/                    # Frontend React app
├── scripts/                   # Utility scripts
│   ├── google-drive-pipeline.js
│   └── google-apps-script/
├── dist-electron/             # Electron build output
└── package.json
```

## Self-Contained Features

### Self-Healing System

The app includes a self-healing system that:
- Monitors system health continuously
- Automatically repairs common issues
- Restores from backups when needed
- Logs all health events

Access via IPC:
```javascript
// Check system health
await ipcRenderer.invoke('check-health')

// Get health history
await ipcRenderer.invoke('get-health-history')
```

### Self-Building System

The app includes a self-building system that:
- Checks for updates from GitHub
- Auto-updates the application
- Builds new versions automatically
- Creates backups before updates
- Supports rollback on failures

Access via IPC:
```javascript
// Check for updates
await ipcRenderer.invoke('check-updates')

// Perform update
await ipcRenderer.invoke('perform-update', updateInfo)

// Perform rollback
await ipcRenderer.invoke('perform-rollback', backupName)
```

### Built-in Tools

The self-contained app includes:
- **Google Drive Pipeline**: Sync your 6.5 TB vault directly
- **Offline Mode**: Process data without internet
- **AI Assistant Hub**: Full-text search across all resources
- **Data Processing**: Handle books, music, code, contracts, and more

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/goat-royalty

# GitHub (for self-building)
GITHUB_TOKEN=your_github_token

# Google Drive API
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=urn:ietf:wg:oauth:2.0:oob

# AI Services
OPENAI_API_KEY=your_openai_key
NVIDIA_API_KEY=your_nvidia_key

# Offline Mode
OFFLINE_DATA_DIR=./offline-data
```

## Troubleshooting

### Build Errors

**"electron-builder" not found:**
```bash
npm install electron-builder --save-dev
```

**Native module errors:**
```bash
npm rebuild
```

**Permission denied (Linux/macOS):**
```bash
chmod +x dist-electron/GOAT\ Royalty\ App
```

### Runtime Errors

**Blank window:**
- Check if the web server is running
- Check console for errors (View -> Toggle Developer Tools)

**Self-healing not working:**
- Check logs in `%APPDATA%/goat-royalty-app/logs/` (Windows)
- Check logs in `~/Library/Application Support/goat-royalty-app/logs/` (macOS)
- Check logs in `~/.config/goat-royalty-app/logs/` (Linux)

**Update check failed:**
- Verify GITHUB_TOKEN is set correctly
- Check network connectivity

## Distribution

### Creating Installers

The built installers are ready for distribution:

1. **Windows**: `dist-electron/GOAT Royalty App Setup.exe`
   - Double-click to install
   - Creates desktop and start menu shortcuts

2. **macOS**: `dist-electron/GOAT Royalty App.dmg`
   - Open DMG and drag to Applications folder
   - First launch may require right-click -> Open

3. **Linux**: `dist-electron/GOAT Royalty App.AppImage`
   - Make executable: `chmod +x "GOAT Royalty App.AppImage"`
   - Run directly: `./GOAT\ Royalty\ App.AppImage`

### Auto-Update

The self-building system handles auto-updates automatically:
- Checks for updates every hour (configurable)
- Downloads and installs updates automatically
- Creates backups before updating
- Rolls back on failure

## Support

For issues or questions:
- GitHub: https://github.com/DJSPEEDYGA/GOAT-Royalty-App/issues
- Documentation: See README.md and other guides in the repository