#!/usr/bin/env bash
# GOAT Force — Sync core Oscar engine to all drives
# Syncs web-app/usb-ai/Shared → i2i 1, backup, NAS
set -euo pipefail

REPO="/Users/be100radio/GOAT-Royalty-App"
SRC="$REPO/web-app/usb-ai/Shared"
WEB="$REPO/web-app"

log() { printf "[sync-core] %s\n" "$*"; }
ok()  { printf "[sync-core] ✅  %s\n" "$*"; }
warn(){ printf "[sync-core] ⚠️   %s\n" "$*" >&2; }

if [ ! -d "$SRC" ]; then
  echo "❌ Source not found: $SRC" >&2; exit 1
fi

copy_tree() {
  local src="$1" dst="$2" label="$3"
  mkdir -p "$dst"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete \
      --exclude '__pycache__' --exclude '*.pyc' --exclude '.DS_Store' \
      "$src"/ "$dst"/
  else
    cp -R "$src"/. "$dst"/
    find "$dst" -name '__pycache__' -type d -prune -exec rm -rf {} + 2>/dev/null || true
    find "$dst" -name '*.pyc' -delete 2>/dev/null || true
  fi
  ok "$label synced"
}

log "Syncing GOAT Force core from: $SRC"

# 1. i2i 1 Ms.Money-Penny
if [ -d "/Volumes/i2i 1/Ms.Money-Penny/Shared" ]; then
  copy_tree "$SRC" "/Volumes/i2i 1/Ms.Money-Penny/Shared" "i2i 1 Money Penny"
  copy_tree "$WEB" "/Volumes/i2i 1/Ms.Money-Penny/web-app" "i2i 1 web-app"
else
  warn "i2i 1 Ms.Money-Penny not found — skipping"
fi

# 2. i2i 1 Agent-007-GOAT
if [ -d "/Volumes/i2i 1/Agent-007-GOAT/Shared" ]; then
  copy_tree "$SRC" "/Volumes/i2i 1/Agent-007-GOAT/Shared/oscar-core" "i2i 1 Agent-007-GOAT"
else
  warn "i2i 1 Agent-007-GOAT Shared not found — skipping"
fi

# 3. Backup volume
BACKUP_LEXI="/Volumes/backup/LEXICON AKA LEXI/GOAT-Royalty-App/web-app"
if [ -d "/Volumes/backup/LEXICON AKA LEXI" ]; then
  copy_tree "$WEB" "$BACKUP_LEXI" "Waka's backup web-app"
else
  warn "Backup volume not found — skipping"
fi

# 4. NAS (if mounted)
NAS="/Volumes/Public/GOAT-Server-Storage"
if [ -d "$NAS" ]; then
  copy_tree "$SRC" "$NAS/oscar-core" "NAS oscar-core"
  copy_tree "$WEB" "$NAS/web-app"   "NAS web-app"
else
  warn "NAS not mounted at $NAS — skipping"
fi

log ""
ok "Sync complete. Files in $SRC:"
ls -1 "$SRC" | sed 's/^/   /'
