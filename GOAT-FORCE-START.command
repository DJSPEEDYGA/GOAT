#!/bin/bash
# ============================================================
#  GOAT FORCE — MASTER STACK LAUNCHER
#  DJ Speedy / Harvey L. Miller Jr.
#  Agent 007 (Dr. Devin) — compiled 2026-07-05
# ============================================================
#
#  Starts the full GOAT Force local AI stack:
#    1. Ollama engine (port 11435) — 59 models on i2i 1
#    2. Oscar chat server (port 3333) — Master Oscar / Agent 002
#    3. GOAT Intel server (port 5500) — Ms. Money Penny / Agent 00
#    4. Opens GOAT HQ in browser
#
#  Volume:   /Volumes/i2i 1
#  Models:   /Volumes/i2i 1/Agent-007-GOAT/Shared/models/ollama_data
#  Brain:    /Volumes/i2i 1/Drive-Intake/Oscar-Brain
# ============================================================

set -euo pipefail

DRIVE="/Volumes/i2i 1"
MODELS="$DRIVE/Agent-007-GOAT/Shared/models/ollama_data"
OLLAMA_BIN="$DRIVE/USB-Uncensored-LLM-main/Shared/bin/ollama-darwin"
OLLAMA_RUNTIME="$DRIVE/Drive-Intake/runtime/ollama"
OSCAR_SHARED="$DRIVE/Agent-007-GOAT/Shared"
OSCAR_SERVER="$OSCAR_SHARED/chat_server.py"
GOAT_APP="/Users/be100radio/GOAT-Royalty-App"
INTEL_SERVER="$GOAT_APP/goat-intel-server/goat_intel.py"

OLLAMA_PORT=11435
OSCAR_PORT=3333
INTEL_PORT=5500

# ── Colors ──────────────────────────────────────────────────
G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; B='\033[1;34m'; N='\033[0m'
ok()   { printf "${G}[OK]${N}  %s\n" "$*"; }
info() { printf "${B}[>>]${N}  %s\n" "$*"; }
warn() { printf "${Y}[!!]${N}  %s\n" "$*"; }
fail() { printf "${R}[XX]${N}  %s\n" "$*" >&2; }

clear
printf "${B}"
echo "============================================================"
echo "          GOAT FORCE — MASTER STACK LAUNCHER"
echo "          DJ Speedy / GOAT Force Records"
echo "============================================================"
printf "${N}\n"

# ── Verify drive is mounted ──────────────────────────────────
if [ ! -d "$DRIVE" ]; then
    fail "i2i 1 drive not mounted at $DRIVE"
    fail "Plug in the i2i 1 USB drive and try again."
    read -r -p "Press Enter to close..."; exit 1
fi
ok "i2i 1 drive mounted"

# ── 1. Ollama engine on port 11435 ───────────────────────────
info "Checking Ollama engine (port $OLLAMA_PORT)..."
if curl -s --max-time 3 "http://127.0.0.1:$OLLAMA_PORT/api/tags" >/dev/null 2>&1; then
    MODEL_COUNT=$(curl -s --max-time 5 "http://127.0.0.1:$OLLAMA_PORT/api/tags" | \
        python3 -c "import json,sys; print(len(json.load(sys.stdin).get('models',[])))" 2>/dev/null || echo "?")
    ok "Ollama already running — $MODEL_COUNT models visible on port $OLLAMA_PORT"
