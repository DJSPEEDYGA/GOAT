#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# GOAT Royalty App - VPS Setup with RAID 0 Architecture
# HIGH LEVEL SECURITY
# ═══════════════════════════════════════════════════════════════════════════
# 
# This script sets up:
# - RAID 0 directory structure for INCOMING/OUTGOING data separation
# - Security hardening
# - Firewall configuration
# - Application deployment
#
# Run as root: sudo bash vps-setup.sh
# ═══════════════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "🐐 GOAT Royalty App - VPS Setup with RAID 0 Security Architecture"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

# Get VPS IP
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")
echo -e "${GREEN}Server IP: ${VPS_IP}${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 1: System Update
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 1] Updating system...${NC}"
apt update && apt upgrade -y
apt install -y curl wget git nginx ufw fail2ban

# ═══════════════════════════════════════════════════════════════════════════
# STEP 2: Create RAID 0 Directory Structure
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 2] Creating RAID 0 directory structure...${NC}"

# Base RAID 0 directory
mkdir -p /raid0

# INCOMING directories (isolated from outgoing)
mkdir -p /raid0/incoming/streams
mkdir -p /raid0/incoming/uploads
mkdir -p /raid0/incoming/api-inputs
mkdir -p /raid0/incoming/webhooks
mkdir -p /raid0/incoming/logs

# OUTGOING directories (isolated from incoming)
mkdir -p /raid0/outgoing/exports
mkdir -p /raid0/outgoing/reports
mkdir -p /raid0/outgoing/api-outputs
mkdir -p /raid0/outgoing/backups
mkdir -p /raid0/outgoing/logs

# Application directory
mkdir -p /raid0/app

# Set restrictive permissions (700 = only owner can access)
chmod 700 /raid0
chmod 700 /raid0/incoming
chmod 700 /raid0/outgoing
chmod 700 /raid0/incoming/streams
chmod 700 /raid0/incoming/uploads
chmod 700 /raid0/incoming/api-inputs
chmod 700 /raid0/incoming/webhooks
chmod 700 /raid0/outgoing/exports
chmod 700 /raid0/outgoing/reports
chmod 700 /raid0/outgoing/api-outputs
chmod 700 /raid0/outgoing/backups

echo -e "${GREEN}✓ RAID 0 directory structure created${NC}"
echo ""
echo "📁 Directory Structure:"
echo "   /raid0/"
echo "   ├── incoming/     (INCOMING DATA - Isolated)"
echo "   │   ├── streams/"
echo "   │   ├── uploads/"
echo "   │   ├── api-inputs/"
echo "   │   └── webhooks/"
echo "   └── outgoing/     (OUTGOING DATA - Isolated)"
echo "       ├── exports/"
echo "       ├── reports/"
echo "       ├── api-outputs/"
echo "       └── backups/"

# ═══════════════════════════════════════════════════════════════════════════
# STEP 3: Security Hardening
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 3] Security hardening...${NC}"

# Disable root SSH password login (optional - comment out if you need password access)
# sed -i 's/#PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config

# Disable unused services
systemctl disable bluetooth 2>/dev/null || true
systemctl disable cups 2>/dev/null || true

# Secure shared memory
echo "tmpfs /run/shm tmpfs defaults,noexec,nosuid 0 0" >> /etc/fstab

# Kernel hardening
cat >> /etc/sysctl.conf << 'EOF'
# Security hardening
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5
net.ipv4.conf.all.log_martians = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv6.conf.default.accept_source_route = 0
EOF
sysctl -p

echo -e "${GREEN}✓ Security hardening applied${NC}"

# ═══════════════════════════════════════════════════════════════════════════
# STEP 4: Firewall Configuration
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 4] Configuring firewall...${NC}"

# Reset firewall
ufw --force reset

# Default deny all incoming, allow all outgoing
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (port 22)
ufw allow 22/tcp comment 'SSH'

