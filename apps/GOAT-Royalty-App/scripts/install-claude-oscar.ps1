# ============================================================
# Claude Code Installer — Oscar Edition (Windows / PowerShell)
# Mirrors install-claude-oscar.sh for Windows hosts.
#
# Prerequisites: PowerShell 5.1+ or PowerShell 7+
# Run as: powershell -ExecutionPolicy Bypass -File install-claude-oscar.ps1
#         or: pwsh -File install-claude-oscar.ps1
#
# Env overrides (set before running or pass as -Env params):
#   $env:CLAUDE_VERSION        — force a specific version
#   $env:CLAUDE_BUCKET         — override release bucket URL
#   $env:CLAUDE_DOWNLOAD_DIR   — override download directory
#   $env:CLAUDE_RETRIES        — retry count (default: 3)
#   $env:OSCAR_ROOT            — Oscar root path on Windows
# ============================================================

param(
  [string]$Target = "",           # optional: stable | latest | x.y.z
  [switch]$Help
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Oscar defaults ────────────────────────────────────────────
$OSCAR_ROOT         = if ($env:OSCAR_ROOT)            { $env:OSCAR_ROOT }
                      else                            { "$env:USERPROFILE\.oscar" }
$DEFAULT_BUCKET     = "https://storage.googleapis.com/claude-code-dist-86c565f3-f756-42ad-8dfa-d59b1c096819/claude-code-releases"
$GCS_BUCKET         = if ($env:CLAUDE_BUCKET)         { $env:CLAUDE_BUCKET }         else { $DEFAULT_BUCKET }
$DOWNLOAD_DIR       = if ($env:CLAUDE_DOWNLOAD_DIR)   { $env:CLAUDE_DOWNLOAD_DIR }   else { Join-Path $OSCAR_ROOT ".claude\downloads" }
$PRESELECT_VERSION  = if ($env:CLAUDE_VERSION)        { $env:CLAUDE_VERSION }        else { "" }
$MAX_RETRIES        = if ($env:CLAUDE_RETRIES)        { [int]$env:CLAUDE_RETRIES }   else { 3 }

# ── Helpers ──────────────────────────────────────────────────
function Log   { param([string]$msg) Write-Host "[oscar-claude-install] $msg" -ForegroundColor Cyan }
function Die   { param([string]$msg) Write-Host "[oscar-claude-install] ERROR: $msg" -ForegroundColor Red; exit 1 }
function Usage {
  Write-Host @"
Usage: install-claude-oscar.ps1 [-Target <stable|latest|VERSION>] [-Help]

Installs Claude Code, localized for the Oscar drive.

Env overrides:
  CLAUDE_BUCKET        Override release bucket URL
  CLAUDE_DOWNLOAD_DIR  Override download dir (default: <oscar-root>\.claude\downloads)
  CLAUDE_VERSION       Force a specific version
  CLAUDE_RETRIES       Retry count (default: 3)
  OSCAR_ROOT           Oscar root path (default: %USERPROFILE%\.oscar)
"@
}

if ($Help) { Usage; exit 0 }

# Validate target
if ($Target -ne "" -and $Target -notmatch '^(stable|latest|\d+\.\d+\.\d+(-\S+)?)$') {
  Usage; Die "Invalid target: $Target"
}

# ── Platform detection ────────────────────────────────────────
$Arch = if ([System.Environment]::Is64BitOperatingSystem) {
  if ($env:PROCESSOR_ARCHITEW6432 -eq "ARM64" -or $env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" }
  else { "x64" }
} else { Die "32-bit Windows is not supported." }

$Platform = "win32-$Arch"
Log "Platform: $Platform"

# ── Prepare download dir ──────────────────────────────────────
if (-not (Test-Path $DOWNLOAD_DIR)) {
  New-Item -ItemType Directory -Path $DOWNLOAD_DIR -Force | Out-Null
}

# ── Download with retries ────────────────────────────────────
function DownloadString {
  param([string]$Url)
  $attempt = 0
  while ($true) {
    try {
      return (Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 60).Content.Trim()
    } catch {
      $attempt++
      if ($attempt -ge $MAX_RETRIES) { Die "Failed to download: $Url`n$_" }
      Start-Sleep -Seconds 1
    }
  }
}

function DownloadFile {
  param([string]$Url, [string]$OutPath)
  $attempt = 0
  while ($true) {
    try {
      Invoke-WebRequest -Uri $Url -OutFile $OutPath -UseBasicParsing -TimeoutSec 300
      return
    } catch {
      $attempt++
      if ($attempt -ge $MAX_RETRIES) { Die "Failed to download: $Url`n$_" }
      Start-Sleep -Seconds 1
    }
  }
}

# ── Resolve version ───────────────────────────────────────────
if ($PRESELECT_VERSION -ne "") {
  $Version = $PRESELECT_VERSION
  Log "Using preselected version: $Version"
} else {
  Log "Fetching latest version..."
  $Version = DownloadString "$GCS_BUCKET/latest"
}
if (-not $Version) { Die "Could not determine version." }
Log "Version: $Version"

# ── Fetch manifest & checksum ────────────────────────────────
Log "Downloading manifest..."
$ManifestJson = DownloadString "$GCS_BUCKET/$Version/manifest.json"

# Parse checksum for our platform (PowerShell JSON)
try {
  $Manifest  = $ManifestJson | ConvertFrom-Json
  $Checksum  = $Manifest.platforms.$Platform.checksum
} catch {
  Die "Failed to parse manifest JSON: $_"
}

if (-not $Checksum -or $Checksum -notmatch '^[a-f0-9]{64}$') {
  Die "Platform '$Platform' not found in manifest or checksum is malformed."
}

# ── Download binary ───────────────────────────────────────────
$BinaryName = "claude-$Version-$Platform-$(Get-Random).exe"
$BinaryPath = Join-Path $DOWNLOAD_DIR $BinaryName
Log "Downloading Claude Code $Version for $Platform ..."
DownloadFile "$GCS_BUCKET/$Version/$Platform/claude.exe" $BinaryPath

# ── Verify checksum ───────────────────────────────────────────
Log "Verifying SHA-256 checksum..."
$Actual = (Get-FileHash -Path $BinaryPath -Algorithm SHA256).Hash.ToLower()
if ($Actual -ne $Checksum) {
  Remove-Item $BinaryPath -Force -ErrorAction SilentlyContinue
  Die "Checksum verification failed — download may be corrupt."
}

# ── Run installer ─────────────────────────────────────────────
Log "Setting up Claude Code on Oscar (Windows)..."
$InstallArgs = @("install")
if ($Target -ne "") { $InstallArgs += $Target }

& $BinaryPath @InstallArgs
$ExitCode = $LASTEXITCODE

# ── Cleanup ───────────────────────────────────────────────────
Remove-Item $BinaryPath -Force -ErrorAction SilentlyContinue

if ($ExitCode -ne 0) { Die "Installer exited with code $ExitCode." }

Write-Host ""
Write-Host "✅  Claude Code installed successfully!" -ForegroundColor Green
Write-Host "    Oscar root:  $OSCAR_ROOT"
Write-Host "    Platform:    $Platform"
Write-Host "    Version:     $Version"
Write-Host ""
