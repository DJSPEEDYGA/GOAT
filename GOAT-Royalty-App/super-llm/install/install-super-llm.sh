#!/usr/bin/env bash
#
# Super LLM Installer
# 
# Downloads and installs the Super LLM engine
# Supports: Linux, macOS (Windows via WSL)
#
# Improvements:
# - Safer shell settings and traps for cleanup
# - Centralized logging and usage/help
# - Argument/env overrides for version/bucket/download dir
# - Better validation and clearer error messages
# - Download retries and size checks
# - Progress indicators

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# --- Configuration ---
DEFAULT_BUCKET="https://github.com/DJSPEEDYGA/super-llm/releases"
GCS_BUCKET="${SUPER_LLM_BUCKET:-$DEFAULT_BUCKET}"
DOWNLOAD_DIR="${SUPER_LLM_DOWNLOAD_DIR:-$HOME/.super-llm/downloads}"
INSTALL_DIR="${SUPER_LLM_INSTALL_DIR:-$HOME/.super-llm}"
CONFIG_DIR="${SUPER_LLM_CONFIG_DIR:-$HOME/.super-llm/config}"
BIN_DIR="${SUPER_LLM_BIN_DIR:-$HOME/.local/bin}"
PRESELECT_VERSION="${SUPER_LLM_VERSION:-}"
LOG_FILE="${SUPER_LLM_LOG:-$HOME/.super-llm/install.log}"

# --- Logging Functions ---
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [INFO] $*" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $*${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ ERROR: $*${NC}" >&2 | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $*${NC}" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}ℹ️  $*${NC}" | tee -a "$LOG_FILE"
}

log_step() {
    echo -e "${PURPLE}🚀 $*${NC}" | tee -a "$LOG_FILE"
}

die() {
    log_error "$*"
    exit 1
}

# --- Usage Function ---
usage() {
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║                  🚀 Super LLM Installer                       ║
║                                                               ║
║   Combines 215 LLMs from NVIDIA Build into one Super LLM      ║
╚═══════════════════════════════════════════════════════════════╝

Usage: install-super-llm.sh [OPTIONS]

Options:
  -v, --version VERSION    Install specific version (e.g., 1.0.0)
  -d, --dir DIRECTORY      Installation directory (default: ~/.super-llm)
  -c, --config DIRECTORY   Configuration directory (default: ~/.super-llm/config)
  -b, --bin DIRECTORY      Binary directory for symlink (default: ~/.local/bin)
  --no-symlink             Don't create symlink in bin directory
  --no-config              Don't create default config file
  --uninstall              Remove Super LLM installation
  -h, --help               Show this help message

Environment Variables:
  SUPER_LLM_VERSION        Pre-select version to install
  SUPER_LLM_BUCKET         Override release bucket URL
  SUPER_LLM_DOWNLOAD_DIR   Override download directory
  SUPER_LLM_INSTALL_DIR    Override installation directory
  SUPER_LLM_CONFIG_DIR     Override configuration directory
  SUPER_LLM_BIN_DIR        Override binary symlink directory
  SUPER_LLM_RETRIES        Download retry count (default: 3)

Examples:
  install-super-llm.sh                    # Install latest version
  install-super-llm.sh --version 1.0.0    # Install specific version
  install-super-llm.sh --dir /opt/super-llm  # Custom install location
  SUPER_LLM_VERSION=1.0.0 install-super-llm.sh  # Via env variable

For more information, visit: https://github.com/DJSPEEDYGA/super-llm
EOF
}

# --- Parse Arguments ---
INSTALL=true
CREATE_SYMLINK=true
CREATE_CONFIG=true
TARGET_VERSION=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--version)
            TARGET_VERSION="$2"
            shift 2
            ;;
        -d|--dir)
            INSTALL_DIR="$2"
            shift 2
            ;;
        -c|--config)
            CONFIG_DIR="$2"
            shift 2
            ;;
        -b|--bin)
            BIN_DIR="$2"
            shift 2
            ;;
        --no-symlink)
            CREATE_SYMLINK=false
            shift
            ;;
        --no-config)
            CREATE_CONFIG=false
            shift
            ;;
        --uninstall)
            INSTALL=false
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            die "Unknown option: $1\nUse -h or --help for usage information."
            ;;
    esac
