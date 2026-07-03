#!/bin/bash
set -euo pipefail

SOURCE_ROOT="${AGENT_007_SOURCE_ROOT:-/Volumes/FKD1/USB-Uncensored-LLM-main}"
VAULT_ROOT="${AGENT_007_VAULT_ROOT:-/Volumes/backup/AGENT-007_BACKUP_VAULT}"
STAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
SNAPSHOT_ROOT="$VAULT_ROOT/Snapshots/$STAMP/Original-AGENT-007-Core"
MANIFEST_ROOT="$VAULT_ROOT/Manifests"

if [ ! -d "$SOURCE_ROOT/Shared" ]; then
    printf 'AGENT-007 source not found at: %s\n' "$SOURCE_ROOT" >&2
    exit 1
fi

if [ ! -d "/Volumes/backup" ]; then
    printf 'Dedicated 2 TB backup volume is not mounted at /Volumes/backup.\n' >&2
    exit 1
fi

mkdir -p "$SNAPSHOT_ROOT/Shared" "$MANIFEST_ROOT"

rsync -a "$SOURCE_ROOT/Shared/FastChatUI.html" "$SOURCE_ROOT/Shared/chat_server.py" "$SNAPSHOT_ROOT/Shared/"
rsync -a "$SOURCE_ROOT/Shared/chat_data/" "$SNAPSHOT_ROOT/Shared/chat_data/"
rsync -a "$SOURCE_ROOT/Shared/agent-007_drafts/" "$SNAPSHOT_ROOT/Shared/agent-007_drafts/"
rsync -a \
    "$SOURCE_ROOT/Launch AGENT-007.command" \
    "$SOURCE_ROOT/Launch AGENT-007 for GOAT Royalty.command" \
    "$SOURCE_ROOT/Launch AGENT-007 on Windows 11.bat" \
    "$SOURCE_ROOT/Launch AGENT-007 for GOAT Royalty on Windows 11.bat" \
    "$SOURCE_ROOT/README-AGENT-007-Launcher.txt" \
    "$SNAPSHOT_ROOT/"

for folder in Mac Windows Linux Thor Documentation BackupVault Workspace; do
    if [ -d "$SOURCE_ROOT/$folder" ]; then
        rsync -a --exclude 'tools/node_modules' --exclude '._*' "$SOURCE_ROOT/$folder/" "$SNAPSHOT_ROOT/$folder/"
    fi
done

GOAT_HOME="$SOURCE_ROOT/Shared/Goat Royalty App Ultimate/nextjs-commerce-main"
if [ -d "$GOAT_HOME/web-app" ]; then
    mkdir -p "$SNAPSHOT_ROOT/Shared/Goat Royalty App Ultimate/nextjs-commerce-main/web-app"
    rsync -a "$GOAT_HOME/AGENT-007-HOME.md" "$SNAPSHOT_ROOT/Shared/Goat Royalty App Ultimate/nextjs-commerce-main/"
    rsync -a \
        "$GOAT_HOME/web-app/agents.html" \
        "$GOAT_HOME/web-app/usb-ai.html" \
        "$SNAPSHOT_ROOT/Shared/Goat Royalty App Ultimate/nextjs-commerce-main/web-app/"
fi

{
    printf 'AGENT-007 Core Snapshot Manifest\n'
    printf 'Created: %s\n' "$STAMP"
    printf 'Source: %s\n' "$SOURCE_ROOT"
    printf 'Snapshot: %s\n\n' "$SNAPSHOT_ROOT"
    printf 'SHA-256 critical files:\n'
    shasum -a 256 \
        "$SNAPSHOT_ROOT/Shared/FastChatUI.html" \
        "$SNAPSHOT_ROOT/Shared/chat_server.py" \
        "$SNAPSHOT_ROOT/Shared/chat_data/settings.json" \
        "$SNAPSHOT_ROOT/Windows/Launch AGENT-007 on Windows 11.bat" \
        "$SNAPSHOT_ROOT/Launch AGENT-007 for GOAT Royalty on Windows 11.bat" \
        "$SNAPSHOT_ROOT/Thor/build-master-on-mac.sh" \
        "$SNAPSHOT_ROOT/Documentation/outputs/AGENT-007_Project_Record_and_Final_Deployment_Blueprint.pdf" \
        "$SNAPSHOT_ROOT/Documentation/outputs/AGENT-007_Project_Cross_Reference_Workbook.xlsx"
} > "$MANIFEST_ROOT/core-snapshot-$STAMP.txt"

printf 'AGENT-007 core snapshot created:\n%s\n' "$SNAPSHOT_ROOT"
printf 'Manifest:\n%s\n' "$MANIFEST_ROOT/core-snapshot-$STAMP.txt"
