# 🐐 SUPER GOAT ROYALTIES - Download & Build Instructions

## One Download. Everything Included.

The GOAT Royalty App is a **fully self-contained desktop application** with all your data embedded:

- 📊 **511 songs** from WAKA FLOCKA FLAME ASCAP catalog
- 👥 **142 network profiles** with 140 connections
- 💰 **Royalty calculator** for streaming & sync licensing
- ⛏️ **Crypto mining dashboard** (BTC, ETH, XMR, LTC, DOGE)
- 🎬 **Video editor** with 3D effects & AI enhancement
- 🎵 **DSP distribution** manager (Spotify, Apple Music, YouTube, etc.)
- 🤖 **AI assistant** - 100% offline, no login required

---

## 📥 Available Downloads

### Linux (Ready Now!)
- **AppImage**: `SUPER-GOAT-ROYALTIES-5.1.0-x86_64.AppImage` (140MB)
- Portable - no installation required
- Just download, make executable, and run

```bash
chmod +x SUPER-GOAT-ROYALTIES-5.1.0-x86_64.AppImage
./SUPER-GOAT-ROYALTIES-5.1.0-x86_64.AppImage
```

### Windows
- **EXE Installer**: Coming soon
- **Portable**: Coming soon
- Build requires Windows or Wine on Linux

### macOS
- **DMG**: Coming soon
- Build requires macOS machine

---

## 🔨 Building From Source

### Prerequisites
- Node.js 18+ 
- npm 9+
- Git

### Quick Build (Any Platform)

```bash
# Clone the repository
git clone https://github.com/DJSPEEDYGA/goat-royalties.git
cd goat-royalties

# Install dependencies
npm install --legacy-peer-deps

# Build for your platform
npm run electron:build        # Current platform
npm run electron:build:linux  # Linux AppImage
npm run electron:build:win    # Windows EXE + Portable
npm run electron:build:mac    # macOS DMG
```

### Windows Build on Linux
Requires Wine:
```bash
# Install Wine
sudo apt-get install wine64

# Build Windows version
npm run electron:build:win
```

### macOS Build
Must be built on a Mac. Requires Xcode Command Line Tools:
```bash
xcode-select --install
npm run electron:build:mac
```

---

## 📂 Embedded Data Files

All data is included in the build:

| File | Contents | Size |
|------|----------|------|
| `data/waka_catalog.json` | 511 ASCAP catalog songs | 236KB |
| `data/network_profiles.json` | 142 profiles, 140 connections | 81KB |
| `data/sync_opportunities.json` | Sync placement tracking | 3KB |
| `data/goat-config.json` | App configuration | 3KB |

---

## 🚀 Running the App

### Development Mode
```bash
npm run dev          # Web server only
npm run electron     # Desktop app
```

### Production
```bash
npm start           # Web server on port 3000
```

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/catalog` | Full music catalog |
| `/api/catalog/stats` | Catalog statistics |
| `/api/catalog/search?q=term` | Search songs |
| `/api/network` | Network profiles & connections |
| `/api/network/stats` | Network statistics |
| `/api/sync/opportunities` | Sync placement opportunities |
| `/api/royalty/calculate/streaming` | Streaming royalty calculator |
| `/api/royalty/calculate/sync` | Sync licensing calculator |
| `/api/config` | App configuration |

---

## 🔐 API Keys (Optional)

The app works 100% offline. For enhanced features, you can configure:

```env
SUPERNINJA_API_KEY=your_key
HOSTINGER_API_KEY=your_key
SUPABASE_API_KEY=your_key
GOOGLE_AI_KEY=your_key
```

---

## 📱 Features

### Music Catalog
- 511 songs with ISWC, ISRC, labels, albums
- Search and filter capabilities
- Export to CSV

### Network Profiles
- "Our Network Is Our Net Worth"
- 142 industry contacts
- 140 collaboration connections
- Visual network mapping

### Royalty Calculator
- Streaming royalties (Spotify, Apple Music, YouTube, etc.)
- Sync licensing fees
- Mechanical royalties
- Performance royalties

### Crypto Mining
- Bitcoin, Ethereum, Monero, Litecoin, Dogecoin
- Pool configuration
- Wallet management
- Earnings tracking

### Video Editor
- 3D effects and transitions
- AI enhancement
- Audio reactive effects
- Music video presets

### DSP Distribution
- Spotify, Apple Music, YouTube Music
- Amazon Music, Tidal, Deezer, SoundCloud
- Release management
- Analytics integration

---

## 🐐 About

**SUPER GOAT ROYALTIES** - The ultimate AI-powered creator platform.

Built for WAKA FLOCKA FLAME and the Brick Squad Monopoly network.

**100% Offline. No Login Required. Your Data, Your Control.**

---

## 📞 Contact

- **Publisher**: BRICK SQUAD MONOPOLY PUBLISHING
- **Email**: CRYSTAL@BSMMUSIC.COM
- **Address**: 339 MORGAN PL SE ATLANTA, GA 30317
- **PRO**: ASCAP

---

*Version 5.1.0 | © 2024 DJSPEEDYGA*