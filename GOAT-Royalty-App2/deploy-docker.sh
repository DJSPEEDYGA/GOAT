#!/bin/bash

# GOAT Royalty App - Docker Deployment Script
# This script deploys the application using Docker Compose

set -e

echo "🐐 GOAT Royalty App - Docker Deployment"
echo "========================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check for .env.local file
if [ ! -f .env.local ]; then
    echo "⚠️  No .env.local file found. Creating from .env.example..."
    cp .env.example .env.local
    echo "📝 Please edit .env.local with your actual API keys before running again."
    echo "   Required variables:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - GOOGLE_AI_API_KEY"
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

echo "🔧 Building Docker image..."
docker-compose build --no-cache

echo "🚀 Starting containers..."
docker-compose up -d

echo "⏳ Waiting for application to start..."
sleep 10

# Check if the app is running
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Application is running successfully!"
    echo "🌐 Access the app at: http://localhost:3000"
    echo "📊 Health check: http://localhost:3000/api/health"
else
    echo "⚠️  Application may not be fully started yet. Check logs with:"
    echo "   docker-compose logs -f"
fi

echo ""
echo "📋 Useful commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop app:      docker-compose down"
echo "   Restart app:   docker-compose restart"
echo "   Remove all:    docker-compose down -v"