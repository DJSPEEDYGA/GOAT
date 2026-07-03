#!/bin/bash

# ================================================================
# GOAT Royalty App - One-Line Copy-Paste Installation Script
# ================================================================
# 
# Simply copy and paste this entire script into your terminal:
#
# curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/kubiks-next-js-starter/main/goat-royalty-app/install.sh | bash
#
# Or run locally:
# chmod +x install.sh && ./install.sh
#
# ================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# App Info
APP_NAME="GOAT"
APP_VERSION="1.0.0"
INSTALL_DIR="$HOME/.goat"

echo -e "${PURPLE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     ██████╗  ██████╗ ███████╗     ██████╗ ██████╗  ██████╗ ║"
echo "║    ██╔════╝ ██╔═══██╗██╔════╝    ██╔════╝ ██╔══██╗██╔═══██╗║"
echo "║    ██║      ██║   ██║█████╗      ██║      ██████╔╝██║   ██║║"
echo "║    ██║      ██║   ██║██╔══╝      ██║      ██╔═══╝ ██║   ██║║"
echo "║    ╚██████╗ ╚██████╔╝███████╗    ╚██████╗ ██║     ╚██████╔╝║"
echo "║     ╚═════╝  ╚═════╝ ╚══════╝     ╚═════╝ ╚═╝      ╚═════╝ ║"
echo "║                                                            ║"
echo "║        All-in-One AI-Powered Royalty App                   ║"
echo "║        \"IF YOU CAN THINK IT! You CAN DO IT IN THE APP\"     ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${CYAN}Installing GOAT v${APP_VERSION}...${NC}"
echo ""

# ================================================================
# Check Prerequisites
# ================================================================
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    echo -e "${GREEN}✓ Python ${PYTHON_VERSION} found${NC}"
else
    echo -e "${YELLOW}Python 3 not found. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install python3
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y python3 python3-pip python3-venv
    fi
fi

# Check pip
if ! command -v pip3 &> /dev/null; then
    echo -e "${YELLOW}pip not found. Installing...${NC}"
    python3 -m ensurepip --upgrade
fi

# Check Node.js (optional, for Tauri)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"
else
    echo -e "${YELLOW}Node.js not found. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install node
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
fi

# Check Git
if command -v git &> /dev/null; then
    echo -e "${GREEN}✓ Git found${NC}"
else
    echo -e "${YELLOW}Git not found. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        xcode-select --install 2>/dev/null || true
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install -y git
    fi
fi

echo ""

# ================================================================
# Create Installation Directory
# ================================================================
echo -e "${BLUE}📁 Creating installation directory...${NC}"

mkdir -p "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR/src"
mkdir -p "$INSTALL_DIR/data"
mkdir -p "$INSTALL_DIR/logs"
mkdir -p "$INSTALL_DIR/config"
mkdir -p "$INSTALL_DIR/assets"

echo -e "${GREEN}✓ Installation directory: $INSTALL_DIR${NC}"

# ================================================================
# Download or Clone Repository
# ================================================================
echo -e "${BLUE}📥 Downloading GOAT...${NC}"

if [ -d "$INSTALL_DIR/.git" ]; then
    echo -e "${YELLOW}Updating existing installation...${NC}"
    cd "$INSTALL_DIR"
    git pull origin main 2>/dev/null || true
