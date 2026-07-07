#!/usr/bin/env bash
# ============================================================
# GOAT Force — Master Boot Script
# Starts the full GOAT Force stack:
#   1. Ollama (port 11435) — all 56 models on i2i 1
#   2. GOAT Intel server   (port 5500)
#   3. GOAT Web server     (port 8090)
#   4. Oscar chat server   (port 3333)  — if chat_server.py exists
#
# Enhanced over START-TRAINING.command:
#   - Proper wait loops with timeouts for each service
#   - Colored status output
#   - Graceful handling when services already running
#   - Opens goat-launcher-hub (not just waka-crew)
#   - Logs everything to /GOAT-Royalty-App/logs/
#   - --status flag to check without starting
#   - --stop flag to kill all services
#
# Usage:
#   ./goat-start-all.sh
#   ./goat-start-all.sh --status
#   ./goat-start-all.sh --stop
# ============================================================

set -euo pipefail

# ── GOAT Force Paths ──────────────────────────────────────────
OSCAR_ROOT="${OSCAR_ROOT:-/Volumes/i2i 1/Agent-007-GOAT}"
SHARED="$OSCAR_ROOT/Shared"
REPO="/Users/be100radio/GOAT-Royalty-App"
OLLAMA_MODELS="${OLLAMA_MODELS:-$SHARED/models/ollama_data}"
OLLAMA_HOME="${OLLAMA_HOME:-/Users/be100radio/Library/Application Support/Agent007Runtime/ollama}"
OLLAMA_HOST="${OLLAMA_HOST:-127.0.0.1:11435}"
OLLAMA_API="http://$OLLAMA_HOST"
INTEL_URL="http://127.0.0.1:5500"
WEB_URL="http://127.0.0.1:8090"
OSCAR_URL="http://127.0.0.1:3333"
LOG_DIR="$REPO/logs"
PACKETS="$SHARED/session_packets"

mkdir -p "$LOG_DIR" 2>/dev/null || true

# ── Colors ────────────────────────────────────────────────────
RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'
BLU='\033[0;34m'; MAG='\033[0;35m'; CYN='\033[0;36m'; RST='\033[0m'

log()  { printf "${BLU}[goat-start]${RST} %s\n" "$*"; }
ok()   { printf "${GRN}[goat-start] ✅  %s${RST}\n" "$*"; }
warn() { printf "${YLW}[goat-start] ⚠️   %s${RST}\n" "$*" >&2; }
die()  { printf "${RED}[goat-start] ❌  %s${RST}\n" "$*" >&2; exit 1; }
sep()  { printf "${MAG}═══════════════════════════════════════${RST}\n"; }

wait_for() {
  local url="$1" label="$2" timeout="${3:-30}"
  for i in $(seq 1 "$timeout"); do
    curl -fsS --max-time 3 "$url" >/dev/null 2>&1 && { ok "$label ready at $url"; return 0; }
    sleep 1
  done
  warn "$label did not become ready in ${timeout}s — check logs"
  return 1
}

# ── Find Ollama ───────────────────────────────────────────────
find_ollama() {
  local candidates=(
    "$SHARED/bin/ollama-darwin"
    "$SHARED/bin/ollama"
    "$(command -v ollama 2>/dev/null || true)"
  )
  for c in "${candidates[@]}"; do
    [[ -n "$c" && -x "$c" ]] && { echo "$c"; return 0; }
  done
  return 1
}

# ── --status mode ─────────────────────────────────────────────
if [[ "${1:-}" == "--status" ]]; then
  sep
  log "GOAT Force Stack Status"
  sep
  for check in "Ollama:$OLLAMA_API/api/tags" "Intel:$INTEL_URL/health" "Web:$WEB_URL" "Oscar:$OSCAR_URL"; do
    label="${check%%:*}"; url="${check#*:}"
    if curl -fsS --max-time 4 "$url" >/dev/null 2>&1; then
      printf "  ${GRN}● ONLINE${RST}  %s — %s\n" "$label" "$url"
    else
      printf "  ${RED}○ OFFLINE${RST} %s — %s\n" "$label" "$url"
    fi
  done
  sep
  # Show loaded models
  if curl -fsS --max-time 4 "$OLLAMA_API/api/tags" >/dev/null 2>&1; then
    MODEL_COUNT=$(curl -fsS "$OLLAMA_API/api/tags" 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('models',[])))" 2>/dev/null || echo "?")
    printf "  ${CYN}Models available: %s${RST}\n" "$MODEL_COUNT"
  fi
  exit 0
fi

# ── --stop mode ───────────────────────────────────────────────
if [[ "${1:-}" == "--stop" ]]; then
  log "Stopping GOAT Force stack..."
  pkill -f "goat_intel.py" 2>/dev/null && ok "Intel server stopped" || warn "Intel not running"
  pkill -f "chat_server.py" 2>/dev/null && ok "Oscar stopped" || warn "Oscar not running"
  pkill -f "ollama serve" 2>/dev/null && ok "Ollama stopped" || warn "Ollama not running"
  # Python web server
  pkill -f "http.server 8090" 2>/dev/null && ok "Web server stopped" || true
  ok "GOAT Force stack stopped"
  exit 0
