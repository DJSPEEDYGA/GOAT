#!/bin/bash
# GOAT Force — Resume LLM Downloads (one model at a time, minimal forks)
# Fixed from FKD1 version — uses correct paths + port 11435
set +e

OSCAR_ROOT="/Volumes/i2i 1/Agent-007-GOAT"
OLLAMA_MODELS="$OSCAR_ROOT/Shared/models/ollama_data"
OLLAMA_HOME="/Users/be100radio/Library/Application Support/Agent007Runtime/ollama"
OLLAMA_HOST="127.0.0.1:11435"
OLLAMA_API="http://$OLLAMA_HOST"
LOG="$OSCAR_ROOT/Shared/model_packs/logs/resume-$(date +%Y%m%d-%H%M%S).log"

mkdir -p "$(dirname "$LOG")" "$OLLAMA_HOME/runners" "$OLLAMA_HOME/tmp"

log() { echo "$1" | tee -a "$LOG"; }

# Find Ollama
OLLAMA_BIN=""
for candidate in \
  "$OSCAR_ROOT/Shared/bin/ollama-darwin" \
  "$OSCAR_ROOT/Shared/bin/ollama" \
  "$(command -v ollama 2>/dev/null || true)"
do
  [[ -n "$candidate" && -x "$candidate" ]] && { OLLAMA_BIN="$candidate"; break; }
done
if [[ -z "$OLLAMA_BIN" ]]; then
  log "ERROR: ollama not found. Run: brew install ollama"
  read -r -p "Press Enter to close..."
  exit 1
fi

log "=== GOAT Force Resume LLM Downloads $(date) ==="
df -h "/Volumes/i2i 1" | tee -a "$LOG"
log "Models dir: $OLLAMA_MODELS"

# Start Ollama if needed
if ! curl -fsS --max-time 5 "$OLLAMA_API/api/tags" >/dev/null 2>&1; then
  log "Starting Ollama on :11435..."
  export OLLAMA_MODELS OLLAMA_HOST OLLAMA_ORIGINS="*" OLLAMA_NO_PRUNE=1
  HOME="$OLLAMA_HOME" "$OLLAMA_BIN" serve >> "$OLLAMA_HOME/oscar-ollama.log" 2>&1 &
  sleep 3
fi

MODELS=(
  llama3.2:3b gemma3:4b qwen2.5:7b mistral:7b phi3:mini
  nomic-embed-text bge-m3 moondream:1.8b llama3.1:8b qwen3:8b
  deepseek-r1:8b qwen2.5-coder:7b codegemma:7b starcoder2:7b llava:7b
  llava-llama3:8b mxbai-embed-large nemotron-mini:4b mistral-nemo:12b gemma3:12b
  qwen2.5:14b qwen3:14b phi4:14b deepseek-r1:14b qwen2.5-coder:14b
  starcoder2:15b llama3.2-vision:11b qwen2.5vl:7b
  # Big tier (skip if low on space)
  # llama3.1:70b deepseek-r1:32b qwen2.5:72b
)

for model in "${MODELS[@]}"; do
  if OLLAMA_HOST="$OLLAMA_HOST" HOME="$OLLAMA_HOME" "$OLLAMA_BIN" list 2>/dev/null | awk '{print $1}' | grep -Fxq "$model"; then
    log "[SKIP] $model"
    continue
  fi
  log "[PULL] $model"
  OLLAMA_MODELS="$OLLAMA_MODELS" OLLAMA_HOST="$OLLAMA_HOST" HOME="$OLLAMA_HOME" \
    "$OLLAMA_BIN" pull "$model" >> "$LOG" 2>&1
  if [ $? -eq 0 ]; then
    log "[OK]   $model"
  else
    log "[FAIL] $model — check log; may need more disk space"
    df -h "/Volumes/i2i 1" | tee -a "$LOG"
  fi
done

log "=== Final list $(date) ==="
OLLAMA_HOST="$OLLAMA_HOST" HOME="$OLLAMA_HOME" "$OLLAMA_BIN" list 2>&1 | tee -a "$LOG"
log "Log: $LOG"
read -r -p "Press Enter to close..."
