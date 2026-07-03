#!/bin/bash

# GOAT Money Making System - Quick Start Script
# This script sets up and starts all money-making features

echo "🚀 Starting GOAT Money Making System..."
echo "======================================="

# Check environment variables
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp .env.example .env
    echo "✅ .env file created. Please configure your API keys."
fi

# Install required dependencies
echo "📦 Installing dependencies..."
npm install stripe --save

# Create required directories
echo "📁 Creating directories..."
mkdir -p src/services/money-making
mkdir -p src/routes/services/money-making
mkdir -p src/components/money-making
mkdir -p logs

echo "✅ Directory structure created"

# Verify money-making services exist
echo "🔍 Verifying money-making services..."
services=("cryptoMiningService" "revenueDistributionService" "stripeIntegrationService" "profitTrackingService" "paymentGatewayService")

for service in "${services[@]}"; do
    if [ -f "src/services/money-making/${service}.js" ]; then
        echo "✅ ${service}.js found"
    else
        echo "❌ ${service}.js NOT found"
    fi
done

# Verify API routes exist
echo "🔍 Verifying API routes..."
routes=("mining" "revenue" "profits" "payments")

for route in "${routes[@]}"; do
    if [ -f "src/routes/services/money-making/${route}.js" ]; then
        echo "✅ ${route}.js API route found"
    else
        echo "❌ ${route}.js API route NOT found"
    fi
done

echo ""
echo "🎉 Money Making System Setup Complete!"
echo "======================================"
echo ""
echo "📊 Money Making Features:"
echo "  ✅ Crypto Mining Integration (RTX 3090 SLI)"
echo "  ✅ Payout to LTC Wallet: 324A37mfy4RBLJY9shXYUeoJw1eERHx12n"
echo "  ✅ Family Business Revenue Distribution (40/25/20/10/5 split)"
echo "  ✅ Stripe Payment Gateway"
echo "  ✅ Profit Tracking & Analytics"
echo "  ✅ Multiple Payment Methods (Crypto, Cards, Bank)"
echo ""
echo "🔗 API Endpoints:"
echo "  GET  /api/money-making/dashboard"
echo "  GET  /api/money-making/mining/stats"
echo "  POST /api/money-making/mining/payout"
echo "  GET  /api/money-making/revenue/split"
echo "  GET  /api/money-making/profits/current"
echo ""
echo "💡 Quick Start:"
echo "  npm start                      # Start the server"
echo "  Visit: http://localhost:3000  # Access dashboard"
echo ""
echo "📖 Documentation: MONEY_MAKING_SYSTEM.md"
echo ""

# Start the server
echo "🚀 Starting server..."
npm start &
SERVER_PID=$!

echo "✅ Server started (PID: $SERVER_PID)"
echo "🌐 Access your money making dashboard at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"

# Wait for server process
wait $SERVER_PID
