# ============================================================================
# 🐐 GOAT FORCE v6 - The Empire Edition
# FINAL SINGLE-CLICK DEPLOY COMMAND (Copy entire block & paste to server)
# ============================================================================

bash << 'EMPIRE'
set -e
echo ""
echo "🐐 GOAT FORCE v6 - THE EMPIRE EDITION"
echo "====================================="
echo ""

# Detect server
IP=$(hostname -I | awk '{print $1}')
PORT=80
[[ "$IP" == "72.61.193.184" ]] && PORT=8080
echo "📡 Server: $IP | Port: $PORT"

# Install nginx
echo "📦 Installing nginx..."
apt-get update -qq && apt-get install -y -qq nginx wget jq 2>/dev/null || true

# Create app directory
mkdir -p /var/www/goat/downloads
cd /var/www/goat

# Download ALL v6 files
echo "⬇️  Downloading v6 Empire Edition files..."
BASE="https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/web-app/goat-royalty"
wget -q "$BASE/index.html" -O index.html
wget -q "$BASE/catalog.json" -O catalog.json
wget -q "$BASE/timelines.json" -O timelines.json
wget -q "$BASE/releases.json" -O releases.json
wget -q "$BASE/summary.json" -O summary.json

# Verify downloads
echo ""
echo "✅ Files downloaded:"
ls -lh /var/www/goat/*.html /var/www/goat/*.json

# Configure nginx
echo ""
echo "🔧 Configuring nginx on port $PORT..."
cat > /etc/nginx/sites-available/goat << NGINX
server {
    listen $PORT default_server;
    listen [::]:$PORT;
    root /var/www/goat;
    index index.html;
    server_name _;
    
    gzip on;
    gzip_types text/html text/css application/javascript application/json;
    
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    location ~* \.json$ {
        add_header Content-Type application/json;
        add_header Access-Control-Allow-Origin *;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/goat /etc/nginx/sites-enabled/goat
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl enable nginx && systemctl restart nginx

# Firewall (Server 1 only)
[[ "$PORT" == "80" ]] && ufw allow 80/tcp 2>/dev/null || true
[[ "$PORT" == "80" ]] && ufw allow 443/tcp 2>/dev/null || true

# Download installers
echo ""
echo "📦 Downloading installers..."
cd downloads
wget -q "https://github.com/DJSPEEDYGA/GOAT-Royalty-App/raw/main/GOAT-Royalty-USB-v2.0.zip" -O GOAT-Royalty-USB-v2.0.zip 2>/dev/null || true

# Create downloads page
cd /var/www/goat
cat > downloads.html << 'DLHTML'
<!DOCTYPE html><html><head><title>GOAT Force Downloads</title>
<style>
body{font-family:Arial;max-width:900px;margin:40px auto;padding:20px;background:#0a0e1a;color:#e4e4e7}
.container{background:#1a1f2e;padding:30px;border-radius:10px;border:1px solid #2a3142}
h1{color:#f59e0b;text-align:center;font-size:32px}
.sub{text-align:center;color:#9ca3af;margin-bottom:30px}
.card{background:#0f1419;border:1px solid #2a3142;padding:20px;margin:10px 0;border-radius:8px}
.btn{display:block;padding:12px;background:linear-gradient(90deg,#f59e0b,#ef4444);color:#fff;text-decoration:none;text-align:center;border-radius:6px;margin-top:10px;font-weight:600}
</style></head><body>
<div class="container">
<h1>🐐 GOAT Force v6 - Empire Edition</h1>
<p class="sub">Downloads for All Platforms</p>
<div class="card"><h3>🪟 Windows EXE</h3><a href="downloads/GOAT-Royalty-Setup-v3.0.exe" class="btn">Download EXE Installer</a></div>
<div class="card"><h3>🍎 Mac DMG</h3><a href="downloads/GOAT-Royalty-v3.0.dmg" class="btn">Download DMG Installer</a></div>
<div class="card"><h3>💾 USB Portable v2.0</h3><a href="downloads/GOAT-Royalty-USB-v2.0.zip" class="btn">Download USB ZIP</a></div>
<div class="card"><h3>📊 Full Catalog JSON (5,954 entries)</h3><a href="catalog.json" class="btn">Download Catalog Data</a></div>
<div class="card"><h3>🎬 Timelines & Characters JSON</h3><a href="timelines.json" class="btn">Download Timeline Data</a></div>
<p style="text-align:center;margin-top:30px"><a href="/" style="color:#f59e0b;font-size:18px;font-weight:600">🚀 Launch GOAT Force App</a></p>
</div></body></html>
DLHTML

# Final summary
echo ""
echo "============================================"
echo "✅ GOAT FORCE v6 DEPLOYED SUCCESSFULLY!"
echo "============================================"
echo ""
echo "🌐 Main App:   http://$IP:$PORT"
echo "📥 Downloads:  http://$IP:$PORT/downloads.html"
echo ""
echo "📊 Contents:"
echo "   - 5,954 catalog entries"
echo "   - 759 ISRC codes"
echo "   - 10 Episodes (Season 1)"
echo "   - 6 Characters (The GOAT, Baby GOAT, DJ Speedy, Waka Flocka, Moneypenny, Codex)"
echo "   - 5 Major Storylines"
echo "   - 5 Core Modules"
echo ""
echo "🐐 Leadership:"
echo "   GOAT Force:  CEO DJ Speedy • President Waka Flocka"
echo "   BrickSquad:  President DJ Speedy • CEO Waka Flocka"
echo ""
echo "🚀 Launch your browser to: http://$IP:$PORT"
echo "============================================"
EMPIRE