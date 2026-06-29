#!/bin/bash

# GOAT Royalty App - Quick Server Deployment Script
# Run this script on your VPS to deploy the application

set -e

echo "🐐 GOAT Royalty App - Quick Server Deployment"
echo "=============================================="

# Variables
APP_DIR="/root/GOAT-Royalty-App2"
REPO_URL="https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git"
BRANCH="GOAT-APP"

# Step 1: Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker root
fi

# Step 2: Clone or update repository
if [ -d "$APP_DIR" ]; then
    echo "📥 Updating existing repository..."
    cd $APP_DIR
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
else
    echo "📥 Cloning repository..."
    git clone -b $BRANCH $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Step 3: Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'ENVEOF'
NEXT_PUBLIC_SUPABASE_URL=https://xmvlnonsxmrpvlssjstl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtdmxub25zeG1ycHZsc3Nqc3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3OTkzMTgsImV4cCI6MjA1ODM3NTMxOH0.ZXlKaGJHY2lPaU4xWWlJNk1qTSkuMC4wLjAuMA
GOOGLE_AI_API_KEY=AIzaSyBxvL_Ky3-gqNzHLxvEr0Zw8vPxMqYdN8E
NODE_ENV=production
PORT=3000
ENVEOF
    echo "⚠️  Please edit .env.local with your actual API keys if needed."
fi

# Step 4: Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Step 5: Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Step 6: Wait for app to start
echo "⏳ Waiting for application to start..."
sleep 15

# Step 7: Check if app is running
echo "🔍 Checking application status..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo ""
    echo "✅ SUCCESS! GOAT Royalty App is running!"
    echo "=============================================="
    echo "🌐 Access your app at:"
    echo "   - http://$(curl -s ifconfig.me):3000"
    echo "   - http://$(curl -s ifconfig.me) (via Nginx)"
    echo ""
    echo "📊 Health check: http://$(curl -s ifconfig.me):3000/api/health"
    echo ""
else
    echo "⚠️  Application may still be starting. Check logs:"
    echo "   docker-compose logs -f"
fi

echo ""
echo "📋 Useful commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop app:      docker-compose down"
echo "   Restart app:   docker-compose restart"
echo "   Status:        docker-compose ps"