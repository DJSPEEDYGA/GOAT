# 🚀 VPS Deployment Guide - Ubuntu 24.04.3 LTS

## Server Information
- **IP Address:** 93.127.214.171
- **OS:** Ubuntu 24.04.3 LTS
- **Architecture:** x86_64
- **Kernel:** 6.8.0-87-generic

## 📋 Prerequisites

Before deploying, ensure you have:
- SSH access to the VPS (root@93.127.214.171)
- Domain name (optional but recommended)
- MongoDB connection string (local or cloud)
- API keys for AI services (OpenAI, Gemini, etc.)
- Hostinger API token

## 🛠️ Step 1: Initial Server Setup

### Connect to VPS
```bash
ssh root@93.127.214.171
```

### Update System
```bash
apt update && apt upgrade -y
```

### Install Essential Packages
```bash
apt install -y curl wget git build-essential nginx certbot python3-certbot-nginx
```

## 📦 Step 2: Install Node.js

### Install Node.js 20.x (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### Verify Installation
```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

## 🗄️ Step 3: Install MongoDB

### Option A: Local MongoDB Installation

```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
apt update
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Verify MongoDB is running
systemctl status mongod
```

### Option B: Use MongoDB Atlas (Cloud)
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string
- Whitelist VPS IP: 93.127.214.171

## 📥 Step 4: Clone and Setup Application

### Create Application Directory
```bash
mkdir -p /var/www
cd /var/www
```

### Clone Repository
```bash
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git
cd GOAT-Royalty-App
```

### Install Dependencies
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd client
npm install
cd ..
```

## ⚙️ Step 5: Configure Environment Variables

### Create Production .env File
```bash
nano .env
```

### Add Configuration
```bash
# Server Configuration
NODE_ENV=production
PORT=5001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/royalty-app
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/royalty-app

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-change-this
JWT_EXPIRE=30d

# CORS Configuration
CLIENT_URL=https://yourdomain.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/GOAT-Royalty-App/uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-change-this

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FROM_EMAIL=noreply@goatroyalty.com
FROM_NAME=GOAT Royalty App

# AI Provider API Keys
OPENAI_API_KEY=sk-your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
COHERE_API_KEY=your-cohere-api-key

# Agent Settings
AGENT_MODEL=gpt-4-turbo-preview
AGENT_TEMPERATURE=0.7
AGENT_MAX_ITERATIONS=10

# Hostinger API Configuration
HOSTINGER_API_TOKEN=u4WIezhO6K1Zv0ZXor4VMDHZNFzpKb3h0iNgdUpda243813a

# Logging
LOG_LEVEL=info
LOG_FILE=/var/www/GOAT-Royalty-App/logs/app.log
```

### Set Proper Permissions
```bash
chmod 600 .env
```

## 🔧 Step 6: Install PM2 Process Manager

### Install PM2 Globally
```bash
npm install -g pm2
```

### Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

### Add Configuration
```javascript
module.exports = {
  apps: [
    {
      name: 'goat-backend',
      script: 'src/server.js',
      cwd: '/var/www/GOAT-Royalty-App',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: '/var/www/GOAT-Royalty-App/logs/backend-error.log',
      out_file: '/var/www/GOAT-Royalty-App/logs/backend-out.log',
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
      cwd: '/var/www/GOAT-Royalty-App/client',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/www/GOAT-Royalty-App/logs/frontend-error.log',
      out_file: '/var/www/GOAT-Royalty-App/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
```

### Build Frontend
```bash
cd client
npm run build
cd ..
```

### Start Applications with PM2
```bash
# Create logs directory
mkdir -p logs

# Start applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Follow the command output instructions
```

### Verify Applications are Running
```bash
pm2 status
pm2 logs
```

## 🌐 Step 7: Configure Nginx

### Create Nginx Configuration
```bash
nano /etc/nginx/sites-available/goat-royalty-app
```

