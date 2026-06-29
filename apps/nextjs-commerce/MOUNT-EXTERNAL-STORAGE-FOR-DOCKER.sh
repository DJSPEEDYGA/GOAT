#!/bin/bash
# ============================================================
# MOUNT EXTERNAL STORAGE FOR DOCKER/NVIDIA MODELS
# Point Docker data-root at your external drive so pulls go there
# ============================================================
# Run AFTER physically attaching the drive. Usage:
#   sudo bash MOUNT-EXTERNAL-STORAGE-FOR-DOCKER.sh /dev/sdb1 /mnt/storage
# ============================================================

set -e

DEVICE="${1:-}"
MOUNT_POINT="${2:-/mnt/storage}"

if [ -z "$DEVICE" ]; then
    echo "📋 Available drives:"
    lsblk -f
    echo ""
    echo "Usage: sudo bash $0 <device> [mount_point]"
    echo "Example: sudo bash $0 /dev/sdb1 /mnt/storage"
    exit 0
fi

echo "╔════════════════════════════════════════════════════╗"
echo "║  🔌 Mount External Storage for Docker + NVIDIA     ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# 1. Mount the drive
echo "📀 [1/5] Mounting $DEVICE at $MOUNT_POINT..."
mkdir -p "$MOUNT_POINT"
mount "$DEVICE" "$MOUNT_POINT" 2>/dev/null || echo "   (may already be mounted)"
df -h "$MOUNT_POINT"

# 2. Persist in /etc/fstab
echo ""
echo "📝 [2/5] Persisting mount in /etc/fstab..."
UUID=$(blkid -s UUID -o value "$DEVICE")
if ! grep -q "$UUID" /etc/fstab; then
    echo "UUID=$UUID $MOUNT_POINT ext4 defaults,nofail 0 2" >> /etc/fstab
    echo "   ✅ Added to fstab (UUID=$UUID)"
else
    echo "   ✅ Already in fstab"
fi

# 3. Stop Docker
echo ""
echo "🛑 [3/5] Stopping Docker..."
systemctl stop docker docker.socket 2>/dev/null || true
sleep 2

# 4. Move Docker data + reconfigure
echo ""
echo "🚚 [4/5] Moving Docker data to $MOUNT_POINT/docker..."
mkdir -p "$MOUNT_POINT/docker"
if [ -d /var/lib/docker ] && [ "$(ls -A /var/lib/docker 2>/dev/null)" ]; then
    rsync -aP /var/lib/docker/ "$MOUNT_POINT/docker/" 2>&1 | tail -5
    mv /var/lib/docker /var/lib/docker.old.$(date +%s) 2>/dev/null || rm -rf /var/lib/docker
fi

# Configure Docker to use new location
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << EOF
{
  "data-root": "$MOUNT_POINT/docker",
  "storage-driver": "overlay2"
}
EOF
echo "   ✅ Docker configured: data-root = $MOUNT_POINT/docker"

# 5. Restart Docker
echo ""
echo "🚀 [5/5] Starting Docker..."
systemctl start docker
sleep 3
docker info 2>/dev/null | grep -E "Docker Root Dir|Storage Driver" || true

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║  ✅ EXTERNAL STORAGE READY FOR NVIDIA PULLS        ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "💾 Available space on Docker volume:"
df -h "$MOUNT_POINT" | tail -1
echo ""
echo "▶️  Now run the NVIDIA pull:"
echo "   curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/NVIDIA-SMART-DOWNLOAD.sh | bash"
echo ""
echo "🧪 Verify Docker is using new location:"
echo "   docker info | grep 'Docker Root Dir'"