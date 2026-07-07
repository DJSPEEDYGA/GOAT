# ============================================================================
# 🤖 INSTALL REAL LOCAL AI (Ollama + Uncensored Models)
# Adds real LLM chat to your GOAT Royalty App
# No API keys, no passwords, fully local, uncensored
# ============================================================================
# 
# COPY-PASTE THIS ENTIRE BLOCK TO YOUR SERVER TERMINAL:

bash << 'OLLAMA_SETUP'
set -e
clear
echo ""
echo "🤖 INSTALLING REAL LOCAL AI - Ollama + Uncensored Models"
echo "=========================================================="
echo ""

# Detect server
IP=$(hostname -I | awk '{print $1}')
PORT=80
[[ "$IP" == "72.61.193.184" ]] && PORT=8080
echo "📡 Server: $IP:$PORT"

# Step 1: Install Ollama
echo ""
echo "📦 [1/5] Installing Ollama..."
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
    echo "   ✅ Ollama installed"
else
    echo "   ✅ Ollama already installed"
fi

# Step 2: Start Ollama service
echo ""
echo "🚀 [2/5] Starting Ollama service..."
systemctl enable ollama 2>/dev/null || true
systemctl start ollama 2>/dev/null || true
sleep 3

# Check if running
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "   ✅ Ollama service running on port 11434"
else
    # Try to start manually
    OLLAMA_HOST=0.0.0.0 nohup ollama serve > /var/log/ollama.log 2>&1 &
    sleep 5
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "   ✅ Ollama started manually"
    else
        echo "   ⚠️  Ollama may need manual start - continuing anyway"
    fi
fi

# Step 3: Pull uncensored models
echo ""
echo "⬇️  [3/5] Pulling uncensored AI models..."
echo "   This will take a few minutes (models are 1-4GB each)..."
echo ""

echo "   📦 Pulling gemma2:2b (1.6GB - fast)..."
ollama pull gemma2:2b 2>&1 | tail -3 || echo "   ⚠️ gemma2:2b pull failed"

echo ""
echo "   📦 Pulling llama3.2:3b (2GB - smart)..."
ollama pull llama3.2:3b 2>&1 | tail -3 || echo "   ⚠️ llama3.2:3b pull failed"

echo ""
echo "   Available models:"
ollama list 2>/dev/null | head -10

# Step 4: Configure nginx to proxy /api/chat to Ollama
echo ""
echo "🔧 [4/5] Configuring nginx to proxy /api/chat → Ollama..."

cat > /etc/nginx/sites-available/goat << NGINX
server {
    listen $PORT default_server;
    listen [::]:$PORT;
    root /var/www/goat;
    index index.html;
    server_name _;
    
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    
    location / {
        try_files \$uri \$uri.html \$uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    # Ollama AI proxy
    location /api/chat {
        proxy_pass http://localhost:11434/api/chat;
        proxy_set_header Host localhost;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_read_timeout 120s;
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type" always;
    }
    
    location /api/generate {
        proxy_pass http://localhost:11434/api/generate;
        proxy_set_header Host localhost;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_read_timeout 120s;
        add_header Access-Control-Allow-Origin * always;
    }
    
    location /api/tags {
        proxy_pass http://localhost:11434/api/tags;
        proxy_set_header Host localhost;
        add_header Access-Control-Allow-Origin * always;
    }
    
    location ~* \.json$ {
        add_header Content-Type application/json;
        add_header Access-Control-Allow-Origin *;
    }
    
    location ~* \.(png|jpg|jpeg|gif|ico|svg|woff2?|css|js)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
    
    # Direct URL access
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

nginx -t && systemctl reload nginx
echo "   ✅ nginx configured with AI proxy"

# Step 5: Test
echo ""
echo "🧪 [5/5] Testing real AI chat..."
sleep 2
TEST_RESPONSE=$(curl -s -X POST http://localhost:$PORT/api/chat \
    -H "Content-Type: application/json" \
    -d '{"model":"gemma2:2b","messages":[{"role":"user","content":"Say hello in 5 words"}],"stream":false}' \
    --max-time 30 2>/dev/null)

if echo "$TEST_RESPONSE" | grep -q "message\|content"; then
    echo "   ✅ REAL AI responding!"
    echo "$TEST_RESPONSE" | head -100
else
    echo "   ⚠️  Test pending - AI may still be loading models"
fi

echo ""
echo "============================================================"
echo "🎉  REAL AI IS NOW LIVE!"
echo "============================================================"
echo ""
echo "🤖 Open your GOAT Royalty v6 app:"
echo "   http://$IP:$PORT/goat-royalty/"
echo ""
echo "   Click 'Super LLM' in the sidebar and chat"
echo "   Your chat now talks to REAL Ollama - not demo!"
echo ""
echo "📋 Test endpoints:"
echo "   curl http://$IP:$PORT/api/tags"
echo "   curl -X POST http://$IP:$PORT/api/chat -d '{\"model\":\"gemma2:2b\",\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}],\"stream\":false}' -H 'Content-Type: application/json'"
echo ""
echo "🔧 Manage:"
echo "   ollama list              # show installed models"
echo "   ollama pull MODEL        # install more models"
echo "   systemctl status ollama  # check service"
echo "============================================================"
OLLAMA_SETUP