@echo off
REM GOAT Royalty App - Build Script for Windows
REM Builds EXE and portable versions

echo.
echo GOAT Royalty App - Build Script
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Navigate to app directory
cd /d "%~dp0"

REM Install dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Building Windows EXE and Portable...
echo.

REM Build for Windows
call npm run build:win
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo Build complete!
echo.
echo Output files located in: %cd%\dist\
dir dist\*.exe 2>nul
dir dist\*.msi 2>nul

echo.
pause