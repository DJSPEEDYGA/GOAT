#!/bin/bash
# GOAT Force MPC Controller
# Dr. Devin (Agent 007) — Pro Tools Automation Bridge
# Supports MPC, MPC 3, and MPC Beats
# Usage: ./mpc_controls.sh <command> [app]
#   app: mpc | mpc3 | beats (default: mpc3)

APP_KEY="${2:-mpc3}"

case "$APP_KEY" in
    mpc3)   MPC_APP="MPC 3" ;;
    beats)  MPC_APP="MPC Beats" ;;
    mpc)    MPC_APP="MPC" ;;
    *)      MPC_APP="MPC 3" ;;
esac

activate_mpc() {
    osascript -e "tell application \"$MPC_APP\" to activate" 2>/dev/null
    sleep 0.3
}

send_key() {
    local key="$1"
    local mods="$2"
    if [ -z "$mods" ]; then
        osascript -e "tell application \"System Events\" to tell process \"$MPC_APP\" to keystroke \"$key\""
    else
        osascript -e "tell application \"System Events\" to tell process \"$MPC_APP\" to keystroke \"$key\" using {$mods}"
    fi
}

send_key_code() {
    local keycode="$1"
    local mods="$2"
    if [ -z "$mods" ]; then
        osascript -e "tell application \"System Events\" to tell process \"$MPC_APP\" to key code $keycode"
    else
        osascript -e "tell application \"System Events\" to tell process \"$MPC_APP\" to key code $keycode using {$mods}"
    fi
}

case "$1" in
    launch)
        echo "Launching $MPC_APP..."
        osascript -e "tell application \"$MPC_APP\" to activate"
        sleep 3
        echo "Launched $MPC_APP"
        ;;
    play)
        activate_mpc
        send_key_code 49  # spacebar
        echo "Play/Stop toggled"
        ;;
    stop)
        activate_mpc
        send_key_code 49
        echo "Stopped"
        ;;
    record)
        activate_mpc
        # MPC software: Cmd+R or just R depending on focus
        send_key "r" "command down"
        echo "Record toggled"
        ;;
    rewind)
        activate_mpc
        send_key_code 115  # Home
        echo "Rewound to start"
        ;;
    save)
        activate_mpc
        send_key "s" "command down"
        echo "Project saved"
        ;;
    save_as)
        activate_mpc
        send_key "s" "command down, shift down"
        echo "Save As dialog opened"
        ;;
    new)
        activate_mpc
        send_key "n" "command down"
        echo "New project"
        ;;
    open)
        activate_mpc
        send_key "o" "command down"
        echo "Open dialog triggered"
        ;;
    export)
        activate_mpc
        # MPC software: File > Export
        osascript <<SCPT
tell application "System Events"
    tell process "$MPC_APP"
        try
            click menu item "Export..." of menu "File" of menu bar 1
        on error
            click menu item "Export" of menu "File" of menu bar 1
        end try
    end tell
end tell
SCPT
        echo "Export dialog opened"
        ;;
    export_stems)
        activate_mpc
        osascript <<SCPT
tell application "System Events"
    tell process "$MPC_APP"
        try
            click menu item "Export Stems..." of menu "File" of menu bar 1
        on error
            try
                click menu item "Export" of menu "File" of menu bar 1
                delay 0.3
                click menu item "Export Stems..." of menu 1 of menu item "Export" of menu "File" of menu bar 1
            end try
        end try
    end tell
end tell
SCPT
        echo "Export Stems dialog opened"
        ;;
    undo)
        activate_mpc
        send_key "z" "command down"
        echo "Undo"
        ;;
    redo)
        activate_mpc
        send_key "z" "command down, shift down"
        echo "Redo"
        ;;
    pad_1)
        activate_mpc
        # Trigger pad 1 — MPC software maps pads to number keys or QWERTY
        send_key "1" ""
        echo "Pad 1 triggered"
        ;;
    pad_2)
        activate_mpc
        send_key "2" ""
        echo "Pad 2 triggered"
        ;;
    pad_3)
        activate_mpc
        send_key "3" ""
        echo "Pad 3 triggered"
        ;;
    pad_4)
        activate_mpc
        send_key "4" ""
        echo "Pad 4 triggered"
        ;;
    zoom_in)
        activate_mpc
        send_key "=" "command down"
        echo "Zoom in"
        ;;
    zoom_out)
        activate_mpc
        send_key "-" "command down"
        echo "Zoom out"
        ;;
    fullscreen)
        activate_mpc
        # Cmd+Ctrl+F — macOS fullscreen
        send_key "f" "command down, control down"
        echo "Fullscreen toggled"
        ;;
    close)
        activate_mpc
        send_key "w" "command down"
        echo "Close triggered"
        ;;
    app)
        echo "MPC_APP=$MPC_APP"
        ;;
    *)
        echo "GOAT Force MPC Controller"
        echo "Usage: $0 <command> [mpc3|mpc|beats]"
        echo ""
        echo "Commands:"
        echo "  launch        — Launch MPC app"
        echo "  play          — Play/Stop (Spacebar)"
        echo "  stop          — Stop"
        echo "  record        — Toggle record"
        echo "  rewind        — Go to start"
        echo "  save          — Save project (Cmd+S)"
        echo "  save_as       — Save As"
        echo "  new           — New project"
        echo "  open          — Open project dialog"
        echo "  export        — Export dialog"
        echo "  export_stems  — Export stems"
        echo "  undo          — Undo"
        echo "  redo          — Redo"
        echo "  pad_1..pad_4  — Trigger MPC pads"
        echo "  zoom_in       — Zoom in"
        echo "  zoom_out      — Zoom out"
        echo "  fullscreen    — Toggle fullscreen"
        echo "  close         — Close project"
        echo ""
        echo "App targets:"
        echo "  mpc3  — MPC 3 (default)"
        echo "  mpc   — MPC"
        echo "  beats — MPC Beats"
        exit 1
        ;;
esac
