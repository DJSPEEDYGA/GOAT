#!/usr/bin/env bash
# GOAT Force — Oscar launch script
# Starts Ollama + Oscar's chat server and opens the Oscar Console.
# Works on Mac (OSCAR drive) and Linux (VPS). Usage:  ./start-oscar.sh [model]

set -e

GOLD='\033[1;33m'; PURPLE='\033[1;35m'; DIM='\033[2m'; NC='\033[0m'

echo -e "${GOLD}"
cat <<'LOGO'
        ___________
       /           \
      /  /\     /\  \        ██████╗ ███████╗ ██████╗ █████╗ ██████╗
     |  ( o)   (o )  |      ██╔═══██╗██╔════╝██╔════╝██╔══██╗██╔══██╗
     |      | |      |      ██║   ██║███████╗██║     ███████║██████╔╝
      \    (___)    /       ██║   ██║╚════██║██║     ██╔══██║██╔══██╗
       \  \_____/  /        ╚██████╔╝███████║╚██████╗██║  ██║██║  ██║
        \_________/          ╚═════╝ ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝
          🐐 GOAT FORCE  •  OSCAR  •  Master Ops Brain
LOGO
echo -e "${NC}"

MODEL="${1:-${OSCAR_MODEL:-llama3.2:1b}}"
PORT="${CHAT_SERVER_PORT:-3333}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OSCAR_DIR="$SCRIPT_DIR/apps/nextjs-commerce/web-app/usb-ai/Shared"
[ -f "$OSCAR_DIR/chat_server.py" ] || OSCAR_DIR="$SCRIPT_DIR"

echo -e "${PURPLE}[1/3] Ollama${NC}"
if ! command -v ollama >/dev/null 2>&1; then
  echo "  Ollama not installed. Mac: brew install ollama   Linux: curl -fsSL https://ollama.com/install.sh | sh"
  exit 1
fi
if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
  echo "  starting ollama serve…"
  nohup ollama serve >/dev/null 2>&1 &
  sleep 3
fi
ollama list | grep -q "${MODEL%%:*}" || { echo "  pulling $MODEL…"; ollama pull "$MODEL"; }
echo "  ✓ Ollama ready ($MODEL)"

echo -e "${PURPLE}[2/3] Oscar server${NC}"
cd "$OSCAR_DIR"
echo "  serving from: $OSCAR_DIR"

echo -e "${PURPLE}[3/3] Launch${NC}"
IP=$(hostname -I 2>/dev/null | awk '{print $1}')
[ -z "$IP" ] && IP=$(ipconfig getifaddr en0 2>/dev/null || echo 127.0.0.1)
echo -e "  ${GOLD}Oscar Console:${NC}  http://localhost:$PORT/"
echo -e "  ${GOLD}From other devices:${NC}  http://$IP:$PORT/"
echo -e "  ${DIM}Ctrl+C to stop Oscar${NC}"
echo

exec python3 chat_server.py
