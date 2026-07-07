#!/usr/bin/env python3
"""
GOAT Force Single-Agent App Builder — Master Template
=======================================================
To build one agent app, just change the 5 variables below and run:

    python3 build_one_agent_app.py

The script uses Waka's Lexi.app as the template and creates a lightweight
macOS launcher that starts the shared GOAT services, then opens the agent's
web page in Chrome app mode.
"""

# ════════════════════════════════════════════════════════════════════════════
# 1. EDIT ONLY THESE LINES — put the new agent's info where Ms. Money Penny is
# ════════════════════════════════════════════════════════════════════════════
AGENT_APP_NAME = "Ms. Money Penny — OG"          # Finder .app name
AGENT_DISPLAY_NAME = "Ms. Money Penny"            # Menu bar / notification name
AGENT_CODENAME = "THE OG"                         # Codename shown in logs
AGENT_NUMBER = "00"                               # Agent number (use "—" if none)
AGENT_ROLE = "Intelligence Director · PARENT of all agents"  # Short role
AGENT_WEB_PAGE = "money-penny-launcher.html"      # Web page to open
AGENT_BUNDLE_ID = "com.goatforce.moneypenny.launcher"  # Reverse-DNS bundle id
AGENT_ACCENT = "#d4a03c"                          # Brand accent color
# ════════════════════════════════════════════════════════════════════════════

import os
import shutil
import stat
from pathlib import Path
from xml.sax.saxutils import escape

TEMPLATE_APP = Path("/Applications/Waka's Lexi.app")
TARGET_DIR = Path("/Applications")
GOAT_APP = Path("/Users/be100radio/GOAT-Royalty-App")
WEB_APP = GOAT_APP / "web-app"


def sanitize_executable_name(name: str) -> str:
    return "".join(c for c in name if c.isalnum() or c in "_-")


def make_info_plist() -> str:
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>launcher</string>
    <key>CFBundleIconFile</key>
    <string>icon.icns</string>
    <key>CFBundleIdentifier</key>
    <string>{escape(AGENT_BUNDLE_ID)}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>{escape(AGENT_DISPLAY_NAME)}</string>
    <key>CFBundleDisplayName</key>
    <string>{escape(AGENT_DISPLAY_NAME)}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>2.0</string>
    <key>CFBundleVersion</key>
    <string>2.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSAppleScriptEnabled</key>
    <true/>
    <key>LSMinimumSystemVersion</key>
    <string>12.0</string>
    <key>NSHumanReadableCopyright</key>
    <string>GOAT Force Records — Waka Flocka Flame / DJ Speedy</string>
</dict>
</plist>
'''


def make_launcher() -> str:
    agent_key = sanitize_executable_name(AGENT_APP_NAME).lower()
    page = f"http://127.0.0.1:8090/{AGENT_WEB_PAGE}"
    return f'''#!/bin/bash
# ============================================================
# {AGENT_DISPLAY_NAME} — {AGENT_CODENAME} — GOAT Force Launcher
# Generated from Waka's Lexi.app template
# Starts ALL shared services, then opens {AGENT_DISPLAY_NAME} in Chrome app mode
# Accent: {AGENT_ACCENT}
# ============================================================

GOAT_APP="/Users/be100radio/GOAT-Royalty-App"
WEB_APP="$GOAT_APP/web-app"
PAGE="{page}"
INTEL_SERVER="$GOAT_APP/goat-intel-server/goat_intel.py"
OSCAR_SERVER="/Volumes/i2i 1/Ms.Money-Penny/Shared/chat_server.py"
OLLAMA_MODEL_STORE="/Volumes/i2i 1/Agent-007-GOAT/Shared/models/ollama_data"
OLLAMA_BIN="/Volumes/i2i 1/USB-Uncensored-LLM-main/Shared/bin/ollama-darwin"
OLLAMA_RUNTIME="/Volumes/i2i 1/Drive-Intake/runtime/ollama"
OLLAMA_PORT="11435"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
LOG="/tmp/{agent_key}-launch.log"

log() {{ echo "[{AGENT_DISPLAY_NAME}] $*" | tee -a "$LOG"; }}
log "=== {AGENT_DISPLAY_NAME} {AGENT_CODENAME} launch: $(date) ==="

# ── 1. Ollama (port 11435 — 56-model shared store) ──────────
if ! curl -s --max-time 2 "http://127.0.0.1:$OLLAMA_PORT/api/tags" >/dev/null 2>&1; then
  log "Starting Ollama on :$OLLAMA_PORT..."
  OLLAMA_CMD=""
  [ -x "$OLLAMA_BIN" ] && OLLAMA_CMD="$OLLAMA_BIN"
  [ -z "$OLLAMA_CMD" ] && OLLAMA_CMD="$(command -v ollama 2>/dev/null)"
  if [ -n "$OLLAMA_CMD" ]; then
    mkdir -p "$OLLAMA_RUNTIME/runners" "$OLLAMA_RUNTIME/tmp" 2>/dev/null || true
    OLLAMA_MODELS="$OLLAMA_MODEL_STORE" \
    OLLAMA_HOME="$OLLAMA_RUNTIME" \
    OLLAMA_RUNNERS_DIR="$OLLAMA_RUNTIME/runners" \
    OLLAMA_TMPDIR="$OLLAMA_RUNTIME/tmp" \
    OLLAMA_HOST="127.0.0.1:$OLLAMA_PORT" \
    OLLAMA_NUM_PARALLEL=2 \
    OLLAMA_MAX_LOADED_MODELS=2 \
    OLLAMA_CONTEXT_LENGTH=8192 \
    OLLAMA_KEEP_ALIVE=15m \
    OLLAMA_ORIGINS="*" \
    HOME="$OLLAMA_RUNTIME" \
    nohup "$OLLAMA_CMD" serve >> /tmp/ollama-11435.log 2>&1 &
    for i in $(seq 1 15); do
      sleep 1
      curl -s --max-time 1 "http://127.0.0.1:$OLLAMA_PORT/api/tags" >/dev/null 2>&1 && break
    done
    MODEL_COUNT=$(curl -s --max-time 3 "http://127.0.0.1:$OLLAMA_PORT/api/tags" 2>/dev/null \
      | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('models',[])))" 2>/dev/null || echo "?")
    log "Ollama ready — $MODEL_COUNT models"
  else
    log "WARN: ollama not found"
  fi
