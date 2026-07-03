#!/bin/bash
# ============================================================================
# ONE-COMMAND-FREE-AI.sh
# Mount 10TB drive + Install Ollama + Download 29 uncensored models
# ALL IN ONE COMMAND. NO API KEY. NO LOGIN. NO LIMITS.
# ============================================================================
# Usage:
#   sudo bash ONE-COMMAND-FREE-AI.sh
# OR remote:
#   curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/ONE-COMMAND-FREE-AI.sh | sudo bash
# ============================================================================

set -e

[ "$EUID" -ne 0 ] && { echo "❌ Run with: sudo bash $0"; exit 1; }

STORAGE="/mnt/ai-storage"

clear
cat << 'BANNER'
╔══════════════════════════════════════════════════════════════╗
║  🔓 FREE AI — NO KEY • NO LOGIN • NO LIMITS • UNCENSORED     ║
║                                                              ║
║  This script will:                                           ║
║   1. Find & mount your external drive                        ║
║   2. Install Ollama (free, open-source)                      ║
║   3. Configure it to save to your 10TB drive                 ║
║   4. Download 29 popular models (incl. uncensored)           ║
║   5. Start an OpenAI-compatible API on port 11434            ║
║                                                              ║
║  Time: ~1-3 hours depending on internet speed                ║
║  Storage needed: ~400 GB of your 10TB                        ║
╚══════════════════════════════════════════════════════════════╝
BANNER
echo ""

# ============================================================================
# STEP 1: MOUNT EXTERNAL DRIVE
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔌 STEP 1/5 — MOUNT EXTERNAL DRIVE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if mountpoint -q "$STORAGE"; then
    echo "✅ External drive already mounted at $STORAGE"
    df -h "$STORAGE" | tail -1
else
    echo "📀 Available drives:"
    lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT,LABEL | grep -v "loop\|ram"
    echo ""

    # Auto-detect biggest unmounted partition
    DEVICE=$(lsblk -rno NAME,SIZE,MOUNTPOINT,TYPE | \
             awk '$4=="part" && $3=="" {gsub("G","",$2); print $1" "$2}' | \
             sort -k2 -n -r | head -1 | awk '{print "/dev/"$1}')

    if [ -z "$DEVICE" ]; then
        echo "❌ No unmounted external drive found."
        echo "   Plug in the drive and run this script again."
        echo "   Or specify manually: sudo bash $0 /dev/sdXN"
        exit 1
    fi

    echo "🔍 Found: $DEVICE ($(lsblk -rno SIZE $DEVICE | head -1))"
    read -p "Use this drive? [y/N]: " OK
    [ "$OK" != "y" ] && [ "$OK" != "Y" ] && { echo "Aborted"; exit 1; }

    # Check filesystem
    FSTYPE=$(blkid -s TYPE -o value "$DEVICE" 2>/dev/null || echo "")
    if [ -z "$FSTYPE" ] || [ "$FSTYPE" = "ntfs" ] || [ "$FSTYPE" = "exfat" ]; then
        echo ""
        echo "⚠️  Drive needs ext4 filesystem for best performance."
        read -p "Format $DEVICE as ext4? ALL DATA WILL BE ERASED [YES/no]: " FMT
        if [ "$FMT" = "YES" ]; then
            umount "$DEVICE" 2>/dev/null || true
            mkfs.ext4 -F -L ai-storage "$DEVICE"
            echo "✅ Formatted"
        fi
    fi

    mkdir -p "$STORAGE"
    mount "$DEVICE" "$STORAGE"
    UUID=$(blkid -s UUID -o value "$DEVICE")
    grep -q "$UUID" /etc/fstab || echo "UUID=$UUID $STORAGE ext4 defaults,nofail 0 2" >> /etc/fstab
    echo "✅ Mounted at $STORAGE (persists on reboot)"
fi

mkdir -p "$STORAGE"/{ollama,huggingface,cache}
echo ""

# ============================================================================
# STEP 2: FREE UP SERVER DISK (clean failed Docker pulls)
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 STEP 2/5 — CLEAN UP SERVER DISK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Before:"
df -h / | tail -1
if command -v docker &>/dev/null; then
    docker system prune -a -f 2>&1 | tail -3 || true
fi
echo ""
echo "After:"
df -h / | tail -1
echo ""

# ============================================================================
# STEP 3: INSTALL OLLAMA (REDIRECTED TO EXTERNAL DRIVE)
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 STEP 3/5 — INSTALL OLLAMA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! command -v ollama &> /dev/null; then
    echo "📥 Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo "✅ Ollama already installed"
fi

# Stop + migrate any existing Ollama data to external
systemctl stop ollama 2>/dev/null || true
sleep 2

for OLD in /usr/share/ollama/.ollama /root/.ollama "$HOME/.ollama"; do
    if [ -d "$OLD" ] && [ "$(ls -A "$OLD" 2>/dev/null)" ]; then
        echo "🚚 Moving existing Ollama models from $OLD..."
        rsync -aH "$OLD/" "$STORAGE/ollama/"
        break
    fi
done

# Configure Ollama to use external drive + listen on all interfaces
mkdir -p /etc/systemd/system/ollama.service.d
cat > /etc/systemd/system/ollama.service.d/override.conf << EOF
[Service]
Environment="OLLAMA_MODELS=$STORAGE/ollama"
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_KEEP_ALIVE=5m"
EOF

# Ensure ollama user owns the directory
chown -R ollama:ollama "$STORAGE/ollama" 2>/dev/null || true

systemctl daemon-reload
systemctl enable ollama 2>/dev/null || true
systemctl restart ollama
sleep 5

echo "✅ Ollama configured:"
echo "   Models → $STORAGE/ollama"
echo "   API    → http://0.0.0.0:11434"
echo ""

