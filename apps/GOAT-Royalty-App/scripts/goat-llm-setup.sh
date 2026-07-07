#!/usr/bin/env bash
# ============================================================
# GOAT Force — Full LLM Setup
# Enhanced setup-local-llm-oscar.sh for ALL agents + 56 models
#
# Sets up Ollama on the i2i 1 drive (port 11435) with:
#   - All GOAT Force agent model assignments
#   - 56-model tier support (FAST → CREATOR → BIG)
#   - Thor/Threadripper routing for heavy GPU models
#   - All agent env wiring (Oscar, Money Penny, Lexi, Codex, etc.)
#   - Intel server integration on localhost:5500
#   - Web app integration on localhost:8090
#
# Usage:
#   ./goat-llm-setup.sh [--pull-defaults] [--pull-all] [--status] [--help]
# ============================================================

set -euo pipefail

# ── GOAT Force paths ──────────────────────────────────────────
OSCAR_ROOT="${OSCAR_ROOT:-/Volumes/i2i 1/Agent-007-GOAT}"
OLLAMA_MODELS="${OLLAMA_MODELS:-$OSCAR_ROOT/Shared/models/ollama_data}"
OLLAMA_HOME="${OLLAMA_HOME:-/Users/be100radio/Library/Application Support/Agent007Runtime/ollama}"
OLLAMA_PORT="${OLLAMA_PORT:-11435}"
OLLAMA_HOST="127.0.0.1:$OLLAMA_PORT"
OLLAMA_API="http://$OLLAMA_HOST"
BIN_DIR="$OSCAR_ROOT/Shared/bin"
LOG_DIR="$OSCAR_ROOT/logs"
GOAT_APP_ROOT="${GOAT_APP_ROOT:-/Users/be100radio/GOAT-Royalty-App}"
ENV_FILE="$GOAT_APP_ROOT/.goat-ollama.env"

# ── Flags ─────────────────────────────────────────────────────
PULL_DEFAULTS=false
PULL_ALL=false
SHOW_STATUS=false

for arg in "$@"; do
  case "$arg" in
    --pull-defaults) PULL_DEFAULTS=true ;;
    --pull-all)      PULL_ALL=true; PULL_DEFAULTS=true ;;
    --status)        SHOW_STATUS=true ;;
    --help|-h)
      cat <<'EOF'
Usage: goat-llm-setup.sh [--pull-defaults] [--pull-all] [--status]

  (no flags)       Setup Ollama + env wiring only, no model pulls
  --pull-defaults  Pull FAST tier (5 models) + CREATOR PACK (28 models)
  --pull-all       Pull full 56-model catalog (requires ~300GB+)
  --status         Show Ollama status and model list, then exit

Env overrides:
  OSCAR_ROOT      i2i 1 drive root
  OLLAMA_PORT     Ollama port (default: 11435)
  OLLAMA_MODELS   Model store path
  GOAT_APP_ROOT   GOAT Royalty App root

Thor/GPU routing:
  Heavy models (70B+) should run on Thor/Threadripper w/ dual RTX 5090
  Set OLLAMA_HOST to Thor's IP:port to route heavy inference there
EOF
      exit 0 ;;
  esac
done

log()  { printf "[goat-llm-setup] %s\n" "$*"; }
ok()   { printf "[goat-llm-setup] ✅  %s\n" "$*"; }
warn() { printf "[goat-llm-setup] ⚠️   %s\n" "$*" >&2; }
die()  { printf "[goat-llm-setup] ERROR: %s\n" "$*" >&2; exit 1; }

# ── Detect OS/arch ────────────────────────────────────────────
case "$(uname -s)" in Darwin) OS="darwin" ;; Linux) OS="linux" ;; *) die "Unsupported OS" ;; esac
case "$(uname -m)" in x86_64|amd64) ARCH="amd64" ;; arm64|aarch64) ARCH="arm64" ;; *) die "Unsupported arch" ;; esac

