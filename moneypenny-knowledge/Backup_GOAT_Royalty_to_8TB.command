#!/bin/bash
set -euo pipefail

SOURCE_ROOT="${GOAT_SOURCE_ROOT:-/Volumes/FKD1/USB-Uncensored-LLM-main}"
TARGET_VOLUME="${GOAT_TARGET_VOLUME:-/Volumes/GOAT ROYALTY APP}"
VAULT_ROOT="${GOAT_VAULT_ROOT:-$TARGET_VOLUME/GOAT_ROYALTY_BACKUP_VAULT}"
STAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
SNAPSHOT_ROOT="$VAULT_ROOT/Snapshots/$STAMP/GOAT-Royalty-Core"
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

if [ ! -d "$SOURCE_ROOT/Shared/Goat Royalty App Ultimate" ]; then
    printf 'GOAT source not found at: %s\n' "$SOURCE_ROOT/Shared/Goat Royalty App Ultimate" >&2
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

mkdir -p "$SNAPSHOT_ROOT" "$MANIFEST_ROOT" "$VAULT_ROOT/Tools"

RSYNC_EXCLUDES=(
    --exclude 'node_modules'
    --exclude '.next'
    --exclude 'dist'
    --exclude 'dist-electron'
    --exclude 'build'
    --exclude '.git'
    --exclude '._*'
    --exclude '.DS_Store'
)

printf 'Creating GOAT Royalty backup snapshot:\n%s\n\n' "$SNAPSHOT_ROOT"

rsync -a "${RSYNC_EXCLUDES[@]}" \
    "$SOURCE_ROOT/Shared/Goat Royalty App Ultimate/" \
    "$SNAPSHOT_ROOT/Shared/Goat Royalty App Ultimate/"

if [ -d "$SOURCE_ROOT/goat-royalty-portable-2.0.0" ]; then
    rsync -a "${RSYNC_EXCLUDES[@]}" \
        "$SOURCE_ROOT/goat-royalty-portable-2.0.0/" \
        "$SNAPSHOT_ROOT/goat-royalty-portable-2.0.0/"
fi

if [ -d "$SOURCE_ROOT/Super GOAT Royalty.app" ]; then
    rsync -a "${RSYNC_EXCLUDES[@]}" \
        "$SOURCE_ROOT/Super GOAT Royalty.app/" \
        "$SNAPSHOT_ROOT/Super GOAT Royalty.app/"
fi

for package in "$SOURCE_ROOT"/Super-GOAT-Royalty-2.0.0-*; do
    if [ -e "$package" ]; then
        rsync -a "$package" "$SNAPSHOT_ROOT/"
    fi
done

mkdir -p "$SNAPSHOT_ROOT/BackupVault/Money-Penny-Home"
find "$SOURCE_ROOT/BackupVault/Money-Penny-Home" -maxdepth 1 -type f \
    \( -name '*GOAT*.md' -o -name '*SECURITY*.md' -o -name '*AUDIT*.md' -o -name '*EXPOSURE*.md' \) \
    -exec rsync -a {} "$SNAPSHOT_ROOT/BackupVault/Money-Penny-Home/" \;

cp "$SOURCE_ROOT/BackupVault/GOAT-Royalty-8TB-Backup/README-GOAT-ROYALTY-8TB-BACKUP.txt" \
    "$VAULT_ROOT/README-GOAT-ROYALTY-BACKUP-VAULT.txt"
cp "$SOURCE_ROOT/BackupVault/GOAT-Royalty-8TB-Backup/Tools/Backup GOAT Royalty to 8TB.command" \
    "$VAULT_ROOT/Tools/"
chmod +x "$VAULT_ROOT/Tools/Backup GOAT Royalty to 8TB.command"

{
    printf 'GOAT Royalty Snapshot Manifest\n'
    printf 'Created: %s\n' "$STAMP"
    printf 'Source: %s\n' "$SOURCE_ROOT"
    printf 'Target volume: %s\n' "$TARGET_VOLUME"
    printf 'Snapshot: %s\n\n' "$SNAPSHOT_ROOT"
    printf 'SHA-256 critical files:\n'
    hash_if_exists \
        "$SNAPSHOT_ROOT/Shared/Goat Royalty App Ultimate/nextjs-commerce-main/api-server/server.js" \
        "$SNAPSHOT_ROOT/Shared/Goat Royalty App Ultimate/nextjs-commerce-main/web-app/js/goat-api-integrations.js" \
        "$SNAPSHOT_ROOT/Shared/Goat Royalty App Ultimate/nextjs-commerce-main/web-app/api-vault.html" \
        "$SNAPSHOT_ROOT/goat-royalty-portable-2.0.0/src/server.js" \
        "$SNAPSHOT_ROOT/Super-GOAT-Royalty-2.0.0-Portable.exe" \
        "$SNAPSHOT_ROOT/Super-GOAT-Royalty-2.0.0-Setup.exe" \
        "$SNAPSHOT_ROOT/BackupVault/Money-Penny-Home/GOAT-DISTRIBUTION-KEY-AUDIT-20260526.md"
} > "$MANIFEST_ROOT/goat-royalty-snapshot-$STAMP.txt"

printf '\nGOAT Royalty snapshot created:\n%s\n' "$SNAPSHOT_ROOT"
printf 'Manifest:\n%s\n' "$MANIFEST_ROOT/goat-royalty-snapshot-$STAMP.txt"

