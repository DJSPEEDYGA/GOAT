# 🐐 GOAT ROYALTY — ULTIMATE ONE-CLICK INSTALLER (Windows PowerShell)
# Downloads and installs EVERYTHING to a single drive (e.g. your 10 TB)
# Usage:  .\install-everything.ps1 -Target "G:\GOAT-Royalty" -Tier 4

param(
  [string]$Target = "G:\GOAT-Royalty",
  [int]$Tier = 4  # 1=Minimal, 2=Producer, 3=Pro Studio, 4=ULTIMATE
)

$ErrorActionPreference = "Continue"
$Host.UI.RawUI.WindowTitle = "GOAT Royalty Ultimate Installer"

Write-Host ""
Write-Host "   ____  ___    _  _____   ____   ___  __   __    _    _   _____  __" -ForegroundColor Cyan
Write-Host "  / ___|/ _ \  / \|_   _| |  _ \ / _ \ \ \ / /   / \  | | |_   _|\ \/ /" -ForegroundColor Cyan
Write-Host " | |  _| | | |/ _ \ | |   | |_) | | | | \ V /   / _ \ | |   | |   \  /" -ForegroundColor Cyan
Write-Host " | |_| | |_| / ___ \| |   |  _ <| |_| |  | |   / ___ \| |___| |   / /\" -ForegroundColor Cyan
Write-Host "  \____|\___/_/   \_\_|   |_| \_\\___/   |_|  /_/   \_\_____|_|__/_/\_\" -ForegroundColor Cyan
Write-Host ""
Write-Host "          🐐  THE ULTIMATE MUSIC WEAPON — ONE-CLICK INSTALL  🐐" -ForegroundColor Yellow
Write-Host ""

Write-Host "Target drive: $Target" -ForegroundColor Yellow
Write-Host "Install tier: $Tier  (1=110GB, 2=1.3TB, 3=3.8TB, 4=5.8TB)" -ForegroundColor Yellow
Write-Host ""

# Check free space
$drive = (Get-Item $Target -ErrorAction SilentlyContinue).PSDrive
if (-not $drive) {
  $driveLetter = ($Target -split ":")[0] + ":"
  $drive = Get-PSDrive -Name ($driveLetter -replace ":","")
}
$freeGB = [math]::Round($drive.Free / 1GB, 1)
Write-Host "Free space on drive: $freeGB GB" -ForegroundColor Green

New-Item -ItemType Directory -Path $Target -Force | Out-Null
Set-Location $Target
"App","AI-Brain","Sounds","Plugins","Movie-Assets","Projects","Logs" | ForEach-Object {
  New-Item -ItemType Directory -Path "$Target\$_" -Force | Out-Null
}

Start-Transcript -Path "$Target\Logs\install.log" -Append

# ============== [1/8] GOAT App ==============
Write-Host "`n[1/8] Downloading GOAT App Core (1.5 GB)..." -ForegroundColor Green
if (-not (Test-Path "$Target\App\goat-royalty\.git")) {
  git clone https://github.com/DJSPEEDYGA/nextjs-commerce.git "$Target\App\goat-royalty"
} else {
  Set-Location "$Target\App\goat-royalty"; git pull; Set-Location $Target
}

# ============== [2/8] Node deps ==============
Write-Host "`n[2/8] Installing Node.js dependencies..." -ForegroundColor Green
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  winget install -e --id OpenJS.NodeJS.LTS
}
Push-Location "$Target\App\goat-royalty"
npm install --production
Pop-Location

# ============== [3/8] Ollama ==============
Write-Host "`n[3/8] Installing Ollama AI runtime..." -ForegroundColor Green
if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
  $ollamaInstaller = "$env:TEMP\OllamaSetup.exe"
  Invoke-WebRequest "https://ollama.com/download/OllamaSetup.exe" -OutFile $ollamaInstaller
  Start-Process $ollamaInstaller -ArgumentList "/VERYSILENT" -Wait
}

# ============== [4/8] AI Models ==============
Write-Host "`n[4/8] Pulling local AI models to $Target\AI-Brain..." -ForegroundColor Green
[Environment]::SetEnvironmentVariable("OLLAMA_MODELS", "$Target\AI-Brain\models", "User")
$env:OLLAMA_MODELS = "$Target\AI-Brain\models"

$models = switch ($Tier) {
  1 { @("llama3.1:8b") }
  2 { @("llama3.1:8b","mixtral:8x7b","codellama:13b") }
  3 { @("llama3.1:8b","llama3.1:70b","mixtral:8x7b","codellama:34b") }
  default { @("llama3.1:8b","llama3.1:70b","mixtral:8x7b","codellama:34b","llava:13b","nomic-embed-text") }
}
foreach ($m in $models) {
  Write-Host "  → pulling $m" -ForegroundColor Cyan
  try { ollama pull $m } catch { Write-Host "  ✗ $m failed, continuing" -ForegroundColor Red }
}

