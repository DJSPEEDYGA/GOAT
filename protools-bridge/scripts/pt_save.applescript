-- GOAT Force Pro Tools Save Session
-- Dr. Devin (Agent 007) — Pro Tools Automation Bridge

on run
    tell application "Pro Tools" to activate
    delay 0.5
    
    tell application "System Events"
        tell process "Pro Tools"
            keystroke "s" using command down
        end tell
    end tell
    
    delay 1
    return "Session saved"
end run