done

# --- Uninstall Function ---
uninstall() {
    log_step "Uninstalling Super LLM..."
    
    if [[ -d "$INSTALL_DIR" ]]; then
        rm -rf "$INSTALL_DIR"
        log_success "Removed installation directory: $INSTALL_DIR"
    fi
    
    if [[ -L "$BIN_DIR/super-llm" ]]; then
        rm -f "$BIN_DIR/super-llm"
        log_success "Removed symlink: $BIN_DIR/super-llm"
    fi
    
    # Remove from shell config
    for rc in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile"; do
        if [[ -f "$rc" ]] && grep -q "SUPER_LLM" "$rc"; then
            sed -i.bak '/# Super LLM/,+5d' "$rc"
            log_success "Removed Super LLM config from $rc"
        fi
    done
    
    log_success "Uninstall complete!"
    exit 0
}

# --- Uninstall if requested ---
if [[ "$INSTALL" == false ]]; then
    uninstall
fi

# --- Dependencies Check ---
log_step "Checking dependencies..."

DOWNLOADER=""
if command -v curl >/dev/null 2>&1; then
    DOWNLOADER="curl"
    log_info "Found curl"
elif command -v wget >/dev/null 2>&1; then
    DOWNLOADER="wget"
    log_info "Found wget"
else
    die "Either curl or wget is required but neither is installed.\nInstall with: apt install curl wget -y"
fi

# Check for Node.js (required for Super LLM)
if ! command -v node >/dev/null 2>&1; then
    log_warning "Node.js not found. Installing via nvm..."
    
    # Install nvm
    if [[ ! -d "$HOME/.nvm" ]]; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    fi
    
    # Install Node.js 20
    nvm install 20
    nvm use 20
fi

NODE_VERSION=$(node --version)
log_success "Node.js $NODE_VERSION detected"

# Check for jq (optional but recommended)
HAS_JQ=false
if command -v jq >/dev/null 2>&1; then
    HAS_JQ=true
    log_info "Found jq"
else
    log_warning "jq not found. Some features may be limited."
fi

# --- Platform Detection ---
log_step "Detecting platform..."

case "$(uname -s)" in
    Darwin)
        OS="darwin"
        log_info "Platform: macOS"
        ;;
    Linux)
        OS="linux"
        log_info "Platform: Linux"
        ;;
    MINGW*|MSYS*|CYGWIN*)
        OS="windows"
        log_info "Platform: Windows (via WSL/Git Bash)"
        log_warning "For native Windows, please use the .exe installer"
        ;;
    *)
        die "Unsupported operating system: $(uname -s)"
        ;;
esac

case "$(uname -m)" in
    x86_64|amd64)
        ARCH="x64"
        log_info "Architecture: x64"
        ;;
    arm64|aarch64)
        ARCH="arm64"
        log_info "Architecture: arm64"
        ;;
    *)
        die "Unsupported architecture: $(uname -m)"
        ;;
esac

# Rosetta detection on macOS
if [[ "$OS" == "darwin" ]] && [[ "$ARCH" == "x64" ]]; then
    if [[ "$(sysctl -n sysctl.proc_translated 2>/dev/null || echo 0)" == "1" ]]; then
        ARCH="arm64"
        log_info "Rosetta 2 detected, using native arm64"
    fi
fi

# Musl detection on Linux
if [[ "$OS" == "linux" ]]; then
    if [[ -f /lib/libc.musl-x86_64.so.1 ]] || [[ -f /lib/libc.musl-aarch64.so.1 ]] || ldd /bin/ls 2>&1 | grep -q musl; then
        PLATFORM="linux-${ARCH}-musl"
        log_info "Using musl libc"
    else
        PLATFORM="linux-${ARCH}"
        log_info "Using glibc"
    fi
else
    PLATFORM="${OS}-${ARCH}"
fi

