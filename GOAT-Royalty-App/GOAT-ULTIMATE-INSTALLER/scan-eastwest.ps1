# 🎻 GOAT — EastWest Scanner (Windows)
# Finds Opus / Play engine libraries + all ComposerCloud content on your RAID
#
# Usage:
#   .\scan-eastwest.ps1 -Raid "R:\" -Output "..\web-app\catalog-data\eastwest-catalog.json"

param(
  [string]$Raid = "R:\",
  [string]$Output = "$PSScriptRoot\..\web-app\catalog-data\eastwest-catalog.json"
)

Write-Host ""
Write-Host "🎻 ============================================" -ForegroundColor Cyan
Write-Host "   GOAT — EASTWEST SCANNER" -ForegroundColor Yellow
Write-Host "   Scanning RAID: $Raid" -ForegroundColor Yellow
Write-Host "============================================ 🎻" -ForegroundColor Cyan
Write-Host ""

$catalog = @{
  scanDate = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
  raidPath = $Raid
  libraries = @()      # Top-level EW libraries
  instruments = @()    # All .ewi / .ewx / Opus patches
  impulses = @()       # SPACES II reverb impulses
  presets = @()        # .ewp preset files
  totals = @{}
}

# ============== EW INSTALL REGISTRY ==============
Write-Host "📖 Reading EastWest registry..." -ForegroundColor Green

# EW uses: C:\ProgramData\EastWest\ and registry HKLM:\SOFTWARE\EastWest
$ewRegPaths = @(
  "HKLM:\SOFTWARE\EastWest",
  "HKLM:\SOFTWARE\WOW6432Node\EastWest"
)
foreach ($p in $ewRegPaths) {
  if (Test-Path $p) {
    Get-ChildItem $p -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
      $props = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
      if ($props.InstallPath) {
        $catalog.libraries += @{
          name = $_.PSChildName
          installPath = $props.InstallPath
          source = "registry"
        }
      }
    }
  }
}

# EW Installation Center tracks installed libs in:
# C:\ProgramData\East West\InstallationCenter\installed.json (newer versions)
$ewInstalled = "C:\ProgramData\East West\InstallationCenter\installed.json"
if (Test-Path $ewInstalled) {
  try {
    $json = Get-Content $ewInstalled -Raw | ConvertFrom-Json
    $json.installations | ForEach-Object {
      $catalog.libraries += @{
        name = $_.productName
        installPath = $_.installPath
        version = $_.version
        source = "installcenter"
      }
    }
  } catch { Write-Host "  (couldn't parse installed.json)" -ForegroundColor DarkGray }
}

# ============== DEEP SCAN ==============
Write-Host ""
Write-Host "🔍 Scanning $Raid for EastWest content..." -ForegroundColor Green

# Opus/Play instrument files: .ewi (East West Instrument), .ewx, .ewp (preset)
Write-Host "  Scanning EW instruments (.ewi, .ewx, .opus)..." -ForegroundColor DarkCyan
$ewiFiles = Get-ChildItem -Path $Raid -Recurse -Include "*.ewi","*.ewx","*.opus" -ErrorAction SilentlyContinue -Force
foreach ($f in $ewiFiles) {
  $parent = Split-Path $f.FullName -Parent
  $libName = (Split-Path $parent -Leaf)
  # Try to walk up to find library root (contains "Instruments" folder)
  $libRoot = $parent
  while ($libRoot -and -not (Test-Path "$libRoot\Instruments")) {
    $newRoot = Split-Path $libRoot -Parent
    if ($newRoot -eq $libRoot) { break }
    $libRoot = $newRoot
  }
  if ($libRoot) { $libName = (Split-Path $libRoot -Leaf) }

  $catalog.instruments += @{
    name = $f.BaseName
    file = $f.FullName
    library = $libName
    ext = $f.Extension
    size = $f.Length
  }
}
Write-Host "    → Found $($catalog.instruments.Count) instruments" -ForegroundColor Green

