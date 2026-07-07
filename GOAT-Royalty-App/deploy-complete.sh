#!/bin/bash

# GOAT Royalty App - Complete Deployment Script
# This script sets up the entire application on your VPS

echo "🚀 Starting GOAT Royalty App Complete Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

# Set variables
APP_DIR="/var/www/GOAT-Royalty-App"
BACKUP_DIR="/var/www/backups"
LOG_FILE="/var/log/goat-deployment.log"

# Create log file
touch $LOG_FILE

print_step "1. System Update"
print_status "Updating system packages..."
apt update && apt upgrade -y >> $LOG_FILE 2>&1

print_step "2. Install Dependencies"
print_status "Installing Node.js, MongoDB, PM2, Nginx..."

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >> $LOG_FILE 2>&1
apt-get install -y nodejs >> $LOG_FILE 2>&1

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add - >> $LOG_FILE 2>&1
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list >> $LOG_FILE 2>&1
apt-get update >> $LOG_FILE 2>&1
apt-get install -y mongodb-org >> $LOG_FILE 2>&1

# Install PM2 globally
npm install -g pm2 >> $LOG_FILE 2>&1

# Install Nginx
apt-get install -y nginx >> $LOG_FILE 2>&1

# Install Certbot for SSL
apt-get install -y certbot python3-certbot-nginx >> $LOG_FILE 2>&1

print_step "3. Setup Application Directory"
print_status "Creating application directories..."

# Create directories
mkdir -p $APP_DIR
mkdir -p $BACKUP_DIR
mkdir -p /var/log/goat-app

print_step "4. Clone Repository"
print_status "Cloning GOAT Royalty App from GitHub..."

cd $APP_DIR
if [ -d ".git" ]; then
    print_status "Repository exists, pulling latest changes..."
    git pull origin main >> $LOG_FILE 2>&1
else
    print_status "Cloning fresh repository..."
    git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git . >> $LOG_FILE 2>&1
fi

# Switch to the feature branch with all integrations
git checkout feature/complete-app-with-integrations >> $LOG_FILE 2>&1

print_step "5. Install Dependencies"
print_status "Installing application dependencies..."

# Install backend dependencies
npm install >> $LOG_FILE 2>&1

# Install frontend dependencies
cd client
npm install >> $LOG_FILE 2>&1
cd ..

print_step "6. Build Frontend"
print_status "Building Next.js frontend..."

cd client
npm run build >> $LOG_FILE 2>&1
cd ..

print_step "7. Configure Environment"
print_status "Setting up environment variables..."

# Create .env file from template
cat > .env << EOF
# Server Configuration
NODE_ENV=production
PORT=5001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/royalty-app

# JWT Configuration
JWT_SECRET=goat-royalty-super-secret-jwt-key-production-$(date +%s)
JWT_EXPIRE=30d

# CORS Configuration
CLIENT_URL=http://93.127.214.171:3002

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=$APP_DIR/uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=goat-royalty-session-secret-production-$(date +%s)

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/goat-app/app.log

# AI Provider API Keys
OPENAI_API_KEY=sk-proj-wxcA
GEMINI_API_KEY=your-gemini-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
COHERE_API_KEY=your-cohere-api-key

# Hostinger API Configuration
HOSTINGER_API_TOKEN=u4WIezhO6K1Zv0ZXor4VMDHZNFzpKb3h0iNgdUpda243813a

# Agent Settings
AGENT_MODEL=gpt-4o
AGENT_TEMPERATURE=0.7
AGENT_MAX_ITERATIONS=10
EOF

# Set proper permissions
chmod 600 .env

print_step "8. Setup MongoDB"
print_status "Starting and configuring MongoDB..."

systemctl start mongod >> $LOG_FILE 2>&1
systemctl enable mongod >> $LOG_FILE 2>&1

# Wait for MongoDB to start
sleep 5

# Create database and initial user
mongo << EOF
use royalty-app
db.createUser({
  user: "goatapp",
  pwd: "goatapp123",
  roles: ["readWrite"]
})
EOF >> $LOG_FILE 2>&1

print_step "9. Create PM2 Ecosystem"
print_status "Setting up PM2 process manager..."

cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'goat-backend',
      script: 'src/server.js',
      cwd: '$APP_DIR',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: '/var/log/goat-app/backend-error.log',
      out_file: '/var/log/goat-app/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'goat-frontend',
      script: 'npm',
      args: 'start',
      cwd: '$APP_DIR/client',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/var/log/goat-app/frontend-error.log',
      out_file: '/var/log/goat-app/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
EOF

print_step "10. Start Applications"
print_status "Starting GOAT Royalty App with PM2..."

# Stop existing processes if running
pm2 delete all >> $LOG_FILE 2>&1

# Start applications
pm2 start ecosystem.config.js >> $LOG_FILE 2>&1

# Save PM2 configuration
pm2 save >> $LOG_FILE 2>&1

# Setup PM2 startup
pm2 startup systemd >> $LOG_FILE 2>&1
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root >> $LOG_FILE 2>&1

print_step "11. Configure Nginx"
print_status "Setting up Nginx reverse proxy..."

cat > /etc/nginx/sites-available/goat-royalty-app << EOF
# Frontend Server
upstream frontend {
    server 127.0.0.1:3002;
}

# Backend API Server
upstream backend {
    server 127.0.0.1:5001;
}

