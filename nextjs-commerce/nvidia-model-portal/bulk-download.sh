#!/bin/bash
# REAL WORKING DOWNLOAD SCRIPT - NO DEMO
# Run this on your 2TB machine

# Your API Key
export NGC_API_KEY="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"

# Login to NGC
echo "$NGC_API_KEY" | docker login nvcr.io -u '$oauthtoken' --password-stdin

# Create model directory
mkdir -p /models/nvidia-nim

echo "🚀 Starting NVIDIA Model Downloads..."
echo "====================================="

# Download ALL models - REAL DOCKER PULLS
models=(
    "nvcr.io/nim/meta/llama-3.1-8b-instruct:latest"
    "nvcr.io/nim/meta/llama-3.1-70b-instruct:latest"
    "nvcr.io/nim/meta/llama-3.2-1b-instruct:latest"
    "nvcr.io/nim/meta/llama-3.2-3b-instruct:latest"
    "nvcr.io/nim/google/gemma-2-9b-it:latest"
    "nvcr.io/nim/google/gemma-2-27b-it:latest"
    "nvcr.io/nim/mistralai/mistral-7b-instruct:latest"
    "nvcr.io/nim/mistralai/mixtral-8x7b-instruct-v0.1:latest"
    "nvcr.io/nim/mistralai/mixtral-8x22b-instruct-v0.1:latest"
    "nvcr.io/nim/microsoft/phi-3-mini-128k-instruct:latest"
    "nvcr.io/nim/microsoft/phi-3-medium-128k-instruct:latest"
    "nvcr.io/nim/nvidia/nemotron-4-340b-instruct:latest"
    "nvcr.io/nim/nvidia/nv-embedqa-e5-v5:latest"
    "nvcr.io/nim/bigcode/starcoder2-15b:latest"
    "nvcr.io/nim/codellama/codellama-34b-instruct:latest"
)

for model in "${models[@]}"; do
    echo ""
    echo "📥 Pulling: $model"
    docker pull "$model" && echo "✅ DONE: $model" || echo "❌ FAILED: $model"
done

echo ""
echo "====================================="
echo "🎉 ALL DOWNLOADS COMPLETE!"
echo "💾 Models stored in Docker"
echo ""
echo "To run a model:"
echo "docker run --gpus all -p 8000:8000 nvcr.io/nim/meta/llama-3.1-8b-instruct:latest"