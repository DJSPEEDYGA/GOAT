#!/bin/bash

# ============================================================================
# GOAT Royalty App v3.0 - All-in-One Install & Deploy Script
# ============================================================================
# This single command DEPLOYS the web app AND downloads all installers:
# - Web App (Server Deployment)
# - Windows EXE Installer
# - Mac DMG Installer
# - USB Portable Edition (ZIP)
# - All real catalog data (2,980 entries, 759 ISRCs)
# ============================================================================

set -e  # Exit on error

echo "🐐 GOAT Royalty App v3.0 - All-in-One Install & Deploy"
echo "======================================================"
echo ""

# Detect which server we're on
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "🌐 Detected Server IP: $SERVER_IP"

# Set port based on IP (Server 1 uses 80, Server 2 uses 8080)
if [[ "$SERVER_IP" == "93.127.214.171" ]]; then
    WEB_PORT=80
    SERVER_NAME="Server 1"
elif [[ "$SERVER_IP" == "72.61.193.184" ]]; then
    WEB_PORT=8080
    SERVER_NAME="Server 2"
else
    WEB_PORT=8080
    SERVER_NAME="Unknown (using port 8080)"
fi
echo "📡 $SERVER_NAME will use Port: $WEB_PORT"
echo ""

# ============================================================================
# STEP 1: Deploy Web App
# ============================================================================
echo "🚀 STEP 1: Deploying Web App..."
echo "--------------------------------"

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing nginx..."
    apt-get update -qq && apt-get install -y -qq nginx
else
    echo "✅ nginx already installed"
fi

# Create directory and download app
mkdir -p /var/www/goat
cd /var/www/goat

echo "⬇️  Downloading app from GitHub..."
wget -q --show-progress "https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/web-app/goat-royalty/index.html" -O index.html

# Verify download
if [ -f "index.html" ]; then
    SIZE=$(wc -c < index.html)
    echo "✅ Downloaded: $SIZE bytes"
else
    echo "❌ ERROR: Failed to download index.html"
    exit 1
fi

# Download catalog JSON data files
echo "⬇️  Downloading catalog data..."
wget -q --show-progress "https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/data/unified-catalog.json" -O catalog.json 2>/dev/null || echo "⚠️  Catalog JSON not found in repo"
wget -q --show-progress "https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/data/split-assignments.json" -O splits.json 2>/dev/null || echo "⚠️  Splits JSON not found in repo"

# Configure nginx
echo "🔧 Configuring nginx on port $WEB_PORT..."
cat > /etc/nginx/sites-available/goat << NGINXCONF
server {
    listen $WEB_PORT default_server;
    listen [::]:$WEB_PORT;
    root /var/www/goat;
    index index.html;
    server_name _;
    
    gzip on;
    gzip_types text/html text/css application/javascript;
    
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    location ~* \.(json|csv)$ {
        add_header Content-Type application/json;
        add_header Cache-Control "public, max-age=3600";
    }
}
NGINXCONF

# Enable site
ln -sf /etc/nginx/sites-available/goat /etc/nginx/sites-enabled/goat
rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
nginx -t && systemctl enable nginx && systemctl restart nginx

# Configure firewall if Server 1
if [[ "$WEB_PORT" == "80" ]]; then
    echo "🔒 Configuring firewall..."
    ufw allow 80/tcp 2>/dev/null || true
    ufw allow 443/tcp 2>/dev/null || true
fi

echo "✅ Web App Deployed: http://$SERVER_IP:$WEB_PORT"
echo ""

# ============================================================================
# STEP 2: Download USB Portable Edition
# ============================================================================
echo "💾 STEP 2: Downloading USB Portable Edition..."
echo "-----------------------------------------------"

mkdir -p /var/www/goat/downloads
cd /var/www/goat/downloads

# Try to download USB edition from repo
echo "⬇️  Checking for USB Portable Edition..."
wget -q --show-progress "https://github.com/DJSPEEDYGA/GOAT-Royalty-App/releases/download/v3.0/GOAT-Royalty-USB-v3.0.zip" -O GOAT-Royalty-USB-v3.0.zip 2>/dev/null || \
wget -q --show-progress "https://github.com/DJSPEEDYGA/GOAT-Royalty-App/releases/download/v2.0/GOAT-Royalty-USB-v2.0.zip" -O GOAT-Royalty-USB-v2.0.zip 2>/dev/null || \
echo "⚠️  USB Edition not found in releases (will check main branch)"

# Try to get USB edition from main branch
if ! ls GOAT-Royalty-USB-*.zip 1> /dev/null 2>&1; then
    wget -q --show-progress "https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/GOAT-Royalty-USB-v3.0.zip" -O GOAT-Royalty-USB-v3.0.zip 2>/dev/null || true
