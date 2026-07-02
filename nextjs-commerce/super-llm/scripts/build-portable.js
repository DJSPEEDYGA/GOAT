#!/usr/bin/env node
/**
 * Build Portable Distribution
 * 
 * Creates a cross-platform portable distribution of Super LLM
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const PORTABLE_DIR = path.join(DIST_DIR, 'super-llm-portable');

console.log('🚀 Building Super LLM Portable Distribution\n');

// Create directories
console.log('📁 Creating directory structure...');
fs.mkdirSync(PORTABLE_DIR, { recursive: true });
fs.mkdirSync(path.join(PORTABLE_DIR, 'core'), { recursive: true });
fs.mkdirSync(path.join(PORTABLE_DIR, 'bin'), { recursive: true });
fs.mkdirSync(path.join(PORTABLE_DIR, 'config'), { recursive: true });

// Copy core files
console.log('📦 Copying core files...');
const coreDir = path.join(__dirname, '..', 'core');
const coreFiles = fs.readdirSync(coreDir).filter(f => f.endsWith('.js'));

for (const file of coreFiles) {
  fs.copyFileSync(
    path.join(coreDir, file),
    path.join(PORTABLE_DIR, 'core', file)
  );
}

// Copy main entry point
fs.copyFileSync(
  path.join(__dirname, '..', 'super-llm.js'),
  path.join(PORTABLE_DIR, 'bin', 'super-llm.js')
);

// Copy package.json (modified for portable)
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
packageJson.main = 'bin/super-llm.js';
fs.writeFileSync(
  path.join(PORTABLE_DIR, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

// Copy README
fs.copyFileSync(
  path.join(__dirname, '..', 'README.md'),
  path.join(PORTABLE_DIR, 'README.md')
);

// Create launcher scripts
console.log('🔧 Creating launcher scripts...');

// Unix launcher
const unixLauncher = `#!/bin/bash
# Super LLM Portable Launcher
SCRIPT_DIR="\$(cd "\$(dirname "\$0")" && pwd)"
export SUPER_LLM_HOME="\$SCRIPT_DIR"
cd "\$SCRIPT_DIR"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Run Super LLM
node bin/super-llm.js "\$@"
`;

fs.writeFileSync(path.join(PORTABLE_DIR, 'super-llm.sh'), unixLauncher);
fs.chmodSync(path.join(PORTABLE_DIR, 'super-llm.sh'), 0o755);

// Windows launcher
const windowsLauncher = `@echo off
REM Super LLM Portable Launcher
set SCRIPT_DIR=%~dp0
set SUPER_LLM_HOME=%SCRIPT_DIR%

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is required but not installed.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Run Super LLM
node "%SCRIPT_DIR%bin\\super-llm.js" %*
`;

fs.writeFileSync(path.join(PORTABLE_DIR, 'super-llm.bat'), windowsLauncher);

// Create .env.example
const envExample = `# Super LLM Configuration
# Copy this file to .env and fill in your API keys

# NVIDIA Build API Key (Required)
NVIDIA_BUILD_API_KEY=your-api-key-here

# Optional: Override default model
# SUPER_LLM_DEFAULT_MODEL=auto

# Optional: Enable/disable cache
# SUPER_LLM_CACHE=true

# Optional: Max retries on failure
# SUPER_LLM_MAX_RETRIES=3

# Optional: Request timeout in milliseconds
# SUPER_LLM_TIMEOUT=60000
`;

fs.writeFileSync(path.join(PORTABLE_DIR, '.env.example'), envExample);

// Create default config
const defaultConfig = {
  apiKey: '',
  defaultModel: 'auto',
  enableCache: true,
  maxRetries: 3,
  timeout: 60000,
  outputFormat: 'text'
};

fs.writeFileSync(
  path.join(PORTABLE_DIR, 'config', 'default.json'),
  JSON.stringify(defaultConfig, null, 2)
);

// Install dependencies if npm available
console.log('📥 Installing dependencies...');
try {
  execSync('npm install --production', {
    cwd: PORTABLE_DIR,
    stdio: 'inherit'
  });
  console.log('✓ Dependencies installed');
} catch (error) {
  console.log('⚠ Could not install dependencies. Run "npm install" manually.');
}

// Create zip archive
console.log('📦 Creating distribution archive...');
try {
  if (process.platform === 'win32') {
    // Use PowerShell on Windows
    execSync(`powershell Compress-Archive -Path "${PORTABLE_DIR}\\*" -DestinationPath "${DIST_DIR}\\super-llm-portable.zip" -Force`);
  } else {
    // Use zip on Unix
    execSync(`cd "${DIST_DIR}" && zip -r super-llm-portable.zip super-llm-portable`);
  }
  console.log('✓ Archive created');
} catch (error) {
  console.log('⚠ Could not create archive. Create manually.');
}

console.log('\n✅ Portable distribution built successfully!');
console.log(`📁 Location: ${PORTABLE_DIR}`);
console.log(`📦 Archive: ${path.join(DIST_DIR, 'super-llm-portable.zip')}`);
console.log('\nUsage:');
console.log('  Unix/Linux/macOS: ./super-llm.sh query "your prompt"');
console.log('  Windows: super-llm.bat query "your prompt"');