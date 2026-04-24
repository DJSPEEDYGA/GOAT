@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ========================================
echo    AI Models Downloader for Windows
echo ========================================
echo.
echo This script will download AI models from HuggingFace
echo Press Ctrl+C to cancel at any time
echo.

:: Configuration
set "MODEL_DIR=%USERPROFILE%\Documents\GOAT-Royalty-App\models"
set "CONDA_DIR=%USERPROFILE%\miniconda3"
set "REPO_URL=https://huggingface.co"

:: Check if conda is installed
if not exist "%CONDA_DIR%\Scripts\conda.exe" (
    echo [ERROR] Conda not found at: %CONDA_DIR%
    echo Please install Miniconda from: https://docs.conda.io/en/latest/miniconda.html
    pause
    exit /b 1
)

:: Create models directory
if not exist "%MODEL_DIR%" (
    echo Creating models directory: %MODEL_DIR%
    mkdir "%MODEL_DIR%"
)

:: Activate conda environment
echo Activating conda environment...
call "%CONDA_DIR%\Scripts\activate.bat" GOAT-Royalty || (
    echo [ERROR] Failed to activate conda environment
    echo Creating new environment...
    call "%CONDA_DIR%\Scripts\conda.exe" create -n GOAT-Royalty python=3.10 -y
    call "%CONDA_DIR%\Scripts\activate.bat" GOAT-Royalty
)

:: Install huggingface-hub
echo Installing huggingface-hub...
pip install huggingface-hub

:: Download models
echo.
echo ========================================
echo    Downloading AI Models
echo ========================================
echo.

:: Foundation Models
echo [1/6] Downloading Foundation Models...
huggingface-cli download --local-dir "%MODEL_DIR%\stabilityai\stable-diffusion-xl-base-1.0" stabilityai/stable-diffusion-xl-base-1.0
huggingface-cli download --local-dir "%MODEL_DIR%\runwayml\stable-diffusion-v1-5" runwayml/stable-diffusion-v1-5

:: Lightning AI Models
echo [2/6] Downloading Lightning AI Models...
huggingface-cli download --local-dir "%MODEL_DIR%\ByteDance\SDXL-Lightning" ByteDance/SDXL-Lightning
huggingface-cli download --local-dir "%MODEL_DIR%\lykon\dreamshaper_8" lykon/dreamshaper_8

:: Art Style LoRAs
echo [3/6] Downloading Art Style LoRAs...
huggingface-cli download --local-dir "%MODEL_DIR%\LoRA\pixel-art-style" --repo-type model
huggingface-cli download --local-dir "%MODEL_DIR%\LoRA\anime-style" --repo-type model

:: Character LoRAs
echo [4/6] Downloading Character LoRAs...
huggingface-cli download --local-dir "%MODEL_DIR%\LoRA\character-1" --repo-type model
huggingface-cli download --local-dir "%MODEL_DIR%\LoRA\character-2" --repo-type model

:: Text-to-Image Models
echo [5/6] Downloading Text-to-Image Models...
huggingface-cli download --local-dir "%MODEL_DIR%\text-to-image\models" --repo-type model

:: Video Generation Models
echo [6/6] Downloading Video Generation Models...
huggingface-cli download --local-dir "%MODEL_DIR%\video-generation\models" --repo-type model

echo.
echo ========================================
echo    Download Complete!
echo ========================================
echo.
echo All models have been downloaded to:
echo %MODEL_DIR%
echo.
echo Total disk space used:
dir "%MODEL_DIR%" /s | find "bytes"
echo.
pause