# 🌊 GOAT — Waves Central Scanner (Windows)
# Finds all Waves plugins installed via Waves Central on your RAID / system
#
# Usage:
#   .\scan-waves.ps1 -Output "..\web-app\catalog-data\waves-catalog.json"

param(
  [string]$Output = "$PSScriptRoot\..\web-app\catalog-data\waves-catalog.json"
)

Write-Host ""
Write-Host "🌊 ============================================" -ForegroundColor Cyan
Write-Host "   GOAT — WAVES CENTRAL SCANNER" -ForegroundColor Yellow
Write-Host "============================================ 🌊" -ForegroundColor Cyan
Write-Host ""

$catalog = @{
  scanDate = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
  plugins = @()
  presets = @()
  impulses = @()  # IR1 / IR-L impulse responses
  totals = @{}
}

# ============== WAVES LICENSE FILE ==============
# Waves stores a list of licensed products at:
# C:\Users\Public\Waves Audio\Preferences\LicenseState.xml
# C:\ProgramData\Waves Audio\* and %APPDATA%\Waves Audio\*

Write-Host "📖 Reading Waves license registry..." -ForegroundColor Green

$licensePaths = @(
  "C:\Users\Public\Waves Audio\Preferences\LicenseState.xml",
  "C:\ProgramData\Waves Audio\Licenses\Licenses.xml",
  "$env:APPDATA\Waves Audio\Licenses\Licenses.xml"
)
foreach ($p in $licensePaths) {
  if (Test-Path $p) {
    try {
      [xml]$xml = Get-Content $p
      $xml.SelectNodes("//Product") | ForEach-Object {
        $name = $_.Name
        if ($name) {
          $catalog.plugins += @{
            name = $name
            source = "license"
            licensed = $true
          }
        }
      }
    } catch { }
  }
}

# ============== SCAN INSTALL FOLDERS ==============
Write-Host ""
Write-Host "🔍 Scanning Waves plugin install folders..." -ForegroundColor Green

$wavesRoots = @(
  "C:\Program Files (x86)\Waves",
  "C:\Program Files\Waves",
  "C:\Program Files\Waves\Plug-Ins V14",
  "C:\Program Files\Waves\Plug-Ins V15"
)
# Also detect non-default locations from registry
$reg = Get-ItemProperty "HKLM:\SOFTWARE\WOW6432Node\Waves Audio\Plug-Ins" -ErrorAction SilentlyContinue
if ($reg.PluginsInstallPath) { $wavesRoots += $reg.PluginsInstallPath }
$reg = Get-ItemProperty "HKLM:\SOFTWARE\Waves Audio\Plug-Ins" -ErrorAction SilentlyContinue
if ($reg.PluginsInstallPath) { $wavesRoots += $reg.PluginsInstallPath }

foreach ($root in $wavesRoots | Select-Object -Unique) {
  if (-not (Test-Path $root)) { continue }
  Write-Host "  Scanning: $root" -ForegroundColor DarkCyan

  # .vst3 / .dll / .vst plugin files
  $pluginFiles = Get-ChildItem -Path $root -Recurse -Include "*.vst3","*.dll","*.vst" -ErrorAction SilentlyContinue -Force
  foreach ($f in $pluginFiles) {
    $pluginName = $f.BaseName
    $existing = $catalog.plugins | Where-Object { $_.name -eq $pluginName }
    if ($existing) {
      $existing.file = $f.FullName
      $existing.format = $f.Extension.TrimStart('.')
      $existing.installed = $true
    } else {
      $catalog.plugins += @{
        name = $pluginName
        file = $f.FullName
        format = $f.Extension.TrimStart('.')
        installed = $true
        licensed = $false
      }
    }
  }

  # .xps / .xpst preset files
  $presetFiles = Get-ChildItem -Path $root -Recurse -Include "*.xps","*.xpst","*.preset" -ErrorAction SilentlyContinue -Force
  foreach ($f in $presetFiles) {
    $catalog.presets += @{
      name = $f.BaseName
      file = $f.FullName
      plugin = (Split-Path (Split-Path $f.FullName -Parent) -Leaf)
    }
  }

  # IR1/IR-L impulse WAVs
  $irFiles = Get-ChildItem -Path $root -Recurse -Filter "*.wav" -ErrorAction SilentlyContinue -Force |
             Where-Object { $_.FullName -like "*IR*" -or $_.FullName -like "*Impulse*" }
  foreach ($f in $irFiles) {
    $catalog.impulses += @{
      name = $f.BaseName
      file = $f.FullName
      size = $f.Length
    }
  }
}