else
    if [ ! -x "$OLLAMA_BIN" ]; then
        warn "ollama-darwin not found at expected path — trying Agent-007-GOAT/Shared/bin"
        OLLAMA_BIN="$DRIVE/Agent-007-GOAT/Shared/bin/ollama-darwin"
    fi
    if [ ! -x "$OLLAMA_BIN" ]; then
        fail "Cannot find ollama-darwin binary."
        fail "Expected: $DRIVE/USB-Uncensored-LLM-main/Shared/bin/ollama-darwin"
        fail "      or: $DRIVE/Agent-007-GOAT/Shared/bin/ollama-darwin"
    else
        info "Starting Ollama engine on port $OLLAMA_PORT with 59-model store..."
        mkdir -p "$OLLAMA_RUNTIME/runners" "$OLLAMA_RUNTIME/tmp"
        OLLAMA_MODELS="$MODELS" \
        OLLAMA_HOME="$OLLAMA_RUNTIME" \
        OLLAMA_RUNNERS_DIR="$OLLAMA_RUNTIME/runners" \
        OLLAMA_TMPDIR="$OLLAMA_RUNTIME/tmp" \
        OLLAMA_HOST="127.0.0.1:$OLLAMA_PORT" \
        OLLAMA_NUM_PARALLEL=2 \
        OLLAMA_MAX_LOADED_MODELS=2 \
        OLLAMA_CONTEXT_LENGTH=8192 \
        OLLAMA_KEEP_ALIVE=15m \
        OLLAMA_NO_CLOUD=true \
        OLLAMA_ORIGINS="http://127.0.0.1:3333,http://localhost:3333,http://127.0.0.1:3334,http://localhost:3334,http://127.0.0.1:8090,http://localhost:8090,http://127.0.0.1:8765,http://localhost:8765,http://127.0.0.1:5500,http://localhost:5500" \
        HOME="$OLLAMA_RUNTIME" \
        nohup "$OLLAMA_BIN" serve > "$OLLAMA_RUNTIME/master-oscar-ollama-autostart.log" 2>&1 &

        echo -n "  Waiting for engine"
        for i in $(seq 1 30); do
            sleep 1; printf "."
            if curl -s --max-time 2 "http://127.0.0.1:$OLLAMA_PORT/api/tags" >/dev/null 2>&1; then
                printf "\n"
                MODEL_COUNT=$(curl -s --max-time 5 "http://127.0.0.1:$OLLAMA_PORT/api/tags" | \
                    python3 -c "import json,sys; print(len(json.load(sys.stdin).get('models',[])))" 2>/dev/null || echo "?")
                ok "Ollama engine started — $MODEL_COUNT models on port $OLLAMA_PORT"
                break
            fi
            if [ "$i" -eq 30 ]; then
                printf "\n"
                fail "Ollama did not start within 30 seconds."
                fail "Log: $OLLAMA_RUNTIME/master-oscar-ollama-autostart.log"
            fi
        done
    fi
fi

# ── 2. Oscar chat server on port 3333 ───────────────────────
info "Checking Oscar chat server (port $OSCAR_PORT)..."
if curl -s --max-time 3 "http://127.0.0.1:$OSCAR_PORT" >/dev/null 2>&1; then
    ok "Oscar chat server already running on port $OSCAR_PORT"
else
    if [ ! -f "$OSCAR_SERVER" ]; then
        warn "chat_server.py not at $OSCAR_SHARED — trying Drive-Intake/Shared"
        OSCAR_SERVER="$DRIVE/Drive-Intake/Shared/chat_server.py"
    fi
    if [ ! -f "$OSCAR_SERVER" ]; then
        fail "Oscar chat_server.py not found. Expected:"
        fail "  $DRIVE/Ms.Money-Penny/Shared/chat_server.py"
    else
        info "Starting Oscar (Master Oscar — Agent 002) on port $OSCAR_PORT..."
        OSCAR_PROJECT_ROOT="$(dirname "$(dirname "$OSCAR_SERVER")")" \
        OSCAR_SHARED_DIR="$(dirname "$OSCAR_SERVER")" \
        OLLAMA_PROXY_TARGET="http://127.0.0.1:$OLLAMA_PORT" \
        OSCAR_CHAT_PORT="$OSCAR_PORT" \
        nohup python3 "$OSCAR_SERVER" > /tmp/oscar-chat-server.log 2>&1 &

        echo -n "  Waiting for Oscar"
        for i in $(seq 1 20); do
            sleep 1; printf "."
            if curl -s --max-time 2 "http://127.0.0.1:$OSCAR_PORT" >/dev/null 2>&1; then
                printf "\n"
                ok "Oscar chat server started — http://127.0.0.1:$OSCAR_PORT"
                break
            fi
            if [ "$i" -eq 20 ]; then
                printf "\n"
                warn "Oscar server did not respond in 20s — check /tmp/oscar-chat-server.log"
            fi
        done
    fi
