#!/bin/bash

#
# GOAT ROYALTY APP - Complete Build & Deployment System
# Builds all installers, packages everything, and prepares for deployment
#

set -e  # Exit on error

echo "🚀 GOAT ROYALTY APP - Complete Build & Deployment System"
echo "=================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/workspace/nextjs-commerce"
DESKTOP_BUILD_DIR="$PROJECT_DIR/desktop-builds"
INSTALLERS_DIR="$PROJECT_DIR/installers/final"
BACKUP_DIR="/workspace/goat-royalty-backup"
VERSION="2.0.0"
DATE=$(date +%Y%m%d_%H%M%S)

echo "📋 Configuration:"
echo "  Project Directory: $PROJECT_DIR"
echo "  Build Directory: $DESKTOP_BUILD_DIR"
echo "  Installers Directory: $INSTALLERS_DIR"
echo "  Backup Directory: $BACKUP_DIR"
echo "  Version: $VERSION"
echo "  Timestamp: $DATE"
echo ""

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Step 1: VerifyDependencies
echo "🔍 Step 1: Verifying Dependencies..."
echo "=================================="

check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 is installed"
    else
        print_warning "$1 is not installed - will skip related builds"
        return 1
    fi
}

NODE_CMD=false
ELECTRON_CMD=false
DOCKER_CMD=false

check_command node && NODE_CMD=true
check_command npm && NODE_CMD=true
check_command electron && ELECTRON_CMD=true || (check_command npx && ELECTRON_CMD=true)
check_command docker && DOCKER_CMD=true

# Check for additional tools
check_command git
check_command python3

echo ""

# Step 2: Prepare Build Directories
echo "📁 Step 2: Preparing Build Directories..."
echo "====================================="

mkdir -p "$DESKTOP_BUILD_DIR"
mkdir -p "$INSTALLERS_DIR"
mkdir -p "$BACKUP_DIR"
mkdir -p "$DESKTOP_BUILD_DIR/windows"
mkdir -p "$DESKTOP_BUILD_DIR/macos"
mkdir -p "$DESKTOP_BUILD_DIR/linux"
mkdir -p "$DESKTOP_BUILD_DIR/portable"

print_success "Build directories created"

echo ""

# Step 3: Install Dependencies
if [ "$NODE_CMD" = true ]; then
    echo "📦 Step 3: Installing Node.js Dependencies..."
    echo "=========================================="
    
    cd "$PROJECT_DIR"
    
    if [ -f "package.json" ]; then
        print_info "Installing npm packages..."
        npm install --production
        print_success "Dependencies installed"
    else
        print_warning "package.json not found, skipping npm install"
    fi
    
    echo ""
fi

# Step 4: Create Electron App Structure
if [ "$ELECTRON_CMD" = true ]; then
    echo "⚡ Step 4: Creating Electron App Structure..."
    echo "=========================================="
    
    ELECTRON_DIR="$DESKTOP_BUILD_DIR/electron-app"
    mkdir -p "$ELECTRON_DIR"
    
    # Copy web-app to electron app
    cp -r "$PROJECT_DIR/web-app" "$ELECTRON_DIR/web-app"
    cp -r "$PROJECT_DIR/lib" "$ELECTRON_DIR/lib" 2>/dev/null || true
    cp -r "$PROJECT_DIR/src" "$ELECTRON_DIR/src" 2>/dev/null || true
    
    # Create main.js for Electron
    cat > "$ELECTRON_DIR/main.js" << 'EOF'
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = false; // Production mode

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: path.join(__dirname, 'web-app', 'goat-logo.png'),
        title: 'GOAT Royalty App v2.0'
    });

    // Load the index.html of the app
    mainWindow.loadFile(path.join(__dirname, 'web-app', 'index.html'));

    // Open DevTools in development
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

// Create application menu
const template = [
    {
        label: 'File',
        submenu: [
            { role: 'quit' }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' }
        ]
    },
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'toggledevtools' },
            { role: 'togglefullscreen' }
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: function () {
                    // Open about page
                }
            }
        ]
    }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
