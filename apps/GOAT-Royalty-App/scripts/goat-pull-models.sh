#!/usr/bin/env bash
# ============================================================
# GOAT Force — Pull Models
# Merges PULL-CREATOR-PACK.command + RESUME-LLM-DOWNLOADS.command
#
# - Skips models already present (safe to re-run / resume)
# - Full 56-model catalog: FAST → CREATOR → BIG tier
# - Logs everything to i2i 1 drive
# - Works from: /Volumes/i2i 1/Agent-007-GOAT/
#
# Usage:
#   ./goat-pull-models.sh [--fast-only] [--creator-pack] [--big-tier] [--status]
# ============================================================

set -euo pipefail

# ── GOAT Force paths ──────────────────────────────────────────
OSCAR_ROOT="${OSCAR_ROOT:-/Volumes/i2i 1/Agent-007-GOAT}"
OLLAMA_MODELS="${OLLAMA_MODELS:-$OSCAR_ROOT/Shared/models/ollama_data}"
OLLAMA_HOME="${OLLAMA_HOME:-/Users/be100radio/Library/Application Support/Agent007Runtime/ollama}"
OLLAMA_HOST="${OLLAMA_HOST:-127.0.0.1:11435}"
OLLAMA_API="http://$OLLAMA_HOST"
LOG_DIR="$OSCAR_ROOT/Shared/model_packs/logs"
LOG="$LOG_DIR/goat-pull-$(date +%Y%m%d-%H%M%S).log"

# ── Tier flags ────────────────────────────────────────────────
FAST_ONLY=false
CREATOR_PACK=false
BIG_TIER=false
SHOW_STATUS=false

for arg in "$@"; do
  case "$arg" in
    --fast-only)    FAST_ONLY=true ;;
    --creator-pack) CREATOR_PACK=true ;;
    --big-tier)     BIG_TIER=true ;;
    --status)       SHOW_STATUS=true ;;
    --help|-h)
      cat <<'EOF'
Usage: goat-pull-models.sh [--fast-only] [--creator-pack] [--big-tier] [--status]

  (no flags)       Pull FAST tier + CREATOR PACK (28 models, ~80GB)
  --fast-only      Pull only FAST tier (5 small models, ~8GB)
  --creator-pack   Pull CREATOR PACK tier (28 models)
  --big-tier       Pull BIG tier also (adds 70B+ models, ~200GB+ extra)
  --status         Show what's installed and disk space, then exit

Env overrides:
  OSCAR_ROOT      i2i 1 drive root (default: /Volumes/i2i 1/Agent-007-GOAT)
  OLLAMA_HOST     Ollama host:port (default: 127.0.0.1:11435)
  OLLAMA_MODELS   Model store path
EOF
      exit 0 ;;
  esac
done

log()  { printf "[goat-pull] %s\n" "$*" | tee -a "$LOG"; }
ok()   { printf "[goat-pull] ✅  %s\n" "$*" | tee -a "$LOG"; }
warn() { printf "[goat-pull] ⚠️   %s\n" "$*" | tee -a "$LOG"; }
die()  { printf "[goat-pull] ERROR: %s\n" "$*" | tee -a "$LOG" >&2; exit 1; }

# ── Setup dirs ────────────────────────────────────────────────
mkdir -p "$LOG_DIR" "$OLLAMA_HOME/runners" "$OLLAMA_HOME/tmp" "$OLLAMA_MODELS"

# ── Find Ollama ───────────────────────────────────────────────
OLLAMA_BIN=""
for candidate in \
  "$OSCAR_ROOT/Shared/bin/ollama-darwin" \
  "$OSCAR_ROOT/Shared/bin/ollama" \
  "$(command -v ollama 2>/dev/null || true)"
do
  [[ -n "$candidate" && -x "$candidate" ]] && { OLLAMA_BIN="$candidate"; break; }
done
[[ -z "$OLLAMA_BIN" ]] && die "Ollama not found. Install: brew install ollama"

log "=== GOAT Force Pull Models — $(date) ==="
log "Drive: $OSCAR_ROOT"
log "Models: $OLLAMA_MODELS"
log "Ollama: $OLLAMA_BIN"
log "Port: $OLLAMA_HOST"
log ""
df -h "/Volumes/i2i 1" 2>/dev/null | tee -a "$LOG" || df -h "$OSCAR_ROOT" | tee -a "$LOG"
log ""

# ── Status mode ───────────────────────────────────────────────
if [[ "$SHOW_STATUS" == true ]]; then
  log "=== Status mode ==="
  if curl -fsS --max-time 5 "$OLLAMA_API/api/tags" >/dev/null 2>&1; then
    ok "Ollama online at $OLLAMA_API"
    INSTALLED=$(OLLAMA_HOST="$OLLAMA_HOST" HOME="$OLLAMA_HOME" "$OLLAMA_BIN" list 2>/dev/null)
    COUNT=$(echo "$INSTALLED" | grep -c ":" || true)
    log "  $COUNT models installed:"
    echo "$INSTALLED" | tee -a "$LOG"
  else
    warn "Ollama NOT running. Start it first or run without --status."
  fi
  df -h "$OSCAR_ROOT" | tee -a "$LOG"
  exit 0
fi

