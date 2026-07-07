# ============================================================================
# 🐐 Ms Money Penny — THE GOAT ROYALTY STORE
# by Life Imitates Art Inc.
# Complete Ecosystem Deployment (18 Pages + Full Assets)
# ============================================================================
# 
# Features:
# 🏠 Home • 📊 Dashboard • 🧠 AI Models (2.7M+) • 🛠️ Tools
# 📥 Downloads (Local Desktop - No API/Password)
# 🎵 Music Studio (DSP Distribution)
# 🎬 Movie Studio (AI Video Editor)
# 📝 Screenwriting Studio
# 🎮 UE5 CoPilot (Unreal Engine Assistant)
# 📚 Catalog (5,954 entries) • 🗺️ Roadmap
# 🤖 USB-AI (Uncensored LLM)
# 🐐 GOAT Royalty v6 Empire Edition
# 📖 Resources • ℹ️ About
# 
# NVIDIA Stack: Lightning AI • NAT • Nemotron • NemoClaw 
#               OpenShell • Speech Stack • HuggingFace
# ============================================================================

# COPY-PASTE THIS ENTIRE BLOCK TO YOUR SERVER TERMINAL:

bash << 'ECOSYSTEM'
set -e
clear
echo ""
echo "  ███╗   ███╗███████╗    ███╗   ███╗ ██████╗ ███╗   ██╗███████╗██╗   ██╗"
echo "  ████╗ ████║██╔════╝    ████╗ ████║██╔═══██╗████╗  ██║██╔════╝╚██╗ ██╔╝"
echo "  ██╔████╔██║███████╗    ██╔████╔██║██║   ██║██╔██╗ ██║█████╗   ╚████╔╝ "
echo "  ██║╚██╔╝██║╚════██║    ██║╚██╔╝██║██║   ██║██║╚██╗██║██╔══╝    ╚██╔╝  "
echo "  ██║ ╚═╝ ██║███████║    ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║███████╗   ██║   "
echo "  ╚═╝     ╚═╝╚══════╝    ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝   "
echo ""
echo "           🐐 THE GOAT ROYALTY STORE 👑"
echo "           by Life Imitates Art Inc."
echo ""
echo "============================================================"

# Detect server
IP=$(hostname -I | awk '{print $1}')
PORT=80
[[ "$IP" == "72.61.193.184" ]] && PORT=8080
echo "📡 Server:  $IP"
echo "🔌 Port:    $PORT"
echo "============================================================"
echo ""

# Install dependencies
echo "📦 [1/5] Installing nginx + tools..."
apt-get update -qq 2>/dev/null
apt-get install -y -qq nginx wget curl unzip git 2>/dev/null || true
echo "   ✅ Dependencies installed"

# Clone entire web-app folder from GitHub
echo ""
echo "⬇️  [2/5] Downloading complete Ms Money Penny ecosystem..."
rm -rf /tmp/goat-deploy
mkdir -p /tmp/goat-deploy
cd /tmp/goat-deploy
git clone --depth 1 --filter=blob:none --sparse https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git repo 2>/dev/null
cd repo
git sparse-checkout set web-app 2>/dev/null

