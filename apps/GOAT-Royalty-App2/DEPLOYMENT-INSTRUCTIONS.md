# 🐐 GOAT Royalty App — Deployment to VPS 93.127.214.171

## ✅ Current Status (All Code Pushed to GitHub)

| Item | Status | Details |
|------|--------|---------|
| Gemini AI LLM Integration | ✅ Complete | 15 files, 2850+ lines |
| All 11 Copilot Security Fixes | ✅ Applied | XSS, API keys, validation, etc. |
| Navigation Restored | ✅ Fixed | All AI tools + Gemini AI LLM |
| Build Test | ✅ Passing | 58 pages, 0 errors |
| GitHub Push | ✅ Live | Branch: GOAT-APP, Commit: b04cd14 |

## 📊 Platform Inventory

- **58 Pages** including Gemini AI, Dashboard, AI Studio, Tracks, Analytics, etc.
- **48 API Routes** including 6 Gemini AI endpoints
- **84 Components** including GeminiLLM chat interface
- **6 Gemini AI Endpoints:**
  - `/api/gemini-llm/chat` — SSE streaming chat
  - `/api/gemini-llm/models` — Model registry
  - `/api/gemini-stream` — Alternative streaming via service library
  - `/api/gemini-tools` — Function calling (6 GOAT tools)
  - `/api/gemini-vision` — Multimodal image analysis
  - `/api/gemini-chat-enhanced` — Multi-persona chat

---

## 🚀 Deployment Steps

### Option A: One-Command Deploy (Recommended)

SSH into your VPS and run:

```bash
ssh root@93.127.214.171
```

Then execute:

```bash
curl -sSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App2/GOAT-APP/deploy-production.sh | bash
```

### Option B: Manual Step-by-Step

#### Step 1: SSH into VPS
```bash
ssh root@93.127.214.171
```

#### Step 2: Install System Dependencies
```bash
apt-get update
apt-get install -y curl git nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2
```

#### Step 3: Clone Repository
```bash
cd /root
git clone -b GOAT-APP https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git goat-royalty-app
cd goat-royalty-app
```

#### Step 4: Configure Environment Variables
```bash
cp .env.production.template .env.local
nano .env.local
```

**Fill in these required values:**
```
GOOGLE_AI_API_KEY=<your key from https://aistudio.google.com/apikey>
NEXT_PUBLIC_SUPABASE_URL=<your Supabase project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your Supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<your Supabase service role key>
```

#### Step 5: Install Dependencies & Build
```bash
npm install
npm run build
```

#### Step 6: Start with PM2
```bash
pm2 start npm --name "goat-royalty" -- start -- -p 3002
pm2 startup
pm2 save
```

#### Step 7: Configure Nginx
```bash
cat > /etc/nginx/sites-available/goat-royalty << 'EOF'
server {
    listen 80;
    server_name 93.127.214.171;

    # General proxy
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
    }

    # SSE streaming for Gemini AI chat
    location /api/gemini-llm/chat {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
        proxy_read_timeout 300s;
    }

    # SSE streaming for Gemini stream endpoint
    location /api/gemini-stream {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
        proxy_read_timeout 300s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/goat-royalty /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

#### Step 8: Configure Firewall
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

---

## 🔑 API Keys You Need

| Service | Where to Get | Required? |
|---------|-------------|-----------|
| Google Gemini AI | https://aistudio.google.com/apikey | ✅ Required |
| Supabase | https://supabase.com/dashboard | ✅ Required |
| Spotify | https://developer.spotify.com | Optional |
| TikTok | https://developers.tiktok.com | Optional |
| Adobe Firefly | https://developer.adobe.com | Optional |
| NVIDIA DGX | https://build.nvidia.com | Optional |

---

## ✅ Post-Deployment Verification

After deployment, verify these URLs work:

1. **Homepage:** http://93.127.214.171
2. **Dashboard:** http://93.127.214.171/dashboard
3. **Gemini AI Chat:** http://93.127.214.171/gemini-ai
4. **AI Studio:** http://93.127.214.171/ai-studio
5. **Tracks:** http://93.127.214.171/tracks
6. **API Health Check:** http://93.127.214.171/api/gemini-llm/models

---

## 🔧 Management Commands

```bash
# Check app status
pm2 status

# View logs
pm2 logs goat-royalty

# Restart app
pm2 restart goat-royalty

# Update from GitHub
cd /root/goat-royalty-app
git pull origin GOAT-APP
npm install
npm run build
pm2 restart goat-royalty
```