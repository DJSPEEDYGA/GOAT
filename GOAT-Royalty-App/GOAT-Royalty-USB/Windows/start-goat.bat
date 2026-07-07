@echo off
title GOAT Royalty App - Portable USB Edition
color 0A
cls

echo.
echo  ================================================================
echo          GOAT ROYALTY APP - PORTABLE USB EDITION
echo          Version 2.0.0 - Uncensored AI Powered
echo  ================================================================
echo.
echo  [INFO] Detecting system and initializing...
echo.

REM Detect architecture
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    set "ARCH=x64"
    echo  [OK] Detected: 64-bit Windows
) else (
    set "ARCH=x86"
    echo  [OK] Detected: 32-bit Windows
)

REM Set paths
set "USB_ROOT=%~dp0.."
set "SHARED=%USB_ROOT%\Shared"
set "CATALOG=%SHARED%\catalog"
set "MODELS=%SHARED%\models"
set "CHAT_DATA=%SHARED%\chat_data"

echo.
echo  [INFO] Starting GOAT Royalty App...
echo  [INFO] Catalog: %CATALOG%
echo  [INFO] AI Models: %MODELS%
echo.

REM Check if Python portable exists
if exist "%SHARED%\python\python.exe" (
    echo  [OK] Found portable Python
    set "PYTHON=%SHARED%\python\python.exe"
) else (
    echo  [INFO] Using system Python
    set "PYTHON=python"
)

REM Check if AI models are downloaded
if exist "%MODELS%\*.gguf" (
    echo  [OK] AI Models detected
) else (
    echo  [INFO] No AI models found. Run install.bat to download.
)

REM Start the local server
echo.
echo  [INFO] Starting local server on port 3333...
echo  [INFO] Opening browser...
echo.

REM Create temporary Python server script
echo import http.server > "%TEMP%\goat_server.py"
echo import socketserver >> "%TEMP%\goat_server.py"
echo import webbrowser >> "%TEMP%\goat_server.py"
echo import os >> "%TEMP%\goat_server.py"
echo. >> "%TEMP%\goat_server.py"
echo PORT = 3333 >> "%TEMP%\goat_server.py"
echo os.chdir(r"%USB_ROOT%\Shared\catalog") >> "%TEMP%\goat_server.py"
echo. >> "%TEMP%\goat_server.py"
echo Handler = http.server.SimpleHTTPRequestHandler >> "%TEMP%\goat_server.py"
echo with socketserver.TCPServer(("", PORT), Handler) as httpd: >> "%TEMP%\goat_server.py"
echo     print(f"GOAT Royalty App running at http://localhost:{PORT}") >> "%TEMP%\goat_server.py"
echo     webbrowser.open(f"http://localhost:{PORT}") >> "%TEMP%\goat_server.py"
echo     httpd.serve_forever() >> "%TEMP%\goat_server.py"

start "" "%PYTHON%" "%TEMP%\goat_server.py"

echo.
echo  ================================================================
echo   GOAT Royalty App is now running!
echo   Access at: http://localhost:3333
echo  
echo   Features:
echo   - 5,954+ Music Catalog Entries
echo   - AI-Powered Search (Uncensored)
echo   - Voice Commands
echo   - Offline Capable
echo  
echo   Press Ctrl+C to stop the server
echo  ================================================================
echo.

pause