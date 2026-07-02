#!/bin/bash
# ============================================================
#  Deploy Oscar to this server — the correct way.
#  Run ON the server (as root), e.g. via the Hostinger
#  browser terminal:
#
#    curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT/devin/consolidate-master/deploy/deploy-oscar.sh | bash
#
#  What it does:
#   1. Pulls the latest Oscar from GitHub (DJSPEEDYGA/GOAT)
#   2. Backs up the current /opt/goat/oscar (timestamped)
#   3. Deploys the new code
#   4. Restarts goat-oscar and health-checks :3333
#   5. Rolls back automatically if Oscar doesn't come back healthy
# ============================================================
set -u

REPO_URL="https://github.com/DJSPEEDYGA/GOAT.git"
BRANCH="devin/consolidate-master"
LIVE_DIR="/opt/goat/oscar"
PORT=3333
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/opt/goat/backups/oscar-$STAMP"
WORK=$(mktemp -d)

log()  { echo "==> $1"; }
fail() { echo "XX  $1" >&2; exit 1; }

HOSTN=$(hostname)
case "$HOSTN" in
  *1148455*) SRC_SUBDIR="live-server/srv1148455/code/oscar" ;;
  *1782156*) SRC_SUBDIR="live-server/srv1782156/code/oscar" ;;
  *)         SRC_SUBDIR="live-server/srv1148455/code/oscar" ;;
esac

log "Deploying Oscar on $HOSTN from $REPO_URL ($BRANCH), source: $SRC_SUBDIR"

# 1. Pull latest
log "Fetching latest code from GitHub..."
git clone --depth 1 --branch "$BRANCH" --single-branch "$REPO_URL" "$WORK/GOAT" || fail "git clone failed"
SRC="$WORK/GOAT/$SRC_SUBDIR"
[ -f "$SRC/chat_server.py" ] || fail "chat_server.py not found in repo at $SRC_SUBDIR"

# 2. Backup current live code
log "Backing up $LIVE_DIR -> $BACKUP_DIR"
mkdir -p /opt/goat/backups
cp -a "$LIVE_DIR" "$BACKUP_DIR" || fail "backup failed — aborting (nothing changed)"

# 3. Deploy (code files only; keep runtime data/logs already in place)
log "Deploying new code..."
cp -a "$SRC/." "$LIVE_DIR/" || { echo "copy failed — restoring backup"; rm -rf "$LIVE_DIR"; cp -a "$BACKUP_DIR" "$LIVE_DIR"; fail "deploy copy failed, backup restored"; }

# 4. Restart + health check
log "Restarting goat-oscar..."
systemctl restart goat-oscar
HEALTHY=""
for i in $(seq 1 15); do
  sleep 2
  if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT/" | grep -q "200"; then HEALTHY=1; break; fi
done

if [ -n "$HEALTHY" ]; then
  log "Oscar is healthy on :$PORT ✓"
  # quick chat sanity check through the ollama proxy (non-fatal)
  curl -s --max-time 60 -X POST "http://127.0.0.1:$PORT/ollama/api/chat" \
    -H 'Content-Type: application/json' \
    -d '{"model":"","messages":[{"role":"user","content":"hello"}],"stream":false}' >/dev/null 2>&1 || true
  log "DEPLOY OK — backup kept at $BACKUP_DIR"
else
  echo "Oscar did NOT come back healthy — rolling back..."
  rm -rf "$LIVE_DIR"
  cp -a "$BACKUP_DIR" "$LIVE_DIR"
  systemctl restart goat-oscar
  sleep 4
  curl -s -o /dev/null -w "after rollback, :$PORT returned %{http_code}\n" "http://127.0.0.1:$PORT/" || true
  fail "DEPLOY FAILED — rolled back to $BACKUP_DIR"
fi

rm -rf "$WORK"

# 5. Status summary
systemctl --no-pager -l status goat-oscar | head -5
for svc in goat-royalty goat-intel halito-chat nginx; do
  printf "%-14s %s\n" "$svc" "$(systemctl is-active $svc 2>/dev/null)"
done
