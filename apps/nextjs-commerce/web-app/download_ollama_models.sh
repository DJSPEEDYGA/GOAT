#!/bin/bash

set -e

echo ""
echo "========================================"
echo "   Ollama AI Models Downloader"
echo "========================================"
echo ""
echo "This script will download AI models from Ollama"
echo "Press Ctrl+C to cancel at any time"
echo ""

# Configuration
MODEL_DIR="${HOME}/Documents/GOAT-Royalty-App/models/ollama"
CONDA_DIR="${HOME}/miniconda3"

# Check if conda is installed
if [ ! -d "$CONDA_DIR" ]; then
    echo "[ERROR] Conda not found at: $CONDA_DIR"
    echo "Please install Miniconda from: https://docs.conda.io/en/latest/miniconda.html"
    exit 1
fi

# Create models directory
mkdir -p "$MODEL_DIR"

# Activate conda environment
echo "Activating conda environment..."
source "$CONDA_DIR/bin/activate" GOAT-Royalty 2>/dev/null || {
    echo "[ERROR] Failed to activate conda environment"
    echo "Creating new environment..."
    conda create -n GOAT-Royalty python=3.10 -y
    source "$CONDA_DIR/bin/activate" GOAT-Royalty
}

# Check if ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "[INFO] Ollama not found. Installing..."
    curl -fsSL https://ollama.com/install.sh | sh
fi

# Download models
echo ""
echo "========================================"
echo "   Downloading AI Models"
echo "========================================"
echo ""

# Foundation Models (12 models total)
echo "[1/12] Downloading Llama 3.1 (8B)..."
ollama pull llama3.1

echo "[2/12] Downloading Llama 3.1 (70B)..."
ollama pull llama3.1:70b

echo "[3/12] Downloading Mistral (7B)..."
ollama pull mistral

echo "[4/12] Downloading Mixtral (8x7B)..."
ollama pull mixtral

echo "[5/12] Downloading Codellama (13B)..."
ollama pull codellama:13b

echo "[6/12] Downloading Neural Chat (7B)..."
ollama pull neural-chat

echo "[7/12] Downloading Gemma (7B)..."
ollama pull gemma:7b

echo "[8/12] Downloading Phi-3 (Mini)..."
ollama pull phi3:mini

echo "[9/12] Downloading Qwen2 (7B)..."
ollama pull qwen2:7b

echo "[10/12] Downloading Stablelm Zephyr (3B)..."
ollama pull stablelm-zephyr

echo "[11/12] Downloading Solar (10.7B)..."
ollama pull solar

echo "[12/12] Downloading Yi (34B)..."
ollama pull yi:34b

echo ""
echo "========================================"
echo "   Download Complete!"
echo "========================================"
echo ""
echo "All models have been downloaded."
echo ""
echo "Total disk space used:"
du -sh ~/.ollama/models
echo ""
echo "List of downloaded models:"
ollama list
echo ""
echo "To use a model:"
echo "  ollama run llama3.1"
echo "  ollama run mistral"
echo ""