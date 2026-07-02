#!/bin/bash

# GOAT Royalty App - Complete Build Script
# Builds desktop apps for all platforms: Windows, macOS, Linux, Portable

set -e

echo "🐐 GOAT ROYALTY APP - UNIVERSAL BUILDER"
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

# Detect OS
OS="$(uname -s)"
case "$OS" in
    Linux*)     MACHINE=Linux ;;
    Darwin*)    MACHINE=Mac ;;
    CYGWIN*)    MACHINE=Cygwin ;;
    MINGW*)     MACHINE=MinGw ;;
    *)          MACHINE="UNKNOWN:$OS" ;;
esac

echo -e "${CYAN}Detected OS: ${MACHINE}${NC}"
echo ""

# Configuration
APP_NAME="GOAT Royalty"
VERSION="4.0.0"
BUILD_DIR="$(pwd)/dist"
WEB_APP_DIR="$(pwd)/../web-app"

# Function to clean build directory
clean_build() {
    echo -e "${YELLOW}Cleaning build directory...${NC}"
    rm -rf "$BUILD_DIR"
    mkdir -p "$BUILD_DIR"
    echo -e "${GREEN}✓ Build directory cleaned${NC}"
}

# Function to install dependencies
install_deps() {
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
}

# Function to build for Windows
build_windows() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${PURPLE}🖥️  BUILDING FOR WINDOWS${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    
    # Build for Windows 64-bit
    echo -e "${YELLOW}Building Windows 64-bit installer...${NC}"
    npm run build:win:x64
    
    # Build for Windows 32-bit
    echo -e "${YELLOW}Building Windows 32-bit installer...${NC}"
    npm run build:win:ia32
    
    # Build portable version
    echo -e "${YELLOW}Building Windows portable version...${NC}"
    npm run build:portable
    
    echo ""
    echo -e "${GREEN}✅ WINDOWS BUILDS COMPLETE${NC}"
    echo -e "${GREEN}  - GOAT-Royalty-Setup-${VERSION}-x64.exe${NC}"
    echo -e "${GREEN}  - GOAT-Royalty-Setup-${VERSION}-ia32.exe${NC}"
    echo -e "${GREEN}  - GOAT-Royalty-Portable-${VERSION}.exe${NC}"
}

# Function to build for macOS
build_macos() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${PURPLE}🍎 BUILDING FOR macOS${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    
    # Build DMG for all architectures
    echo -e "${YELLOW}Building macOS Universal DMG...${NC}"
    npm run build:mac
    
    echo ""
    echo -e "${GREEN}✅ macOS BUILDS COMPLETE${NC}"
    echo -e "${GREEN}  - GOAT-Royalty-${VERSION}-universal.dmg${NC}"
    echo -e "${GREEN}  - GOAT-Royalty-${VERSION}-x64.dmg${NC}"
    echo -e "${GREEN}  - GOAT-Royalty-${VERSION}-arm64.dmg${NC}"
}

# Function to build for Linux
build_linux() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${PURPLE}🐧 BUILDING FOR LINUX${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    
    # Build AppImage
    echo -e "${YELLOW}Building Linux AppImage...${NC}"
    npm run build:linux
    
    echo ""
    echo -e "${GREEN}✅ LINUX BUILDS COMPLETE${NC}"
    echo -e "${GREEN}  - GOAT-Royalty-${VERSION}-x86_64.AppImage${NC}"
    echo -e "${GREEN}  - goat-royalty_${VERSION}_amd64.deb${NC}"
}

# Function to build with Tauri (lightweight)
build_tauri() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${PURPLE}🦀 BUILDING WITH TAURI (LIGHTWEIGHT)${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    
    # Check if Rust is installed
    if ! command -v cargo &> /dev/null; then
        echo -e "${RED}Rust is not installed. Please install Rust first:${NC}"
        echo -e "${CYAN}curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Building with Tauri...${NC}"
    npm run tauri:build
    
    echo ""
    echo -e "${GREEN}✅ TAURI BUILDS COMPLETE${NC}"
}

