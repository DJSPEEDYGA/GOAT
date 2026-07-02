@echo off
title GOAT - Set Models Drive
color 0E
setlocal EnableDelayedExpansion
set "APPDIR=%~dp0"
echo.
echo   ============================================
echo      GOAT ROYALTY  -  Link Models Drive
echo   ============================================
echo.
echo   Point GOAT at the drive that holds your big AI models
echo   (Ollama models, sound libraries) so nothing re-downloads.
echo.
if exist "%APPDIR%models-drive.txt" (
  set /p CURRENT=<"%APPDIR%models-drive.txt"
  echo   Currently linked: !CURRENT!
  echo.
)
set /p MODELSDRIVE="  New models drive path (e.g. E:\GOAT-Models): "
if not defined MODELSDRIVE (
  echo   Nothing entered - keeping current setting.
  pause
  exit /b 0
)
echo %MODELSDRIVE%>"%APPDIR%models-drive.txt"
if not exist "%MODELSDRIVE%\ollama" mkdir "%MODELSDRIVE%\ollama" 2>nul
echo.
echo   [OK] Models Drive linked: %MODELSDRIVE%
echo        Ollama will store/read models at %MODELSDRIVE%\ollama
echo        (takes effect next time you start GOAT)
pause
