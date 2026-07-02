@echo off
REM GOAT Royalty App - Windows Build Script
REM This script builds Windows EXE installer and portable version

echo.
echo GOAT Royalty App - Building Windows Installers
echo =================================================
echo.

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm not found. Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Install dependencies
echo [1/3] Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm install failed
    exit /b 1
)

REM Build Next.js application
echo.
echo [2/3] Building Next.js application...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Next.js build failed
    exit /b 1
)

REM Build Electron packages
echo.
echo [3/3] Building Windows installers...
call npx electron-builder --win --x64
if %ERRORLEVEL% neq 0 (
    echo ERROR: electron-builder failed
    exit /b 1
)

echo.
echo ================================================
echo Build complete! Check the 'dist' directory.
echo ================================================
echo.
dir dist