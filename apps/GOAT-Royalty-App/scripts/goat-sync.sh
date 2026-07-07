#!/usr/bin/env bash
# ============================================================
# GOAT Force — Sync Core
# Enhanced sync-core.sh + NAS + WD MyCloud deploy
#
# Syncs the GOAT Royalty App web-app, scripts, and assets:
#   - Local dev machine → i2i 1 USB drive
#   - i2i 1 USB drive → WD MyCloud EX4100 NAS
#   - i2i 1 USB drive → NAS backup share
#
# Usage:
#   ./goat-sync.sh [--local-only] [--nas-only] [--full] [--status]
#
# Env overrides:
#   GOAT_APP_ROOT    Local GOAT Royalty App root
#   OSCAR_ROOT       i2i 1 drive root
#   NAS_HOST         WD MyCloud IP (default: auto-discover)
#   NAS_USER         NAS SSH user (default: admin)
# ============================================================

set -euo pipefail

# ── Paths ─────────────────────────────────────────────────────
GOAT_APP_ROOT="${GOAT_APP_ROOT:-/Users/be100radio/GOAT-Royalty-App}"
OSCAR_ROOT="${OSCAR_ROOT:-/Volumes/i2i 1/Agent-007-GOAT}"
NAS_SHARE="${NAS_SHARE:-/Volumes/Public/GOAT-Server-Storage}"
NAS_HOST="${NAS_HOST:-}"
NAS_USER="${NAS_USER:-admin}"
LOG_DIR="$OSCAR_ROOT/logs"
LOG="$LOG_DIR/goat-sync-$(date +%Y%m%d-%H%M%S).log"

# ── Flags ─────────────────────────────────────────────────────
LOCAL_ONLY=false
NAS_ONLY=false
FULL_SYNC=false
SHOW_STATUS=false

for arg in "$@"; do
  case "$arg" in
    --local-only) LOCAL_ONLY=true ;;
    --nas-only)   NAS_ONLY=true ;;
    --full)       FULL_SYNC=true ;;
    --status)     SHOW_STATUS=true ;;
    --help|-h)
      cat <<'EOF'
Usage: goat-sync.sh [--local-only] [--nas-only] [--full] [--status]

  (no flags)      Sync local → i2i 1 drive
  --local-only    Sync local → i2i 1 drive only
  --nas-only      Sync i2i 1 → NAS only (skip local step)
  --full          Full sync: local → i2i 1 → NAS → backup
  --status        Check sync status and mounts, then exit

Env overrides:
  GOAT_APP_ROOT   Local GOAT Royalty App root
  OSCAR_ROOT      i2i 1 drive root
  NAS_SHARE       NAS mount path (default: /Volumes/Public/GOAT-Server-Storage)
  NAS_HOST        NAS IP for rsync over SSH (optional, for --full)
  NAS_USER        NAS SSH user (default: admin)
EOF
      exit 0 ;;
  esac
done

log()  { printf "[goat-sync] %s\n" "$*" | tee -a "$LOG"; }
ok()   { printf "[goat-sync] ✅  %s\n" "$*" | tee -a "$LOG"; }
warn() { printf "[goat-sync] ⚠️   %s\n" "$*" | tee -a "$LOG"; }
die()  { printf "[goat-sync] ERROR: %s\n" "$*" | tee -a "$LOG" >&2; exit 1; }

mkdir -p "$LOG_DIR"

log "=== GOAT Force Sync — $(date) ==="
log "App root  : $GOAT_APP_ROOT"
log "i2i 1     : $OSCAR_ROOT"
log "NAS share : $NAS_SHARE"
log ""

# ── Status mode ───────────────────────────────────────────────
if [[ "$SHOW_STATUS" == true ]]; then
  log "=== Mount status ==="
  mount | grep -E "i2i|Public|GOAT" | tee -a "$LOG" || log "(no GOAT mounts detected)"
  log ""
  log "=== Disk usage ==="
  df -h "$GOAT_APP_ROOT" 2>/dev/null | tee -a "$LOG" || true
  df -h "/Volumes/i2i 1" 2>/dev/null | tee -a "$LOG" || true
  [[ -d "$NAS_SHARE" ]] && df -h "$NAS_SHARE" | tee -a "$LOG" || warn "NAS share not mounted: $NAS_SHARE"
  log ""
  log "=== Recent sync logs ==="
  ls -lt "$LOG_DIR"/goat-sync-*.log 2>/dev/null | head -5 | tee -a "$LOG" || log "(no previous sync logs)"
  exit 0
fi

# ── Check i2i 1 drive ─────────────────────────────────────────
if [[ ! -d "$OSCAR_ROOT" ]]; then
  warn "i2i 1 drive not mounted at $OSCAR_ROOT"
  warn "Plug in the i2i 1 USB drive and try again."
  die "i2i 1 drive required for sync"
fi