# HTTP Server (redirect to HTTPS)
server {
    listen 80;
    server_name 93.127.214.171;
    
    # Redirect all HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name 93.127.214.171;

    # SSL Configuration (to be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/93.127.214.171/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/93.127.214.171/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Logging
    access_log /var/log/nginx/goat-access.log;
    error_log /var/log/nginx/goat-error.log;

    # Frontend Routes
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # API Routes
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Static Files
    location /videos {
        alias $APP_DIR/public/videos;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # File Upload Size
    client_max_body_size 100M;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/goat-royalty-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t >> $LOG_FILE 2>&1

if [ $? -eq 0 ]; then
    print_status "Nginx configuration valid"
    systemctl restart nginx >> $LOG_FILE 2>&1
else
    print_error "Nginx configuration error"
    tail -20 $LOG_FILE
    exit 1
fi

print_step "12. Setup Firewall"
print_status "Configuring UFW firewall..."

# Reset firewall
ufw --force reset >> $LOG_FILE 2>&1

# Allow SSH
ufw allow 22/tcp >> $LOG_FILE 2>&1

# Allow HTTP
ufw allow 80/tcp >> $LOG_FILE 2>&1

# Allow HTTPS
ufw allow 443/tcp >> $LOG_FILE 2>&1

# Enable firewall
ufw --force enable >> $LOG_FILE 2>&1

print_step "13. Create SSL Certificate"
print_status "Installing SSL certificate with Let's Encrypt..."

# Install SSL certificate (non-interactive)
certbot --nginx --non-interactive --agree-tos --email admin@goatroyaltyapp.com -d 93.127.214.171 >> $LOG_FILE 2>&1

print_step "14. Testing Application"
print_status "Testing application endpoints..."

# Wait for applications to start
sleep 10

# Test frontend
if curl -f -s http://localhost:3002 > /dev/null; then
    print_status "✅ Frontend is running"
else
    print_warning "⚠️ Frontend might not be ready yet"
fi

# Test backend
if curl -f -s http://localhost:5001/api/health > /dev/null; then
    print_status "✅ Backend is running"
else
    print_warning "⚠️ Backend might not be ready yet"
fi

print_step "15. Final Setup"
print_status "Creating monitoring scripts..."

# Create monitoring script
cat > /usr/local/bin/goat-monitor.sh << 'EOF'
#!/bin/bash

# GOAT App Monitoring Script

echo "=== GOAT Royalty App Status ==="
echo "Date: $(date)"
echo

echo "=== PM2 Status ==="
pm2 status
echo

echo "=== Application URLs ==="
echo "Frontend: http://93.127.214.171"
echo "Frontend (HTTPS): https://93.127.214.171"
echo "Backend API: http://93.127.214.171/api/health"
echo "Backend API (HTTPS): https://93.127.214.171/api/health"
echo

echo "=== System Resources ==="
echo "Memory Usage: $(free -h | grep Mem)"
echo "Disk Usage: $(df -h /)"
echo "CPU Load: $(uptime)"
echo

echo "=== Recent Logs ==="
echo "Backend Errors:"
tail -10 /var/log/goat-app/backend-error.log 2>/dev/null || echo "No backend errors"
echo
echo "Frontend Errors:"
tail -10 /var/log/goat-app/frontend-error.log 2>/dev/null || echo "No frontend errors"
EOF

chmod +x /usr/local/bin/goat-monitor.sh

# Create restart script
cat > /usr/local/bin/goat-restart.sh << 'EOF'
#!/bin/bash

echo "🔄 Restarting GOAT Royalty App..."

pm2 restart all

echo "✅ App restarted"
echo "📊 Status:"
pm2 status
EOF

chmod +x /usr/local/bin/goat-restart.sh

print_step "16. Deployment Complete!"
print_status "🎉 GOAT Royalty App has been successfully deployed!"

echo ""
echo -e "${GREEN}=== DEPLOYMENT SUMMARY ===${NC}"
echo "📱 Frontend URL: http://93.127.214.171"
echo "🔒 Frontend URL (HTTPS): https://93.127.214.171"
echo "🔧 Backend API: http://93.127.214.171/api/health"
echo "🔒 Backend API (HTTPS): https://93.127.214.171/api/health"
echo ""
echo "📊 Monitor app: goat-monitor"
echo "🔄 Restart app: goat-restart"
echo ""
echo "📁 App Directory: $APP_DIR"
echo "📝 Log File: $LOG_FILE"
echo ""

print_status "Testing main endpoints..."
echo ""

# Test final endpoints
echo "🧪 Testing Frontend..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 | grep -q "200"; then
    print_status "✅ Frontend responding (HTTP 200)"
else
    print_warning "⚠️ Frontend not responding"
fi

echo "🧪 Testing Backend..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/health | grep -q "200"; then
    print_status "✅ Backend responding (HTTP 200)"
else
    print_warning "⚠️ Backend not responding"
fi

echo ""
echo -e "${GREEN}🚀 Your GOAT Royalty App is LIVE!${NC}"
echo -e "${BLUE}📱 Visit: https://93.127.214.171${NC}"
echo ""
echo -e "${YELLOW}📚 Next Steps:${NC}"
echo "1. Visit your app at https://93.127.214.171"
echo "2. Test all features including AI chat and videos"
echo "3. Configure your OpenAI API key if needed"
echo "4. Set up your domain name if you have one"
echo ""

print_status "🎉 Deployment completed successfully!"