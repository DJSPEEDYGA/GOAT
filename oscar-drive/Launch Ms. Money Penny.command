#!/bin/bash
# Launch Ms. Money Penny (GOAT Royalty AI command center)
cd "$(dirname "$0")"

ROOT="/Volumes/Oscar/Master-Oscar"
SCRIPT="$ROOT/Shared/scripts/start-goat-royalty.sh"

# Start the GOAT backend if it isn't running
if ! curl -s --max-time 2 http://127.0.0.1:8090/moneypenny.html > /dev/null 2>&1; then
  echo "Starting GOAT backend for Ms. Money Penny..."
  nohup bash "$SCRIPT" > /tmp/ms-money-penny-backend.log 2>&1 &
  disown
  sleep 8
fi

echo "Opening Ms. Money Penny..."
open "http://localhost:8090/moneypenny.html" 2>/dev/null || \
open "http://127.0.0.1:8090/moneypenny.html" 2>/dev/null || true
