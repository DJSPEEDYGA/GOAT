#!/bin/bash
# GOAT Force Pro Tools Bridge — Start Script
# Dr. Devin (Agent 007)

BRIDGE_DIR="$(dirname "$0")"

echo ""
echo "  =================================="
echo "  GOAT FORCE PRO TOOLS BRIDGE"
echo "  Dr. Devin — Agent 007"
echo "  =================================="

# Make control script executable
chmod +x "$BRIDGE_DIR/scripts/pt_controls.sh"

# Check for ffmpeg
if ! command -v ffmpeg &>/dev/null; then
    echo "  [WARN] ffmpeg not found — install with: brew install ffmpeg"
fi

# Check for pyloudnorm
python3 -c "import pyloudnorm" 2>/dev/null || {
    echo "  Installing pyloudnorm + soundfile..."
    pip3 install pyloudnorm soundfile --quiet
}

# Kill any existing bridge on port 7007
lsof -ti:7007 | xargs kill -9 2>/dev/null

# Start the bridge server
echo "  Opening dashboard at http://localhost:7007"
sleep 1 && open "http://localhost:7007" &
python3 "$BRIDGE_DIR/bridge_server.py"