# Function to build all platforms
build_all() {
    echo ""
    echo -e "${PURPLE}🚀 BUILDING FOR ALL PLATFORMS${NC}"
    echo ""
    
    case "$MACHINE" in
        Mac)
            build_macos
            build_linux
            build_windows
            ;;
        Linux)
            build_linux
            build_windows
            # macOS requires Apple hardware for signing
            echo -e "${YELLOW}⚠️  macOS builds require Apple hardware for code signing${NC}"
            ;;
        *)
            build_windows
            build_linux
            echo -e "${YELLOW}⚠️  macOS builds require Apple hardware for code signing${NC}"
            ;;
    esac
}

# Function to create release package
create_release() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${PURPLE}📦 CREATING RELEASE PACKAGE${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    
    RELEASE_DIR="$BUILD_DIR/release-$VERSION"
    mkdir -p "$RELEASE_DIR"
    
    # Copy all builds
    cp -r "$BUILD_DIR"/*.exe "$RELEASE_DIR/" 2>/dev/null || true
    cp -r "$BUILD_DIR"/*.dmg "$RELEASE_DIR/" 2>/dev/null || true
    cp -r "$BUILD_DIR"/*.AppImage "$RELEASE_DIR/" 2>/dev/null || true
    cp -r "$BUILD_DIR"/*.deb "$RELEASE_DIR/" 2>/dev/null || true
    
    # Create checksums
    cd "$RELEASE_DIR"
    sha256sum * > checksums.sha256 2>/dev/null || shasum -a 256 * > checksums.sha256
    
    echo -e "${GREEN}✅ Release package created at: ${RELEASE_DIR}${NC}"
}

# Main menu
show_menu() {
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}   🐐 GOAT ROYALTY APP - BUILD MENU 🐐${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${GREEN}1.${NC} Build for Windows (exe, portable)"
    echo -e "  ${GREEN}2.${NC} Build for macOS (dmg, universal)"
    echo -e "  ${GREEN}3.${NC} Build for Linux (AppImage, deb)"
    echo -e "  ${GREEN}4.${NC} Build for ALL platforms"
    echo -e "  ${GREEN}5.${NC} Build with Tauri (lightweight)"
    echo -e "  ${GREEN}6.${NC} Clean and rebuild all"
    echo -e "  ${GREEN}7.${NC} Create release package"
    echo -e "  ${RED}Q.${NC} Quit"
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════${NC}"
}

# Interactive mode
interactive() {
    while true; do
        show_menu
        read -p "Enter your choice: " choice
        case $choice in
            1) build_windows ;;
            2) build_macos ;;
            3) build_linux ;;
            4) build_all ;;
            5) build_tauri ;;
            6) clean_build && build_all ;;
            7) create_release ;;
            Q|q) echo -e "${GREEN}Goodbye! 🐐${NC}"; exit 0 ;;
            *) echo -e "${RED}Invalid option. Please try again.${NC}" ;;
        esac
    done
}

# Parse command line arguments
case "$1" in
    --windows|-w)
        clean_build
        install_deps
        build_windows
        ;;
    --macos|-m)
        clean_build
        install_deps
        build_macos
        ;;
    --linux|-l)
        clean_build
        install_deps
        build_linux
        ;;
    --all|-a)
        clean_build
        install_deps
        build_all
        ;;
    --tauri|-t)
        clean_build
        install_deps
        build_tauri
        ;;
    --clean|-c)
        clean_build
        ;;
    --release|-r)
        create_release
        ;;
    --help|-h)
        echo "GOAT Royalty App Build Script"
        echo ""
        echo "Usage: ./build.sh [OPTION]"
        echo ""
        echo "Options:"
        echo "  -w, --windows    Build for Windows"
        echo "  -m, --macos      Build for macOS"
        echo "  -l, --linux      Build for Linux"
        echo "  -a, --all        Build for all platforms"
        echo "  -t, --tauri      Build with Tauri (lightweight)"
        echo "  -c, --clean      Clean build directory"
        echo "  -r, --release    Create release package"
        echo "  -h, --help       Show this help message"
        echo ""
        echo "Running without arguments starts interactive mode."
        ;;
    *)
        interactive
        ;;
esac

echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   🐐 GOAT ROYALTY BUILD COMPLETE! 🐐${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"