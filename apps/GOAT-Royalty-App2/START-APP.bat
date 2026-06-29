@echo off
title GOAT Royalty App Launcher
color 0A

echo ========================================
echo   GOAT Royalty App - Starting...
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: Please run this script from the app directory!
    echo.
    pause
    exit /b 1
)

echo [1/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies... This may take a few minutes.
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo [2/3] Starting Next.js server...
start "GOAT Server" cmd /k "npm run dev"

echo [3/3] Waiting for server to start...
timeout /t 15 /nobreak > nul

echo Starting Electron app...
start "GOAT App" cmd /k "npm run electron"

echo.
echo ========================================
echo   GOAT Royalty App is starting!
echo ========================================
echo.
echo Keep the server window open.
echo You can minimize it but don't close it.
echo.
echo To stop the app:
echo 1. Close the app window
echo 2. Press Ctrl+C in the server window
echo.

exit