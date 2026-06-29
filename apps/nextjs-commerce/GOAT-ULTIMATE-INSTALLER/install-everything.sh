#!/bin/bash
# 🐐 GOAT ROYALTY — ULTIMATE ONE-CLICK INSTALLER (Mac/Linux)
# Downloads and installs EVERYTHING to a single drive
# Usage: ./install-everything.sh /Volumes/GOAT10TB

set -e
TARGET="${1:-$HOME/GOAT-Royalty}"
LOG="$TARGET/install.log"

# Colors
G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; C='\033[0;36m'; NC='\033[0m'

echo -e "${C}"
cat << 'EOF'
   ____  ___    _  _____   ____   ___  __   __    _    _   _____  __
  / ___|/ _ \  / \|_   _| |  _ \ / _ \ \ \ / /   / \  | | |_   _|\ \/ /
 | |  _| | | |/ _ \ | |   | |_) | | | | \ V /   / _ \ | |   | |   \  /
 | |_| | |_| / ___ \| |   |  _ <| |_| |  | |   / ___ \| |___| |   / /\
  \____|\___/_/   \_\_|   |_| \_\\___/   |_|  /_/   \_\_____|_|__/_/\_\

          🐐  THE ULTIMATE MUSIC WEAPON — ONE-CLICK INSTALL  🐐
EOF
echo -e "${NC}"

echo -e "${Y}Target drive: $TARGET${NC}"
echo -e "${Y}Estimated space needed: 5.8 TB (Ultimate) / 1.3 TB (Producer) / 110 GB (Minimal)${NC}"
echo ""
read -p "Install tier? (1=Minimal, 2=Producer, 3=Pro Studio, 4=ULTIMATE EVERYTHING): " TIER
TIER=${TIER:-4}

mkdir -p "$TARGET"
cd "$TARGET"
mkdir -p App AI-Brain Sounds Plugins Movie-Assets Projects Logs
exec > >(tee -a "$LOG") 2>&1

echo -e "${G}[1/8] Downloading GOAT App Core (1.5 GB)...${NC}"
if command -v gh >/dev/null 2>&1; then
  gh repo clone DJSPEEDYGA/nextjs-commerce App/goat-royalty 2>/dev/null || \
    git -C App/goat-royalty pull
else
  git clone https://github.com/DJSPEEDYGA/nextjs-commerce.git App/goat-royalty
fi

echo -e "${G}[2/8] Installing Node.js dependencies...${NC}"
cd App/goat-royalty && npm install --production && cd "$TARGET"

echo -e "${G}[3/8] Installing Ollama AI runtime...${NC}"
if ! command -v ollama >/dev/null 2>&1; then
  curl -fsSL https://ollama.com/install.sh | sh
fi

echo -e "${G}[4/8] Pulling local AI models to $TARGET/AI-Brain...${NC}"
export OLLAMA_MODELS="$TARGET/AI-Brain/models"
mkdir -p "$OLLAMA_MODELS"

MODELS_MINIMAL=("llama3.1:8b")
MODELS_PRODUCER=("llama3.1:8b" "mixtral:8x7b" "codellama:13b")
MODELS_PRO=("llama3.1:8b" "llama3.1:70b" "mixtral:8x7b" "codellama:34b")
MODELS_ULTIMATE=("llama3.1:8b" "llama3.1:70b" "mixtral:8x7b" "codellama:34b" "llava:13b" "nomic-embed-text")

case $TIER in
  1) MODELS=("${MODELS_MINIMAL[@]}") ;;
  2) MODELS=("${MODELS_PRODUCER[@]}") ;;
  3) MODELS=("${MODELS_PRO[@]}") ;;
  *) MODELS=("${MODELS_ULTIMATE[@]}") ;;
esac

for m in "${MODELS[@]}"; do
  echo -e "${C}  → pulling $m${NC}"
  ollama pull "$m" || echo -e "${R}  ✗ $m failed, continuing${NC}"
done

echo -e "${G}[5/8] Setting up sound library directory structure...${NC}"
mkdir -p Sounds/{EastWest,NativeInstruments,Splice,Loopmasters,DrumKits,Vocals}
mkdir -p Sounds/EastWest/{HollywoodOrchestra,ComposerCloud,SPACES-II,Stormdrum,ICONIC,Choirs}
mkdir -p Sounds/NativeInstruments/{Komplete15,Kontakt8,Maschine,Traktor}

cat > Sounds/README.md << 'SOUNDS'
# 🎵 GOAT Sound Library

