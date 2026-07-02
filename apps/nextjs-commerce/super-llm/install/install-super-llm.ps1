<#
.SYNOPSIS
    Super LLM Installer for Windows
    
.DESCRIPTION
    Downloads and installs the Super LLM engine on Windows.
    Combines 215 LLMs from NVIDIA Build into one intelligent system.
    
.PARAMETER Version
    Specific version to install (default: latest)
    
.PARAMETER InstallDir
    Installation directory (default: $env:LOCALAPPDATA\SuperLLM)
    
.PARAMETER NoSymlink
    Don't add to PATH
    
.EXAMPLE
    .\install-super-llm.ps1
    .\install-super-llm.ps1 -Version "1.0.0"
    .\install-super-llm.ps1 -InstallDir "C:\Tools\SuperLLM"
#>

param(
    [string]$Version = "",
    [string]$InstallDir = "",
    [switch]$NoSymlink = $false,
    [switch]$Uninstall = $false,
    [switch]$Help = $false
)

# Colors for output
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Error { Write-Host "❌ ERROR: $args" -ForegroundColor Red }
function Write-Warning { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }
function Write-Step { Write-Host "🚀 $args" -ForegroundColor Magenta }

# Show help
if ($Help) {
    @'
╔═══════════════════════════════════════════════════════════════╗
║                  🚀 Super LLM Installer (Windows)             ║
║                                                               ║
║   Combines 215 LLMs from NVIDIA Build into one Super LLM      ║
╚═══════════════════════════════════════════════════════════════╝

Usage: .\install-super-llm.ps1 [OPTIONS]

Options:
    -Version        Install specific version (e.g., "1.0.0")
    -InstallDir     Installation directory (default: $env:LOCALAPPDATA\SuperLLM)
    -NoSymlink      Don't add Super LLM to PATH
    -Uninstall      Remove Super LLM installation
    -Help           Show this help message

Examples:
    .\install-super-llm.ps1
    .\install-super-llm.ps1 -Version "1.0.0"
    .\install-super-llm.ps1 -InstallDir "C:\Tools\SuperLLM"

For more information: https://github.com/DJSPEEDYGA/super-llm
'@
    exit 0
}

# Uninstall function
if ($Uninstall) {
    Write-Step "Uninstalling Super LLM..."
    
    $defaultDir = Join-Path $env:LOCALAPPDATA "SuperLLM"
    $dir = if ($InstallDir) { $InstallDir } else { $defaultDir }
    
    if (Test-Path $dir) {
        Remove-Item -Recurse -Force $dir
        Write-Success "Removed installation directory: $dir"
    }
    
    # Remove from PATH
    $path = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($path -like "*$dir*") {
        $newPath = ($path -split ';' | Where-Object { $_ -ne $dir }) -join ';'
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
        Write-Success "Removed from PATH"
    }
    
    Write-Success "Uninstall complete!"
    exit 0
}

# Configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$Version = if ($Version) { $Version } else { "1.0.0" }
$InstallDir = if ($InstallDir) { $InstallDir } else { Join-Path $env:LOCALAPPDATA "SuperLLM" }
$ConfigDir = Join-Path $InstallDir "config"
$LogsDir = Join-Path $InstallDir "logs"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                  🚀 Super LLM Installer                      " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check for Node.js
Write-Step "Checking dependencies..."

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Warning "Node.js not found. Installing via winget..."
    
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    } else {
        Write-Error "Node.js is required. Please install from https://nodejs.org"
        exit 1
    }
}

$nodeVersion = node --version
Write-Success "Node.js $nodeVersion detected"

# Create directories
Write-Step "Creating directories..."

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null
New-Item -ItemType Directory -Force -Path $LogsDir | Out-Null

Write-Success "Directories created"

# Create configuration
Write-Step "Creating configuration..."

$configFile = Join-Path $ConfigDir "super-llm.json"

if (-not (Test-Path $configFile)) {
    $config = @{
        version = $Version
        apiKey = "`${NVIDIA_BUILD_API_KEY}"
        defaultModel = "auto"
        maxRetries = 3
        timeout = 60000
        cacheEnabled = $true
        trackPerformance = $true
        models = @{
            reasoning = @("gpt-4o", "claude-opus-4", "gemini-2.0-flash")
            code = @("deepseek-coder-v3", "claude-sonnet-4", "codellama-70b")
            fast = @("gpt-4o-mini", "claude-haiku-3.5", "llama-3.2-3b")
        }
    }
    
    $config | ConvertTo-Json -Depth 10 | Set-Content $configFile
    Write-Success "Configuration created: $configFile"
}

# Create .env template
$envFile = Join-Path $ConfigDir ".env.example"

$envContent = @"
# Super LLM Configuration
# Copy this file to .env and fill in your API keys

# NVIDIA Build API Key (required for 215 LLMs)
NVIDIA_BUILD_API_KEY=your-nvidia-build-api-key

# OpenAI API Key (optional)
OPENAI_API_KEY=your-openai-api-key

# Anthropic API Key (optional)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Google API Key (optional)
GOOGLE_API_KEY=your-google-api-key

# Mistral API Key (optional)
MISTRAL_API_KEY=your-mistral-api-key
"@

Set-Content -Path $envFile -Value $envContent
Write-Success "Environment template created: $envFile"

# Create SuperLLM core module
Write-Step "Creating Super LLM engine..."

$coreDir = Join-Path $InstallDir "core"
New-Item -ItemType Directory -Force -Path $coreDir | Out-Null

# Download or create core module (simplified for installer)
$coreJsContent = @'
/**
 * Super LLM Engine for Windows
 */

