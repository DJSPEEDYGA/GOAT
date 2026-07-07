#!/usr/bin/env bash
###############################################################################
#  🐐  GOAT Royalty App — One-Click Installer (macOS & Linux)
#     Owner: DJ Speedy (Harvey L. Miller Jr.) + Waka Flocka Flame
#
#  USAGE (copy+paste this one line into Terminal):
#     curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/installers/install.sh | bash
#
#  What it does:
#    1. Installs Git, Python 3, Node.js, and Ollama (if missing)
#    2. Clones the GOAT Royalty App to ~/GOAT-Royalty-App
#    3. Pulls Gemma 3 (4B) local AI model
#    4. Installs Python requirements
#    5. Writes a launcher script you can double-click
#    6. Starts the Intel server + web app
###############################################################################
set -e

GOLD="\033[1;33m"; GREEN="\033[1;32m"; CYAN="\033[1;36m"; RED="\033[1;31m"; NC="\033[0m"
REPO="https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git"
INSTALL_DIR="$HOME/GOAT-Royalty-App"

banner() {
cat <<'BANNER'
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🐐  GOAT ROYALTY APP — One-Click Installer              ║
║     DJ Speedy + Waka Flocka Flame                            ║
║     AI Brain · 11 Agents · No OpenAI Dependency              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
BANNER
}

banner

# ---------- Detect OS ----------
OS="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then OS="mac"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then OS="linux"
fi
echo -e "${CYAN}🖥  Detected OS: $OS${NC}"

# ---------- Install Homebrew on Mac ----------
if [ "$OS" = "mac" ] && ! command -v brew &>/dev/null; then
  echo -e "${GOLD}📦 Installing Homebrew (package manager)...${NC}"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# ---------- Install core deps ----------
install_pkg() {
  local pkg=$1
  if command -v "$pkg" &>/dev/null; then
    echo -e "${GREEN}✅ $pkg already installed${NC}"
    return
  fi
  echo -e "${GOLD}📦 Installing $pkg...${NC}"
  if [ "$OS" = "mac" ]; then
    brew install "$pkg"
  else
    if command -v apt-get &>/dev/null; then sudo apt-get update -qq && sudo apt-get install -y "$pkg"
    elif command -v dnf &>/dev/null; then sudo dnf install -y "$pkg"
    elif command -v pacman &>/dev/null; then sudo pacman -Sy --noconfirm "$pkg"
    else echo -e "${RED}❌ Cannot auto-install $pkg on this Linux flavor. Install it manually.${NC}"
    fi
  fi
}

install_pkg git
install_pkg python3
install_pkg curl

# pip
if ! command -v pip3 &>/dev/null; then
  echo -e "${GOLD}📦 Installing pip3...${NC}"
  if [ "$OS" = "mac" ]; then brew install python3
  else sudo apt-get install -y python3-pip 2>/dev/null || sudo dnf install -y python3-pip 2>/dev/null || true
  fi
fi

# ---------- Install Ollama (local AI engine) ----------
if ! command -v ollama &>/dev/null; then
  echo -e "${GOLD}🧠 Installing Ollama (local AI)...${NC}"
  curl -fsSL https://ollama.com/install.sh | sh
else
  echo -e "${GREEN}✅ Ollama already installed${NC}"
fi

# ---------- Clone the repo ----------
if [ -d "$INSTALL_DIR" ]; then
  echo -e "${CYAN}🔄 Updating existing install at $INSTALL_DIR${NC}"
  cd "$INSTALL_DIR" && git pull --rebase || true
else
  echo -e "${GOLD}📥 Cloning GOAT Royalty App to $INSTALL_DIR${NC}"
  git clone "$REPO" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# ---------- Python dependencies ----------
echo -e "${GOLD}🐍 Installing Python requirements...${NC}"
pip3 install --quiet --user flask flask-cors requests yt-dlp python-dotenv 2>/dev/null || \
  pip3 install --quiet --break-system-packages flask flask-cors requests yt-dlp python-dotenv

# ---------- Start Ollama and pull Gemma 3 ----------
if command -v ollama &>/dev/null; then
  # Start Ollama service in background if not running
  if ! pgrep -x "ollama" >/dev/null; then
    echo -e "${CYAN}🚀 Starting Ollama service...${NC}"
    nohup ollama serve >/dev/null 2>&1 &
    sleep 3
  fi
  echo -e "${GOLD}📥 Pulling Gemma 3 4B model (~3GB, one-time)...${NC}"
  ollama pull gemma3:4b || ollama pull gemma2:2b || true