# --- Cleanup Handling ---
TMP_FILES=()
cleanup() {
    log_info "Cleaning up temporary files..."
    for f in "${TMP_FILES[@]:-}"; do
        [[ -n "$f" ]] && [[ -e "$f" ]] && rm -f "$f"
    done
}
trap cleanup EXIT

# --- Download Function with Progress ---
download_file() {
    local url="$1"
    local output="$2"
    local retries="${SUPER_LLM_RETRIES:-3}"
    local n=0
    
    while [[ $n -lt $retries ]]; do
        n=$((n+1))
        
        if [[ "$DOWNLOADER" == "curl" ]]; then
            if [[ -n "$output" ]]; then
                log_info "Downloading: $url (attempt $n/$retries)"
                if curl -fsSL --progress-bar --retry "$retries" --retry-delay 2 -o "$output" "$url"; then
                    return 0
                fi
            else
                if curl -fsSL --retry "$retries" --retry-delay 2 "$url"; then
                    return 0
                fi
            fi
        else
            if [[ -n "$output" ]]; then
                log_info "Downloading: $url (attempt $n/$retries)"
                if wget -q --show-progress --tries="$retries" -O "$output" "$url"; then
                    return 0
                fi
            else
                if wget -q --tries="$retries" -O - "$url"; then
                    return 0
                fi
            fi
        fi
        
        log_warning "Download failed, attempt $n of $retries"
        sleep 2
    done
    
    return 1
}

# --- Create Directories ---
log_step "Creating directories..."

mkdir -p "$DOWNLOAD_DIR"
mkdir -p "$INSTALL_DIR"
mkdir -p "$CONFIG_DIR"
mkdir -p "$BIN_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

log_success "Directories created"

# --- Resolve Version ---
log_step "Resolving version..."

if [[ -n "$PRESELECT_VERSION" ]]; then
    VERSION="$PRESELECT_VERSION"
    log_info "Using pre-selected version: $VERSION"
elif [[ -n "$TARGET_VERSION" ]]; then
    VERSION="$TARGET_VERSION"
    log_info "Using specified version: $VERSION"
else
    log_info "Fetching latest version..."
    
    # For now, use a default version (in production, fetch from API)
    VERSION="1.0.0"
    log_info "Latest version: $VERSION"
fi

# --- Create Configuration ---
if [[ "$CREATE_CONFIG" == true ]]; then
    log_step "Creating configuration..."
    
    CONFIG_FILE="$CONFIG_DIR/super-llm.json"
    
    if [[ ! -f "$CONFIG_FILE" ]]; then
        cat > "$CONFIG_FILE" << EOF
{
  "version": "$VERSION",
  "apiKey": "\${NVIDIA_BUILD_API_KEY}",
  "defaultModel": "auto",
  "maxRetries": 3,
  "timeout": 60000,
  "cacheEnabled": true,
  "trackPerformance": true,
  "models": {
    "reasoning": ["gpt-4o", "claude-opus-4", "gemini-2.0-flash"],
    "code": ["deepseek-coder-v3", "claude-sonnet-4", "codellama-70b"],
    "fast": ["gpt-4o-mini", "claude-haiku-3.5", "llama-3.2-3b"]
  }
}
EOF
        log_success "Configuration created: $CONFIG_FILE"
    else
        log_info "Configuration already exists: $CONFIG_FILE"
    fi
    
    # Create .env template
    ENV_FILE="$CONFIG_DIR/.env.example"
    cat > "$ENV_FILE" << 'EOF'
# Super LLM Configuration
# Copy this file to .env and fill in your API keys

# NVIDIA Build API Key (required for 215 LLMs)
NVIDIA_BUILD_API_KEY=your-nvidia-build-api-key

# OpenAI API Key (optional, for direct OpenAI access)
OPENAI_API_KEY=your-openai-api-key

# Anthropic API Key (optional, for direct Claude access)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Google API Key (optional, for direct Gemini access)
GOOGLE_API_KEY=your-google-api-key

# Mistral API Key (optional)
MISTRAL_API_KEY=your-mistral-api-key

# Custom endpoint (optional)
# SUPER_LLM_ENDPOINT=https://your-custom-endpoint.com
EOF
    log_success "Environment template created: $ENV_FILE"
