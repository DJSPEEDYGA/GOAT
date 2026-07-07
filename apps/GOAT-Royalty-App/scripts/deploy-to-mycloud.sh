#!/usr/bin/env bash
# GOAT Force — Deploy Oscar to WD MyCloud NAS
# Adapted for /Volumes/Public/GOAT-Server-Storage
#
# Usage:
#   bash deploy-to-mycloud.sh                         # local mount
#   bash deploy-to-mycloud.sh 192.168.1.50 Public admin  # SSH rsync
set -euo pipefail

REPO="/Users/be100radio/GOAT-Royalty-App"
HOST="${1:-}"
SHARE="${2:-Public}"
NAS_USER="${3:-admin}"

log()  { printf "[deploy-nas] %s\n" "$*"; }
ok()   { printf "[deploy-nas] ✅  %s\n" "$*"; }
warn() { printf "[deploy-nas] ⚠️   %s\n" "$*" >&2; }

# Sync core first
log "Syncing core before deploy..."
bash "$REPO/Scripts/sync-core.sh" 2>/dev/null || warn "sync-core had warnings — continuing"

if [[ -z "$HOST" ]]; then
  # Local mount path
  NAS_LOCAL="/Volumes/Public/GOAT-Server-Storage"
  if [ -d "$NAS_LOCAL" ]; then
    log "Deploying to local NAS mount: $NAS_LOCAL"
    rsync -av --delete \
      --exclude '__pycache__' --exclude '*.pyc' --exclude '.DS_Store' \
      "$REPO/web-app"/ "$NAS_LOCAL/web-app"/
    rsync -av --delete \
      --exclude '__pycache__' --exclude '*.pyc' --exclude '.DS_Store' \
      "$REPO/web-app/usb-ai/Shared"/ "$NAS_LOCAL/oscar-core"/
    ok "Deployed to NAS at $NAS_LOCAL"
  else
    warn "NAS not mounted at $NAS_LOCAL"
    log "Mount it first: open 'smb://[NAS-IP]/Public' in Finder"
    log "Or run: bash deploy-to-mycloud.sh <NAS-IP>"
    exit 1
  fi
else
  # SSH rsync to remote NAS
  REMOTE="${NAS_USER}@${HOST}:/shares/${SHARE}/GOAT-Server-Storage/"
  log "Deploying Oscar → WD MyCloud at $REMOTE"
  rsync -avz --delete \
    --exclude '__pycache__' --exclude '*.pyc' --exclude '.DS_Store' \
    "$REPO"/ "$REMOTE"
  ok "Deployed to $REMOTE"
  log "On any machine: mount the share, run: open http://[NAS-IP]:8090"
fi
