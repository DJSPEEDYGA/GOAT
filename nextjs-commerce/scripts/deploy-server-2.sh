#!/bin/bash
# ============================================================
# GOAT Gaming Server - Deploy to Server 2 (72.61.193.184)
# Ubuntu 24.04 + Docker + Traefik - KVM 2 - Gaming Server
# ============================================================

set -e

SERVER="72.61.193.184"
USER="root"

echo "🎮 Deploying Gaming Server to Server 2 ($SERVER)..."

ssh $USER@$SERVER << 'ENDSSH'

# ── System Update ──
apt-get update -y

# ── Install Docker if not present ──
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# ── Install Docker Compose ──
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# ── Set up FiveM Server ──
mkdir -p /opt/fivem/server-data
mkdir -p /opt/fivem/txdata
cd /opt/fivem

# ── Create Docker Compose for FiveM + txAdmin ──
cat > /opt/fivem/docker-compose.yml << 'DOCKEREOF'
version: '3.8'

networks:
  traefik-net:
    external: true
  gaming-net:
    driver: bridge

services:

  # Traefik Reverse Proxy
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@goatroyalty.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    networks:
      - traefik-net

  # FiveM Server
  fivem:
    image: spritsail/fivem:latest
    container_name: fivem
    restart: unless-stopped
    environment:
      - FIVEM_PORT=30120
      - TXA_PORT=40120
      - NO_DEFAULT_CONFIG=1
    ports:
      - "30120:30120/tcp"
      - "30120:30120/udp"
      - "40120:40120"
    volumes:
      - ./server-data:/config
      - ./txdata:/txData
    networks:
      - gaming-net
      - traefik-net
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.txadmin.rule=Host(`gaming.srv1148455.hstgr.cloud`)"
      - "traefik.http.routers.txadmin.entrypoints=web"
      - "traefik.http.services.txadmin.loadbalancer.server.port=40120"

  # txAdmin Web Panel
  txadmin:
    image: ghcr.io/citizenfx/fivem:latest
    container_name: txadmin
    restart: unless-stopped
    ports:
      - "40120:40120"
    volumes:
      - ./txdata:/txData
    networks:
      - gaming-net
      - traefik-net
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.txadmin-panel.rule=Host(`txadmin.srv1148455.hstgr.cloud`)"
      - "traefik.http.routers.txadmin-panel.entrypoints=web"

  # GOAT Gaming Dashboard
  goat-gaming:
    image: nginx:alpine
    container_name: goat-gaming
    restart: unless-stopped
    volumes:
      - ./gaming-dashboard:/usr/share/nginx/html:ro
    networks:
      - gaming-net
      - traefik-net
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.gaming.rule=Host(`72.61.193.184`)"
      - "traefik.http.routers.gaming.entrypoints=web"
      - "traefik.http.services.gaming.loadbalancer.server.port=80"

DOCKEREOF

# ── Create FiveM server config ──
mkdir -p /opt/fivem/server-data
cat > /opt/fivem/server-data/server.cfg << 'CFGEOF'
# GOAT Royalty FiveM Server Configuration
endpoint_add_tcp "0.0.0.0:30120"
endpoint_add_udp "0.0.0.0:30120"

# Server info
sv_projectName "GOAT Royalty RP"
sv_projectDesc "The Greatest Roleplay Server of All Time"
sv_hostname "🐐 GOAT Royalty RP Server"
sv_maxclients 32

# License key (get from https://keymaster.fivem.net)
# sv_licenseKey "your-key-here"

# Resources
ensure mapmanager
ensure chat
ensure spawnmanager
ensure sessionmanager
ensure basic-gamemode
ensure hardcap
ensure rconlog

# txAdmin
set txAdmin-playerProtection true
set txAdmin-whitelist false

# Voice
setr voice_useNativeAudio true
setr voice_useSendingRangeOnly true

# Performance
set sv_enforceGameBuild 2944
CFGEOF