fi

# ── 3. GOAT Intel server on port 5500 ───────────────────────
info "Checking GOAT Intel server (port $INTEL_PORT)..."
if curl -s --max-time 3 "http://127.0.0.1:$INTEL_PORT/health" >/dev/null 2>&1; then
    ok "GOAT Intel server already running on port $INTEL_PORT"
else
    if [ -f "$INTEL_SERVER" ]; then
        info "Starting GOAT Intel server (Ms. Money Penny) on port $INTEL_PORT..."
        cd "$GOAT_APP/goat-intel-server"
        nohup python3 "$INTEL_SERVER" > /tmp/goat-intel-server.log 2>&1 &
        sleep 4
        if curl -s --max-time 3 "http://127.0.0.1:$INTEL_PORT/health" >/dev/null 2>&1; then
            ok "GOAT Intel server started — http://127.0.0.1:$INTEL_PORT"
        else
            warn "GOAT Intel server did not respond — check /tmp/goat-intel-server.log"
        fi
    else
        warn "GOAT Intel server not found at $INTEL_SERVER — skipping"
    fi
fi

# ── 4. Status summary ────────────────────────────────────────
echo ""
printf "${B}============================================================${N}\n"
printf "${B}  GOAT FORCE STACK STATUS${N}\n"
printf "${B}============================================================${N}\n"

check_url() {
    local name="$1" url="$2"
    if curl -s --max-time 3 "$url" >/dev/null 2>&1; then
        ok "$name  →  $url"
    else
        warn "$name  →  OFFLINE  ($url)"
    fi
}

check_url "Ollama Engine (59 models)" "http://127.0.0.1:$OLLAMA_PORT/api/tags"
check_url "Oscar Chat Server        " "http://127.0.0.1:$OSCAR_PORT"
check_url "GOAT Intel / Money Penny " "http://127.0.0.1:$INTEL_PORT/health"
echo ""

# ── Model count summary ──────────────────────────────────────
MODEL_LIST=$(curl -s --max-time 5 "http://127.0.0.1:$OLLAMA_PORT/api/tags" 2>/dev/null | \
    python3 -c "
import json,sys
d=json.load(sys.stdin)
models=d.get('models',[])
print(f'  {len(models)} models available on port $OLLAMA_PORT:')
for m in models:
    name=m['name']
    size=m.get('size',0)
    gb=size/1e9
    print(f'    {name}  ({gb:.1f}GB)')
" 2>/dev/null || echo "  (model list unavailable)")
echo "$MODEL_LIST"
echo ""

# ── Open GOAT HQ ─────────────────────────────────────────────
info "Opening GOAT HQ in browser..."
open "http://127.0.0.1:8090" 2>/dev/null || \
open "http://127.0.0.1:$INTEL_PORT" 2>/dev/null || \
open "http://127.0.0.1:$OSCAR_PORT" 2>/dev/null || true

printf "${G}"
echo "============================================================"
echo "  GOAT FORCE STACK IS UP — THE GOAT IS ONLINE"
echo "  Oscar:       http://127.0.0.1:$OSCAR_PORT"
echo "  Money Penny: http://127.0.0.1:$INTEL_PORT"
echo "  Ollama API:  http://127.0.0.1:$OLLAMA_PORT"
echo "============================================================"
printf "${N}\n"

# Keep window open
read -r -p "Press Enter to close this window..."
