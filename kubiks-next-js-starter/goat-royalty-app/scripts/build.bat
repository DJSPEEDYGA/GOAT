@echo off
REM ================================================================
REM GOAT Royalty App - Windows Build Script
REM ================================================================
REM
REM This script builds GOAT for Windows as EXE, and creates portable version
REM
REM Usage:
REM   build.bat              - Build Windows EXE
REM   build.bat --portable   - Build portable version
REM   build.bat --all        - Build all formats
REM
REM ================================================================

setlocal enabledelayedexpansion

REM App Info
set APP_NAME=GOAT
set APP_VERSION=1.0.0

echo.
echo  ================================================================
echo.
echo      ██████╗  ██████╗ ███████╗     ██████╗ ██████╗  ██████╗ 
echo     ██╔════╝ ██╔═══██╗██╔════╝    ██╔════╝ ██╔══██╗██╔═══██╗
echo     ██║      ██║   ██║█████╗      ██║      ██████╔╝██║   ██║
echo     ██║      ██║   ██║██╔══╝      ██║      ██╔═══╝ ██║   ██║
echo     ╚██████╗ ╚██████╔╝███████╗    ╚██████╗ ██║     ╚██████╔╝
echo      ╚═════╝  ╚═════╝ ╚══════╝     ╚═════╝ ╚═╝      ╚═════╝ 
echo.
echo         All-in-One AI-Powered Royalty App
echo         "IF YOU CAN THINK IT! You CAN DO IT IN THE APP"
echo.
echo  ================================================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed. Please install Python 3.11+
    exit /b 1
)

echo [INFO] Python found:
python --version

REM Create directories
if not exist "build" mkdir build
if not exist "dist" mkdir dist

REM Install dependencies
echo.
echo [INFO] Installing dependencies...
pip install -r requirements.txt --quiet
pip install pyinstaller --quiet

REM Build EXE
echo.
echo [INFO] Building Windows EXE...
echo.

pyinstaller --onefile --windowed ^
    --name "GOAT" ^
    --icon "assets/goat.ico" ^
    --add-data "src/frontend;frontend" ^
    --add-data "assets;assets" ^
    --hidden-import "uvicorn.logging" ^
    --hidden-import "uvicorn.loops.auto" ^
    --hidden-import "uvicorn.protocols.http.auto" ^
    --hidden-import "uvicorn.protocols.websockets.auto" ^
    --hidden-import "uvicorn.lifespan.on" ^
    --hidden-import "langchain" ^
    --hidden-import "langgraph" ^
    --hidden-import "crewai" ^
    --distpath "dist" ^
    --workpath "build" ^
    src/core/main.py

if errorlevel 1 (
    echo [ERROR] Build failed!
    exit /b 1
)

REM Rename output
if exist "dist\GOAT.exe" (
    move "dist\GOAT.exe" "dist\GOAT-Windows-x64-v%APP_VERSION%.exe" >nul
    echo.
    echo [SUCCESS] Windows EXE built: dist\GOAT-Windows-x64-v%APP_VERSION%.exe
)

REM Build portable version if requested
if "%1"=="--portable" goto :portable
if "%1"=="--all" goto :portable
goto :end

:portable
echo.
echo [INFO] Building portable version...

set PORTABLE_DIR=dist\GOAT-Portable
if exist "%PORTABLE_DIR%" rmdir /s /q "%PORTABLE_DIR%"
mkdir "%PORTABLE_DIR%"

REM Copy files
xcopy /e /i /q src "%PORTABLE_DIR%\src"
xcopy /e /i /q assets "%PORTABLE_DIR%\assets" 2>nul
copy requirements.txt "%PORTABLE_DIR%\"

REM Create launcher
echo @echo off > "%PORTABLE_DIR%\GOAT.bat"
echo cd /d "%%~dp0" >> "%PORTABLE_DIR%\GOAT.bat"
echo pip install -r requirements.txt --quiet 2^>nul >> "%PORTABLE_DIR%\GOAT.bat"
echo python src\core\main.py >> "%PORTABLE_DIR%\GOAT.bat"

REM Create README
echo # GOAT - Portable Version > "%PORTABLE_DIR%\README.md"
echo. >> "%PORTABLE_DIR%\README.md"
echo ## Quick Start >> "%PORTABLE_DIR%\README.md"
echo. >> "%PORTABLE_DIR%\README.md"
echo 1. Double-click GOAT.bat >> "%PORTABLE_DIR%\README.md"
echo 2. Wait for dependencies to install >> "%PORTABLE_DIR%\README.md"
echo 3. Access the app at http://127.0.0.1:8000 >> "%PORTABLE_DIR%\README.md"
echo. >> "%PORTABLE_DIR%\README.md"
echo --- >> "%PORTABLE_DIR%\README.md"
echo "IF YOU CAN THINK IT! You CAN DO IT IN THE APP" - DJ Speedy >> "%PORTABLE_DIR%\README.md"

REM Zip it
powershell -command "Compress-Archive -Path '%PORTABLE_DIR%' -DestinationPath 'dist\GOAT-Portable-v%APP_VERSION%.zip' -Force"

echo [SUCCESS] Portable version built: dist\GOAT-Portable-v%APP_VERSION%.zip

:end
echo.
echo ================================================================
echo.
echo   BUILD COMPLETE!
echo.
echo   Output files:
dir /b dist
echo.
echo   "IF YOU CAN THINK IT! You CAN DO IT IN THE APP"
echo   - DJ Speedy
echo.
echo ================================================================
echo.

pause