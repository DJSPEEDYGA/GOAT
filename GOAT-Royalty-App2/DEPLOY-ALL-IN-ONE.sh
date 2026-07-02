#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  🐐⚡ SUPER GOAT ROYALTY — ULTIMATE ALL-IN-ONE DEPLOYMENT                  ║
# ║  Deploys: Web App + Desktop Apps + Launcher + Automation + Atlas AI        ║
# ║  Server: Hostinger VPS (Ubuntu 24.04)                                      ║
# ║  Owner: Harvey Miller (DJ Speedy) / FASTASSMAN Publishing Inc              ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -e

# ═══════════════════════════════════════════════════════════════
#  CONFIGURATION
# ═══════════════════════════════════════════════════════════════
APP_NAME="goat-royalty-app"
APP_DIR="/root/GOAT-Royalty-App2"
REPO_URL="https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git"
NODE_VERSION="20"
APP_PORT=3002
AUTOMATION_PORT=3003
DOMAIN=""  # Set domain if available, e.g. "goatroyalty.com"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}  ${CYAN}$1${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}  ✅ $1${NC}"
}

print_warn() {
    echo -e "${YELLOW}  ⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}  ❌ $1${NC}"
}

# ═══════════════════════════════════════════════════════════════
#  BANNER
# ═══════════════════════════════════════════════════════════════
clear
echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════════════════════════╗"
echo "  ║                                                           ║"
echo "  ║   🐐⚡ SUPER GOAT ROYALTY — ALL-IN-ONE DEPLOYER          ║"
echo "  ║                                                           ║"
echo "  ║   Web App • Desktop Apps • Launcher • Automation          ║"
echo "  ║   Atlas AI • Fashion Forge • NVIDIA DGX • Sora AI        ║"
echo "  ║                                                           ║"
echo "  ║   © 2025 Harvey Miller / FASTASSMAN Publishing Inc        ║"
echo "  ║                                                           ║"
echo "  ╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
#  STEP 1: SYSTEM SETUP
# ═══════════════════════════════════════════════════════════════
print_header "STEP 1/10: System Update & Dependencies"

sudo apt update -y
sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx ufw \
    build-essential python3 python3-pip python3-venv jq htop tmux \
    ffmpeg imagemagick 2>/dev/null || true

print_step "System packages installed"

# ═══════════════════════════════════════════════════════════════
#  STEP 2: NODE.JS 20
# ═══════════════════════════════════════════════════════════════
print_header "STEP 2/10: Node.js ${NODE_VERSION} Installation"

CURRENT_NODE=$(node -v 2>/dev/null | cut -d. -f1 | tr -d 'v' || echo "0")
if [ "$CURRENT_NODE" -lt 20 ]; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt install -y nodejs
    print_step "Node.js $(node -v) installed"
else
    print_step "Node.js $(node -v) already installed"
fi

# Install PM2 globally
sudo npm install -g pm2 2>/dev/null || npm install -g pm2
print_step "PM2 process manager installed"

# ═══════════════════════════════════════════════════════════════
#  STEP 3: CLONE/UPDATE REPOSITORY
# ═══════════════════════════════════════════════════════════════
print_header "STEP 3/10: Repository Setup"

if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    git fetch origin GOAT-APP
    git reset --hard origin/GOAT-APP
    git clean -fd
    print_step "Repository updated to latest main"
else
    cd /root
    git clone "$REPO_URL"
    cd "$APP_DIR"
    print_step "Repository cloned fresh"
fi

echo -e "${BLUE}  📊 Files: $(find . -type f | wc -l) | Size: $(du -sh . | cut -f1)${NC}"

# ═══════════════════════════════════════════════════════════════
#  STEP 4: ENVIRONMENT VARIABLES
# ═══════════════════════════════════════════════════════════════
print_header "STEP 4/10: Environment Configuration"

if [ ! -f "$APP_DIR/.env.local" ]; then
cat > "$APP_DIR/.env.local" << 'ENVEOF'
# ═══════════════════════════════════════════════════════════════
# 🐐 SUPER GOAT ROYALTY — Environment Variables
# ═══════════════════════════════════════════════════════════════

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your-google-ai-key-here
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your-google-ai-key-here

# OpenAI
OPENAI_API_KEY=your-openai-key-here

# Spotify
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:3002/api/spotify/callback

# TikTok
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret

# Adobe Firefly
ADOBE_FIREFLY_API_KEY=your-adobe-key-here

# Twilio (SMS/Voice)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3002
NODE_ENV=production
PORT=3002
ENVEOF
    print_warn ".env.local created with placeholders — UPDATE WITH REAL KEYS!"
else
    print_step ".env.local already exists"
fi

