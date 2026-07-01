#!/bin/bash
# ============================================
# GOAT ROYALTY APP - PRODUCTION DEPLOYMENT
# Server: 93.127.214.171
# ============================================
# 
# Usage: SSH into your VPS and run:
#   curl -sSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App2/GOAT-APP/deploy-production.sh | bash
#
# Or copy this script to the server and run:
#   chmod +x deploy-production.sh && ./deploy-production.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${BLUE}[→]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🐐 GOAT ROYALTY APP - PRODUCTION DEPLOY   ║${NC}"
echo -e "${GREEN}║   Server: 93.127.214.171                     ║${NC}"
echo -e "${GREEN}║   Branch: GOAT-APP              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""

APP_DIR="/root/goat-royalty-app"
REPO_URL="https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git"
BRANCH="GOAT-APP"
PORT=3002

# ─── Step 1: System Dependencies ───
info "Step 1/8: Installing system dependencies..."
apt-get update -qq 2>/dev/null
apt-get install -y -qq curl git nginx 2>/dev/null

# Install Node.js 20 if needed
if ! command -v node &>/dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 18 ]]; then
  info "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - 2>/dev/null
  apt-get install -y -qq nodejs 2>/dev/null
fi
log "Node.js $(node -v) ready"

# Install PM2 if needed
if ! command -v pm2 &>/dev/null; then
  info "Installing PM2..."
  npm install -g pm2 2>/dev/null
fi
log "PM2 ready"

# ─── Step 2: Clone/Update Repository ───
info "Step 2/8: Deploying application code..."
if [ -d "$APP_DIR/.git" ]; then
  info "Updating existing installation..."
  cd "$APP_DIR"
  git fetch origin 2>/dev/null
  git checkout "$BRANCH" 2>/dev/null || git checkout -b "$BRANCH" "origin/$BRANCH" 2>/dev/null
  git reset --hard "origin/$BRANCH" 2>/dev/null
else
  info "Fresh installation..."
  rm -rf "$APP_DIR"
  git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR" 2>/dev/null
  cd "$APP_DIR"
fi
log "Code deployed from branch: $BRANCH"

# ─── Step 3: Environment Variables ───
info "Step 3/8: Configuring environment..."
if [ ! -f "$APP_DIR/.env.local" ]; then
  cat > "$APP_DIR/.env.local" << 'ENVEOF'
# GOAT Royalty App - Production Environment
NODE_ENV=production
PORT=3002
HOST=0.0.0.0

# Google Gemini AI (REQUIRED - get from https://aistudio.google.com/apikey)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Supabase (REQUIRED for auth/database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: OpenAI fallback
OPENAI_API_KEY=

# Hostinger API
HOSTINGER_API_TOKEN=pFVxgg0VzPlKdfZKj8NMGrDZ4i5dbflx7gGRmKl1e09cbd0f
ENVEOF
  warn "Created .env.local — EDIT IT with your actual API keys!"
  warn "  nano $APP_DIR/.env.local"
else
  log "Existing .env.local preserved"
fi

# ─── Step 4: Install Dependencies ───
info "Step 4/8: Installing npm dependencies..."
cd "$APP_DIR"
npm install 2>&1 | tail -3
log "Dependencies installed"

# ─── Step 5: Build Application ───
info "Step 5/8: Building Next.js application (this may take 2-3 minutes)..."
cd "$APP_DIR"
npm run build 2>&1 | tail -5
if [ $? -eq 0 ]; then
  log "Build successful"
else
  error "Build failed! Check the output above."
fi

# ─── Step 6: PM2 Process Manager ───
info "Step 6/8: Configuring PM2..."
cat > "$APP_DIR/ecosystem.config.js" << PMEOF
module.exports = {
  apps: [{
    name: 'goat-royalty-app',
    script: 'node_modules/.bin/next',
    args: 'start -p $PORT',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT,
      HOST: '0.0.0.0'
    },
    error_file: '/var/log/goat-app-error.log',
    out_file: '/var/log/goat-app-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
PMEOF

pm2 delete goat-royalty-app 2>/dev/null || true
pm2 start "$APP_DIR/ecosystem.config.js"
pm2 save
pm2 startup 2>/dev/null || true
log "PM2 configured and app started"

# ─── Step 7: Nginx Reverse Proxy ───
info "Step 7/8: Configuring Nginx..."
cat > /etc/nginx/sites-available/goat-royalty-app << 'NGINXEOF'
server {
    listen 80;
    server_name 93.127.214.171;

    client_max_body_size 50M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Static assets caching
    location /_next/static {
        proxy_pass http://127.0.0.1:3002;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # SSE streaming support for Gemini AI
    location /api/gemini-llm/chat {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
        chunked_transfer_encoding on;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/goat-royalty-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

if nginx -t 2>/dev/null; then
  systemctl restart nginx 2>/dev/null || nginx -s reload 2>/dev/null
  systemctl enable nginx 2>/dev/null || true
  log "Nginx configured with SSE streaming support"
else
  error "Nginx configuration test failed!"
fi

# ─── Step 8: Firewall ───
info "Step 8/8: Configuring firewall..."
ufw allow 22/tcp 2>/dev/null || true
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true
ufw allow 3002/tcp 2>/dev/null || true
ufw --force enable 2>/dev/null || true
log "Firewall configured"

# ─── Verification ───
echo ""
info "Verifying deployment..."
sleep 5

APP_STATUS="❌ Not responding"
if curl -sf http://localhost:3002 > /dev/null 2>&1; then
  APP_STATUS="✅ Running on port 3002"
fi

NGINX_STATUS="❌ Not responding"
if curl -sf http://localhost:80 > /dev/null 2>&1; then
  NGINX_STATUS="✅ Proxy working on port 80"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       🎉 DEPLOYMENT COMPLETE!                ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║  App:   $APP_STATUS${NC}"
echo -e "${GREEN}║  Nginx: $NGINX_STATUS${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║  🌐 Access: http://93.127.214.171            ║${NC}"
echo -e "${GREEN}║  🤖 Gemini: http://93.127.214.171/gemini-ai  ║${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║  📋 Commands:                                ║${NC}"
echo -e "${GREEN}║  pm2 status          - Check app status      ║${NC}"
echo -e "${GREEN}║  pm2 logs            - View app logs         ║${NC}"
echo -e "${GREEN}║  pm2 restart all     - Restart app           ║${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║  ⚠️  IMPORTANT: Edit your API keys:          ║${NC}"
echo -e "${GREEN}║  nano /root/goat-royalty-app/.env.local      ║${NC}"
echo -e "${GREEN}║  Then: pm2 restart goat-royalty-app          ║${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""