# ── Start Ollama if not running ───────────────────────────────
if ! curl -fsS --max-time 5 "$OLLAMA_API/api/tags" >/dev/null 2>&1; then
  log "Starting Ollama on $OLLAMA_HOST ..."
  export OLLAMA_MODELS OLLAMA_HOST
  export OLLAMA_RUNNERS_DIR="$OLLAMA_HOME/runners"
  export OLLAMA_TMPDIR="$OLLAMA_HOME/tmp"
  export OLLAMA_ORIGINS="*"
  export OLLAMA_NO_PRUNE=1
  HOME="$OLLAMA_HOME" "$OLLAMA_BIN" serve >> "$OLLAMA_HOME/ollama.log" 2>&1 &
  log "Waiting for Ollama (up to 60s)..."
  for i in $(seq 1 60); do
    curl -fsS --max-time 3 "$OLLAMA_API/api/tags" >/dev/null 2>&1 && { ok "Ollama ready"; break; }
    sleep 1
    [[ "$i" -eq 60 ]] && die "Ollama did not start. Check: $OLLAMA_HOME/ollama.log"
  done
fi

# ── Pull function ─────────────────────────────────────────────
pull_one() {
  local model="$1"
  if OLLAMA_HOST="$OLLAMA_HOST" HOME="$OLLAMA_HOME" "$OLLAMA_BIN" list 2>/dev/null \
      | awk '{print $1}' | grep -Fxq "$model"; then
    log "[SKIP] $model (already installed)"
    return 0
  fi
  log "[PULL] $model"
  OLLAMA_MODELS="$OLLAMA_MODELS" OLLAMA_HOST="$OLLAMA_HOST" HOME="$OLLAMA_HOME" \
    "$OLLAMA_BIN" pull "$model" 2>&1 | tee -a "$LOG" \
    && ok "[OK]   $model" \
    || { warn "[FAIL] $model"; df -h "$OSCAR_ROOT" | tee -a "$LOG"; }
}

# ── FAST TIER — always pulled unless --big-tier only ─────────
FAST_MODELS=(
  llama3.2:3b
  phi3:mini
  nemotron-mini:4b
  gemma3:4b
  nomic-embed-text
)

# ── CREATOR PACK — 28 production models ──────────────────────
CREATOR_MODELS=(
  llama3.2:3b
  gemma3:4b
  qwen2.5:7b
  mistral:7b
  phi3:mini
  nomic-embed-text
  bge-m3
  moondream:1.8b
  llama3.1:8b
  qwen3:8b
  deepseek-r1:8b
  qwen2.5-coder:7b
  codegemma:7b
  starcoder2:7b
  llava:7b
  llava-llama3:8b
  mxbai-embed-large
  nemotron-mini:4b
  mistral-nemo:12b
  gemma3:12b
  qwen2.5:14b
  qwen3:14b
  phi4:14b
  deepseek-r1:14b
  qwen2.5-coder:14b
  starcoder2:15b
  llama3.2-vision:11b
  qwen2.5vl:7b
)

# ── BIG TIER — heavy GPU models (200GB+, route to Thor/RTX5090) ──
BIG_MODELS=(
  qwen3:32b
  deepseek-r1:32b
  qwen2.5:32b
  qwen2.5-coder:32b
  mistral-small:22b
  llama3.3:70b
  llama3.1:70b
  qwen2.5:72b
  deepseek-r1:70b
  qwen3:70b
  qwen2.5-coder:32b
  llama3.2-vision:90b
  qwen2.5vl:72b
  smollm2:135m
  qwen3:1.7b
  starcoder2:3b
  gemma3:1b
  deepseek-r1:1.5b
  phi4-mini:3.8b
  tinyllama:1.1b
  llava:13b
  llava-llama3:70b
  llama3.1:8b
  llama3.2:1b
  codellama:13b
  codellama:34b
  gemma3:27b
  phi4:14b
)

# ── Determine which tiers to pull ────────────────────────────
if [[ "$FAST_ONLY" == true ]]; then
  log "=== Pulling FAST tier (5 models) ==="
  for m in "${FAST_MODELS[@]}"; do pull_one "$m"; done
elif [[ "$BIG_TIER" == true ]]; then
  log "=== Pulling FULL 56-model catalog (CREATOR + BIG tiers) ==="
  log "⚠️  This requires 200GB+ free space and a fast connection."
  log "⚠️  Heavy models route to Thor/Threadripper (dual RTX 5090) for best performance."
  for m in "${CREATOR_MODELS[@]}"; do pull_one "$m"; done
  for m in "${BIG_MODELS[@]}"; do pull_one "$m"; done
elif [[ "$CREATOR_PACK" == true ]]; then
  log "=== Pulling CREATOR PACK (28 models, ~80GB) ==="
  for m in "${CREATOR_MODELS[@]}"; do pull_one "$m"; done
else
  # Default: FAST + CREATOR PACK
  log "=== Pulling FAST tier + CREATOR PACK (28 models, ~80GB) ==="
  for m in "${CREATOR_MODELS[@]}"; do pull_one "$m"; done
fi

# ── Final summary ─────────────────────────────────────────────
log ""
log "=== Final installed models — $(date) ==="
OLLAMA_HOST="$OLLAMA_HOST" HOME="$OLLAMA_HOME" "$OLLAMA_BIN" list 2>&1 | tee -a "$LOG"
log ""
df -h "/Volumes/i2i 1" 2>/dev/null | tee -a "$LOG" || df -h "$OSCAR_ROOT" | tee -a "$LOG"
log ""
ok "Done! Log: $LOG"

# Pause if running as .command double-click
[[ "${TERM_PROGRAM:-}" == "" ]] && read -r -p "Press Enter to close..."