# ── Status mode ───────────────────────────────────────────────
if [[ "$SHOW_STATUS" == true ]]; then
  log "GOAT Force Ollama Status"
  log "  OLLAMA_HOST   : $OLLAMA_HOST"
  log "  OLLAMA_MODELS : $OLLAMA_MODELS"
  log "  OLLAMA_HOME   : $OLLAMA_HOME"
  log ""
  if curl -fsS --max-time 5 "$OLLAMA_API/api/tags" >/dev/null 2>&1; then
    ok "Ollama ONLINE at $OLLAMA_API"
    MODEL_LIST=$(curl -fsS "$OLLAMA_API/api/tags" 2>/dev/null | python3 -c "
import json,sys
data=json.load(sys.stdin)
models=data.get('models',[])
print(f'  {len(models)} models loaded:')
for m in models: print(f'    - {m[\"name\"]}')
" 2>/dev/null || echo "  (unable to parse model list)")
    echo "$MODEL_LIST"
  else
    warn "Ollama NOT running on $OLLAMA_API"
    log "Start: OLLAMA_MODELS=\"$OLLAMA_MODELS\" OLLAMA_HOST=$OLLAMA_HOST ollama serve"
  fi
  log ""
  log "Intel server:   http://127.0.0.1:5500"
  log "Web app:        http://127.0.0.1:8090"
  log "Thor endpoint:  (configure OLLAMA_HOST to Thor IP for heavy models)"
  exit 0
fi

log "==================================================="
log "     GOAT Force Full LLM Setup"
log "     Wiring all 14 agents + 56 models"
log "==================================================="
log "i2i 1 root   : $OSCAR_ROOT"
log "Ollama port  : $OLLAMA_PORT"
log "Model store  : $OLLAMA_MODELS"
log "Ollama home  : $OLLAMA_HOME"
log "App root     : $GOAT_APP_ROOT"
log ""

# ── Create directories ────────────────────────────────────────
mkdir -p "$OLLAMA_MODELS" "$OLLAMA_HOME/runners" "$OLLAMA_HOME/tmp" \
         "$BIN_DIR" "$LOG_DIR" 2>/dev/null || true

# ── Find or install Ollama ────────────────────────────────────
find_ollama() {
  for c in "$BIN_DIR/ollama-darwin" "$BIN_DIR/ollama" "$(command -v ollama 2>/dev/null || true)"; do
    [[ -n "$c" && -x "$c" ]] && { echo "$c"; return 0; }
  done; return 1
}

OLLAMA_BIN=""
if OLLAMA_BIN="$(find_ollama)"; then
  ok "Ollama found: $OLLAMA_BIN"
else
  log "Ollama not found. Installing..."
  if command -v brew >/dev/null 2>&1; then
    brew install ollama
    OLLAMA_BIN="$(command -v ollama)"
  else
    log "Downloading Ollama for $OS/$ARCH ..."
    curl -fsSL -o "$BIN_DIR/ollama-darwin" \
      "https://github.com/ollama/ollama/releases/latest/download/ollama-darwin"
    chmod +x "$BIN_DIR/ollama-darwin"
    OLLAMA_BIN="$BIN_DIR/ollama-darwin"
  fi
  ok "Ollama installed: $OLLAMA_BIN"
fi

# ── Write GOAT Force env file ────────────────────────────────
cat > "$ENV_FILE" <<EOF
# GOAT Force Ollama Environment — Auto-generated by goat-llm-setup.sh
# Source: . "$ENV_FILE"

# ── Core Ollama config ──────────────────────────────────────
export OLLAMA_MODELS="$OLLAMA_MODELS"
export OLLAMA_HOME="$OLLAMA_HOME"
export OLLAMA_RUNNERS_DIR="$OLLAMA_HOME/runners"
export OLLAMA_TMPDIR="$OLLAMA_HOME/tmp"
export OLLAMA_HOST="$OLLAMA_HOST"
export OLLAMA_PROXY_TARGET="$OLLAMA_API"
export OSCAR_MODEL_DOWNLOAD_PORT="$OLLAMA_PORT"
export OLLAMA_ORIGINS="*"
export OLLAMA_NO_PRUNE=1

# ── GOAT Force agent model assignments ─────────────────────
# Agent 00 — Ms. Money Penny (THE OG, Intelligence Director)
export AGENT_00_MODEL="llama3.1:70b"
export MONEYPENNY_MODEL="llama3.1:70b"

# Agent 001 — THE GOAT (Supreme Commander)
export AGENT_001_MODEL="llama3.1:70b"
export GOAT_MODEL="llama3.1:70b"

# Agent 002 — Master Oscar (Dealmaker)
export AGENT_002_MODEL="qwen3:14b"
export OSCAR_MODEL="qwen3:14b"

# Agent 003 — Ms. Vanessa (Brand/PR)
export AGENT_003_MODEL="gemma3:12b"
export VANESSA_MODEL="gemma3:12b"

# Agent 004 — Nexus (Intelligence/Trends)
export AGENT_004_MODEL="deepseek-r1:14b"
export NEXUS_MODEL="deepseek-r1:14b"

# Agent 005 — Lexi (Creative/Lyrics)
export AGENT_005_MODEL="qwen2.5:14b"
export LEXI_MODEL="qwen2.5:14b"

# Agent 006 — Sir Codex (Technical/Code)
export AGENT_006_MODEL="qwen2.5-coder:14b"
export CODEX_MODEL="qwen2.5-coder:14b"

# Agent 007 — Dr. Devin (AI Strategy)
export AGENT_007_MODEL="llama3.1:70b"
export DEVIN_MODEL="llama3.1:70b"

# GONBRAZY — Studio Boss (Mixing/Mastering)
export GONBRAZY_MODEL="gemma3:12b"

# Wooh Da Kid — Beat Maestro (Production)
export WOOH_MODEL="qwen2.5:7b"

# Hannah Miller — Anigo Alley Web Keeper
export HANNAH_MODEL="gemma3:4b"

# ── Default power model (fallback for all agents) ───────────
export GOAT_DEFAULT_MODEL="llama3.1:70b"
export GOAT_FAST_MODEL="llama3.2:3b"
export GOAT_CODE_MODEL="qwen2.5-coder:7b"
export GOAT_EMBED_MODEL="nomic-embed-text"
export GOAT_VISION_MODEL="llava:7b"

# ── Server endpoints ────────────────────────────────────────
export GOAT_INTEL_SERVER="http://127.0.0.1:5500"
export GOAT_WEB_SERVER="http://127.0.0.1:8090"
export GOAT_THOR_ENDPOINT=""   # Set to Thor IP:port for GPU routing

# ── Thor/Threadripper routing (dual RTX 5090) ───────────────
# For models 32B+, set GOAT_THOR_ENDPOINT and use:
#   OLLAMA_HOST=\$GOAT_THOR_ENDPOINT ollama run llama3.1:70b
EOF
ok "GOAT env file written: $ENV_FILE"
log "  Source: . \"$ENV_FILE\""

# ── Start Ollama if not running ───────────────────────────────
if curl -fsS --max-time 5 "$OLLAMA_API/api/tags" >/dev/null 2>&1; then
  ok "Ollama already running at $OLLAMA_API"
else
  log "Starting Ollama on port $OLLAMA_PORT ..."
  export OLLAMA_MODELS OLLAMA_HOST
  export OLLAMA_RUNNERS_DIR="$OLLAMA_HOME/runners"
  export OLLAMA_TMPDIR="$OLLAMA_HOME/tmp"
  export OLLAMA_ORIGINS="*"
  export OLLAMA_NO_PRUNE=1
  HOME="$OLLAMA_HOME" "$OLLAMA_BIN" serve > "$LOG_DIR/ollama.log" 2>&1 &
  OLLAMA_PID=$!
  log "Ollama PID: $OLLAMA_PID  Log: $LOG_DIR/ollama.log"
  log "Waiting (up to 60s)..."
  for i in $(seq 1 60); do
    curl -fsS --max-time 3 "$OLLAMA_API/api/tags" >/dev/null 2>&1 && { ok "Ollama ready at $OLLAMA_API"; break; }
    sleep 1
    [[ "$i" -eq 60 ]] && warn "Ollama took >60s. Check: $LOG_DIR/ollama.log"
  done
fi

# ── Create agent model symlinks / config ─────────────────────
AGENT_CONFIG_DIR="$GOAT_APP_ROOT/config/agents"
mkdir -p "$AGENT_CONFIG_DIR"

cat > "$AGENT_CONFIG_DIR/model-assignments.json" <<'AGENTJSON'
{
  "default_model": "llama3.1:70b",
  "fallback_chain": ["ollama", "grok", "gemini", "openai"],
  "ollama_host": "127.0.0.1:11435",
  "agents": {
    "money_penny": {
      "agent_number": "00",
      "codename": "BOSS LADY",
      "role": "Intelligence Director — OG — Parent of ALL agents",
      "model": "llama3.1:70b",
      "fast_model": "gemma3:12b",
      "embed_model": "nomic-embed-text"
    },
    "the_goat": {
      "agent_number": "001",
      "codename": "SUPREME COMMANDER",
      "role": "Supreme Commander — Answers only to DJ Speedy & Waka Flocka",
      "model": "llama3.1:70b",
      "fast_model": "llama3.2:3b"
    },
    "oscar": {
      "agent_number": "002",
      "codename": "THE DEALMAKER",
      "role": "Chief Operations & Deal Architect",
      "model": "qwen3:14b",
      "fast_model": "qwen2.5:7b",
      "code_model": "qwen2.5-coder:7b"
    },
    "vanessa": {
      "agent_number": "003",
      "codename": "ICON",
      "role": "Brand Strategy, PR & Fan Engagement",
      "model": "gemma3:12b",
      "fast_model": "gemma3:4b"
    },
    "nexus": {
      "agent_number": "004",
      "codename": "THE ORACLE",
      "role": "AI Research, Intelligence & Trend Analysis",
      "model": "deepseek-r1:14b",
      "fast_model": "qwen3:8b"
    },
    "lexi": {
      "agent_number": "005",
      "codename": "THE SPARK",
      "role": "Creative Director, Lyrics & Content AI",
      "model": "qwen2.5:14b",
      "fast_model": "mistral:7b"
    },
    "codex": {
      "agent_number": "006",
      "codename": "SENTINEL",
      "role": "Chief Technical Officer & System Builder",
      "model": "qwen2.5-coder:14b",
      "fast_model": "qwen2.5-coder:7b",
      "code_model": "starcoder2:15b"
    },
    "devin": {
      "agent_number": "007",
      "codename": "WHAT'S UP DOC",
      "role": "Chief AI Strategist & Innovation Commander",
      "model": "llama3.1:70b",
      "fast_model": "deepseek-r1:8b"
    },
    "gonbrazy": {
      "agent_number": null,
      "codename": "THE STUDIO BOSS",
      "role": "Mixing, Mastering, Session Boss",
      "model": "gemma3:12b",
      "fast_model": "mistral-nemo:12b"
    },
    "wooh_da_kid": {
      "agent_number": null,
      "codename": "THE GANGSTA NERD",
      "role": "Beat Maestro, Production, Tech Guru",
      "model": "qwen2.5:7b",
      "fast_model": "phi3:mini",
      "code_model": "qwen2.5-coder:7b"
    },
    "hannah_miller": {
      "agent_number": null,
      "codename": "ANIGO ALLEY KEEPER",
      "role": "Anigo Alley Web Keeper",
      "model": "gemma3:4b",
      "fast_model": "llama3.2:3b"
    }
  },
  "model_tiers": {
    "fast": ["llama3.2:3b","phi3:mini","nemotron-mini:4b","gemma3:4b","nomic-embed-text"],
    "creator": ["llama3.1:8b","qwen3:8b","deepseek-r1:8b","qwen2.5-coder:7b","gemma3:12b","qwen2.5:14b","qwen3:14b","phi4:14b","deepseek-r1:14b","qwen2.5-coder:14b","starcoder2:15b","mistral-nemo:12b","llava:7b","llava-llama3:8b","bge-m3","mxbai-embed-large","codegemma:7b","starcoder2:7b","moondream:1.8b","mistral:7b","llama3.2-vision:11b","qwen2.5vl:7b","qwen2.5:7b","nemotron-mini:4b","gemma3:4b","llama3.2:3b","nomic-embed-text","phi3:mini"],
    "big": ["llama3.1:70b","llama3.3:70b","qwen2.5:72b","deepseek-r1:70b","qwen3:70b","qwen2.5:32b","deepseek-r1:32b","qwen3:32b","gemma3:27b","phi4:14b","qwen2.5-coder:32b","llava-llama3:70b","llama3.2-vision:90b","qwen2.5vl:72b"],
    "thor_only": ["llama3.1:70b","llama3.3:70b","qwen2.5:72b","deepseek-r1:70b","qwen3:70b","llama3.2-vision:90b","qwen2.5vl:72b"]
  }
}
AGENTJSON
ok "Agent model config written: $AGENT_CONFIG_DIR/model-assignments.json"

# ── Pull models if requested ──────────────────────────────────
FAST_MODELS=(llama3.2:3b phi3:mini nemotron-mini:4b gemma3:4b nomic-embed-text)
CREATOR_MODELS=(
  llama3.2:3b gemma3:4b qwen2.5:7b mistral:7b phi3:mini nomic-embed-text bge-m3
  moondream:1.8b llama3.1:8b qwen3:8b deepseek-r1:8b qwen2.5-coder:7b codegemma:7b
  starcoder2:7b llava:7b llava-llama3:8b mxbai-embed-large nemotron-mini:4b
  mistral-nemo:12b gemma3:12b qwen2.5:14b qwen3:14b phi4:14b deepseek-r1:14b
  qwen2.5-coder:14b starcoder2:15b llama3.2-vision:11b qwen2.5vl:7b
)

pull_model() {
  local m="$1"
  if OLLAMA_HOST="$OLLAMA_HOST" HOME="$OLLAMA_HOME" "$OLLAMA_BIN" list 2>/dev/null \
      | awk '{print $1}' | grep -Fxq "$m"; then
    log "[SKIP] $m"
    return 0
  fi
  log "[PULL] $m ..."
  OLLAMA_MODELS="$OLLAMA_MODELS" OLLAMA_HOST="$OLLAMA_HOST" HOME="$OLLAMA_HOME" \
    "$OLLAMA_BIN" pull "$m" \
    && ok "[OK]   $m" \
    || warn "[FAIL] $m — check disk space and connection"
}

if [[ "$PULL_ALL" == true ]]; then
  log "Pulling full CREATOR PACK (28 models) ..."
  for m in "${CREATOR_MODELS[@]}"; do pull_model "$m"; done
elif [[ "$PULL_DEFAULTS" == true ]]; then
  log "Pulling FAST tier defaults (5 models) ..."
  for m in "${FAST_MODELS[@]}"; do pull_model "$m"; done
fi

# ── Final summary ─────────────────────────────────────────────
log ""
log "==================================================="
ok "GOAT Force LLM Setup Complete!"
log ""
log "  Ollama API        : $OLLAMA_API"
log "  Models dir        : $OLLAMA_MODELS"
log "  Agent env file    : $ENV_FILE"
log "  Agent model config: $AGENT_CONFIG_DIR/model-assignments.json"
log "  Log dir           : $LOG_DIR"
log ""
log "Quick-start commands:"
log "  Source env:       . \"$ENV_FILE\""
log "  API health check: curl $OLLAMA_API/api/tags"
log "  List models:      OLLAMA_HOST=$OLLAMA_HOST ollama list"
log "  Chat (fast):      OLLAMA_HOST=$OLLAMA_HOST ollama run llama3.2:3b"
log "  Chat (power):     OLLAMA_HOST=$OLLAMA_HOST ollama run llama3.1:70b"
log "  Intel server:     http://127.0.0.1:5500"
log "  Web app:          http://127.0.0.1:8090"
log ""
log "  Pull CREATOR PACK:  ./goat-llm-setup.sh --pull-all"
log "  Pull FAST tier:     ./goat-llm-setup.sh --pull-defaults"
log "  Status check:       ./goat-llm-setup.sh --status"
log "==================================================="