fi

# ── Banner ────────────────────────────────────────────────────
sep
printf "${YLW}         🐐  GOAT FORCE BOOT — DJ SPEEDY${RST}\n"
sep
log "i2i 1 root   : $OSCAR_ROOT"
log "Ollama port  : 11435"
log "Intel port   : 5500"
log "Web port     : 8090"
log "Oscar port   : 3333"
log "Logs         : $LOG_DIR"
sep

# ── Session Packets ───────────────────────────────────────────
if [ -d "$PACKETS" ]; then
  log "Session packets loaded:"
  ls "$PACKETS/" 2>/dev/null | while read -r p; do printf "   📦 %s\n" "$p"; done
fi

# ── 1. Ollama ─────────────────────────────────────────────────
OLLAMA_BIN=""
OLLAMA_BIN="$(find_ollama)" || true

if [[ -z "$OLLAMA_BIN" ]]; then
  warn "Ollama not found. Install: brew install ollama"
else
  if curl -fsS --max-time 4 "$OLLAMA_API/api/tags" >/dev/null 2>&1; then
    ok "Ollama already running at $OLLAMA_API"
  else
    log "Starting Ollama on :11435..."
    mkdir -p "$OLLAMA_HOME/runners" "$OLLAMA_HOME/tmp" 2>/dev/null || true
    OLLAMA_MODELS="$OLLAMA_MODELS" \
    OLLAMA_HOST="$OLLAMA_HOST" \
    OLLAMA_RUNNERS_DIR="$OLLAMA_HOME/runners" \
    OLLAMA_TMPDIR="$OLLAMA_HOME/tmp" \
    OLLAMA_ORIGINS="*" \
    OLLAMA_NO_PRUNE=1 \
    HOME="$OLLAMA_HOME" \
      "$OLLAMA_BIN" serve > "$LOG_DIR/ollama.log" 2>&1 &
    log "Ollama PID: $!  Log: $LOG_DIR/ollama.log"
    wait_for "$OLLAMA_API/api/tags" "Ollama" 60 || true
  fi
fi

# ── 2. GOAT Intel Server ──────────────────────────────────────
INTEL_PY="$REPO/goat-intel-server/goat_intel.py"
if [ ! -f "$INTEL_PY" ]; then
  warn "goat_intel.py not found at $INTEL_PY"
elif curl -fsS --max-time 4 "$INTEL_URL/health" >/dev/null 2>&1; then
  ok "Intel server already running at $INTEL_URL"
else
  log "Starting GOAT Intel server on :5500..."
  cd "$REPO/goat-intel-server"
  python3 goat_intel.py > "$LOG_DIR/intel.log" 2>&1 &
  log "Intel PID: $!  Log: $LOG_DIR/intel.log"
  wait_for "$INTEL_URL/health" "Intel server" 30 || true
  cd "$REPO"
fi

# ── 3. Web Server ─────────────────────────────────────────────
if curl -fsS --max-time 4 "$WEB_URL" >/dev/null 2>&1; then
  ok "Web server already running at $WEB_URL"
else
  log "Starting GOAT web server on :8090..."
  cd "$REPO/web-app"
  python3 -m http.server 8090 > "$LOG_DIR/web.log" 2>&1 &
  log "Web PID: $!  Log: $LOG_DIR/web.log"
  wait_for "$WEB_URL" "Web server" 15 || true
  cd "$REPO"
fi

# ── 4. Oscar Chat Server ──────────────────────────────────────
OSCAR_PY="$SHARED/chat_server.py"
if [ -f "$OSCAR_PY" ]; then
  if curl -fsS --max-time 4 "$OSCAR_URL" >/dev/null 2>&1; then
    ok "Oscar chat server already running at $OSCAR_URL"
  else
    log "Starting Oscar chat server on :3333..."
    cd "$SHARED"
    python3 chat_server.py > "$LOG_DIR/oscar.log" 2>&1 &
    log "Oscar PID: $!  Log: $LOG_DIR/oscar.log"
    wait_for "$OSCAR_URL" "Oscar" 20 || true
    cd "$REPO"
  fi
else
  log "Oscar chat_server.py not present — skipping"
fi

# ── Final Status ──────────────────────────────────────────────
sep
ok "GOAT Force stack started!"
sep
printf "  ${CYN}🌐 Web App :  %s${RST}\n" "$WEB_URL"
printf "  ${CYN}🧠 Intel   :  %s${RST}\n" "$INTEL_URL"
printf "  ${CYN}🤖 Ollama  :  %s${RST}\n" "$OLLAMA_API"
printf "  ${CYN}🎤 Oscar   :  %s${RST}\n" "$OSCAR_URL"
printf "  ${CYN}📂 Logs    :  %s${RST}\n" "$LOG_DIR"
sep

# ── Open Hub ──────────────────────────────────────────────────
if command -v open >/dev/null 2>&1; then
  open "$WEB_URL/goat-launcher-hub.html" 2>/dev/null || true
fi
