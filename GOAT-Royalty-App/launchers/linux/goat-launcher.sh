#!/usr/bin/env bash
# ============================================================
#  GOAT ROYALTY — Click Launcher (Linux / Ubuntu)
#  DJ Speedy (Harvey L. Miller Jr.)
#  Serves the GOAT web app and links your big Models Drive.
# ============================================================
set -u
GOLD="\033[1;33m"; GREEN="\033[1;32m"; CYAN="\033[1;36m"; NC="\033[0m"

SELF_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SELF_DIR/web-app/launcher.html" ]; then WEBAPP="$SELF_DIR/web-app"
elif [ -f "/opt/goat-royalty/web-app/launcher.html" ]; then WEBAPP="/opt/goat-royalty/web-app"
else WEBAPP="$SELF_DIR/../web-app"; fi

CONF_DIR="$HOME/.goat"
CONF="$CONF_DIR/models-drive.txt"
[ -f "$SELF_DIR/models-drive.txt" ] && CONF="$SELF_DIR/models-drive.txt"

echo -e "${GOLD}"
echo "  ============================================"
echo "     GOAT ROYALTY  -  One Click Launcher"
echo "     DJ Speedy + Waka Flocka Flame"
echo "  ============================================"
echo -e "${NC}"

# ---------- Models Drive (set once, never re-download) ----------
MODELSDRIVE=""
[ -f "$CONF" ] && MODELSDRIVE="$(head -n1 "$CONF" | tr -d '\r')"
if [ -z "$MODELSDRIVE" ] && [ -t 0 ]; then
  echo "  Link your big Models Drive so AI models are never re-downloaded."
  echo "  Example: /media/$USER/BigDrive/GOAT-Models   (blank = skip)"
  read -r -p "  Models drive path: " MODELSDRIVE || true
  if [ -n "$MODELSDRIVE" ]; then
    mkdir -p "$CONF_DIR"
    echo "$MODELSDRIVE" > "$CONF_DIR/models-drive.txt"
  fi
fi
if [ -n "$MODELSDRIVE" ]; then
  mkdir -p "$MODELSDRIVE/ollama" 2>/dev/null || true
  export OLLAMA_MODELS="$MODELSDRIVE/ollama"
  export GOAT_MODELS_DIR="$MODELSDRIVE"
  echo -e "  ${GREEN}[OK] Models Drive linked: $MODELSDRIVE${NC}"
  echo    "       Ollama models  -> $MODELSDRIVE/ollama"
else
  echo "  [--] No Models Drive linked yet. Run: goat-models-drive"
fi
echo

# ---------- Serve + open ----------
PORT=8090
if ! curl -s -o /dev/null "http://localhost:$PORT/launcher.html"; then
  echo -e "  ${GREEN}[OK] Starting GOAT web app on http://localhost:$PORT ...${NC}"
  (cd "$WEBAPP" && nohup python3 -m http.server "$PORT" >/tmp/goat-web.log 2>&1 &)
  sleep 1
fi
URL="http://localhost:$PORT/launcher.html"
xdg-open "$URL" 2>/dev/null || sensible-browser "$URL" 2>/dev/null || true
echo -e "  ${CYAN}GOAT Launcher:  $URL${NC}"
echo -e "  ${CYAN}Powerhouse:     http://localhost:$PORT/powerhouse.html${NC}"
