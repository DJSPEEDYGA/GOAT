#!/bin/bash
# ============================================================
# NVIDIA MODELS - 1-CLICK DOWNLOAD ALL (v2.0 - 20 MODELS)
# Copy, paste, run. Downloads ALL NVIDIA NIM models via Docker.
# ============================================================
# Requires: Docker + NVIDIA GPU + NGC API Key
# Usage: bash NVIDIA-1-CLICK-DOWNLOAD.sh
# Remote: curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/NVIDIA-1-CLICK-DOWNLOAD.sh | bash
# ============================================================

set -e

# ===== YOUR API KEY (override with: export NGC_API_KEY=...) =====
export NGC_API_KEY="${NGC_API_KEY:-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}"

echo "╔════════════════════════════════════════════════════╗"
echo "║  🚀 NVIDIA NIM Models - 1-Click Download v2.0     ║"
echo "║  20 Models • Meta • Google • Mistral • Nemotron   ║"
echo "║  Microsoft • Qwen • DeepSeek • BigCode • CodeLlama║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# ===== Check Docker =====
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed. Installing now..."
    curl -fsSL https://get.docker.com | sh
fi

# ===== Check GPU =====
if ! command -v nvidia-smi &> /dev/null; then
    echo "⚠️  nvidia-smi not found — models require NVIDIA GPU to run (download still works)."
fi

# ===== Login to NGC =====
echo "🔑 Logging into NVIDIA NGC..."
echo "$NGC_API_KEY" | docker login nvcr.io -u '$oauthtoken' --password-stdin

# ===== Create storage =====
mkdir -p /models/nvidia-nim

# ===== ALL 20 NVIDIA NIM Models =====
MODELS=(
    # === META LLAMA (4) ===
    "nvcr.io/nim/meta/llama-3.1-8b-instruct:latest"
    "nvcr.io/nim/meta/llama-3.1-70b-instruct:latest"
    "nvcr.io/nim/meta/llama-3.2-1b-instruct:latest"
    "nvcr.io/nim/meta/llama-3.2-3b-instruct:latest"
    # === GOOGLE GEMMA (2) ===
    "nvcr.io/nim/google/gemma-2-9b-it:latest"
    "nvcr.io/nim/google/gemma-2-27b-it:latest"
    # === MISTRAL (3) ===
    "nvcr.io/nim/mistralai/mistral-7b-instruct:latest"
    "nvcr.io/nim/mistralai/mixtral-8x7b-instruct-v0.1:latest"
    "nvcr.io/nim/mistralai/mixtral-8x22b-instruct-v0.1:latest"
    # === MICROSOFT PHI (2) ===
    "nvcr.io/nim/microsoft/phi-3-mini-128k-instruct:latest"
    "nvcr.io/nim/microsoft/phi-3-medium-128k-instruct:latest"
    # === NVIDIA NEMOTRON (3) ===
    "nvcr.io/nim/nvidia/nemotron-4-340b-instruct:latest"
    "nvcr.io/nim/nvidia/llama-nemotron-embed-1b-v2:latest"
    "nvcr.io/nim/nvidia/llama-nemotron-rerank-1b-v2:latest"
    # === NVIDIA EMBEDDING (1) ===
    "nvcr.io/nim/nvidia/nv-embedqa-e5-v5:latest"
    # === QWEN (1) ===
    "nvcr.io/nim/qwen/qwen2.5-72b-instruct:latest"
    # === DEEPSEEK (2) ===
    "nvcr.io/nim/deepseek-ai/deepseek-v3:latest"
    "nvcr.io/nim/deepseek-ai/deepseek-coder-33b-instruct:latest"
    # === CODE MODELS (2) ===
    "nvcr.io/nim/bigcode/starcoder2-15b:latest"
    "nvcr.io/nim/codellama/codellama-34b-instruct:latest"
)

TOTAL=${#MODELS[@]}
COUNT=0
SUCCESS=0
FAILED=0
FAILED_LIST=()

echo ""
echo "📦 Downloading $TOTAL models..."
echo "════════════════════════════════════════════════════"

for model in "${MODELS[@]}"; do
    COUNT=$((COUNT+1))
    echo ""
    echo "[$COUNT/$TOTAL] 📥 $model"
    echo "────────────────────────────────────────────────────"
    if docker pull "$model" 2>&1; then
        SUCCESS=$((SUCCESS+1))
        echo "✅ DONE: $model"
    else
        FAILED=$((FAILED+1))
        FAILED_LIST+=("$model")
        echo "❌ FAILED: $model"
    fi
done

echo ""
echo "════════════════════════════════════════════════════"
echo "🎉 DOWNLOAD COMPLETE"
echo "   Total:    $TOTAL"
echo "   ✅ Success: $SUCCESS"
echo "   ❌ Failed:  $FAILED"
echo "════════════════════════════════════════════════════"

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "⚠️  Failed models (may need higher tier NGC access):"
    for m in "${FAILED_LIST[@]}"; do
        echo "   - $m"
    done
fi

echo ""
echo "▶️  To run Llama 3.1 8B (recommended starter):"
echo "   docker run --gpus all -p 8000:8000 \\"
echo "     -e NGC_API_KEY=\$NGC_API_KEY \\"
echo "     nvcr.io/nim/meta/llama-3.1-8b-instruct:latest"
echo ""
echo "🔗 OpenAI-compatible API: http://localhost:8000/v1/chat/completions"
echo ""
echo "📋 List installed:   docker images | grep nvcr.io"
echo "🗑️  Remove a model:  docker rmi nvcr.io/nim/<model>"