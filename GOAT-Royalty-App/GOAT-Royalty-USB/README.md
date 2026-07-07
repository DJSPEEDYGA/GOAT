# 🐐 GOAT Royalty App - Portable USB Edition

**The Ultimate Music Catalog Management System with Uncensored AI**

## What is This?

GOAT Royalty App Portable USB Edition is a complete, self-contained music catalog management system that runs entirely from a USB drive. No installation required. No internet needed after initial setup. Your data stays with you.

### Key Features

- **🔌 Zero Install**: Plug in and run - no admin rights needed
- **🤖 Uncensored AI**: Built-in local AI assistant for catalog queries
- **🎤 Voice Control**: Speak your commands hands-free
- **📊 5,954+ Catalog Entries**: Complete Waka Flocka, Fastassman Publishing catalogs
- **🔒 Air-Gapped Operation**: Works completely offline
- **💿 Cross-Platform**: Windows, macOS, Linux support
- **💾 Persistent Data**: Chat history and settings saved locally

## Quick Start

### Windows
1. Double-click `Windows/start-goat.bat`
2. Browser opens automatically to the app

### macOS
1. Open Terminal
2. Navigate to the USB drive: `cd /Volumes/YOUR_USB/GOAT-Royalty-USB/Mac`
3. Run: `./start-goat.sh`
4. Or double-click `start-goat.sh` in Finder

### Linux
1. Open Terminal
2. Navigate to the USB drive: `cd /media/$USER/YOUR_USB/GOAT-Royalty-USB/Linux`
3. Run: `./start-goat.sh`

## Installation (Optional AI Models)

To enable the full AI assistant capabilities:

### Windows
1. Double-click `Windows/install.bat`
2. Select AI model to download
3. Wait for download to complete

### macOS
1. Open Terminal in the Mac folder
2. Run: `./install.sh`
3. Follow the prompts

### Linux
1. Open Terminal in the Linux folder
2. Run: `./install.sh`
3. Follow the prompts

## Available AI Models

| Model | Size | Description |
|-------|------|-------------|
| Gemma 2B Abliterated | ~1.4GB | Smallest, fastest |
| Qwen 2.5 3B Uncensored | ~2GB | Good balance |
| Llama 3.2 3B Uncensored | ~2GB | Latest architecture |
| Qwen 2.5 7B Uncensored | ~4.5GB | Most powerful |

## Folder Structure

```
GOAT-Royalty-USB/
├── Windows/
│   ├── start-goat.bat    # Main launcher
│   └── install.bat       # AI model installer
├── Mac/
│   ├── start-goat.sh     # Main launcher
│   └── install.sh        # AI model installer
├── Linux/
│   ├── start-goat.sh     # Main launcher
│   └── install.sh        # AI model installer
├── Shared/
│   ├── bin/              # Portable binaries
│   ├── models/           # AI model storage
│   ├── data/             # Catalog JSON data
│   ├── chat_data/        # Persistent chat history
│   ├── python/           # Portable Python (optional)
│   └── catalog/
│       └── index.html    # Main application
└── README.md             # This file
```

## Features

### AI Assistant
- Ask questions about your catalog
- Search for songs, artists, ISRC codes
- Get royalty calculations
- Voice input support

### Catalog Search
- 5,954+ entries from real catalogs
- Waka Flocka Flame complete discography
- Fastassman Publishing works
- Harvey Miller catalog
- ASCAP registration data

### Royalty Calculator
- Calculate splits and earnings
- Track payments
- Export reports

### Music & Movie Studios
- Access music studio tools
- Movie production tracking
- Asset management

## Privacy & Security

- **100% Local**: All data stays on your USB
- **No Cloud**: No internet required after setup
- **No Tracking**: Zero telemetry
- **Your Data**: Export or delete anytime

## System Requirements

- **Windows**: Windows 10/11 (64-bit)
- **macOS**: macOS 10.15+ (Catalina or later)
- **Linux**: Any modern distribution with Python 3

### For AI Features
- 4GB RAM minimum (8GB recommended)
- 2GB free space for smallest model
- 10GB for all models

## Troubleshooting

### "Permission denied" on Mac/Linux
```bash
chmod +x start-goat.sh
chmod +x install.sh
```

### "Python not found"
Install Python 3 from python.org or your package manager

### Port 3333 in use
Close other applications using port 3333, or edit the port in the launcher script

### AI not responding
1. Run the install script to download models
2. Ensure Ollama is running: `ollama serve`
3. Check model is downloaded: `ollama list`

## Credits

- **Catalog Data**: Waka Flocka Flame, Fastassman Publishing
- **AI Engine**: Ollama with uncensored models
- **Development**: NinjaTech AI

## License

This software is provided for legitimate music industry professionals. All catalog data is proprietary and confidential.

---

**🐐 GOAT Royalty App - Rule Your Music Empire**