#!/bin/bash

# Deployment Script for GOAT Royalty Store Server
# Server: 72.61.193.184:8080

set -e

echo "🚀 Starting deployment to server..."

# Configuration
SERVER_IP="72.61.193.184"
SERVER_USER="root"  # Change if different
WEB_ROOT="/var/www/html"  # Change if different
SERVER_PORT="8080"

# Check if we have SSH access
if ! ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} "echo 'SSH connection successful'" 2>/dev/null; then
    echo "❌ Cannot connect to server via SSH"
    echo "Please ensure:"
    echo "1. SSH keys are set up"
    echo "2. Server IP is correct: ${SERVER_IP}"
    echo "3. SSH user is correct: ${SERVER_USER}"
    exit 1
fi

echo "✅ SSH connection successful"

# Check if web root exists
echo "📁 Checking web root directory..."
ssh ${SERVER_USER}@${SERVER_IP} "ls -la ${WEB_ROOT}" || {
    echo "❌ Web root not found: ${WEB_ROOT}"
    echo "Creating directory..."
    ssh ${SERVER_USER}@${SERVER_IP} "sudo mkdir -p ${WEB_ROOT}"
}

# Create backup
echo "💾 Creating backup..."
BACKUP_DIR="/var/www/backup_$(date +%Y%m%d_%H%M%S)"
ssh ${SERVER_USER}@${SERVER_IP} "sudo mkdir -p ${BACKUP_DIR} && sudo cp -r ${WEB_ROOT}/* ${BACKUP_DIR}/ 2>/dev/null || true"
echo "✅ Backup created at ${BACKUP_DIR}"

# Stop existing server if running
echo "🛑 Checking for running servers..."
ssh ${SERVER_USER}@${SERVER_IP} "sudo pkill -f 'python.*http.server' || true"
ssh ${SERVER_USER}@${SERVER_IP} "sudo pkill -f 'nginx' || true"
ssh ${SERVER_USER}@${SERVER_IP} "sudo pkill -f 'apache2' || true"

# Deploy files
echo "📤 Deploying files to server..."
scp -r web-app/* ${SERVER_USER}@${SERVER_IP}:/tmp/web-app/
ssh ${SERVER_USER}@${SERVER_IP} "sudo rsync -av /tmp/web-app/ ${WEB_ROOT}/ --delete"

# Set permissions
echo "🔧 Setting permissions..."
ssh ${SERVER_USER}@${SERVER_IP} "sudo chown -R www-data:www-data ${WEB_ROOT} || sudo chown -R ${SERVER_USER}:${SERVER_USER} ${WEB_ROOT}"
ssh ${SERVER_USER}@${SERVER_IP} "sudo chmod -R 755 ${WEB_ROOT}"

# Start simple HTTP server on port 8080
echo "🌐 Starting HTTP server on port ${SERVER_PORT}..."
ssh ${SERVER_USER}@${SERVER_IP} "nohup sudo -u www-data python3 -m http.server ${SERVER_PORT} --directory ${WEB_ROOT} > /tmp/http_server.log 2>&1 &"

# Wait for server to start
sleep 3

# Test deployment
echo "🧪 Testing deployment..."
if curl -s -o /dev/null -w "%{http_code}" http://${SERVER_IP}:${SERVER_PORT}/ | grep -q "200"; then
    echo "✅ Deployment successful!"
    echo "🌐 Server is running at http://${SERVER_IP}:${SERVER_PORT}/"
else
    echo "❌ Deployment failed - server not responding"
    echo "Checking server logs..."
    ssh ${SERVER_USER}@${SERVER_IP} "cat /tmp/http_server.log"
    exit 1
fi

# Test specific pages
echo "🔍 Testing key pages..."
PAGES=("index.html" "ai-models-download.html" "models.html" "downloads.html")
for page in "${PAGES[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" http://${SERVER_IP}:${SERVER_PORT}/${page})
    if [ "$status" = "200" ]; then
        echo "✅ ${page} - OK"
    else
        echo "⚠️  ${page} - Status: ${status}"
    fi
done

echo ""
echo "🎉 Deployment complete!"
echo "📦 Backup stored at: ${BACKUP_DIR}"
echo "🌐 Server running at: http://${SERVER_IP}:${SERVER_PORT}/"
echo "📊 Server logs: ssh ${SERVER_USER}@${SERVER_IP} 'cat /tmp/http_server.log'"