EOF
    
    # Create package.json for Electron app
    cat > "$ELECTRON_DIR/package.json" << EOF
{
  "name": "goat-royalty-app",
  "version": "$VERSION",
  "description": "GOAT Royalty App - Complete Music, AI, Crypto, and Production Platform",
  "main": "main.js",
  "author": "GOAT Team",
  "license": "MIT",
  "dependencies": {
    "electron": "^25.0.0"
  },
  "devDependencies": {
    "electron-builder": "^24.4.0",
    "electron-packager": "^17.1.1"
  },
  "build": {
    "appId": "com.goat.royalty.app",
    "productName": "GOAT Royalty",
    "directories": {
      "output": "dist"
    },
    "files": [
      "web-app/**/*",
      "lib/**/*",
      "src/**/*",
      "main.js"
    ],
    "win": {
      "target": "nsis",
      "icon": "web-app/goat-logo.png"
    },
    "mac": {
      "target": "dmg",
      "icon": "web-app/goat-logo.png",
      "category": "public.app-category.music"
    },
    "linux": {
      "target": ["deb", "AppImage"],
      "icon": "web-app/goat-logo.png",
      "category": "Audio"
    }
  }
}
EOF
    
    print_success "Electron app structure created"
    echo ""
else
    print_warning "Skipping Electron build - Electron not available"
fi

# Step 5: Build Windows Installer
if [ "$ELECTRON_CMD" = true ]; then
    echo "🪟 Step 5: Building Windows Installer..."
    echo "======================================"
    
    cd "$ELECTRON_DIR"
    
    # Install electron dependencies
    if [ -f "package.json" ]; then
        npm install electron-builder electron-packager --save-dev 2>/dev/null || true
    fi
    
    # Build Windows app
    print_info "Building Windows application..."
    
    if command -v npx &> /dev/null; then
        npx electron-builder --win || print_warning "Windows build failed, continuing..."
    fi
    
    # Check if build succeeded
    if [ -d "dist" ]; then
        find dist -name "*.exe" -o -name "*.msi" | while read file; do
            cp "$file" "$INSTALLERS_DIR/"
            print_success "Windows installer: $(basename $file)"
        done
    else
        print_warning "Windows installer not generated"
    fi
    
    echo ""
fi

# Step 6: Build macOS Installer
if [ "$ELECTRON_CMD" = true ]; then
    echo "🍎 Step 6: Building macOS Installer..."
    echo "===================================="
    
    print_info "Building macOS application..."
    
    if command -v npx &> /dev/null; then
        npx electron-builder --mac || print_warning "macOS build failed, continuing..."
    fi
    
    # Check if build succeeded
    if [ -d "dist" ]; then
        find dist -name "*.dmg" -o -name "*.zip" | while read file; do
            cp "$file" "$INSTALLERS_DIR/"
            print_success "macOS installer: $(basename $file)"
        done
    else
        print_warning "macOS installer not generated"
    fi
    
    echo ""
fi

# Step 7: Build Linux Installers
if [ "$ELECTRON_CMD" = true ]; then
    echo "🐧 Step 7: Building Linux Installers..."
    echo "====================================="
    
    print_info "Building Linux applications..."
    
    if command -v npx &> /dev/null; then
        npx electron-builder --linux || print_warning "Linux build failed, continuing..."
    fi
    
    # Check if build succeeded
    if [ -d "dist" ]; then
        find dist -name "*.deb" -o -name "*.AppImage" -o -name "*.rpm" | while read file; do
            cp "$file" "$INSTALLERS_DIR/"
            print_success "Linux installer: $(basename $file)"
        done
    else
        print_warning "Linux installers not generated"
    fi
    
    echo ""
fi

# Step 8: Create Portable Version
echo "💾 Step 8: Creating Portable Version..."
echo "======================================"

PORTABLE_DIR="$DESKTOP_BUILD_DIR/portable/goat-royalty-portable-$VERSION"
mkdir -p "$PORTABLE_DIR"

# Copy essential files
cp -r "$PROJECT_DIR/web-app" "$PORTABLE_DIR/web-app"
cp -r "$PROJECT_DIR/lib" "$PORTABLE_DIR/lib" 2>/dev/null || true
cp -r "$PROJECT_DIR/src" "$PORTABLE_DIR/src" 2>/dev/null || true
cp -r "$PROJECT_DIR/installers" "$PORTABLE_DIR/installers" 2>/dev/null || true

# Create portable launcher
cat > "$PORTABLE_DIR/START-GOAT-APP.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>GOAT Royalty App - Portable Launcher</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #667eea;
            margin-bottom: 30px;
        }
        a.button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-size: 18px;
            margin: 10px;
            transition: transform 0.2s;
        }
        a.button:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐐 GOAT ROYALTY APP</h1>
        <h3>Portable Edition v2.0</h3>
        <p>Click below to launch the application</p>
        <a href="web-app/index.html" class="button">🚀 Launch GOAT App</a>
        <br><br>
        <p><small>Requires a web browser (Chrome, Firefox, Safari, Edge)</small></p>
    </div>
