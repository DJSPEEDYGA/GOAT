# 🐐 GOAT — ONE-CLICK ULTIMATE LIBRARY SCANNER
# Runs all scanners (NI + EastWest + Waves) and builds a master catalog.
# Connects to your GOAT app Sound Library page for instant browse/play.
#
# Usage:
#   .\scan-everything.ps1 -Raid "R:\" -AppPath "C:\GOAT-Royalty\App\goat-royalty"

param(
  [string]$Raid = "R:\",
  [string]$AppPath = ""
)

$ErrorActionPreference = "Continue"
$Host.UI.RawUI.WindowTitle = "GOAT Ultimate Library Scanner"

# Auto-detect app path
if (-not $AppPath) {
  $candidates = @("C:\GOAT-Royalty\App\goat-royalty","$env:USERPROFILE\GOAT-Royalty\App\goat-royalty","D:\GOAT-Royalty\App\goat-royalty","G:\GOAT-Royalty\App\goat-royalty")
  foreach ($c in $candidates) { if (Test-Path $c) { $AppPath = $c; break } }
}
if (-not $AppPath) { $AppPath = "$PSScriptRoot\.." }

$catalogDir = "$AppPath\web-app\catalog-data"
New-Item -ItemType Directory -Path $catalogDir -Force | Out-Null

Clear-Host
Write-Host ""
Write-Host "   ____  ___    _  _____  " -ForegroundColor Cyan
Write-Host "  / ___|/ _ \  / \|_   _| " -ForegroundColor Cyan
Write-Host " | |  _| | | |/ _ \ | |   " -ForegroundColor Cyan
Write-Host " | |_| | |_| / ___ \| |   " -ForegroundColor Cyan
Write-Host "  \____|\___/_/   \_\_|   " -ForegroundColor Cyan
Write-Host ""
Write-Host "  🐐 ULTIMATE LIBRARY SCANNER 🐐" -ForegroundColor Yellow
Write-Host "  Scanning: $Raid" -ForegroundColor White
Write-Host "  Catalog output: $catalogDir" -ForegroundColor White
Write-Host ""

$startTime = Get-Date
$scriptDir = $PSScriptRoot

# ============== [1/3] NATIVE INSTRUMENTS ==============
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host " [1/3] NATIVE INSTRUMENTS" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
& "$scriptDir\scan-native-instruments.ps1" -Raid $Raid -Output "$catalogDir\ni-catalog.json"

# ============== [2/3] EASTWEST ==============
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host " [2/3] EASTWEST" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
& "$scriptDir\scan-eastwest.ps1" -Raid $Raid -Output "$catalogDir\eastwest-catalog.json"

# ============== [3/3] WAVES ==============
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host " [3/3] WAVES" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
& "$scriptDir\scan-waves.ps1" -Output "$catalogDir\waves-catalog.json"

# ============== MERGE INTO MASTER CATALOG ==============
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host " MERGING INTO MASTER CATALOG..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$ni = Get-Content "$catalogDir\ni-catalog.json" -Raw | ConvertFrom-Json
$ew = Get-Content "$catalogDir\eastwest-catalog.json" -Raw | ConvertFrom-Json
$wv = Get-Content "$catalogDir\waves-catalog.json" -Raw | ConvertFrom-Json

$master = @{
  generatedAt = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
  raidPath = $Raid
  scanDurationMinutes = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 2)

  nativeInstruments = @{
    libraries = $ni.libraries
    totals = $ni.totals
  }
  eastwest = @{
    libraries = $ew.libraries
    totals = $ew.totals
  }
  waves = @{
    bundles = $wv.detectedBundles
    totals = $wv.totals
  }

  grandTotals = @{
    libraries = $ni.totals.libraries + $ew.totals.libraries
    instruments = $ni.totals.kontakt + $ew.totals.instruments
    plugins = $wv.totals.plugins
    presets = $ni.totals.kompleteKontrol + $ew.totals.presets
    maschineKits = $ni.totals.maschine
    reaktorEnsembles = $ni.totals.reaktor
    impulseResponses = $ew.totals.impulses + $wv.totals.impulses
    totalSizeGB = $ni.totals.totalSizeGB + $ew.totals.totalSizeGB
  }
}

