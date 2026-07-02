#!/usr/bin/env bash
# Launch the Oscar engine (macOS / Linux / Jetson).
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"   # oscar-master/

# Load env if present.
if [ -f "$HERE/config/oscar.env" ]; then
  # shellcheck disable=SC1091
  source "$HERE/config/oscar.env"
else
  echo "ℹ️  No config/oscar.env — using defaults. Copy oscar.env.example to set up."
fi

CORE="$HERE/core"
if [ ! -f "$CORE/chat_server.py" ]; then
  echo "❌ core/chat_server.py missing. Run: bash scripts/sync-core.sh" >&2
  exit 1
fi

# Prefer the kit's venv if it exists.
PY="python3"
if [ -x "$HERE/.venv/bin/python" ]; then
  PY="$HERE/.venv/bin/python"
fi

echo "🕵️  Starting Oscar on http://127.0.0.1:3333 ..."
cd "$CORE"
exec "$PY" chat_server.py
