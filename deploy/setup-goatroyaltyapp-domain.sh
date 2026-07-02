#!/bin/bash
# ============================================================
#  Set up www.goatroyaltyapp.org for the GOAT Royalty App
#  Run ON the server (72.61.193.184) as root, AFTER pointing
#  DNS A records for goatroyaltyapp.org and www.goatroyaltyapp.org
#  at this server's IP.
#
#  What it does:
#   1. Makes sure the GOAT Royalty App service is running (:3000)
#   2. Installs the nginx site for goatroyaltyapp.org
#   3. Gets a free HTTPS certificate (Let's Encrypt)
# ============================================================
set -u
DOMAIN="goatroyaltyapp.org"
CONF_URL="https://raw.githubusercontent.com/DJSPEEDYGA/GOAT/devin/1782948937-merge-all-repos/deploy/goatroyaltyapp.org.conf"

step() { printf "\n\033[1;33m==> %s\033[0m\n" "$1"; }
fail() { printf "\n\033[1;31mXX  %s\033[0m\n" "$1"; exit 1; }

[ "$(id -u)" = "0" ] || fail "Run me as root."

step "1/4 Starting the GOAT Royalty App service"
systemctl daemon-reload
systemctl enable --now goat-royalty || fail "goat-royalty.service failed to start (systemctl status goat-royalty)"

step "2/4 Installing nginx site for $DOMAIN"
curl -fsSL "$CONF_URL" -o /etc/nginx/sites-available/$DOMAIN || fail "Could not download nginx config"
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
nginx -t || fail "nginx config test failed"
systemctl reload nginx

step "3/4 Getting HTTPS certificate (Let's Encrypt)"
command -v certbot >/dev/null 2>&1 || { apt-get update -qq && apt-get install -y -qq certbot python3-certbot-nginx; }
certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email \
  -d "$DOMAIN" -d "www.$DOMAIN" --redirect \
  || printf "\n\033[1;31mHTTPS setup failed — usually means DNS isn't pointed here yet.\nPoint A records for %s and www.%s to this server, wait a few minutes, and re-run me.\nThe app still works over http://%s meanwhile.\033[0m\n" "$DOMAIN" "$DOMAIN" "$DOMAIN"

step "4/4 Checking"
curl -s -o /dev/null -w "Local app (:3000) responded: %{http_code}\n" http://127.0.0.1:3000/ || true
echo
echo "Done. The GOAT Royalty App is at: https://www.goatroyaltyapp.org"
