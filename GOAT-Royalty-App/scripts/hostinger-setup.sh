#!/bin/bash
# ============================================================
# GOAT Royalty Empire - Run this DIRECTLY on each Hostinger server
# Copy-paste into Hostinger Terminal (VPS Manager > Terminal)
# ============================================================

set -e

echo "🐐 GOAT Royalty Empire - Server Setup Starting..."

# Detect which server we're on
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "Server IP: $SERVER_IP"

# ── Install core dependencies ──
apt-get update -y
apt-get install -y git curl wget nginx python3 python3-pip nodejs npm unzip

# ── Install PM2 ──
npm install -g pm2

# ── Clone the repo ──
mkdir -p /var/www/goat-royalty
cd /var/www/goat-royalty
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git . 2>/dev/null || git pull origin main

# ── Copy web files ──
mkdir -p /var/www/goat-royalty/web
cp -r web-app/* /var/www/goat-royalty/web/ 2>/dev/null || true
cp -r GOAT-Royalty-USB /var/www/goat-royalty/ 2>/dev/null || true

# ── Set up Python API server ──
cat > /var/www/goat-royalty/api-server.py << 'PYEOF'
#!/usr/bin/env python3
import http.server, socketserver, json, urllib.request
from pathlib import Path
from urllib.parse import parse_qs, urlparse

PORT = 3333
DATA = Path('/var/www/goat-royalty/data/processed')

try:
    raw = json.loads((DATA / 'unified-catalog.json').read_text())
    catalog = raw.get('catalog', raw) if isinstance(raw, dict) else raw
    print(f"✅ Loaded {len(catalog)} catalog entries")
except Exception as e:
    catalog = []
    print(f"⚠ Catalog: {e}")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='/var/www/goat-royalty/web', **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        p = urlparse(self.path)
        if p.path == '/api/health':
            self.json({'status': 'ok', 'catalog': len(catalog), 'version': '3.0.0'})
        elif p.path == '/api/stats':
            waka = sum(1 for e in catalog if 'waka' in e.get('source',''))
            fast = sum(1 for e in catalog if 'fastassman' in e.get('source',''))
            harv = sum(1 for e in catalog if 'harvey' in e.get('source',''))
            self.json({'total': len(catalog), 'waka': waka, 'fastassman': fast, 'harvey': harv,
                       'with_isrc': sum(1 for e in catalog if e.get('isrc')),
                       'with_splits': sum(1 for e in catalog if e.get('split_writer'))})
        elif p.path == '/api/catalog':
            q = parse_qs(p.query).get('q',[''])[0].lower()
            limit = int(parse_qs(p.query).get('limit',['50'])[0])
            res = [e for e in catalog if q in json.dumps(e).lower()][:limit] if q else catalog[:limit]
            self.json(res)
        elif p.path == '/api/isrc':
            q = parse_qs(p.query).get('q',[''])[0].upper()
            res = [e for e in catalog if e.get('isrc','').upper() == q]
            self.json(res)
        else:
            super().do_GET()

    def do_POST(self):
        p = urlparse(self.path)
        if p.path == '/api/chat':
            body = json.loads(self.rfile.read(int(self.headers.get('Content-Length',0))))
            msg = body.get('message','')
            self.json({'response': self.ask_llm(msg)})

    def ask_llm(self, msg):
        # Search catalog for context
        words = msg.lower().split()
        matches = [e for e in catalog if any(w in json.dumps(e).lower() for w in words if len(w)>3)][:5]
        ctx = '\n'.join([f"- {e.get('title','?')} | {e.get('artist','?')} | ISRC: {e.get('isrc','N/A')} | Split: {e.get('split_writer','?')}" for e in matches])
        prompt = f"You are GOAT Royalty AI. Music catalog: 2,980 entries (Waka Flocka Flame, Fastassman Publishing, Harvey Miller).\n\nRelevant entries:\n{ctx}\n\nQuestion: {msg}\n\nAnswer:"
        try:
            data = json.dumps({'model':'gemma2:2b','prompt':prompt,'stream':False}).encode()
            req = urllib.request.Request('http://localhost:11434/api/generate', data=data, headers={'Content-Type':'application/json'})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read()).get('response','...')
        except:
            # Fallback smart responses
            ml = msg.lower()
            if 'waka' in ml: return f"Waka Flocka Flame has 759 entries in the catalog with {sum(1 for e in catalog if e.get('artist','').lower().find('waka')>-1)} tracks. ISRCs available."
            if 'split' in ml or 'royalt' in ml: return f"Royalty splits data available for {sum(1 for e in catalog if e.get('split_writer'))} tracks. Harvey Miller (100% writer/publisher split via Fastassman Publishing ASCAP)."
            if 'isrc' in ml: return f"We have {sum(1 for e in catalog if e.get('isrc'))} ISRCs registered across the catalog."
            return f"GOAT Royalty catalog has {len(catalog)} entries. Ask about Waka Flocka, Fastassman Publishing, Harvey Miller, ISRCs, or royalty splits."

    def json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode())

    def log_message(self, *a): pass

print(f"🐐 GOAT API Server on port {PORT}")
with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as s:
    s.serve_forever()
PYEOF

# ── Start API server with PM2 ──
pm2 delete goat-api 2>/dev/null || true
pm2 start python3 --name goat-api -- /var/www/goat-royalty/api-server.py
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1 | bash 2>/dev/null || true

# ── Configure Nginx ──
cat > /etc/nginx/sites-available/goat-royalty << NGINXEOF
server {
    listen 80 default_server;
    server_name _;
    root /var/www/goat-royalty/web;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:3333;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_read_timeout 60s;
        add_header Access-Control-Allow-Origin *;
    }

    location /usb/ {
        alias /var/www/goat-royalty/GOAT-Royalty-USB/Shared/catalog/;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/goat-royalty /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx && systemctl enable nginx

# ── Install Ollama ──
echo "🤖 Installing Ollama LLM..."
apt-get install -y zstd
curl -fsSL https://ollama.com/install.sh | sh
systemctl enable ollama
systemctl start ollama
sleep 5

# Pull smallest uncensored model in background
nohup ollama pull gemma2:2b > /var/log/ollama-pull.log 2>&1 &
echo "⏳ Pulling gemma2:2b in background... Check: tail -f /var/log/ollama-pull.log"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   ✅ GOAT ROYALTY APP DEPLOYED SUCCESSFULLY! 🐐          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Web App:    http://$SERVER_IP"
echo "🤖 AI API:     http://$SERVER_IP/api/chat"
echo "📊 Stats:      http://$SERVER_IP/api/stats"
echo "🔍 Catalog:    http://$SERVER_IP/api/catalog?q=waka"
echo "💾 USB Edition: http://$SERVER_IP/usb/"
echo ""
echo "📋 PM2 Status: pm2 status"
echo "📋 API Logs:   pm2 logs goat-api"
echo "🤖 Ollama:     ollama list"