</body>
</html>
EOF

# Create README for portable version
cat > "$PORTABLE_DIR/README-PORTABLE.txt" << EOF
GOAT ROYALTY APP - Portable Edition
====================================

Version: $VERSION
Date: $(date)

INSTRUCTIONS:
1. Open START-GOAT-APP.html in your web browser
2. The app will run directly in the browser
3. No installation required
4. All features available (requires internet for AI services)

FEATURES:
- Music Production Studio
- AI/LLM Integration
- Crypto Mining Dashboard
- Financial Management
- Cyber Security Tools
- Dating Platform
- Movie Production
- And 80+ more features!

SUPPORT:
For issues or questions, visit the main website.

© GOAT Team - All Rights Reserved
EOF

# Create portable archive
cd "$DESKTOP_BUILD_DIR/portable"
zip -r "goat-royalty-portable-$VERSION.zip" "goat-royalty-portable-$VERSION"
cp "goat-royalty-portable-$VERSION.zip" "$INSTALLERS_DIR/"

print_success "Portable version created: goat-royalty-portable-$VERSION.zip"
echo ""

# Step 9: Create Linux .deb Package
echo "📦 Step 9: Creating Linux .deb Package..."
echo "========================================"

DEB_DIR="$DESKTOP_BUILD_DIR/linux-deb"
DEB_ROOT="$DEB_DIR/goat-royalty"
mkdir -p "$DEB_ROOT/opt/goat-royalty"
mkdir -p "$DEB_root/usr/share/applications"
mkdir -p "$DEB_ROOT/DEBIAN"

# Copy files
cp -r "$PROJECT_DIR/web-app" "$DEB_ROOT/opt/goat-royalty/"
cp -r "$PROJECT_DIR/lib" "$DEB_ROOT/opt/goat-royalty/" 2>/dev/null || true
cp -r "$PROJECT_DIR/src" "$DEB_ROOT/opt/goat-royalty/" 2>/dev/null || true

# Create control file
cat > "$DEB_ROOT/DEBIAN/control" << EOF
Package: goat-royalty
Version: $VERSION
Section: audio
Priority: optional
Architecture: amd64
Maintainer: GOAT Team <support@goatroyalty.app>
Installed-Size: 500000
Depends: nodejs, npm
Homepage: https://goatroyalty.app
Description: GOAT Royalty App - Complete Music, AI, Crypto Platform
 Complete platform for music production, AI integration, crypto mining,
 financial management, cybersecurity, and content creation.
EOF

# Build .deb package
cd "$DEB_DIR"
dpkg-deb --build goat-royalty
cp goat-royalty.deb "$INSTALLERS_DIR/"

print_success "Linux .deb package created: goat-royalty.deb"
echo ""

# Step 10: Create Server Package
echo "🖥️  Step 10: Creating Server Deployment Package..."
echo "=============================================="

SERVER_DIR="$DESKTOP_BUILD_DIR/server-package"
mkdir -p "$SERVER_DIR"

# Copy web application
cp -r "$PROJECT_DIR/web-app" "$SERVER_DIR/"
cp -r "$PROJECT_DIR/src" "$SERVER_DIR/" 2>/dev/null || true
cp -r "$PROJECT_DIR/lib" "$SERVER_DIR/" 2>/dev/null || true

# Copy deployment scripts
cp "$PROJECT_DIR/deploy-to-server.sh" "$SERVER_DIR/" 2>/dev/null || true
cp "$PROJECT_DIR/deploy-complete.sh" "$SERVER_DIR/" 2>/dev/null || true
cp "$PROJECT_DIR/production-setup.sh" "$SERVER_DIR/" 2>/dev/null || true

# Copy documentation
cp "$PROJECT_DIR/DEPLOY-TO-YOUR-SERVERS.md" "$SERVER_DIR/" 2>/dev/null || true
cp "$PROJECT_DIR/complete-app-inventory.md" "$SERVER_DIR/" 2>/dev/null || true

# Create server deployment script
cat > "$SERVER_DIR/deploy-production.sh" << 'EOF'
#!/bin/bash
# Production Deployment Script
# Upload this entire directory to your server

