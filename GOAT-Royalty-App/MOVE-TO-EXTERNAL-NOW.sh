#!/bin/bash
# ============================================================================
# MOVE-TO-EXTERNAL-NOW.sh
# Move existing Docker/Ollama/HF data to external drive + redirect future downloads
# ============================================================================
# Use when your server is FULL and you want to relocate + continue downloads
# on an external drive.
#
# Usage:
#   1. Plug in external drive
#   2. Run: sudo bash MOVE-TO-EXTERNAL-NOW.sh
#      (interactive — it'll find the drive and walk you through it)
# ============================================================================

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🚚 MOVE EVERYTHING TO EXTERNAL DRIVE + FREE SERVER        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

[ "$EUID" -ne 0 ] && { echo "❌ Must run as root (sudo)"; exit 1; }

# ============================================================================
# STEP 0: Current disk usage
# ============================================================================
echo "📊 Current server disk usage:"
df -h / | head -2
echo ""
echo "🐳 Docker is using:"
du -sh /var/lib/docker 2>/dev/null || echo "   (no Docker data found)"
echo ""

# ============================================================================
# STEP 1: Find the external drive
# ============================================================================
echo "💾 Detecting drives..."
echo ""
lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT,LABEL,TYPE | grep -v "loop\|ram"
echo ""

# Find likely external: partitions not mounted, or mounted somewhere unusual
echo "🔍 Candidates (unmounted partitions):"
CANDIDATES=$(lsblk -rno NAME,SIZE,MOUNTPOINT,TYPE | awk '$4=="part" && $3=="" {print "/dev/"$1"  "$2}')
echo "$CANDIDATES"
echo ""

read -p "📝 Enter the external drive partition (e.g. /dev/sdb1): " DEVICE
if [ ! -b "$DEVICE" ]; then
    echo "❌ $DEVICE is not a block device"
    exit 1
fi

SIZE=$(lsblk -rno SIZE "$DEVICE" | head -1)
echo ""
echo "Selected: $DEVICE ($SIZE)"
read -p "Continue? [y/N]: " OK
[ "$OK" != "y" ] && [ "$OK" != "Y" ] && { echo "Aborted"; exit 1; }

MOUNT_POINT="/mnt/ai-storage"

# ============================================================================
# STEP 2: Check filesystem
# ============================================================================
FSTYPE=$(blkid -s TYPE -o value "$DEVICE" 2>/dev/null || echo "")
echo ""
echo "💽 Filesystem on $DEVICE: ${FSTYPE:-<none>}"

if [ -z "$FSTYPE" ] || [ "$FSTYPE" = "ntfs" ] || [ "$FSTYPE" = "exfat" ]; then
    echo "⚠️  Not ext4 — Docker needs Linux FS. Recommend formatting as ext4."
    read -p "Format $DEVICE as ext4? THIS ERASES THE DRIVE. Type YES: " FMT
    if [ "$FMT" = "YES" ]; then
        umount "$DEVICE" 2>/dev/null || true
        mkfs.ext4 -F -L ai-storage "$DEVICE"
        echo "✅ Formatted as ext4"
    fi
fi

# ============================================================================
# STEP 3: Mount + persist
# ============================================================================
echo ""
echo "🔌 Mounting $DEVICE at $MOUNT_POINT..."
mkdir -p "$MOUNT_POINT"
mountpoint -q "$MOUNT_POINT" || mount "$DEVICE" "$MOUNT_POINT"
df -h "$MOUNT_POINT" | tail -1

UUID=$(blkid -s UUID -o value "$DEVICE")
if ! grep -q "$UUID" /etc/fstab; then
    echo "UUID=$UUID $MOUNT_POINT ext4 defaults,nofail 0 2" >> /etc/fstab
    echo "✅ Added to /etc/fstab"
fi

mkdir -p "$MOUNT_POINT"/{docker,ollama,huggingface,cache}

# ============================================================================
# STEP 4: Clean up failed pulls FIRST (frees space for the move)
# ============================================================================
echo ""
echo "🧹 Cleaning up Docker partial/failed pulls to free server space..."
docker system prune -a -f 2>&1 | tail -3 || true
echo ""
echo "📊 Disk usage AFTER cleanup:"
df -h / | tail -1
echo ""

# ============================================================================
# STEP 5: Stop Docker + MIGRATE to external drive
# ============================================================================
echo "🛑 Stopping Docker to migrate data..."
systemctl stop docker docker.socket 2>/dev/null || true
sleep 2

