#!/bin/bash
# Stop Agent 007 — kills the Agent 007 server running on port 3334.
PORT=3334
PIDS=$(lsof -ti tcp:$PORT)
if [ -n "$PIDS" ]; then
  echo "$PIDS" | xargs kill
  echo "Agent 007 stopped."
else
  echo "Agent 007 wasn't running."
fi
read -r -p "Press Enter to close..."
