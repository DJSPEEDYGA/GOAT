#!/bin/bash

# GOAT Royalty App - GitHub Deployment Script
# This script deploys the app to GitHub repository

set -e

echo "🚀 GOAT Royalty App - GitHub Deployment"
echo "========================================"

# Configuration
REPO_OWNER="DJSPEEDYGA"
REPO_NAME="GOAT-Royalty-App2"
BRANCH="GOAT-APP"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}Please authenticate with GitHub CLI:${NC}"
    gh auth login
fi

echo -e "${GREEN}✓ GitHub CLI is ready${NC}"

# Clone the repository if not already cloned
if [ ! -d "GOAT-Royalty-App2" ]; then
    echo -e "${YELLOW}Cloning repository...${NC}"
    gh repo clone ${REPO_OWNER}/${REPO_NAME}
fi

cd ${REPO_NAME}

# Checkout the correct branch
echo -e "${YELLOW}Checking out branch: ${BRANCH}${NC}"
git checkout ${BRANCH} 2>/dev/null || git checkout -b ${BRANCH}

# Copy all files from goat-app
echo -e "${YELLOW}Copying application files...${NC}"
cp -r ../goat-app/* .
cp -r ../goat-app/.* . 2>/dev/null || true

# Add all files
echo -e "${YELLOW}Staging files...${NC}"
git add -A

# Commit changes
echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "🚀 GOAT Royalty App v3.0.0 - Complete Release

Features:
- Hierarchical AI Agent System (Orchestrator + 12 Workers)
- 215+ LLM Support via Unified Router
- Blockchain Royalty Verification (Ethereum, Polygon, Arbitrum, Base)
- Cryptocurrency Mining Simulation
- NFT Royalty Management
- DeFi Integration (Staking, Yield Farming)
- DSP Distribution & Analytics
- Video/Audio Editing Tools
- Plugin System for Extensibility
- Dark Theme with Gold Accents

Builds:
- Linux AppImage (128 MB)
- Windows ZIP (126 MB)
- macOS DMG (requires Mac build)

Built with Electron + Node.js
" || echo "No changes to commit"

# Push to GitHub
echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/${REPO_NAME}.git ${BRANCH}

echo -e "${GREEN}✓ Successfully pushed to GitHub!${NC}"
echo ""
echo "Repository: https://github.com/${REPO_OWNER}/${REPO_NAME}"
echo "Branch: ${BRANCH}"