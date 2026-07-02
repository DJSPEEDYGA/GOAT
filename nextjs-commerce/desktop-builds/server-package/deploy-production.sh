#!/bin/bash
# Production Deployment Script
# Upload this entire directory to your server

echo "🚀Deploying GOAT Royalty to Production Server..."

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install dependencies
npm install

# Start the server
npm start

echo "✅ Deployment complete!"
echo "Access your app at http://your-server-ip:3000"
