#!/usr/bin/env bash
# Copy the latest Oscar engine code from the repo into the master folder's
# core/ dir, so the master folder is self-contained on WD MyCloud.
# Run from inside oscar-master/  (or anywhere — paths are resolved).
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"       # oscar-master/
REPO="$(cd "$HERE/.." && pwd)"                                 # repo root
SRC="$REPO/web-app/usb-ai/Shared"
DST="$HERE/core"

if [ ! -d "$SRC" ]; then
  echo "❌ Source not found: $SRC" >&2
  exit 1
fi

mkdir -p "$DST"
echo "📦 Syncing Oscar core from:"
echo "   $SRC"
echo "   → $DST"

# Copy helper: rsync when available, else cp fallback (still skips caches).
copy_tree() {
  local src="$1" dst="$2"
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
}

# Copy engine + modules + web UIs.
copy_tree "$SRC" "$DST"

# Also bring the GOAT web app (UI pages) so MyCloud has the full stack.
copy_tree "$REPO/web-app" "$HERE/web-app"

echo "✅ Core synced. Files in core/:"
ls -1 "$DST" | sed 's/^/   /'
