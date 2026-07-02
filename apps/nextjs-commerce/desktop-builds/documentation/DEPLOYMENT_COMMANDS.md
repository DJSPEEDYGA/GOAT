# 🚀 GOAT Royalty App - Complete Deployment Commands

## Quick Deployment Instructions

### Step 1: Connect to Your VPS
```bash
ssh root@93.127.214.171
```

### Step 2: Download and Run Deployment Script
```bash
# Download the deployment script
wget https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/feature/complete-app-with-integrations/deploy-complete.sh

# Make it executable
chmod +x deploy-complete.sh

# Run the complete deployment
./deploy-complete.sh
```

### Step 3: Test Everything
```bash
# Download the testing script
wget https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/feature/complete-app-with-integrations/test-complete.sh

# Make it executable
chmod +x test-complete.sh

# Run comprehensive tests
./test-complete.sh
```

### Step 4: Access Your Application
- **Frontend:** https://93.127.214.171
- **Backend API:** https://93.127.214.171/api/health

---

## 📋 What the Deployment Script Does

### System Setup
- ✅ Updates Ubuntu packages
- ✅ Installs Node.js 20.x
- ✅ Installs MongoDB 7.0
- ✅ Installs PM2 process manager
- ✅ Installs Nginx reverse proxy
- ✅ Installs Certbot for SSL

### Application Setup
- ✅ Clones latest code from GitHub
- ✅ Installs all dependencies
- ✅ Builds Next.js frontend
- ✅ Configures environment variables
- ✅ Sets up MongoDB database
- ✅ Creates PM2 ecosystem configuration

### Security & Performance
- ✅ Configures Nginx reverse proxy
- ✅ Sets up SSL certificate
- ✅ Configures firewall (UFW)
- ✅ Sets up security headers
- ✅ Optimizes for production

### Monitoring
- ✅ Creates monitoring scripts
- ✅ Sets up log rotation
- ✅ Configures process auto-restart

---

## 🧪 Testing Features

The testing script checks:

### Core Functionality (13 tests)
- Frontend accessibility
- Backend API responsiveness
- Database connectivity
- Process management

### Features (20+ tests)
- Authentication system
- Artist management
- Royalty tracking
- Payment processing
- Reporting system
- AI agent functionality
- Hostinger integration
- AI chat system
- Video gallery

### System Health (10+ tests)
- Memory usage
- Disk space
- CPU load
- SSL certificates
- External API connectivity

---

## 📊 Monitoring Commands

### Check Application Status
```bash
goat-monitor
```

### Restart Application
```bash
goat-restart
```

### View Logs
```bash
pm2 logs          # All logs
pm2 logs goat-backend  # Backend logs
pm2 logs goat-frontend # Frontend logs
```

### PM2 Management
```bash
pm2 status         # Show process status
pm2 restart all   # Restart all processes
pm2 reload all    # Reload without downtime
```

---

## 🔧 Troubleshooting

### If Frontend Not Working
```bash
# Check PM2 status
pm2 status

# Restart frontend
pm2 restart goat-frontend

# Check logs
pm2 logs goat-frontend
```

### If Backend Not Working
```bash
# Check backend status
curl http://localhost:5001/api/health

# Restart backend
pm2 restart goat-backend

# Check logs
pm2 logs goat-backend
```

### If Database Issues
```bash
# Check MongoDB status
systemctl status mongod

# Restart MongoDB
systemctl restart mongod

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

### If Nginx Issues
```bash
# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

---

## 🔄 Manual Deployment (Alternative)

If the script fails, you can deploy manually:

### 1. Setup Environment
```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs mongodb-org nginx certbot python3-certbot-nginx
npm install -g pm2
```

### 2. Clone and Build
```bash
cd /var/www
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git
cd GOAT-Royalty-App
git checkout feature/complete-app-with-integrations
npm install
cd client && npm install && npm run build && cd ..
```

### 3. Configure and Start
```bash
# Configure .env file
nano .env

# Start services
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 📱 After Deployment

### Test in Browser
1. Visit: https://93.127.214.171
2. Create an account
3. Test all features:
   - Dashboard
   - Artist management
   - Royalty tracking
   - AI chat
   - Video gallery
   - Hostinger integration

### Configure Additional Features
1. **OpenAI API:** Add your key to `.env`
2. **Domain:** Point your domain to 93.127.214.171
3. **Email:** Configure SMTP settings
4. **Analytics:** Add Google Analytics

---

## 🎯 Success Metrics

✅ **Frontend loads** - https://93.127.214.171  
✅ **Backend API works** - https://93.127.214.171/api/health  
✅ **All tests pass** - `./test-complete.sh`  
✅ **SSL certificate valid** - HTTPS works  
✅ **Videos load** - 15 brand videos accessible  
✅ **AI chat works** - GPT-4o integration functional  
✅ **Hostinger API works** - Hosting automation ready  

---

## 🆘 Support

If you encounter issues:

1. **Check logs:** `goat-monitor`
2. **Run tests:** `./test-complete.sh`
3. **Restart services:** `goat-restart`
4. **Review documentation:** Check guides in repository
5. **GitHub Issues:** https://github.com/DJSPEEDYGA/GOAT-Royalty-App/issues

---

**Ready to deploy! 🚀**

Run these commands on your VPS (93.127.214.171):

```bash
# Step 1: Deploy
wget https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/feature/complete-app-with-integrations/deploy-complete.sh
chmod +x deploy-complete.sh
./deploy-complete.sh

# Step 2: Test
wget https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/feature/complete-app-with-integrations/test-complete.sh
chmod +x test-complete.sh
./test-complete.sh
```

**Your GOAT Royalty App will be live at: https://93.127.214.171** 🎉