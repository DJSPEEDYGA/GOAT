#!/bin/bash
# ============================================================
#  Ms. Money Penny — server setup
#  Run ON the production server (srv1148455 / 72.61.193.184) as root.
#
#  What it does:
#   1. Starts her brain (goat-intel, Flask :5500) and the
#      GOAT Royalty web app (:3000)
#   2. Patches moneypenny.html so it talks to the brain through
#      the website (works from any device, not just the server)
#   3. Updates nginx so /ai/ reaches the brain
#   4. Syncs the "Moneypenny Shared" Google Drive folder to
#      /opt/goat/moneypenny-drive and re-syncs it nightly
# ============================================================
set -u
BRANCH="devin/1782948937-merge-all-repos"
RAW="https://raw.githubusercontent.com/DJSPEEDYGA/GOAT/$BRANCH"
DRIVE_FOLDER_ID="17RV_P-8vWxnX6cmkJI_WF4He2kbiUaVf"
DRIVE_DIR="/opt/goat/moneypenny-drive"
APP_DIR="/raid0/app"

step() { printf "\n\033[1;33m==> %s\033[0m\n" "$1"; }
fail() { printf "\n\033[1;31mXX  %s\033[0m\n" "$1"; exit 1; }
[ "$(id -u)" = "0" ] || fail "Run me as root."

step "1/5 Starting Ms. Money Penny's brain (goat-intel) and the web app"
systemctl daemon-reload
systemctl enable --now goat-intel   || fail "goat-intel failed (systemctl status goat-intel)"
systemctl enable --now goat-royalty || fail "goat-royalty failed (systemctl status goat-royalty)"

step "2/5 Getting the latest Money Penny page"
curl -fsSL "$RAW/GOAT-Royalty-App/web-app/moneypenny.html" -o "$APP_DIR/moneypenny.html" \
  || echo "(could not update moneypenny.html — keeping the existing one)"

step "3/5 Wiring nginx so the page can reach her brain (/ai/)"
curl -fsSL "$RAW/deploy/goatroyaltyapp.org.conf" -o /etc/nginx/sites-available/app.goatroyaltyapp.org \
  || fail "Could not download nginx config"
ln -sf /etc/nginx/sites-available/app.goatroyaltyapp.org /etc/nginx/sites-enabled/app.goatroyaltyapp.org
rm -f /etc/nginx/sites-enabled/goatroyaltyapp.org 2>/dev/null
nginx -t || fail "nginx config test failed"
systemctl reload nginx

step "4/5 Syncing the Moneypenny Shared Drive folder (this can take a while)"
command -v pip3 >/dev/null 2>&1 || apt-get install -y -qq python3-pip
pip3 install -q --break-system-packages gdown 2>/dev/null || pip3 install -q gdown
mkdir -p "$DRIVE_DIR"
gdown --folder "https://drive.google.com/drive/folders/$DRIVE_FOLDER_ID" \
      -O "$DRIVE_DIR" --remaining-ok --continue \
  || echo "(some files may have been skipped — Google limits bulk downloads; re-run me to grab more)"
ln -sfn "$DRIVE_DIR" /opt/goat/intel/moneypenny-drive

step "5/5 Scheduling nightly re-sync"
cat > /etc/cron.d/moneypenny-drive-sync <<CRON
0 4 * * * root gdown --folder "https://drive.google.com/drive/folders/$DRIVE_FOLDER_ID" -O "$DRIVE_DIR" --remaining-ok --continue >> /var/log/moneypenny-drive-sync.log 2>&1
CRON

echo
curl -s -o /dev/null -w "Brain  (:5500) responded: %{http_code}\n" http://127.0.0.1:5500/ || true
curl -s -o /dev/null -w "WebApp (:3000) responded: %{http_code}\n" http://127.0.0.1:3000/moneypenny.html || true
echo "Done. Ms. Money Penny: https://app.goatroyaltyapp.org/moneypenny.html"
echo "Drive files land in: $DRIVE_DIR"
