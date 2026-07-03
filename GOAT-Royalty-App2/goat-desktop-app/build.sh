#!/bin/bash

# GOAT Royalty App - Build Script
# Builds EXE, DMG, and portable versions for all platforms

echo "🐐 GOAT Royalty App - Build Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Navigate to app directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for all platforms
echo ""
echo "🔨 Building for all platforms..."
echo ""

# Windows EXE and Portable
echo "🪟 Building Windows EXE and Portable..."
npm run build:win

# macOS DMG
echo ""
echo "🍎 Building macOS DMG..."
npm run build:mac

# Linux AppImage
echo ""
echo "🐧 Building Linux AppImage..."
npm run build:linux

echo ""
echo "✅ Build complete!"
echo ""
echo "Output files located in: $(pwd)/dist/"
ls -la dist/ 2>/dev/null || echo "Check dist folder for output files"