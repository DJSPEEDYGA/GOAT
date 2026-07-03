#!/bin/bash

###############################################################################
# 🐐 GOAT ROYALTY SYSTEM - BACKUP & DEPLOY TO 8TB/10TB DRIVE
# This script will backup the entire GOAT system to external storage
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/workspace/nextjs-commerce"
BACKUP_DIR="/mnt/ai-storage/goat-royalty-backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="goat-system-complete-$DATE.tar.gz"

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🐐 GOAT ROYALTY SYSTEM - BACKUP TO 8TB/10TB DRIVE          ║"
echo "║  Complete System Backup • Security • Privacy                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Error: Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

###############################################################################
# STEP 1: Check for external storage
###############################################################################
echo -e "${BLUE}[Step 1/6] Checking for external storage...${NC}"

# Check if storage is mounted
if ! mountpoint -q /mnt/ai-storage; then
    echo -e "${YELLOW}External storage not mounted at /mnt/ai-storage${NC}"
    echo -e "${YELLOW}Attempting to auto-detect and mount...${NC}"
    
    # Find candidate drives (larger than 1TB)
    DRIVE=$(lsblk -b -o NAME,SIZE -d | awk '$2 > 1000000000000 {print "/dev/"$1}' | head -1)
    
    if [ -n "$DRIVE" ]; then
        echo -e "${GREEN}Found drive: $DRIVE${NC}"
        echo -e "${YELLOW}Please confirm: Is this your 8TB/10TB drive? (y/n)${NC}"
        read -r CONFIRM
        
        if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
            sudo mkdir -p /mnt/ai-storage
            sudo mount "$DRIVE" /mnt/ai-storage
            echo -e "${GREEN}Mounted successfully!${NC}"
        else
            echo -e "${RED}Aborted. Please mount your drive manually.${NC}"
            echo -e "${YELLOW}Instructions:${NC}"
            echo "  1. Connect your 8TB/10TB drive"
            echo "  2. Run: lsblk (to find drive name)"
            echo "  3. Run: sudo mkdir -p /mnt/ai-storage"
            echo "  4. Run: sudo mount /dev/sdX1 /mnt/ai-storage"
            echo "  5. Run this script again"
            exit 1
        fi
    else
        echo -e "${RED}No suitable external drive found.${NC}"
        echo -e "${YELLOW}Please mount your 8TB/10TB drive to /mnt/ai-storage${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ External storage mounted at /mnt/ai-storage${NC}"
fi

# Create backup directory
sudo mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✓ Backup directory created: $BACKUP_DIR${NC}"

###############################################################################
# STEP 2: Create backup manifest
###############################################################################
echo -e "${BLUE}[Step 2/6] Creating backup manifest...${NC}"

cat > "$PROJECT_DIR/backup-manifest-$DATE.txt" << EOF
╔══════════════════════════════════════════════════════════════╗
║  🐐 GOAT ROYALTY SYSTEM - BACKUP MANIFEST                   ║
║  Created: $(date)                                             ║
╚══════════════════════════════════════════════════════════════╝

SYSTEM INFORMATION:
- Project Directory: $PROJECT_DIR
- Total HTML Pages: $(find web-app -name "*.html" -type f | wc -l)
- Total Files: $(find . -type f ! -path '*/node_modules/*' ! -path '*/.git/*' | wc -l)
- Backup Date: $DATE

CORE COMPONENTS:
$(cat << 'COMPONENTS'
✅ Universal Mining System
✅ Self-Healing LLM
✅ Payment & Crypto System
✅ GOAT Branding (77%)
✅ Web Application
✅ API Servers
✅ Documentation
COMPONENTS
)

PAYMENT CONFIGURATION:
- LTC Wallet: 324A37mfy4RBLJY9shXYUeoJw1eERHx12n
- Cash App: $lifeimitatesartinc
- BTC Wallet: $lifeimitatesartinc (Cash App)
- ETH Wallet: [PENDING UPDATE]

SERVICES:
- goat-mining-server.js (Port 3002)
- mining-api-server.js
- simple-server.js
- Self-Healing LLM Daemon

BACKUP CONTENTS:
- Web Application (86 HTML pages)
- Mining System (Universal GPU/CPU)
- Wallet Configuration
- Self-Healing System
- Scripts & Documentation
- Deployment Package

EXCLUDED:
- node_modules/
- .git/
- *.log files
- Temporary files
EOF

cat "$PROJECT_DIR/backup-manifest-$DATE.txt"
echo -e "${GREEN}✓ Backup manifest created${NC}"

###############################################################################
# STEP 3: Create deployment package
###############################################################################
echo -e "${BLUE}[Step 3/6] Creating deployment package...${NC}"

mkdir -p "$PROJECT_DIR/deployment-package/goat-system"

# Copy essential files
cp -r web-app "$PROJECT_DIR/deployment-package/goat-system/"
cp -r lib "$PROJECT_DIR/deployment-package/goat-system/" 2>/dev/null || true
cp -r self-healing-llm "$PROJECT_DIR/deployment-package/goat-system/" 2>/dev/null || true
cp *.sh "$PROJECT_DIR/deployment-package/goat-system/" 2>/dev/null || true
cp *.md "$PROJECT_DIR/deployment-package/goat-system/" 2>/dev/null || true

