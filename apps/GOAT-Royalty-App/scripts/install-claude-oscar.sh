#!/usr/bin/env bash
# ============================================================
# Claude Code Installer — Oscar Edition
# Localized for: /Volumes/Oscar/Master-Oscar
#
# Enhancements over upstream install-claude.sh:
#   - Safer shell: set -euo pipefail, trap-based cleanup
#   - Centralized logging (log/die helpers)
#   - Env overrides for bucket, version, dir, retries
#   - Download retries (curl --retry / wget --tries)
#   - mktemp for unique, race-free download path
#   - Help flag (-h/--help)
#   - Oscar-specific defaults: download dir lives on Oscar drive,
#     Ollama model store, and chat server integration
# ============================================================

set -euo pipefail

# ── Oscar-specific defaults ──────────────────────────────────
OSCAR_ROOT="${OSCAR_ROOT:-/Volumes/Oscar/Master-Oscar}"
DEFAULT_BUCKET="https://storage.googleapis.com/claude-code-dist-86c565f3-f756-42ad-8dfa-d59b1c096819/claude-code-releases"

# ── Configuration (all overridable via env) ─────────────────
GCS_BUCKET="${CLAUDE_BUCKET:-$DEFAULT_BUCKET}"
DOWNLOAD_DIR="${CLAUDE_DOWNLOAD_DIR:-$OSCAR_ROOT/.claude/downloads}"
PRESELECT_VERSION="${CLAUDE_VERSION:-}"
MAX_RETRIES="${CLAUDE_RETRIES:-3}"

# ── Logging ──────────────────────────────────────────────────
log()  { printf "[oscar-claude-install] %s\n"       "$*" >&2; }
die()  { printf "[oscar-claude-install] ERROR: %s\n" "$*" >&2; exit 1; }

usage() {
  cat >&2 <<'EOF'
Usage: install-claude-oscar.sh [stable|latest|VERSION]

Installs Claude Code, localized for the Oscar drive.

Options/Env:
  CLAUDE_BUCKET        Override release bucket URL
  CLAUDE_DOWNLOAD_DIR  Override download dir  (default: <oscar-root>/.claude/downloads)
  CLAUDE_VERSION       Force a specific version (skips "latest" lookup)
  CLAUDE_RETRIES       Retry count for downloads (default: 3)
  OSCAR_ROOT           Oscar drive root       (default: /Volumes/Oscar/Master-Oscar)

Examples:
  ./install-claude-oscar.sh
  ./install-claude-oscar.sh latest
  CLAUDE_VERSION=1.2.3 ./install-claude-oscar.sh
EOF
}

# ── Args ─────────────────────────────────────────────────────
TARGET="${1:-}"
[[ "$TARGET" =~ ^(-h|--help)$ ]] && { usage; exit 0; }

if [[ -n "$TARGET" ]] && [[ ! "$TARGET" =~ ^(stable|latest|[0-9]+\.[0-9]+\.[0-9]+(-[^[:space:]]+)?)$ ]]; then
  usage; exit 1
fi

# ── Dependency check ─────────────────────────────────────────
DOWNLOADER=""
if   command -v curl >/dev/null 2>&1; then DOWNLOADER="curl"
elif command -v wget >/dev/null 2>&1; then DOWNLOADER="wget"
else die "Either curl or wget is required but neither is installed."
fi

HAS_JQ=false
command -v jq >/dev/null 2>&1 && HAS_JQ=true

# ── Cleanup on exit ──────────────────────────────────────────
TMP_FILES=()
cleanup() {
  for f in "${TMP_FILES[@]:-}"; do
    [[ -n "$f" && -e "$f" ]] && rm -f "$f"
  done
}
trap cleanup EXIT

# ── Download with retries ────────────────────────────────────
download_file() {
  local url="$1" output="${2:-}" n=0
  while true; do
    if [[ "$DOWNLOADER" == "curl" ]]; then
      if [[ -n "$output" ]]; then
        curl -fsSL --retry "$MAX_RETRIES" --retry-delay 1 -o "$output" "$url" && return 0
      else
        curl -fsSL --retry "$MAX_RETRIES" --retry-delay 1 "$url" && return 0
      fi
    else
      if [[ -n "$output" ]]; then
        wget -q --tries="$MAX_RETRIES" -O "$output" "$url" && return 0
      else
        wget -q --tries="$MAX_RETRIES" -O - "$url" && return 0
      fi
    fi
    n=$((n+1)); [[ "$n" -ge "$MAX_RETRIES" ]] && break
    sleep 1
  done
  return 1
}