# Allow HTTP (port 80)
ufw allow 80/tcp comment 'HTTP'

# Allow HTTPS (port 443)
ufw allow 443/tcp comment 'HTTPS'

# Allow custom app port (3000) - internal only
# ufw allow from 127.0.0.1 to any port 3000

# Rate limit SSH
ufw limit 22/tcp

# Enable firewall
ufw --force enable

echo -e "${GREEN}✓ Firewall configured${NC}"
echo ""
echo "🔥 Firewall Rules:"
ufw status

# ═══════════════════════════════════════════════════════════════════════════
# STEP 5: Install Node.js
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 5] Installing Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version

# ═══════════════════════════════════════════════════════════════════════════
# STEP 6: Install PM2
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 6] Installing PM2...${NC}"
npm install -g pm2
pm2 startup | tail -1 | bash || true

# ═══════════════════════════════════════════════════════════════════════════
# STEP 7: Configure Nginx
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 7] Configuring Nginx...${NC}"

cat > /etc/nginx/sites-available/goat-royalty << 'EOF'
# GOAT Royalty App - Nginx Configuration
# HIGH LEVEL SECURITY

# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_conn_zone $binary_remote_addr zone=conn:10m;

# Security headers
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

server {
    listen 80;
    server_name _;

    # Security: Hide Nginx version
    server_tokens off;

    # Rate limiting
    limit_req zone=api burst=20 nodelay;
    limit_conn conn 10;

    # Logging
    access_log /var/log/nginx/goat-access.log;
    error_log /var/log/nginx/goat-error.log;

    # Main app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API endpoints with stricter rate limiting
    location /api/ {
        limit_req zone=api burst=5 nodelay;
        
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/goat-royalty /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart
nginx -t
systemctl restart nginx
systemctl enable nginx

echo -e "${GREEN}✓ Nginx configured${NC}"

# ═══════════════════════════════════════════════════════════════════════════
# STEP 8: Configure Fail2Ban
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 8] Configuring Fail2Ban...${NC}"

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
ignoreip = 127.0.0.1/8

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/*error.log

[nginx-botsearch]
enabled = true
port = http,https
filter = nginx-botsearch
logpath = /var/log/nginx/*access.log
EOF

systemctl restart fail2ban
systemctl enable fail2ban

echo -e "${GREEN}✓ Fail2Ban configured${NC}"

# ═══════════════════════════════════════════════════════════════════════════
# STEP 9: Create App User (Security Best Practice)
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 9] Creating app user...${NC}"

if ! id -u goatapp &>/dev/null; then
    useradd -r -s /bin/false -d /raid0/app goatapp
    echo -e "${GREEN}✓ User 'goatapp' created${NC}"
else
    echo -e "${BLUE}User 'goatapp' already exists${NC}"
fi

# Set ownership
chown -R goatapp:goatapp /raid0

# ═══════════════════════════════════════════════════════════════════════════
# STEP 10: Setup SSL with Let's Encrypt (Optional)
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${YELLOW}[STEP 10] SSL Setup (optional)...${NC}"
echo "To enable SSL, run: certbot --nginx -d yourdomain.com"

# ═══════════════════════════════════════════════════════════════════════════
# COMPLETE
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ VPS SETUP COMPLETE!${NC}"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "📊 System Status:"
echo "   - RAID 0 directories: /raid0/incoming and /raid0/outgoing"
echo "   - Firewall: Active (ports 22, 80, 443 open)"
echo "   - Fail2Ban: Active"
echo "   - Nginx: Running"
echo ""
echo "🚀 Next Steps:"
echo "   1. Upload your app to /raid0/app"
echo "   2. Run: cd /raid0/app && npm install"
echo "   3. Start with: pm2 start npm --name 'goat-royalty' -- start"
echo "   4. Save PM2 config: pm2 save"
echo ""
echo "🌐 Your app will be available at: http://${VPS_IP}"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"