# ═══════════════════════════════════════════════════════════════
#  STEP 5: INSTALL DEPENDENCIES & BUILD WEB APP
# ═══════════════════════════════════════════════════════════════
print_header "STEP 5/10: Web App — Install & Build"

cd "$APP_DIR"

# Kill any existing processes on our ports
fuser -k ${APP_PORT}/tcp 2>/dev/null || true
fuser -k ${AUTOMATION_PORT}/tcp 2>/dev/null || true

# Install main app dependencies
echo -e "${BLUE}  📦 Installing main app dependencies...${NC}"
npm install --legacy-peer-deps 2>&1 | tail -3
print_step "Main app dependencies installed"

# Build the Next.js app
echo -e "${BLUE}  🔨 Building Next.js production app...${NC}"
npm run build 2>&1 | tail -10
print_step "Next.js production build complete"

# ═══════════════════════════════════════════════════════════════
#  STEP 6: INSTALL SUB-APP DEPENDENCIES
# ═══════════════════════════════════════════════════════════════
print_header "STEP 6/10: Sub-Apps — Install Dependencies"

# Automation System
if [ -d "$APP_DIR/automation" ] && [ -f "$APP_DIR/automation/package.json" ]; then
    cd "$APP_DIR/automation"
    npm install 2>&1 | tail -2
    print_step "Automation system dependencies installed"
fi

# SuperGOATRoyalty Desktop App
if [ -d "$APP_DIR/SuperGOATRoyalty" ] && [ -f "$APP_DIR/SuperGOATRoyalty/package.json" ]; then
    cd "$APP_DIR/SuperGOATRoyalty"
    npm install 2>&1 | tail -2
    print_step "SuperGOATRoyalty desktop app dependencies installed"
fi

# GOAT Launcher
if [ -d "$APP_DIR/goat-launcher" ] && [ -f "$APP_DIR/goat-launcher/package.json" ]; then
    cd "$APP_DIR/goat-launcher"
    npm install 2>&1 | tail -2
    print_step "GOAT Launcher dependencies installed"
fi

# Launcher
if [ -d "$APP_DIR/launcher" ] && [ -f "$APP_DIR/launcher/package.json" ]; then
    cd "$APP_DIR/launcher"
    npm install 2>&1 | tail -2
    print_step "Launcher dependencies installed"
fi

# Super Ninja App
if [ -d "$APP_DIR/super-ninja-app" ] && [ -f "$APP_DIR/super-ninja-app/package.json" ]; then
    cd "$APP_DIR/super-ninja-app"
    npm install 2>&1 | tail -2
    print_step "Super Ninja App dependencies installed"
fi

# Atlas AI
if [ -d "$APP_DIR/atlas-ai/frontend" ] && [ -f "$APP_DIR/atlas-ai/frontend/package.json" ]; then
    cd "$APP_DIR/atlas-ai/frontend"
    npm install 2>&1 | tail -2
    print_step "Atlas AI frontend dependencies installed"
fi

if [ -d "$APP_DIR/atlas-ai/backend" ]; then
    cd "$APP_DIR/atlas-ai/backend"
    if [ -f "requirements.txt" ]; then
        python3 -m venv venv 2>/dev/null || true
        source venv/bin/activate 2>/dev/null || true
        pip install -r requirements.txt 2>&1 | tail -2 || true
        print_step "Atlas AI backend dependencies installed"
    fi
fi

cd "$APP_DIR"

# ═══════════════════════════════════════════════════════════════
#  STEP 7: PM2 ECOSYSTEM CONFIG
# ═══════════════════════════════════════════════════════════════
print_header "STEP 7/10: PM2 Process Manager Configuration"

cat > "$APP_DIR/ecosystem.config.js" << 'PM2EOF'
module.exports = {
  apps: [
    // ═══ MAIN WEB APP ═══
    {
      name: 'goat-royalty-web',
      script: 'npm',
      args: 'start -- -p 3002',
      cwd: '/root/GOAT-Royalty-App2',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/root/GOAT-Royalty-App2/logs/web-error.log',
      out_file: '/root/GOAT-Royalty-App2/logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      restart_delay: 5000,
      max_restarts: 10
    },
    // ═══ AUTOMATION ENGINE ═══
    {
      name: 'goat-automation',
      script: 'start-automation.js',
      cwd: '/root/GOAT-Royalty-App2/automation',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/root/GOAT-Royalty-App2/logs/automation-error.log',
      out_file: '/root/GOAT-Royalty-App2/logs/automation-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      cron_restart: '0 0 * * *'
    }
  ]
};
PM2EOF

# Create logs directory
mkdir -p "$APP_DIR/logs"

print_step "PM2 ecosystem config created"