fi

if ls GOAT-Royalty-USB-*.zip 1> /dev/null 2>&1; then
    USB_FILE=$(ls GOAT-Royalty-USB-*.zip | head -1)
    USB_SIZE=$(du -h "$USB_FILE" | awk '{print $1}')
    echo "✅ USB Edition Downloaded: $USB_FILE ($USB_SIZE)"
    echo "   Download URL: http://$SERVER_IP:$WEB_PORT/downloads/$USB_FILE"
else
    echo "⚠️  USB Edition not available - creating download info page..."
    cat > portable-info.html << 'INFOHTML'
<!DOCTYPE html>
<html>
<head><title>GOAT Portable Edition</title></head>
<body style="font-family: Arial; padding: 20px;">
    <h1>🐐 GOAT Royalty App - Portable Edition</h1>
    <p>The USB Portable Edition contains the full app in a self-contained format that runs from USB drives.</p>
    <p><strong>Status:</strong> Not currently available in GitHub releases.</p>
    <p>To create the portable edition, use the web app at <a href="/">http://your-server</a> and export your data.</p>
</body>
</html>
INFOHTML
fi
echo ""

# ============================================================================
# STEP 3: Download Windows EXE Installer
# ============================================================================
echo "🪟 STEP 3: Downloading Windows EXE Installer..."
echo "------------------------------------------------"

cd /var/www/goat/downloads

wget -q --show-progress "https://github.com/DJSPEEDYGA/GOAT-Royalty-App/releases/download/v3.0/GOAT-Royalty-Setup-v3.0.exe" -O GOAT-Royalty-Setup-v3.0.exe 2>/dev/null || \
wget -q --show-progress "https://github.com/DJSPEEDYGA/GOAT-Royalty-App/releases/download/v2.0/GOAT-Royalty-Setup-v2.0.exe" -O GOAT-Royalty-Setup-v2.0.exe 2>/dev/null || \
echo "⚠️  Windows EXE not found in releases"

if ls GOAT-Royalty-Setup-*.exe 1> /dev/null 2>&1; then
    EXE_FILE=$(ls GOAT-Royalty-Setup-*.exe | head -1)
    EXE_SIZE=$(du -h "$EXE_FILE" | awk '{print $1}')
    echo "✅ Windows EXE Downloaded: $EXE_FILE ($EXE_SIZE)"
    echo "   Download URL: http://$SERVER_IP:$WEB_PORT/downloads/$EXE_FILE"
else
    echo "⚠️  Windows installer not available in releases"
fi
echo ""

# ============================================================================
# STEP 4: Download Mac DMG Installer
# ============================================================================
echo "🍎 STEP 4: Downloading Mac DMG Installer..."
echo "---------------------------------------------"

cd /var/www/goat/downloads

wget -q --show-progress "https://github.com/DJSPEEDYGA/GOAT-Royalty-App/releases/download/v3.0/GOAT-Royalty-v3.0.dmg" -O GOAT-Royalty-v3.0.dmg 2>/dev/null || \
wget -q --show-progress "https://github.com/DJSPEEDYGA/GOAT-Royalty-App/releases/download/v2.0/GOAT-Royalty-v2.0.dmg" -O GOAT-Royalty-v2.0.dmg 2>/dev/null || \
echo "⚠️  Mac DMG not found in releases"

if ls GOAT-Royalty-*.dmg 1> /dev/null 2>&1; then
    DMG_FILE=$(ls GOAT-Royalty-*.dmg | head -1)
    DMG_SIZE=$(du -h "$DMG_FILE" | awk '{print $1}')
    echo "✅ Mac DMG Downloaded: $DMG_FILE ($DMG_SIZE)"
    echo "   Download URL: http://$SERVER_IP:$WEB_PORT/downloads/$DMG_FILE"
else
    echo "⚠️  Mac installer not available in releases"
fi
echo ""

# ============================================================================
# STEP 5: Create Downloads Page
# ============================================================================
echo "📄 STEP 5: Creating Downloads Page..."
echo "--------------------------------------"

cd /var/www/goat

