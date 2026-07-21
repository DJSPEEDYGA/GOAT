#!/bin/bash
# GOAT Force LUNA Controller
# Dr. Devin (Agent 007) — Pro Tools Automation Bridge
# Targets Universal Audio "LUNA" app
# Usage: ./luna_controls.sh <command>

LUNA_APP="LUNA"

activate_luna() {
    osascript -e "tell application \"$LUNA_APP\" to activate" 2>/dev/null
    sleep 0.5
}

send_key() {
    local key="$1"
    local mods="$2"
    if [ -z "$mods" ]; then
        osascript -e "tell application \"System Events\" to tell process \"$LUNA_APP\" to keystroke \"$key\""
    else
        osascript -e "tell application \"System Events\" to tell process \"$LUNA_APP\" to keystroke \"$key\" using {$mods}"
    fi
}

send_key_code() {
    local keycode="$1"
    local mods="$2"
    if [ -z "$mods" ]; then
        osascript -e "tell application \"System Events\" to tell process \"$LUNA_APP\" to key code $keycode"
    else
        osascript -e "tell application \"System Events\" to tell process \"$LUNA_APP\" to key code $keycode using {$mods}"
    fi
}

case "$1" in
    launch)
        osascript -e "tell application \"$LUNA_APP\" to activate"
        echo "Launched $LUNA_APP"
        ;;
    play)
        activate_luna
        send_key_code 49  # spacebar
        echo "Play/Stop toggled"
        ;;
    stop)
        activate_luna
        send_key "." ""
        echo "Stopped"
        ;;
    record)
        activate_luna
        send_key "*" ""
        echo "Record toggled"
        ;;
    rewind)
        activate_luna
        send_key_code 115  # Home/Return
        echo "Rewound to start"
        ;;
    save)
        activate_luna
        send_key "s" "command down"
        echo "Saved"
        ;;
    save_as)
        activate_luna
        send_key "s" "command down, shift down"
        echo "Save As dialog opened"
        ;;
    bounce)
        activate_luna
        send_key "b" "command down"
        echo "Bounce/Export dialog opened"
        ;;
    new)
        activate_luna
        send_key "n" "command down"
        echo "New session"
        ;;
    open)
        activate_luna
        send_key "o" "command down"
        echo "Open dialog triggered"
        ;;
    mixer)
        activate_luna
        send_key_code 99  # F3 — Mixer view
        echo "Mixer view toggled"
        ;;
    timeline)
        activate_luna
        send_key_code 96  # F2 — Timeline/Edit view
        echo "Timeline view toggled"
        ;;
    browser)
        activate_luna
        send_key "b" "command down, option down"
        echo "Browser toggled"
        ;;
    undo)
        activate_luna
        send_key "z" "command down"
        echo "Undo"
        ;;
    redo)
        activate_luna
        send_key "z" "command down, shift down"
        echo "Redo"
        ;;
    zoom_in)
        activate_luna
        send_key "+" "command down"
        echo "Zoomed in"
        ;;
    zoom_out)
        activate_luna
        send_key "-" "command down"
        echo "Zoomed out"
        ;;
    close)
        activate_luna
        send_key "w" "command down"
        echo "Session close triggered"
        ;;
    *)
        echo "GOAT Force LUNA Controller"
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  launch     — Launch LUNA"
        echo "  play       — Play/Stop (Spacebar)"
        echo "  stop       — Stop"
        echo "  record     — Toggle record"
        echo "  rewind     — Go to start"
        echo "  save       — Save session (Cmd+S)"
        echo "  save_as    — Save As"
        echo "  bounce     — Bounce/Export dialog"
        echo "  new        — New session"
        echo "  open       — Open session dialog"
        echo "  mixer      — Toggle Mixer view (F3)"
        echo "  timeline   — Toggle Timeline view (F2)"
        echo "  browser    — Toggle Browser"
        echo "  undo       — Undo"
        echo "  redo       — Redo"
        echo "  zoom_in    — Zoom in"
        echo "  zoom_out   — Zoom out"
        echo "  close      — Close session"
        exit 1
        ;;
esac