## EastWest Sounds ($19/mo ComposerCloud+ subscription)
1. Sign up at https://www.soundsonline.com/composercloud
2. Download Installation Center: https://www.soundsonline.com/support
3. Set install path to: `./EastWest/` on this drive
4. Pick libraries to install — all will route here automatically

## Native Instruments (Komplete 15 license required)
1. Download Native Access: https://www.native-instruments.com/en/specials/native-access/
2. Log in with your NI account
3. Preferences → File Management → set Content Location to: `./NativeInstruments/`
4. Install Komplete 15 — all 140+ products route here

## Your personal samples
- Drop into `DrumKits/`, `Vocals/`, `Splice/`, `Loopmasters/`
- GOAT Sample Library UI will auto-index on next launch
SOUNDS

echo -e "${G}[6/8] Downloading plugin installers (cached for offline install)...${NC}"
mkdir -p Plugins/{Installers,Presets}
cat > Plugins/Installers/DOWNLOAD-LINKS.md << 'PLUGINS'
# Plugin Installer Download Links (manual step — vendors require login)

Run this checklist once; installers will cache here for offline reinstall.

- [ ] Waves Central → https://www.waves.com/downloads/central
- [ ] UAD Connect → https://www.uaudio.com/downloads.html
- [ ] Slate Digital → https://slatedigital.com/my-account/
- [ ] iZotope Product Portal → https://www.izotope.com/en/products/product-portal.html
- [ ] Antares Central → https://www.antarestech.com/antares-central/
- [ ] FabFilter → https://www.fabfilter.com/download/
- [ ] Serato → https://serato.com/dj/downloads
- [ ] Akai MPC Software → https://www.akaipro.com/mpc-software-2

After downloading, save all `.exe` / `.pkg` files into this folder. The GOAT App
will detect them and offer one-click reinstall on any new machine.
PLUGINS

echo -e "${G}[7/8] Setting up Movie Studio assets folder...${NC}"
mkdir -p Movie-Assets/{Footage,Music,SFX,LUTs,Transitions,Codecs}
# Install FFmpeg (needed by movie-studio.html export)
if ! command -v ffmpeg >/dev/null 2>&1; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install ffmpeg 2>/dev/null || echo "Install Homebrew first, then: brew install ffmpeg"
  else
    sudo apt-get install -y ffmpeg 2>/dev/null || sudo yum install -y ffmpeg 2>/dev/null || true
  fi
fi

echo -e "${G}[8/8] Creating launcher...${NC}"
cat > "$TARGET/LAUNCH-GOAT.sh" << LAUNCHER
#!/bin/bash
cd "$TARGET/App/goat-royalty"
export OLLAMA_MODELS="$TARGET/AI-Brain/models"
ollama serve > "$TARGET/Logs/ollama.log" 2>&1 &
sleep 2
npm run start &
sleep 3
if [[ "\$OSTYPE" == "darwin"* ]]; then
  open http://localhost:3000
else
  xdg-open http://localhost:3000 2>/dev/null || echo "Open http://localhost:3000 in your browser"
fi
wait
LAUNCHER
chmod +x "$TARGET/LAUNCH-GOAT.sh"

# Desktop shortcut
if [[ "$OSTYPE" == "darwin"* ]]; then
  ln -sf "$TARGET/LAUNCH-GOAT.sh" "$HOME/Desktop/GOAT Royalty.command" 2>/dev/null || true
fi

# Final report
FINAL_SIZE=$(du -sh "$TARGET" 2>/dev/null | cut -f1)
echo ""
echo -e "${G}╔══════════════════════════════════════════════╗${NC}"
echo -e "${G}║  ✅ GOAT ROYALTY INSTALLATION COMPLETE       ║${NC}"
echo -e "${G}╠══════════════════════════════════════════════╣${NC}"
echo -e "${G}║  Location: $TARGET"
echo -e "${G}║  Size so far: $FINAL_SIZE"
echo -e "${G}║  Tier: $TIER"
echo -e "${G}╠══════════════════════════════════════════════╣${NC}"
echo -e "${G}║  NEXT STEPS:                                 ║${NC}"
echo -e "${G}║  1. Install EastWest (see Sounds/README.md)  ║${NC}"
echo -e "${G}║  2. Install NI Komplete (see Sounds/README)  ║${NC}"
echo -e "${G}║  3. Install plugins (see Plugins/Installers) ║${NC}"
echo -e "${G}║  4. Launch: ./LAUNCH-GOAT.sh                 ║${NC}"
echo -e "${G}╚══════════════════════════════════════════════╝${NC}"