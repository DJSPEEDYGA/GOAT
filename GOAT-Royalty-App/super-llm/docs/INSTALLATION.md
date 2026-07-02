# Super LLM Installation Guide

This guide covers installing Super LLM on Windows, macOS, and Linux.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Windows Installation](#windows-installation)
3. [macOS Installation](#macos-installation)
4. [Linux Installation](#linux-installation)
5. [Portable Installation](#portable-installation)
6. [Configuration](#configuration)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### All Platforms

- **Node.js** 16.x or higher
- **NPM** 7.x or higher
- **NVIDIA Build API Key** - Get from [build.nvidia.com](https://build.nvidia.com/)

### Checking Prerequisites

```bash
# Check Node.js version
node --version  # Should be v16.x or higher

# Check NPM version
npm --version   # Should be 7.x or higher
```

---

## Windows Installation

### Option 1: EXE Installer (Recommended)

1. Download `super-llm-setup.exe` from the releases page
2. Run the installer
3. Follow the installation wizard
4. Add your API key when prompted

### Option 2: PowerShell Installation

```powershell
# Run the PowerShell installer
irm https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/super-llm/install/install-super-llm.ps1 | iex
```

### Option 3: Manual Installation

```powershell
# Clone repository
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git
cd GOAT-Royalty-App/super-llm

# Install dependencies
npm install

# Link globally
npm link

# Configure
super-llm config --api-key YOUR_API_KEY
```

### Windows PATH Setup

If the `super-llm` command is not found:

1. Open System Properties → Environment Variables
2. Add to PATH: `C:\Users\YourName\AppData\Roaming\npm`
3. Restart terminal

---

## macOS Installation

### Option 1: DMG Installer (Recommended)

1. Download `super-llm.dmg` from the releases page
2. Open the DMG file
3. Drag Super LLM to Applications
4. Open Terminal and run: `super-llm`

### Option 2: Homebrew

```bash
# Add tap
brew tap DJSPEEDYGA/goat-royalty

# Install
brew install super-llm
```

### Option 3: Shell Script Installation

```bash
# Run the installer
curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/super-llm/install/install-super-llm.sh | bash
```

### Option 4: Manual Installation

```bash
# Clone repository
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git
cd GOAT-Royalty-App/super-llm

# Install dependencies
npm install

# Link globally
npm link

# Configure
super-llm config --api-key YOUR_API_KEY
```

### macOS Permissions

If you get "unidentified developer" warnings:

```bash
# Allow the app
xattr -cr /Applications/SuperLLM.app

# Or in System Preferences → Privacy & Security → Open Anyway
```

---

## Linux Installation

### Option 1: Shell Script Installation (Recommended)

```bash
# Run the installer
curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/super-llm/install/install-super-llm.sh | bash
```

### Option 2: APT (Debian/Ubuntu)

```bash
# Add repository
curl -fsSL https://packages.super-llm.ai/gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/super-llm.gpg

echo "deb [signed-by=/usr/share/keyrings/super-llm.gpg] https://packages.super-llm.ai/apt stable main" | sudo tee /etc/apt/sources.list.d/super-llm.list

# Install
sudo apt update
sudo apt install super-llm
```

### Option 3: RPM (Fedora/RHEL)

```bash
# Add repository
sudo dnf config-manager --add-repo https://packages.super-llm.ai/rpm/super-llm.repo

# Install
sudo dnf install super-llm
```

### Option 4: Manual Installation

```bash
# Clone repository
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git
cd GOAT-Royalty-App/super-llm

# Install dependencies
npm install

# Link globally
sudo npm link

# Configure
super-llm config --api-key YOUR_API_KEY
```

### Linux Permissions

If you get permission errors:

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

---

## Portable Installation

The portable version requires no installation and can be run from any location.

### Download

Download the portable distribution for your platform:
- Windows: `super-llm-portable-windows.zip`
- macOS: `super-llm-portable-macos.zip`
- Linux: `super-llm-portable-linux.tar.gz`

### Setup

1. Extract the archive to your preferred location
2. Set your API key:

```bash
# Copy example config
cp .env.example .env

# Edit with your API key
nano .env  # Or use any text editor
```

3. Run Super LLM:

```bash
# Unix/macOS
./super-llm.sh query "Hello world"

# Windows
super-llm.bat query "Hello world"
```

### USB Drive Setup

The portable version is perfect for USB drives:

1. Extract to USB drive: `E:\super-llm-portable`
2. Create a `config` folder
3. Add your `config.json` file
4. Run from any computer with Node.js installed

---

## Configuration

### API Key Setup

**Option 1: Environment Variable**

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export NVIDIA_BUILD_API_KEY=your-api-key-here
```

**Option 2: Config Command**

```bash
super-llm config --api-key your-api-key-here
```

**Option 3: Config File**

Create `~/.super-llm/config.json`:

```json
{
  "apiKey": "your-api-key-here",
  "defaultModel": "auto",
  "enableCache": true,
  "maxRetries": 3,
  "timeout": 60000
}
```

### Getting an API Key

1. Go to [build.nvidia.com](https://build.nvidia.com/)
2. Sign in or create an account
3. Navigate to API Keys
4. Generate a new key
5. Copy and save securely

---

## Verification

### Test Installation

```bash
# Check version
super-llm --version

# Test query
super-llm query "Hello, are you working?"

# List available models
super-llm models

# Check configuration
super-llm config
```

### Expected Output

```
Super LLM v1.0.0

Response: Hello! Yes, I'm working perfectly. How can I help you today?
Model: gpt-4o
```

---

## Troubleshooting

### "Command not found"

```bash
# Ensure npm global bin is in PATH
echo $PATH  # Should include npm global bin

# Find npm global bin
npm config get prefix

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$(npm config get prefix)/bin:$PATH"
```

### "No API key configured"

```bash
# Set API key
super-llm config --api-key your-key

# Or export environment variable
export NVIDIA_BUILD_API_KEY=your-key
```

### "Permission denied"

```bash
# Fix permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ~/.super-llm

# Make scripts executable
chmod +x super-llm.sh
```

### "Network error" / "Connection refused"

```bash
# Check internet connection
ping build.nvidia.com

# Check proxy settings
export HTTP_PROXY=http://proxy:port
export HTTPS_PROXY=http://proxy:port

# Or disable proxy
unset HTTP_PROXY HTTPS_PROXY
```

### "Rate limit exceeded"

The system has built-in retry logic. Wait a few seconds and try again. If persistent:

```bash
# Enable caching to reduce API calls
super-llm config --enable-cache true
```

### "Model not available"

```bash
# Check available models
super-llm models

# Use a specific model
super-llm query "test" -m gpt-4o
```

---

## Uninstallation

### NPM Global

```bash
npm uninstall -g super-llm
rm -rf ~/.super-llm
```

### Windows

1. Run `uninstall.exe` from installation directory
2. Or: Settings → Apps → Super LLM → Uninstall

### macOS

```bash
# DMG installation
sudo rm -rf /Applications/SuperLLM.app

# Homebrew
brew uninstall super-llm
```

### Linux

```bash
# APT
sudo apt remove super-llm

# RPM
sudo dnf remove super-llm

# Manual
sudo npm unlink -g super-llm
rm -rf ~/.super-llm
```

---

## Next Steps

- Read the [API Documentation](../README.md#api-documentation)
- Try the [Integration Guide](../README.md#integration-guide)
- Join our [Discord](https://discord.gg/clawd) for support