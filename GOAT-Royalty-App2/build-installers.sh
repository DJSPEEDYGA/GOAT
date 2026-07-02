#!/bin/bash
# GOAT Royalty App - Desktop Installer Build Script
# This script builds Windows EXE, macOS DMG, and Linux packages

set -e

echo "🐐 GOAT Royalty App - Building Desktop Installers"
echo "================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the deploy-package directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build Next.js application
echo "🔨 Building Next.js application..."
npm run build

# Create output directory
mkdir -p dist

# Build for different platforms
echo ""
echo "Choose build target:"
echo "1) Windows EXE + Portable"
echo "2) macOS DMG"
echo "3) Linux AppImage"
echo "4) All platforms"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo "🪟 Building Windows packages..."
        npx electron-builder --win --x64
        ;;
    2)
        echo "🍎 Building macOS packages..."
        npx electron-builder --mac --x64
        ;;
    3)
        echo "🐧 Building Linux packages..."
        npx electron-builder --linux --x64
        ;;
    4)
        echo "🌍 Building all platforms..."
        npx electron-builder --win --x64
        npx electron-builder --mac --x64
        npx electron-builder --linux --x64
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✅ Build complete! Check the 'dist' directory for output files."
echo ""
ls -la dist/