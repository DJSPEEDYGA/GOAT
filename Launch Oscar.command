#!/bin/bash
# ============================================================
#  Launch Oscar  —  GOAT Royalty App
#  Double-click me on your Mac.
#
#  What I do, every time:
#   1. Find the OSCAR drive
#   2. Pull the latest Oscar from GitHub (DJSPEEDYGA/GOAT)
#      onto the OSCAR drive (first run clones, after that updates)
#   3. Make sure Ollama (the local AI engine) is running
#      with a model, so Oscar can actually talk
#   4. Start Oscar's server and open the Oscar Console
# ============================================================
set -u

REPO_URL="https://github.com/DJSPEEDYGA/GOAT.git"
BRANCH="devin/consolidate-master"
OSCAR_SUBDIR="live-server/srv1148455/code/oscar"   # the real 9.5k-line Oscar
PORT=3333
MODEL_SMALL="llama3.2:1b"

say_step() { printf "\n\033[1;33m==> %s\033[0m\n" "$1"; }
fail()     { printf "\n\033[1;31mXX  %s\033[0m\n" "$1"; read -r -p "Press Enter to close..."; exit 1; }

# ---------- 1. Find the OSCAR drive ----------
say_step "Looking for the OSCAR drive..."
DRIVE=""
for v in "/Volumes/OSCAR" "/Volumes/Oscar" "/Volumes/OSCAR DRIVE"; do
  [ -d "$v" ] && DRIVE="$v" && break
done
if [ -z "$DRIVE" ]; then
  echo "Couldn't find a drive named OSCAR under /Volumes."
  echo "Available drives:"
  ls /Volumes
  read -r -p "Type the drive name to use (or press Enter to run from this folder instead): " PICK
  if [ -n "$PICK" ]; then
    DRIVE="/Volumes/$PICK"
    [ -d "$DRIVE" ] || fail "No drive at $DRIVE"
  else
    DRIVE="$(cd "$(dirname "$0")" && pwd)"
  fi
fi
echo "Using: $DRIVE"

# ---------- 2. Get / update Oscar from GitHub ----------
GOAT_DIR="$DRIVE/GOAT"
command -v git >/dev/null 2>&1 || fail "git is not installed. Install Xcode Command Line Tools: xcode-select --install"

if [ -d "$GOAT_DIR/.git" ]; then
  say_step "Updating Oscar from GitHub (pulling latest changes)..."
  git -C "$GOAT_DIR" fetch origin "$BRANCH" || fail "Couldn't reach GitHub. Check your internet."
  git -C "$GOAT_DIR" checkout "$BRANCH" >/dev/null 2>&1
  git -C "$GOAT_DIR" pull --ff-only origin "$BRANCH" || echo "(couldn't fast-forward — using the copy already on the drive)"
else
  say_step "First run — downloading Oscar from GitHub onto the OSCAR drive..."
  git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$GOAT_DIR" || fail "Clone failed. Check your internet / GitHub access."
fi

OSCAR_DIR="$GOAT_DIR/$OSCAR_SUBDIR"
[ -f "$OSCAR_DIR/chat_server.py" ] || fail "chat_server.py not found at $OSCAR_DIR"
echo "Oscar code ready at: $OSCAR_DIR"

# ---------- 3. Local AI engine (Ollama) ----------
say_step "Checking the local AI engine (Ollama)..."
if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama isn't installed. Get it from https://ollama.com/download (or: brew install ollama)."
  echo "Oscar will still start, but replies need Ollama."
else
  if ! curl -s --max-time 2 http://127.0.0.1:11434/api/version >/dev/null; then
    echo "Starting Ollama..."
    (ollama serve >/dev/null 2>&1 &)
    sleep 3
  fi
  if ! ollama list 2>/dev/null | awk 'NR>1{print $1}' | grep -q .; then
    echo "No model yet — downloading a small one ($MODEL_SMALL)..."
    ollama pull "$MODEL_SMALL" || echo "(model download failed — you can run: ollama pull $MODEL_SMALL)"
  fi
  echo "Ollama OK."
fi

# ---------- 4. Start Oscar ----------
say_step "Starting Oscar's server on port $PORT..."
command -v python3 >/dev/null 2>&1 || fail "python3 is not installed. Install Xcode Command Line Tools: xcode-select --install"

# stop a previous copy if one is running
lsof -ti tcp:$PORT | xargs kill 2>/dev/null

cd "$OSCAR_DIR" || fail "Couldn't enter $OSCAR_DIR"
nohup python3 chat_server.py > "$OSCAR_DIR/oscar_server.log" 2>&1 &

# wait for him to come up
for i in $(seq 1 20); do
  sleep 1
  if curl -s -o /dev/null "http://127.0.0.1:$PORT/"; then break; fi
  [ "$i" = 20 ] && fail "Oscar didn't start. Check the log: $OSCAR_DIR/oscar_server.log"
done

say_step "Opening the Oscar Console..."
open "http://127.0.0.1:$PORT/OscarConsole.html"

printf "\n\033[1;32mOscar is UP.\033[0m  Console: http://127.0.0.1:%s/OscarConsole.html\n" "$PORT"
echo "Log: $OSCAR_DIR/oscar_server.log"
echo "(You can close this window — Oscar keeps running in the background.)"
read -r -p "Press Enter to close..."
