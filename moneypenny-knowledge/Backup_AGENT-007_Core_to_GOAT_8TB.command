#!/bin/bash
set -euo pipefail

SOURCE_ROOT="${AGENT_007_SOURCE_ROOT:-/Volumes/FKD1/USB-Uncensored-LLM-main}"
TARGET_VOLUME="${AGENT_007_TARGET_VOLUME:-/Volumes/GOAT ROYALTY APP}"
VAULT_ROOT="${AGENT_007_VAULT_ROOT:-$TARGET_VOLUME/AGENT-007_BACKUP_VAULT}"
STAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
SNAPSHOT_ROOT="$VAULT_ROOT/Snapshots/$STAMP/Original-AGENT-007-Core"
MANIFEST_ROOT="$VAULT_ROOT/Manifests"

hash_if_exists() {
    for item in "$@"; do
        if [ -e "$item" ]; then
            shasum -a 256 "$item"
        else
            printf 'MISSING  %s\n' "$item"
        fi
    done
}

if [ ! -d "$SOURCE_ROOT/Shared" ]; then
    printf 'AGENT-007 source not found at: %s\n' "$SOURCE_ROOT" >&2
    exit 1
fi

if [ ! -d "$TARGET_VOLUME" ]; then
    printf 'GOAT 8 TB target volume is not mounted at: %s\n' "$TARGET_VOLUME" >&2
    exit 1
fi

if ! mkdir -p "$VAULT_ROOT/.write-test" 2>/dev/null; then
    printf 'Cannot write to target volume: %s\n' "$TARGET_VOLUME" >&2
    printf 'The drive is likely mounted read-only. On this Mac it appears to be NTFS.\n' >&2
    printf 'Mount it writable or reformat it to exFAT/APFS, then run this script again.\n' >&2
    exit 2
fi
rmdir "$VAULT_ROOT/.write-test" 2>/dev/null || true

mkdir -p "$SNAPSHOT_ROOT/Shared" "$MANIFEST_ROOT" "$VAULT_ROOT/Tools"

rsync -a "$SOURCE_ROOT/Shared/FastChatUI.html" "$SOURCE_ROOT/Shared/chat_server.py" "$SNAPSHOT_ROOT/Shared/"

if [ -d "$SOURCE_ROOT/Shared/chat_data" ]; then
    rsync -a "$SOURCE_ROOT/Shared/chat_data/" "$SNAPSHOT_ROOT/Shared/chat_data/"
fi

if [ -d "$SOURCE_ROOT/Shared/agent-007_drafts" ]; then
    rsync -a "$SOURCE_ROOT/Shared/agent-007_drafts/" "$SNAPSHOT_ROOT/Shared/agent-007_drafts/"
fi

for item in "Launch AGENT-007.command" "README-AGENT-007-Launcher.txt" "Launch AGENT-007 for GOAT Royalty.command" "Launch AGENT-007 for GOAT Royalty on Windows 11.bat"; do
    if [ -e "$SOURCE_ROOT/$item" ]; then
        rsync -a "$SOURCE_ROOT/$item" "$SNAPSHOT_ROOT/"
    fi
done

for folder in Mac Windows Linux Thor Documentation BackupVault ClientDeploy Workspace; do
    if [ -d "$SOURCE_ROOT/$folder" ]; then
        rsync -a \
            --exclude 'node_modules' \
            --exclude '.git' \
            --exclude '._*' \
            --exclude '.DS_Store' \
            "$SOURCE_ROOT/$folder/" \
            "$SNAPSHOT_ROOT/$folder/"
    fi
done

cat > "$VAULT_ROOT/README-AGENT-007-BACKUP-VAULT.txt" <<'README'
AGENT-007 BACKUP VAULT ON GOAT 8 TB
===============================

Purpose
-------
This is a companion AGENT-007 recovery vault stored on the GOAT Royalty 8 TB drive.
It is a dated snapshot vault, not a destructive mirror.

Restore Rule
------------
Restore from a dated snapshot only after identifying what failed. Never copy a
damaged live source over known-good backups.
README

cp "$SOURCE_ROOT/BackupVault/GOAT-Royalty-8TB-Backup/Tools/Backup AGENT-007 Core to GOAT 8TB.command" \
    "$VAULT_ROOT/Tools/"
chmod +x "$VAULT_ROOT/Tools/Backup AGENT-007 Core to GOAT 8TB.command"

{
    printf 'AGENT-007 Core Snapshot Manifest - GOAT 8 TB Companion\n'
    printf 'Created: %s\n' "$STAMP"
    printf 'Source: %s\n' "$SOURCE_ROOT"
    printf 'Target volume: %s\n' "$TARGET_VOLUME"
    printf 'Snapshot: %s\n\n' "$SNAPSHOT_ROOT"
    printf 'SHA-256 critical files:\n'
    hash_if_exists \
        "$SNAPSHOT_ROOT/Shared/FastChatUI.html" \
        "$SNAPSHOT_ROOT/Shared/chat_server.py" \
        "$SNAPSHOT_ROOT/Shared/chat_data/settings.json" \
        "$SNAPSHOT_ROOT/Thor/build-master-on-mac.sh" \
        "$SNAPSHOT_ROOT/Documentation/outputs/AGENT-007_Project_Record_and_Final_Deployment_Blueprint.pdf" \
        "$SNAPSHOT_ROOT/Documentation/outputs/AGENT-007_Project_Cross_Reference_Workbook.xlsx" \
        "$SNAPSHOT_ROOT/BackupVault/Money-Penny-Home/GOAT-DISTRIBUTION-KEY-AUDIT-20260526.md"
} > "$MANIFEST_ROOT/agent-007-core-snapshot-$STAMP.txt"

printf 'AGENT-007 companion snapshot created:\n%s\n' "$SNAPSHOT_ROOT"
printf 'Manifest:\n%s\n' "$MANIFEST_ROOT/agent-007-core-snapshot-$STAMP.txt"