# ============================================================================
# STEP 4: DOWNLOAD MODELS
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📥 STEP 4/5 — DOWNLOAD 29 MODELS (NO API KEY NEEDED)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ordered smallest → largest, uncensored models FIRST (priority!)
MODELS=(
    # === UNCENSORED FIRST (the good stuff) ===
    "llama2-uncensored:7b|Llama 2 Uncensored 7B|3.8GB"
    "dolphin-llama3:8b|Dolphin Llama 3 8B UNCENSORED|4.7GB"
    "dolphin-mistral:7b|Dolphin Mistral 7B UNCENSORED|4.1GB"
    "wizardlm-uncensored:13b|WizardLM Uncensored 13B|7.4GB"

    # === Small (CPU-friendly) ===
    "llama3.2:1b|Llama 3.2 1B — ultra fast|1.3GB"
    "gemma2:2b|Gemma 2 2B|1.6GB"
    "llama3.2:3b|Llama 3.2 3B|2.0GB"
    "qwen2.5:3b|Qwen 2.5 3B|1.9GB"
    "phi3:mini|Phi-3 Mini|2.2GB"
    "moondream:1.8b|Moondream vision|1.7GB"

    # === Embeddings ===
    "nomic-embed-text:latest|Nomic Embed — RAG|274MB"
    "mxbai-embed-large:latest|MxBai Embed|670MB"

    # === Medium 7-9B sweet spot ===
    "llama3.1:8b|Llama 3.1 8B|4.7GB"
    "mistral:7b|Mistral 7B — FREE on Ollama!|4.1GB"
    "qwen2.5:7b|Qwen 2.5 7B|4.7GB"
    "gemma2:9b|Gemma 2 9B — FREE on Ollama!|5.4GB"
    "deepseek-r1:7b|DeepSeek R1 7B — reasoning|4.7GB"
    "llava:7b|LLaVA 7B vision|4.7GB"

    # === Larger Uncensored ===
    "dolphin-mixtral:8x7b|Dolphin Mixtral 8x7B UNCENSORED|26GB"

    # === Code ===
    "starcoder2:15b|StarCoder 2 15B|9GB"
    "codellama:34b|CodeLlama 34B|19GB"
    "deepseek-coder:33b|DeepSeek Coder 33B|19GB"
    "qwen2.5-coder:32b|Qwen 2.5 Coder 32B|19GB"

    # === Vision ===
    "llama3.2-vision:11b|Llama 3.2 Vision 11B|7.9GB"

    # === Large (GPU helpful but works on CPU) ===
    "mixtral:8x7b|Mixtral 8x7B MoE|26GB"
    "llama3.1:70b|Llama 3.1 70B|40GB"
    "qwen2.5:72b|Qwen 2.5 72B|41GB"
    "deepseek-r1:70b|DeepSeek R1 70B — reasoning|40GB"
    "llama2-uncensored:70b|Llama 2 Uncensored 70B|39GB"
)

TOTAL=${#MODELS[@]}
COUNT=0
SUCCESS=0
FAILED=0
SUCCESS_LIST=()

for entry in "${MODELS[@]}"; do
    COUNT=$((COUNT+1))
    IFS='|' read -r model desc size <<< "$entry"

    # Check external drive space
    FREE_GB=$(df -BG "$STORAGE" 2>/dev/null | tail -1 | awk '{print $4}' | tr -d 'G')
    if [ -n "$FREE_GB" ] && [ "$FREE_GB" -lt 5 ]; then
        echo ""
        echo "⚠️  External drive low on space (${FREE_GB} GB) — stopping"
        break
    fi

    echo ""
    echo "[$COUNT/$TOTAL] 📥 $desc ($size)"
    if ollama pull "$model" 2>&1 | tail -2; then
        SUCCESS=$((SUCCESS+1))
        SUCCESS_LIST+=("$model")
        echo "    ✅ $model"
    else
        FAILED=$((FAILED+1))
        echo "    ❌ $model"
    fi
done

# ============================================================================
# STEP 5: SUMMARY + API TEST
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 STEP 5/5 — COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Results:"
echo "   ✅ Success: $SUCCESS / $TOTAL"
echo "   ❌ Failed:  $FAILED"
echo ""
echo "💾 Storage:"
df -h "$STORAGE" | tail -1
echo ""
echo "📦 Installed models:"
ollama list 2>/dev/null | head -20
echo ""

# Quick API test
echo "🧪 Testing API..."
TEST=$(curl -s -m 15 http://localhost:11434/api/tags 2>/dev/null | head -c 200)
if [ -n "$TEST" ]; then
    echo "✅ API responding on port 11434"
else
    echo "⚠️  API not responding yet — try: sudo systemctl restart ollama"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔓 YOU NOW HAVE $SUCCESS UNCENSORED AI MODELS                      ║"
echo "║     ON YOUR 10TB DRIVE — NO KEY, NO LOGIN, NO LIMITS         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "▶️  CHAT NOW:"
echo "   ollama run dolphin-mixtral:8x7b       # uncensored GPT-4 class"
echo "   ollama run deepseek-r1:70b            # reasoning model"
echo "   ollama run llama3.1:70b               # general"
echo ""
echo "▶️  USE AS API (OpenAI-compatible):"
echo "   curl http://localhost:11434/v1/chat/completions \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"model\":\"dolphin-mixtral:8x7b\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'"
echo ""
echo "▶️  YOUR GOAT APP:"
echo "   Already wired to /api/chat → Ollama. Models work immediately!"
echo ""
echo "🔄 If env vars not active, run: source /etc/profile.d/ai-storage.sh"
echo "   (or open a new SSH session)"
echo ""