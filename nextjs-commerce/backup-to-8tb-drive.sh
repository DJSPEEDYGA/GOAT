#!/bin/bash

# Backup Script for GOAT Royalty App to 8TB Drive
# Run this to backup the entire project

BACKUP_SOURCE="/workspace/nextjs-commerce"
BACKUP_DEST="/mnt/8tb-drive/goat-royalty-backup"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting backup to 8TB drive..."
echo "Source: $BACKUP_SOURCE"
echo "Destination: $BACKUP_DEST"

# Create backup directory
mkdir -p "$BACKUP_DEST/$DATE"

# Backup complete project
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'desktop-builds' \
    "$BACKUP_SOURCE/" \
    "$BACKUP_DEST/$DATE/"

# Backup installer directory
if [ -d "/workspace/nextjs-commerce/installers/final" ]; then
    mkdir -p "$BACKUP_DEST/installers"
    cp -r "/workspace/nextjs-commerce/installers/final/"* "$BACKUP_DEST/installers/"
fi

echo "✅ Backup completed to $BACKUP_DEST/$DATE"

# Create backup summary
cat > "$BACKUP_DEST/LATEST-BACKUP.txt" << EOTXT
Latest Backup: $DATE
Source: $BACKUP_SOURCE
Destination: $BACKUP_DEST
Date: $(date)

Backup Contents:
- Complete source code
- All HTML pages
- Backend API routes
- Installers
- Documentation
EOTXT

echo "Backup summary written to $BACKUP_DEST/LATEST-BACKUP.txt"
