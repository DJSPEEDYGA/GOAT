#!/bin/bash
# 💎 Ms. Money Penny — GOAT Force AI Launcher (macOS)
# Double-click to launch Ms. Money Penny as a desktop app.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
WEB_APP="$PROJECT_ROOT/web-app"
INTEL_DIR="$PROJECT_ROOT/goat-intel-server"
URL="http://127.0.0.1:8090/moneypenny.html"

osascript -e 'display notification "Starting GOAT Force systems..." with title "💎 Ms. Money Penny"'

# ── Ollama ──────────────────────────────────────────────────
if command -v ollama &>/dev/null; then
  if ! curl -s http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
    nohup ollama serve >/tmp/ollama-moneypenny.log 2>&1 &
    sleep 2
  fi
fi

# ── Intel AI Server (port 5500) ─────────────────────────────
if ! curl -s http://127.0.0.1:5500/health >/dev/null 2>&1; then
  if [ -f "$INTEL_DIR/goat_intel.py" ]; then
    cd "$INTEL_DIR"
    nohup python3 goat_intel.py >/tmp/goat-intel.log 2>&1 &
    sleep 2
    osascript -e 'display notification "Intel AI server online ✅" with title "💎 Ms. Money Penny"'
  fi
fi

# ── Web Server (port 8090) ──────────────────────────────────
if ! curl -s http://127.0.0.1:8090/ >/dev/null 2>&1; then
  cd "$WEB_APP"
  nohup python3 -m http.server 8090 >/tmp/goat-webserver.log 2>&1 &
  sleep 1
fi

# ── Open in Chrome app mode (desktop window) ─────────────────
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ -f "$CHROME" ]; then
  "$CHROME" --app="$URL" --window-size=1400,900 &
else
  open "$URL"
fi

osascript -e 'display notification "Ms. Money Penny is online 💎" with title "GOAT Force AI"'