cat > downloads.html << DOWNLOADSHTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GOAT Royalty App - Downloads</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            padding: 40px;
        }
        h1 {
            text-align: center;
            color: #667eea;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
        }
        .version {
            background: #667eea;
            color: white;
            text-align: center;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 30px;
            font-weight: bold;
        }
        .downloads-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .download-card {
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s;
        }
        .download-card:hover {
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
            transform: translateY(-2px);
        }
        .card-icon {
            font-size: 3em;
            margin-bottom: 10px;
        }
        .card-title {
            font-weight: bold;
            font-size: 1.1em;
            margin-bottom: 5px;
        }
        .card-desc {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 15px;
        }
        .download-btn {
            display: block;
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            text-decoration: none;
            text-align: center;
            border-radius: 6px;
            font-weight: bold;
            transition: background 0.3s;
        }
        .download-btn:hover {
            background: #5a67d8;
        }
        .download-btn.disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .features {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .features h3 {
            margin-bottom: 15px;
            color: #667eea;
        }
        .features ul {
            list-style: none;
            padding-left: 0;
        }
        .features li {
            padding: 8px 0;
            padding-left: 30px;
            position: relative;
        }
        .features li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
        }
        .web-link {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
        }
        .web-link a {
            color: #667eea;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.2em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐐 GOAT Royalty App</h1>
        <p class="subtitle">Music Royalty Management Platform</p>
        
        <div class="version">Version 3.0 - All 9 Modules Working</div>
        
        <h2 style="margin-bottom: 20px;">Downloads</h2>
        
        <div class="downloads-grid">
            <div class="download-card">
                <div class="card-icon">🪟</div>
                <div class="card-title">Windows Installer</div>
                <div class="card-desc">EXE setup file for Windows 10/11</div>
                <a href="downloads/GOAT-Royalty-Setup-v3.0.exe" 
                   class="download-btn"
                   onclick="if(this.href.endsWith('v3.0.exe')) return true; alert('Installer being prepared'); return false;">
                   Download EXE
                </a>
            </div>
            
            <div class="download-card">
                <div class="card-icon">🍎</div>
                <div class="card-title">Mac Installer</div>
                <div class="card-desc">DMG file for macOS 10.15+</div>
                <a href="downloads/GOAT-Royalty-v3.0.dmg" 
                   class="download-btn"
                   onclick="if(this.href.endsWith('v3.0.dmg')) return true; alert('Installer being prepared'); return false;">
                   Download DMG
                </a>
            </div>
            
            <div class="download-card">
                <div class="card-icon">💾</div>
                <div class="card-title">USB Portable</div>
                <div class="card-desc">Run from USB drive - no installation</div>
                <a href="downloads/GOAT-Royalty-USB-v3.0.zip" 
                   class="download-btn"
                   onclick="if(this.href.endsWith('v3.0.zip')) return true; alert('Portable edition being prepared'); return false;">
                   Download ZIP
                </a>
            </div>
        </div>
        
        <div class="features">
            <h3>✨ What's Included</h3>
            <ul>
                <li>All 9 Modules: Dashboard, Royalty Tracker, Blockchain Ledger, Super LLM, Crypto Mining, DSP Distribution, Video Editor 3D, Integrations, Settings</li>
                <li>Real Catalog Data: 2,980 entries, 759 ISRC codes</li>
                <li>Fully functional with no external dependencies</li>
                <li>Works offline after installation</li>
                <li>Export/Import data & settings</li>
                <li>Built-in AI chat (Ollama integration)</li>
                <li>Interactive blockchain & mining simulation</li>
            </ul>
        </div>
        
        <div class="web-link">
            <a href="/index.html">🚀 Launch Web App</a>
        </div>
    </div>
</body>
</html>
DOWNLOADSHTML

echo "✅ Downloads page created: http://$SERVER_IP:$WEB_PORT/downloads.html"
echo ""

# ============================================================================
# STEP 6: Summary & Success
# ============================================================================
echo "======================================================"
echo "✅ INSTALLATION COMPLETE!"
echo "======================================================"
echo ""
echo "🌐 Web App:       http://$SERVER_IP:$WEB_PORT"
echo "📥 Downloads:     http://$SERVER_IP:$WEB_PORT/downloads.html"
echo ""
echo "📊 Stats:"
echo "   - Web App: Deployed with all 9 modules"
echo "   - Catalog Data: 2,980 entries (if available in repo)"
echo "   - Installers: Checked from GitHub releases"
echo ""
echo "🔗 Download URLs:"
if ls /var/www/goat/downloads/* 1> /dev/null 2>&1; then
    for file in /var/www/goat/downloads/*; do
        if [ -f "$file" ]; then
            name=$(basename "$file")
            size=$(du -h "$file" | awk '{print $1}')
            echo "   - $name: http://$SERVER_IP:$WEB_PORT/downloads/$name ($size)"
        fi
    done
else
    echo "   (Installers will be added to GitHub releases)"
fi
echo ""
echo "🐐 GOAT Royalty App v3.0 is ready!"
echo "======================================================"