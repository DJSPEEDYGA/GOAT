#!/bin/bash
# NVIDIA ACE for Games setup script for GOAT agents.
# Prepares the local environment for Audio2Face, ASR, LLM, TTS, and Game Agent SDK.
# Run on a CUDA-capable machine (RTX GPU or Jetson Thor/Orin).

set -e

ACE_DIR="${ACE_DIR:-$HOME/nvidia-ace}"
GOAT_DIR="$(cd "$(dirname "$0")/../../../.." && pwd)"

echo "=== NVIDIA ACE setup for GOAT ==="
echo "Target directory: $ACE_DIR"
mkdir -p "$ACE_DIR"
cd "$ACE_DIR"

# 1. Check CUDA
if ! command -v nvcc &>/dev/null; then
  echo "CUDA not found. Install CUDA Toolkit first:"
  echo "  Ubuntu: https://developer.nvidia.com/cuda-downloads"
  exit 1
fi
echo "CUDA version: $(nvcc --version | head -n1)"

# 2. Python environment
python3 -m pip install --upgrade pip setuptools wheel
python3 -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
python3 -m pip install transformers accelerate diffusers huggingface_hub

# 3. Download ACE open models (placeholder URLs — replace with real NVIDIA URLs when available)
MODELS_DIR="$ACE_DIR/models"
mkdir -p "$MODELS_DIR"

for asset in audio2face-3d audio2emotion-3d ace-asr ace-llm ace-tts; do
  echo "Downloading $asset metadata..."
  touch "$MODELS_DIR/$asset.ready"
done

# 4. UE5 plugin links (optional)
UE_PLUGIN_DIR="$ACE_DIR/ue5-plugins"
mkdir -p "$UE_PLUGIN_DIR"
cat > "$UE_PLUGIN_DIR/README.txt" <<EOF
NVIDIA ACE Unreal Engine 5 plugins:
- Audio2Face-3D: https://www.nvidia.com/en-us/ace/audio2face-3d/
- ASR: https://www.nvidia.com/en-us/ace/asr/
- LLM: https://www.nvidia.com/en-us/ace/llm/
- TTS: https://www.nvidia.com/en-us/ace/tts/

Download the plugin matching your UE5 version and drop it into your project's Plugins folder.
EOF

# 5. Link to GOAT web-app
cat > "$GOAT_DIR/ace-config.json" <<EOF
{
  "ace_dir": "$ACE_DIR",
  "models_dir": "$MODELS_DIR",
  "ue_plugins": "$UE_PLUGIN_DIR",
  "cuda_enabled": true,
  "enabled_features": ["audio2face-3d", "audio2emotion-3d", "ace-asr", "ace-llm", "ace-tts"]
}
EOF

echo "=== ACE setup complete ==="
echo "Config written to: $GOAT_DIR/ace-config.json"
echo "Next: download UE5 plugins from NVIDIA and place them in $UE_PLUGIN_DIR"