# Create deployment instructions
cat > "$PROJECT_DIR/deployment-package/goat-system/README-DEPLOY.md" << 'EOF'
# 🐐 GOAT ROYALTY SYSTEM - DEPLOYMENT INSTRUCTIONS

## Quick Start
1. Create deployment directory on server
2. Upload goat-system folder
3. Install dependencies: `npm install`
4. Update wallet addresses in `lib/mining/wallet-config.js`
5. Start services: `bash start-services.sh`
6. Enable self-healing: `cd self-healing-llm && python setup_system.py`

## Services to Start
1. goat-mining-server.js (Port 3002)
2. mining-api-server.js
3. simple-server.js

## Self-Healing Activation
cd self-healing-llm
pip install -r requirements.txt
python setup_system.py --daemon

## Access Points
- Main Dashboard: http://localhost/
- Mining: http://localhost/crypto-mining.html
- Native Miner: http://localhost/goat-native-mining.html
- Payments: http://localhost/support.html

## Configuration Required
1. Update wallet addresses (BTC, ETH, NiceHash API)
2. Configure SMTP for emails (if using)
3. Set up firewall rules
4. Enable HTTPS for production

EOF

echo -e "${GREEN}✓ Deployment package created${NC}"

###############################################################################
# STEP 4: Create compressed backup
###############################################################################
echo -e "${BLUE}[Step 4/6] Creating compressed backup...${NC}"
echo -e "${YELLOW}This may take several minutes...${NC}"

# Create backup excluding node_modules and other unnecessary files
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.next' \
    --exclude='deployment-package' \
    --exclude='backup-storage' \
    --exclude='logs' \
    . 2>/dev/null || true

# Also backup deployment package
tar -czf "$BACKUP_DIR/deployment-package-$DATE.tar.gz" \
    -C deployment-package \
    goat-system 2>/dev/null || true

# Copy manifest
cp "$PROJECT_DIR/backup-manifest-$DATE.txt" "$BACKUP_DIR/"

echo -e "${GREEN}✓ Backup created successfully${NC}"

###############################################################################
# STEP 5: Verify backup
###############################################################################
echo -e "${BLUE}[Step 5/6] Verifying backup...${NC}"

BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
DEPLOY_SIZE=$(du -h "$BACKUP_DIR/deployment-package-$DATE.tar.gz" 2>/dev/null | cut -f1 || echo "0")

echo -e "${GREEN}Backup Statistics:${NC}"
echo "  Main Backup: $BACKUP_SIZE"
echo "  Deployment Package: $DEPLOY_SIZE"
echo "  Location: $BACKUP_DIR"

# Verify we can read the backup
if tar -tzf "$BACKUP_DIR/$BACKUP_FILE" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backup integrity verified${NC}"
else
    echo -e "${RED}✗ Backup verification failed!${NC}"
    exit 1
fi

###############################################################################
# STEP 6: Create startup scripts for auto-deployment
###############################################################################
echo -e "${BLUE}[Step 6/6] Creating startup scripts...${NC}"

# Create start-all-services.sh
cat > "$PROJECT_DIR/start-all-services.sh" << 'EOF'
#!/bin/bash
# Start all GOAT services

echo "Starting GOAT Royalty Services..."

# Kill existing processes
pkill -f "goat-mining-server.js" || true
pkill -f "mining-api-server.js" || true
pkill -f "simple-server.js" || true

# Start services
cd "$(dirname "$0")"

echo "Starting Mining Server (Port 3002)..."
nohup node goat-mining-server.js > logs/mining-server.log 2>&1 &

echo "Starting API Server..."
nohup node mining-api-server.js > logs/api-server.log 2>&1 &

echo "Starting Simple Server..."
nohup node simple-server.js > logs/simple-server.log 2>&1 &

echo "All services started!"
echo "Check logs/ for status"
EOF

chmod +x "$PROJECT_DIR/start-all-services.sh"
cp "$PROJECT_DIR/start-all-services.sh" "$BACKUP_DIR/"

# Copy to deployment package
cp "$PROJECT_DIR/start-all-services.sh" "$PROJECT_DIR/deployment-package/goat-system/"

echo -e "${GREEN}✓ Startup scripts created${NC}"

###############################################################################
# FINAL SUMMARY
###############################################################################
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🎉 BACKUP COMPLETE!                                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}Backup Details:${NC}"
echo "  Location: $BACKUP_DIR"
echo "  Main Backup: $BACKUP_FILE ($BACKUP_SIZE)"
echo "  Deployment Package: deployment-package-$DATE.tar.gz ($DEPLOY_SIZE)"
echo "  Manifest: backup-manifest-$DATE.txt"
echo ""

echo -e "${GREEN}✅ System is fully backed up and ready for deployment!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Transfer deployment package to your servers:"
echo "     scp $BACKUP_DIR/deployment-package-$DATE.tar.gz user@server:/path/to/deploy/"
echo ""
echo "  2. On server, extract and start:"
echo "     tar -xzf deployment-package-$DATE.tar.gz"
echo "     cd goat-system"
echo "     npm install"
echo "     bash start-all-services.sh"
echo ""
echo "  3. Enable self-healing:"
echo "     cd self-healing-llm"
echo "     pip install -r requirements.txt"
echo "     python setup_system.py --daemon"
echo ""
echo -e "${BLUE}🐐 GOAT ROYALTY SYSTEM - Ready to deploy anywhere!${NC}"