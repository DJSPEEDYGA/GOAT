#!/usr/bin/env bash
# GOAT — link your big Models Drive (macOS, double-click)
set -u
CONF_DIR="$HOME/.goat"
CONF="$CONF_DIR/models-drive.txt"
echo "  ============================================"
echo "     GOAT ROYALTY  -  Link Models Drive"
echo "  ============================================"
echo
if [ -f "$CONF" ]; then
  echo "  Currently linked: $(head -n1 "$CONF")"
  echo
fi
MODELSDRIVE="$(osascript -e 'try
  set d to POSIX path of (choose folder with prompt "Pick your big Models Drive folder (AI models live here, never re-downloaded).")
  return d
on error
  return ""
end try' 2>/dev/null)"
if [ -z "$MODELSDRIVE" ]; then
  read -r -p "  Models drive path (e.g. /Volumes/BigDrive/GOAT-Models): " MODELSDRIVE
fi
if [ -z "${MODELSDRIVE:-}" ]; then
  echo "  Nothing chosen - keeping current setting."
  exit 0
fi
mkdir -p "$CONF_DIR" "$MODELSDRIVE/ollama" 2>/dev/null || true
echo "$MODELSDRIVE" > "$CONF"
echo
echo "  [OK] Models Drive linked: $MODELSDRIVE"
echo "       Ollama will store/read models at ${MODELSDRIVE}ollama"
echo "       (takes effect next time you start GOAT)"
