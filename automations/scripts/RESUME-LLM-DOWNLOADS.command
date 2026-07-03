#!/bin/bash
# Lean resume script — one model at a time, minimal forks.
set +e
cd "/Volumes/FKD1/Raspy-Oscar"
source "./config/oscar-fkd1.env"
OLLAMA="/Volumes/FKD1/Raspy-Oscar/Shared/bin/ollama-darwin"
LOG="/Volumes/FKD1/Raspy-Oscar/Shared/model_packs/logs/resume-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$(dirname "$LOG")" "$OLLAMA_HOME/runners" "$OLLAMA_TMPDIR"

log() { echo "$1" | tee -a "$LOG"; }

log "=== Resume LLM downloads $(date) ==="
df -h /Volumes/FKD1 | tee -a "$LOG"
log "NOTE: gemma-heretic-local skipped (truncated GGUF on disk)"

if ! curl -fsS --max-time 5 http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  log "Starting Ollama..."
  HOME="$OLLAMA_HOME" "$OLLAMA" serve >> "$OLLAMA_HOME/oscar-ollama.log" 2>&1 &
  sleep 3
fi

MODELS=(
  llama3.2:3b gemma3:4b qwen2.5:7b mistral:7b phi3:mini
  nomic-embed-text bge-m3 moondream:1.8b llama3.1:8b qwen3:8b
  deepseek-r1:8b qwen2.5-coder:7b codegemma:7b starcoder2:7b llava:7b
  llava-llama3:8b mxbai-embed-large nemotron-mini:4b mistral-nemo:12b gemma3:12b
  qwen2.5:14b qwen3:14b phi4:14b deepseek-r1:14b qwen2.5-coder:14b
  starcoder2:15b llama3.2-vision:11b qwen2.5vl:7b
)

for model in "${MODELS[@]}"; do
  if HOME="$OLLAMA_HOME" "$OLLAMA" list 2>/dev/null | awk '{print $1}' | grep -Fxq "$model"; then
    log "[SKIP] $model"
    continue
  fi
  log "[PULL] $model"
  HOME="$OLLAMA_HOME" "$OLLAMA" pull "$model" >>"$LOG" 2>&1
  if [ $? -eq 0 ]; then
    log "[OK] $model"
  else
    log "[FAIL] $model — check log; may need more disk space"
    df -h /Volumes/FKD1 | tee -a "$LOG"
  fi
done

log "=== Final list $(date) ==="
HOME="$OLLAMA_HOME" "$OLLAMA" list 2>&1 | tee -a "$LOG"
log "Log: $LOG"
read -r -p "Press Enter to close..."