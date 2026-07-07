# GOAT Royalty App - Build Instructions

## Prerequisites
- Node.js 18+ 
- npm or yarn
- For Windows builds: Windows machine
- For macOS builds: macOS machine
- For Linux builds: Linux machine

## Quick Start

```bash
# Clone the repository
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2

# Install dependencies
npm install

# Run development server
npm run dev
```

## Building Desktop Applications

### Windows EXE & Portable
```bash
npm run build:win
```
Outputs:
- `dist/GOAT Royalty App-Setup-1.0.0.exe` - Windows Installer
- `dist/GOAT Royalty App-Portable-1.0.0.exe` - Portable Windows App

### macOS DMG
```bash
npm run build:mac
```
Outputs:
- `dist/GOAT Royalty App-1.0.0-x64.dmg` - Intel Mac
- `dist/GOAT Royalty App-1.0.0-arm64.dmg` - Apple Silicon

### Linux AppImage & DEB
```bash
npm run build:linux
```
Outputs:
- `dist/GOAT Royalty App-1.0.0-x86_64.AppImage` - Portable Linux
- `dist/goat-royalty-app_1.0.0_amd64.deb` - Debian/Ubuntu Package

### Build All Platforms
```bash
npm run build:all
```

## GOAT Mascot Assets

The app now includes three GOAT mascot images:

1. **goat-mascot-royal.png** - Full royal goat mascot with throne and scepter
2. **goat-icon.png** - Clean app icon/logo version
3. **goat-cyberpunk.png** - Futuristic blockchain/crypto themed version

Located in `/public/` folder.

## Features

### Advanced AI Agent System
- 8 Agent Types (Tier 1-3)
- Hierarchical Orchestrator
- Multi-Agent Collaboration
- Agentic RAG with Verification
- Flagship Reasoning Models (Claude, GPT-4, Gemini, etc.)

### Blockchain & Crypto Mining
- Multi-chain support (Ethereum, Bitcoin, Polygon, Solana, BNB)
- Crypto mining simulation
- Smart contract deployment
- NFT minting
- Cash App Bitcoin integration

### Video Editing Studio
- Professional timeline editor
- 3D effects
- AI enhancement
- Multi-track support

### Data Provider Integration Hub
- YouTube integration
- Spotify analytics
- Stripe payments
- Apple Music
- ASCAP/BMI royalty tracking

## Troubleshooting

### Disk Space Issues
If you encounter "no space left on device" errors:
```bash
# Clean caches
rm -rf .next node_modules/.cache dist
npm install
npm run build
```

### Windows Build on Linux/Mac
Building Windows executables on non-Windows platforms requires Wine:
```bash
# Install Wine (Linux)
sudo apt install wine64

# Then run build
npm run build:win
```

### macOS Build on Linux/Windows
macOS builds require a macOS machine with Xcode tools installed.

## Support

For issues and feature requests, please open an issue on GitHub:
https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/issues

---

**FOR THE KINGDOM, FOR THE CODE, FOR THE CROWN** 👑