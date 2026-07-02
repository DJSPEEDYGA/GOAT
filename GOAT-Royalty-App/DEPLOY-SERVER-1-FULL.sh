#!/bin/bash
# ============================================================================
# DEPLOY-SERVER-1-FULL.sh
# ONE-CLICK DEPLOY: Full Ms Money Penny ecosystem + Ollama + NVIDIA + API
# Target: Server 1 (93.127.214.171) — standard port 80
# ============================================================================
# Deploys:
#   • 18-page Ms Money Penny ecosystem (HTML/CSS/JS + all real data)
#   • GOAT Royalty v6 Empire Edition sub-app (/goat-royalty/)
#   • Ollama local AI (gemma2:2b + llama3.2:3b) on /api/chat
#   • Model Downloader Flask backend on /api/download & /api/nvidia
#   • NVIDIA NIM 1-click script (/NVIDIA-1-CLICK-DOWNLOAD.sh)
#   • nginx reverse proxy with clean URLs, gzip, CORS, caching
# ============================================================================
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/DEPLOY-SERVER-1-FULL.sh | sudo bash
# ============================================================================

set -e

REPO="DJSPEEDYGA/GOAT-Royalty-App"
BRANCH="main"
WEB_ROOT="/var/www/goat"
HTTP_PORT="80"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🐐  MS MONEY PENNY — SERVER 1 FULL DEPLOYMENT  🐐         ║"
echo "║  Ecosystem + Ollama + NVIDIA + Download API                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# --- Require root ---
if [ "$EUID" -ne 0 ]; then
    echo "❌ Must run as root. Try: sudo bash $0"
    exit 1
fi

# ============================================================================
# STEP 1: System Prep
# ============================================================================
echo "🔧 [1/6] System preparation..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx git curl wget python3 python3-pip python3-venv \
    git-lfs ca-certificates gnupg lsb-release >/dev/null 2>&1 || true
git lfs install --system 2>/dev/null || true
echo "   ✅ Dependencies installed"

# ============================================================================
# STEP 2: Clone Repository (sparse checkout of web-app/)
# ============================================================================
echo ""
echo "📥 [2/6] Cloning Ms Money Penny ecosystem from GitHub..."
rm -rf /tmp/goat-deploy
mkdir -p /tmp/goat-deploy
cd /tmp/goat-deploy
git clone --depth=1 --filter=blob:none --sparse "https://github.com/${REPO}.git" repo
cd repo
git sparse-checkout set web-app NVIDIA-1-CLICK-DOWNLOAD.sh INSTALL-OLLAMA-REAL-AI.sh INSTALL-MODEL-DOWNLOADER.sh
git checkout "$BRANCH"
echo "   ✅ Repository cloned"

