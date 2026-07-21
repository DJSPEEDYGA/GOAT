#!/bin/bash
# GOAT Force Pro Tools Keyboard Control Script
# Dr. Devin (Agent 007) — Pro Tools Automation Bridge
# Usage: ./pt_controls.sh <command>

PT_APP="Pro Tools"
SCRIPTS_DIR="$(dirname "$0")"

activate_pt() {
    osascript -e "tell application \"$PT_APP\" to activate" 2>/dev/null
    sleep 0.3
}

send_key() {
    local key="$1"
    local mods="$2"
    if [ -z "$mods" ]; then
        osascript -e "tell application \"System Events\" to tell process \"$PT_APP\" to keystroke \"$key\""
    else
        osascript -e "tell application \"System Events\" to tell process \"$PT_APP\" to keystroke \"$key\" using {$mods}"
    fi
}

send_key_code() {
    local keycode="$1"
    local mods="$2"
    if [ -z "$mods" ]; then
        osascript -e "tell application \"System Events\" to tell process \"$PT_APP\" to key code $keycode"
    else
        osascript -e "tell application \"System Events\" to tell process \"$PT_APP\" to key code $keycode using {$mods}"
    fi
}

case "$1" in
    play)
        activate_pt
        send_key_code 49  # spacebar
        echo "Play/Stop toggled"
        ;;
    stop)
        activate_pt
        send_key_code 49  # spacebar
        echo "Stopped"
        ;;
    record)
        activate_pt
        send_key "r" "command down"
        echo "Record toggled"
        ;;
    rewind)
        activate_pt
        send_key_code 115  # Return/Home
        echo "Rewound to start"
        ;;
    save)
        activate_pt
        osascript "$SCRIPTS_DIR/pt_save.applescript"
        echo "Saved"
        ;;
    bounce)
        activate_pt
        osascript "$SCRIPTS_DIR/pt_bounce.applescript"
        echo "Bounce dialog opened"
        ;;
    open)
        if [ -z "$2" ]; then
            echo "Usage: $0 open /path/to/session.ptx"
            exit 1
        fi
        osascript "$SCRIPTS_DIR/pt_open_session.applescript" "$2"
        echo "Opening: $2"
        ;;
    undo)
        activate_pt
        send_key "z" "command down"
        echo "Undo"
        ;;
    redo)
        activate_pt
        send_key "z" "command down, shift down"
        echo "Redo"
        ;;
    close)
        activate_pt
        send_key "w" "command down"
        echo "Session close triggered"
        ;;
    mix_window)
        activate_pt
        send_key "=" "command down"
        echo "Mix window toggled"
        ;;
    edit_window)
        activate_pt
        send_key "=" "command down, option down"
        echo "Edit window toggled"
        ;;
    zoom_in)
        activate_pt
        send_key "]" "command down"
        echo "Zoomed in"
        ;;
    zoom_out)
        activate_pt
        send_key "[" "command down"
        echo "Zoomed out"
        ;;
    *)
        echo "GOAT Force Pro Tools Controller"
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  play          — Toggle play/stop"
        echo "  stop          — Stop playback"
        echo "  record        — Toggle record"
        echo "  rewind        — Go to start"
        echo "  save          — Save session (Cmd+S)"
        echo "  bounce        — Open Bounce to Disk dialog"
        echo "  open <path>   — Open a .ptx session file"
        echo "  undo          — Undo"
        echo "  redo          — Redo"
        echo "  close         — Close session"
        echo "  mix_window    — Toggle Mix window"
        echo "  edit_window   — Toggle Edit window"
        echo "  zoom_in       — Zoom in"
        echo "  zoom_out      — Zoom out"
        exit 1
        ;;
esac
