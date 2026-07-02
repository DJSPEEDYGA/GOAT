#!/bin/bash
# ============================================================
# 🐐⚡ SUPER GOAT ROYALTY APP - Server Deployment Script
# Deploy to Ubuntu Server 93.127.214.171
# ============================================================

set -e

echo "🐐⚡ Super GOAT Royalty App - Deployment Starting..."
echo "=================================================="

# Configuration
APP_DIR="$HOME/GOAT-Royalty-App2"
PORT=3002
HOST="0.0.0.0"

# Step 1: Navigate to app directory
echo ""
echo "📁 Step 1: Navigating to app directory..."
cd "$APP_DIR" || {
    echo "❌ App directory not found. Cloning repository..."
    cd "$HOME"
    git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
    cd "$APP_DIR"
}

# Step 2: Pull latest code
echo ""
echo "📥 Step 2: Pulling latest code from GitHub..."
git fetch origin GOAT-APP
git reset --hard origin/GOAT-APP
echo "✅ Code updated to latest main branch"

# Step 3: Install dependencies
echo ""
echo "📦 Step 3: Installing dependencies..."
npm install --production=false
echo "✅ Dependencies installed"

# Step 4: Build the app
echo ""
echo "🔨 Step 4: Building production app..."
npm run build
echo "✅ Build complete"

# Step 5: Stop existing processes
echo ""
echo "🛑 Step 5: Stopping existing processes..."
pkill -f "next start" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pm2 delete goat-app 2>/dev/null || true
pm2 delete super-goat 2>/dev/null || true
sleep 2
echo "✅ Old processes stopped"

# Step 6: Start with PM2
echo ""
echo "🚀 Step 6: Starting Super GOAT Royalty App..."
if command -v pm2 &> /dev/null; then
    pm2 start npm --name "super-goat" -- start -- -p $PORT -H $HOST
    pm2 save
    echo "✅ App started with PM2 on port $PORT"
    echo ""
    pm2 status
else
    echo "⚠️  PM2 not found, starting with nohup..."
    nohup npm start -- -p $PORT -H $HOST > app.log 2>&1 &
    echo "✅ App started with nohup on port $PORT (PID: $!)"
fi

# Step 7: Verify
echo ""
echo "=================================================="
echo "🐐⚡ SUPER GOAT ROYALTY APP - DEPLOYED!"
echo "=================================================="
echo ""
echo "🌐 Access your app at:"
echo "   http://93.127.214.171:$PORT"
echo "   http://93.127.214.171:$PORT/super-goat-command"
echo ""
echo "📊 Key Pages:"
echo "   /                    — Landing Page"
echo "   /super-goat-command  — 🐐 Super GOAT Command Center"
echo "   /dashboard           — Classic Dashboard"
echo "   /analytics           — Analytics"
echo "   /tracks              — Track Manager"
echo "   /publishing          — Publishing"
echo ""
echo "🔧 Management Commands:"
echo "   pm2 status           — Check app status"
echo "   pm2 logs super-goat  — View logs"
echo "   pm2 restart super-goat — Restart app"
echo ""
echo "🐐 Built by Harvey Miller (DJ Speedy) | GOAT Royalty © 2025"