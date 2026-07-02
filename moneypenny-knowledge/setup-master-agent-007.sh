#!/bin/bash
# Master AGENT-007 training hub for FKD1 meeting
set -euo pipefail

RO="/Volumes/FKD1/Raspy-AGENT-007"
MO="$RO/Master-AGENT-007"
STAMP="$(date +%Y-%m-%d)"

mkdir -p "$MO"/{Models,Marketing,Drive-Intake,Training-Corpus,Meeting-"$STAMP",Scripts,Logs}

# Symlinks to live stores (no duplicate data)
ln -sfn "../Shared/models" "$MO/Models"
ln -sfn "../BackupVault/AGENT-007-Studio/Marketing" "$MO/Marketing"
ln -sfn "../BackupVault/AGENT-007-Studio/Drive-Intake" "$MO/Drive-Intake" 2>/dev/null || mkdir -p "$MO/Drive-Intake"
ln -sfn "../config" "$MO/config"
ln -sfn "../Shared" "$MO/Shared-runtime"
ln -sfn "../Training/Fine-Tune-LLMs" "$MO/Training-Corpus"

# Mac intake staging copy when present
if [ -d "/Users/raspy/agent-007-drive-intake" ]; then
  rsync -a --ignore-existing "/Users/raspy/agent-007-drive-intake/" "$MO/Drive-Intake/staging-mac/" 2>/dev/null || true
fi

cat > "$MO/README-MEETING-START-HERE.txt" <<README
MASTER AGENT-007 — FKD1 Training Hub
================================
Meeting: $STAMP

START AGENT-007:
  Double-click: ../Launch Raspy AGENT-007.command
  Browser: http://localhost:3333
  Skill: Marketing

THIS FOLDER:
  Models/           -> Shared/models (GGUF + ollama_data) — download 27 LLMs here
  Marketing/        -> Drive finalize docs + manifests
  Drive-Intake/     -> Google Drive batch exports
  Training-Corpus/  -> Fine-tune course + installers
  Shared-runtime/   -> chat server, chat_data, tools
  Meeting-$STAMP/   -> today's notes and agenda

SPACE:
  Duplicates-Review/  — YOU delete after verifying (not auto-deleted)
  Archive/            — old USB bundles (safe to prune after review)

27 LLM DOWNLOAD TARGET:
  $RO/Shared/models/
  OLLAMA_MODELS=$RO/Shared/models/ollama_data

ENV: source $RO/config/agent-007-fkd1.env
README

cat > "$MO/START-TRAINING.command" <<'CMD'
#!/bin/bash
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
[ -f "$ROOT/config/agent-007-fkd1.env" ] && source "$ROOT/config/agent-007-fkd1.env"
open "$ROOT/Master-AGENT-007/README-MEETING-START-HERE.txt"
exec "$ROOT/Launch Raspy AGENT-007.command"
CMD
chmod +x "$MO/START-TRAINING.command"

cat > "$MO/Meeting-$STAMP/AGENDA.txt" <<AGENDA
Big Meeting — Master AGENT-007
==========================
1. Launch AGENT-007 (Marketing skill) — prove local chat + tools
2. Review Marketing/ finalize playbook + drive-intake-summary
3. Confirm Models/ space for 27 LLM pulls (check df -h /Volumes/FKD1)
4. Delete Duplicates-Review/ after you verify paths
5. Pro Tools recording-engineer test session (training corpus)
AGENDA

echo "Master-AGENT-007 ready at $MO"