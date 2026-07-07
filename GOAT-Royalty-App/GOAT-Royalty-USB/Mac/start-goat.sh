#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║          GOAT ROYALTY APP - PORTABLE USB EDITION                            ║
# ║          Version 2.0.0 - Uncensored AI Powered                              ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Banner
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║          🐐 GOAT ROYALTY APP - PORTABLE USB EDITION 🐐                       ║"
echo "║          Version 2.0.0 - Uncensored AI Powered                               ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Detect architecture
ARCH=$(uname -m)
case $ARCH in
    x86_64) ARCH_TYPE="x64"; echo -e "${GREEN}[OK] Detected: 64-bit macOS (Intel)${NC}" ;;
    arm64)  ARCH_TYPE="arm64"; echo -e "${GREEN}[OK] Detected: Apple Silicon (M1/M2/M3)${NC}" ;;
    *)      ARCH_TYPE="x64"; echo -e "${YELLOW}[WARN] Unknown arch, defaulting to x64${NC}" ;;
esac

# Set paths
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
USB_ROOT="$(dirname "$SCRIPT_DIR")"
SHARED="$USB_ROOT/Shared"
CATALOG="$SHARED/catalog"
MODELS="$SHARED/models"
CHAT_DATA="$SHARED/chat_data"

echo ""
echo -e "${CYAN}[INFO] Starting GOAT Royalty App...${NC}"
echo -e "${CYAN}[INFO] Catalog: $CATALOG${NC}"
echo -e "${CYAN}[INFO] AI Models: $MODELS${NC}"
echo ""

# Check for AI models
if ls "$MODELS"/*.gguf 1> /dev/null 2>&1; then
    echo -e "${GREEN}[OK] AI Models detected${NC}"
else
    echo -e "${YELLOW}[INFO] No AI models found. Run install.sh to download.${NC}"
fi

# Remove quarantine if needed
if [ -d "$USB_ROOT" ]; then
    xattr -cr "$USB_ROOT" 2>/dev/null || true
fi

# Start server
echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Starting server on port 3333...${NC}"
echo -e "${PURPLE}════════════════════════════════════════════════════════════════════════════${NC}"
echo ""

# Open browser
open "http://localhost:3333" 2>/dev/null || open "http://127.0.0.1:3333"

# Start Python server
cd "$CATALOG"
python3 -m http.server 3333 2>/dev/null || python -m http.server 3333