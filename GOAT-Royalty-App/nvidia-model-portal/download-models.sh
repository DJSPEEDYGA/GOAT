#!/bin/bash

# NVIDIA NIM Model Downloader
# Downloads all selected models from NVIDIA NGC
# Requires: Docker, NVIDIA GPU, NGC API Key

set -e

echo "🚀 NVIDIA NIM Model Downloader"
echo "==============================="

# Configuration
DOWNLOAD_PATH="${DOWNLOAD_PATH:-/models/nvidia-nim}"
NGC_API_KEY="${NGC_API_KEY:-}"
CONCURRENT="${CONCURRENT:-3}"
SPEED_LIMIT="${SPEED_LIMIT:-0}"

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info | grep -q "Runtimes:"; then
        echo "⚠️  Docker may not have GPU access. Ensure nvidia-container-toolkit is installed."
    fi
    
    if [ -z "$NGC_API_KEY" ]; then
        echo "❌ NGC_API_KEY environment variable is not set."
        echo "   Get your API key from: https://build.nvidia.com/"
        echo "   Export it with: export NGC_API_KEY='nvapi-xxxxxxxx'"
        exit 1
    fi
    
    echo "✅ All prerequisites met!"
}

# Create download directory
setup_download_path() {
    echo "📁 Setting up download path: $DOWNLOAD_PATH"
    mkdir -p "$DOWNLOAD_PATH/model-cache"
    mkdir -p "$DOWNLOAD_PATH/model-store"
    echo "✅ Download directories created!"
}

# Download a single model
download_model() {
    local model_profile="$1"
    local model_name="$2"
    
    echo ""
    echo "📥 Downloading: $model_name ($model_profile)"
    echo "----------------------------------------"
    
    docker run --rm --gpus all \
        -v "$DOWNLOAD_PATH/model-cache:/opt/nim/.cache" \
        -v "$DOWNLOAD_PATH/model-store:/opt/nim/model-store" \
        -e NGC_API_KEY="$NGC_API_KEY" \
        -e NIM_MODEL_PROFILE="$model_profile" \
        nvcr.io/nim/nvidia/nemotron:latest \
        download-to-cache --profile "$model_profile" || {
            echo "⚠️  Failed to download $model_name. Continuing..."
            return 1
        }
    
    echo "✅ Successfully downloaded: $model_name"
}

# Download all models
download_all_models() {
    echo ""
    echo "📦 Starting download of all NVIDIA NIM models..."
    echo "   This may take several hours depending on your connection."
    echo ""
    
    # LLM Models
    local models=(
        "meta/llama-3.1-8b-instruct:Llama 3.1 8B"
        "meta/llama-3.1-70b-instruct:Llama 3.1 70B"
        "meta/llama-3.2-1b-instruct:Llama 3.2 1B"
        "meta/llama-3.2-3b-instruct:Llama 3.2 3B"
        "google/gemma-2-9b-it:Gemma 2 9B"
        "google/gemma-2-27b-it:Gemma 2 27B"
        "mistralai/mistral-7b-instruct:Mistral 7B"
        "mistralai/mixtral-8x7b-instruct-v0.1:Mixtral 8x7B"
        "mistralai/mixtral-8x22b-instruct-v0.1:Mixtral 8x22B"
        "microsoft/phi-3-mini-128k-instruct:Phi-3 Mini"
        "microsoft/phi-3-medium-128k-instruct:Phi-3 Medium"
        "nvidia/nemotron-4-340b-instruct:Nemotron 4 340B"
        "qwen/qwen2.5-72b-instruct:Qwen 2.5 72B"
        "deepseek-ai/deepseek-v3:DeepSeek V3"
    )
    
    # Embedding Models
    local embedding_models=(
        "nvidia/nv-embedqa-e5-v5:NV-EmbedQA E5"
        "nvidia/llama-nemotron-embed-1b-v2:Nemotron Embed"
        "nvidia/llama-nemotron-rerank-1b-v2:Nemotron Rerank"
    )
    
    # Code Models
    local code_models=(
        "bigcode/starcoder2-15b:StarCoder 2 15B"
        "codellama/codellama-34b-instruct:CodeLlama 34B"
        "deepseek-ai/deepseek-coder-33b-instruct:DeepSeek Coder"
    )
    
    local total=0
    local success=0
    local failed=0
    
    for model_entry in "${models[@]}" "${embedding_models[@]}" "${code_models[@]}"; do
        IFS=':' read -r model_profile model_name <<< "$model_entry"
        ((total++))
        
        if download_model "$model_profile" "$model_name"; then
            ((success++))
        else
            ((failed++))
        fi
    done
    
    echo ""
    echo "========================================"
    echo "📊 Download Summary"
    echo "   Total: $total"
    echo "   Success: $success"
    echo "   Failed: $failed"
    echo "   Location: $DOWNLOAD_PATH"
    echo "========================================"
}

# Main execution
main() {
    check_prerequisites
    setup_download_path
    download_all_models
}

# Run
main "$@"