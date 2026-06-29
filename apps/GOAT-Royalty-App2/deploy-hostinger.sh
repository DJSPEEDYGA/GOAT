#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  GOAT Royalty App — Hostinger VPS Deployment Script
#  Deploys the full Next.js app with PM2 + Nginx + SSL
# ═══════════════════════════════════════════════════════════════

set -e

echo "🐐 GOAT Royalty App — Hostinger Server Deployment"
echo "=================================================="
echo ""

# ── CONFIGURATION (Edit these before running) ─────────────────
APP_NAME="goat-royalty-app"
APP_DIR="/home/$(whoami)/GOAT-Royalty-App2"
REPO_URL="https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git"
NODE_VERSION="20"
APP_PORT=3002
DOMAIN=""  # Set your domain if you have one, e.g. "goatroyalty.com"

# ── STEP 1: System Update ────────────────────────────────────
echo "📦 Step 1: Updating system packages..."
sudo apt update -y && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx ufw build-essential

# ── STEP 2: Install Node.js 20 ───────────────────────────────
echo ""
echo "📦 Step 2: Installing Node.js ${NODE_VERSION}..."
if ! command -v node &>/dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
  sudo apt install -y nodejs
fi
echo "   Node: $(node --version)"
echo "   npm:  $(npm --version)"

# ── STEP 3: Install PM2 ──────────────────────────────────────
echo ""
echo "📦 Step 3: Installing PM2 process manager..."
sudo npm install -g pm2
pm2 startup systemd -u $(whoami) --hp /home/$(whoami) 2>/dev/null || true

# ── STEP 4: Clone/Update Repository ──────────────────────────
echo ""
echo "📦 Step 4: Setting up application..."
if [ -d "$APP_DIR" ]; then
  echo "   Updating existing repo..."
  cd "$APP_DIR"
  git stash 2>/dev/null || true
  git pull origin GOAT-APP
else
  echo "   Cloning repository..."
  git clone -b GOAT-APP "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── STEP 5: Environment Variables ─────────────────────────────
echo ""
echo "📦 Step 5: Setting up environment..."
if [ ! -f "$APP_DIR/.env.local" ]; then
  cat > "$APP_DIR/.env.local" << 'ENVEOF'
# ═══════════════════════════════════════════════════════════════
#  GOAT Royalty App — Environment Variables
#  Fill in your actual keys below
# ═══════════════════════════════════════════════════════════════

# ── Supabase ──────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE

# ── Google AI (Gemini) ────────────────────────────────────────
GOOGLE_AI_API_KEY=YOUR_GOOGLE_AI_API_KEY_HERE

# ── Spotify ───────────────────────────────────────────────────
SPOTIFY_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID_HERE
SPOTIFY_CLIENT_SECRET=YOUR_SPOTIFY_CLIENT_SECRET_HERE

# ── TikTok ────────────────────────────────────────────────────
TIKTOK_CLIENT_KEY=YOUR_TIKTOK_CLIENT_KEY_HERE
TIKTOK_CLIENT_SECRET=YOUR_TIKTOK_CLIENT_SECRET_HERE

# ── Twilio (for Atlas AI comm agent) ──────────────────────────
TWILIO_ACCOUNT_SID=YOUR_TWILIO_SID_HERE
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN_HERE
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_HERE

# ── App Config ────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3002
NODE_ENV=production
ENVEOF
  echo "   ⚠️  Created .env.local — EDIT IT with your real API keys!"
  echo "   Run: nano $APP_DIR/.env.local"
else
  echo "   .env.local already exists"
fi

# ── STEP 6: Install Dependencies ─────────────────────────────
echo ""
echo "📦 Step 6: Installing dependencies..."
cd "$APP_DIR"
npm install --production=false

# ── STEP 7: Build Application ────────────────────────────────
echo ""
echo "🔨 Step 7: Building Next.js application..."
npm run build

echo "✅ Build complete!"

# ── STEP 8: PM2 Setup ────────────────────────────────────────
echo ""
echo "🚀 Step 8: Starting with PM2..."

# Stop existing processes
pm2 delete "$APP_NAME" 2>/dev/null || true

# Create PM2 ecosystem file
cat > "$APP_DIR/ecosystem.config.js" << PMEOF
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    script: 'node_modules/.bin/next',
    args: 'start -p ${APP_PORT}',
    cwd: '${APP_DIR}',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: ${APP_PORT},
    },
    error_file: '${APP_DIR}/logs/error.log',
    out_file: '${APP_DIR}/logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
PMEOF

# Create logs directory
mkdir -p "$APP_DIR/logs"

# Start with PM2
pm2 start "$APP_DIR/ecosystem.config.js"
pm2 save

echo "✅ App running on port ${APP_PORT}"

# ── STEP 9: Nginx Configuration ──────────────────────────────
echo ""
echo "🌐 Step 9: Configuring Nginx..."

# Determine server_name
if [ -n "$DOMAIN" ]; then
  SERVER_NAME="$DOMAIN www.$DOMAIN"
else
  SERVER_NAME="_"
fi

sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << NGINXEOF
server {
    listen 80;
    server_name ${SERVER_NAME};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Static files caching
    location /_next/static/ {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /public/ {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Main proxy
    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
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

    # Max upload size
    client_max_body_size 50M;
}
NGINXEOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx configured"

# ── STEP 10: Firewall ────────────────────────────────────────
echo ""
echo "🔒 Step 10: Configuring firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable
echo "✅ Firewall configured"

# ── STEP 11: SSL (if domain is set) ──────────────────────────
if [ -n "$DOMAIN" ]; then
  echo ""
  echo "🔐 Step 11: Setting up SSL with Let's Encrypt..."
  sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email djspeedyga@gmail.com
  echo "✅ SSL configured"
else
  echo ""
  echo "⚠️  Step 11: Skipping SSL (no domain set)"
  echo "   Set DOMAIN variable and re-run for SSL"
fi

# ── DONE ──────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🐐 GOAT Royalty App — DEPLOYED SUCCESSFULLY! 🔥"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  📊 Status:"
pm2 status
echo ""
echo "  🌐 Access your app:"
if [ -n "$DOMAIN" ]; then
  echo "     https://$DOMAIN"
else
  SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
  echo "     http://${SERVER_IP}"
  echo "     http://${SERVER_IP}:${APP_PORT} (direct)"
fi
echo ""
echo "  📋 Useful commands:"
echo "     pm2 status              # Check app status"
echo "     pm2 logs $APP_NAME      # View logs"
echo "     pm2 restart $APP_NAME   # Restart app"
echo "     pm2 monit               # Monitor resources"
echo ""
echo "  ⚠️  IMPORTANT: Edit your API keys!"
echo "     nano $APP_DIR/.env.local"
echo "     pm2 restart $APP_NAME"
echo ""
echo "  🐐 GOAT Royalty × SuperNinja AI"
echo "═══════════════════════════════════════════════════════════"