# ============== [5/8] Sound library dirs ==============
Write-Host "`n[5/8] Setting up sound library directory structure..." -ForegroundColor Green
$soundDirs = @(
  "Sounds\EastWest\HollywoodOrchestra","Sounds\EastWest\ComposerCloud",
  "Sounds\EastWest\SPACES-II","Sounds\EastWest\Stormdrum",
  "Sounds\EastWest\ICONIC","Sounds\EastWest\Choirs",
  "Sounds\NativeInstruments\Komplete15","Sounds\NativeInstruments\Kontakt8",
  "Sounds\NativeInstruments\Maschine","Sounds\NativeInstruments\Traktor",
  "Sounds\Splice","Sounds\Loopmasters","Sounds\DrumKits","Sounds\Vocals"
)
$soundDirs | ForEach-Object { New-Item -ItemType Directory -Path "$Target\$_" -Force | Out-Null }

@"
# 🎵 GOAT Sound Library — Install Guide

## EastWest Sounds (requires ComposerCloud+ subscription)
1. Sign up: https://www.soundsonline.com/composercloud  (`$19/mo or `$199/yr)
2. Download EW Installation Center
3. Set install path to: $Target\Sounds\EastWest\
4. Pick any of the 42,000 instruments — all route here

## Native Instruments (Komplete 15 license required)
1. Download Native Access: https://www.native-instruments.com/en/specials/native-access/
2. Preferences → File Management → Content Location:
   $Target\Sounds\NativeInstruments\
3. Install Komplete 15, Kontakt 8, Maschine
"@ | Out-File -FilePath "$Target\Sounds\README.md" -Encoding UTF8

# ============== [6/8] Plugin installers cache ==============
Write-Host "`n[6/8] Preparing plugin installer cache..." -ForegroundColor Green
New-Item -ItemType Directory -Path "$Target\Plugins\Installers" -Force | Out-Null
New-Item -ItemType Directory -Path "$Target\Plugins\Presets" -Force | Out-Null

@"
# Plugin Installer Cache

Download these once, drop .exe/.msi files into this folder.
GOAT App auto-detects them and can reinstall on any new machine.

- Waves Central → https://www.waves.com/downloads/central
- UAD Connect → https://www.uaudio.com/downloads.html
- Slate Digital → https://slatedigital.com/my-account/
- iZotope Product Portal → https://www.izotope.com/en/products/product-portal.html
- Antares Central → https://www.antarestech.com/antares-central/
- FabFilter → https://www.fabfilter.com/download/
- Serato → https://serato.com/dj/downloads
- Akai MPC 2 → https://www.akaipro.com/mpc-software-2
"@ | Out-File -FilePath "$Target\Plugins\Installers\DOWNLOAD-LINKS.md" -Encoding UTF8

# ============== [7/8] Movie assets + FFmpeg ==============
Write-Host "`n[7/8] Setting up Movie Studio assets..." -ForegroundColor Green
"Footage","Music","SFX","LUTs","Transitions","Codecs" | ForEach-Object {
  New-Item -ItemType Directory -Path "$Target\Movie-Assets\$_" -Force | Out-Null
}
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  winget install -e --id Gyan.FFmpeg 2>$null
}

# ============== [8/8] Launcher ==============
Write-Host "`n[8/8] Creating launcher..." -ForegroundColor Green
@"
@echo off
title GOAT Royalty
set OLLAMA_MODELS=$Target\AI-Brain\models
start "" ollama serve
timeout /t 2 /nobreak > nul
cd /d "$Target\App\goat-royalty"
start "" npm run start
timeout /t 3 /nobreak > nul
start http://localhost:3000
"@ | Out-File -FilePath "$Target\LAUNCH-GOAT.bat" -Encoding ASCII

# Desktop shortcut
$shortcut = "$env:USERPROFILE\Desktop\GOAT Royalty.lnk"
$ws = New-Object -ComObject WScript.Shell
$sc = $ws.CreateShortcut($shortcut)
$sc.TargetPath = "$Target\LAUNCH-GOAT.bat"
$sc.IconLocation = "$Target\App\goat-royalty\web-app\favicon.ico"
$sc.WorkingDirectory = $Target
$sc.Save()

$finalSize = "{0:N1} GB" -f ((Get-ChildItem $Target -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB)

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ GOAT ROYALTY INSTALLATION COMPLETE       ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  Location: $Target"                            -ForegroundColor Green
Write-Host "║  Size so far: $finalSize"                      -ForegroundColor Green
Write-Host "║  Tier installed: $Tier"                        -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  NEXT STEPS:                                 ║" -ForegroundColor Green
Write-Host "║  1. Install EastWest (Sounds\README.md)      ║" -ForegroundColor Green
Write-Host "║  2. Install NI Komplete 15                   ║" -ForegroundColor Green
Write-Host "║  3. Download plugin installers               ║" -ForegroundColor Green
Write-Host "║  4. Launch via desktop shortcut              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green

Stop-Transcript