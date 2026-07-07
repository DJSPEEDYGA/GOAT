#!/bin/bash

# ============================================================================
# GOAT Royalty App - Complete Production Setup
# ============================================================================
# This script configures the app for production deployment with:
# - systemd service for auto-restart
# - Nginx reverse proxy with SSL support
# - RAID 0 data separation
# - Security hardening
# ============================================================================

set -e

echo "🚀 Starting GOAT Royalty App Production Setup..."
echo "================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="93.127.214.171"
APP_DIR="/raid0/app"
APP_PORT="3000"
DOMAIN="goatroyalty.com"  # Change to your domain
EMAIL="admin@goatroyalty.com"  # Change to your email

# Step 1: Kill existing Python server
echo -e "${YELLOW}📋 Step 1: Stopping existing services...${NC}"
pkill -f "python3 -m http.server" || echo "No existing Python server found"
systemctl stop goat-royalty 2>/dev/null || echo "Service not running yet"
echo -e "${GREEN}✓ Existing services stopped${NC}"

# Step 2: Create RAID 0 directory structure
echo -e "${YELLOW}📋 Step 2: Creating RAID 0 directory structure...${NC}"
mkdir -p /raid0/incoming/{streams,uploads,api-inputs,webhooks,metrics}
mkdir -p /raid0/outgoing/{exports,reports,api-outputs,backups,logs}
mkdir -p /raid0/app/logs
mkdir -p /raid0/keys
chmod 700 /raid0/keys
echo -e "${GREEN}✓ RAID 0 directory structure created${NC}"

