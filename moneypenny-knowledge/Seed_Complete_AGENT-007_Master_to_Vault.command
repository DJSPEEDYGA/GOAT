#!/bin/bash
set -euo pipefail

MASTER_SOURCE="${AGENT_007_MASTER_SOURCE:-/Volumes/1TB JUMP/AGENT-007-Thor-Master-USB-v1}"
VAULT_ROOT="${AGENT_007_VAULT_ROOT:-/Volumes/backup/AGENT-007_BACKUP_VAULT}"
DATE_STAMP="$(date '+%Y-%m-%d')"
BASELINE_ROOT="$VAULT_ROOT/Baselines/$DATE_STAMP/AGENT-007-Thor-Master-USB-v1"
MANIFEST_ROOT="$VAULT_ROOT/Manifests"
MANIFEST_FILE="$MANIFEST_ROOT/complete-master-baseline-$DATE_STAMP.txt"

if [ ! -d "$MASTER_SOURCE/Shared" ]; then
    printf 'Complete AGENT-007 transfer master not found at: %s\n' "$MASTER_SOURCE" >&2
    exit 1
fi

if [ ! -d "/Volumes/backup" ]; then
    printf 'Dedicated 2 TB backup volume is not mounted at /Volumes/backup.\n' >&2
    exit 1
fi

if [ -e "$BASELINE_ROOT" ]; then
    if [ -f "$MANIFEST_FILE" ]; then
        printf 'Verified baseline already exists and will not be overwritten:\n%s\n' "$BASELINE_ROOT" >&2
        exit 1
    fi
    printf 'Resuming interrupted baseline copy:\n%s\n' "$BASELINE_ROOT"
fi

mkdir -p "$BASELINE_ROOT" "$MANIFEST_ROOT"
printf 'Seeding complete known-good AGENT-007 master. This copies the model package and may take time.\n'
rsync -a --progress --exclude '._*' "$MASTER_SOURCE/" "$BASELINE_ROOT/"

{
    printf 'Complete AGENT-007 Master Baseline Manifest\n'
    printf 'Created: %s\n' "$DATE_STAMP"
    printf 'Source: %s\n' "$MASTER_SOURCE"
    printf 'Baseline: %s\n\n' "$BASELINE_ROOT"
    printf 'SHA-256 critical files:\n'
    shasum -a 256 \
        "$BASELINE_ROOT/Shared/FastChatUI.html" \
        "$BASELINE_ROOT/Shared/chat_server.py" \
        "$BASELINE_ROOT/Shared/chat_data/settings.json" \
        "$BASELINE_ROOT/Windows/Launch AGENT-007 on Windows 11.bat" \
        "$BASELINE_ROOT/Launch AGENT-007 for GOAT Royalty on Windows 11.bat" \
        "$BASELINE_ROOT/Thor/start-agent-007-thor.sh" \
        "$BASELINE_ROOT/Documentation/outputs/AGENT-007_Project_Record_and_Final_Deployment_Blueprint.pdf" \
        "$BASELINE_ROOT/Documentation/outputs/AGENT-007_Project_Cross_Reference_Workbook.xlsx"
} > "$MANIFEST_FILE"

printf 'Complete AGENT-007 master baseline created:\n%s\n' "$BASELINE_ROOT"
printf 'Manifest:\n%s\n' "$MANIFEST_FILE"
