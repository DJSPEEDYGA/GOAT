#!/bin/bash
#
# Build macOS DMG for Super LLM
#
# Requirements:
#   - macOS
#   - Xcode Command Line Tools
#   - create-dmg (brew install create-dmg)
#
# Usage: ./build-dmg.sh [version]

set -e

VERSION="${1:-1.0.0}"
APP_NAME="Super LLM"
APP_DIR="dist/SuperLLM.app"
DMG_NAME="super-llm-${VERSION}.dmg"
VOLUME_NAME="Super LLM ${VERSION}"

echo "🚀 Building ${APP_NAME} DMG v${VERSION}"

# Check for macOS
if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "❌ This script must be run on macOS"
    exit 1
fi

# Check dependencies
command -v create-dmg >/dev/null 2>&1 || {
    echo "📦 Installing create-dmg..."
    brew install create-dmg
}

# Clean previous build
rm -rf dist
mkdir -p dist

# Create app bundle structure
echo "📁 Creating app bundle..."
mkdir -p "${APP_DIR}/Contents/MacOS"
mkdir -p "${APP_DIR}/Contents/Resources"
mkdir -p "${APP_DIR}/Contents/Frameworks"

# Create Info.plist
cat > "${APP_DIR}/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>super-llm-launcher</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.djspeedyga.super-llm</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleDisplayName</key>
    <string>${APP_NAME}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>${VERSION}</string>
    <key>CFBundleVersion</key>
    <string>${VERSION}</string>
    <key>CFBundleDocumentTypes</key>
    <array>
        <dict>
            <key>CFBundleTypeName</key>
            <string>Text Document</string>
            <key>LSHandlerRank</key>
            <string>Alternate</string>
            <key>LSItemContentTypes</key>
            <array>
                <string>public.plain-text</string>
            </array>
        </dict>
    </array>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSHumanReadableCopyright</key>
    <string>Copyright © 2024 DJSPEEDYGA. All rights reserved.</string>
    <key>NSMainNibFile</key>
    <string></string>
    <key>NSPrincipalClass</key>
    <string>NSApplication</string>
</dict>
</plist>
EOF

# Create launcher script
cat > "${APP_DIR}/Contents/MacOS/super-llm-launcher" << 'LAUNCHER'
#!/bin/bash

# Super LLM Launcher for macOS
# Opens Terminal and runs Super LLM

APP_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
RESOURCES_DIR="$APP_DIR/Contents/Resources"

# Check for Node.js
if ! command -v node &> /dev/null; then
    osascript -e 'display dialog "Node.js is required but not installed.\n\nPlease install Node.js from https://nodejs.org" buttons {"OK"} default button "OK" with title "Super LLM" with icon stop'
    exit 1
fi

# Check for API key
if [[ -z "$NVIDIA_BUILD_API_KEY" ]]; then
    # Check for .env file
    if [[ -f "$HOME/.super-llm/.env" ]]; then
        source "$HOME/.super-llm/.env"
    fi
fi

# Create AppleScript to launch Terminal with Super LLM
osascript << 'APPLESCRIPT'
tell application "Terminal"
    activate
    do script "clear && echo '🚀 Super LLM - 215 LLMs in One' && echo '' && node &quot;$HOME/.super-llm/super-llm.js&quot;"
end tell
APPLESCRIPT
LAUNCHER

chmod +x "${APP_DIR}/Contents/MacOS/super-llm-launcher"

# Create core directory and files
mkdir -p "${APP_DIR}/Contents/Resources/core"
mkdir -p "${APP_DIR}/Contents/Resources/config"

# Copy SuperLLM core
cp ../core/SuperLLM.js "${APP_DIR}/Contents/Resources/core/" 2>/dev/null || true

# Create the main CLI script inside Resources
cat > "${APP_DIR}/Contents/Resources/super-llm.js" << 'MAINJS'
#!/usr/bin/env node
const SuperLLM = require('./core/SuperLLM');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const configDir = path.join(process.env.HOME, '.super-llm');
const configFile = path.join(configDir, 'config.json');

// Ensure config directory exists
if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
}

// Load or create config
let config = {};
if (fs.existsSync(configFile)) {
    config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
}

