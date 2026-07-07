# 🎹 GOAT — Native Instruments Scanner & Importer (Windows)
# Scans your RAID for NI Komplete / Kontakt / Maschine / Reaktor content
# and creates a unified JSON catalog the GOAT app can browse & play.
#
# Usage:
#   .\scan-native-instruments.ps1 -Raid "R:\" -Output "C:\GOAT-Royalty\catalog\ni.json"

param(
  [string]$Raid = "R:\",
  [string]$Output = "$PSScriptRoot\..\web-app\catalog-data\ni-catalog.json"
)

$Host.UI.RawUI.WindowTitle = "GOAT NI Scanner"
Write-Host ""
Write-Host "🎹 ============================================" -ForegroundColor Cyan
Write-Host "   GOAT — NATIVE INSTRUMENTS SCANNER" -ForegroundColor Yellow
Write-Host "   Scanning RAID: $Raid" -ForegroundColor Yellow
Write-Host "============================================ 🎹" -ForegroundColor Cyan
Write-Host ""

$catalog = @{
  scanDate = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
  raidPath = $Raid
  libraries = @()
  kontaktInstruments = @()
  maschineKits = @()
  reaktorEnsembles = @()
  komplete_kontrol_presets = @()
  battery_kits = @()
  totals = @{}
}

# ============== NATIVE ACCESS REGISTRY ==============
# NI stores installed products in these locations:
# Windows: C:\ProgramData\Native Instruments\Service Center\*.xml
#          HKLM:\SOFTWARE\Native Instruments\*
# Each library has an NKS "db" folder + "Instruments" folder

Write-Host "📖 Reading Native Access registry..." -ForegroundColor Green

# 1. Parse Service Center XML files (product IDs + install paths)
$svcCenter = "C:\ProgramData\Native Instruments\Service Center"
if (Test-Path $svcCenter) {
  Get-ChildItem "$svcCenter\*.xml" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
      [xml]$xml = Get-Content $_.FullName
      $prod = $xml.Product
      if ($prod) {
        $catalog.libraries += @{
          name = $prod.Name
          version = $prod.Version
          productId = $prod.ProductId
          installPath = $prod.InstallPath
          contentPath = $prod.ContentPath
        }
        Write-Host "  ✓ $($prod.Name)" -ForegroundColor Cyan
      }
    } catch { }
  }
}

# 2. Parse registry for extra paths
$niRegPaths = @(
  "HKLM:\SOFTWARE\Native Instruments",
  "HKLM:\SOFTWARE\WOW6432Node\Native Instruments"
)
foreach ($p in $niRegPaths) {
  if (Test-Path $p) {
    Get-ChildItem $p -ErrorAction SilentlyContinue | ForEach-Object {
      $contentDir = (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).ContentDir
      if ($contentDir -and (Test-Path $contentDir)) {
        $exists = $catalog.libraries | Where-Object { $_.contentPath -eq $contentDir }
        if (-not $exists) {
          $catalog.libraries += @{
            name = $_.PSChildName
            contentPath = $contentDir
            source = "registry"
          }
        }
      }
    }
  }
}

# ============== DEEP SCAN THE RAID ==============
Write-Host ""
Write-Host "🔍 Deep-scanning $Raid for NI content..." -ForegroundColor Green

# 3. Kontakt .nki / .nkm / .nkb / .nkx / .nkc / .nkr files
Write-Host "  Scanning Kontakt instruments (.nki)..." -ForegroundColor DarkCyan
$nkiFiles = Get-ChildItem -Path $Raid -Recurse -Include "*.nki","*.nkm","*.nkb" -ErrorAction SilentlyContinue -Force
foreach ($f in $nkiFiles) {
  $catalog.kontaktInstruments += @{
    name = $f.BaseName
    file = $f.FullName
    library = (Split-Path (Split-Path $f.FullName -Parent) -Leaf)
    size = $f.Length
    ext = $f.Extension
  }
}
Write-Host "    → Found $($catalog.kontaktInstruments.Count) Kontakt instruments" -ForegroundColor Green

# 4. Maschine kits (.mxgrp / .mxkit / .mxprj / .mxinst / .mxpat)
Write-Host "  Scanning Maschine content..." -ForegroundColor DarkCyan
$maschineFiles = Get-ChildItem -Path $Raid -Recurse -Include "*.mxgrp","*.mxkit","*.mxinst","*.mxpat","*.mxsnd" -ErrorAction SilentlyContinue -Force
foreach ($f in $maschineFiles) {
  $catalog.maschineKits += @{
    name = $f.BaseName
    file = $f.FullName
    type = $f.Extension.TrimStart('.')
    library = (Split-Path (Split-Path $f.FullName -Parent) -Leaf)
    size = $f.Length
  }
}
Write-Host "    → Found $($catalog.maschineKits.Count) Maschine items" -ForegroundColor Green

