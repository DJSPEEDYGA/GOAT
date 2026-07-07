#!/bin/bash
# ============================================================================
# SETUP 10TB EXTERNAL DRIVE FOR AI (Docker + Ollama + Models)
# ============================================================================
# Complete one-shot script that moves EVERYTHING to external storage:
#   • Docker (NVIDIA NIM pulls) → /mnt/ai-storage/docker
#   • Ollama models            → /mnt/ai-storage/ollama
#   • HuggingFace models       → /mnt/ai-storage/huggingface
#   • Model cache              → /mnt/ai-storage/cache
# ============================================================================
# Usage (interactive — easiest):
#   curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/SETUP-10TB-FOR-AI.sh | sudo bash
#
# Usage (non-interactive):
#   sudo bash SETUP-10TB-FOR-AI.sh /dev/sdb1
# ============================================================================

set -e

MOUNT_POINT="/mnt/ai-storage"
DEVICE="${1:-}"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  💾 10TB DRIVE — COMPLETE AI STORAGE SETUP                 ║"
echo "║  Docker + Ollama + HuggingFace + Cache → External Drive    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Require root
[ "$EUID" -ne 0 ] && { echo "❌ Must run as root (use sudo)"; exit 1; }

# ============================================================================
# STEP 1: Identify the drive
# ============================================================================
echo "📀 [1/8] Detecting drives..."
echo ""
echo "Current drives:"
lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT,LABEL | grep -v "loop\|ram"
echo ""

if [ -z "$DEVICE" ]; then
    # Auto-detect: find the largest unmounted drive
    DEVICE=$(lsblk -rno NAME,SIZE,MOUNTPOINT,TYPE | awk '$4=="part" && $3=="" {print $1" "$2}' | \
             sort -k2 -h -r | head -1 | awk '{print "/dev/"$1}')
    if [ -z "$DEVICE" ]; then
        echo "❌ Couldn't auto-detect drive. Run with: sudo bash $0 /dev/sdXN"
        exit 1
    fi
    echo "🔍 Auto-detected: $DEVICE"
    echo ""
    read -p "Use this drive? Type YES to continue (this may FORMAT it if needed): " CONFIRM
    [ "$CONFIRM" != "YES" ] && { echo "Aborted."; exit 1; }
fi

# ============================================================================
# STEP 2: Check filesystem, format if needed
# ============================================================================
echo ""
echo "💽 [2/8] Checking filesystem on $DEVICE..."
FSTYPE=$(blkid -s TYPE -o value "$DEVICE" 2>/dev/null || echo "")
echo "   Filesystem: ${FSTYPE:-none}"

if [ -z "$FSTYPE" ] || [ "$FSTYPE" = "ntfs" ] || [ "$FSTYPE" = "exfat" ]; then
    echo ""
    echo "⚠️  Drive has no filesystem or a non-Linux one (Docker works best with ext4)."
    read -p "Format $DEVICE as ext4? ALL DATA WILL BE ERASED. Type YES: " FMT
    if [ "$FMT" = "YES" ]; then
        umount "$DEVICE" 2>/dev/null || true
        mkfs.ext4 -F -L ai-storage "$DEVICE"
        echo "   ✅ Formatted as ext4"
    else
        echo "   Keeping existing filesystem."
    fi
fi

# ============================================================================
# STEP 3: Mount the drive
# ============================================================================
echo ""
echo "🔌 [3/8] Mounting drive at $MOUNT_POINT..."
mkdir -p "$MOUNT_POINT"
if ! mountpoint -q "$MOUNT_POINT"; then
    mount "$DEVICE" "$MOUNT_POINT"
fi
df -h "$MOUNT_POINT" | tail -1
echo "   ✅ Mounted"

# ============================================================================
# STEP 4: Add to /etc/fstab (persistent across reboots)
# ============================================================================
echo ""
echo "📝 [4/8] Adding to /etc/fstab for auto-mount on boot..."
UUID=$(blkid -s UUID -o value "$DEVICE")
if ! grep -q "$UUID" /etc/fstab; then
    cp /etc/fstab /etc/fstab.backup.$(date +%s)
    echo "UUID=$UUID $MOUNT_POINT ext4 defaults,nofail 0 2" >> /etc/fstab
    echo "   ✅ fstab updated (UUID=$UUID)"
else
    echo "   ✅ Already in fstab"
fi

# ============================================================================
# STEP 5: Create directory structure
# ============================================================================
echo ""
echo "📁 [5/8] Creating AI storage directories..."
mkdir -p "$MOUNT_POINT"/{docker,ollama,huggingface,cache,comfyui,datasets,backups}
chmod 755 "$MOUNT_POINT"
echo "   ✅ Structure:"
echo "      $MOUNT_POINT/docker       (NVIDIA NIM Docker images)"
echo "      $MOUNT_POINT/ollama       (Ollama models)"
echo "      $MOUNT_POINT/huggingface  (HF clones)"
echo "      $MOUNT_POINT/cache        (generic model cache)"
echo "      $MOUNT_POINT/comfyui      (ComfyUI workflows/models)"
echo "      $MOUNT_POINT/datasets     (training data)"
echo "      $MOUNT_POINT/backups      (backups)"

