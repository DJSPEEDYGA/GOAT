#!/bin/bash
# 👑 Ms. Vanessa — GOAT Force AI Launcher
# Brand & PR — Agent 003

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
WEB_APP="$PROJECT_ROOT/web-app"
INTEL_DIR="$PROJECT_ROOT/goat-intel-server"
URL="http://127.0.0.1:8090/moneypenny.html?mode=vanessa"

echo "==================================================="
echo "    👑 Ms. Vanessa — GOAT Force AI"
echo "==================================================="

if command -v ollama &>/dev/null; then
  if ! curl -s http://127.0.0.1:11435/api/tags >/dev/null 2>&1; then
    echo "Starting Ollama..."
    OLLAMA_HOST=127.0.0.1:11435 nohup ollama serve >/tmp/ollama-vanessa.log 2>&1 &
    sleep 2
  fi
fi

if ! curl -s http://127.0.0.1:5500/health >/dev/null 2>&1; then
  if [ -f "$INTEL_DIR/goat_intel.py" ]; then
    echo "Starting Intel AI server..."
    cd "$INTEL_DIR"
    nohup python3 goat_intel.py >/tmp/goat-intel.log 2>&1 &
    sleep 2
    echo "Intel AI server online ✅"
  fi
fi

if ! curl -s http://127.0.0.1:8090/ >/dev/null 2>&1; then
  echo "Starting web server on port 8090..."
  cd "$WEB_APP"
  nohup python3 -m http.server 8090 >/tmp/goat-webserver.log 2>&1 &
  sleep 1
fi

echo "Opening Ms. Vanessa at $URL"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ -f "$CHROME" ]; then
  "$CHROME" --app="$URL" --window-size=1400,900 &
elif [[ "$OSTYPE" == "darwin"* ]]; then
  open "$URL"
elif command -v xdg-open &>/dev/null; then
  xdg-open "$URL"
else
  echo "Open your browser to: $URL"
fi

echo ""
echo "👑 Ms. Vanessa Agent 003 is online. Ready."