echo "🚀Deploying GOAT Royalty to Production Server..."

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install dependencies
npm install

# Start the server
npm start

echo "✅ Deployment complete!"
echo "Access your app at http://your-server-ip:3000"
EOF

chmod +x "$SERVER_DIR/deploy-production.sh"

# Create server archive
cd "$DESKTOP_BUILD_DIR"
tar -czf "server-package-$VERSION.tar.gz" -C server-package .
cp "server-package-$VERSION.tar.gz" "$INSTALLERS_DIR/"

print_success "Server package created: server-package-$VERSION.tar.gz"
echo ""

# Step 11: Create Complete Documentation Bundle
echo "📚 Step 11: Creating Documentation Bundle..."
echo "============================================"

DOCS_DIR="$DESKTOP_BUILD_DIR/documentation"
mkdir -p "$DOCS_DIR"

# Copy all documentation
find "$PROJECT_DIR" -maxdepth 1 -name "*.md" -exec cp {} "$DOCS_DIR/" \;
cp "$PROJECT_DIR/complete-app-inventory.md" "$DOCS_DIR/"

# Create master README
cat > "$DOCS_DIR/README-MASTER.txt" << EOF
GOAT ROYALTY APP - Complete Documentation Bundle
=================================================

Version: $VERSION
Date: $(date)

DOCUMENTATION INCLUDES:
- complete-app-inventory.md - Full system inventory
- DEPLOY-TO-YOUR-SERVERS.md - Server deployment guide
- BUILD-INSTRUCTIONS.md - Build instructions
- README.md - Main README
- And many more guides...

QUICK START:
1. Read complete-app-inventory.md for overview
2. Follow BUILD-INSTRUCTIONS.md to build
3. Use deployment scripts to deploy
4. Refer to specific guides for each feature

SUPPORT:
All documentation is available in this directory.

© GOAT Team - All Rights Reserved
EOF

# Create documentation archive
cd "$DESKTOP_BUILD_DIR"
zip -r "documentation-$VERSION.zip" documentation/
cp "documentation-$VERSION.zip" "$INSTALLERS_DIR/"

print_success "Documentation bundle created: documentation-$VERSION.zip"
echo ""

# Step 12: Backup to External Drive
echo "💾 Step 12: Preparing for External Drive Backup..."
echo "================================================"

EXTERNAL_BACKUP_SCRIPT="$PROJECT_DIR/backup-to-8tb-drive.sh"

cat > "$EXTERNAL_BACKUP_SCRIPT" << EOBACKUP
#!/bin/bash

# Backup Script for GOAT Royalty App to 8TB Drive
# Run this to backup the entire project

BACKUP_SOURCE="$PROJECT_DIR"
BACKUP_DEST="/mnt/8tb-drive/goat-royalty-backup"
DATE=\$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting backup to 8TB drive..."
echo "Source: \$BACKUP_SOURCE"
echo "Destination: \$BACKUP_DEST"

# Create backup directory
mkdir -p "\$BACKUP_DEST/\$DATE"

# Backup complete project
rsync -av --progress \\
    --exclude 'node_modules' \\
    --exclude '.git' \\
    --exclude 'desktop-builds' \\
    "\$BACKUP_SOURCE/" \\
    "\$BACKUP_DEST/\$DATE/"

# Backup installer directory
if [ -d "$INSTALLERS_DIR" ]; then
    mkdir -p "\$BACKUP_DEST/installers"
    cp -r "$INSTALLERS_DIR/"* "\$BACKUP_DEST/installers/"
fi

echo "✅ Backup completed to \$BACKUP_DEST/\$DATE"

# Create backup summary
cat > "\$BACKUP_DEST/LATEST-BACKUP.txt" << EOTXT
Latest Backup: \$DATE
Source: \$BACKUP_SOURCE
Destination: \$BACKUP_DEST
Date: \$(date)

Backup Contents:
- Complete source code
- All HTML pages
- Backend API routes
- Installers
- Documentation
EOTXT

echo "Backup summary written to \$BACKUP_DEST/LATEST-BACKUP.txt"
EOBACKUP

chmod +x "$EXTERNAL_BACKUP_SCRIPT"

print_success "Backup script created: backup-to-8tb-drive.sh"
echo ""

# Step 13: Generate Final Report
echo "📊 Step 13: Generating Final Report..."
echo "===================================="

FINAL_REPORT="$INSTALLERS_DIR/BUILD-REPORT-$DATE.txt"

