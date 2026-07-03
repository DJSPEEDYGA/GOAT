#!/bin/bash
# ============================================================================
# 🐐⚡ SUPER GOAT ROYALTY — Deploy to BOTH Hostinger Servers
# Run this from YOUR Mac/PC terminal or paste into SSH
# Fixed: Uses GOAT-APP branch (the actual default branch)
# ============================================================================

echo "🐐⚡ Deploying GOAT Royalty App to BOTH servers..."
echo ""

# ============================================================================
# SERVER 1: KVM2 PRIMARY (72.61.193.184)
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 [1/2] Deploying to KVM2 PRIMARY (72.61.193.184)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh root@72.61.193.184 << 'EOF'
echo "📥 Cloning/updating repository..."
cd ~
if [ -d GOAT-Royalty-App2 ]; then
  cd GOAT-Royalty-App2
  git fetch origin GOAT-APP
  git reset --hard origin/GOAT-APP
  echo "✅ Repository updated (branch: GOAT-APP)"
else
  git clone -b GOAT-APP https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
  cd GOAT-Royalty-App2
  echo "✅ Repository cloned (branch: GOAT-APP)"
fi

echo "📦 Installing dependencies..."
npm install --production 2>&1 | tail -3

echo "🔨 Building app..."
npm run build 2>&1 | tail -5

echo "🚀 Starting with PM2..."
pm2 delete goat-app 2>/dev/null
pm2 start npm --name goat-app -- start -- -p 3000
pm2 save
pm2 startup 2>/dev/null

echo ""
echo "✅ KVM2 PRIMARY DEPLOYED!"
echo "🌐 URL: http://72.61.193.184:3000"
pm2 status
EOF

echo ""

# ============================================================================
# SERVER 2: KVM8 BACKUP (93.127.214.171)
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 [2/2] Deploying BACKUP to KVM8 (93.127.214.171)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh root@93.127.214.171 << 'EOF'
echo "📥 Cloning/updating repository..."
cd ~
if [ -d GOAT-Royalty-App2 ]; then
  cd GOAT-Royalty-App2
  git fetch origin GOAT-APP
  git reset --hard origin/GOAT-APP
  echo "✅ Repository updated (branch: GOAT-APP)"
else
  git clone -b GOAT-APP https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
  cd GOAT-Royalty-App2
  echo "✅ Repository cloned (branch: GOAT-APP)"
fi

echo "📦 Installing dependencies..."
npm install --production 2>&1 | tail -3

echo "🔨 Building app..."
npm run build 2>&1 | tail -5

echo "🚀 Starting with PM2..."
pm2 delete goat-app 2>/dev/null
pm2 start npm --name goat-app -- start -- -p 3000
pm2 save
pm2 startup 2>/dev/null

echo ""
echo "✅ KVM8 BACKUP DEPLOYED!"
echo "🌐 URL: http://93.127.214.171:3000"
pm2 status
EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐐⚡ BOTH SERVERS DEPLOYED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  PRIMARY: http://72.61.193.184:3000"
echo "  BACKUP:  http://93.127.214.171:3000"
echo ""
echo "  GitHub:  https://github.com/DJSPEEDYGA/GOAT-Royalty-App2"
echo "  Branch:  GOAT-APP"
echo ""