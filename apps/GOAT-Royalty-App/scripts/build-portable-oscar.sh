#!/usr/bin/env bash
# ============================================================
# Cross-Platform Portable Builder — Oscar Edition
# Creates a self-extracting .run archive (makeself) that works
# on macOS and Linux without any installation.
#
# Prerequisites:
#   macOS:  brew install makeself
#   Linux:  apt/dnf install makeself  OR  download from
#           https://makeself.io
#
# Usage:
#   ./build-portable-oscar.sh
#   Then distribute:  claude-code-oscar-installer.run
#   Users run:        bash claude-code-oscar-installer.run [stable|latest|VERSION]
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OSCAR_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$OSCAR_ROOT/dist/portable"
PAYLOAD_DIR="$DIST_DIR/payload"
RUN_OUT="$DIST_DIR/claude-code-oscar-installer.run"

log() { printf "[build-portable] %s\n" "$*"; }
die() { printf "[build-portable] ERROR: %s\n" "$*" >&2; exit 1; }

command -v makeself >/dev/null 2>&1 \
  || die "makeself not found. Install: brew install makeself  OR  https://makeself.io"

[[ -f "$OSCAR_ROOT/Scripts/install-claude-oscar.sh" ]] \
  || die "install-claude-oscar.sh not found in Scripts/"

log "Building portable installer for Oscar..."
log "Oscar root: $OSCAR_ROOT"

rm -rf "$DIST_DIR"
mkdir -p "$PAYLOAD_DIR"

# Copy installer into payload
cp "$OSCAR_ROOT/Scripts/install-claude-oscar.sh" "$PAYLOAD_DIR/install-claude-oscar.sh"
chmod +x "$PAYLOAD_DIR/install-claude-oscar.sh"

# README inside the payload
cat > "$PAYLOAD_DIR/README.txt" <<'README'
Claude Code Installer — Oscar Edition (Portable)
=================================================
Run:   bash claude-code-oscar-installer.run
  or:  bash claude-code-oscar-installer.run latest
  or:  bash claude-code-oscar-installer.run 1.2.3

Env overrides:
  CLAUDE_VERSION   Force a specific version
  OSCAR_ROOT       Override Oscar root (default: /Volumes/Oscar/Master-Oscar)
  CLAUDE_RETRIES   Retry count (default: 3)
README

# Build the self-extracting archive
log "Creating self-extracting archive..."
makeself \
  --sha256 \
  "$PAYLOAD_DIR" \
  "$RUN_OUT" \
  "Claude Code Installer for Oscar" \
  ./install-claude-oscar.sh

CHECKSUM=$(shasum -a 256 "$RUN_OUT" | cut -d' ' -f1)
printf "%s  claude-code-oscar-installer.run\n" "$CHECKSUM" > "$DIST_DIR/SHA256SUMS.txt"

log ""
log "✅  Done!"
log "    Portable: $RUN_OUT"
log "    SHA-256:  $CHECKSUM"
log "    Checksums: $DIST_DIR/SHA256SUMS.txt"
log ""
log "Distribute claude-code-oscar-installer.run"
log "Users run: bash claude-code-oscar-installer.run"