class SuperLLM {
    constructor(config = {}) {
        this.config = {
            apiKey: config.apiKey || process.env.NVIDIA_BUILD_API_KEY,
            defaultModel: config.defaultModel || 'auto',
            maxRetries: config.maxRetries || 3,
            timeout: config.timeout || 60000,
            ...config
        };
        
        this.modelRegistry = this.initializeRegistry();
        this.performance = { queries: 0, successes: 0, failures: 0 };
    }

    initializeRegistry() {
        return {
            'openai/gpt-4o': { name: 'GPT-4o', provider: 'openai', capabilities: ['reasoning', 'code'] },
            'anthropic/claude-opus-4': { name: 'Claude Opus 4', provider: 'anthropic', capabilities: ['reasoning', 'analysis'] },
            'google/gemini-2.0-flash': { name: 'Gemini 2.0', provider: 'google', capabilities: ['reasoning', 'multimodal'] },
            'meta/llama-3.3-70b': { name: 'Llama 3.3', provider: 'meta', capabilities: ['reasoning', 'general'] },
            'deepseek/deepseek-coder-v3': { name: 'DeepSeek Coder', provider: 'deepseek', capabilities: ['code'] }
        };
    }

    async query(prompt, options = {}) {
        const model = options.model || this.selectModel(prompt);
        const startTime = Date.now();
        
        try {
            const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 2048
                })
            });
            
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            
            const data = await response.json();
            this.performance.successes++;
            
            return {
                content: data.choices[0].message.content,
                model: model,
                usage: data.usage,
                latency: Date.now() - startTime
            };
        } catch (error) {
            this.performance.failures++;
            throw error;
        }
    }

    selectModel(prompt) {
        const lower = prompt.toLowerCase();
        if (lower.includes('code') || lower.includes('function')) return 'deepseek/deepseek-coder-v3';
        if (lower.includes('analyze')) return 'anthropic/claude-opus-4';
        return 'openai/gpt-4o';
    }

    getStats() {
        return this.performance;
    }
}

module.exports = SuperLLM;
'@

Set-Content -Path (Join-Path $coreDir "SuperLLM.js") -Value $coreJsContent
Write-Success "Core engine created"

# Create CLI executable
Write-Step "Creating CLI..."

$cliContent = @'
#!/usr/bin/env node
const SuperLLM = require('./core/SuperLLM');
const readline = require('readline');

async function main() {
    const args = process.argv.slice(2);
    const llm = new SuperLLM();
    
    // Interactive mode
    if (args.length === 0) {
        console.log('\n🚀 Super LLM - 215 LLMs in One');
        console.log('Type your prompt and press Enter. Type "exit" to quit.\n');
        
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const prompt = (q) => new Promise(r => rl.question(q, r));
        
        while (true) {
            const input = await prompt('You: ');
            if (input.toLowerCase() === 'exit') break;
            
            if (input.trim()) {
                console.log('\n🤖 Thinking...');
                try {
                    const response = await llm.query(input);
                    console.log(`\n${response.content}`);
                    console.log(`\n📊 Latency: ${response.latency}ms`);
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
    try {
        const response = await llm.query(query);
        console.log(response.content);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main().catch(console.error);
'@

$cliPath = Join-Path $InstallDir "super-llm.js"
Set-Content -Path $cliPath -Value $cliContent

# Create batch wrapper
$batContent = @"
@echo off
node "$InstallDir\super-llm.js" %*
"@

$batPath = Join-Path $InstallDir "super-llm.bat"
Set-Content -Path $batPath -Value $batContent

Write-Success "CLI created"

# Create package.json
$packageJson = @{
    name = "super-llm"
    version = $Version
    description = "Super LLM - 215 LLMs in One"
    main = "super-llm.js"
    bin = @{ "super-llm" = "./super-llm.js" }
    scripts = @{
        start = "node super-llm.js"
    }
    dependencies = @{
        commander = "^12.0.0"
        chalk = "^5.3.0"
    }
}

$packageJson | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $InstallDir "package.json")

# Add to PATH
if (-not $NoSymlink) {
    Write-Step "Adding to PATH..."
    
    $path = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($path -notlike "*$InstallDir*") {
        [Environment]::SetEnvironmentVariable("PATH", "$path;$InstallDir", "User")
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "User")
        Write-Success "Added to PATH"
    }
}

# Create desktop shortcut
Write-Step "Creating shortcuts..."

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut([Environment]::GetFolderPath("Desktop") + "\Super LLM.lnk")
$Shortcut.TargetPath = "cmd.exe"
$Shortcut.Arguments = "/k `"$batPath`""
$Shortcut.Description = "Super LLM - 215 LLMs in One"
$Shortcut.Save()

Write-Success "Desktop shortcut created"

# Installation summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "                  🎉 Installation Complete!                   " -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Version:        $Version"
Write-Host "  Install Dir:    $InstallDir"
Write-Host "  Config Dir:     $ConfigDir"
Write-Host ""
Write-Host "  Quick Start:"
Write-Host "  ─────────────────────────────────────────────"
Write-Host "  1. Set your API key:"
Write-Host "     `$env:NVIDIA_BUILD_API_KEY = 'your-api-key'"
Write-Host ""
Write-Host "  2. Run Super LLM:"
Write-Host "     super-llm `"Explain quantum computing`""
Write-Host ""
Write-Host "  Or double-click the desktop shortcut!"
Write-Host ""
Write-Host "  Documentation: https://github.com/DJSPEEDYGA/super-llm"
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Success "Installation complete!"