#!/bin/bash
# GOAT Force FL Studio Controller
# Dr. Devin (Agent 007) — Pro Tools Automation Bridge
# Supports FL Studio 2024 and FL Studio 2025
# Usage: ./fl_controls.sh <command> [version]
#   version: 2024 | 2025 (default: 2025)

VERSION="${2:-2025}"
FL_APP="FL Studio $VERSION"

activate_fl() {
    osascript -e "tell application \"$FL_APP\" to activate" 2>/dev/null
    sleep 0.3
}

launch_fl() {
    osascript -e "tell application \"$FL_APP\" to activate"
    sleep 4
}

send_key() {
    local key="$1"
    local mods="$2"
    if [ -z "$mods" ]; then
        osascript -e "tell application \"System Events\" to tell process \"OsxFL\" to keystroke \"$key\""
    else
        osascript -e "tell application \"System Events\" to tell process \"OsxFL\" to keystroke \"$key\" using {$mods}"
    fi
}

send_key_code() {
    local keycode="$1"
    local mods="$2"
    if [ -z "$mods" ]; then
        osascript -e "tell application \"System Events\" to tell process \"OsxFL\" to key code $keycode"
    else
        osascript -e "tell application \"System Events\" to tell process \"OsxFL\" to key code $keycode using {$mods}"
    fi
}

click_menu() {
    local menu="$1"
    local item="$2"
    osascript <<EOF
tell application "System Events"
    tell process "OsxFL"
        try
            click menu item "$item" of menu "$menu" of menu bar 1
        on error
            keystroke "$item"
        end try
    end tell
end tell
EOF
}

case "$1" in
    launch)
        echo "Launching $FL_APP..."
        osascript -e "tell application \"$FL_APP\" to activate"
        echo "Launched $FL_APP"
        ;;
    play)
        activate_fl
        send_key_code 49  # spacebar — play/pause
        echo "Play/Pause toggled"
        ;;
    stop)
        activate_fl
        send_key_code 49  # spacebar stops too; or use stop button shortcut
        echo "Stopped"
        ;;
    record)
        activate_fl
        # FL Studio: Ctrl+R starts recording (on Mac it's Cmd+R usually or just R in pattern)
        send_key "r" "command down"
        echo "Record toggled"
        ;;
    rewind)
        activate_fl
        # Home key rewinds to start
        send_key_code 115
        echo "Rewound to start"
        ;;
    save)
        activate_fl
        send_key "s" "command down"
        echo "Session saved (Cmd+S)"
        ;;
    save_as)
        activate_fl
        send_key "s" "command down, shift down"
        echo "Save As dialog opened"
        ;;
    new)
        activate_fl
        send_key "n" "command down"
        echo "New project"
        ;;
    open)
        activate_fl
        send_key "o" "command down"
        echo "Open dialog triggered"
        ;;
    export_mp3)
        activate_fl
        # File > Export > MP3 file
        osascript <<'EOF'
tell application "System Events"
    tell process "OsxFL"
        click menu item "Export" of menu "File" of menu bar 1
        delay 0.3
        click menu item "MP3 file..." of menu 1 of menu item "Export" of menu "File" of menu bar 1
    end tell
end tell
EOF
        echo "Export MP3 dialog opened"
        ;;
    export_wav)
        activate_fl
        osascript <<'EOF'
tell application "System Events"
    tell process "OsxFL"
        click menu item "Export" of menu "File" of menu bar 1
        delay 0.3
        click menu item "Wave file..." of menu 1 of menu item "Export" of menu "File" of menu bar 1
    end tell
end tell
EOF
        echo "Export WAV dialog opened"
        ;;
    export_stems)
        activate_fl
        osascript <<'EOF'
tell application "System Events"
    tell process "OsxFL"
        click menu item "Export" of menu "File" of menu bar 1
        delay 0.3
        click menu item "Wave file..." of menu 1 of menu item "Export" of menu "File" of menu bar 1
    end tell