# ── Rsync excludes ────────────────────────────────────────────
EXCLUDES=(
  --exclude='.DS_Store'
  --exclude='__pycache__'
  --exclude='*.pyc'
  --exclude='.git'
  --exclude='node_modules'
  --exclude='*.tmp'
  --exclude='.env'
  --exclude='.env.local'
  --exclude='dist/'
  --exclude='.next/'
)

# ── Local → i2i 1 sync ───────────────────────────────────────
sync_local_to_drive() {
  local SRC="$GOAT_APP_ROOT/"
  local DST="$OSCAR_ROOT/GOAT-Royalty-App/"
  mkdir -p "$DST"
  log "Syncing: $SRC → $DST"
  rsync -avz --delete "${EXCLUDES[@]}" "$SRC" "$DST" 2>&1 | tee -a "$LOG"
  ok "Local → i2i 1 sync complete"
}

# ── i2i 1 → NAS (mounted share) ──────────────────────────────
sync_drive_to_nas_mount() {
  if [[ ! -d "$NAS_SHARE" ]]; then
    warn "NAS share not mounted at $NAS_SHARE — skipping NAS sync"
    warn "Mount: smb://djspeedy@<NAS-IP>/Public or check WD MyCloud"
    return 0
  fi
  local SRC="$OSCAR_ROOT/GOAT-Royalty-App/"
  local DST="$NAS_SHARE/GOAT-Royalty-App/"
  mkdir -p "$DST"
  log "Syncing: $SRC → NAS:$DST"
  rsync -avz --delete "${EXCLUDES[@]}" "$SRC" "$DST" 2>&1 | tee -a "$LOG"
  ok "i2i 1 → NAS sync complete"
}

# ── i2i 1 → NAS (SSH/rsync — if NAS_HOST set) ────────────────
sync_drive_to_nas_ssh() {
  [[ -z "$NAS_HOST" ]] && { warn "NAS_HOST not set — skipping SSH sync"; return 0; }
  local SRC="$OSCAR_ROOT/GOAT-Royalty-App/"
  local REMOTE="${NAS_USER}@${NAS_HOST}:/shares/Public/GOAT-Server-Storage/GOAT-Royalty-App/"
  log "Syncing via SSH: $SRC → $REMOTE"
  rsync -avz --delete "${EXCLUDES[@]}" "$SRC" "$REMOTE" 2>&1 | tee -a "$LOG" \
    && ok "i2i 1 → NAS SSH sync complete" \
    || warn "SSH sync failed — check NAS SSH settings (Settings → Network → SSH on WD MyCloud)"
}

# ── Backup snapshot ───────────────────────────────────────────
create_backup_snapshot() {
  local BACKUP_ROOT="$OSCAR_ROOT/backups/goat-royalty-app"
  local SNAPSHOT="$BACKUP_ROOT/snapshot-$(date +%Y%m%d-%H%M%S)"
  local LATEST="$BACKUP_ROOT/latest"
  mkdir -p "$BACKUP_ROOT"
  log "Creating backup snapshot: $SNAPSHOT"
  # Use --link-dest for incremental backup (hardlinks, saves space)
  if [[ -L "$LATEST" && -d "$LATEST" ]]; then
    rsync -a --link-dest="$LATEST" "${EXCLUDES[@]}" "$GOAT_APP_ROOT/" "$SNAPSHOT/" 2>&1 | tee -a "$LOG"
  else
    rsync -a "${EXCLUDES[@]}" "$GOAT_APP_ROOT/" "$SNAPSHOT/" 2>&1 | tee -a "$LOG"
  fi
  ln -sfn "$SNAPSHOT" "$LATEST"
  ok "Backup snapshot: $SNAPSHOT"
  # Keep last 7 snapshots
  ls -dt "$BACKUP_ROOT"/snapshot-* 2>/dev/null | tail -n +8 | while read -r old; do
    log "Removing old snapshot: $old"
    rm -rf "$old"
  done
}

# ── Execute based on flags ────────────────────────────────────
if [[ "$NAS_ONLY" == true ]]; then
  log "=== NAS-only sync ==="
  sync_drive_to_nas_mount
  sync_drive_to_nas_ssh
elif [[ "$FULL_SYNC" == true ]]; then
  log "=== Full sync: local → i2i 1 → NAS → backup ==="
  sync_local_to_drive
  sync_drive_to_nas_mount
  sync_drive_to_nas_ssh
  create_backup_snapshot
else
  log "=== Standard sync: local → i2i 1 ==="
  sync_local_to_drive
  create_backup_snapshot
fi

# ── Final report ──────────────────────────────────────────────
log ""
log "=== Disk usage after sync ==="
df -h "$GOAT_APP_ROOT" 2>/dev/null | tee -a "$LOG" || true
df -h "/Volumes/i2i 1" 2>/dev/null | tee -a "$LOG" || true
[[ -d "$NAS_SHARE" ]] && df -h "$NAS_SHARE" | tee -a "$LOG" || true
log ""
ok "Sync complete! Log: $LOG"

[[ "${TERM_PROGRAM:-}" == "" ]] && read -r -p "Press Enter to close..."
