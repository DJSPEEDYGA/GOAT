#!/bin/bash

# GOAT Force Command Center Launcher
# Start the Command Center Server and open the dashboard

echo "🐐 GOAT Force Command Center Launcher"
echo "======================================"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check if required packages are installed
echo "📦 Checking dependencies..."
python3 -c "import flask, flask_cors, psutil" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📥 Installing required packages..."
    pip3 install flask flask-cors psutil requests
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting GOAT Force Command Center Server..."
echo "📡 API Server will be available at: http://localhost:8080"
echo "🎛️  Command Center will open in your browser"
echo ""

# Start the server in background
cd "$SCRIPT_DIR"
python3 command-center-server.py &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Open the command center in default browser
if command -v open &> /dev/null; then
    open "$SCRIPT_DIR/goat-command-center.html"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$SCRIPT_DIR/goat-command-center.html"
else
    echo "🌐 Please open this file in your browser:"
    echo "   $SCRIPT_DIR/goat-command-center.html"
fi

echo ""
echo "✅ GOAT Force Command Center is running!"
echo "🔄 Server PID: $SERVER_PID"
echo "🛑 To stop: Press Ctrl+C or run: kill $SERVER_PID"
echo ""

# Wait for user to stop
wait $SERVER_PID