cat > "$FINAL_REPORT" << EOFREPORT
GOAT ROYALTY APP - Build & Deployment Report
=============================================

Build Date: $(date)
Version: $VERSION
Timestamp: $DATE

BUILD SUMMARY:
-------------

✅ COMPLETED BUILDS:
- Web Application: Complete
- Portable Version: Created
- Linux .deb Package: Created
- Server Package: Created
- Documentation Bundle: Created

⚠️  CONDITIONAL BUILDS (may require tools):
- Windows Installer: Attempted (requires Electron)
- macOS Installer: Attempted (requires macOS)
- Linux AppImage: Attempted (requires Electron)

FILES GENERATED:
---------------
$INSTALLERS_DIR/ contains:

$(ls -lh "$INSTALLERS_DIR/" 2>/dev/null || echo "No files generated yet")

DEPLOYMENT PACKAGES:
-------------------
1. Web Application: web-app/ directory
2. Portable Version: goat-royalty-portable-$VERSION.zip
3. Server Package: server-package-$VERSION.tar.gz
4. Linux Installer: goat-royalty.deb
5. Documentation: documentation-$VERSION.zip

DEPLOYMENT INSTRUCTIONS:
-----------------------

1. FOR 8TB DRIVE BACKUP:
   Run: bash "$PROJECT_DIR/backup-to-8tb-drive.sh"
   Mount your 8TB drive and execute the script

2. FOR SERVER DEPLOYMENT:
   Upload server-package-$VERSION.tar.gz to your servers
   Extract and run: bash deploy-production.sh
   Servers: 93.127.214.171, 72.61.193.184

3. FOR DESKTOP INSTALLATION:
   Windows: Install .exe from installers/ directory
   macOS: Install .dmg from installers/ directory
   Linux: Install .deb package
   Portable: Extract .zip and open START-GOAT-APP.html

4. FOR WEB DEPLOYMENT:
   Deploy web-app/ directory to any web server
   Requires Node.js and npm for full functionality

SYSTEM FEATURES:
---------------
- 83 HTML Pages with GOAT branding
- Complete Music Production Studio
- AI/LLM Integration System
- Crypto Mining Dashboard (simulated - needs real implementation)
- Financial Management System
- Payment & Royalty Processing
- Cyber Security Tools
- Dating Platform
- Movie Production System
- And 80+ more features!

NEEDS CONFIGURATION:
-------------------
- Real crypto mining implementation
- API keys for external services
- Payment gateway credentials
- NVIDIA integration credentials
- Background check service APIs
- Database connection setup

NEXT STEPS:
----------
1. Install the app on your systems
2. Configure API keys and credentials
3. Test all features
4. Deploy to production servers
5. Backup to 8TB drive
6. Begin using all features!

SUPPORT DOCUMENTATION:
----------------------
All documentation is in documentation-$VERSION.zip
Start with complete-app-inventory.md

Generated by: complete-build-and-deploy.sh
© GOAT Team - All Rights Reserved
EOFREPORT

print_success "Final report generated: $FINAL_REPORT"
echo ""

# Step 14: Finish Build
echo "🎉 Step 14: Build Complete!"
echo "============================"

echo ""
echo "📊 BUILD SUMMARY:"
echo "================"
echo ""
echo "✅ All possible builds completed"
echo "✅ Installers directory: $INSTALLERS_DIR"
echo "✅ Backup script created: backup-to-8tb-drive.sh"
echo "✅ Build report: $FINAL_REPORT"
echo ""
echo "📦 Generated Files:"
ls -lh "$INSTALLERS_DIR/" 2>/dev/null | tail -n +2
echo ""
echo "🚀 DEPLOYMENT READY!"
echo "==================="
echo ""
echo "To backup to 8TB drive:"
echo "  1. Mount your 8TB drive"
echo "  2. Run: bash $PROJECT_DIR/backup-to-8tb-drive.sh"
echo ""
echo "To deploy to servers:"
echo "  Upload server-package-$VERSION.tar.gz to your servers"
echo ""
echo "To install desktop apps:"
echo "  Run the appropriate installer from $INSTALLERS_DIR"
echo ""
echo "For detailed information, see:"
echo "  Build Report: $FINAL_REPORT"
echo "  Complete Inventory: $PROJECT_DIR/complete-app-inventory.md"
echo ""
print_success "Build and deployment preparation complete! 🚀"
echo ""