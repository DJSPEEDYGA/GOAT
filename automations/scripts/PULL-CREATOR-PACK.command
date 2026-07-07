#!/bin/bash
set -u
cd "/Volumes/FKD1/Raspy-Oscar"
source "./config/oscar-fkd1.env"
export OSCAR_ROOT="/Volumes/FKD1/Raspy-Oscar"
export PATH="/Volumes/FKD1/Raspy-Oscar/Shared/bin:$PATH"
OLLAMA_BIN="/Volumes/FKD1/Raspy-Oscar/Shared/bin/ollama-darwin"
LOG="/Volumes/FKD1/Raspy-Oscar/Shared/model_packs/logs/creator-pack-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$(dirname "$LOG")" "$OLLAMA_HOME/runners" "$OLLAMA_TMPDIR"

echo "FKD1 free space:" | tee "$LOG"
df -h /Volumes/FKD1 | tee -a "$LOG"
echo "" | tee -a "$LOG"

if ! curl -fsS --max-time 5 http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  echo "Starting FKD1 Ollama..." | tee -a "$LOG"
  HOME="$OLLAMA_HOME" "$OLLAMA_BIN" serve >> "$OLLAMA_HOME/oscar-ollama.log" 2>&1 &
  for _ in $(seq 1 60); do
    curl -fsS --max-time 5 http://127.0.0.1:11434/api/tags >/dev/null 2>&1 && break
    sleep 1
  done
fi

# gemma-heretic-local GGUF is truncated on disk — skip until re-downloaded
echo "Skipping gemma-heretic-local (truncated GGUF — replace file first)" | tee -a "$LOG"

echo "Pulling creator pack (28 models)..." | tee -a "$LOG"
OSCAR_ROOT="$OSCAR_ROOT" OLLAMA_MODELS="$OLLAMA_MODELS" OLLAMA_HOST="$OLLAMA_HOST" \
  bash -c '
    export OLLAMA_MODELS="'"$OLLAMA_MODELS"'"
    export OLLAMA_HOST="'"$OLLAMA_HOST"'"
    export OLLAMA_HOME="'"$OLLAMA_HOME"'"
    export OLLAMA_TMPDIR="'"$OLLAMA_TMPDIR"'"
    export OLLAMA_RUNNERS_DIR="'"$OLLAMA_RUNNERS_DIR"'"
    export OSCAR_ROOT="'"$OSCAR_ROOT"'"
    # Force FKD1 ollama by prepending to PATH and aliasing via function override in subshell
    pull_one() {
      local m="$1"
      if '"$OLLAMA_BIN"' list 2>/dev/null | awk "{print \$1}" | grep -Fxq "$m"; then
        echo "[SKIP] $m"
        return 0
      fi
      echo "[PULL] $m"
      HOME="'"$OLLAMA_HOME"'" '"$OLLAMA_BIN"' pull "$m" || echo "[FAIL] $m"
    }
    while IFS= read -r model; do
      [ -n "$model" ] || continue
      pull_one "$model"
    done <<'"'"'MODELS'"'"'
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
MODELS
  ' 2>&1 | tee -a "$LOG"

echo "" | tee -a "$LOG"
echo "Installed models:" | tee -a "$LOG"
HOME="$OLLAMA_HOME" "$OLLAMA_BIN" list 2>&1 | tee -a "$LOG"
echo "Log: $LOG"
read -r -p "Press Enter to close..."