@echo off
REM ==========================================================================
REM  GOAT Royalty App - One-Click Installer (Windows)
REM  Owner: DJ Speedy (Harvey L. Miller Jr.) + Waka Flocka Flame
REM  
REM  USAGE: Double-click this file, OR run from PowerShell:
REM    iwr -useb https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/installers/install.ps1 | iex
REM ==========================================================================

setlocal EnableDelayedExpansion
title GOAT Royalty App Installer

echo.
echo ==============================================================
echo.
echo    GOAT ROYALTY APP - One-Click Installer
echo    DJ Speedy + Waka Flocka Flame
echo    AI Brain . 11 Agents . No OpenAI Dependency
echo.
echo ==============================================================
echo.

REM Elevate to PowerShell installer for more power
where powershell >nul 2>&1
if %errorlevel% neq 0 (
    echo PowerShell not found. Please install PowerShell first.
    pause
    exit /b 1
)

echo Running PowerShell installer with elevation...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "iwr -useb https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/installers/install.ps1 | iex"

echo.
echo ==============================================================
echo.
echo   Install finished. Press any key to close this window.
echo.
echo ==============================================================
pause >nul