# ============== IDENTIFY KNOWN BUNDLES ==============
Write-Host ""
Write-Host "🎯 Identifying Waves bundles..." -ForegroundColor Green

$bundles = @{
  "Mercury" = @("CLA-2A","CLA-3A","CLA-76","SSL G","SSL E","API","Scheps 73","Kramer","Manny Marroquin")
  "Diamond" = @("Renaissance","C4","L2","L3","Q10","MaxxBass","H-Comp","H-EQ","H-Delay","H-Reverb")
  "Platinum" = @("Renaissance Compressor","Renaissance EQ","Renaissance Reverb","L1","C1","Q10")
  "Gold" = @("Renaissance","C1","Q10","L1","TrueVerb","SuperTap")
  "SSL 4000" = @("SSL E","SSL G","SSL Channel","SSL Comp","SSL EQ")
  "Abbey Road" = @("Abbey Road","Chambers","RS56","RS124","Plates","TG12345","REDD")
  "CLA Signature" = @("CLA-2A","CLA-3A","CLA-76","CLA Vocals","CLA Drums","CLA Bass","CLA Guitars","CLA Unplugged","CLA Epic","CLA MixDown","CLA MixHub","CLA Nx")
  "Manny Marroquin Signature" = @("Manny Marroquin")
  "Chris Lord-Alge" = @("CLA-")
  "Eddie Kramer" = @("Kramer","EKramer")
  "Tony Maserati" = @("MAS")
  "Greg Wells" = @("Greg Wells")
  "Andrew Scheps" = @("Scheps")
  "Jack Joseph Puig" = @("JJP")
}

$detectedBundles = @()
foreach ($bundleName in $bundles.Keys) {
  $patterns = $bundles[$bundleName]
  $matches = 0
  foreach ($pat in $patterns) {
    if ($catalog.plugins | Where-Object { $_.name -like "*$pat*" }) { $matches++ }
  }
  if ($matches -gt 0) {
    $detectedBundles += @{
      bundle = $bundleName
      pluginsMatched = $matches
    }
    Write-Host "  ✓ $bundleName ($matches plugins)" -ForegroundColor Cyan
  }
}

$catalog.detectedBundles = $detectedBundles

# ============== TOTALS ==============
$catalog.totals = @{
  plugins = $catalog.plugins.Count
  licensedPlugins = ($catalog.plugins | Where-Object { $_.licensed }).Count
  installedPlugins = ($catalog.plugins | Where-Object { $_.installed }).Count
  presets = $catalog.presets.Count
  impulses = $catalog.impulses.Count
  bundlesDetected = $detectedBundles.Count
}

# ============== SAVE ==============
$outDir = Split-Path $Output -Parent
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
$catalog | ConvertTo-Json -Depth 10 | Out-File -FilePath $Output -Encoding UTF8

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ WAVES SCAN COMPLETE                        ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  Plugins found:         $($catalog.totals.plugins)" -ForegroundColor Green
Write-Host "║  Licensed:              $($catalog.totals.licensedPlugins)" -ForegroundColor Green
Write-Host "║  Installed:             $($catalog.totals.installedPlugins)" -ForegroundColor Green
Write-Host "║  Presets:               $($catalog.totals.presets)" -ForegroundColor Green
Write-Host "║  Impulse responses:     $($catalog.totals.impulses)" -ForegroundColor Green
Write-Host "║  Bundles detected:      $($catalog.totals.bundlesDetected)" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green