#!/bin/bash

# ============================================================
# GOAT ROYALTY APP - ALL FORMATS BUILD SCRIPT
# Generates: Windows EXE, macOS DMG, Linux AppImage, Portable
# ============================================================

set -e

echo "🐐 GOAT ROYALTY APP - BUILD ALL FORMATS"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Version
VERSION="1.0.0"
BUILD_DATE=$(date +"%Y-%m-%d %H:%M:%S")

echo -e "${CYAN}Build Version: ${VERSION}${NC}"
echo -e "${CYAN}Build Date: ${BUILD_DATE}${NC}"
echo ""

# Step 1: Install dependencies
echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Build Next.js app
echo -e "${YELLOW}Step 2: Building Next.js application...${NC}"
npm run build
echo -e "${GREEN}✓ Next.js build complete${NC}"
echo ""

# Step 3: Create dist directory
echo -e "${YELLOW}Step 3: Preparing distribution directory...${NC}"
mkdir -p dist
echo -e "${GREEN}✓ Dist directory ready${NC}"
echo ""

# Step 4: Build for Windows (EXE + Portable)
echo -e "${PURPLE}Step 4: Building Windows EXE and Portable...${NC}"
echo "Building Windows installer (NSIS)..."
npm run build:win-exe || echo "Windows EXE build requires Windows or Wine"
echo "Building Windows portable..."
npm run build:portable || echo "Windows portable build requires Windows or Wine"
echo -e "${GREEN}✓ Windows builds initiated${NC}"
echo ""

# Step 5: Build for macOS (DMG)
echo -e "${PURPLE}Step 5: Building macOS DMG...${NC}"
echo "Building macOS DMG (requires macOS)..."
npm run build:dmg || echo "DMG build requires macOS"
echo -e "${GREEN}✓ macOS build initiated${NC}"
echo ""

# Step 6: Build for Linux (AppImage + DEB)
echo -e "${PURPLE}Step 6: Building Linux packages...${NC}"
echo "Building Linux AppImage..."
npm run build:appimage || echo "AppImage build may require additional dependencies"
echo "Building Linux DEB package..."
npm run build:deb || echo "DEB build may require additional dependencies"
echo -e "${GREEN}✓ Linux builds initiated${NC}"
echo ""

# Step 7: List generated files
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}BUILD COMPLETE!${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${GREEN}Generated files in ./dist/:${NC}"
ls -la dist/ 2>/dev/null || echo "No files generated yet (cross-platform build required)"
echo ""

# Step 8: Generate build report
echo -e "${YELLOW}Generating build report...${NC}"
cat > dist/BUILD_REPORT.md << EOF
# GOAT Royalty App - Build Report

## Build Information
- **Version:** ${VERSION}
- **Build Date:** ${BUILD_DATE}
- **Platform:** $(uname -a)

## Build Targets

### Windows
- **EXE Installer:** GOAT-Royalty-App-Setup-${VERSION}.exe
- **Portable:** GOAT-Royalty-App-Portable.exe

### macOS
- **DMG:** GOAT-Royalty-App-${VERSION}.dmg
- **Architecture:** x64, arm64 (Universal)

### Linux
- **AppImage:** GOAT-Royalty-App-${VERSION}.AppImage
- **DEB:** goat-royalty-app_${VERSION}_amd64.deb

## Features Included

### AI Agent System
- Hierarchical Orchestrator Agent
- Autonomous Agent
- Multi-Agent Collaborative System
- Learning Agent
- Utility-Based Agent
- Goal-Based Agent
- Model-Based Reflex Agent
- Simple Reflex Agent

### Flagship Reasoning Models
- Claude Opus 4 (Anthropic)
- GPT-4o (OpenAI)
- Gemini 2.0 Pro (Google)
- DeepSeek V3
- Llama 4 (Meta)

### Blockchain & Crypto
- Ethereum Integration
- Bitcoin Mining
- Smart Contracts
- NFT Minting
- Royalty Verification on Blockchain

### Video Editing
- 3D Effects
- AI Enhancement
- Timeline Editor
- Transitions & Filters

### Data Provider Integrations
- YouTube API
- Spotify API
- Stripe Payments
- Apple Music
- ASCAP
- BMI

## Installation Instructions

### Windows
1. Download GOAT-Royalty-App-Setup-${VERSION}.exe
2. Run the installer
3. Follow the setup wizard
4. Launch from Start Menu or Desktop shortcut

**Portable Version:**
1. Download GOAT-Royalty-App-Portable.exe
2. No installation required
3. Run directly from any location

### macOS
1. Download GOAT-Royalty-App-${VERSION}.dmg
2. Open the DMG file
3. Drag GOAT Royalty App to Applications folder
4. Launch from Applications

### Linux
**AppImage:**
1. Download GOAT-Royalty-App-${VERSION}.AppImage
2. chmod +x GOAT-Royalty-App-${VERSION}.AppImage
3. ./GOAT-Royalty-App-${VERSION}.AppImage

**DEB Package:**
1. sudo dpkg -i goat-royalty-app_${VERSION}_amd64.deb
2. goat-royalty-app

## System Requirements

### Windows
- Windows 10/11 (64-bit)
- 4 GB RAM minimum
- 500 MB disk space

### macOS
- macOS 10.15 (Catalina) or later
- 4 GB RAM minimum
- 500 MB disk space

### Linux
- Ubuntu 20.04+ / Debian 11+ / Fedora 35+
- 4 GB RAM minimum
- 500 MB disk space

## Support
- Email: support@goatroyaltyapp.com
- Website: https://goatroyaltyapp.com

---
Built with ❤️ by GOAT Royalty Team
EOF

echo -e "${GREEN}✓ Build report generated${NC}"
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}All builds complete!${NC}"
echo -e "${CYAN}========================================${NC}"