$master | ConvertTo-Json -Depth 10 | Out-File "$catalogDir\master-catalog.json" -Encoding UTF8

# Build a compact browse-index for the app (fast load)
$browseIndex = @{
  instruments = @()
  plugins = @()
  kits = @()
}
$ni.kontaktInstruments | ForEach-Object {
  $browseIndex.instruments += @{ n=$_.name; l=$_.library; f=$_.file; e="kontakt" }
}
$ew.instruments | ForEach-Object {
  $browseIndex.instruments += @{ n=$_.name; l=$_.library; f=$_.file; e="eastwest" }
}
$wv.plugins | Where-Object { $_.installed } | ForEach-Object {
  $browseIndex.plugins += @{ n=$_.name; f=$_.file; e="waves" }
}
$ni.maschineKits | ForEach-Object {
  $browseIndex.kits += @{ n=$_.name; l=$_.library; f=$_.file; e="maschine" }
}
$browseIndex | ConvertTo-Json -Depth 5 -Compress | Out-File "$catalogDir\browse-index.json" -Encoding UTF8

# ============== FINAL REPORT ==============
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  🐐 ULTIMATE SCAN COMPLETE                     ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  Duration:       $($master.scanDurationMinutes) minutes" -ForegroundColor Green
Write-Host "╠────────────────────────────────────────────────╣" -ForegroundColor Green
Write-Host "║  🎹 NATIVE INSTRUMENTS                         ║" -ForegroundColor Cyan
Write-Host "║    Libraries:           $($ni.totals.libraries)" -ForegroundColor White
Write-Host "║    Kontakt instruments: $($ni.totals.kontakt)" -ForegroundColor White
Write-Host "║    Maschine kits:       $($ni.totals.maschine)" -ForegroundColor White
Write-Host "║    Reaktor ensembles:   $($ni.totals.reaktor)" -ForegroundColor White
Write-Host "║    KK presets:          $($ni.totals.kompleteKontrol)" -ForegroundColor White
Write-Host "║    Size:                $($ni.totals.totalSizeGB) GB" -ForegroundColor White
Write-Host "╠────────────────────────────────────────────────╣" -ForegroundColor Green
Write-Host "║  🎻 EASTWEST                                   ║" -ForegroundColor Cyan
Write-Host "║    Libraries:           $($ew.totals.libraries)" -ForegroundColor White
Write-Host "║    Instruments:         $($ew.totals.instruments)" -ForegroundColor White
Write-Host "║    SPACES impulses:     $($ew.totals.impulses)" -ForegroundColor White
Write-Host "║    Size:                $($ew.totals.totalSizeGB) GB" -ForegroundColor White
Write-Host "╠────────────────────────────────────────────────╣" -ForegroundColor Green
Write-Host "║  🌊 WAVES                                      ║" -ForegroundColor Cyan
Write-Host "║    Plugins:             $($wv.totals.plugins)" -ForegroundColor White
Write-Host "║    Licensed:            $($wv.totals.licensedPlugins)" -ForegroundColor White
Write-Host "║    Bundles:             $($wv.totals.bundlesDetected)" -ForegroundColor White
Write-Host "╠════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  🏆 GRAND TOTAL:                               ║" -ForegroundColor Yellow
Write-Host "║    Instruments: $($master.grandTotals.instruments)" -ForegroundColor Yellow
Write-Host "║    Plugins:     $($master.grandTotals.plugins)" -ForegroundColor Yellow
Write-Host "║    Kits:        $($master.grandTotals.maschineKits)" -ForegroundColor Yellow
Write-Host "║    Total Size:  $($master.grandTotals.totalSizeGB) GB" -ForegroundColor Yellow
Write-Host "╠════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  📂 Catalog files:                             ║" -ForegroundColor Green
Write-Host "║     $catalogDir\master-catalog.json" -ForegroundColor White
Write-Host "║     $catalogDir\browse-index.json" -ForegroundColor White
Write-Host "║                                                ║" -ForegroundColor Green
Write-Host "║  🌐 NEXT: Open GOAT app → Sound Library        ║" -ForegroundColor Green
Write-Host "║     All your instruments are now browsable!    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green

# Auto-open the Sound Library page
if (Test-Path "$AppPath\web-app\goat-sound-library.html") {
  Start-Process "$AppPath\web-app\goat-sound-library.html"
}