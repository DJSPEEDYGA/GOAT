#!/bin/bash

# ============================================================================
# GOAT Royalty App - Quick Deployment Script
# ============================================================================
# Run this script directly on your VPS for instant production setup
# ============================================================================

set -e

echo "🚀 GOAT Royalty App - Quick Deployment"
echo "======================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# Install required packages
echo "📦 Installing required packages..."
apt-get install -y -qq nginx curl wget git python3 python3-pip ufw fail2ban openssl netcat-openbsd

# Create RAID 0 directory structure
echo "📁 Creating RAID 0 directory structure..."
mkdir -p /raid0/incoming/{streams,uploads,api-inputs,webhooks,metrics}
mkdir -p /raid0/outgoing/{exports,reports,api-outputs,backups,logs}
mkdir -p /raid0/app/{logs,keys} /raid0/keys
chmod 700 /raid0/keys

# Stop existing services
echo "🛑 Stopping existing services..."
pkill -f "python3 -m http.server" || true
systemctl stop goat-royalty 2>/dev/null || true

# Copy application files
echo "📦 Deploying application files..."
mkdir -p /raid0/app
if [ -f "./index.html" ] || [ -d "./client" ] || [ -d "./src" ]; then
    cp -r ./* /raid0/app/ 2>/dev/null || true
    echo "✓ Application files copied"
else
    echo "⚠ No application files found in current directory"
    echo "  Make sure you're in the app directory before running this script"
fi

# Create systemd service
echo "⚙️  Creating systemd service..."
cat > /etc/systemd/system/goat-royalty.service << 'EOF'
[Unit]
Description=GOAT Royalty App - AI Command Center
Documentation=https://github.com/DJSPEEDYGA/GOAT-Royalty-App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/raid0/app
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/python3 -m http.server 3000
Restart=always
RestartSec=10
StandardOutput=append:/raid0/app/logs/app.log
StandardError=append:/raid0/app/logs/error.log

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/raid0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable goat-royalty

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/goat-royalty << 'EOF'
upstream goat_royalty_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name _;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /raid0/outgoing/logs/nginx_access.log;
    error_log /raid0/outgoing/logs/nginx_error.log;

    # Main application
    location / {
        proxy_pass http://goat_royalty_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

ln -sf /etc/nginx/sites-available/goat-royalty /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Configure firewall
echo "🔒 Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Start services
echo "🚀 Starting services..."
systemctl start goat-royalty

# Wait for services to start
sleep 5

# Verification
echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "🌐 Access your app at:"
VPS_IP=$(curl -s ifconfig.me || echo "93.127.214.171")
echo "   http://$VPS_IP"
echo ""
echo "🔧 Service Commands:"
echo "   Status:  systemctl status goat-royalty"
echo "   Restart: systemctl restart goat-royalty"
echo "   Logs:    tail -f /raid0/app/logs/app.log"
echo ""
echo "🔒 Security Status:"
ufw status
echo ""
echo "=========================================="

# Show service status
systemctl status goat-royalty --no-pager