fi

# ---------- Write the launcher ----------
LAUNCHER="$INSTALL_DIR/start-goat.sh"
cat > "$LAUNCHER" <<'LAUNCHSCRIPT'
#!/usr/bin/env bash
# 🐐 GOAT Royalty App Launcher
cd "$(dirname "$0")"
GOLD="\033[1;33m"; GREEN="\033[1;32m"; CYAN="\033[1;36m"; NC="\033[0m"

echo -e "${GOLD}🐐 Starting GOAT Royalty App...${NC}"

# Start Ollama if installed
if command -v ollama &>/dev/null && ! pgrep -x ollama >/dev/null; then
  echo -e "${CYAN}🧠 Starting Ollama (local AI)...${NC}"
  nohup ollama serve >/tmp/ollama.log 2>&1 &
  sleep 2
fi

# Kill any old Intel servers
pkill -f goat_intel.py 2>/dev/null || true
pkill -f "http.server 8090" 2>/dev/null || true
sleep 1

# Start Intel server (AI Brain + data APIs) on port 5500
echo -e "${CYAN}🧠 Launching AI Brain on http://localhost:5500 ...${NC}"
cd goat-intel-server
nohup python3 goat_intel.py >/tmp/goat-intel.log 2>&1 &
cd ..

# Start web app on port 8090
echo -e "${CYAN}🌐 Launching Web App on http://localhost:8090 ...${NC}"
cd web-app
nohup python3 -m http.server 8090 >/tmp/goat-web.log 2>&1 &
cd ..

sleep 3

# Open browser
URL="http://localhost:8090/powerhouse.html"
echo -e "${GREEN}✅ GOAT Royalty App is live!${NC}"
echo ""
echo -e "   🌐 Powerhouse:     ${CYAN}http://localhost:8090/powerhouse.html${NC}"
echo -e "   🧠 AI Brain:        ${CYAN}http://localhost:8090/agents-brain.html${NC}"
echo -e "   💼 Moneypenny:      ${CYAN}http://localhost:8090/moneypenny.html${NC}"
echo -e "   🔗 Network:         ${CYAN}http://localhost:8090/network.html${NC}"
echo -e "   🎧 Spotify:         ${CYAN}http://localhost:8090/spotify-dashboard.html${NC}"
echo -e "   📧 Fan DB:          ${CYAN}http://localhost:8090/fan-db.html${NC}"
echo ""
echo -e "${GOLD}Press Ctrl+C in this window to stop all services${NC}"

# Try to open in default browser
if [[ "$OSTYPE" == "darwin"* ]]; then open "$URL"
elif command -v xdg-open &>/dev/null; then xdg-open "$URL" &>/dev/null
fi

# Keep running until user hits Ctrl+C
trap 'echo -e "\n${GOLD}Stopping services...${NC}"; pkill -f goat_intel.py; pkill -f "http.server 8090"; exit 0' INT
wait
LAUNCHSCRIPT
chmod +x "$LAUNCHER"

# Desktop shortcut on Mac
if [ "$OS" = "mac" ]; then
  SHORTCUT="$HOME/Desktop/🐐 GOAT Royalty App.command"
  cat > "$SHORTCUT" <<EOF
#!/usr/bin/env bash
"$LAUNCHER"
EOF
  chmod +x "$SHORTCUT"
  echo -e "${GREEN}✅ Desktop shortcut created: ~/Desktop/🐐 GOAT Royalty App.command${NC}"
fi

# Desktop shortcut on Linux
if [ "$OS" = "linux" ] && [ -d "$HOME/Desktop" ]; then
  cat > "$HOME/Desktop/goat-royalty-app.desktop" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=🐐 GOAT Royalty App
Comment=DJ Speedy + Waka Flocka AI Studio
Exec=$LAUNCHER
Terminal=true
Categories=Audio;Music;
EOF
  chmod +x "$HOME/Desktop/goat-royalty-app.desktop"
  echo -e "${GREEN}✅ Desktop shortcut created${NC}"
fi

cat <<DONE

${GREEN}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          ✅  INSTALL COMPLETE!                               ║
║                                                              ║
║   Install location: $INSTALL_DIR
║                                                              ║
║   To launch:                                                 ║
║     bash $LAUNCHER
║                                                              ║
║   Or double-click the 🐐 icon on your Desktop.               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${NC}

${CYAN}🚀 Starting the app now...${NC}

DONE

# Launch it right now
exec "$LAUNCHER"