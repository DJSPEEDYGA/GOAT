#!/bin/bash
# Stop Oscar — kills the Oscar server running on port 3333.
PORT=3333
PIDS=$(lsof -ti tcp:$PORT)
if [ -n "$PIDS" ]; then
  echo "$PIDS" | xargs kill
  echo "Oscar stopped."
else
  echo "Oscar wasn't running."
fi
read -r -p "Press Enter to close..."
