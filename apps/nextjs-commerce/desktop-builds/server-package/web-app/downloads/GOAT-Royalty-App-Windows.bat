@echo off
title GOAT Royalty App
echo.
echo  ========================================
echo   GOAT ROYALTY APP v1.0.0
echo   by Harvey L. Miller Jr. (DJ Speedy)
echo  ========================================
echo.
echo  Launching GOAT Royalty App...
echo.

set URL=https://sites.super.myninja.ai/ded9966f-cabf-45d4-8882-ef2a965c9895/3441f8fd/index.html

REM Try Chrome in app mode
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="%URL%" --start-maximized
    exit 0
)

REM Try Edge in app mode
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="%URL%" --start-maximized
    exit 0
)

REM Fallback to default browser
start "" "%URL%"
exit 0
