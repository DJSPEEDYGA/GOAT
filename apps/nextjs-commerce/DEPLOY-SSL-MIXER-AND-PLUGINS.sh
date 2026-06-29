#!/bin/bash
###########################################################################
# 🐐🎚️ GOAT FORCE — SSL MIXER + BEAT MAKER + PLUGIN SUITE DEPLOY
#
# Deploys the latest web pages (SSL mixer, beat maker, updated homepage)
# to the production web root. Safe to re-run.
#
# USAGE (SSH into your server first):
#   ssh root@72.61.193.184
#   curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/DEPLOY-SSL-MIXER-AND-PLUGINS.sh | bash
# OR
#   cd /tmp && git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git
#   bash /tmp/GOAT-Royalty-App/DEPLOY-SSL-MIXER-AND-PLUGINS.sh
###########################################################################
set -e

G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; B='\033[1;34m'; N='\033[0m'
log()  { echo -e "${G}[✓]${N} $1"; }
info() { echo -e "${Y}[→]${N} $1"; }
err()  { echo -e "${R}[✗]${N} $1"; }

cat <<'BANNER'
╔══════════════════════════════════════════════════════════════╗
║  🐐 GOAT FORCE — SSL MIXER + BEAT MAKER + PLUGIN SUITE       ║
║  Deploying production web pages                              ║
╚══════════════════════════════════════════════════════════════╝
BANNER

WEB_ROOT="${WEB_ROOT:-/var/www/goat-royalty-app}"

# ---- 1) Ensure web root exists ----
if [ ! -d "$WEB_ROOT" ]; then
    info "Creating $WEB_ROOT"
    sudo mkdir -p "$WEB_ROOT"
fi

# ---- 2) Pull latest ----
info "Pulling latest GOAT-Royalty-App from GitHub..."
cd /tmp
rm -rf goat-latest
git clone --depth 1 https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git goat-latest
cd goat-latest
log "Latest commit: $(git log -1 --oneline)"

# ---- 3) Deploy the new pages specifically ----
info "Deploying SSL Mixer + Beat Maker + updated homepage..."
for FILE in ssl-mixer.html beat-maker.html index.html; do
    if [ -f "web-app/$FILE" ]; then
        sudo cp "web-app/$FILE" "$WEB_ROOT/$FILE"
        log "Deployed: $FILE ($(du -h web-app/$FILE | cut -f1))"
    else
        err "Missing: web-app/$FILE"
    fi
done

# ---- 4) Deploy ALL web-app files (overwrite/add) ----
info "Syncing all web-app files..."
sudo rsync -a --exclude='.git' web-app/ "$WEB_ROOT/"
log "Web root synced"

# ---- 5) Permissions ----
info "Setting permissions..."
sudo chown -R www-data:www-data "$WEB_ROOT" 2>/dev/null || sudo chown -R nginx:nginx "$WEB_ROOT" 2>/dev/null || true
sudo chmod -R 755 "$WEB_ROOT"

# ---- 6) Reload nginx if present ----
if command -v nginx &>/dev/null; then
    sudo nginx -t && sudo systemctl reload nginx && log "nginx reloaded"
fi

# ---- 7) Verify ----
PORT=$(ss -tln 2>/dev/null | grep -E ':(80|8080)\s' | awk '{print $4}' | awk -F: '{print $NF}' | head -1)
PORT=${PORT:-8080}
if curl -fsSL "http://localhost:$PORT/ssl-mixer.html" >/dev/null 2>&1; then
    log "SSL Mixer is live at http://localhost:$PORT/ssl-mixer.html"
else
    info "Manual check: curl http://localhost:$PORT/ssl-mixer.html"
fi

cat <<DONE

${G}╔══════════════════════════════════════════════════════════════╗
║  ✅ DEPLOYMENT COMPLETE                                      ║
╠══════════════════════════════════════════════════════════════╣
║  🎚️  SSL 148-Ch Mixer:  /ssl-mixer.html                      ║
║  🥁  Beat Maker:         /beat-maker.html                     ║
║  🏠  Homepage (updated): /                                    ║
║                                                              ║
║  AAX Plugin Suite is in: $WEB_ROOT/../goat-plugins            ║
║  (use goat-plugins/Scripts/build-all.sh on your Mac)         ║
╚══════════════════════════════════════════════════════════════╝${N}

🐐 GOAT Force ecosystem online. Share the links.
DONE