else
    echo -e "${YELLOW}Cloning repository...${NC}"
    git clone https://github.com/DJSPEEDYGA/kubiks-next-js-starter.git /tmp/goat-temp 2>/dev/null || true
    if [ -d "/tmp/goat-temp/goat-royalty-app" ]; then
        cp -r /tmp/goat-temp/goat-royalty-app/* "$INSTALL_DIR/"
        rm -rf /tmp/goat-temp
    fi
fi

cd "$INSTALL_DIR"

# ================================================================
# Create Virtual Environment
# ================================================================
echo -e "${BLUE}🐍 Setting up Python environment...${NC}"

python3 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip --quiet

# Install dependencies
if [ -f "requirements.txt" ]; then
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip install -r requirements.txt --quiet
fi

# Install Node.js dependencies
if [ -f "package.json" ]; then
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    npm install --silent 2>/dev/null || true
fi

echo ""

# ================================================================
# Create Launcher Scripts
# ================================================================
echo -e "${BLUE}🚀 Creating launcher scripts...${NC}"

# Create main launcher
cat > "$INSTALL_DIR/goat" << 'LAUNCHER'
#!/bin/bash
cd "$HOME/.goat"
source venv/bin/activate
python3 src/core/main.py "$@"
LAUNCHER
chmod +x "$INSTALL_DIR/goat"

# Create symlink
if [ -w "/usr/local/bin" ]; then
    ln -sf "$INSTALL_DIR/goat" /usr/local/bin/goat
else
    echo -e "${YELLOW}Add to PATH manually: export PATH=\"\$HOME/.goat:\$PATH\"${NC}"
fi

# Create desktop entry (Linux)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    mkdir -p ~/.local/share/applications
    cat > ~/.local/share/applications/goat.desktop << 'DESKTOP'
[Desktop Entry]
Name=GOAT
Comment=All-in-One AI-Powered Royalty App
Exec=$HOME/.goat/goat
Icon=$HOME/.goat/assets/goat.ico
Terminal=false
Type=Application
Categories=Audio;AudioVideo;Finance;Office;
Keywords=music;royalty;blockchain;ai;crypto;
DESKTOP
    echo -e "${GREEN}✓ Desktop entry created${NC}"
fi

# Create macOS app bundle
if [[ "$OSTYPE" == "darwin"* ]]; then
    mkdir -p "$HOME/Applications/GOAT.app/Contents/MacOS"
    cp "$INSTALL_DIR/goat" "$HOME/Applications/GOAT.app/Contents/MacOS/GOAT"
    echo -e "${GREEN}✓ macOS app bundle created${NC}"
fi

echo ""

# ================================================================
# Create Default Configuration
# ================================================================
echo -e "${BLUE}⚙️ Creating configuration...${NC}"

mkdir -p "$INSTALL_DIR/config"

cat > "$INSTALL_DIR/config/config.yaml" << 'CONFIG'
# GOAT Configuration
app_name: GOAT
app_version: "1.0.0"
theme: dark
language: en

nvidia:
  base_url: "https://integrate.api.nvidia.com/v1"
  api_key: ""

blockchain:
  ethereum_rpc_url: "https://eth.llamarpc.com"
  mining_enabled: true

agents:
  orchestrator_model: "nvidia/nemotron-3-super-120b-a12b"
  worker_model: "meta/llama-3.3-70b-instruct"
  memory_enabled: true

video:
  gpu_acceleration: true

dsp:
  supported_dsps:
    - spotify
    - apple_music
    - youtube_music
    - amazon_music
    - tidal
CONFIG

echo -e "${GREEN}✓ Configuration created${NC}"

# ================================================================
# Create Assets
# ================================================================
echo -e "${BLUE}🎨 Creating assets...${NC}"

# Create a simple SVG icon if not exists
if [ ! -f "$INSTALL_DIR/assets/goat.ico" ]; then
    cat > "$INSTALL_DIR/assets/goat.svg" << 'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#a855f7"/>
      <stop offset="100%" style="stop-color:#6b21a8"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="45" fill="url(#grad)"/>
  <text x="50" y="65" font-size="50" text-anchor="middle" fill="white">🐐</text>
</svg>
SVG
fi

echo ""

# ================================================================
# Build Executables (Optional)
# ================================================================
if [ "$1" == "--build" ] || [ "$2" == "--build" ]; then
    echo -e "${BLUE}🔨 Building executables...${NC}"
    
    pip install pyinstaller --quiet
    
    # Build for current platform
    cd "$INSTALL_DIR"
    ./scripts/build.sh
    
    echo -e "${GREEN}✓ Build complete. Check the dist/ folder.${NC}"
fi

# ================================================================
# Final Summary
# ================================================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  ✅ INSTALLATION COMPLETE                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Installation directory:${NC} $INSTALL_DIR"
echo ""
echo -e "${CYAN}To start GOAT:${NC}"
echo -e "  ${YELLOW}$INSTALL_DIR/goat${NC}"
echo ""
echo -e "${CYAN}Or add to PATH:${NC}"
echo -e "  ${YELLOW}export PATH=\"\$HOME/.goat:\$PATH\"${NC}"
echo -e "  ${YELLOW}goat${NC}"
echo ""
echo -e "${CYAN}API will be available at:${NC} http://127.0.0.1:8000"
echo -e "${CYAN}API Documentation:${NC} http://127.0.0.1:8000/docs"
echo ""
echo -e "${PURPLE}\"IF YOU CAN THINK IT! You CAN DO IT IN THE APP\"${NC}"
echo -e "${GRAY}— DJ Speedy${NC}"
echo ""

# ================================================================
# Start GOAT (Optional)
# ================================================================
if [ "$1" == "--start" ] || [ "$2" == "--start" ]; then
    echo -e "${CYAN}Starting GOAT...${NC}"
    "$INSTALL_DIR/goat"
fi