# ── Create Gaming Dashboard ──
mkdir -p /opt/fivem/gaming-dashboard
cat > /opt/fivem/gaming-dashboard/index.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>🐐 GOAT Gaming Server</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#0f0f23; color:#fff; font-family: -apple-system, sans-serif; min-height:100vh; }
.header { background:linear-gradient(135deg,#1a1a3e,#2d1b69); padding:2rem; text-align:center; border-bottom:2px solid #FFD700; }
.header h1 { font-size:3rem; background:linear-gradient(135deg,#FFD700,#00ff88); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:1.5rem; padding:2rem; max-width:1200px; margin:0 auto; }
.card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,215,0,0.2); border-radius:16px; padding:1.5rem; }
.card h3 { color:#FFD700; margin-bottom:1rem; font-size:1.2rem; }
.stat { display:flex; justify-content:space-between; padding:0.5rem 0; border-bottom:1px solid rgba(255,255,255,0.05); }
.stat-val { color:#00ff88; font-weight:bold; }
.btn { display:block; background:linear-gradient(135deg,#FFD700,#FFA500); color:#000; padding:0.75rem 1.5rem; border-radius:8px; text-decoration:none; text-align:center; font-weight:bold; margin-top:1rem; }
.online { color:#00ff88; }
.status-dot { width:10px; height:10px; border-radius:50%; background:#00ff88; display:inline-block; margin-right:8px; animation:pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
</style>
</head>
<body>
<div class="header">
  <h1>🐐 GOAT Gaming Server</h1>
  <p style="color:rgba(255,255,255,0.7);margin-top:0.5rem">Powered by FiveM + txAdmin</p>
  <span style="background:#00ff88;color:#000;padding:0.3rem 1rem;border-radius:20px;font-size:0.8rem;font-weight:bold;display:inline-block;margin-top:0.5rem">● ONLINE</span>
</div>
<div class="grid">
  <div class="card">
    <h3>🎮 Server Status</h3>
    <div class="stat"><span>Status</span><span class="stat-val"><span class="status-dot"></span>Online</span></div>
    <div class="stat"><span>IP</span><span class="stat-val">72.61.193.184:30120</span></div>
    <div class="stat"><span>Max Players</span><span class="stat-val">32</span></div>
    <div class="stat"><span>Framework</span><span class="stat-val">FiveM</span></div>
    <div class="stat"><span>Game Build</span><span class="stat-val">2944</span></div>
    <a href="fivem://connect/72.61.193.184:30120" class="btn">🎮 Connect Now</a>
  </div>
  <div class="card">
    <h3>🛠️ Admin Panel</h3>
    <div class="stat"><span>txAdmin</span><span class="stat-val">Port 40120</span></div>
    <div class="stat"><span>Web Panel</span><span class="stat-val">Active</span></div>
    <a href="http://72.61.193.184:40120" class="btn" target="_blank">Open txAdmin</a>
  </div>
  <div class="card">
    <h3>📋 How to Join</h3>
    <p style="color:rgba(255,255,255,0.7);line-height:1.8">
      1. Install FiveM from fivem.net<br>
      2. Launch FiveM<br>
      3. Press F8 for console<br>
      4. Type: <code style="color:#FFD700">connect 72.61.193.184:30120</code><br>
      5. Or click Connect Now above
    </p>
  </div>
  <div class="card">
    <h3>🐐 GOAT Royalty App</h3>
    <p style="color:rgba(255,255,255,0.7);margin-bottom:1rem">Access the full GOAT Royalty music management platform</p>
    <a href="http://93.127.214.171" class="btn" target="_blank">Open GOAT Royalty App</a>
  </div>
</div>
</body>
</html>
HTMLEOF

# ── Create Traefik network if not exists ──
docker network create traefik-net 2>/dev/null || true

# ── Start all services ──
cd /opt/fivem
docker-compose up -d

echo ""
echo "✅ Gaming Server deployment complete!"
echo "🎮 FiveM: 72.61.193.184:30120"
echo "🛠️  txAdmin: http://72.61.193.184:40120"
echo "🌐 Dashboard: http://72.61.193.184"
ENDSSH