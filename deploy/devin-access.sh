#!/bin/bash
# Gives Devin a temporary shell on this server via tmate (outbound tunnel),
# used when the server's network blocks Devin's IP range.
# Run as root, then send Devin the "ssh session" line it prints.
set -u
export DEBIAN_FRONTEND=noninteractive
command -v tmate >/dev/null 2>&1 || { apt-get update -qq && apt-get install -y -qq tmate; }
SOCK=/tmp/devin-tmate.sock
tmate -S "$SOCK" kill-session 2>/dev/null
tmate -S "$SOCK" new-session -d
tmate -S "$SOCK" wait tmate-ready
echo "================ SEND THIS LINE TO DEVIN ================"
tmate -S "$SOCK" display -p '#{tmate_ssh}'
echo "========================================================="
echo "(Session stays open until reboot or: tmate -S $SOCK kill-session)"
