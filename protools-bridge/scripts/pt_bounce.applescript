-- GOAT Force Pro Tools Bounce to Disk
-- Triggers Bounce to Disk via Pro Tools menu
-- Dr. Devin (Agent 007) — Pro Tools Automation Bridge

on run
    tell application "Pro Tools" to activate
    delay 0.5
    
    tell application "System Events"
        tell process "Pro Tools"
            -- File > Bounce to > Disk...
            click menu item "Bounce to" of menu "File" of menu bar 1
            delay 0.3
            click menu item "Disk..." of menu 1 of menu item "Bounce to" of menu "File" of menu bar 1
        end tell
    end tell
    
    return "Bounce dialog opened"
end run
