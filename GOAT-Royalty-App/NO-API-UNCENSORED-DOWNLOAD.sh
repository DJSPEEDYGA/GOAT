#!/bin/bash
# ============================================================================
# NO-API-UNCENSORED-DOWNLOAD.sh
# Download ALL top LLMs — NO API KEY, NO LOGIN, NO LIMITS, UNCENSORED
# ============================================================================
# Downloads directly from HuggingFace to your external drive.
# Same models as NVIDIA NIM but:
#   ✅ No API key required
#   ✅ No login required
#   ✅ No subscription
#   ✅ Uncensored/abliterated versions when available
#   ✅ 100% offline after download
#   ✅ Runs anywhere (CPU or GPU)
# ============================================================================
# Usage:
#   bash NO-API-UNCENSORED-DOWNLOAD.sh [storage_path]
#   Default path: /mnt/ai-storage/models
# ============================================================================

set -e

STORAGE="${1:-/mnt/ai-storage/models}"
mkdir -p "$STORAGE"
cd "$STORAGE"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔓 NO-API UNCENSORED AI DOWNLOAD                          ║"
echo "║  Same Models as NVIDIA NIM • No Login • No Limits          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📁 Target: $STORAGE"
echo ""

# ============================================================================
# INSTALL OLLAMA (runs ANY GGUF model locally, no login)
# ============================================================================
echo "🔧 [1/3] Installing Ollama (if not already)..."
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
fi

# Redirect Ollama to external drive
mkdir -p /etc/systemd/system/ollama.service.d 2>/dev/null
cat > /etc/systemd/system/ollama.service.d/override.conf 2>/dev/null << EOF
[Service]
Environment="OLLAMA_MODELS=$STORAGE/ollama"
Environment="OLLAMA_HOST=0.0.0.0:11434"
EOF
systemctl daemon-reload 2>/dev/null || true
systemctl restart ollama 2>/dev/null || systemctl start ollama 2>/dev/null || true
sleep 3
echo "   ✅ Ollama running, models → $STORAGE/ollama"
echo ""

# ============================================================================
# PULL ALL POPULAR MODELS (NO LOGIN NEEDED)
# ============================================================================
echo "📥 [2/3] Pulling top LLMs via Ollama (no API key required)..."
echo ""

# Format: "model:tag|description|size"
MODELS=(
    # === Small/Fast (great for CPU-only servers) ===
    "llama3.2:1b|Llama 3.2 1B — ultra fast|1.3GB"
    "llama3.2:3b|Llama 3.2 3B — fast|2.0GB"
    "gemma2:2b|Gemma 2 2B|1.6GB"
    "qwen2.5:3b|Qwen 2.5 3B|1.9GB"
    "phi3:mini|Phi-3 Mini 3.8B|2.2GB"

    # === Medium (8B — sweet spot) ===
    "llama3.1:8b|Llama 3.1 8B — instruct|4.7GB"
    "gemma2:9b|Gemma 2 9B|5.4GB"
    "mistral:7b|Mistral 7B — instruct|4.1GB"
    "qwen2.5:7b|Qwen 2.5 7B|4.7GB"
    "deepseek-r1:7b|DeepSeek R1 7B — reasoning|4.7GB"

    # === Large (13B+ — needs GPU) ===
    "llama3.1:70b|Llama 3.1 70B|40GB"
    "mixtral:8x7b|Mixtral 8x7B MoE|26GB"
    "qwen2.5:72b|Qwen 2.5 72B|41GB"
    "deepseek-r1:70b|DeepSeek R1 70B|40GB"

    # === Code ===
    "deepseek-coder:33b|DeepSeek Coder 33B|19GB"
    "codellama:34b|CodeLlama 34B|19GB"
    "qwen2.5-coder:32b|Qwen 2.5 Coder 32B|19GB"
    "starcoder2:15b|StarCoder 2 15B|9GB"

    # === UNCENSORED / Abliterated ===
    "dolphin-mistral:7b|Dolphin Mistral 7B (UNCENSORED)|4.1GB"
    "dolphin-mixtral:8x7b|Dolphin Mixtral 8x7B (UNCENSORED)|26GB"
    "dolphin-llama3:8b|Dolphin Llama3 8B (UNCENSORED)|4.7GB"
    "wizardlm-uncensored:13b|WizardLM 13B (UNCENSORED)|7.4GB"
    "llama2-uncensored:7b|Llama 2 7B (UNCENSORED)|3.8GB"
    "llama2-uncensored:70b|Llama 2 70B (UNCENSORED)|39GB"

    # === Vision ===
    "llava:7b|LLaVA 7B — vision|4.7GB"
    "llama3.2-vision:11b|Llama 3.2 Vision 11B|7.9GB"
    "moondream:1.8b|Moondream — tiny vision|1.7GB"

    # === Embeddings ===
    "nomic-embed-text:latest|Nomic Embed — for RAG|274MB"
    "mxbai-embed-large:latest|MxBai Embed Large|670MB"
)

