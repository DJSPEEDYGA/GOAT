@echo off
title GOAT Royalty App - Installer
color 0B
cls

echo.
echo  ================================================================
echo          GOAT ROYALTY APP - INSTALLER
echo          Portable USB Edition with Uncensored AI
echo  ================================================================
echo.

REM Set paths
set "USB_ROOT=%~dp0.."
set "SHARED=%USB_ROOT%\Shared"
set "BIN=%SHARED%\bin"
set "MODELS=%SHARED%\models"
set "CATALOG=%SHARED%\catalog"
set "PYTHON_DIR=%SHARED%\python"

echo  [1/5] Checking folder structure...
if not exist "%BIN%" mkdir "%BIN%"
if not exist "%MODELS%" mkdir "%MODELS%"
if not exist "%CATALOG%" mkdir "%CATALOG%"
if not exist "%SHARED%\chat_data" mkdir "%SHARED%\chat_data"
echo        Done!

echo.
echo  [2/5] Copying catalog data...
REM Copy catalog JSON files
if exist "%USB_ROOT%\..\goat-app\static\data\*.json" (
    copy "%USB_ROOT%\..\goat-app\static\data\*.json" "%CATALOG%\" >nul 2>&1
    echo        Catalog data copied!
) else (
    echo        Catalog data will be downloaded...
)

echo.
echo  [3/5] Setting up AI capabilities...
echo.
echo  Select AI Models to Download:
echo.
echo  [1] Gemma 2 2B Abliterated     (~1.6 GB) - Fast, smart, uncensored
echo  [2] Gemma 4 E4B Ultra          (~5.3 GB) - Full compliance
echo  [3] Qwen 3.5 9B Uncensored     (~5.2 GB) - Advanced reasoning
echo  [4] ALL Models                 (~12 GB) - Everything
echo  [5] Skip AI Models             (0 GB)    - Use without AI
echo.
set /p CHOICE="Enter choice (1-5): "

if "%CHOICE%"=="1" set "MODEL_URL=https://huggingface.co/bartowski/gemma-2-2b-it-abliterated-GGUF/resolve/main/gemma-2-2b-it-abliterated-Q4_K_M.gguf" & set "MODEL_NAME=gemma-2-2b-abliterated.gguf"
if "%CHOICE%"=="2" set "MODEL_URL=https://huggingface.co/bartowski/gemma-3-4b-it-GGUF/resolve/main/gemma-3-4b-it-Q4_K_M.gguf" & set "MODEL_NAME=gemma-4-e4b-ultra.gguf"
if "%CHOICE%"=="3" set "MODEL_URL=https://huggingface.co/bartowski/Qwen2.5-9B-GGUF/resolve/main/Qwen2.5-9B-Q4_K_M.gguf" & set "MODEL_NAME=qwen-3.5-9b-uncensored.gguf"
if "%CHOICE%"=="4" (
    echo Downloading all models... This will take a while!
    curl -L -o "%MODELS%\gemma-2-2b-abliterated.gguf" "https://huggingface.co/bartowski/gemma-2-2b-it-abliterated-GGUF/resolve/main/gemma-2-2b-it-abliterated-Q4_K_M.gguf"
    curl -L -o "%MODELS%\gemma-4-e4b-ultra.gguf" "https://huggingface.co/bartowski/gemma-3-4b-it-GGUF/resolve/main/gemma-3-4b-it-Q4_K_M.gguf"
    curl -L -o "%MODELS%\qwen-3.5-9b-uncensored.gguf" "https://huggingface.co/bartowski/Qwen2.5-9B-GGUF/resolve/main/Qwen2.5-9B-Q4_K_M.gguf"
    goto :skip_download
)
if "%CHOICE%"=="5" goto :skip_download

echo.
echo  [INFO] Downloading %MODEL_NAME%...
echo  [INFO] This may take several minutes...
curl -L -o "%MODELS%\%MODEL_NAME%" "%MODEL_URL%"

:skip_download
echo.
echo  [4/5] Downloading Ollama engine...
REM Download portable Ollama for Windows
if not exist "%BIN%\ollama.exe" (
    curl -L -o "%BIN%\ollama.zip" "https://github.com/ollama/ollama/releases/download/v0.1.26/ollama-windows-amd64.zip"
    powershell -Command "Expand-Archive -Path '%BIN%\ollama.zip' -DestinationPath '%BIN%' -Force"
    del "%BIN%\ollama.zip" 2>nul
)
echo        Done!

echo.
echo  [5/5] Creating offline app bundle...
REM Copy the HTML/JS app
if exist "%USB_ROOT%\..\goat-app\static" (
    xcopy "%USB_ROOT%\..\goat-app\static\*" "%CATALOG%\" /E /I /Y >nul 2>&1
)
echo        Done!

echo.
echo  ================================================================
echo   INSTALLATION COMPLETE!
echo  
echo   To start GOAT Royalty App:
echo   - Double-click start-goat.bat
echo  
echo   AI Models: %MODELS%
echo   Catalog:   %CATALOG%
echo  
echo   Enjoy your portable, uncensored, AI-powered music catalog!
echo  ================================================================
echo.
pause