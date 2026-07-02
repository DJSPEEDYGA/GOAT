#!/bin/bash
# GOAT Royalty App - Linux Installer
# Portable USB Edition with Uncensored AI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SHARED_DIR="$(dirname "$SCRIPT_DIR")/Shared"
BIN_DIR="$SHARED_DIR/bin"
MODELS_DIR="$SHARED_DIR/models"

clear
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║     🐐 GOAT ROYALTY APP - USB EDITION INSTALLER 🐐           ║${NC}"
echo -e "${PURPLE}║              Linux Installation Script                       ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Detect distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$ID
    echo -e "${GREEN}✓ Detected: $PRETTY_NAME${NC}"
else
    DISTRO="unknown"
    echo -e "${YELLOW}⚠ Could not detect distribution${NC}"
fi

# Detect architecture
ARCH=$(uname -m)
case $ARCH in
    x86_64)
        echo -e "${GREEN}✓ Architecture: x86_64 (64-bit)${NC}"
        OLLAMA_URL="https://github.com/ollama/ollama/releases/latest/download/ollama-linux-amd64"
        ;;
    aarch64|arm64)
        echo -e "${GREEN}✓ Architecture: ARM64${NC}"
        OLLAMA_URL="https://github.com/ollama/ollama/releases/latest/download/ollama-linux-arm64"
        ;;
    *)
        echo -e "${YELLOW}⚠ Architecture: $ARCH (may not be fully supported)${NC}"
        ;;
esac

# Create directories
echo -e "\n${CYAN}Creating directory structure...${NC}"
mkdir -p "$BIN_DIR"
mkdir -p "$MODELS_DIR"
mkdir -p "$SHARED_DIR/chat_data"
mkdir -p "$SHARED_DIR/catalog"

# Check for dependencies
echo -e "\n${CYAN}Checking dependencies...${NC}"

check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✓ $1 installed${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ $1 not found${NC}"
        return 1
    fi
}

MISSING_DEPS=""

check_command python3 || MISSING_DEPS="$MISSING_DEPS python3"
check_command curl || MISSING_DEPS="$MISSING_DEPS curl"
check_command wget || MISSING_DEPS="$MISSING_DEPS wget"

if [ -n "$MISSING_DEPS" ]; then
    echo -e "\n${YELLOW}Missing dependencies:$MISSING_DEPS${NC}"
    echo -e "${CYAN}Would you like to install them? [y/N]${NC}"
    read -r install_deps
    
    if [[ $install_deps =~ ^[Yy]$ ]]; then
        case $DISTRO in
            ubuntu|debian|linuxmint|pop)
                sudo apt update && sudo apt install -y python3 curl wget
                ;;
            fedora|rhel|centos|rocky|almalinux)
                sudo dnf install -y python3 curl wget
                ;;
            arch|manjaro|endeavouros)
                sudo pacman -S --noconfirm python curl wget
                ;;
            opensuse*)
                sudo zypper install -y python3 curl wget
                ;;
            *)
                echo -e "${RED}Please install missing dependencies manually${NC}"
                ;;
        esac
    fi
fi

# Check for Ollama
echo -e "\n${CYAN}Checking for AI engine...${NC}"
if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✓ Ollama already installed system-wide${NC}"
else
    echo -e "${YELLOW}Ollama not found. Options:${NC}"
    echo "  1. Install Ollama system-wide (recommended)"
    echo "  2. Download portable version to USB"
    echo "  3. Skip (use demo mode)"
    read -p "Select option [1-3]: " ollama_choice
    
    case $ollama_choice in
        1)
            echo -e "${CYAN}Installing Ollama...${NC}"
            curl -fsSL https://ollama.com/install.sh | sh
            ;;
        2)
            echo -e "${CYAN}Downloading portable Ollama...${NC}"
            curl -L "$OLLAMA_URL" -o "$BIN_DIR/ollama"
            chmod +x "$BIN_DIR/ollama"
            ;;
        3)
            echo -e "${YELLOW}Skipping AI engine. App will run in demo mode.${NC}"
            ;;
    esac
fi

# Download AI Models
echo -e "\n${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}              AI MODEL SELECTION                              ${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}Available Uncensored AI Models:${NC}"
echo ""
echo -e "  ${GREEN}[1]${NC} Gemma 2B Abliterated    - Smallest, fastest (~1.4GB)"
echo -e "  ${GREEN}[2]${NC} Qwen 2.5 3B Uncensored  - Small, capable (~2GB)"
echo -e "  ${GREEN}[3]${NC} Llama 3.2 3B Uncensored  - Modern, efficient (~2GB)"
echo -e "  ${GREEN}[4]${NC} Qwen 2.5 7B Uncensored   - Medium, powerful (~4.5GB)"
echo -e "  ${GREEN}[5]${NC} Download ALL models      - Complete package (~10GB)"
echo -e "  ${GREEN}[S]${NC} Skip model download"
echo ""
read -p "Select model [1-5 or S]: " model_choice

case $model_choice in
    1)
        echo -e "${CYAN}Downloading Gemma 2B Abliterated...${NC}"
        ollama pull gemma2:2b-abliterated 2>/dev/null || echo "Model may need to be pulled manually"
        ;;
    2)
        echo -e "${CYAN}Downloading Qwen 2.5 3B Uncensored...${NC}"
        ollama pull qwen2.5:3b-uncensored 2>/dev/null || echo "Model may need to be pulled manually"
        ;;
    3)
        echo -e "${CYAN}Downloading Llama 3.2 3B Uncensored...${NC}"
        ollama pull llama3.2:3b-uncensored 2>/dev/null || echo "Model may need to be pulled manually"
        ;;
    4)
        echo -e "${CYAN}Downloading Qwen 2.5 7B Uncensored...${NC}"
        ollama pull qwen2.5:7b-uncensored 2>/dev/null || echo "Model may need to be pulled manually"
        ;;
    5)
        echo -e "${CYAN}Downloading all models...${NC}"
        ollama pull gemma2:2b-abliterated 2>/dev/null || true
        ollama pull qwen2.5:3b-uncensored 2>/dev/null || true
        ollama pull llama3.2:3b-uncensored 2>/dev/null || true
        ollama pull qwen2.5:7b-uncensored 2>/dev/null || true
        ;;
    S|s)
        echo -e "${YELLOW}Skipping model download.${NC}"
        ;;
    *)
        echo -e "${YELLOW}Invalid choice. Skipping model download.${NC}"
        ;;
esac

# Create config file
cat > "$SHARED_DIR/goat_config.json" << 'EOF'
{
    "app_name": "GOAT Royalty App",
    "version": "2.0.0",
    "edition": "USB Portable",
    "port": 3333,
    "ai_enabled": true,
    "voice_enabled": true,
    "catalog_entries": 5954,
    "models": [
        "gemma2:2b-abliterated",
        "qwen2.5:3b-uncensored",
        "llama3.2:3b-uncensored",
        "qwen2.5:7b-uncensored"
    ]
}
EOF

echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              INSTALLATION COMPLETE! 🎉                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}To launch GOAT Royalty App:${NC}"
echo -e "  ${YELLOW}./start-goat.sh${NC}"
echo ""
echo -e "${PURPLE}🐐 Ready to rule the music industry!${NC}"