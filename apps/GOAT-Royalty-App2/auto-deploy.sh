#!/bin/bash
# GOAT Royalty App - Automated Deployment Script
# Run this on your VPS after uploading the deployment package

set -e

echo "🚀 GOAT Royalty App - Automated Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (use sudo)"
  exit 1
fi

echo "${YELLOW}Step 1: Updating system...${NC}"
apt update && apt upgrade -y

echo "${YELLOW}Step 2: Installing Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "${YELLOW}Step 3: Installing PM2 and Nginx...${NC}"
npm install -g pm2
apt install -y nginx

echo "${YELLOW}Step 4: Creating application directory...${NC}"
mkdir -p /var/www/goat-app
chown -R $USER:$USER /var/www/goat-app

echo "${YELLOW}Step 5: Extracting deployment package...${NC}"
if [ -f "/root/goat-app-deployment-v3-with-gemini.tar.gz" ]; then
    tar -xzf /root/goat-app-deployment-v3-with-gemini.tar.gz -C /var/www/goat-app
    echo "${GREEN}✓ Package extracted${NC}"
else
    echo "Error: Deployment package not found at /root/goat-app-deployment-v3-with-gemini.tar.gz"
    echo "Please upload the package first!"
    exit 1
fi

echo "${YELLOW}Step 6: Installing dependencies...${NC}"
cd /var/www/goat-app
npm install --production

echo "${YELLOW}Step 7: Building application...${NC}"
npm run build

echo "${YELLOW}Step 8: Starting application with PM2...${NC}"
pm2 start npm --name "goat-app" -- start
pm2 save
pm2 startup

echo "${YELLOW}Step 9: Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/goat-app << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/goat-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "${YELLOW}Step 10: Configuring firewall...${NC}"
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

echo ""
echo "${GREEN}=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "==========================================${NC}"
echo ""
echo "Your app is now running at:"
echo "http://$(curl -s ifconfig.me)"
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check app status"
echo "  pm2 logs goat-app   - View logs"
echo "  pm2 restart goat-app - Restart app"
echo ""
echo "🎉 Your GOAT Royalty App is LIVE!"