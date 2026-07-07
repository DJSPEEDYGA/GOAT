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

# Detect OS and architecture
ARCH=$(uname -m)
DISTRO="unknown"

if [ -f /etc/debian_version ]; then
    DISTRO="debian"
    echo -e "${GREEN}[OK] Detected: Debian/Ubuntu Linux${NC}"
elif [ -f /etc/redhat-release ]; then
    DISTRO="redhat"
    echo -e "${GREEN}[OK] Detected: RedHat/Fedora Linux${NC}"
elif [ -f /etc/arch-release ]; then
    DISTRO="arch"
    echo -e "${GREEN}[OK] Detected: Arch Linux${NC}"
else
    echo -e "${GREEN}[OK] Detected: Linux${NC}"
fi

case $ARCH in
    x86_64) echo -e "${GREEN}[OK] Architecture: 64-bit (x64)${NC}" ;;
    aarch64) echo -e "${GREEN}[OK] Architecture: ARM64${NC}" ;;
    *) echo -e "${YELLOW}[WARN] Architecture: $ARCH${NC}" ;;
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

# Start server
echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Starting server on port 3333...${NC}"
echo -e "${GREEN}Access at: http://localhost:3333${NC}"
echo -e "${PURPLE}════════════════════════════════════════════════════════════════════════════${NC}"
echo ""

# Try to open browser
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3333" 2>/dev/null &
elif command -v firefox &> /dev/null; then
    firefox "http://localhost:3333" 2>/dev/null &
fi

# Start Python server
cd "$CATALOG"
python3 -m http.server 3333 2>/dev/null || python -m http.server 3333