# 5. Reaktor ensembles (.ens / .ism)
Write-Host "  Scanning Reaktor ensembles..." -ForegroundColor DarkCyan
$reaktorFiles = Get-ChildItem -Path $Raid -Recurse -Include "*.ens","*.ism" -ErrorAction SilentlyContinue -Force
foreach ($f in $reaktorFiles) {
  $catalog.reaktorEnsembles += @{
    name = $f.BaseName
    file = $f.FullName
    library = (Split-Path (Split-Path $f.FullName -Parent) -Leaf)
    size = $f.Length
  }
}
Write-Host "    → Found $($catalog.reaktorEnsembles.Count) Reaktor ensembles" -ForegroundColor Green

# 6. Komplete Kontrol presets (.nksf / .nksn)
Write-Host "  Scanning Komplete Kontrol presets..." -ForegroundColor DarkCyan
$kkFiles = Get-ChildItem -Path $Raid -Recurse -Include "*.nksf","*.nksn" -ErrorAction SilentlyContinue -Force
foreach ($f in $kkFiles) {
  $catalog.komplete_kontrol_presets += @{
    name = $f.BaseName
    file = $f.FullName
    library = (Split-Path (Split-Path $f.FullName -Parent) -Leaf)
  }
}
Write-Host "    → Found $($catalog.komplete_kontrol_presets.Count) KK presets" -ForegroundColor Green

# 7. Battery kits (.kt3)
Write-Host "  Scanning Battery kits..." -ForegroundColor DarkCyan
$batteryFiles = Get-ChildItem -Path $Raid -Recurse -Include "*.kt3" -ErrorAction SilentlyContinue -Force
foreach ($f in $batteryFiles) {
  $catalog.battery_kits += @{
    name = $f.BaseName
    file = $f.FullName
    size = $f.Length
  }
}
Write-Host "    → Found $($catalog.battery_kits.Count) Battery kits" -ForegroundColor Green

# 8. NKS database files for metadata
Write-Host "  Indexing NKS metadata databases..." -ForegroundColor DarkCyan
$nksDbs = Get-ChildItem -Path $Raid -Recurse -Include "*.db","*.ndb","*.nkx" -ErrorAction SilentlyContinue -Force |
          Where-Object { $_.FullName -like "*\NI Resources\*" -or $_.FullName -like "*\database*" }
$catalog.nksDatabases = @($nksDbs | ForEach-Object { $_.FullName })

# ============== TOTALS ==============
$catalog.totals = @{
  libraries = $catalog.libraries.Count
  kontakt = $catalog.kontaktInstruments.Count
  maschine = $catalog.maschineKits.Count
  reaktor = $catalog.reaktorEnsembles.Count
  kompleteKontrol = $catalog.komplete_kontrol_presets.Count
  battery = $catalog.battery_kits.Count
  totalFiles = $catalog.kontaktInstruments.Count + $catalog.maschineKits.Count + $catalog.reaktorEnsembles.Count + $catalog.komplete_kontrol_presets.Count + $catalog.battery_kits.Count
}

# Calculate total size
$totalBytes = 0
$totalBytes += ($catalog.kontaktInstruments | Measure-Object -Property size -Sum).Sum
$totalBytes += ($catalog.maschineKits | Measure-Object -Property size -Sum).Sum
$totalBytes += ($catalog.reaktorEnsembles | Measure-Object -Property size -Sum).Sum
$catalog.totals.totalSizeGB = [math]::Round($totalBytes / 1GB, 2)

# ============== SAVE JSON ==============
$outDir = Split-Path $Output -Parent
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$catalog | ConvertTo-Json -Depth 10 | Out-File -FilePath $Output -Encoding UTF8

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ NI SCAN COMPLETE                           ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  Libraries detected:    $($catalog.totals.libraries)" -ForegroundColor Green
Write-Host "║  Kontakt instruments:   $($catalog.totals.kontakt)" -ForegroundColor Green
Write-Host "║  Maschine items:        $($catalog.totals.maschine)" -ForegroundColor Green
Write-Host "║  Reaktor ensembles:     $($catalog.totals.reaktor)" -ForegroundColor Green
Write-Host "║  KK presets:            $($catalog.totals.kompleteKontrol)" -ForegroundColor Green
Write-Host "║  Battery kits:          $($catalog.totals.battery)" -ForegroundColor Green
Write-Host "║  Total size:            $($catalog.totals.totalSizeGB) GB" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  Catalog saved: $Output" -ForegroundColor Yellow
Write-Host "║  → Open GOAT app Sound Library to browse       ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green