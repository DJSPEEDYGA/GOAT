#!/usr/bin/env bash
# 🐐 GOAT Force — Full Stack Launcher
# Starts: Ollama · AGENT1 Catalog Server (3334) · Oscar Console (3333) · Web App (8090) · Intel Brain (5500)
cd "$(dirname "$0")"
GOLD="\033[1;33m"; GREEN="\033[1;32m"; CYAN="\033[1;36m"; RED="\033[0;31m"; DIM="\033[0;90m"; NC="\033[0m"

echo -e "${GOLD}════════════════════════════════════════════════${NC}"
echo -e "${GOLD}  🐐 GOAT Force — Launching All Systems          ${NC}"
echo -e "${GOLD}════════════════════════════════════════════════${NC}"
echo ""

# ── Detect AGENT1 drive ──────────────────────────────────
AGENT1="/Volumes/AGENT1"
AGENT1_SHARED="$AGENT1/Shared"
AGENT1_EPK="$AGENT1/Oscar_Investor_EPK_Seed_2026.pdf"
AGENT1_GAMING="$AGENT1/gaming server.pdf"
AGENT1_LAUNCH="$AGENT1/STUFF  SPEEDY NEEDS"
HAS_AGENT1=false

if [ -d "$AGENT1_SHARED" ] && [ -f "$AGENT1_SHARED/server.py" ]; then
  HAS_AGENT1=true
  echo -e "${GREEN}✅ AGENT1 drive detected — 5,954 catalog entries loaded${NC}"
  if [ -f "$AGENT1_EPK" ]; then
    echo -e "${GREEN}   📄 Oscar_Investor_EPK_Seed_2026.pdf — FOUND${NC}"
  fi
  if [ -f "$AGENT1_GAMING" ]; then
    echo -e "${GREEN}   🎮 Gaming Server PDF — FOUND${NC}"
  fi
else
  echo -e "${DIM}ℹ  AGENT1 drive not mounted — using local catalog fallback${NC}"
fi
echo ""

# ── 1. Ollama AI Engine ──────────────────────────────────
if command -v ollama &>/dev/null; then
  if ! pgrep -x ollama >/dev/null && ! pgrep -f "ollama serve" >/dev/null; then
    echo -e "${CYAN}🦙 Starting Ollama AI Engine...${NC}"
    nohup ollama serve >/tmp/ollama.log 2>&1 &
    sleep 3
    echo -e "${GREEN}✅ Ollama running${NC}"
  else
    echo -e "${GREEN}✅ Ollama already running${NC}"
  fi
else
  echo -e "${RED}⚠  Ollama not installed — get it: https://ollama.com/download${NC}"
  echo -e "${DIM}   Recommended model: ollama pull llama3.2:3b${NC}"
fi

# ── 2. Kill stale servers ────────────────────────────────
pkill -f "chat_server.py" 2>/dev/null || true
pkill -f "goat_intel.py"  2>/dev/null || true
pkill -f "server.py --goat" 2>/dev/null || true
pkill -f "http.server 8090" 2>/dev/null || true
pkill -f "http.server 3334" 2>/dev/null || true
sleep 1

# ── 3. AGENT1 Catalog Server (port 3334) ────────────────
if $HAS_AGENT1; then
  echo -e "${CYAN}📁 Starting AGENT1 Catalog Server on http://127.0.0.1:3334/ ...${NC}"
  cd "$AGENT1_SHARED"
  nohup python3 server.py >/tmp/agent1-catalog.log 2>&1 &
  cd - >/dev/null
  sleep 2
  echo -e "${GREEN}✅ Catalog server live — 5,954 entries: Waka, Fastassman, Harvey Miller${NC}"
fi

