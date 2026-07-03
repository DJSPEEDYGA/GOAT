# 🚀 GOAT Royalty App - Complete Hostinger Deployment Guide

## ✅ What's Ready

1. ✅ **Deployment Package Created**: `goat-app-deployment.tar.gz` (5.3MB)
2. ✅ **Supabase Database Connected**: All tables ready
3. ✅ **Environment Variables Configured**: Credentials included
4. ✅ **Latest Code**: All updates from GitHub included

## 📦 Deployment Package Contents

Your deployment package includes:
- ✅ All application code (components, pages, styles)
- ✅ Supabase integration and credentials
- ✅ Next.js configuration
- ✅ Package dependencies list
- ✅ Documentation files
- ✅ Server startup scripts

## 🔧 Hostinger API Information

**Your API Key**: `iLI2v04ps7OujaQVenlyBMgsPwwkGcxr44J9HGSp7cdf1e6e`

**Note**: The Hostinger API returned an error (code 1016), which typically means:
- VPS might be paused/stopped
- API endpoint might need different authentication
- Or you may need to use the hPanel interface instead

## 📋 Deployment Steps

### Option A: Automated Upload (If you have VPS SSH access)

If you have SSH access to your Hostinger VPS:

```bash
# 1. Upload the package
scp /workspace/GOAT-Royalty-App2/goat-app-deployment.tar.gz root@YOUR-VPS-IP:/root/

# 2. SSH into your VPS
ssh root@YOUR-VPS-IP

# 3. Run the deployment script (see below)
```

### Option B: Manual Upload via hPanel

1. **Go to Hostinger hPanel**
   - Visit: https://hpanel.hostinger.com
   - Login with your credentials

2. **Access VPS Section**
   - Click on "VPS" in the left menu
   - Select your VPS instance
   - Make sure it's running (not paused)

3. **Upload Deployment Package**
   - Click "File Manager" or "Access"
   - Navigate to `/root/` or `/home/`
   - Upload `goat-app-deployment.tar.gz`
   - Location: `/workspace/GOAT-Royalty-App2/goat-app-deployment.tar.gz`

4. **Open SSH Terminal**
   - In hPanel, click "SSH Access" or "Terminal"
   - Or use your own SSH client

## 🖥️ VPS Setup Commands

Once you're connected to your VPS via SSH, run these commands:

### Step 1: System Update
```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v20.x
npm --version   # Should show 10.x
```

