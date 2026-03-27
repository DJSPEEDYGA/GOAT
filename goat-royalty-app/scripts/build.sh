#!/bin/bash

# ================================================================
# GOAT Royalty App - Universal Build Script
# ================================================================
# This script builds GOAT for all platforms: Windows (EXE), macOS (DMG), and Portable
# 
# Usage:
#   ./build.sh              # Build for current platform
#   ./build.sh --all        # Build for all platforms
#   ./build.sh --windows    # Build Windows EXE
#   ./build.sh --macos      # Build macOS DMG
#   ./build.sh --portable   # Build portable version
# ================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# App Info
APP_NAME="GOAT"
APP_VERSION="1.0.0"
APP_AUTHOR="DJ Speedy"

echo -e "${PURPLE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     ██████╗  ██████╗ ███████╗     ██████╗ ██████╗  ██████╗ ║"
echo "║    ██╔════╝ ██╔═══██╗██╔════╝    ██╔════╝ ██╔══██╗██╔═══██╗║"
echo "║    ██║      ██║   ██║█████╗      ██║      ██████╔╝██║   ██║║"
echo "║    ██║      ██║   ██║██╔══╝      ██║      ██╔═══╝ ██║   ██║║"
echo "║    ╚██████╗ ╚██████╔╝███████╗    ╚██████╗ ██║     ╚██████╔╝║"
echo "║     ╚═════╝  ╚═════╝ ╚══════╝     ╚═════╝ ╚═╝      ╚═════╝ ║"
echo "║                                                            ║"
echo "║        All-in-One AI-Powered Royalty App                   ║"
echo "║        \"IF YOU CAN THINK IT! You CAN DO IT IN THE APP\"     ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${CYAN}Building ${APP_NAME} v${APP_VERSION}...${NC}"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is required but not installed.${NC}"
    exit 1
fi

# Check Node.js (for Tauri)
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Installing frontend dependencies...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Create build directory
BUILD_DIR="./build"
DIST_DIR="./dist"
mkdir -p $BUILD_DIR $DIST_DIR

# ================================================================
# Install Dependencies
# ================================================================
echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Python dependencies
if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt --quiet
fi

# Node.js dependencies
if [ -f "package.json" ]; then
    npm install --silent
fi

# ================================================================
# Build Backend (Python)
# ================================================================
echo -e "${BLUE}🐍 Building Python backend...${NC}"

# Create PyInstaller spec
cat > goat.spec << 'EOF'
# -*- mode: python ; coding: utf-8 -*-
import sys
from PyInstaller.building.build_main import build_pyzi

block_cipher = None

a = Analysis(
    ['src/core/main.py'],
    pathex=[],
    binaries=[],
    datas=[('src/frontend', 'frontend'), ('assets', 'assets')],
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'langchain',
        'langgraph',
        'crewai',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='GOAT',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='assets/goat.ico' if sys.platform == 'win32' else None,
)
EOF

# ================================================================
# Build Frontend
# ================================================================
echo -e "${BLUE}🌐 Building frontend...${NC}"

