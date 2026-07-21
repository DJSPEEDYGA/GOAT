-- GOAT Force Pro Tools Session Opener
-- Usage: osascript pt_open_session.applescript "/path/to/session.ptx"
-- Dr. Devin (Agent 007) — Pro Tools Automation Bridge

on run argv
    set sessionPath to item 1 of argv
    
    -- Launch Pro Tools if not running
    tell application "System Events"
        set ptRunning to (count of (processes whose name is "Pro Tools")) > 0
    end tell
    
    if not ptRunning then
        tell application "Pro Tools" to activate
        delay 5
    else
        tell application "Pro Tools" to activate
        delay 1
    end if
    
    -- Open the session file via Finder
    tell application "Finder"
        open (POSIX file sessionPath as alias)
    end tell
    
    delay 3
    
    -- Bring Pro Tools to front
    tell application "Pro Tools" to activate
    
    return "Opened: " & sessionPath
end run