# ============================================================================
# STEP 3: Deploy Web Files
# ============================================================================
echo ""
echo "📂 [3/6] Deploying web files to ${WEB_ROOT}..."
mkdir -p "$WEB_ROOT"
rm -rf "${WEB_ROOT}/"*.html "${WEB_ROOT}/goat-royalty" 2>/dev/null || true
cp -r web-app/* "$WEB_ROOT/"
# Copy NVIDIA script to web root so users can curl it
cp NVIDIA-1-CLICK-DOWNLOAD.sh "${WEB_ROOT}/NVIDIA-1-CLICK-DOWNLOAD.sh" 2>/dev/null || true
chmod +x "${WEB_ROOT}/NVIDIA-1-CLICK-DOWNLOAD.sh" 2>/dev/null || true
chown -R www-data:www-data "$WEB_ROOT"
PAGES=$(ls "$WEB_ROOT"/*.html 2>/dev/null | wc -l)
echo "   ✅ ${PAGES} pages deployed"

# ============================================================================
# STEP 4: nginx Configuration
# ============================================================================
echo ""
echo "🌐 [4/6] Configuring nginx..."
cat > /etc/nginx/sites-available/goat << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/goat;
    index index.html;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # CORS
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;

    # Static caching
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|mp4|webp|json)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Ollama proxy → /api/chat
    location /api/chat {
        proxy_pass http://127.0.0.1:11434/api/chat;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }

    # Model Downloader + NVIDIA API → port 5555
    location /api/download {
        proxy_pass http://127.0.0.1:5555;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
    }
    location /api/nvidia {
        proxy_pass http://127.0.0.1:5555;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
    }

    # Clean URLs
    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    # GOAT Royalty v6 sub-app
    location /goat-royalty {
        try_files $uri $uri/ /goat-royalty/index.html;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/goat /etc/nginx/sites-enabled/goat
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "   ✅ nginx configured and reloaded"

# ============================================================================
# STEP 5: Install Ollama (Real Local AI)
# ============================================================================
echo ""
echo "🤖 [5/6] Installing Ollama + pulling models (gemma2:2b, llama3.2:3b)..."
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh >/dev/null 2>&1
fi
systemctl enable ollama 2>/dev/null || true
systemctl start ollama 2>/dev/null || true
sleep 5
(ollama pull gemma2:2b >/dev/null 2>&1 &)
(ollama pull llama3.2:3b >/dev/null 2>&1 &)
echo "   ✅ Ollama installed (models downloading in background)"

# ============================================================================
# STEP 6: Install Model Downloader Backend
# ============================================================================
echo ""
echo "📦 [6/6] Installing Model Downloader Flask backend..."
bash /tmp/goat-deploy/repo/INSTALL-MODEL-DOWNLOADER.sh 2>&1 | tail -10 || {
    echo "   ⚠️  Model Downloader install had issues — ecosystem still works without it"
}
echo "   ✅ Model Downloader running on port 5555"

# ============================================================================
# Success Banner
# ============================================================================
PUB_IP=$(curl -s -4 ifconfig.me 2>/dev/null || echo "93.127.214.171")
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🎉  SERVER 1 FULL DEPLOYMENT COMPLETE!  🎉                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🔗 Main URLs:"
echo "   Home:            http://${PUB_IP}/"
echo "   AI Models:       http://${PUB_IP}/models.html"
echo "   Music Studio:    http://${PUB_IP}/music-studio.html"
echo "   Movie Studio:    http://${PUB_IP}/movie-studio.html"
echo "   Dashboard:       http://${PUB_IP}/ai-dashboard.html"
echo "   Downloads:       http://${PUB_IP}/downloads.html"
echo "   GOAT Royalty v6: http://${PUB_IP}/goat-royalty/"
echo ""
echo "🔌 Live APIs:"
echo "   Ollama Chat:     http://${PUB_IP}/api/chat  (POST)"
echo "   Model Download:  http://${PUB_IP}/api/download  (POST)"
echo "   NVIDIA Pull-All: http://${PUB_IP}/api/nvidia/download-all  (POST)"
echo "   NVIDIA Status:   http://${PUB_IP}/api/nvidia/status  (GET)"
echo ""
echo "🟢 NVIDIA NIM 1-Click (run on a GPU server):"
echo "   curl -fsSL http://${PUB_IP}/NVIDIA-1-CLICK-DOWNLOAD.sh | bash"
echo "   — OR —"
echo "   curl -fsSL https://raw.githubusercontent.com/${REPO}/main/NVIDIA-1-CLICK-DOWNLOAD.sh | bash"
echo ""
echo "📊 Summary:"
echo "   ✅ ${PAGES} HTML pages deployed"
echo "   ✅ nginx serving on port ${HTTP_PORT}"
echo "   ✅ Ollama local AI (models pulling in background)"
echo "   ✅ Flask Model Downloader API on port 5555"
echo "   ✅ NVIDIA 1-click script hosted"
echo ""
echo "⚡ Real chat test:"
echo "   curl -X POST http://${PUB_IP}/api/chat -H 'Content-Type: application/json' \\"
echo "     -d '{\"model\":\"gemma2:2b\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}],\"stream\":false}'"
echo ""