async function main() {
    const args = process.argv.slice(2);
    const llm = new SuperLLM(config);
    
    // Interactive mode
    if (args.length === 0) {
        console.log('\n🚀 Super LLM - 215 LLMs in One');
        console.log('Type your prompt and press Enter. Type "exit" to quit.\n');
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const prompt = (q) => new Promise(r => rl.question(q, r));
        
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
                    console.log(`\n📊 Model: ${response.modelName || response.model} | Latency: ${latency}s`);
                } catch (error) {
                    console.error('Error:', error.message);
                    if (error.message.includes('API key')) {
                        console.log('\n💡 Tip: Set your NVIDIA Build API key:');
                        console.log('   export NVIDIA_BUILD_API_KEY=your-api-key');
                    }
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
MAINJS

chmod +x "${APP_DIR}/Contents/Resources/super-llm.js"

# Create default config
cat > "${APP_DIR}/Contents/Resources/config/super-llm.json" << EOF
{
    "version": "${VERSION}",
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

# Create .env template
cat > "${APP_DIR}/Contents/Resources/config/.env.example" << 'ENVFILE'
# Super LLM Configuration
# Copy to ~/.super-llm/.env and fill in your API keys

# NVIDIA Build API Key (required for 215 LLMs)
NVIDIA_BUILD_API_KEY=your-nvidia-build-api-key

# Optional: Direct provider API keys
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
MISTRAL_API_KEY=
ENVFILE

# Create README
cat > "${APP_DIR}/Contents/Resources/README.md" << README
# Super LLM for macOS

## Quick Start

1. Set your NVIDIA Build API key:
   \`\`\`bash
   export NVIDIA_BUILD_API_KEY=your-api-key
   \`\`\`

2. Run Super LLM:
   - Double-click the app, or
   - Run from Terminal: \`super-llm "Your question"\`

## Features

- **215 LLMs** from NVIDIA Build
- **Intelligent Routing** - Auto-selects the best model
- **Fallback System** - Graceful degradation
- **Cost Optimization** - Routes to efficient models

## Documentation

https://github.com/DJSPEEDYGA/super-llm

## Support

- GitHub Issues: https://github.com/DJSPEEDYGA/super-llm/issues
- Email: support@super-llm.dev
README

# Create a simple icon (placeholder - replace with actual icon)
if [[ -f "assets/icon.icns" ]]; then
    cp "assets/icon.icns" "${APP_DIR}/Contents/Resources/AppIcon.icns"
else
    # Create a placeholder icon using system icon
    cp "/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns" \
       "${APP_DIR}/Contents/Resources/AppIcon.icns" 2>/dev/null || true
fi

# Create Applications symlink target for DMG
mkdir -p dist/dmg-temp
cp -R "${APP_DIR}" dist/dmg-temp/
ln -s /Applications dist/dmg-temp/Applications

# Create README for DMG
cat > dist/dmg-temp/README.txt << 'DMGREADME'
╔═══════════════════════════════════════════════════════════════╗
║                  🚀 Super LLM for macOS                       ║
╚═══════════════════════════════════════════════════════════════╝

INSTALLATION:
1. Drag "Super LLM" to the "Applications" folder
2. Open Super LLM from your Applications folder
3. Set your NVIDIA Build API key when prompted

GET YOUR API KEY:
https://build.nvidia.com

QUICK START:
1. Open Terminal
2. Run: export NVIDIA_BUILD_API_KEY=your-api-key
3. Run: super-llm "Explain quantum computing"

DOCUMENTATION:
https://github.com/DJSPEEDYGA/super-llm

╔═══════════════════════════════════════════════════════════════╗
║  Version: ${VERSION}                                            ║
║  © 2024 DJSPEEDYGA - MIT License                              ║
╚═══════════════════════════════════════════════════════════════╝
DMGREADME

# Build DMG using create-dmg
echo "📦 Creating DMG..."
create-dmg \
    --volname "${VOLUME_NAME}" \
    --volicon "assets/icon.icns" \
    --background "assets/background.png" \
    --window-pos 200 120 \
    --window-size 660 400 \
    --icon-size 100 \
    --icon "Super LLM.app" 180 170 \
    --hide-extension "Super LLM.app" \
    --app-drop-link 480 170 \
    --no-internet-enable \
    "dist/${DMG_NAME}" \
    "dist/dmg-temp/" || {
        # Fallback to hdiutil if create-dmg fails
        echo "📦 Using hdiutil to create DMG..."
        hdiutil create -volname "${VOLUME_NAME}" -srcfolder dist/dmg-temp -ov -format UDZO "dist/${DMG_NAME}"
    }

# Cleanup
rm -rf dist/dmg-temp

# Sign the DMG (optional - requires Developer ID)
if [[ -n "$APPLE_DEVELOPER_ID" ]]; then
    echo "🔑 Signing DMG..."
    codesign --sign "Developer ID Application: $APPLE_DEVELOPER_ID" "dist/${DMG_NAME}"
fi

echo ""
echo "✅ DMG created: dist/${DMG_NAME}"
echo ""
echo "To distribute:"
echo "  1. Test the DMG on another Mac"
echo "  2. Submit for notarization (if signed):"
echo "     xcrun notarytool submit dist/${DMG_NAME} --wait"
echo "  3. Staple the ticket:"
echo "     xcrun stapler staple dist/${DMG_NAME}"
echo ""