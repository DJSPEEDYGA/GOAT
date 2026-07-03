#!/bin/bash
###############################################################################
# 🐐 GOAT FORCE — PHASE A-H DEPLOYMENT
# Deploys: SSL Mixer w/ AutoMix AI, Studio DAW, Plugin Shop w/ Stripe cart,
#          9-plugin suite, FL Studio docs, Beat Maker w/ SSL routing
#
# USAGE (run directly on Server 1 OR Server 2 as root):
#   curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/DEPLOY-PHASE-AB-TO-H.sh | bash
#
# Or locally:
#   bash DEPLOY-PHASE-AB-TO-H.sh
###############################################################################

set -e

# ---- Colors ----
G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; B='\033[1;34m'; N='\033[0m'
log()  { echo -e "${G}[✓]${N} $1"; }
info() { echo -e "${Y}[→]${N} $1"; }
err()  { echo -e "${R}[✗]${N} $1" >&2; }

# ---- Config ----
REPO="https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git"
BRANCH="${BRANCH:-main}"
WEB_ROOT="${WEB_ROOT:-/var/www/goat-royalty-app}"
TMPDIR="/tmp/goat-deploy-$$"

cat <<'BANNER'
╔══════════════════════════════════════════════════════════════════╗
║  🐐 GOAT FORCE — FULL STACK DEPLOYMENT                           ║
║  Phases A–H: SSL Mixer + Studio DAW + Plugins + Stripe + Docs   ║
║  DJ Speedy / Harvey L. Miller Jr. / BrickSquad / Waka Flocka    ║
╚══════════════════════════════════════════════════════════════════╝
BANNER

# ---- Pre-flight ----
info "Pre-flight checks..."
for tool in git rsync; do
  command -v $tool >/dev/null 2>&1 || { err "$tool not installed"; exit 1; }
done
log "Tools OK"

# ---- Clone ----
info "Cloning ${REPO} (branch: ${BRANCH})..."
rm -rf "$TMPDIR"
git clone --depth 1 --branch "$BRANCH" "$REPO" "$TMPDIR" 2>&1 | tail -3
log "Repo cloned to $TMPDIR"

# ---- Verify key files exist ----
info "Verifying build artifacts..."
for f in web-app/ssl-mixer.html web-app/studio.html web-app/plugins.html \
         web-app/beat-maker.html web-app/index.html web-app/js/goat-audio-engine.js; do
  if [ ! -f "$TMPDIR/$f" ]; then err "Missing: $f"; exit 1; fi
  SZ=$(stat -c%s "$TMPDIR/$f" 2>/dev/null || stat -f%z "$TMPDIR/$f")
  log "  ✓ $f ($SZ bytes)"
done

# ---- Create web root ----
info "Preparing web root: $WEB_ROOT"
mkdir -p "$WEB_ROOT"

# ---- Backup existing ----
if [ -d "$WEB_ROOT" ] && [ "$(ls -A $WEB_ROOT 2>/dev/null)" ]; then
  BK="$WEB_ROOT-backup-$(date +%Y%m%d-%H%M%S)"
  info "Backing up existing to $BK"
  cp -r "$WEB_ROOT" "$BK" || true
fi

# ---- Deploy web-app ----
info "Deploying web-app → $WEB_ROOT"
rsync -a --delete-after "$TMPDIR/web-app/" "$WEB_ROOT/"
log "Web-app deployed"

# ---- Deploy goat-plugins docs ----
info "Deploying plugin docs..."
mkdir -p "$WEB_ROOT/plugin-docs"
cp -r "$TMPDIR/goat-plugins/docs/"* "$WEB_ROOT/plugin-docs/" 2>/dev/null || true
cp "$TMPDIR/goat-plugins/README.md" "$WEB_ROOT/plugin-docs/README.md" 2>/dev/null || true
log "Plugin docs at /plugin-docs/"

# ---- Permissions ----
info "Setting permissions..."
chown -R www-data:www-data "$WEB_ROOT" 2>/dev/null || chown -R nginx:nginx "$WEB_ROOT" 2>/dev/null || true
find "$WEB_ROOT" -type d -exec chmod 755 {} \;
find "$WEB_ROOT" -type f -exec chmod 644 {} \;
log "Permissions set"

# ---- Reload web server ----
info "Reloading web server..."
if systemctl is-active --quiet nginx; then
  systemctl reload nginx && log "Nginx reloaded"
elif systemctl is-active --quiet apache2; then
  systemctl reload apache2 && log "Apache2 reloaded"
else
  info "No system web server running — if using pm2/node, restart it manually"
fi

# ---- Verify ----
info "Verifying deployment..."
HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || curl -s ifconfig.me)
PORT="${PORT:-80}"

# Try common ports if 80 fails
for P in 80 8080 3000; do
  if curl -sf "http://localhost:$P/" -o /dev/null 2>/dev/null; then
    PORT="$P"; break
  fi
done

echo ""
echo -e "${G}╔══════════════════════════════════════════════════════════════════╗${N}"
echo -e "${G}║  ✅ DEPLOYMENT COMPLETE                                            ║${N}"
echo -e "${G}╠══════════════════════════════════════════════════════════════════╣${N}"
echo -e "${G}║  Server:       ${HOST_IP}:${PORT}$(printf '%*s' $((50 - ${#HOST_IP} - ${#PORT})) '')║${N}"
echo -e "${G}║  Web root:     ${WEB_ROOT}$(printf '%*s' $((50 - ${#WEB_ROOT})) '')║${N}"
echo -e "${G}╚══════════════════════════════════════════════════════════════════╝${N}"
echo ""
echo -e "${Y}🔗 NEW PAGES LIVE:${N}"
echo -e "   http://${HOST_IP}:${PORT}/                  Home (updated nav)"
echo -e "   http://${HOST_IP}:${PORT}/ssl-mixer.html    🎚️  SSL 148-Ch Mixer + AutoMix AI"
echo -e "   http://${HOST_IP}:${PORT}/studio.html       🎛️  Multi-Track Studio DAW"
echo -e "   http://${HOST_IP}:${PORT}/plugins.html      🔌 Plugin Shop + Stripe Cart"
echo -e "   http://${HOST_IP}:${PORT}/beat-maker.html   🥁 Beat Maker (SSL routable)"
echo ""
echo -e "${Y}📖 DOCS:${N}"
echo -e "   http://${HOST_IP}:${PORT}/plugin-docs/FL-STUDIO-GUIDE.md"
echo -e "   http://${HOST_IP}:${PORT}/plugin-docs/DAW-COMPATIBILITY.md"
echo ""
echo -e "${G}🐐 GOAT FORCE — READY.${N}"

# ---- Cleanup ----
rm -rf "$TMPDIR"