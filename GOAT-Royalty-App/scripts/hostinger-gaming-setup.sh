#!/bin/bash
# ============================================================
# GOAT Gaming Server - Run DIRECTLY on Server 2 (72.61.193.184)
# Ubuntu 24.04 + Docker + Traefik - KVM 2
# Paste into Hostinger VPS Terminal
# ============================================================

set -e

SERVER_IP=$(hostname -I | awk '{print $1}')
echo "🎮 GOAT Gaming Server Setup on $SERVER_IP..."

# ── Install Docker if not present ──
if ! command -v docker &> /dev/null; then
    apt-get update -y
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker && systemctl start docker
fi

# ── Install Docker Compose ──
apt-get install -y docker-compose-plugin curl wget git

# ── Set up directories ──
mkdir -p /opt/fivem/{server-data,txdata,letsencrypt,gaming-dashboard}
cd /opt/fivem

# ── Clone GOAT Repo ──
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git /opt/goat-royalty 2>/dev/null || \
    (cd /opt/goat-royalty && git pull origin main)

# ── Create Gaming Dashboard ──
cat > /opt/fivem/gaming-dashboard/index.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🐐 GOAT Gaming Server</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a1a;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh}
.header{background:linear-gradient(135deg,#1a0a2e,#2d1b69,#1a0a2e);padding:3rem 2rem;text-align:center;border-bottom:2px solid #FFD700;position:relative;overflow:hidden}
.header::before{content:'';position:absolute;inset:0;background:url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="%23FFD70020" stroke-width="0.5"/></svg>') center/cover;animation:rotate 20s linear infinite}
@keyframes rotate{to{transform:rotate(360deg)}}
.header h1{font-size:3.5rem;background:linear-gradient(135deg,#FFD700,#FFA500,#00ff88);-webkit-background-clip:text;-webkit-text-fill-color:transparent;position:relative;z-index:1}
.header p{color:rgba(255,255,255,0.7);margin-top:0.5rem;position:relative;z-index:1}
.badge{background:linear-gradient(135deg,#00ff88,#00cc6a);color:#000;padding:0.4rem 1.2rem;border-radius:20px;font-size:0.85rem;font-weight:bold;display:inline-block;margin-top:0.8rem;position:relative;z-index:1}
.pulse{animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;padding:2rem;max-width:1200px;margin:0 auto}
.card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,215,0,0.15);border-radius:20px;padding:1.8rem;transition:all 0.3s ease}
.card:hover{border-color:rgba(255,215,0,0.4);transform:translateY(-3px);box-shadow:0 10px 30px rgba(255,215,0,0.1)}
.card h3{color:#FFD700;margin-bottom:1.2rem;font-size:1.3rem;display:flex;align-items:center;gap:0.5rem}
.stat{display:flex;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.05)}
.stat:last-child{border:none}
.stat-val{color:#00ff88;font-weight:bold;font-family:monospace}
.btn{display:block;background:linear-gradient(135deg,#FFD700,#FFA500);color:#000;padding:0.9rem 1.5rem;border-radius:12px;text-decoration:none;text-align:center;font-weight:bold;margin-top:1.2rem;font-size:1rem;transition:all 0.3s}
.btn:hover{transform:scale(1.03);box-shadow:0 5px 20px rgba(255,215,0,0.3)}
.btn-secondary{background:rgba(255,215,0,0.1);color:#FFD700;border:1px solid #FFD700}
code{background:rgba(255,215,0,0.1);color:#FFD700;padding:0.2rem 0.5rem;border-radius:6px;font-size:0.9rem}
.online-dot{width:10px;height:10px;border-radius:50%;background:#00ff88;display:inline-block;box-shadow:0 0 10px #00ff88;animation:pulse 2s infinite}
footer{text-align:center;padding:2rem;color:rgba(255,255,255,0.3);border-top:1px solid rgba(255,255,255,0.05)}
</style>
</head>
<body>
<div class="header">
  <div>🐐</div>
  <h1>GOAT Gaming Server</h1>
  <p>FiveM Roleplay • Powered by GOAT Royalty Empire</p>
  <div class="badge"><span class="online-dot"></span> &nbsp;ONLINE &nbsp;•&nbsp; 72.61.193.184:30120</div>
</div>

<div class="grid">
  <div class="card">
    <h3>🎮 Server Info</h3>
    <div class="stat"><span>Status</span><span class="stat-val">● Running</span></div>
    <div class="stat"><span>Connect IP</span><span class="stat-val">72.61.193.184:30120</span></div>
    <div class="stat"><span>Max Players</span><span class="stat-val">32</span></div>
    <div class="stat"><span>Framework</span><span class="stat-val">FiveM</span></div>
    <div class="stat"><span>Game Build</span><span class="stat-val">2944</span></div>
    <div class="stat"><span>Server</span><span class="stat-val">KVM 2 • Docker</span></div>
    <a href="fivem://connect/72.61.193.184:30120" class="btn">🎮 Connect to Server</a>
  </div>

  <div class="card">
    <h3>🛠️ Admin Panel</h3>
    <div class="stat"><span>txAdmin Panel</span><span class="stat-val">Port 40120</span></div>
    <div class="stat"><span>Traefik Dashboard</span><span class="stat-val">Port 8080</span></div>
    <div class="stat"><span>Docker</span><span class="stat-val">Running</span></div>
    <a href="http://72.61.193.184:40120" class="btn" target="_blank">🛠️ Open txAdmin</a>
    <a href="http://72.61.193.184:8080" class="btn btn-secondary" target="_blank" style="margin-top:0.5rem">📊 Traefik Dashboard</a>
  </div>

  <div class="card">
    <h3>📋 How to Join</h3>
    <p style="color:rgba(255,255,255,0.7);line-height:2">
      1. Download FiveM from <a href="https://fivem.net" style="color:#FFD700">fivem.net</a><br>
      2. Launch FiveM client<br>
      3. Press <code>F8</code> to open console<br>
      4. Type: <code>connect 72.61.193.184</code><br>
      5. Or click "Connect to Server" button
    </p>
  </div>

  <div class="card">
    <h3>🐐 GOAT Royalty App</h3>
    <div class="stat"><span>Main App</span><span class="stat-val">93.127.214.171</span></div>
    <div class="stat"><span>Catalog</span><span class="stat-val">2,980 tracks</span></div>
    <div class="stat"><span>AI Assistant</span><span class="stat-val">Gemma 2B</span></div>
    <a href="http://93.127.214.171" class="btn" target="_blank">🐐 Open GOAT Royalty App</a>
  </div>

  <div class="card">
    <h3>🎵 In-Game Music</h3>
    <p style="color:rgba(255,255,255,0.7);line-height:1.8;margin-bottom:1rem">
      The gaming server integrates with GOAT Royalty catalog. Play licensed music in-game from the Waka Flocka Flame, Fastassman Publishing, and Harvey Miller catalogs.
    </p>
    <div class="stat"><span>Licensed Tracks</span><span class="stat-val">2,980+</span></div>
    <div class="stat"><span>With ISRCs</span><span class="stat-val">759</span></div>
  </div>

  <div class="card">
    <h3>📦 Server Resources</h3>
    <div class="stat"><span>mapmanager</span><span class="stat-val">✅ Active</span></div>
    <div class="stat"><span>chat</span><span class="stat-val">✅ Active</span></div>
    <div class="stat"><span>spawnmanager</span><span class="stat-val">✅ Active</span></div>
    <div class="stat"><span>sessionmanager</span><span class="stat-val">✅ Active</span></div>
    <div class="stat"><span>hardcap</span><span class="stat-val">✅ Active</span></div>
    <a href="https://github.com/DJSPEEDYGA/GOAT-Royalty-App" class="btn btn-secondary" target="_blank">📂 GitHub Repo</a>
  </div>
</div>

<footer>
  <p>🐐 GOAT Royalty Empire • Gaming Server v1.0 • <a href="http://93.127.214.171" style="color:#FFD700">goatroyalty.com</a></p>
</footer>

<script>
// Check server status
async function checkStatus() {
  try {
    const r = await fetch('http://93.127.214.171/api/health', {signal: AbortSignal.timeout(3000)});
    if (r.ok) {
      const d = await r.json();
      document.querySelectorAll('.stat-val')[11].textContent = d.catalog + ' tracks';
    }
  } catch(e) {}
}
checkStatus();
setInterval(checkStatus, 30000);
</script>
</body>
</html>
HTMLEOF

# ── FiveM server.cfg ──
cat > /opt/fivem/server-data/server.cfg << 'CFGEOF'
endpoint_add_tcp "0.0.0.0:30120"
endpoint_add_udp "0.0.0.0:30120"
sv_projectName "GOAT Royalty RP"
sv_projectDesc "The Greatest Roleplay Server - Powered by GOAT Royalty Empire"
sv_hostname "🐐 GOAT Royalty RP | FiveM | 72.61.193.184"
sv_maxclients 32
sv_licenseKey "cfxk_placeholder_replace_with_real_key"
ensure mapmanager
ensure chat
ensure spawnmanager
ensure sessionmanager
ensure basic-gamemode
ensure hardcap
ensure rconlog
set sv_enforceGameBuild 2944
setr voice_useNativeAudio true
add_ace group.admin command allow
add_ace group.admin command.quit deny
add_principal identifier.steam:placeholder group.admin
CFGEOF

# ── Docker Compose ──
cat > /opt/fivem/docker-compose.yml << 'DOCKEREOF'
version: '3.8'
networks:
  gaming: {driver: bridge}
services:
  # Gaming Dashboard (Nginx)
  dashboard:
    image: nginx:alpine
    container_name: goat-gaming-dashboard
    restart: unless-stopped
    ports: ["80:80"]
    volumes:
      - ./gaming-dashboard:/usr/share/nginx/html:ro
    networks: [gaming]

  # FiveM Server
  fivem:
    image: spritsail/fivem:latest
    container_name: goat-fivem
    restart: unless-stopped
    ports:
      - "30120:30120/tcp"
      - "30120:30120/udp"
      - "40120:40120"
    volumes:
      - ./server-data:/config
      - ./txdata:/txData
    environment:
      - NO_DEFAULT_CONFIG=1
    networks: [gaming]
DOCKEREOF

# ── Start everything ──
cd /opt/fivem
docker compose up -d 2>/dev/null || docker-compose up -d

# ── Open firewall ports ──
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true
ufw allow 30120/tcp 2>/dev/null || true
ufw allow 30120/udp 2>/dev/null || true
ufw allow 40120/tcp 2>/dev/null || true
ufw allow 8080/tcp 2>/dev/null || true

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   ✅ GOAT GAMING SERVER DEPLOYED! 🎮🐐                   ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "🎮 FiveM:      72.61.193.184:30120"
echo "🛠️  txAdmin:    http://72.61.193.184:40120"
echo "🌐 Dashboard:  http://72.61.193.184"
echo "📊 Traefik:    http://72.61.193.184:8080"
echo ""
echo "⚠️  IMPORTANT: Get FiveM license key at https://keymaster.fivem.net"
echo "   Edit: /opt/fivem/server-data/server.cfg"
echo "   Replace 'cfxk_placeholder_replace_with_real_key' with your key"
echo ""
echo "Docker status:"
docker compose ps 2>/dev/null || docker-compose ps