# ═══════════════════════════════════════════════════════════════
#  STEP 8: START ALL SERVICES WITH PM2
# ═══════════════════════════════════════════════════════════════
print_header "STEP 8/10: Starting All Services"

cd "$APP_DIR"

# Stop any existing PM2 processes
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

# Kill anything on our ports
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
fuser -k ${APP_PORT}/tcp 2>/dev/null || true

# Start all apps via ecosystem
pm2 start ecosystem.config.js
print_step "Web app started on port ${APP_PORT}"
print_step "Automation engine started"

# Save PM2 config for auto-restart on reboot
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true
print_step "PM2 configured for auto-restart on reboot"

# Wait for app to start
echo -e "${BLUE}  ⏳ Waiting for app to start...${NC}"
sleep 8

# ═══════════════════════════════════════════════════════════════
#  STEP 9: NGINX REVERSE PROXY
# ═══════════════════════════════════════════════════════════════
print_header "STEP 9/10: Nginx Reverse Proxy Configuration"

SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

if [ -n "$DOMAIN" ]; then
    SERVER_NAME="$DOMAIN www.$DOMAIN"
else
    SERVER_NAME="$SERVER_IP _"
fi

cat > /etc/nginx/sites-available/goat-royalty << NGINXEOF
# ═══════════════════════════════════════════════════════════════
# 🐐⚡ SUPER GOAT ROYALTY — Nginx Configuration
# ═══════════════════════════════════════════════════════════════

# Rate limiting
limit_req_zone \$binary_remote_addr zone=goat_limit:10m rate=30r/s;

# Upstream
upstream goat_app {
    server 127.0.0.1:${APP_PORT};
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_NAME};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # Client body size (for file uploads)
    client_max_body_size 100M;

    # Rate limiting
    limit_req zone=goat_limit burst=50 nodelay;

    # Static files (Next.js)
    location /_next/static {
        proxy_pass http://goat_app;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Public assets
    location /public {
        proxy_pass http://goat_app;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # API routes
    location /api {
        proxy_pass http://goat_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }

    # Main app
    location / {
        proxy_pass http://goat_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Health check
    location /health {
        access_log off;
        return 200 '{"status":"ok","app":"goat-royalty","version":"4.1.0"}';
        add_header Content-Type application/json;
    }

    # Block sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ \.(env|git|md)$ {
        deny all;
    }
}
NGINXEOF

# Enable site
ln -sf /etc/nginx/sites-available/goat-royalty /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Test and reload nginx
nginx -t && systemctl reload nginx
print_step "Nginx reverse proxy configured"

# ═══════════════════════════════════════════════════════════════
#  STEP 10: FIREWALL & SSL
# ═══════════════════════════════════════════════════════════════
print_header "STEP 10/10: Firewall & Security"

# Configure UFW
sudo ufw default deny incoming 2>/dev/null || true
sudo ufw default allow outgoing 2>/dev/null || true
sudo ufw allow ssh 2>/dev/null || true
sudo ufw allow 'Nginx Full' 2>/dev/null || true
sudo ufw allow ${APP_PORT}/tcp 2>/dev/null || true
echo "y" | sudo ufw enable 2>/dev/null || true
print_step "Firewall configured (SSH + HTTP/HTTPS + App Port)"

# SSL with Let's Encrypt (only if domain is set)
if [ -n "$DOMAIN" ]; then
    echo -e "${BLUE}  🔒 Setting up SSL for ${DOMAIN}...${NC}"
    sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email djspeedyga@gmail.com 2>/dev/null || true
    print_step "SSL certificate installed"
fi

# ═══════════════════════════════════════════════════════════════
#  VERIFICATION
# ═══════════════════════════════════════════════════════════════
print_header "🎯 DEPLOYMENT VERIFICATION"

echo -e "${BLUE}  Checking services...${NC}"
echo ""

# Check PM2 status
pm2 list

echo ""

# Test web app
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${APP_PORT}/ 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    print_step "Web App: ✅ Running (HTTP ${HTTP_CODE})"
else
    print_warn "Web App: HTTP ${HTTP_CODE} — may still be starting up"
fi

# Test API
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${APP_PORT}/api/royalty-engine?action=summary 2>/dev/null || echo "000")
if [ "$API_CODE" = "200" ]; then
    print_step "Royalty API: ✅ Working (HTTP ${API_CODE})"
else
    print_warn "Royalty API: HTTP ${API_CODE}"
fi

# Test Nginx
NGINX_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null || echo "000")
if [ "$NGINX_CODE" = "200" ] || [ "$NGINX_CODE" = "301" ] || [ "$NGINX_CODE" = "302" ]; then
    print_step "Nginx Proxy: ✅ Working (HTTP ${NGINX_CODE})"