if [ -d /var/lib/docker ] && [ "$(ls -A /var/lib/docker 2>/dev/null)" ]; then
    DSIZE=$(du -sh /var/lib/docker 2>/dev/null | awk '{print $1}')
    echo "🚚 Migrating $DSIZE of Docker data to external drive..."
    echo "   (This may take a while depending on size)"
    rsync -aH --info=progress2 /var/lib/docker/ "$MOUNT_POINT/docker/"
    mv /var/lib/docker "/var/lib/docker.OLD-BACKUP-$(date +%s)"
    echo "✅ Docker data migrated"
fi

# Configure Docker daemon
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << EOF
{
  "data-root": "$MOUNT_POINT/docker",
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
EOF

systemctl start docker
sleep 3
NEW_ROOT=$(docker info 2>/dev/null | grep "Docker Root Dir" | awk '{print $NF}')
echo "✅ Docker now running from: $NEW_ROOT"

# ============================================================================
# STEP 6: Move Ollama if installed
# ============================================================================
if systemctl list-unit-files 2>/dev/null | grep -q ollama; then
    echo ""
    echo "🤖 Migrating Ollama models to external drive..."
    systemctl stop ollama 2>/dev/null || true
    sleep 2

    for OLLAMA_PATH in /usr/share/ollama/.ollama /root/.ollama "$HOME/.ollama"; do
        if [ -d "$OLLAMA_PATH" ] && [ "$(ls -A "$OLLAMA_PATH" 2>/dev/null)" ]; then
            echo "   Moving from $OLLAMA_PATH..."
            rsync -aH --info=progress2 "$OLLAMA_PATH/" "$MOUNT_POINT/ollama/"
            break
        fi
    done

    mkdir -p /etc/systemd/system/ollama.service.d
    cat > /etc/systemd/system/ollama.service.d/override.conf << EOF
[Service]
Environment="OLLAMA_MODELS=$MOUNT_POINT/ollama"
Environment="OLLAMA_HOST=0.0.0.0:11434"
EOF
    systemctl daemon-reload
    systemctl start ollama
    echo "✅ Ollama → $MOUNT_POINT/ollama"
fi

# ============================================================================
# STEP 7: Set global env vars for HuggingFace + cache
# ============================================================================
cat > /etc/profile.d/ai-storage.sh << EOF
export HF_HOME="$MOUNT_POINT/huggingface"
export TRANSFORMERS_CACHE="$MOUNT_POINT/huggingface"
export HUGGINGFACE_HUB_CACHE="$MOUNT_POINT/huggingface"
export TORCH_HOME="$MOUNT_POINT/cache/torch"
export XDG_CACHE_HOME="$MOUNT_POINT/cache"
export OLLAMA_MODELS="$MOUNT_POINT/ollama"
EOF
chmod 644 /etc/profile.d/ai-storage.sh
# shellcheck source=/dev/null
source /etc/profile.d/ai-storage.sh

# ============================================================================
# STEP 8: Delete the old Docker backup (it's HUGE)
# ============================================================================
echo ""
echo "🗑️  Ready to delete old Docker data from server (save $DSIZE)..."
read -p "Delete /var/lib/docker.OLD-BACKUP-* ? [y/N]: " DELOLD
if [ "$DELOLD" = "y" ] || [ "$DELOLD" = "Y" ]; then
    rm -rf /var/lib/docker.OLD-BACKUP-*
    echo "✅ Old backup deleted"
else
    echo "ℹ️  Keeping backup at /var/lib/docker.OLD-BACKUP-* (delete manually when ready)"
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ EVERYTHING MOVED TO EXTERNAL DRIVE                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Server disk NOW:"
df -h / | tail -1
echo ""
echo "📊 External drive usage:"
df -h "$MOUNT_POINT" | tail -1
echo ""
echo "🐳 Docker root: $(docker info 2>/dev/null | grep 'Docker Root Dir' | awk '{print $NF}')"
echo "🤖 Ollama models: $MOUNT_POINT/ollama"
echo "🤗 HuggingFace: $MOUNT_POINT/huggingface"
echo ""
echo "▶️  RESUME DOWNLOADS (now pull directly to external):"
echo "   curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/NVIDIA-SMART-DOWNLOAD.sh | bash"
echo ""
echo "⚠️  IMPORTANT: Open a new SSH session OR run 'source /etc/profile.d/ai-storage.sh'"
echo "   so the environment vars (HF_HOME etc.) take effect."