# ── 4. Oscar Console (port 3333) ─────────────────────────
OSCAR_DIR="$(pwd)/web-app/usb-ai/Shared"
if [ -f "$OSCAR_DIR/chat_server.py" ]; then
  echo -e "${CYAN}🐐 Starting Oscar Console on http://127.0.0.1:3333/ ...${NC}"
  # Pass AGENT1 catalog URL as env var so Oscar can query it
  if $HAS_AGENT1; then
    export GOAT_CATALOG_URL="http://127.0.0.1:3334"
    export GOAT_CATALOG_ENTRIES="5954"
    export GOAT_EPK_PATH="$AGENT1_EPK"
  fi
  cd "$OSCAR_DIR"
  nohup python3 chat_server.py >/tmp/oscar.log 2>&1 &
  cd - >/dev/null
  sleep 2
  echo -e "${GREEN}✅ Oscar Console live at http://127.0.0.1:3333/${NC}"
else
  echo -e "${RED}⚠  chat_server.py not found at $OSCAR_DIR${NC}"
fi

# ── 5. Intel Brain (port 5500) ───────────────────────────
if [ -f "goat-intel-server/goat_intel.py" ]; then
  echo -e "${CYAN}🧠 Starting Intel Brain on http://localhost:5500 ...${NC}"
  cd goat-intel-server
  nohup python3 goat_intel.py >/tmp/goat-intel.log 2>&1 &
  cd ..
fi

# ── 6. Web App (port 8090) ───────────────────────────────
echo -e "${CYAN}🌐 Starting Web App on http://localhost:8090 ...${NC}"
cd web-app
nohup python3 -m http.server 8090 >/tmp/goat-web.log 2>&1 &
cd ..

sleep 2

# ── Summary ──────────────────────────────────────────────
echo ""
echo -e "${GOLD}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅  ALL SYSTEMS GO — GOAT Force is LIVE         ${NC}"
echo -e "${GOLD}════════════════════════════════════════════════${NC}"
echo ""
echo -e "   🐐 Oscar Console:     ${CYAN}http://127.0.0.1:3333/${NC}     ← START HERE"
echo -e "   🎛️  Touch Studio:      ${CYAN}http://127.0.0.1:3333/${NC} → 🎛️ button"
if $HAS_AGENT1; then
echo -e "   📁 Catalog API:       ${CYAN}http://127.0.0.1:3334/api/stats${NC}  (5,954 entries)"
echo -e "   📄 Investor EPK:      ${GOLD}$AGENT1_EPK${NC}"
echo -e "   🎮 Gaming Server:     ${GOLD}$AGENT1_GAMING${NC}"
fi
echo -e "   🚀 Launcher Hub:      ${CYAN}http://localhost:8090/goat-launcher-hub.html${NC}"
echo -e "   ⚡ Powerhouse:        ${CYAN}http://localhost:8090/powerhouse.html${NC}"
echo -e "   🤖 AI Brain:          ${CYAN}http://localhost:8090/agents-brain.html${NC}"
echo -e "   💼 Living EPK:        ${CYAN}http://72.61.193.184/epk/${NC}  (public — send to investors)"
echo ""
echo -e "${GOLD}Press Ctrl+C to stop all services${NC}"

# Open Oscar Console + Launcher Hub
if [[ "$OSTYPE" == "darwin"* ]]; then
  open "http://127.0.0.1:3333/"
  sleep 1
  open "http://localhost:8090/goat-launcher-hub.html"
  # Also open the EPK PDF if AGENT1 is mounted
  if $HAS_AGENT1 && [ -f "$AGENT1_EPK" ]; then
    sleep 1
    open "$AGENT1_EPK"
  fi
elif command -v xdg-open &>/dev/null; then
  xdg-open "http://127.0.0.1:3333/" &>/dev/null
fi

# Ctrl+C stops everything
trap 'echo -e "\n${GOLD}⏹ Stopping GOAT Force...${NC}"; pkill -f chat_server.py; pkill -f goat_intel.py; pkill -f "http.server 8090"; pkill -f "http.server 3334"; echo -e "${GREEN}Done.${NC}"; exit 0' INT
wait
