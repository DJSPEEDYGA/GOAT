@echo off
title GOAT Royalty Launcher
color 0E
setlocal EnableDelayedExpansion

:: ============================================================
::  GOAT ROYALTY - Click Launcher (Windows)
::  DJ Speedy (Harvey L. Miller Jr.)
::  Runs the GOAT web app + links your big Models Drive
:: ============================================================

set "APPDIR=%~dp0"
set "WEBAPP=%APPDIR%web-app"
if not exist "%WEBAPP%\launcher.html" set "WEBAPP=%APPDIR%..\web-app"
set "CONF=%APPDIR%models-drive.txt"
if not exist "%CONF%" if exist "%USERPROFILE%\.goat\models-drive.txt" set "CONF=%USERPROFILE%\.goat\models-drive.txt"

echo.
echo   ============================================
echo      GOAT ROYALTY  -  One Click Launcher
echo      DJ Speedy + Waka Flocka Flame
echo   ============================================
echo.

:: ---------- Models Drive (set once, never re-download) ----------
set "MODELSDRIVE="
if exist "%CONF%" (
  set /p MODELSDRIVE=<"%CONF%"
)
if not defined MODELSDRIVE (
  echo   Link your big Models Drive so AI models are never re-downloaded.
  echo   Example: E:\GOAT-Models   ^(leave blank to skip for now^)
  set /p MODELSDRIVE="  Models drive path: "
  if defined MODELSDRIVE (
    if not exist "%APPDIR%" mkdir "%APPDIR%" 2>nul
    echo !MODELSDRIVE!>"%APPDIR%models-drive.txt"
    set "CONF=%APPDIR%models-drive.txt"
  )
)
if defined MODELSDRIVE (
  if not exist "!MODELSDRIVE!\ollama" mkdir "!MODELSDRIVE!\ollama" 2>nul
  set "OLLAMA_MODELS=!MODELSDRIVE!\ollama"
  set "GOAT_MODELS_DIR=!MODELSDRIVE!"
  echo   [OK] Models Drive linked: !MODELSDRIVE!
  echo        Ollama models  -^> !MODELSDRIVE!\ollama
) else (
  echo   [--] No Models Drive linked yet. Run set-models-drive.bat any time.
)
echo.

:: ---------- Find a way to serve the app ----------
set "PYCMD="
where python >nul 2>nul && set "PYCMD=python"
if not defined PYCMD where py >nul 2>nul && set "PYCMD=py -3"

if defined PYCMD (
  echo   [OK] Starting GOAT web app on http://localhost:8090 ...
  start "GOAT Server" /min cmd /c "cd /d "%WEBAPP%" && %PYCMD% -m http.server 8090"
  timeout /t 2 /nobreak >nul
  start "" "http://localhost:8090/launcher.html"
) else (
  echo   [!!] Python not found - opening app directly ^(live stats need Python^).
  echo        Install Python from https://python.org for the full experience.
  start "" "%WEBAPP%\launcher.html"
)

echo.
echo   GOAT Launcher:  http://localhost:8090/launcher.html
echo   Powerhouse:     http://localhost:8090/powerhouse.html
echo.
echo   Close this window to keep GOAT running in the background.
pause