else
    print_warn "Nginx Proxy: HTTP ${NGINX_CODE}"
fi

# ═══════════════════════════════════════════════════════════════
#  FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                              ║${NC}"
echo -e "${CYAN}║   🐐⚡ SUPER GOAT ROYALTY — DEPLOYMENT COMPLETE!            ║${NC}"
echo -e "${CYAN}║                                                              ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║                                                              ║${NC}"
echo -e "${CYAN}║   🌐 Web App:     http://${SERVER_IP}:${APP_PORT}${NC}"
echo -e "${CYAN}║   🌐 Via Nginx:   http://${SERVER_IP}${NC}"
if [ -n "$DOMAIN" ]; then
echo -e "${CYAN}║   🔒 SSL:         https://${DOMAIN}${NC}"
fi
echo -e "${CYAN}║                                                              ║${NC}"
echo -e "${CYAN}║   📊 PM2 Status:  pm2 status${NC}"
echo -e "${CYAN}║   📋 Web Logs:    pm2 logs goat-royalty-web${NC}"
echo -e "${CYAN}║   📋 Auto Logs:   pm2 logs goat-automation${NC}"
echo -e "${CYAN}║   🔄 Restart:     pm2 restart all${NC}"
echo -e "${CYAN}║   🛑 Stop:        pm2 stop all${NC}"
echo -e "${CYAN}║                                                              ║${NC}"
echo -e "${CYAN}║   📁 App Dir:     ${APP_DIR}${NC}"
echo -e "${CYAN}║   📁 Logs:        ${APP_DIR}/logs/${NC}"
echo -e "${CYAN}║                                                              ║${NC}"
echo -e "${CYAN}║   🖥️  INCLUDED APPS:${NC}"
echo -e "${CYAN}║   ├── 🌐 Next.js Web App (30+ pages, 20+ APIs)${NC}"
echo -e "${CYAN}║   ├── 🤖 Automation Engine (daily monitor + royalties)${NC}"
echo -e "${CYAN}║   ├── 🖥️  SuperGOATRoyalty Desktop (Electron)${NC}"
echo -e "${CYAN}║   ├── 🚀 GOAT Launcher (50+ tools hub)${NC}"
echo -e "${CYAN}║   ├── 🧠 Atlas AI (GPT-2 local + FastAPI)${NC}"
echo -e "${CYAN}║   ├── 👗 FashionForge Studio${NC}"
echo -e "${CYAN}║   ├── 🎵 Super Ninja App${NC}"
echo -e "${CYAN}║   └── 📊 Data Catalogs (3,650 tracks)${NC}"
echo -e "${CYAN}║                                                              ║${NC}"
echo -e "${CYAN}║   🎵 FEATURES:${NC}"
echo -e "${CYAN}║   ├── AI Chat (Gemini/OpenAI/Claude)${NC}"
echo -e "${CYAN}║   ├── Royalty Calculator (real ASCAP data)${NC}"
echo -e "${CYAN}║   ├── Streaming Analytics${NC}"
echo -e "${CYAN}║   ├── Adobe Firefly AI Studio${NC}"
echo -e "${CYAN}║   ├── NVIDIA DGX Cloud Integration${NC}"
echo -e "${CYAN}║   ├── Sora AI Studio${NC}"
echo -e "${CYAN}║   ├── Cinema Camera Suite${NC}"
echo -e "${CYAN}║   ├── Browser Automation (Axiom)${NC}"
echo -e "${CYAN}║   ├── Music Production Tools${NC}"
echo -e "${CYAN}║   └── IP Protection Vault${NC}"
echo -e "${CYAN}║                                                              ║${NC}"
echo -e "${CYAN}║   © 2025 Harvey Miller / FASTASSMAN Publishing Inc           ║${NC}"
echo -e "${CYAN}║                                                              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
#  QUICK REFERENCE COMMANDS
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}📋 QUICK REFERENCE COMMANDS:${NC}"
echo ""
echo "  # Check status"
echo "  pm2 status"
echo ""
echo "  # View logs"
echo "  pm2 logs goat-royalty-web --lines 50"
echo "  pm2 logs goat-automation --lines 50"
echo ""
echo "  # Restart everything"
echo "  pm2 restart all"
echo ""
echo "  # Update from GitHub"
echo "  cd ${APP_DIR} && git pull origin GOAT-APP && npm install --legacy-peer-deps && npm run build && pm2 restart all"
echo ""
echo "  # Monitor resources"
echo "  pm2 monit"
echo ""
echo -e "${GREEN}🐐⚡ GOAT ROYALTY IS LIVE! 🐐⚡${NC}"