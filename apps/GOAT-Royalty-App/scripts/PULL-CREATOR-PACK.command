#!/bin/bash
# GOAT Force Creator Pack — pull 28 models to i2i 1 drive
# Fixed from FKD1 version — uses correct paths + port 11435
set -u

OSCAR_ROOT="/Volumes/i2i 1/Agent-007-GOAT"
OLLAMA_MODELS="$OSCAR_ROOT/Shared/models/ollama_data"
OLLAMA_HOME="/Users/be100radio/Library/Application Support/Agent007Runtime/ollama"
OLLAMA_RUNNERS_DIR="$OLLAMA_HOME/runners"
OLLAMA_TMPDIR="$OLLAMA_HOME/tmp"
OLLAMA_HOST="127.0.0.1:11435"
OLLAMA_API="http://$OLLAMA_HOST"
LOG="$OSCAR_ROOT/Shared/model_packs/logs/creator-pack-$(date +%Y%m%d-%H%M%S).log"

mkdir -p "$(dirname "$LOG")" "$OLLAMA_HOME/runners" "$OLLAMA_TMPDIR"

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
  echo "ERROR: ollama not found. Run: brew install ollama" | tee -a "$LOG"
  read -r -p "Press Enter to close..."
  exit 1
fi

echo "i2i 1 free space:" | tee "$LOG"
df -h "/Volumes/i2i 1" | tee -a "$LOG"
echo "" | tee -a "$LOG"

# Start Ollama if not running
if ! curl -fsS --max-time 5 "$OLLAMA_API/api/tags" >/dev/null 2>&1; then
  echo "Starting Ollama on :11435..." | tee -a "$LOG"
  export OLLAMA_MODELS OLLAMA_HOST OLLAMA_RUNNERS_DIR OLLAMA_TMPDIR OLLAMA_ORIGINS="*" OLLAMA_NO_PRUNE=1
  HOME="$OLLAMA_HOME" "$OLLAMA_BIN" serve >> "$OLLAMA_HOME/oscar-ollama.log" 2>&1 &
  for _ in $(seq 1 60); do
    curl -fsS --max-time 5 "$OLLAMA_API/api/tags" >/dev/null 2>&1 && break
    sleep 1
  done
fi

echo "Pulling GOAT Force creator pack (28 models)..." | tee -a "$LOG"

pull_one() {
  local m="$1"
  if OLLAMA_HOST="$OLLAMA_HOST" HOME="$OLLAMA_HOME" "$OLLAMA_BIN" list 2>/dev/null | awk '{print $1}' | grep -Fxq "$m"; then
    echo "[SKIP] $m" | tee -a "$LOG"
    return 0
  fi
  echo "[PULL] $m" | tee -a "$LOG"
  OLLAMA_MODELS="$OLLAMA_MODELS" OLLAMA_HOST="$OLLAMA_HOST" HOME="$OLLAMA_HOME" \
    "$OLLAMA_BIN" pull "$m" 2>&1 | tee -a "$LOG" \
    && echo "[OK]   $m" | tee -a "$LOG" \
    || echo "[FAIL] $m" | tee -a "$LOG"
}

# 28-model creator pack
MODELS=(
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

for model in "${MODELS[@]}"; do
  pull_one "$model"
done

echo "" | tee -a "$LOG"
echo "=== Installed models ===" | tee -a "$LOG"
OLLAMA_HOST="$OLLAMA_HOST" HOME="$OLLAMA_HOME" "$OLLAMA_BIN" list 2>&1 | tee -a "$LOG"
echo "Log: $LOG"
read -r -p "Press Enter to close..."
