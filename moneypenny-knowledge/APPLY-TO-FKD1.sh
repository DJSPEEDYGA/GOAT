#!/bin/bash
# Apply staged Drive exports into the local AGENT-007 drive.
set -euo pipefail
AGENT_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
STAGING="$HOME/agent-007-drive-intake"
if [[ ! -f "$AGENT_ROOT/Shared/chat_server.py" ]]; then
  echo "ERROR: AGENT-007 root not found — expected $AGENT_ROOT"
  exit 2
fi
echo "Copying batch3 exports to AGENT-007..."
mkdir -p "$AGENT_ROOT/BackupVault/AGENT-007-Studio/Drive-Intake/raw"
mkdir -p "$AGENT_ROOT/BackupVault/AGENT-007-Studio/Marketing"
mkdir -p "$AGENT_ROOT/BackupVault/AGENT-007-Studio/Drive-Intake/incoming/batch3"
cp -v "$STAGING/raw/"*.txt "$AGENT_ROOT/BackupVault/AGENT-007-Studio/Drive-Intake/raw/" 2>/dev/null || true
cp -v "$STAGING/batch3-urls.txt" "$AGENT_ROOT/BackupVault/AGENT-007-Studio/Marketing/"
cp -v "$STAGING/manifests/drive-batch3-manifest.json" "$AGENT_ROOT/BackupVault/AGENT-007-Studio/Marketing/"
if [[ -f "$AGENT_ROOT/Shared/runtime/import-drive-finalize-manifest.py" ]]; then
  python3 "$AGENT_ROOT/Shared/runtime/import-drive-finalize-manifest.py" \
    --merge-url-file "$AGENT_ROOT/BackupVault/AGENT-007-Studio/Marketing/batch3-urls.txt" \
    --batch-label batch3-2026-06
  python3 "$AGENT_ROOT/Shared/runtime/import-drive-finalize-manifest.py" --sync-raw
  python3 "$AGENT_ROOT/Shared/runtime/import-drive-finalize-manifest.py" --build-summary
fi
echo "Done. Open AGENT-007 → Skill Marketing → ask about drive-intake-summary-for-agent-007.txt"
