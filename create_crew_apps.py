#!/usr/bin/env python3
"""
GOAT Force Crew App Launcher Generator
=======================================
Master script: swap the agent name to build a matching .app bundle for any crew member.
Uses Waka's Lexi.app as the template and produces lightweight macOS launchers that
start the shared GOAT services (Ollama, Intel, Oscar, web) then open the agent's web
page in Chrome app mode.

Usage:
  python3 create_crew_apps.py              # build all crew members below
  python3 create_crew_apps.py --agent lexi   # build only one

To add a new crew member, just append a dict to the CREW list or change the
variables in the SINGLE_AGENT block at the bottom of the file.
"""

import os
import shutil
import stat
import subprocess
import sys
import argparse
from pathlib import Path
from xml.sax.saxutils import escape

# ─────────────────────────────────────────────────────────────────────────────
# 1. CREW ROSTER — edit here to add or modify agents.
#    Each entry maps to an .app bundle and a web-app launcher page.
# ─────────────────────────────────────────────────────────────────────────────
CREW = [
    {
        "key": "moneypenny",
        "app_name": "Ms. Money Penny — OG",
        "display_name": "Ms. Money Penny",
        "agent_num": "00",
        "codename": "THE OG",
        "role": "Intelligence Director · PARENT of all agents",
        "web_page": "money-penny-launcher.html",
        "bundle_id": "com.goatforce.moneypenny.launcher",
        "accent": "#d4a03c",
    },
    {
        "key": "thegoat",
        "app_name": "THE GOAT — Supreme Commander",
        "display_name": "THE GOAT",
        "agent_num": "001",
        "codename": "SUPREME COMMANDER",
        "role": "Supreme Commander — answers only to DJ Speedy and Waka Flocka Flame",
        "web_page": "the-goat-launcher.html",
        "bundle_id": "com.goatforce.thegoat.launcher",
        "accent": "#FFD700",
    },
    {
        "key": "oscar",
        "app_name": "Master Oscar — DEALMAKER",
        "display_name": "Master Oscar",
        "agent_num": "002",
        "codename": "DEALMAKER",
        "role": "Operations and contracts",
        "web_page": "master-oscar-launcher.html",
        "bundle_id": "com.goatforce.masteroscar.launcher",
        "accent": "#58a6ff",
    },
    {
        "key": "vanessa",
        "app_name": "Ms. Vanessa — ICON",
        "display_name": "Ms. Vanessa",
        "agent_num": "003",
        "codename": "ICON",
        "role": "Brand and PR",
        "web_page": "vanessa-launcher.html",
        "bundle_id": "com.goatforce.vanessa.launcher",
        "accent": "#e91e8c",
    },
    {
        "key": "nexus",
        "app_name": "Nexus — ORACLE",
        "display_name": "Nexus",
        "agent_num": "004",
        "codename": "ORACLE",
        "role": "Intelligence and trends",
        "web_page": "nexus-launcher.html",
        "bundle_id": "com.goatforce.nexus.launcher",
        "accent": "#1d3557",
    },
    {
        "key": "lexi",
        "app_name": "Waka's Lexi",
        "display_name": "Lexi",
        "agent_num": "005",
        "codename": "THE SPARK",
        "role": "Creative and lyrics",
        "web_page": "lexi-launcher.html",
        "bundle_id": "com.goatforce.lexi.waka",
        "accent": "#e91e8c",
    },
    {
        "key": "codex",
        "app_name": "Sir Codex — SENTINEL",
        "display_name": "Sir Codex",
        "agent_num": "006",
        "codename": "SENTINEL",
        "role": "Technical architect",
        "web_page": "sir-codex-launcher.html",
        "bundle_id": "com.goatforce.sircodex.launcher",
        "accent": "#00d4aa",
    },
    {
        "key": "devin",
        "app_name": "Dr. Devin — WHAT'S UP DOC",
        "display_name": "Dr. Devin",
        "agent_num": "007",
        "codename": "WHAT'S UP DOC",
        "role": "Chief AI strategist",
        "web_page": "dr-devin.html",
        "bundle_id": "com.goatforce.drdevin.launcher",
        "accent": "#3994BC",
    },
    {
        "key": "gonbrazy",
        "app_name": "GONBRAZY — STUDIO BOSS",
        "display_name": "GONBRAZY",
        "agent_num": "—",
        "codename": "STUDIO BOSS",
        "role": "Mixing, mastering, session boss",
        "web_page": "gonbrazy-launcher.html",
        "bundle_id": "com.goatforce.gonbrazy.launcher",
        "accent": "#c1121f",
    },
    {
        "key": "woohdakid",
        "app_name": "Wooh Da Kid — TONY STARKS",
        "display_name": "Wooh Da Kid",
        "agent_num": "—",
        "codename": "TONY STARKS",
        "role": "Beat maestro, production buddy to DJ Speedy, studio manager, tech guru",
        "web_page": "wooh-da-kid-launcher.html",
        "bundle_id": "com.goatforce.woohdakid.launcher",
        "accent": "#d4a03c",
    },
    {
        "key": "hannahmiller",
        "app_name": "Hannah Miller — AMIGO KEEPER",
        "display_name": "Hannah Miller",
        "agent_num": "—",
        "codename": "AMIGO KEEPER",
        "role": "Anigo Alley web keeper — Latin crossover",
        "web_page": "hannah-miller-launcher.html",
        "bundle_id": "com.goatforce.hannahmiller.launcher",
        "accent": "#f0c040",
    },
    {
        "key": "legaleagle",
        "app_name": "Legal Eagle — THE COUNSELOR",
        "display_name": "Legal Eagle",
        "agent_num": "011",
        "codename": "THE COUNSELOR",
        "role": "Music law, IP protection, contract strategy — protects the $3.3B position",
        "web_page": "legal-eagle-launcher.html",
        "bundle_id": "com.goatforce.legaleagle.launcher",
        "accent": "#f39c12",
    },
    {
        "key": "agent007",
        "app_name": "Agent 007 — Field Ops",
        "display_name": "Agent 007",
        "agent_num": "007",
        "codename": "FIELD OPS",
        "role": "Agent 007 operations console",
        "web_page": "agent-007.html",
        "bundle_id": "com.goatforce.agent007.launcher",
        "accent": "#3994BC",
    },
    {
        "key": "wakacrew",
        "app_name": "Waka Crew Launcher",
        "display_name": "Waka Crew",
        "agent_num": "—",
        "codename": "WAKA CREW",
        "role": "Waka Flocka Flame crew dashboard",
        "web_page": "waka-crew-launcher.html",
        "bundle_id": "com.goatforce.wakacrew.launcher",
        "accent": "#c1121f",
    },
    {
        "key": "djspeedycrew",
        "app_name": "DJ Speedy Crew Launcher",
        "display_name": "DJ Speedy Crew",
        "agent_num": "—",
        "codename": "SPEEDY CREW",
        "role": "DJ Speedy command dashboard",
        "web_page": "dj-speedy-crew-launcher.html",
        "bundle_id": "com.goatforce.djspeedycrew.launcher",
        "accent": "#d4a03c",
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# 2. PATHS — adjust if your GOAT project lives elsewhere.
# ─────────────────────────────────────────────────────────────────────────────
TEMPLATE_APP = Path("/Applications/Waka's Lexi.app")
TARGET_DIR = Path("/Applications")
GOAT_APP = Path("/Users/be100radio/GOAT-Royalty-App")
WEB_APP = GOAT_APP / "web-app"


def sanitize_executable_name(name: str) -> str:
    """Strip punctuation and spaces for the Mach-O executable name."""
    return "".join(c for c in name if c.isalnum() or c in "_-").rstrip("-").replace(" ", "-")


def make_info_plist(agent: dict) -> str:
    """Generate the Info.plist for an agent .app bundle."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>launcher</string>
    <key>CFBundleIconFile</key>
    <string>icon.icns</string>
    <key>CFBundleIdentifier</key>
    <string>{escape(agent["bundle_id"])}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>{escape(agent["display_name"])}</string>
    <key>CFBundleDisplayName</key>
    <string>{escape(agent["display_name"])}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>2.0</string>
    <key>CFBundleVersion</key>
    <string>2.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSAppleScriptEnabled</key>
    <true/>
    <key>LSMinimumSystemVersion</key>
    <string>12.0</string>
    <key>NSHumanReadableCopyright</key>
    <string>GOAT Force Records — Waka Flocka Flame / DJ Speedy</string>
</dict>
</plist>
'''


def make_launcher(agent: dict) -> str:
    """Generate the bash launcher for an agent .app bundle."""
    agent_key = agent["key"]
    display = agent["display_name"]
    codename = agent["codename"]
    web_page = agent["web_page"]
    accent = agent["accent"]
    page = f"http://127.0.0.1:8090/{web_page}"
    return f'''#!/bin/bash
# ============================================================
# {display} — {codename} — GOAT Force Launcher
# Generated from Waka's Lexi.app template
# Starts ALL shared services, then opens {display} in Chrome app mode
# Accent: {accent}
# ============================================================

GOAT_APP="/Users/be100radio/GOAT-Royalty-App"
WEB_APP="$GOAT_APP/web-app"
PAGE="{page}"
INTEL_SERVER="$GOAT_APP/goat-intel-server/goat_intel.py"
OSCAR_SERVER="/Volumes/i2i 1/Ms.Money-Penny/Shared/chat_server.py"
OLLAMA_MODEL_STORE="/Volumes/i2i 1/Agent-007-GOAT/Shared/models/ollama_data"
OLLAMA_BIN="/Volumes/i2i 1/USB-Uncensored-LLM-main/Shared/bin/ollama-darwin"
OLLAMA_RUNTIME="/Volumes/i2i 1/Drive-Intake/runtime/ollama"
OLLAMA_PORT="11435"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
LOG="/tmp/{agent_key}-launch.log"

log() {{ echo "[{display}] $*" | tee -a "$LOG"; }}
log "=== {display} {codename} launch: $(date) ==="

# ── 1. Ollama (port 11435 — 56-model shared store) ──────────
if ! curl -s --max-time 2 "http://127.0.0.1:$OLLAMA_PORT/api/tags" >/dev/null 2>&1; then
  log "Starting Ollama on :$OLLAMA_PORT..."
  OLLAMA_CMD=""
  [ -x "$OLLAMA_BIN" ] && OLLAMA_CMD="$OLLAMA_BIN"
  [ -z "$OLLAMA_CMD" ] && OLLAMA_CMD="$(command -v ollama 2>/dev/null)"
  if [ -n "$OLLAMA_CMD" ]; then
    mkdir -p "$OLLAMA_RUNTIME/runners" "$OLLAMA_RUNTIME/tmp" 2>/dev/null || true
    OLLAMA_MODELS="$OLLAMA_MODEL_STORE" \
    OLLAMA_HOME="$OLLAMA_RUNTIME" \
    OLLAMA_RUNNERS_DIR="$OLLAMA_RUNTIME/runners" \
    OLLAMA_TMPDIR="$OLLAMA_RUNTIME/tmp" \
    OLLAMA_HOST="127.0.0.1:$OLLAMA_PORT" \
    OLLAMA_NUM_PARALLEL=2 \
    OLLAMA_MAX_LOADED_MODELS=2 \
    OLLAMA_CONTEXT_LENGTH=8192 \
    OLLAMA_KEEP_ALIVE=15m \
    OLLAMA_ORIGINS="*" \
    HOME="$OLLAMA_RUNTIME" \
    nohup "$OLLAMA_CMD" serve >> /tmp/ollama-11435.log 2>&1 &
    for i in $(seq 1 15); do
      sleep 1
      curl -s --max-time 1 "http://127.0.0.1:$OLLAMA_PORT/api/tags" >/dev/null 2>&1 && break
    done
    MODEL_COUNT=$(curl -s --max-time 3 "http://127.0.0.1:$OLLAMA_PORT/api/tags" 2>/dev/null \
      | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('models',[])))" 2>/dev/null || echo "?")
    log "Ollama ready — $MODEL_COUNT models"
  else
    log "WARN: ollama not found"
  fi
else
  MODEL_COUNT=$(curl -s --max-time 3 "http://127.0.0.1:$OLLAMA_PORT/api/tags" 2>/dev/null \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('models',[])))" 2>/dev/null || echo "?")
  log "Ollama already running — $MODEL_COUNT models"
fi

# ── 2. GOAT Intel Server (port 5500) ────────────────────────
if ! curl -s --max-time 2 "http://127.0.0.1:5500/health" >/dev/null 2>&1; then
  log "Starting Intel server..."
  if [ -f "$INTEL_SERVER" ]; then
    cd "$(dirname "$INTEL_SERVER")"
    nohup python3 "$INTEL_SERVER" >> /tmp/goat-intel.log 2>&1 &
    sleep 2
    log "Intel server started"
  else
    log "WARN: Intel server not found at $INTEL_SERVER"
  fi
else
  log "Intel server already running"
fi

# ── 3. Oscar Chat Server (port 3333) ────────────────────────
if ! curl -s --max-time 2 "http://127.0.0.1:3333/" >/dev/null 2>&1; then
  log "Starting Oscar chat server..."
  if [ -f "$OSCAR_SERVER" ]; then
    cd "$(dirname "$OSCAR_SERVER")"
    nohup python3 "$OSCAR_SERVER" >> /tmp/oscar-chat.log 2>&1 &
    sleep 2
    log "Oscar started"
  else
    log "WARN: Oscar server not found at $OSCAR_SERVER"
  fi
else
  log "Oscar already running"
fi

# ── 4. Web Server (port 8090) ───────────────────────────────
if ! curl -s --max-time 2 "http://127.0.0.1:8090/" >/dev/null 2>&1; then
  log "Starting web server..."
  if [ -d "$WEB_APP" ]; then
    cd "$WEB_APP"
    nohup python3 -m http.server 8090 >> /tmp/goat-web.log 2>&1 &
    for i in $(seq 1 10); do
      sleep 1
      curl -s --max-time 1 "http://127.0.0.1:8090/" >/dev/null 2>&1 && break
    done
    log "Web server ready"
  fi
else
  log "Web server already running"
fi

# ── 5. Notify ───────────────────────────────────────────────
osascript -e "display notification \"All services online. $MODEL_COUNT models loaded.\" with title \"{display} — {codename}\" subtitle \"GOAT Force ready\"" 2>/dev/null

log "Opening {display}: $PAGE"

# ── 6. Open in Chrome app mode ──────────────────────────────
if [ -f "$CHROME" ]; then
  "$CHROME" --app="$PAGE" \
    --window-size=1440,920 \
    --class="{agent_key}GOATForce" \
    --user-data-dir="$HOME/.config/goat-{agent_key}-app" \
    2>/dev/null &
else
  open "$PAGE"
fi
'''


def build_app(agent: dict, force: bool = False) -> tuple[Path, bool]:
    """Create or overwrite the .app bundle for a single agent.

    Returns (app_path, created_now). If the app already exists and force is False,
    it is left untouched and created_now is False.
    """
    app_path = TARGET_DIR / f"{agent['app_name']}.app"

    if app_path.exists() and not force:
        # Leave existing apps intact; only regenerate if forced.
        return app_path, False

    if app_path.exists():
        shutil.rmtree(app_path)

    contents = app_path / "Contents"
    macos = contents / "MacOS"
    resources = contents / "Resources"
    macos.mkdir(parents=True)
    resources.mkdir(parents=True)

    # Write Info.plist
    (contents / "Info.plist").write_text(make_info_plist(agent), encoding="utf-8")

    # Write launcher — always name it "launcher" to match Waka's Lexi.app template
    launcher_path = macos / "launcher"
    launcher_path.write_text(make_launcher(agent), encoding="utf-8")
    launcher_path.chmod(launcher_path.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)

    # Copy icon from template, or use a default if unavailable
    template_icon = TEMPLATE_APP / "Contents/Resources/icon.icns"
    target_icon = resources / "icon.icns"
    if template_icon.exists():
        shutil.copy2(template_icon, target_icon)
    else:
        # Fallback: create a blank placeholder (Finder will show a generic icon)
        target_icon.write_bytes(b"")

    return app_path, True


def verify_app(app_path: Path) -> dict:
    """Check that an .app bundle is well-formed as a simple GOAT launcher."""
    launcher = app_path / "Contents/MacOS/launcher"
    plist = app_path / "Contents/Info.plist"
    icon = app_path / "Contents/Resources/icon.icns"
    checks = {
        "exists": app_path.exists(),
        "info_plist": plist.exists(),
        "launcher": launcher.exists() and os.access(launcher, os.X_OK),
        "icon": icon.exists(),
    }
    return checks


def detect_app_type(app_path: Path) -> str:
    """Describe the kind of .app bundle that already exists."""
    macos = app_path / "Contents/MacOS"
    if not macos.exists():
        return "unknown"
    # GOAT launcher template always uses a bash script named "launcher"
    launcher = macos / "launcher"
    if launcher.exists():
        try:
            first = launcher.open("rb").read(20)
            if first.startswith(b"#!") and b"bash" in first:
                return "goat-launcher"
        except Exception:
            pass
    if any("app_mode_loader" in p.name for p in macos.iterdir() if p.is_file()):
        return "chrome-app"
    if any(p.is_file() for p in macos.iterdir()):
        return "native"
    return "other"


def main():
    parser = argparse.ArgumentParser(description="Generate GOAT Force crew .app launchers")
    parser.add_argument("--agent", help="Build only the agent with this key (e.g., moneypenny)")
    parser.add_argument("--force", action="store_true", help="Overwrite existing .app bundles")
    parser.add_argument("--list", action="store_true", help="Print the crew roster and exit")
    args = parser.parse_args()

    if args.list:
        print("\nGOAT Force Crew Roster")
        print("=" * 60)
        for a in CREW:
            print(f"{a['agent_num']:>3}  {a['display_name']:<22} {a['codename']:<18} → {a['web_page']}")
        print(f"\nTotal: {len(CREW)} crew members\n")
        return

    agents = [a for a in CREW if a["key"] == args.agent] if args.agent else CREW
    if not agents:
        print(f"Unknown agent key: {args.agent}")
        print("Run with --list to see available agents.")
        sys.exit(1)

    print(f"\nBuilding {len(agents)} GOAT Force app launcher(s)...\n")
    results = []
    for agent in agents:
        app_path, created_now = build_app(agent, force=args.force)
        if created_now:
            checks = verify_app(app_path)
            status = "OK" if all(checks.values()) else "CHECK FAILED"
        else:
            app_type = detect_app_type(app_path)
            if app_type == "goat-launcher":
                checks = verify_app(app_path)
                status = "OK (existing)" if all(checks.values()) else "CHECK FAILED"
            else:
                status = f"EXISTS ({app_type})"
        results.append((agent, app_path, status))
        print(f"[{status:<20}] {agent['display_name']:<22} → {app_path}")

    print("\n" + "=" * 60)
    created = sum(1 for _, _, s in results if s == "OK")
    skipped = sum(1 for _, _, s in results if s.startswith("EXISTS"))
    print(f"Created: {created} | Skipped existing: {skipped} | Total checked: {len(results)}")
    print(f"Template used: {TEMPLATE_APP}")
    print("\nTo add a new crew member, edit CREW in this script or run:")
    print("  python3 create_crew_apps.py --agent <key> --force")


if __name__ == "__main__":
    main()
