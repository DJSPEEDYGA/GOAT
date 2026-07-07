#!/bin/bash
###########################################################################
# 🐐 GOAT FORCE — DEPLOY ALL NEW FEATURES
# Deploys: videos, unreal-copilot, agents, royalty-calc, dsp, shop + lore
# Target: Server 2 (72.61.193.184:8080) — redeploys the live ecosystem
###########################################################################

set -e

GREEN='\033[0;32m'; GOLD='\033[0;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${GOLD}[→]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }

cat <<'BANNER'
╔══════════════════════════════════════════════════════════════════╗
║  🐐 GOAT FORCE — DEPLOYING ALL NEW FEATURES                       ║
║  Videos · Unreal Copilot · 11 Agents · Royalty Calc · Shop · DSP ║
╚══════════════════════════════════════════════════════════════════╝
BANNER

# ---------------------------------------------------------------------------
# 1) Check deploy target
# ---------------------------------------------------------------------------
WEB_ROOT="${WEB_ROOT:-/var/www/goat-royalty-app}"

if [ ! -d "$WEB_ROOT" ]; then
  info "Web root $WEB_ROOT not found — creating it"
  sudo mkdir -p "$WEB_ROOT"
fi

# ---------------------------------------------------------------------------
# 2) Pull latest from GitHub
# ---------------------------------------------------------------------------
info "Pulling latest from GitHub..."
cd /tmp
rm -rf goat-latest
git clone --depth 1 https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git goat-latest
cd goat-latest
log "Latest code pulled"

# ---------------------------------------------------------------------------
# 3) Deploy web-app
# ---------------------------------------------------------------------------
info "Deploying web-app files to $WEB_ROOT..."
sudo cp -r web-app/* "$WEB_ROOT/"
log "17+ HTML pages deployed"

# ---------------------------------------------------------------------------
# 4) Deploy videos (if they exist)
# ---------------------------------------------------------------------------
if [ -d "public/videos/branding" ]; then
  info "Deploying 15 branding videos (249MB)..."
  sudo mkdir -p "$WEB_ROOT/public/videos/branding"
  sudo cp -r public/videos/branding/* "$WEB_ROOT/public/videos/branding/"
  log "Branding videos deployed"
else
  info "Branding videos not in repo — videos.html will use its fallback manifest"
fi

# ---------------------------------------------------------------------------
# 5) Deploy goat-royalty lore data
# ---------------------------------------------------------------------------
info "Deploying goat-royalty lore + catalog..."
sudo mkdir -p "$WEB_ROOT/goat-royalty"
sudo cp web-app/goat-royalty/*.json "$WEB_ROOT/goat-royalty/" 2>/dev/null || true
log "Lore + catalog deployed"

# ---------------------------------------------------------------------------
# 6) Set permissions
# ---------------------------------------------------------------------------
sudo chown -R www-data:www-data "$WEB_ROOT" 2>/dev/null || sudo chown -R $USER "$WEB_ROOT"
sudo chmod -R 755 "$WEB_ROOT"
log "Permissions set"

# ---------------------------------------------------------------------------
# 7) Restart nginx if installed
# ---------------------------------------------------------------------------
if command -v nginx >/dev/null 2>&1; then
  sudo nginx -t && sudo systemctl reload nginx && log "Nginx reloaded"
fi

# ---------------------------------------------------------------------------
# 8) Show what's live
# ---------------------------------------------------------------------------
echo ""
echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🐐 DEPLOY COMPLETE${NC}"
echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📄 Pages Deployed:"
ls "$WEB_ROOT"/*.html 2>/dev/null | xargs -n1 basename | awk '{print "   • " $1}'
echo ""
echo "🌐 New pages you can visit:"
echo "   • /               — Homepage (flying goat hero video)"
echo "   • /videos.html    — 15 branding videos cinematic gallery"
echo "   • /unreal-copilot.html — MetaHuman AI avatars"
echo "   • /agents.html    — 11 specialist AI agents"
echo "   • /royalty-calc.html — Live royalty calculator"
echo "   • /dsp.html       — DSP distribution dashboard"
echo "   • /shop.html      — GOAT Shop (BrickSquad merch)"
echo "   • /goat-royalty/  — Updated w/ GOAT Lore + 4 character voices"
echo ""
echo -e "${GREEN}🎯 The GOAT Universe is LIVE.${NC}"
echo ""

# Cleanup
rm -rf /tmp/goat-latest