#!/bin/bash
# GOAT Force — Nightly Mac → NAS Backup
# Runs via launchd every night at 2 AM
# Syncs: web-app, intel-server, models manifest, media

LOG="/Users/be100radio/GOAT-Royalty-App/logs/nas-backup.log"
NAS="/Volumes/Public/GOAT-Server-Storage"
APP="/Users/be100radio/GOAT-Royalty-App"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$(dirname "$LOG")"
echo "[$TIMESTAMP] ===== GOAT NAS BACKUP START =====" >> "$LOG"

# Check NAS is mounted
if [ ! -d "$NAS" ]; then
  echo "[$TIMESTAMP] ERROR: NAS not mounted — skipping" >> "$LOG"
  # Try to remount
  open "smb://SPEEDYSCLOUD.local/Public" 2>/dev/null
  exit 1
fi

# 1. Sync web-app
echo "[$TIMESTAMP] Syncing web-app..." >> "$LOG"
rsync -a --delete \
  --exclude='.DS_Store' --exclude='*.map' --exclude='.git' \
  "$APP/web-app/" "$NAS/goat-royalty-app/web-app/" >> "$LOG" 2>&1
echo "[$TIMESTAMP] web-app done (exit $?)" >> "$LOG"

# 2. Sync intel-server
echo "[$TIMESTAMP] Syncing intel-server..." >> "$LOG"
rsync -a --delete \
  --exclude='.DS_Store' --exclude='__pycache__' --exclude='*.pyc' --exclude='.git' \
  "$APP/goat-intel-server/" "$NAS/goat-royalty-app/goat-intel-server/" >> "$LOG" 2>&1
echo "[$TIMESTAMP] intel-server done (exit $?)" >> "$LOG"

# 3. Sync generated images + media
echo "[$TIMESTAMP] Syncing media..." >> "$LOG"
rsync -a \
  --exclude='.DS_Store' \
  "$APP/web-app/img/" "$NAS/media/web-img/" >> "$LOG" 2>&1
echo "[$TIMESTAMP] media done (exit $?)" >> "$LOG"

# 4. Write a manifest of all 56 ollama models (names only — not the multi-GB binaries)
echo "[$TIMESTAMP] Writing models manifest..." >> "$LOG"
MODELS_DIR="/Volumes/i2i 1/Agent-007-GOAT/Shared/models/ollama_data"
if [ -d "$MODELS_DIR" ]; then
  ls "$MODELS_DIR/manifests/registry.ollama.ai/library/" 2>/dev/null \
    > "$NAS/models/ollama-models-manifest.txt"
  # Count
  MODEL_COUNT=$(wc -l < "$NAS/models/ollama-models-manifest.txt" | tr -d ' ')
  echo "[$TIMESTAMP] Models manifest: $MODEL_COUNT entries" >> "$LOG"
fi

# 5. Backup logs
rsync -a "$APP/logs/" "$NAS/backups/logs/" >> "$LOG" 2>&1

echo "[$TIMESTAMP] ===== BACKUP COMPLETE =====" >> "$LOG"
echo "" >> "$LOG"
