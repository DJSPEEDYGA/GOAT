#!/bin/bash
# GOAT Force Logic Pro Controller
# Dr. Devin (Agent 007) — Pro Tools Automation Bridge
# Targets "Logic Pro Creator Studio" app
# Usage: ./logic_controls.sh <command>

LOGIC_APP="Logic Pro Creator Studio"

activate_logic() {
    osascript -e "tell application \"$LOGIC_APP\" to activate" 2>/dev/null
    sleep 0.5
}

send_key() {
    local key="$1"
    local mods="$2"
    if [ -z "$mods" ]; then
        osascript -e "tell application \"System Events\" to tell process \"$LOGIC_APP\" to keystroke \"$key\""
    else
        osascript -e "tell application \"System Events\" to tell process \"$LOGIC_APP\" to keystroke \"$key\" using {$mods}"
    fi
}

send_key_code() {
    local keycode="$1"
    local mods="$2"
    if [ -z "$mods" ]; then
        osascript -e "tell application \"System Events\" to tell process \"$LOGIC_APP\" to key code $keycode"
    else
        osascript -e "tell application \"System Events\" to tell process \"$LOGIC_APP\" to key code $keycode using {$mods}"
    fi
}

click_menu() {
    local menu="$1"
    local item="$2"
    osascript <<EOF
tell application "System Events"
    tell process "$LOGIC_APP"
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
        osascript -e "tell application \"$LOGIC_APP\" to activate"
        echo "Launched $LOGIC_APP"
        ;;
    play)
        activate_logic
        send_key_code 49  # spacebar
        echo "Play/Pause toggled"
        ;;
    stop)
        activate_logic
        send_key_code 47  # period
        echo "Stopped"
        ;;
    record)
        activate_logic
        send_key "r" ""
        echo "Record toggled"
        ;;
    rewind)
        activate_logic
        send_key_code 115  # Home/Return
        echo "Rewound to start"
        ;;
    save)
        activate_logic
        send_key "s" "command down"
        echo "Saved"
        ;;
    save_as)
        activate_logic
        send_key "s" "command down, shift down"
        echo "Save As dialog opened"
        ;;
    bounce)
        activate_logic
        send_key "b" "command down"
        echo "Bounce dialog opened"
        ;;
    new)
        activate_logic
        send_key "n" "command down"
        echo "New project"
        ;;
    open)
        activate_logic
        send_key "o" "command down"
        echo "Open dialog triggered"
        ;;
    mixer)
        activate_logic
        send_key "x" "command down"
        echo "Mixer toggled"
        ;;
    library)
        activate_logic
        send_key "y" "command down"
        echo "Library toggled"
        ;;
    smart_controls)
        activate_logic
        send_key "b" "command down"
        echo "Smart Controls toggled"
        ;;
    piano_roll)
        activate_logic
        send_key "p" "command down"
        echo "Piano Roll toggled"
        ;;
    undo)
        activate_logic
        send_key "z" "command down"
        echo "Undo"
        ;;
    redo)
        activate_logic
        send_key "z" "command down, shift down"
        echo "Redo"
        ;;
    zoom_in)
        activate_logic
        send_key "+" "command down"
        echo "Zoomed in"
        ;;
    zoom_out)
        activate_logic
        send_key "-" "command down"
        echo "Zoomed out"
        ;;
    close)
        activate_logic
        send_key "w" "command down"
        echo "Project close triggered"
        ;;
    select_all)
        activate_logic
        send_key "a" "command down"
        echo "Select all"
        ;;
    deselect_all)
        activate_logic
        send_key "a" "command down, shift down"
        echo "Deselect all"
        ;;
    duplicate)
        activate_logic
        send_key "d" "command down"
        echo "Duplicated"
        ;;
    delete)
        activate_logic
        send_key "" ""
        send_key_code 51
        echo "Deleted"
        ;;
    split)
        activate_logic
        send_key '\\' 'command down'
        echo "Split at playhead"
        ;;
    cycle)
        activate_logic
        send_key "c" ""
        echo "Cycle mode toggled"
        ;;
    metronome)
        activate_logic
        send_key "k" ""
        echo "Metronome toggled"
        ;;
    count_in)
        activate_logic
        send_key "k" "shift down"
        echo "Count-in toggled"
        ;;
    tap_tempo)
        activate_logic
        send_key "t" ""
        echo "Tap tempo triggered"
        ;;
    flex)
        activate_logic
        send_key "f" "command down"
        echo "Flex view toggled"
        ;;
    normalize)
        activate_logic
        send_key "a" "control down"
        echo "Normalize triggered (Ctrl+A if custom mapping)"
        ;;
    screenset_1)
        activate_logic
        send_key "1" "command down"
        echo "Screenset 1"
        ;;
    screenset_2)
        activate_logic
        send_key "2" "command down"
        echo "Screenset 2"
        ;;
    show_main_window)
        activate_logic
        send_key "1" "command down"
        echo "Main window shown"
        ;;
    key)
        activate_logic
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
    key_code)
        activate_logic
        CODE="$2"
        MODS="$3"
        if [ -n "$CODE" ]; then
            send_key_code "$CODE" "$MODS"
            echo "Sent key code: $CODE ${MODS:+($MODS)}"
        else
            echo "No key code provided"
            exit 1
        fi
        ;;
    window)
        activate_logic
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
    *)
        echo "GOAT Force Logic Pro Controller"
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  launch          — Launch Logic Pro"
        echo "  play            — Play/Pause (Spacebar)"
        echo "  stop            — Stop"
        echo "  record          — Toggle record"
        echo "  rewind          — Go to start"
        echo "  save            — Save project (Cmd+S)"
        echo "  save_as         — Save As"
        echo "  bounce          — Bounce dialog (Cmd+B)"
        echo "  new             — New project"
        echo "  open            — Open project dialog"
        echo "  mixer           — Toggle Mixer (Cmd+X)"
        echo "  library         — Toggle Library (Cmd+Y)"
        echo "  smart_controls  — Toggle Smart Controls (Cmd+B)"
        echo "  piano_roll      — Toggle Piano Roll (Cmd+P)"
        echo "  undo            — Undo"
        echo "  redo            — Redo"
        echo "  zoom_in         — Zoom in"
        echo "  zoom_out        — Zoom out"
        echo "  close           — Close project"
        echo "  select_all      — Select all"
        echo "  deselect_all    — Deselect all"
        echo "  duplicate       — Duplicate selected"
        echo "  delete          — Delete selected"
        echo "  split           — Split at playhead (Cmd+\\)"
        echo "  cycle           — Toggle cycle mode"
        echo "  metronome       — Toggle metronome"
        echo "  count_in        — Toggle count-in"
        echo "  tap_tempo       — Tap tempo"
        echo "  flex            — Toggle Flex view"
        echo "  normalize       — Normalize (custom mapping)"
        echo "  screenset_1     — Screenset 1"
        echo "  screenset_2     — Screenset 2"
        echo "  show_main_window— Show main window"
        echo "  key <k> [mods]— Send key (mods: command down, option down, ...)"
        echo "  key_code <c> [mods] — Send key code"
        echo "  window <name> — Open Window menu item"
        echo "  menu <menu> <item> — Click any menu item"
        exit 1
        ;;
esac
