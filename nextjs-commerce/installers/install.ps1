# ═══════════════════════════════════════════════════════════════════════════
#  🐐  GOAT Royalty App — One-Click Installer (Windows PowerShell)
#      Owner: DJ Speedy (Harvey L. Miller Jr.) + Waka Flocka Flame
#
#  USAGE (copy+paste this one line into PowerShell):
#      iwr -useb https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/installers/install.ps1 | iex
#
#  What it does:
#    1. Installs winget/chocolatey auto-dependencies (Git, Python, Ollama)
#    2. Clones the GOAT Royalty App to C:\GOAT-Royalty-App
#    3. Pulls Gemma 3 (4B) local AI model
#    4. Installs Python requirements
#    5. Creates Desktop shortcut
#    6. Launches the app
# ═══════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"
$host.UI.RawUI.WindowTitle = "GOAT Royalty App Installer"

function Write-Banner {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║                                                              ║" -ForegroundColor Yellow
    Write-Host "║     🐐  GOAT ROYALTY APP — One-Click Installer              ║" -ForegroundColor Yellow
    Write-Host "║     DJ Speedy + Waka Flocka Flame                            ║" -ForegroundColor Yellow
    Write-Host "║     AI Brain · 11 Agents · No OpenAI Dependency              ║" -ForegroundColor Yellow
    Write-Host "║                                                              ║" -ForegroundColor Yellow
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
}

Write-Banner

$InstallDir = "$env:USERPROFILE\GOAT-Royalty-App"
$Repo = "https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git"

# ---------- Check for winget (Windows 10 1809+ / Windows 11) ----------
$hasWinget = Get-Command winget -ErrorAction SilentlyContinue
$hasChoco  = Get-Command choco  -ErrorAction SilentlyContinue

function Install-WithWinget {
    param([string]$id)
    Write-Host "📦 Installing $id via winget..." -ForegroundColor Yellow
    winget install --id $id --silent --accept-package-agreements --accept-source-agreements 2>&1 | Out-Null
}

function Install-WithChoco {
    param([string]$pkg)
    Write-Host "📦 Installing $pkg via Chocolatey..." -ForegroundColor Yellow
    choco install $pkg -y --no-progress 2>&1 | Out-Null
}

# ---------- Install Git ----------
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    if ($hasWinget) { Install-WithWinget "Git.Git" }
    elseif ($hasChoco) { Install-WithChoco "git" }
    else {
        Write-Host "⚠️  Git not found. Install from https://git-scm.com/download/win" -ForegroundColor Red
    }
    # Refresh PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
} else {
    Write-Host "✅ Git already installed" -ForegroundColor Green
}

# ---------- Install Python 3 ----------
if (-not (Get-Command python -ErrorAction SilentlyContinue) -and -not (Get-Command python3 -ErrorAction SilentlyContinue)) {
    if ($hasWinget) { Install-WithWinget "Python.Python.3.11" }
    elseif ($hasChoco) { Install-WithChoco "python" }
    else {
        Write-Host "⚠️  Python not found. Install from https://python.org/downloads" -ForegroundColor Red
    }
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
} else {
    Write-Host "✅ Python already installed" -ForegroundColor Green
}

# ---------- Install Ollama ----------
if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
    Write-Host "🧠 Installing Ollama (local AI)..." -ForegroundColor Yellow
    try {
        $ollamaInstaller = "$env:TEMP\OllamaSetup.exe"
        Invoke-WebRequest -Uri "https://ollama.com/download/OllamaSetup.exe" -OutFile $ollamaInstaller -UseBasicParsing
        Start-Process -FilePath $ollamaInstaller -ArgumentList "/S" -Wait
        $env:PATH += ";$env:LOCALAPPDATA\Programs\Ollama"
    } catch {
        Write-Host "⚠️  Ollama install failed. Download manually: https://ollama.com/download" -ForegroundColor Red
    }
} else {
    Write-Host "✅ Ollama already installed" -ForegroundColor Green
}

# ---------- Clone repo ----------
if (Test-Path $InstallDir) {
    Write-Host "🔄 Updating existing install at $InstallDir" -ForegroundColor Cyan
    Push-Location $InstallDir
    git pull --rebase 2>&1 | Out-Null
    Pop-Location
} else {
    Write-Host "📥 Cloning GOAT Royalty App to $InstallDir" -ForegroundColor Yellow
    git clone $Repo $InstallDir 2>&1 | Out-Null
}