# Copy frontend to public directory
mkdir -p public
cp -r src/frontend/* public/

# ================================================================
# Build Functions
# ================================================================

build_windows() {
    echo -e "${YELLOW}🪟 Building Windows EXE...${NC}"
    
    # Install PyInstaller
    pip3 install pyinstaller --quiet
    
    # Build with PyInstaller
    pyinstaller --onefile --windowed \
        --name "GOAT" \
        --icon="assets/goat.ico" \
        --add-data "src/frontend:frontend" \
        --add-data "assets:assets" \
        --hidden-import "uvicorn.logging" \
        --hidden-import "uvicorn.loops.auto" \
        --hidden-import "uvicorn.protocols.http.auto" \
        --hidden-import "uvicorn.protocols.websockets.auto" \
        --hidden-import "uvicorn.lifespan.on" \
        src/core/main.py
    
    # Move to dist
    mv dist/GOAT.exe dist/GOAT-Windows-x64.exe 2>/dev/null || true
    
    echo -e "${GREEN}✅ Windows EXE built: dist/GOAT-Windows-x64.exe${NC}"
}

build_macos() {
    echo -e "${YELLOW}🍎 Building macOS DMG...${NC}"
    
    # Install PyInstaller
    pip3 install pyinstaller --quiet
    
    # Build with PyInstaller
    pyinstaller --onefile --windowed \
        --name "GOAT" \
        --osx-bundle-identifier "com.goat.royalty" \
        --add-data "src/frontend:frontend" \
        --add-data "assets:assets" \
        --hidden-import "uvicorn.logging" \
        --hidden-import "uvicorn.loops.auto" \
        --hidden-import "uvicorn.protocols.http.auto" \
        --hidden-import "uvicorn.protocols.websockets.auto" \
        --hidden-import "uvicorn.lifespan.on" \
        src/core/main.py
    
    # Create DMG
    if command -v hdiutil &> /dev/null; then
        mkdir -p dist/dmg
        cp dist/GOAT dist/dmg/GOAT.app
        hdiutil create -volname "GOAT" -srcfolder dist/dmg -ov -format UDZO dist/GOAT-macOS.dmg
        rm -rf dist/dmg
        echo -e "${GREEN}✅ macOS DMG built: dist/GOAT-macOS.dmg${NC}"
    else
        echo -e "${GREEN}✅ macOS app built: dist/GOAT${NC}"
    fi
}

build_portable() {
    echo -e "${YELLOW}📦 Building Portable version...${NC}"
    
    PORTABLE_DIR="dist/GOAT-Portable"
    mkdir -p $PORTABLE_DIR
    
    # Copy Python files
    cp -r src $PORTABLE_DIR/
    cp requirements.txt $PORTABLE_DIR/
    cp -r assets $PORTABLE_DIR/ 2>/dev/null || mkdir -p $PORTABLE_DIR/assets
    
    # Create launcher script
    cat > $PORTABLE_DIR/GOAT.sh << 'LAUNCHER'
#!/bin/bash
cd "$(dirname "$0")"
pip install -r requirements.txt --quiet 2>/dev/null
python3 src/core/main.py
LAUNCHER
    chmod +x $PORTABLE_DIR/GOAT.sh
    
    # Windows launcher
    cat > $PORTABLE_DIR/GOAT.bat << 'LAUNCHER_WIN'
@echo off
cd /d "%~dp0"
pip install -r requirements.txt --quiet 2>nul
python src\core\main.py
LAUNCHER_WIN
    
    # Create README
    cat > $PORTABLE_DIR/README.md << 'README'
# GOAT - Portable Version

## Quick Start

### Linux/macOS:
```bash
chmod +x GOAT.sh
./GOAT.sh
```

### Windows:
```cmd
GOAT.bat
```

## Requirements
- Python 3.11+
- Internet connection for first run

## Features
- 🤖 AI Assistant (215+ LLMs)
- 💰 Royalty Tracking
- ⛓️ Blockchain Verification
- 🎵 DSP Distribution
- 🎬 Video Editing
- ⛏️ Crypto Mining
- 📊 Analytics

---
"IF YOU CAN THINK IT! You CAN DO IT IN THE APP" — DJ Speedy
README
    
    # Create zip
    cd dist
    zip -r GOAT-Portable.zip GOAT-Portable
    cd ..
    
    echo -e "${GREEN}✅ Portable version built: dist/GOAT-Portable.zip${NC}"
}

build_tauri() {
    echo -e "${YELLOW}🦀 Building Tauri desktop app...${NC}"
    
    # Check Rust
    if ! command -v rustc &> /dev/null; then
        echo -e "${YELLOW}Installing Rust...${NC}"
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source ~/.cargo/env
    fi
    
    # Install Tauri CLI
    npm install -g @tauri-apps/cli
    
    # Build Tauri app
    npm run tauri:build
    
    echo -e "${GREEN}✅ Tauri app built${NC}"
}

# ================================================================
# Main Build Logic
# ================================================================

case "$1" in
    --all)
        build_windows 2>/dev/null || echo -e "${YELLOW}Windows build skipped (run on Windows)${NC}"
        build_macos 2>/dev/null || echo -e "${YELLOW}macOS build skipped (run on macOS)${NC}"
        build_portable
        ;;
    --windows)
        build_windows
        ;;
    --macos)
        build_macos
        ;;
    --portable)
        build_portable
        ;;
    --tauri)
        build_tauri
        ;;
    *)
        # Build for current platform
        if [[ "$OSTYPE" == "darwin"* ]]; then
            build_macos
        elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
            build_windows
        else
            build_portable
        fi
        ;;
esac

# ================================================================
# Summary
# ================================================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  ✅ BUILD COMPLETE                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Output files:${NC}"
ls -la dist/ 2>/dev/null || echo "No build artifacts found"
echo ""
echo -e "${PURPLE}\"IF YOU CAN THINK IT! You CAN DO IT IN THE APP\"${NC}"
echo -e "${GRAY}— DJ Speedy${NC}"