# ── Fallback checksum parser (no jq) ─────────────────────────
get_checksum_from_manifest() {
  local json="$1" platform="$2"
  json=$(echo "$json" | tr -d '\n\r\t' | sed 's/ \+/ /g')
  if [[ $json =~ \"$platform\"[^}]*\"checksum\"[[:space:]]*:[[:space:]]*\"([a-f0-9]{64})\" ]]; then
    echo "${BASH_REMATCH[1]}"; return 0
  fi
  return 1
}

# ── Platform detection ───────────────────────────────────────
case "$(uname -s)" in
  Darwin) os="darwin" ;;
  Linux)  os="linux"  ;;
  MINGW*|MSYS*|CYGWIN*)
    die "Windows is not supported by this script. See https://code.claude.com/docs for Windows options." ;;
  *) die "Unsupported operating system: $(uname -s). See https://code.claude.com/docs." ;;
esac

case "$(uname -m)" in
  x86_64|amd64)   arch="x64"   ;;
  arm64|aarch64)  arch="arm64" ;;
  *) die "Unsupported architecture: $(uname -m)" ;;
esac

# Rosetta 2 detection (Apple Silicon running under x86 emulation)
if [[ "$os" == "darwin" && "$arch" == "x64" ]]; then
  if [[ "$(sysctl -n sysctl.proc_translated 2>/dev/null || echo 0)" == "1" ]]; then
    arch="arm64"
  fi
fi

# musl vs glibc on Linux
if [[ "$os" == "linux" ]]; then
  if [[ -f /lib/libc.musl-x86_64.so.1 || -f /lib/libc.musl-aarch64.so.1 ]] \
     || ldd /bin/ls 2>&1 | grep -q musl; then
    platform="linux-${arch}-musl"
  else
    platform="linux-${arch}"
  fi
else
  platform="${os}-${arch}"
fi

# ── Prepare download dir ─────────────────────────────────────
mkdir -p "$DOWNLOAD_DIR"

# ── Resolve version ──────────────────────────────────────────
if [[ -n "$PRESELECT_VERSION" ]]; then
  version="$PRESELECT_VERSION"
  log "Using preselected version: $version"
else
  log "Fetching latest version from release bucket..."
  version=$(download_file "$GCS_BUCKET/latest") \
    || die "Failed to resolve latest version."
fi
[[ -z "$version" ]] && die "Could not determine version."
log "Version: $version  Platform: $platform"

# ── Fetch manifest & checksum ────────────────────────────────
log "Downloading manifest..."
manifest_json=$(download_file "$GCS_BUCKET/$version/manifest.json") \
  || die "Failed to download manifest."

if [[ "$HAS_JQ" == true ]]; then
  checksum=$(echo "$manifest_json" | jq -r ".platforms[\"$platform\"].checksum // empty")
else
  checksum=$(get_checksum_from_manifest "$manifest_json" "$platform")
fi

[[ -z "${checksum:-}" || ! "$checksum" =~ ^[a-f0-9]{64}$ ]] \
  && die "Platform '$platform' not found in manifest or checksum is malformed."

# ── Download binary ──────────────────────────────────────────
binary_path="$(mktemp "$DOWNLOAD_DIR/claude-$version-$platform.XXXX")"
TMP_FILES+=("$binary_path")

log "Downloading Claude Code $version for $platform ..."
download_file "$GCS_BUCKET/$version/$platform/claude" "$binary_path" \
  || die "Download failed."

# ── Verify checksum ──────────────────────────────────────────
log "Verifying SHA-256 checksum..."
if [[ "$os" == "darwin" ]]; then
  actual=$(shasum -a 256 "$binary_path" | cut -d' ' -f1)
else
  actual=$(sha256sum "$binary_path" | cut -d' ' -f1)
fi
[[ "$actual" != "$checksum" ]] && die "Checksum verification failed — download may be corrupt."

chmod +x "$binary_path"

# ── Run installer ────────────────────────────────────────────
log "Setting up Claude Code on Oscar drive..."
"$binary_path" install ${TARGET:+"$TARGET"}

# Cleanup handled by trap, but do it explicitly for clarity
rm -f "$binary_path"
TMP_FILES=()

printf "\n✅  Claude Code installed successfully!\n"
printf "    Oscar root:  %s\n" "$OSCAR_ROOT"
printf "    Platform:    %s\n" "$platform"
printf "    Version:     %s\n\n" "$version"