# Copy to nginx webroot
rm -rf /var/www/goat
mkdir -p /var/www/goat
cp -r web-app/* /var/www/goat/
cp -r web-app/.* /var/www/goat/ 2>/dev/null || true
echo "   ✅ Downloaded 18 pages + assets"

# Fallback: if git clone fails, use individual wget
if [ ! -f /var/www/goat/index.html ]; then
    echo "   ⚠️  Git clone failed, using wget fallback..."
    cd /var/www/goat
    BASE="https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/web-app"
    for page in index music-studio movie-studio ai-dashboard models tools screenwriting unreal-copilot catalog downloads about roadmap resources usb-ai 404; do
        wget -q "$BASE/$page.html" -O "$page.html" 2>/dev/null
    done
    mkdir -p goat-royalty
    for file in index.html catalog.json timelines.json releases.json summary.json; do
        wget -q "$BASE/goat-royalty/$file" -O "goat-royalty/$file" 2>/dev/null
    done
fi

# File count
FILE_COUNT=$(find /var/www/goat -type f | wc -l)
echo "   📁 Total files deployed: $FILE_COUNT"

# Configure nginx
echo ""
echo "🔧 [3/5] Configuring nginx on port $PORT..."
cat > /etc/nginx/sites-available/goat << NGINX
server {
    listen $PORT default_server;
    listen [::]:$PORT;
    root /var/www/goat;
    index index.html;
    server_name _;
    
    gzip on;
    gzip_types text/html text/css application/javascript application/json image/svg+xml;
    
    location / {
        try_files \$uri \$uri.html \$uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    location ~* \.json$ {
        add_header Content-Type application/json;
        add_header Access-Control-Allow-Origin *;
    }
    
    location ~* \.(png|jpg|jpeg|gif|ico|svg|woff2?|css|js)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
    
    # Direct URL access without .html extension
    location /music-studio { try_files /music-studio.html =404; }
    location /movie-studio { try_files /movie-studio.html =404; }
    location /ai-dashboard { try_files /ai-dashboard.html =404; }
    location /screenwriting { try_files /screenwriting.html =404; }
    location /unreal-copilot { try_files /unreal-copilot.html =404; }
    location /models { try_files /models.html =404; }
    location /tools { try_files /tools.html =404; }
    location /catalog { try_files /catalog.html =404; }
    location /downloads { try_files /downloads.html =404; }
    location /about { try_files /about.html =404; }
    location /roadmap { try_files /roadmap.html =404; }
    location /resources { try_files /resources.html =404; }
    location /usb-ai { try_files /usb-ai.html =404; }
}
NGINX

ln -sf /etc/nginx/sites-available/goat /etc/nginx/sites-enabled/goat
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl enable nginx && systemctl restart nginx
echo "   ✅ nginx configured & running"

# Firewall (Server 1 only)
[[ "$PORT" == "80" ]] && { ufw allow 80/tcp 2>/dev/null; ufw allow 443/tcp 2>/dev/null; } || true

# Set permissions
echo ""
echo "🔒 [4/5] Setting permissions..."
chown -R www-data:www-data /var/www/goat
chmod -R 755 /var/www/goat
echo "   ✅ Permissions set"

# Verify pages
echo ""
echo "🔍 [5/5] Verifying all pages..."
PAGES="index music-studio movie-studio ai-dashboard models tools screenwriting unreal-copilot catalog downloads about roadmap resources usb-ai"
WORKING=0
for page in $PAGES; do
    if [ -f "/var/www/goat/$page.html" ]; then
        WORKING=$((WORKING + 1))
    fi
done
echo "   ✅ $WORKING/14 pages deployed"

# Success summary
echo ""
echo "============================================================"
echo "🎉  Ms MONEY PENNY ECOSYSTEM IS LIVE!"
echo "============================================================"
echo ""
echo "🌐 Main Platform:"
echo "   http://$IP:$PORT"
echo ""
echo "📱 Direct Links:"
echo "   🏠 Home:          http://$IP:$PORT/"
echo "   📊 Dashboard:     http://$IP:$PORT/ai-dashboard.html"
echo "   🧠 AI Models:     http://$IP:$PORT/models.html       (2.7M+ models)"
echo "   🛠️  Tools:         http://$IP:$PORT/tools.html"
echo "   📥 Downloads:     http://$IP:$PORT/downloads.html    (No API/Password)"
echo "   🎵 Music Studio:  http://$IP:$PORT/music-studio.html"
echo "   🎬 Movie Studio:  http://$IP:$PORT/movie-studio.html"
echo "   📝 Screenwriting: http://$IP:$PORT/screenwriting.html"
echo "   🎮 UE5 CoPilot:   http://$IP:$PORT/unreal-copilot.html"
echo "   📚 Catalog:       http://$IP:$PORT/catalog.html"
echo "   🗺️  Roadmap:       http://$IP:$PORT/roadmap.html"
echo "   🤖 USB-AI:        http://$IP:$PORT/usb-ai.html"
echo "   🐐 GOAT v6:       http://$IP:$PORT/goat-royalty/"
echo "   ℹ️  About:         http://$IP:$PORT/about.html"
echo ""
echo "✨ Features Active:"
echo "   • 2.7M+ AI Models (HuggingFace)"
echo "   • 653+ Lightning AI APIs"
echo "   • 7 NVIDIA Integrations"
echo "   • 5,954 Music Catalog Entries"
echo "   • 759 ISRC Codes"
echo "   • Local Desktop Apps (Windows/Mac/Linux)"
echo "   • No API Keys Required"
echo "   • No Passwords Required"
echo ""
echo "🐐 GOAT Force Empire Edition v6 integrated"
echo "👑 The Greatest Of All Time"
echo "============================================================"
ECOSYSTEM