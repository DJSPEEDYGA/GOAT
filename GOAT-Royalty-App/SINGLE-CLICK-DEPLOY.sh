#!/bin/bash

# ============================================================================
# GOAT Royalty App v3.0 - Copy-Paste Single Command Deployment
# ============================================================================
# Copy and paste the ENTIRE command below into your Hostinger terminal
# This single line does EVERYTHING - deploy web app + download installers
# ============================================================================

curl -fsSL "https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/ALL-IN-ONE-INSTALL.sh" | bash

# ============================================================================
# ALTERNATIVE: If the script isn't in GitHub yet, use this direct command:
# ============================================================================

# Copy-paste this entire block as ONE command:

bash -c "$(cat <<'SCRIPT'
set -e
echo "🐐 GOAT Royalty App v3.0 - Single-Click Deploy"
IP=$(hostname -I | awk '{print $1}')
PORT=80
[[ "$IP" == "72.61.193.184" ]] && PORT=8080
echo "📡 Server: $IP:$PORT"
apt-get update -qq && apt-get install -y -qq nginx wget 2>/dev/null || true
mkdir -p /var/www/goat/downloads
cd /var/www/goat
wget -q --show-progress "https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/web-app/goat-royalty/index.html" -O index.html
wget -q --show-progress "https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/data/unified-catalog.json" -O catalog.json 2>/dev/null || true
cat > /etc/nginx/sites-available/goat <<EOF
server { listen $PORT default_server; root /var/www/goat; index index.html; location / { try_files \$uri \$uri/ /index.html; add_header Cache-Control "no-cache"; } }
EOF
ln -sf /etc/nginx/sites-available/goat /etc/nginx/sites-enabled/goat
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
[[ "$PORT" == "80" ]] && ufw allow 80/tcp 2>/dev/null || true
cd downloads
wget -q "https://github.com/DJSPEEDYGA/GOAT-Royalty-App/releases/download/v3.0/GOAT-Royalty-Setup-v3.0.exe" -O GOAT-Royalty-Setup-v3.0.exe 2>/dev/null || true
wget -q "https://github.com/DJSPEEDYGA/GOAT-Royalty-App/releases/download/v3.0/GOAT-Royalty-v3.0.dmg" -O GOAT-Royalty-v3.0.dmg 2>/dev/null || true
wget -q "https://github.com/DJSPEEDYGA/GOAT-Royalty-App/releases/download/v3.0/GOAT-Royalty-USB-v3.0.zip" -O GOAT-Royalty-USB-v3.0.zip 2>/dev/null || true
cd ..
cat > downloads.html <<DLHTML
<!DOCTYPE html><html><head><title>GOAT Downloads</title>
<style>body{font-family:Arial;max-width:900px;margin:40px auto;padding:20px;background:#f5f5f5}
.container{background:white;padding:30px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
h1{color:#667eea;text-align:center}
.card{border:1px solid #ddd;padding:20px;margin:10px 0;border-radius:5px}
.btn{display:block;padding:10px;background:#667eea;color:white;text-decoration:none;text-align:center;border-radius:5px;margin-top:10px}
</style></head><body>
<div class="container"><h1>🐐 GOAT Royalty App v3.0 - Downloads</h1>
<div class="card"><h3>🪟 Windows EXE</h3><a href="downloads/GOAT-Royalty-Setup-v3.0.exe" class="btn">Download</a></div>
<div class="card"><h3>🍎 Mac DMG</h3><a href="downloads/GOAT-Royalty-v3.0.dmg" class="btn">Download</a></div>
<div class="card"><h3>💾 USB Portable</h3><a href="downloads/GOAT-Royalty-USB-v3.0.zip" class="btn">Download</a></div>
<p style="text-align:center;margin-top:20px"><a href="/"><strong>🚀 Launch Web App</strong></a></p></div></body></html>
DLHTML
echo "✅ Done! http://$IP:$PORT/downloads.html"
SCRIPT
)"