# Presets
Write-Host "  Scanning EW presets (.ewp, .ewpreset)..." -ForegroundColor DarkCyan
$ewpFiles = Get-ChildItem -Path $Raid -Recurse -Include "*.ewp","*.ewpreset" -ErrorAction SilentlyContinue -Force
foreach ($f in $ewpFiles) {
  $catalog.presets += @{
    name = $f.BaseName
    file = $f.FullName
    library = (Split-Path (Split-Path $f.FullName -Parent) -Leaf)
  }
}
Write-Host "    → Found $($catalog.presets.Count) presets" -ForegroundColor Green

# SPACES II reverb impulses (.wav files specifically in SPACES folders)
Write-Host "  Scanning SPACES II impulses..." -ForegroundColor DarkCyan
$spacesFiles = Get-ChildItem -Path $Raid -Recurse -Filter "*.wav" -ErrorAction SilentlyContinue -Force |
               Where-Object { $_.FullName -like "*SPACES*" -or $_.FullName -like "*Impulse*" }
foreach ($f in $spacesFiles) {
  $catalog.impulses += @{
    name = $f.BaseName
    file = $f.FullName
    library = "SPACES II"
    size = $f.Length
  }
}
Write-Host "    → Found $($catalog.impulses.Count) impulses" -ForegroundColor Green

# Auto-detect known EW library folder names
Write-Host "  Identifying known EW libraries by folder..." -ForegroundColor DarkCyan
$knownLibs = @(
  "Hollywood Orchestra","Hollywood Strings","Hollywood Brass","Hollywood Woodwinds","Hollywood Percussion",
  "Hollywood Choirs","Hollywood Backup Singers","Hollywood Solo","Hollywood Harp",
  "Stormdrum 3","Stormdrum 2","Goliath","Symphonic Orchestra","Symphonic Choirs",
  "SPACES","SPACES II","Quantum Leap","Ministry of Rock","Fab Four","Voices of Soul",
  "Voices of Opera","Voices of the Empire","Gypsy","RA","Silk","Pianos","Spaces",
  "ICONIC","Hollywood Fantasy Percussion","Ghostwriter","ProDrummer","Forbidden Planet"
)
foreach ($lib in $knownLibs) {
  $found = Get-ChildItem -Path $Raid -Recurse -Directory -Filter $lib -ErrorAction SilentlyContinue -Force |
           Select-Object -First 1
  if ($found) {
    $exists = $catalog.libraries | Where-Object { $_.installPath -eq $found.FullName }
    if (-not $exists) {
      $size = (Get-ChildItem $found.FullName -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
      $catalog.libraries += @{
        name = $lib
        installPath = $found.FullName
        sizeGB = [math]::Round($size / 1GB, 2)
        source = "auto-detected"
      }
      Write-Host "    ✓ $lib ($([math]::Round($size / 1GB, 2)) GB)" -ForegroundColor Cyan
    }
  }
}

# ============== TOTALS ==============
$totalBytes = ($catalog.instruments | Measure-Object -Property size -Sum).Sum +
              ($catalog.impulses | Measure-Object -Property size -Sum).Sum
$catalog.totals = @{
  libraries = $catalog.libraries.Count
  instruments = $catalog.instruments.Count
  presets = $catalog.presets.Count
  impulses = $catalog.impulses.Count
  totalSizeGB = [math]::Round($totalBytes / 1GB, 2)
}

# ============== SAVE ==============
$outDir = Split-Path $Output -Parent
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
$catalog | ConvertTo-Json -Depth 10 | Out-File -FilePath $Output -Encoding UTF8

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ EASTWEST SCAN COMPLETE                     ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  Libraries detected:    $($catalog.totals.libraries)" -ForegroundColor Green
Write-Host "║  Instruments:           $($catalog.totals.instruments)" -ForegroundColor Green
Write-Host "║  Presets:               $($catalog.totals.presets)" -ForegroundColor Green
Write-Host "║  SPACES impulses:       $($catalog.totals.impulses)" -ForegroundColor Green
Write-Host "║  Total size:            $($catalog.totals.totalSizeGB) GB" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green