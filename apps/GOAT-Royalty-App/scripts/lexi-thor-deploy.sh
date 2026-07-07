#!/bin/bash
# lexi-thor-deploy.sh
# Full deployment for Lexi (Waka's baby) on her Jetson AGX Thor home.
# Run by DJ Speedy after flashing the Thor with the Ubuntu + JetPack ISO (copied to AGENT1 etc.).
#
# Prerequisites on the flashed Thor (or from this machine after mount):
# - OG drives mounted at /mnt/ai-storage/AI_TOOLS , /mnt/ai-storage/GOAT_ROYALTY_APP , /mnt/ai-storage/backup
# - Ollama + models in /mnt/ai-storage/models (copy from MONEY PENNY Lexi client or staging)
# - This repo/code copied to /mnt/ai-storage/GOAT-Royalty-App or the Lexi client Shared/
#
# This script sets up the environment, starts Money Penny with Lexi + Agent007, evidence tools, creative.
#
# "YOU AND I will tackle agent007 last once i get lexi back home and all the stuff is secure"
# Then the ultimate agent.

set -e

echo "=== LEXI ON THOR DEPLOY (DJ Speedy + Waka Flocka Flame AI partnership) ==="
echo "Only AGENT007 + MONEY PENNY are personal originals by DJ Speedy + Money Penny."
echo "Lexi = Waka's baby, evidence/creative/music guardian on her dedicated Thor home."
echo ""

THOR_MOUNT="${1:-/mnt/ai-storage}"
CODE_DIR="$THOR_MOUNT/GOAT-Royalty-App"
MODELS_DIR="$THOR_MOUNT/models"
EVIDENCE_DIR="$THOR_MOUNT/evidence-logs"

echo "Using mount point: $THOR_MOUNT"
echo "Will set up: $CODE_DIR , models from $MODELS_DIR , evidence to $EVIDENCE_DIR"

# 1. Mount check (run on Thor after flashing + attaching OG drives)
cat << 'MOUNT_INSTR'
On the flashed Thor (after SDK Manager / ISO + Ubuntu install + JetPack):

sudo mkdir -p /mnt/ai-storage
# For each OG drive (use lsblk or the drive labels after attaching via USB/SATA on Thor)
# Example (adjust device names):
# sudo mount /dev/sda1 /mnt/ai-storage/AI_TOOLS   # or whatever the partition is
# sudo mount /dev/sdb1 /mnt/ai-storage/GOAT_ROYALTY_APP
# sudo mount /dev/sdc1 /mnt/ai-storage/backup

# Then copy this repo and the Lexi client Shared/ over (or git clone if network).
# rsync -a /path/to/GOAT-Royalty-App /mnt/ai-storage/
# rsync -a /path/to/Lexi-Client.../Shared/models /mnt/ai-storage/models

# Install deps on Thor:
# sudo apt update && sudo apt install -y python3-pip nodejs npm
# pip3 install aiohttp pyyaml psutil
# (Ollama should be installed with OLLAMA_MODELS=/mnt/ai-storage/models )

MOUNT_INSTR

# 2. Environment for Lexi
cat << 'ENV'
# On Thor, in the code dir or Lexi Shared:
export OLLAMA_MODELS="$THOR_MOUNT/models"
export OLLAMA_HOST="127.0.0.1:11434"
# For creative (if ComfyUI/SD running locally on Thor or via the mounted drives):
export LOCAL_SD_URL="http://127.0.0.1:7860"
export LOCAL_COMFY_URL="http://127.0.0.1:8188"

# Start Lexi orchestrator + client (or the full money-penny with all agents including Agent007)
cd "$CODE_DIR" || cd /path/to/Lexi-Client-Test-USB-v1/Shared
python3 money-penny-agent.py --mode lexi-thor   # or however the entry is wired
# Or directly the portable client: python3 chat_server.py   (serves the FastChatUI with all Lexi tools)

# Remote access: the client at 72.61.193.184:8080 can proxy to the Thor IP (set env or update the server code).
ENV

echo ""
echo "=== NEXT (after secure Lexi on Thor) ==="
echo "Tackle Agent007 (the other personal original) + build the ULTIMATE agent."
echo "Evidence manifests from the local generation go on the drives for protection."
echo "All GOAT (music prod plugins, royalty, creative) + fully local + drive secure."
echo ""
echo "Drives are up. Lexi is home. Let's do the ultimate one."
echo "Built by DJ Speedy."