end tell
EOF
        echo "Export dialog opened — select 'Split mixer tracks' in dialog for stems"
        ;;
    mixer)
        activate_fl
        send_key "m" "command down"  # Cmd+M — toggle mixer
        echo "Mixer toggled"
        ;;
    piano_roll)
        activate_fl
        send_key "p" "command down"  # Cmd+P
        echo "Piano Roll opened"
        ;;
    browser)
        activate_fl
        send_key "f8" ""
        echo "Browser toggled"
        ;;
    pattern)
        activate_fl
        send_key "r" "command down, option down"  # Cmd+Option+R — toggle pattern
        echo "Pattern view toggled"
        ;;
    playlist)
        activate_fl
        send_key "t" "command down"  # Cmd+T
        echo "Playlist toggled"
        ;;
    undo)
        activate_fl
        send_key "z" "command down"
        echo "Undo"
        ;;
    redo)
        activate_fl
        send_key "z" "command down, shift down"
        echo "Redo"
        ;;
    tempo_up)
        activate_fl
        # Click in tempo field and nudge up — sends up arrow after activating tempo
        send_key_code 126  # up arrow
        echo "Tempo nudged up"
        ;;
    tempo_down)
        activate_fl
        send_key_code 125  # down arrow
        echo "Tempo nudged down"
        ;;
    close)
        activate_fl
        send_key "w" "command down"
        echo "Project close triggered"
        ;;
    channel_rack)
        activate_fl
        send_key_code 97  # F6
        echo "Channel Rack toggled"
        ;;
    playlist|arrange)
        activate_fl
        send_key_code 96  # F5
        echo "Playlist/Arrange toggled"
        ;;
    plugin_picker|plugin_browser)
        activate_fl
        send_key_code 100  # F8
        echo "Plugin Browser / Picker toggled"
        ;;
    step_sequencer)
        activate_fl
        send_key_code 97  # F6 (Channel Rack/Step Sequencer)
        echo "Step Sequencer / Channel Rack toggled"
        ;;
    live_loops)
        activate_fl
        # FL 2025+ Performance mode (live loops) — Ctrl+F8
        send_key_code 100 "command down"
        echo "Performance / Live Loops mode toggled"
        ;;
    automation)
        activate_fl
        send_key "a" "command down"
        echo "Automation view toggled"
        ;;
    add_track)
        activate_fl
        send_key "t" "command down"
        echo "Add track / playlist track toggled"
        ;;
    mute)
        activate_fl
        send_key "m" "command down"
        echo "Mute selected"
        ;;
    solo)
        activate_fl
        send_key "s" "command down"
        echo "Solo selected"
        ;;
    record_arm)
        activate_fl
        send_key "r" "command down"
        echo "Record-arm selected track"
        ;;
    preferences)
        activate_fl
        send_key "," "command down"
        echo "Preferences opened"
        ;;
    key)
        activate_fl
        KEY="$2"
        MODS="$3"
        if [ -n "$KEY" ]; then
            send_key "$KEY" "$MODS"
            echo "Sent key: $KEY ${MODS:+($MODS)}"
        else
            echo "No key provided"
            exit 1
        fi
        ;;
    window)
        activate_fl
        NAME="$2"
        if [ -n "$NAME" ]; then
            click_menu "Window" "$NAME"
            echo "Opened Window > $NAME"
        else
            echo "No window name provided"
            exit 1
        fi
        ;;
    menu)
        MENU="$2"
        ITEM="$3"
        if [ -n "$MENU" ] && [ -n "$ITEM" ]; then
            click_menu "$MENU" "$ITEM"
            echo "Clicked $MENU > $ITEM"
        else
            echo "Usage: menu <menu> <item>"
            exit 1
        fi
        ;;
    version)
        echo "FL_APP=$FL_APP"
        ;;
    *)
        echo "GOAT Force FL Studio Controller"
        echo "Usage: $0 <command> [2024|2025]"
        echo ""
        echo "Commands:"
        echo "  launch        — Launch FL Studio"
        echo "  play          — Play/Pause (Spacebar)"
        echo "  stop          — Stop"
        echo "  record        — Toggle record"
        echo "  rewind        — Go to start"
        echo "  save          — Save project (Cmd+S)"
        echo "  save_as       — Save As"
        echo "  new           — New project"
        echo "  open          — Open project dialog"
        echo "  export_mp3    — Export > MP3"
        echo "  export_wav    — Export > WAV"
        echo "  export_stems  — Export > WAV (split mixer tracks for stems)"
        echo "  mixer         — Toggle Mixer"
        echo "  piano_roll    — Open Piano Roll"
        echo "  browser       — Toggle Browser"
        echo "  pattern       — Toggle Pattern view"
        echo "  playlist      — Toggle Playlist"
        echo "  undo          — Undo"
        echo "  redo          — Redo"
        echo "  close         — Close project"
        exit 1
        ;;
esac