# ============================================================================
# STEP 6: Move Docker to external drive
# ============================================================================
echo ""
echo "🐳 [6/8] Configuring Docker to use external drive..."
if command -v docker >/dev/null 2>&1; then
    systemctl stop docker docker.socket 2>/dev/null || true
    sleep 2

    # Migrate existing data
    if [ -d /var/lib/docker ] && [ "$(ls -A /var/lib/docker 2>/dev/null)" ]; then
        echo "   🚚 Moving existing Docker data..."
        rsync -a --info=progress2 /var/lib/docker/ "$MOUNT_POINT/docker/" 2>&1 | tail -3
        mv /var/lib/docker "/var/lib/docker.old.$(date +%s)"
    fi

    # Configure daemon
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
    echo "   ✅ Docker now at: $NEW_ROOT"
else
    echo "   ℹ️  Docker not installed yet — daemon.json pre-configured anyway"
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json << EOF
{
  "data-root": "$MOUNT_POINT/docker",
  "storage-driver": "overlay2"
}
EOF
fi

# ============================================================================
# STEP 7: Move Ollama to external drive
# ============================================================================
echo ""
echo "🤖 [7/8] Configuring Ollama to use external drive..."
if command -v ollama >/dev/null 2>&1 || systemctl list-unit-files | grep -q ollama; then
    systemctl stop ollama 2>/dev/null || true
    sleep 2

    # Migrate existing models
    OLLAMA_OLD="/usr/share/ollama/.ollama"
    [ ! -d "$OLLAMA_OLD" ] && OLLAMA_OLD="/root/.ollama"
    [ ! -d "$OLLAMA_OLD" ] && OLLAMA_OLD="$HOME/.ollama"

    if [ -d "$OLLAMA_OLD" ] && [ "$(ls -A "$OLLAMA_OLD" 2>/dev/null)" ]; then
        echo "   🚚 Moving Ollama models from $OLLAMA_OLD..."
        rsync -a --info=progress2 "$OLLAMA_OLD/" "$MOUNT_POINT/ollama/" 2>&1 | tail -3
    fi

    # Create systemd override to set OLLAMA_MODELS
    mkdir -p /etc/systemd/system/ollama.service.d
    cat > /etc/systemd/system/ollama.service.d/override.conf << EOF
[Service]
Environment="OLLAMA_MODELS=$MOUNT_POINT/ollama"
Environment="OLLAMA_HOST=0.0.0.0:11434"
EOF
    systemctl daemon-reload
    systemctl start ollama 2>/dev/null || true
    echo "   ✅ Ollama OLLAMA_MODELS=$MOUNT_POINT/ollama"
else
    echo "   ℹ️  Ollama not installed — pre-configuring env for when it is"
fi

# ============================================================================
# STEP 8: Set global env vars for HuggingFace + cache
# ============================================================================
echo ""
echo "🌍 [8/8] Setting global environment for HF/cache redirection..."
cat > /etc/profile.d/ai-storage.sh << EOF
# AI Storage — redirect all model caches to 10TB drive
export HF_HOME="$MOUNT_POINT/huggingface"
export TRANSFORMERS_CACHE="$MOUNT_POINT/huggingface"
export HUGGINGFACE_HUB_CACHE="$MOUNT_POINT/huggingface"
export TORCH_HOME="$MOUNT_POINT/cache/torch"
export XDG_CACHE_HOME="$MOUNT_POINT/cache"
export OLLAMA_MODELS="$MOUNT_POINT/ollama"
EOF
chmod 644 /etc/profile.d/ai-storage.sh
# Also append to /etc/environment so services see it
grep -q "HF_HOME" /etc/environment 2>/dev/null || cat >> /etc/environment << EOF
HF_HOME=$MOUNT_POINT/huggingface
TRANSFORMERS_CACHE=$MOUNT_POINT/huggingface
HUGGINGFACE_HUB_CACHE=$MOUNT_POINT/huggingface
OLLAMA_MODELS=$MOUNT_POINT/ollama
EOF
echo "   ✅ Environment configured globally"

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🎉 10TB AI STORAGE READY!                                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
df -h "$MOUNT_POINT" | head -1
df -h "$MOUNT_POINT" | tail -1
echo ""
echo "📂 Storage Layout:"
du -sh "$MOUNT_POINT"/* 2>/dev/null || ls -la "$MOUNT_POINT"
echo ""
echo "✅ Docker → $MOUNT_POINT/docker"
echo "✅ Ollama → $MOUNT_POINT/ollama"
echo "✅ HuggingFace → $MOUNT_POINT/huggingface"
echo "✅ Cache → $MOUNT_POINT/cache"
echo ""
echo "🔄 RELOAD ENVIRONMENT (or open a new SSH session):"
echo "   source /etc/profile.d/ai-storage.sh"
echo ""
echo "▶️  NEXT STEPS:"
echo ""
echo "  1️⃣  Pull NVIDIA NIM models (safely, to 10TB):"
echo "      curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/NVIDIA-SMART-DOWNLOAD.sh | bash"
echo ""
echo "  2️⃣  Pull Ollama models (free alternative, no access issues):"
echo "      ollama pull llama3.1:8b"
echo "      ollama pull gemma2:9b"
echo "      ollama pull mixtral:8x7b"
echo "      ollama pull qwen2.5:72b"
echo "      ollama pull deepseek-coder:33b"
echo ""
echo "  3️⃣  Verify everything goes to 10TB:"
echo "      docker info | grep 'Docker Root Dir'"
echo "      systemctl show ollama | grep OLLAMA_MODELS"
echo "      df -h $MOUNT_POINT"
echo ""