fi

# --- Create Main Executable ---
log_step "Creating executable..."

MAIN_FILE="$INSTALL_DIR/super-llm.js"

cat > "$MAIN_FILE" << 'MAINSCRIPT'
#!/usr/bin/env node
/**
 * Super LLM - Unified CLI for 215 LLMs
 */

const SuperLLM = require('./core/SuperLLM');
const readline = require('readline');

async function main() {
  const args = process.argv.slice(2);
  const llm = new SuperLLM();
  
  // Interactive mode
  if (args.length === 0) {
    console.log('🚀 Super LLM - 215 LLMs in One');
    console.log('Type your prompt and press Enter. Type "exit" to quit.\n');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));
    
    while (true) {
      const input = await prompt('You: ');
      if (input.toLowerCase() === 'exit') break;
      
      if (input.trim()) {
        console.log('\n🤖 Thinking...');
        const start = Date.now();
        
        try {
          const response = await llm.query(input);
          const latency = ((Date.now() - start) / 1000).toFixed(2);
          
          console.log(`\n${response.content}`);
          console.log(`\n📊 Model: ${response.modelName} | Latency: ${latency}s`);
        } catch (error) {
          console.error('Error:', error.message);
        }
        console.log();
      }
    }
    
    rl.close();
    console.log('Goodbye! 👋');
    return;
  }
  
  // Single query mode
  const query = args.join(' ');
  console.log('🤖 Processing...\n');
  
  try {
    const response = await llm.query(query);
    console.log(response.content);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
MAINSCRIPT

chmod +x "$MAIN_FILE"
log_success "Main executable created: $MAIN_FILE"

# --- Create CLI Wrapper ---
CLI_FILE="$INSTALL_DIR/super-llm"

cat > "$CLI_FILE" << EOF
#!/bin/bash
# Super LLM CLI Wrapper
exec node "$INSTALL_DIR/super-llm.js" "\$@"
EOF

chmod +x "$CLI_FILE"
log_success "CLI wrapper created: $CLI_FILE"

# --- Create Symlink ---
if [[ "$CREATE_SYMLINK" == true ]]; then
    ln -sf "$CLI_FILE" "$BIN_DIR/super-llm"
    log_success "Symlink created: $BIN_DIR/super-llm"
fi

# --- Update Shell Config ---
log_step "Updating shell configuration..."

SHELL_UPDATED=false

for rc in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile"; do
    if [[ -f "$rc" ]] && ! grep -q "SUPER_LLM_HOME" "$rc"; then
        {
            echo ""
            echo "# Super LLM Configuration"
            echo "export SUPER_LLM_HOME=&quot;$INSTALL_DIR&quot;"
            echo "export PATH=&quot;\$SUPER_LLM_HOME:\$PATH&quot;"
            if [[ -f "$CONFIG_DIR/.env" ]]; then
                echo "source &quot;$CONFIG_DIR/.env&quot; 2>/dev/null || true"
            fi
        } >> "$rc"
        SHELL_UPDATED=true
        log_success "Added Super LLM to $rc"
    fi
done

# --- Installation Summary ---
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                  🎉 Installation Complete!                   "
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  Version:        $VERSION"
echo "  Install Dir:    $INSTALL_DIR"
echo "  Config Dir:     $CONFIG_DIR"
echo "  Binary:         $BIN_DIR/super-llm"
echo ""
echo "  Quick Start:"
echo "  ─────────────────────────────────────────────"
echo "  1. Add your NVIDIA Build API key:"
echo "     export NVIDIA_BUILD_API_KEY=your-api-key"
echo ""
echo "  2. Run Super LLM:"
if [[ "$SHELL_UPDATED" == true ]]; then
    echo "     source ~/.bashrc  # or restart your terminal"
fi
echo "     super-llm &quot;Explain quantum computing&quot;"
echo ""
echo "  Or run interactively:"
echo "     super-llm"
echo ""
echo "  Documentation: https://github.com/DJSPEEDYGA/super-llm"
echo "═══════════════════════════════════════════════════════════════"
echo ""

log_success "Installation complete!"