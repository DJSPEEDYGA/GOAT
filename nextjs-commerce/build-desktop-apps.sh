#!/bin/bash

# ============================================================================
# GOAT Royalty App - Desktop Application Build Script
# ============================================================================
# This script builds the Electron app for Windows, macOS, and Linux
# ============================================================================

set -e

echo "🚀 Building GOAT Royalty App for Desktop Platforms..."
echo "======================================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Create build directory for icons
echo -e "${BLUE}🎨 Creating build directory...${NC}"
mkdir -p build

# Check if icons exist, if not create placeholder icons
if [ ! -f "build/icon.ico" ]; then
    echo -e "${YELLOW}⚠️  Warning: icon.ico not found, creating placeholder...${NC}"
    # Create a simple text file as placeholder (would need actual icon in production)
    echo "Icon placeholder - replace with actual icon.ico" > build/icon.ico
fi

if [ ! -f "build/icon.icns" ]; then
    echo -e "${YELLOW}⚠️  Warning: icon.icns not found, creating placeholder...${NC}"
    echo "Icon placeholder - replace with actual icon.icns" > build/icon.icns
fi

if [ ! -f "build/icon.png" ]; then
    echo -e "${YELLOW}⚠️  Warning: icon.png not found, creating placeholder...${NC}"
    echo "Icon placeholder - replace with actual icon.png" > build/icon.png
fi

# Step 1: Build the web application (client)
echo -e "${BLUE}📦 Building web application...${NC}"
cd client
npm install 2>/dev/null || echo "Dependencies already installed"
npm run build
cd ..

# Step 2: Build Windows executable
echo -e "${BLUE}🪟 Building Windows executable (.exe)...${NC}"
npm run build:win
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Windows build successful!${NC}"
    ls -lh dist-electron/*.exe 2>/dev/null || echo "Check dist-electron directory for output"
else
    echo -e "${RED}❌ Windows build failed!${NC}"
fi

# Step 3: Build macOS application
echo -e "${BLUE}🍎 Building macOS application (.dmg)...${NC}"
npm run build:mac
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ macOS build successful!${NC}"
    ls -lh dist-electron/*.dmg 2>/dev/null || echo "Check dist-electron directory for output"
else
    echo -e "${YELLOW}⚠️  macOS build skipped (may not work on Linux)${NC}"
fi

# Step 4: Build Linux application
echo -e "${BLUE}🐧 Building Linux application (AppImage, deb)...${NC}"
npm run build:linux
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Linux build successful!${NC}"
    ls -lh dist-electron/*.AppImage dist-electron/*.deb 2>/dev/null || echo "Check dist-electron directory for output"
else
    echo -e "${RED}❌ Linux build failed!${NC}"
fi

# Summary
echo ""
echo "======================================================"
echo -e "${GREEN}🎉 Build Process Complete!${NC}"
echo "======================================================"
echo ""
echo "📦 Output Directory: dist-electron/"
echo ""

# List all built files
if [ -d "dist-electron" ]; then
    echo "📁 Built Files:"
    ls -lh dist-electron/
    echo ""
    
    # Get file sizes
    TOTAL_SIZE=$(du -sh dist-electron | cut -f1)
    echo -e "${BLUE}📊 Total Size: $TOTAL_SIZE${NC}"
fi

echo ""
echo "🚀 Distribution:"
echo "   - Windows: Copy .exe file to Windows users"
echo "   - macOS: Copy .dmg file to Mac users"
echo "   - Linux: Copy .AppImage or .deb file to Linux users"
echo ""
echo "======================================================"