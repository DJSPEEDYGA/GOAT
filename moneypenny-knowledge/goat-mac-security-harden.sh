#!/usr/bin/env bash
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOCKET_FILTER="/usr/libexec/ApplicationFirewall/socketfilterfw"

pause() {
  printf '\n'
  read -r -p "Press Enter to continue..."
}

run_audit() {
  printf '\nRunning read-only GOAT security audit...\n'
  bash "$ROOT/scripts/goat-security-audit.sh"
}

secure_agent_local_only() {
  local env_file="$ROOT/config/agent-007.env"
  if ! grep -q '^export AGENT_007_BIND_HOST=' "$env_file"; then
    printf '\nERROR: %s does not look like the expected AGENT-007 env file.\n' "$env_file"
    return 1
  fi
  printf '\nAGENT-007 is configured to bind locally by default:\n'
  grep '^export AGENT_007_BIND_HOST=' "$env_file"
  printf '\nRestart AGENT-007 for this to take effect if it was already running.\n'
}

enable_firewall() {
  printf '\nThis will ask for your Mac password if needed.\n'
  sudo "$SOCKET_FILTER" --setglobalstate on
  sudo "$SOCKET_FILTER" --setstealthmode on
  sudo "$SOCKET_FILTER" --getglobalstate
  sudo "$SOCKET_FILTER" --getstealthmode
}

enable_gatekeeper() {
  printf '\nThis will ask for your Mac password if needed.\n'
  sudo spctl --master-enable
  spctl --status
}

print_sip_filevault_steps() {
  cat <<'EOF'

SIP:
  System Integrity Protection cannot be safely enabled from a normal logged-in desktop.
  To re-enable it:
    1. Restart into macOS Recovery.
    2. Open Utilities > Terminal.
    3. Run: csrutil enable
    4. Restart normally.
    5. Verify with: csrutil status

FileVault:
  Turn on from Apple menu > System Settings > Privacy & Security > FileVault.
  Store the recovery key somewhere safe and not on the same Mac.

If a studio driver or older tool needs SIP disabled, document that exception and keep firewall/drive protections tight.
EOF
}

show_stale_agent_candidates() {
  printf '\nGOAT/AGENT/Ollama launch-agent candidates to review. This does not remove anything.\n\n'
  for f in "$HOME"/Library/LaunchAgents/*.plist /Library/LaunchAgents/*.plist /Library/LaunchDaemons/*.plist; do
    [ -f "$f" ] || continue
    case "$(basename "$f")" in
      *agent*|*Agent*|*goat*|*GOAT*|*ollama*|*Ollama*|*royalty*|*Royalty*)
        printf '==== %s\n' "$f"
        plutil -p "$f" 2>/dev/null | sed -n '1,80p' || sed -n '1,80p' "$f"
        printf '\n'
        ;;
    esac
  done
}

restart_agent007_secure() {
  local label="${AGENT_007_LAUNCH_LABEL:-local.agent007.chatserver}"
  printf '\nAGENT-007 local-only config is ready. macOS may block scripted launchd restarts.\n'
  secure_agent_local_only || true
  cat <<EOF

To apply it without macOS permission popups:

1. Quit the current AGENT-007 app/browser tab.
2. Open Activity Monitor and quit the old Python/AGENT-007 server if needed.
3. Double-click:
   $ROOT/START AGENT-007.command

Then verify:

  lsof -nP -iTCP:3333 -sTCP:LISTEN

Expected secure result:

  TCP 127.0.0.1:3333 (LISTEN)

If it still shows TCP *:3333, the old launchd service is still running and needs to be stopped from your normal user session.
EOF
}

show_menu() {
  clear
  cat <<'EOF'
===================================================
GOAT MAC SECURITY HARDEN
===================================================

This menu is owner-run. It avoids silent destructive changes.

Choose:
  1) Run read-only security audit
  2) Confirm AGENT-007 local-only bind
  3) Enable macOS firewall + stealth mode
  4) Re-enable Gatekeeper
  5) Show SIP + FileVault owner steps
  6) Show GOAT/AGENT launch-agent review candidates
  7) Restart AGENT-007 secure local-only
  8) Quit

EOF
}

while true; do
  show_menu
  read -r -p "Choice [1]: " choice
  choice="${choice:-1}"
  case "$choice" in
    1) run_audit; pause ;;
    2) secure_agent_local_only; pause ;;
    3) enable_firewall; pause ;;
    4) enable_gatekeeper; pause ;;
    5) print_sip_filevault_steps; pause ;;
    6) show_stale_agent_candidates; pause ;;
    7) restart_agent007_secure; pause ;;
    8|q|Q) exit 0 ;;
    *) printf '\nChoose 1-8.\n'; pause ;;
  esac
done