else
  MODEL_COUNT=$(curl -s --max-time 3 "http://127.0.0.1:$OLLAMA_PORT/api/tags" 2>/dev/null \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('models',[])))" 2>/dev/null || echo "?")
  log "Ollama already running — $MODEL_COUNT models"
fi

# ── 2. GOAT Intel Server (port 5500) ────────────────────────
if ! curl -s --max-time 2 "http://127.0.0.1:5500/health" >/dev/null 2>&1; then
  log "Starting Intel server..."
  if [ -f "$INTEL_SERVER" ]; then
    cd "$(dirname "$INTEL_SERVER")"
    nohup python3 "$INTEL_SERVER" >> /tmp/goat-intel.log 2>&1 &
    sleep 2
    log "Intel server started"
  else
    log "WARN: Intel server not found at $INTEL_SERVER"
  fi
else
  log "Intel server already running"
fi

# ── 3. Oscar Chat Server (port 3333) ────────────────────────
if ! curl -s --max-time 2 "http://127.0.0.1:3333/" >/dev/null 2>&1; then
  log "Starting Oscar chat server..."
  if [ -f "$OSCAR_SERVER" ]; then
    cd "$(dirname "$OSCAR_SERVER")"
    nohup python3 "$OSCAR_SERVER" >> /tmp/oscar-chat.log 2>&1 &
    sleep 2
    log "Oscar started"
  else
    log "WARN: Oscar server not found at $OSCAR_SERVER"
  fi
else
  log "Oscar already running"
fi

# ── 4. Web Server (port 8090) ───────────────────────────────
if ! curl -s --max-time 2 "http://127.0.0.1:8090/" >/dev/null 2>&1; then
  log "Starting web server..."
  if [ -d "$WEB_APP" ]; then
    cd "$WEB_APP"
    nohup python3 -m http.server 8090 >> /tmp/goat-web.log 2>&1 &
    for i in $(seq 1 10); do
      sleep 1
      curl -s --max-time 1 "http://127.0.0.1:8090/" >/dev/null 2>&1 && break
    done
    log "Web server ready"
  fi
else
  log "Web server already running"
fi

# ── 5. Notify ───────────────────────────────────────────────
osascript -e "display notification \"All services online. $MODEL_COUNT models loaded.\" with title \"{AGENT_DISPLAY_NAME} — {AGENT_CODENAME}\" subtitle \"GOAT Force ready\"" 2>/dev/null

log "Opening {AGENT_DISPLAY_NAME}: $PAGE"

# ── 6. Open in Chrome app mode ──────────────────────────────
if [ -f "$CHROME" ]; then
  "$CHROME" --app="$PAGE" \
    --window-size=1440,920 \
    --class="{agent_key}GOATForce" \
    --user-data-dir="$HOME/.config/goat-{agent_key}-app" \
    2>/dev/null &
else
  open "$PAGE"
fi
'''


def main():
    app_path = TARGET_DIR / f"{AGENT_APP_NAME}.app"

    if app_path.exists():
        print(f"⚠️  {app_path} already exists. Delete it first or rename AGENT_APP_NAME.")
        return

    contents = app_path / "Contents"
    macos = contents / "MacOS"
    resources = contents / "Resources"
    macos.mkdir(parents=True)
    resources.mkdir(parents=True)

    (contents / "Info.plist").write_text(make_info_plist(), encoding="utf-8")

    # Always use "launcher" as the executable name to match the Lexi template
    launcher_path = macos / "launcher"
    launcher_path.write_text(make_launcher(), encoding="utf-8")
    launcher_path.chmod(launcher_path.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)

    template_icon = TEMPLATE_APP / "Contents/Resources/icon.icns"
    target_icon = resources / "icon.icns"
    if template_icon.exists():
        shutil.copy2(template_icon, target_icon)
    else:
        target_icon.write_bytes(b"")

    # Quick verification
    syntax_ok = os.system(f"bash -n '{launcher_path}'") == 0
    checks = {
        "Info.plist": (contents / "Info.plist").exists(),
        "launcher": launcher_path.exists() and os.access(launcher_path, os.X_OK),
        "icon": target_icon.exists(),
    }
    print(f"\n✅ Built {app_path}")
    print(f"   Web page:     http://127.0.0.1:8090/{AGENT_WEB_PAGE}")
    print(f"   Syntax check: {'PASS' if syntax_ok else 'FAIL'}")
    print(f"   Structure:    {checks}")
    print(f"\nTo add the next crew member, change the variables at the top of")
    print(f"build_one_agent_app.py and run it again.\n")


if __name__ == "__main__":
    main()