# Step 3: Copy application files
echo -e "${YELLOW}📋 Step 3: Deploying application files...${NC}"
if [ ! -d "$APP_DIR" ]; then
    mkdir -p "$APP_DIR"
    cp -r ./* "$APP_DIR/" 2>/dev/null || echo "Copying files to $APP_DIR"
fi
echo -e "${GREEN}✓ Application files deployed${NC}"

# Step 4: Create systemd service
echo -e "${YELLOW}📋 Step 4: Creating systemd service...${NC}"
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
echo -e "${GREEN}✓ Systemd service created${NC}"

# Step 5: Configure Nginx
echo -e "${YELLOW}📋 Step 5: Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/goat-royalty << EOF
# GOAT Royalty App - Production Configuration
# RAID 0 Architecture with High-Level Security

# Rate limiting zones
limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=general_limit:10m rate=50r/s;

# Upstream configuration
upstream goat_royalty_backend {
    server 127.0.0.1:$APP_PORT;
    keepalive 64;
}

# HTTP Server (redirect to HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN $VPS_IP;

    # Allow ACME challenges for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other HTTP traffic to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration (will be configured by certbot)
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'" always;

    # Logging
    access_log /raid0/outgoing/logs/nginx_access.log;
    error_log /raid0/outgoing/logs/nginx_error.log;

    # RAID 0 Data Endpoints
    location /api/incoming/stream {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://goat_royalty_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/incoming/upload {
        limit_req zone=api_limit burst=10 nodelay;
        client_max_body_size 500M;
        proxy_pass http://goat_royalty_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/outgoing/export {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://goat_royalty_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files with caching
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://goat_royalty_backend;
    }

    # Main application
    location / {
        limit_req zone=general_limit burst=100 nodelay;
        proxy_pass http://goat_royalty_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Create symbolic link
ln -sf /etc/nginx/sites-available/goat-royalty /etc/nginx/sites-enabled/

# Remove default Nginx site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
echo -e "${GREEN}✓ Nginx configured successfully${NC}"

# Step 6: Setup SSL with Let's Encrypt (optional)
echo -e "${YELLOW}📋 Step 6: SSL Certificate Setup...${NC}"
read -p "Do you want to setup SSL with Let's Encrypt? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Install certbot if not present
    if ! command -v certbot &> /dev/null; then
        apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Create directory for ACME challenges
    mkdir -p /var/www/certbot
    
    # Obtain certificate
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive
    
    echo -e "${GREEN}✓ SSL certificate configured${NC}"
else
    echo -e "${YELLOW}⊘ Skipping SSL setup (HTTP only mode)${NC}"
    
    # Create self-signed certificate for HTTPS (optional)
    mkdir -p /etc/nginx/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/privkey.pem \
        -out /etc/nginx/ssl/fullchain.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
    
    echo -e "${GREEN}✓ Self-signed certificate created${NC}"
fi

# Step 7: Start services
echo -e "${YELLOW}📋 Step 7: Starting services...${NC}"
systemctl start goat-royalty
systemctl restart nginx

echo -e "${GREEN}✓ Services started${NC}"

# Step 8: Setup monitoring
echo -e "${YELLOW}📋 Step 8: Setting up monitoring...${NC}"
cat > /raid0/app/monitor.sh << 'EOF'
#!/bin/bash
# GOAT Royalty App Monitoring Script

while true; do
    # Check if service is running
    if ! systemctl is-active --quiet goat-royalty; then
        echo "$(date): goat-royalty service is down, restarting..." >> /raid0/app/logs/monitor.log
        systemctl restart goat-royalty
    fi
    
    # Check disk space
    DISK_USAGE=$(df /raid0 | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ $DISK_USAGE -gt 90 ]; then
        echo "$(date): WARNING: Disk usage is ${DISK_USAGE}%" >> /raid0/app/logs/monitor.log
    fi
    
    # Check memory usage
    MEM_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
    echo "$(date): Memory usage: ${MEM_USAGE}%" >> /raid0/app/logs/monitor.log
    
    sleep 300  # Check every 5 minutes
done
EOF

chmod +x /raid0/app/monitor.sh

# Create systemd service for monitoring
cat > /etc/systemd/system/goat-royalty-monitor.service << 'EOF'
[Unit]
Description=GOAT Royalty App Monitor
After=network.target

[Service]
Type=simple
User=root
ExecStart=/raid0/app/monitor.sh
Restart=always
RestartSec=60

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable goat-royalty-monitor
systemctl start goat-royalty-monitor

echo -e "${GREEN}✓ Monitoring configured${NC}"

# Step 9: Final verification
echo -e "${YELLOW}📋 Step 9: Final verification...${NC}"
sleep 5

# Check service status
if systemctl is-active --quiet goat-royalty; then
    echo -e "${GREEN}✓ GOAT Royalty service is running${NC}"
else
    echo -e "${RED}✗ GOAT Royalty service failed to start${NC}"
    systemctl status goat-royalty
fi

# Check Nginx status
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx is running${NC}"
else
    echo -e "${RED}✗ Nginx failed to start${NC}"
    systemctl status nginx
fi

# Test ports
if nc -z localhost 80; then
    echo -e "${GREEN}✓ Port 80 is accessible${NC}"
else
    echo -e "${RED}✗ Port 80 is not accessible${NC}"
fi

if nc -z localhost 443; then
    echo -e "${GREEN}✓ Port 443 is accessible${NC}"
else
    echo -e "${YELLOW}⊘ Port 443 is not accessible (SSL may not be configured)${NC}"
fi

# Step 10: Display access information
echo ""
echo "================================================"
echo -e "${GREEN}🎉 GOAT Royalty App Production Setup Complete!${NC}"
echo "================================================"
echo ""
echo "📍 App URL: http://$VPS_IP"
echo "📍 Domain: https://$DOMAIN (if configured)"
echo ""
echo "🔧 Service Management:"
echo "   - Start:   systemctl start goat-royalty"
echo "   - Stop:    systemctl stop goat-royalty"
echo "   - Restart: systemctl restart goat-royalty"
echo "   - Status:  systemctl status goat-royalty"
echo ""
echo "📊 Monitoring:"
echo "   - Logs:    tail -f /raid0/app/logs/app.log"
echo "   - Errors:  tail -f /raid0/app/logs/error.log"
echo "   - Monitor: systemctl status goat-royalty-monitor"
echo ""
echo "🔒 Security:"
echo "   - Firewall: ufw status"
echo "   - Fail2Ban: fail2ban-client status"
echo ""
echo "📁 RAID 0 Structure:"
echo "   - Incoming: /raid0/incoming/"
echo "   - Outgoing: /raid0/outgoing/"
echo "   - App:      /raid0/app/"
echo ""
echo "================================================"