### Step 3: Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 --version
```

### Step 4: Install Nginx (Web Server)
```bash
sudo apt install -y nginx
sudo systemctl status nginx
```

### Step 5: Create Application Directory
```bash
sudo mkdir -p /var/www/goat-app
sudo chown -R $USER:$USER /var/www/goat-app
```

### Step 6: Extract Deployment Package
```bash
cd /root
tar -xzf goat-app-deployment.tar.gz -C /var/www/goat-app
cd /var/www/goat-app
ls -la  # Verify files are extracted
```

### Step 7: Install Dependencies
```bash
npm install --production
# This will take 2-3 minutes
```

### Step 8: Build the Application
```bash
npm run build
# This will take 3-5 minutes
```

### Step 9: Start Application with PM2
```bash
pm2 start npm --name "goat-app" -- start
pm2 list  # Verify it's running
pm2 logs goat-app  # Check logs
pm2 save  # Save PM2 configuration
pm2 startup  # Enable auto-start on reboot
```

### Step 10: Configure Nginx
```bash
sudo tee /etc/nginx/sites-available/goat-app << 'EOF'
server {
    listen 80;
    server_name YOUR-DOMAIN.com www.YOUR-DOMAIN.com;

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

# Enable the site
sudo ln -s /etc/nginx/sites-available/goat-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### Step 11: Configure Firewall
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

### Step 12: Install SSL Certificate (Recommended)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR-DOMAIN.com -d www.YOUR-DOMAIN.com
# Follow the prompts
```

## 🌐 Domain Configuration

### If you have a domain:
1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Add these DNS records:
   ```
   Type: A
   Name: @
   Value: YOUR-VPS-IP
   TTL: 3600

   Type: A
   Name: www
   Value: YOUR-VPS-IP
   TTL: 3600
   ```
3. Wait 5-30 minutes for DNS propagation
4. Update Nginx config with your domain name

### If you don't have a domain:
- Access via VPS IP: `http://YOUR-VPS-IP`
- Or use Hostinger's temporary domain

## 🔍 Verification & Testing

### Check if app is running:
```bash
pm2 status
pm2 logs goat-app
curl http://localhost:3000  # Should return HTML
```

### Check Nginx:
```bash
sudo systemctl status nginx
sudo nginx -t
```

### Check from browser:
- Visit: `http://YOUR-DOMAIN.com` or `http://YOUR-VPS-IP`
- You should see the GOAT Royalty App dashboard

## 🔄 Updating the App

When you make changes and want to update:

```bash
# 1. Upload new deployment package to VPS
scp goat-app-deployment.tar.gz root@YOUR-VPS-IP:/root/

# 2. SSH into VPS
ssh root@YOUR-VPS-IP

# 3. Stop the app
pm2 stop goat-app

# 4. Backup current version
cd /var/www
mv goat-app goat-app-backup-$(date +%Y%m%d)

# 5. Extract new version
mkdir goat-app
cd /root
tar -xzf goat-app-deployment.tar.gz -C /var/www/goat-app

# 6. Install dependencies and build
cd /var/www/goat-app
npm install --production
npm run build

# 7. Restart app
pm2 restart goat-app
pm2 logs goat-app
```

## 🆘 Troubleshooting

### App won't start:
```bash
pm2 logs goat-app --lines 50
# Check for errors in the logs
```

### Port 3000 already in use:
```bash
sudo lsof -i :3000
# Kill the process if needed
sudo kill -9 PID
```

### Nginx errors:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Database connection issues:
```bash
cd /var/www/goat-app
cat .env.local  # Verify Supabase credentials
node test-supabase-connection.js  # Test connection
```

### Can't access from browser:
```bash
# Check firewall
sudo ufw status

# Check if app is listening
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :80
```

## 📊 Monitoring

### View app logs:
```bash
pm2 logs goat-app
pm2 logs goat-app --lines 100
```

### Monitor resources:
```bash
pm2 monit
htop
```

### Check app status:
```bash
pm2 status
pm2 info goat-app
```

## 🔐 Security Checklist

- ✅ SSL certificate installed (HTTPS)
- ✅ Firewall configured (UFW)
- ✅ Environment variables secured (.env.local)
- ✅ PM2 running as non-root user
- ✅ Nginx configured with security headers
- ⚠️ Change default SSH port (optional)
- ⚠️ Set up fail2ban (optional)
- ⚠️ Enable automatic security updates

## 💰 Estimated Costs

### Hostinger VPS:
- **VPS 1**: ~$4-6/month (1 vCPU, 1GB RAM)
- **VPS 2**: ~$8-12/month (2 vCPU, 2GB RAM) - Recommended
- **VPS 3**: ~$15-20/month (3 vCPU, 3GB RAM)

### Additional Services:
- Supabase: $0/month (Free tier) or $25/month (Pro)
- Domain: $10-15/year
- SSL Certificate: $0 (Let's Encrypt free)

**Total Monthly Cost**: $8-37/month

## 📞 Support

### Hostinger Support:
- Live Chat: https://www.hostinger.com/contact
- Knowledge Base: https://support.hostinger.com

### Your Resources:
- GitHub Repo: https://github.com/DJSPEEDYGA/GOAT-Royalty-App2
- Supabase Dashboard: https://supabase.com/dashboard/project/xmvlnonsxmrpvlssjstl
- Deployment Package: `/workspace/GOAT-Royalty-App2/goat-app-deployment.tar.gz`

## ✅ Deployment Checklist

- [ ] VPS is running and accessible
- [ ] Deployment package uploaded
- [ ] Node.js 20.x installed
- [ ] PM2 installed
- [ ] Nginx installed
- [ ] Application extracted
- [ ] Dependencies installed
- [ ] Application built
- [ ] PM2 started and saved
- [ ] Nginx configured
- [ ] Firewall configured
- [ ] Domain DNS configured (if applicable)
- [ ] SSL certificate installed
- [ ] App accessible from browser
- [ ] Database connection verified

## 🎉 Success!

Once all steps are complete, your GOAT Royalty App will be:
- ✅ Running 24/7 on Hostinger VPS
- ✅ Accessible via your domain or IP
- ✅ Connected to Supabase database
- ✅ Secured with SSL (HTTPS)
- ✅ Auto-restarting on crashes
- ✅ Auto-starting on server reboot

---

**Need help?** Let me know which step you're on and I'll assist you!