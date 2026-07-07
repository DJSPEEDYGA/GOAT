#!/bin/bash
# GOAT Force — Start Training / Boot Oscar
# Fixed from FKD1 version — uses correct i2i 1 paths
ROOT="/Volumes/i2i 1/Agent-007-GOAT"
SHARED="$ROOT/Shared"

# Open README if it exists
README="$ROOT/README-MEETING-START-HERE.txt"
[ -f "$README" ] && open "$ROOT/README-MEETING-START-HERE.txt"

# Load session packets
PACKETS="$SHARED/session_packets"
if [ -d "$PACKETS" ]; then
  echo "Loading session packets from $PACKETS..."
  ls "$PACKETS/" 2>/dev/null
fi

# Start Ollama on 11435 if not running
OLLAMA_BIN="$(command -v ollama 2>/dev/null || echo "")"
if [ -x "$SHARED/bin/ollama-darwin" ]; then OLLAMA_BIN="$SHARED/bin/ollama-darwin"; fi

if [ -n "$OLLAMA_BIN" ]; then
  if ! curl -fsS --max-time 3 http://127.0.0.1:11435/api/tags >/dev/null 2>&1; then
    echo "Starting Ollama on :11435..."
    OLLAMA_MODELS="$SHARED/models/ollama_data" \
    OLLAMA_HOST="127.0.0.1:11435" \
    OLLAMA_ORIGINS="*" \
    OLLAMA_NO_PRUNE=1 \
    "$OLLAMA_BIN" serve > "$ROOT/logs/ollama.log" 2>&1 &
    echo "Ollama started (PID $!)"
  else
    echo "Ollama already running on :11435"
  fi
fi

# Start Intel server if not running
if ! curl -fsS --max-time 3 http://127.0.0.1:5500/health >/dev/null 2>&1; then
  echo "Starting GOAT Intel server..."
  cd /Users/be100radio/GOAT-Royalty-App/goat-intel-server
  python3 goat_intel.py > /Users/be100radio/GOAT-Royalty-App/logs/intel.log 2>&1 &
  echo "Intel server started (PID $!)"
fi

# Start Oscar chat server
CHAT_SERVER="$SHARED/chat_server.py"
if [ -f "$CHAT_SERVER" ]; then
  if ! curl -fsS --max-time 3 http://127.0.0.1:3333/ >/dev/null 2>&1; then
    echo "Starting Oscar chat server on :3333..."
    cd "$SHARED"
    python3 chat_server.py > "$ROOT/logs/oscar.log" 2>&1 &
    echo "Oscar started (PID $!)"
  else
    echo "Oscar already running on :3333"
  fi
fi

echo ""
echo "✅  GOAT Force training session started"
echo "   Web:    http://127.0.0.1:8090"
echo "   Intel:  http://127.0.0.1:5500"
echo "   Oscar:  http://127.0.0.1:3333"
echo "   Ollama: http://127.0.0.1:11435"
echo ""

# Open crew launcher
open "http://127.0.0.1:8090/waka-crew-launcher.html"
