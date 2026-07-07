#!/usr/bin/env bash
# ============================================================
# macOS .dmg Builder — Oscar Edition
# Packages install-claude-oscar.sh into a distributable DMG
# with an optional .app launcher that opens Terminal.
#
# Prerequisites:
#   - macOS host
#   - Xcode Command Line Tools: xcode-select --install
#   - hdiutil (ships with macOS)
#   - Optional: codesign identity for signing
#
# Usage:
#   ./build-dmg-oscar.sh [--sign "Developer ID Application: You (TEAMID)"]
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OSCAR_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$OSCAR_ROOT/dist/dmg"
PAYLOAD_DIR="$DIST_DIR/payload"
APP_DIR="$PAYLOAD_DIR/Install Claude Code for Oscar.app"
DMG_OUT="$DIST_DIR/Claude-Code-Oscar-Installer.dmg"
INSTALLER_SCRIPT="$OSCAR_ROOT/Scripts/install-claude-oscar.sh"
SIGN_ID="${1:-}"
if [[ "${1:-}" == "--sign" ]]; then SIGN_ID="${2:-}"; fi

log()  { printf "[build-dmg] %s\n" "$*"; }
die()  { printf "[build-dmg] ERROR: %s\n" "$*" >&2; exit 1; }

[[ "$(uname -s)" == "Darwin" ]] || die "This script must run on macOS."
[[ -f "$INSTALLER_SCRIPT" ]] || die "Installer script not found: $INSTALLER_SCRIPT"
command -v hdiutil >/dev/null 2>&1 || die "hdiutil not found (needs macOS + Xcode CLI tools)."

log "Building macOS DMG installer for Oscar..."
log "Oscar root: $OSCAR_ROOT"

# ── Clean and recreate staging area ──────────────────────────
rm -rf "$DIST_DIR"
mkdir -p "$PAYLOAD_DIR"

# ── Copy installer script ────────────────────────────────────
cp "$INSTALLER_SCRIPT" "$PAYLOAD_DIR/install-claude-oscar.sh"
chmod +x "$PAYLOAD_DIR/install-claude-oscar.sh"

# ── Create a .app wrapper that opens Terminal and runs the script ──
log "Creating .app launcher..."
mkdir -p "$APP_DIR/Contents/MacOS" "$APP_DIR/Contents/Resources"

# Info.plist
cat > "$APP_DIR/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>      <string>launch</string>
  <key>CFBundleIdentifier</key>      <string>com.oscar.claude-installer</string>
  <key>CFBundleName</key>            <string>Install Claude Code for Oscar</string>
  <key>CFBundleDisplayName</key>     <string>Install Claude Code for Oscar</string>
  <key>CFBundleVersion</key>         <string>1.0</string>
  <key>CFBundleShortVersionString</key> <string>1.0</string>
  <key>CFBundlePackageType</key>     <string>APPL</string>
  <key>CFBundleSignature</key>       <string>????</string>
  <key>LSMinimumSystemVersion</key>  <string>10.13</string>
  <key>NSHighResolutionCapable</key> <true/>
</dict>
</plist>
PLIST

# PkgInfo
printf "APPL????" > "$APP_DIR/Contents/PkgInfo"

# Launcher shell (opens Terminal and runs the installer)
cat > "$APP_DIR/Contents/MacOS/launch" <<'LAUNCHER'
#!/usr/bin/env bash
# Get the directory where the .app lives (inside the mounted DMG)
APP_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
DMG_ROOT="$(cd "$APP_DIR/.." && pwd)"
SCRIPT="$DMG_ROOT/install-claude-oscar.sh"

if [[ ! -f "$SCRIPT" ]]; then
  osascript -e 'display alert "install-claude-oscar.sh not found" message "Make sure you are running this from the mounted DMG."'
  exit 1
fi

# Open Terminal and run the installer
osascript <<EOF
tell application "Terminal"
  activate
  do script "bash '${SCRIPT}'; echo ''; read -r -p 'Press Enter to close...'"
end tell
EOF
LAUNCHER
chmod +x "$APP_DIR/Contents/MacOS/launch"

# ── README for the DMG ───────────────────────────────────────
cat > "$PAYLOAD_DIR/README.txt" <<'README'
Claude Code Installer — Oscar Edition
======================================

Option A (easiest):
  Double-click "Install Claude Code for Oscar.app"
  This opens a Terminal window and runs the installer automatically.

Option B (Terminal):
  1. Open Terminal
  2. Run:  bash /Volumes/"Claude Code Oscar"/"install-claude-oscar.sh"

After installation, Claude Code will be available as the `claude` command.

Environment overrides (set before running):
  CLAUDE_VERSION  — install a specific version (e.g. 1.2.3)
  OSCAR_ROOT      — override Oscar drive root (default: /Volumes/Oscar/Master-Oscar)
  CLAUDE_RETRIES  — download retry count (default: 3)
README

# ── Build the DMG ─────────────────────────────────────────────
log "Creating DMG at: $DMG_OUT"
hdiutil create \
  -volname "Claude Code Oscar" \
  -srcfolder "$PAYLOAD_DIR" \
  -ov \
  -format UDZO \
  "$DMG_OUT"

# ── Optional code signing ────────────────────────────────────
if [[ -n "$SIGN_ID" ]]; then
  log "Signing DMG with: $SIGN_ID"
  codesign --force --sign "$SIGN_ID" "$DMG_OUT"
  log "Signed. For full notarization: xcrun notarytool submit \"$DMG_OUT\" --wait"
fi

# ── Checksum ─────────────────────────────────────────────────
CHECKSUM=$(shasum -a 256 "$DMG_OUT" | cut -d' ' -f1)
printf "%s  Claude-Code-Oscar-Installer.dmg\n" "$CHECKSUM" > "$DIST_DIR/SHA256SUMS.txt"

log ""
log "✅  Done!"
log "    DMG:      $DMG_OUT"
log "    SHA-256:  $CHECKSUM"
log "    Checksums: $DIST_DIR/SHA256SUMS.txt"
log ""
log "To install: mount the DMG, then double-click the .app or run the script in Terminal."
