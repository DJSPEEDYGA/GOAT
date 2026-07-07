#!/bin/bash
# NVIDIA Thor / Jetson edge deployment setup for GOAT agents.
# Prepares an ARM64 Ubuntu device (Jetson Thor/Orin) to run GOAT agents locally.

set -e

TARGET_HOST="${1:-thor.local}"
GOAT_DIR="$(cd "$(dirname "$0")/../../../.." && pwd)"
REMOTE_DIR="/opt/goat"

echo "=== GOAT Thor / Jetson deployment to $TARGET_HOST ==="

# 1. Install CUDA on target if missing
ssh "$TARGET_HOST" <<'REMOTE'
set -e
if ! command -v nvcc &>/dev/null; then
  echo "Installing CUDA Toolkit for Jetson..."
  wget -q https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/arm64/cuda-keyring_1.1-1_all.deb
  sudo dpkg -i cuda-keyring_1.1-1_all.deb
  sudo apt update
  sudo apt install -y cuda-toolkit
fi
if ! command -v ollama &>/dev/null; then
  echo "Installing Ollama..."
  curl -fsSL https://ollama.com/install.sh | sh
fi
REMOTE

# 2. Sync GOAT web-app and scripts
rsync -avz --delete "$GOAT_DIR/web-app/" "$TARGET_HOST:$REMOTE_DIR/web-app/"
rsync -avz "$GOAT_DIR/web-app/lib/agents/patch/" "$TARGET_HOST:$REMOTE_DIR/patch/"

# 3. Pull models on device
ssh "$TARGET_HOST" <<REMOTE
ollama pull llama3.2 || true
ollama pull qwen2.5 || true
ollama pull whisper-base || true
REMOTE

# 4. Start services
ssh "$TARGET_HOST" "nohup ollama serve > /tmp/ollama.log 2>&1 &"
ssh "$TARGET_HOST" "nohup python3 $REMOTE_DIR/patch/patch-terminal-server.py --host 0.0.0.0 --port 9999 > /tmp/patch-terminal.log 2>&1 &"

echo "=== Deployment complete ==="
echo "Ollama running on $TARGET_HOST:11434"
echo "Patch terminal running on $TARGET_HOST:9999"
echo "Open http://$TARGET_HOST:8000/web-app/goat-devin-center.html after starting a local web server."