# ---------- Python dependencies ----------
Write-Host "🐍 Installing Python requirements..." -ForegroundColor Yellow
$pyCmd = if (Get-Command python -ErrorAction SilentlyContinue) { "python" } else { "python3" }
& $pyCmd -m pip install --quiet --user flask flask-cors requests yt-dlp python-dotenv 2>&1 | Out-Null

# ---------- Pull Gemma 3 model ----------
if (Get-Command ollama -ErrorAction SilentlyContinue) {
    # Start Ollama service
    $ollamaRunning = Get-Process -Name "ollama" -ErrorAction SilentlyContinue
    if (-not $ollamaRunning) {
        Write-Host "🚀 Starting Ollama service..." -ForegroundColor Cyan
        Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
        Start-Sleep -Seconds 3
    }
    Write-Host "📥 Pulling Gemma 3 4B model (~3GB, one-time download)..." -ForegroundColor Yellow
    try {
        & ollama pull gemma3:4b 2>&1 | Out-Null
    } catch {
        try { & ollama pull gemma2:2b 2>&1 | Out-Null } catch {}
    }
}

# ---------- Create launcher script ----------
$LauncherPath = "$InstallDir\start-goat.bat"
$LauncherContent = @"
@echo off
title GOAT Royalty App
cd /d "%~dp0"

echo.
echo Starting GOAT Royalty App...
echo.

REM Start Ollama if not running
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I "ollama.exe" >NUL
if errorlevel 1 (
    echo Starting Ollama local AI...
    start /B "" ollama serve
    timeout /t 2 /nobreak >nul
)

REM Kill any stale processes
taskkill /F /FI "WINDOWTITLE eq GOAT Intel*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq GOAT Web*" >nul 2>&1

REM Start Intel server (AI Brain + data APIs)
echo Launching AI Brain on http://localhost:5500 ...
start "GOAT Intel" /MIN cmd /c "cd goat-intel-server && python goat_intel.py"

REM Start web app
echo Launching Web App on http://localhost:8090 ...
start "GOAT Web" /MIN cmd /c "cd web-app && python -m http.server 8090"

timeout /t 4 /nobreak >nul

echo.
echo =============================================================
echo   GOAT Royalty App is LIVE!
echo =============================================================
echo   Powerhouse:    http://localhost:8090/powerhouse.html
echo   AI Brain:      http://localhost:8090/agents-brain.html
echo   Moneypenny:    http://localhost:8090/moneypenny.html
echo   Network:       http://localhost:8090/network.html
echo   Spotify:       http://localhost:8090/spotify-dashboard.html
echo   Fan DB:        http://localhost:8090/fan-db.html
echo =============================================================
echo.

REM Open browser
start "" http://localhost:8090/powerhouse.html

echo Press any key to stop all services and exit...
pause >nul

echo Stopping services...
taskkill /F /FI "WINDOWTITLE eq GOAT Intel*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq GOAT Web*" >nul 2>&1
"@
$LauncherContent | Out-File -FilePath $LauncherPath -Encoding ASCII

# ---------- Create Desktop shortcut ----------
$DesktopShortcut = "$env:USERPROFILE\Desktop\🐐 GOAT Royalty App.lnk"
try {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($DesktopShortcut)
    $Shortcut.TargetPath = $LauncherPath
    $Shortcut.WorkingDirectory = $InstallDir
    $Shortcut.IconLocation = "shell32.dll,220"
    $Shortcut.Description = "GOAT Royalty App - DJ Speedy + Waka Flocka"
    $Shortcut.Save()
    Write-Host "✅ Desktop shortcut created" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not create Desktop shortcut (continuing)" -ForegroundColor Yellow
}

# ---------- Done ----------
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "║          ✅  INSTALL COMPLETE!                               ║" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "║   Install location: $InstallDir" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "║   To launch:                                                 ║" -ForegroundColor Green
Write-Host "║     Double-click: 🐐 GOAT Royalty App (on Desktop)          ║" -ForegroundColor Green
Write-Host "║     Or run: $LauncherPath" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting the app now..." -ForegroundColor Cyan
Write-Host ""

# Launch it
Start-Process -FilePath $LauncherPath