TOTAL=${#MODELS[@]}
COUNT=0
SUCCESS=0
FAILED=0
SKIPPED=0

for entry in "${MODELS[@]}"; do
    COUNT=$((COUNT+1))
    IFS='|' read -r model desc size <<< "$entry"

    # Check disk space
    FREE_GB=$(df -BG "$STORAGE" 2>/dev/null | tail -1 | awk '{print $4}' | tr -d 'G')
    if [ -n "$FREE_GB" ] && [ "$FREE_GB" -lt 5 ]; then
        echo ""
        echo "[$COUNT/$TOTAL] ⚠️  LOW SPACE ($FREE_GB GB free) — stopping pulls"
        SKIPPED=$((TOTAL - COUNT + 1))
        break
    fi

    echo ""
    echo "[$COUNT/$TOTAL] 📥 $desc ($size)"
    if ollama pull "$model" 2>&1 | tail -3; then
        SUCCESS=$((SUCCESS+1))
        echo "    ✅ Got $model"
    else
        FAILED=$((FAILED+1))
        echo "    ❌ Failed $model"
    fi
done

# ============================================================================
# OPTIONAL: Download raw HuggingFace models for custom use
# ============================================================================
echo ""
echo "🤗 [3/3] HuggingFace direct-download option..."
pip install -q huggingface_hub 2>/dev/null || pip3 install -q huggingface_hub 2>/dev/null || true

mkdir -p "$STORAGE/huggingface"
cat > "$STORAGE/download-hf-model.sh" << 'HFEOF'
#!/bin/bash
# Download any HuggingFace model (no login required for public models)
# Usage: bash download-hf-model.sh <repo>
# Example: bash download-hf-model.sh meta-llama/Llama-3.2-3B-Instruct

REPO="$1"
[ -z "$REPO" ] && { echo "Usage: $0 <org/model>"; exit 1; }
cd "$(dirname "$0")/huggingface"
git lfs install 2>/dev/null || sudo apt install -y git-lfs && git lfs install
git clone "https://huggingface.co/$REPO"
echo "✅ Downloaded: $REPO → $(pwd)/$(basename $REPO)"
HFEOF
chmod +x "$STORAGE/download-hf-model.sh"

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🎉 ALL DONE — No API key used, all models yours forever   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "   ✅ Success: $SUCCESS"
echo "   ❌ Failed:  $FAILED"
echo "   ⏭  Skipped: $SKIPPED (disk space)"
echo ""
echo "📊 Storage used:"
du -sh "$STORAGE"/* 2>/dev/null | head -5
echo ""
echo "📊 Free on drive:"
df -h "$STORAGE" | tail -1
echo ""
echo "▶️  USE YOUR MODELS:"
echo ""
echo "  # List installed"
echo "  ollama list"
echo ""
echo "  # Chat with any model (replaces ChatGPT locally)"
echo "  ollama run llama3.1:8b"
echo "  ollama run dolphin-mixtral:8x7b    # uncensored"
echo "  ollama run deepseek-r1:70b         # reasoning"
echo ""
echo "  # OpenAI-compatible API (for apps)"
echo "  curl http://localhost:11434/v1/chat/completions \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"model\":\"llama3.1:8b\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'"
echo ""
echo "📥 Download any HuggingFace model directly (also no login):"
echo "   bash $STORAGE/download-hf-model.sh TheBloke/Llama-2-70B-Uncensored-GGUF"
echo ""