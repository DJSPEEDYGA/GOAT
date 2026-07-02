#!/bin/bash
# Open the GOAT crew agent launchers in the default browser.
set -euo pipefail

ROOT="/Volumes/Oscar/Master-Oscar"
WEB_DIR="$ROOT/goat-royalty-portable-2.0.0/web-app"

urls=(
  "http://localhost:3333"
  "file://$WEB_DIR/agents.html"
  "file://$WEB_DIR/money-penny-launcher.html"
  "file://$WEB_DIR/lexicon-lexi-launcher.html"
  "file://$WEB_DIR/ms-vanessa-launcher.html"
  "file://$WEB_DIR/ms-nexus-launcher.html"
  "file://$WEB_DIR/sir-codex-launcher.html"
)

echo "Opening crew agent launchers..."
for url in "${urls[@]}"; do
  if [ -f "${url#file://}" ] || [[ "$url" == http://* ]]; then
    open "$url" 2>/dev/null || true
    sleep 0.5
  fi
done

echo "Done."
