#!/bin/bash
# ============================================================
# GOAT Royalty App - Deploy to Server 1 (93.127.214.171)
# Ubuntu 24.04 LTS - KVM 8 - Main App Server
# ============================================================

set -e

SERVER="93.127.214.171"
USER="root"
APP_DIR="/var/www/goat-royalty"
REPO="https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git"

echo "🐐 Deploying GOAT Royalty App to Server 1 ($SERVER)..."

ssh $USER@$SERVER << 'ENDSSH'

# ── System Update ──
echo "📦 Updating system..."
apt-get update -y && apt-get upgrade -y

# ── Install Dependencies ──
echo "📦 Installing Node.js, Nginx, PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs nginx git curl wget unzip python3 python3-pip

# ── Install PM2 ──
npm install -g pm2

# ── Install Ollama (Real LLM) ──
echo "🤖 Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh
systemctl enable ollama
systemctl start ollama
sleep 5

# Pull uncensored model
echo "🤖 Pulling Gemma 2B uncensored model..."
ollama pull gemma2:2b &
OLLAMA_PID=$!

# ── Clone/Update App ──
echo "📁 Setting up app directory..."
mkdir -p $APP_DIR
cd $APP_DIR

if [ -d ".git" ]; then
    git pull origin main
else
    git clone $REPO .
fi

# ── Set up Web App ──
echo "🌐 Setting up web app..."
mkdir -p $APP_DIR/web

# Copy static files
cp -r web-app/static/* $APP_DIR/web/ 2>/dev/null || true

# Set up Python API server
cat > $APP_DIR/server.py << 'PYEOF'
#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import urllib.request
from pathlib import Path
from urllib.parse import parse_qs, urlparse

PORT = 3333
DATA_DIR = Path('/var/www/goat-royalty/data/processed')
CHAT_DIR = Path('/var/www/goat-royalty/chat_data')
CHAT_DIR.mkdir(exist_ok=True)

OLLAMA_URL = 'http://localhost:11434/api/generate'

# Load unified catalog
catalog = []
try:
    with open(DATA_DIR / 'unified-catalog.json') as f:
        data = json.load(f)
        catalog = data.get('catalog', data) if isinstance(data, dict) else data
    print(f"Loaded {len(catalog)} catalog entries")
except Exception as e:
    print(f"Catalog load error: {e}")

class GOATHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='/var/www/goat-royalty/web', **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/stats':
            self.send_json({'total': len(catalog), 'status': 'live'})
        elif parsed.path == '/api/catalog':
            q = parse_qs(parsed.query).get('q', [''])[0].lower()
            results = [e for e in catalog if q in json.dumps(e).lower()][:50] if q else catalog[:50]
            self.send_json(results)
        elif parsed.path == '/api/health':
            self.send_json({'status': 'ok', 'catalog': len(catalog)})
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/chat':
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))
            message = body.get('message', '')
            response = self.ask_ollama(message)
            self.send_json({'response': response})

    def ask_ollama(self, message):
        # Build context from catalog
        q = message.lower()
        matches = [e for e in catalog if any(w in json.dumps(e).lower() for w in q.split())][:5]
        context = ''
        if matches:
            context = 'Catalog data:\n' + '\n'.join([
                f"- {e.get('title','?')} by {e.get('artist','?')} ISRC:{e.get('isrc','N/A')}"
                for e in matches
            ])

        prompt = f"""You are the GOAT Royalty AI assistant. You have access to a music catalog with 2,980 entries including Waka Flocka Flame, Fastassman Publishing, and Harvey Miller works.

{context}

User question: {message}

Answer helpfully about music rights, royalties, catalog data, and the music industry. Be specific with real data when available."""

        try:
            data = json.dumps({
                'model': 'gemma2:2b',
                'prompt': prompt,
                'stream': False
            }).encode()
            req = urllib.request.Request(OLLAMA_URL, data=data, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=30) as r:
                result = json.loads(r.read())
                return result.get('response', 'AI processing...')
        except Exception as e:
            return f"AI temporarily unavailable: {str(e)}. Catalog has {len(catalog)} entries ready."

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def log_message(self, fmt, *args):
        pass

if __name__ == '__main__':
    print(f"🐐 GOAT Royalty Server running on port {PORT}")
    with socketserver.TCPServer(('0.0.0.0', PORT), GOATHandler) as httpd:
        httpd.serve_forever()
PYEOF

# ── Start Python API Server with PM2 ──
pm2 delete goat-api 2>/dev/null || true
pm2 start python3 --name goat-api -- /var/www/goat-royalty/server.py
pm2 save

# ── Configure Nginx ──
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/goat-royalty << 'NGINXEOF'
server {
    listen 80;
    server_name 93.127.214.171 srv832760.hstgr.cloud;
    root /var/www/goat-royalty/web;
    index index.html;

    # API proxy to Python server
    location /api/ {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 60s;
    }

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|ico|json)$ {
        expires 1d;
        add_header Cache-Control "public";
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/goat-royalty /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
systemctl enable nginx

echo ""
echo "✅ Server 1 deployment complete!"
echo "🌐 App running at: http://93.127.214.171"
echo "🤖 AI API at: http://93.127.214.171/api/chat"
echo "📊 Catalog at: http://93.127.214.171/api/catalog"
ENDSSH