### Add Configuration
```nginx
# Backend API Server
upstream backend {
    server 127.0.0.1:5001;
}

# Frontend Server
upstream frontend {
    server 127.0.0.1:3000;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Logging
    access_log /var/log/nginx/goat-access.log;
    error_log /var/log/nginx/goat-error.log;

    # API Routes
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Frontend Routes
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static Files
    location /videos {
        alias /var/www/GOAT-Royalty-App/public/videos;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # File Upload Size
    client_max_body_size 100M;
}
```

### Enable Site
```bash
ln -s /etc/nginx/sites-available/goat-royalty-app /etc/nginx/sites-enabled/
```

### Test Nginx Configuration
```bash
nginx -t
```

### Restart Nginx
```bash
systemctl restart nginx
```

## 🔒 Step 8: Setup SSL Certificate

### Install SSL Certificate with Certbot
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Follow Prompts
- Enter email address
- Agree to terms
- Choose redirect option (recommended)

### Verify SSL
```bash
certbot certificates
```

### Setup Auto-Renewal
```bash
# Test renewal
certbot renew --dry-run

# Renewal is automatic via systemd timer
systemctl status certbot.timer
```

## 🔥 Step 9: Configure Firewall

### Setup UFW Firewall
```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

## 📊 Step 10: Monitoring and Maintenance

### View Application Logs
```bash
# PM2 logs
pm2 logs

# Backend logs
pm2 logs goat-backend

# Frontend logs
pm2 logs goat-frontend

# Nginx logs
tail -f /var/log/nginx/goat-access.log
tail -f /var/log/nginx/goat-error.log
```

### Monitor System Resources
```bash
# CPU and Memory
htop

# Disk usage
df -h

# PM2 monitoring
pm2 monit
```

### Restart Applications
```bash
# Restart all
pm2 restart all

# Restart specific app
pm2 restart goat-backend
pm2 restart goat-frontend

# Restart Nginx
systemctl restart nginx
```

## 🔄 Step 11: Deployment Updates

### Create Deployment Script
```bash
nano /var/www/GOAT-Royalty-App/deploy.sh
```

### Add Script Content
```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to app directory
cd /var/www/GOAT-Royalty-App

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install --production

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install --production

# Build frontend
echo "🏗️ Building frontend..."
npm run build
cd ..

# Restart applications
echo "🔄 Restarting applications..."
pm2 restart all

echo "✅ Deployment complete!"
```

### Make Script Executable
```bash
chmod +x /var/www/GOAT-Royalty-App/deploy.sh
```

### Run Deployment
```bash
/var/www/GOAT-Royalty-App/deploy.sh
```

## 🧪 Step 12: Testing

### Test Backend API
```bash
curl https://yourdomain.com/api/health
```

### Test Frontend
```bash
curl https://yourdomain.com
```

### Test Hostinger Integration
```bash
curl -X GET https://yourdomain.com/api/hostinger/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🆘 Troubleshooting

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs

# Check if ports are in use
netstat -tulpn | grep :5001
netstat -tulpn | grep :3000

# Restart PM2
pm2 kill
pm2 start ecosystem.config.js
```

### Nginx Errors
```bash
# Check Nginx configuration
nginx -t

# Check Nginx logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### Database Connection Issues
```bash
# Check MongoDB status
systemctl status mongod

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
systemctl restart mongod
```

### SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Renew certificate
certbot renew

# Check Nginx SSL configuration
nginx -t
```

## 📈 Performance Optimization

### Enable Gzip Compression
Add to Nginx configuration:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### Enable Caching
Add to Nginx configuration:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Optimize MongoDB
```bash
# Enable MongoDB authentication
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["root"]
})
```

## 🔐 Security Checklist

- [x] Firewall configured (UFW)
- [x] SSL certificate installed
- [x] Strong passwords for all services
- [x] MongoDB authentication enabled
- [x] Environment variables secured
- [x] Regular security updates
- [x] Fail2ban installed (optional)
- [x] SSH key authentication (recommended)

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## 🎉 Success!

Your GOAT Royalty App is now deployed and running on your VPS!

Access your application at:
- **Frontend:** https://yourdomain.com
- **Backend API:** https://yourdomain.com/api
- **Health Check:** https://yourdomain.com/api/health

---

**Last Updated:** December 2, 2024
**Server IP:** 93.127.214.171
**Status:** Production Ready ✅