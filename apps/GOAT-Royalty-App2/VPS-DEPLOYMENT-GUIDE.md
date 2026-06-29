# 🚀 VPS Deployment Guide - GOAT Royalty App v3

## ✅ VPS Status: RENEWED AND READY!

Your Hostinger VPS is now active. Let's deploy your app with:
- ✅ Authentication system
- ✅ Real database integration
- ✅ Google Gemini AI Copilot
- ✅ All 12 functional tabs

---

## 📋 Pre-Deployment Checklist

### What You Need:
- [x] VPS renewed ✅
- [x] Deployment package ready (`goat-app-deployment-v3-with-gemini.tar.gz`)
- [x] Supabase connected
- [x] Google AI API key configured
- [ ] VPS IP address
- [ ] SSH access credentials

---

## 🎯 Deployment Steps

### Step 1: Get Your VPS Information

Go to Hostinger hPanel:
1. Visit: https://hpanel.hostinger.com
2. Click on "VPS" section
3. Note down:
   - **VPS IP Address**: (e.g., 123.456.789.012)
   - **SSH Username**: (usually "root")
   - **SSH Password**: (check your email or hPanel)

### Step 2: Upload Deployment Package

**Option A - Using Hostinger File Manager:**
1. In hPanel, click "File Manager"
2. Navigate to `/root/` directory
3. Click "Upload"
4. Upload `goat-app-deployment-v3-with-gemini.tar.gz`
5. Wait for upload to complete

**Option B - Using SCP (if you have the file locally):**
```bash
scp goat-app-deployment-v3-with-gemini.tar.gz root@YOUR-VPS-IP:/root/
```

### Step 3: SSH into Your VPS

**Option A - Using hPanel Terminal:**
1. In hPanel, click "SSH Access" or "Terminal"
2. Browser-based terminal will open

**Option B - Using Your Own SSH Client:**
```bash
ssh root@YOUR-VPS-IP
# Enter password when prompted
```

### Step 4: Run Deployment Commands

Copy and paste these commands one by one:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Verify Node.js installation
node --version  # Should show v20.x
npm --version   # Should show 10.x

# 4. Install PM2 (Process Manager)
sudo npm install -g pm2

# 5. Install Nginx (Web Server)
sudo apt install -y nginx

# 6. Create application directory
sudo mkdir -p /var/www/goat-app
sudo chown -R $USER:$USER /var/www/goat-app

# 7. Extract deployment package
cd /root
tar -xzf goat-app-deployment-v3-with-gemini.tar.gz -C /var/www/goat-app

# 8. Navigate to app directory
cd /var/www/goat-app

# 9. Install dependencies (this takes 2-3 minutes)
npm install --production

# 10. Build the application (this takes 3-5 minutes)
npm run build

# 11. Start application with PM2
pm2 start npm --name "goat-app" -- start

# 12. Save PM2 configuration
pm2 save

# 13. Enable PM2 startup on boot
pm2 startup
# Copy and run the command it outputs

# 14. Check if app is running
pm2 status
pm2 logs goat-app --lines 20
```

### Step 5: Configure Nginx

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/goat-app << 'EOF'
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

# Enable the site
sudo ln -s /etc/nginx/sites-available/goat-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: Configure Firewall

```bash
# Allow Nginx traffic
sudo ufw allow 'Nginx Full'

# Allow SSH (important!)
sudo ufw allow OpenSSH

# Enable firewall
sudo ufw --force enable

# Check firewall status
sudo ufw status
```

### Step 7: Test Your App!

Open your browser and go to:
```
http://YOUR-VPS-IP
```

You should see the GOAT Royalty App login page!

---

## ✅ Verification Checklist

After deployment, verify:
- [ ] App loads at `http://YOUR-VPS-IP`
- [ ] Login page appears
- [ ] Can create account
- [ ] Can log in
- [ ] Dashboard shows (may be empty - that's OK!)
- [ ] All 12 tabs are visible
- [ ] Gemini AI tab works
- [ ] No errors in browser console

---

## 🔍 Troubleshooting

### App Not Loading?

**Check if app is running:**
```bash
pm2 status
pm2 logs goat-app --lines 50
```

**Check if port 3000 is listening:**
```bash
sudo netstat -tulpn | grep :3000
```

**Check Nginx:**
```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Can't Access from Browser?

**Check firewall:**
```bash
sudo ufw status
```

**Check if Nginx is running:**
```bash
sudo systemctl status nginx
```

**Try accessing locally first:**
```bash
curl http://localhost:3000
```

### Database Connection Issues?

**Verify environment variables:**
```bash
cd /var/www/goat-app
cat .env.local
```

Should show:
- Supabase URL
- Supabase Anon Key
- Google AI API Key

### PM2 Issues?

**Restart app:**
```bash
pm2 restart goat-app
```

**Delete and recreate:**
```bash
pm2 delete goat-app
cd /var/www/goat-app
pm2 start npm --name "goat-app" -- start
pm2 save
```

---

## 🔐 Optional: Add SSL Certificate (HTTPS)

If you have a domain name:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts
# Certbot will automatically configure Nginx for HTTPS
```

---

## 📊 Monitoring

### View App Logs:
```bash
pm2 logs goat-app
pm2 logs goat-app --lines 100
```

### Monitor Resources:
```bash
pm2 monit
```

### Check System Resources:
```bash
htop  # Install with: sudo apt install htop
```

---

## 🔄 Updating Your App

When you make changes:

```bash
# 1. Stop the app
pm2 stop goat-app

# 2. Backup current version
cd /var/www
mv goat-app goat-app-backup-$(date +%Y%m%d)

# 3. Upload new package to /root/

# 4. Extract new version
mkdir goat-app
tar -xzf /root/goat-app-deployment-v3-with-gemini.tar.gz -C /var/www/goat-app

# 5. Install and build
cd /var/www/goat-app
npm install --production
npm run build

# 6. Restart app
pm2 restart goat-app
pm2 logs goat-app
```

---

## 💡 Quick Commands Reference

```bash
# Start app
pm2 start goat-app

# Stop app
pm2 stop goat-app

# Restart app
pm2 restart goat-app

# View logs
pm2 logs goat-app

# View status
pm2 status

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🎉 Success!

Once deployed, your app will be:
- ✅ Running 24/7
- ✅ Auto-restarting on crashes
- ✅ Auto-starting on server reboot
- ✅ Accessible from anywhere
- ✅ Ready for real users!

---

## 📞 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Review PM2 logs: `pm2 logs goat-app`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Let me know what error you're seeing!

---

**Estimated Time**: 20-30 minutes
**Difficulty**: Medium
**Result**: Production-ready app! 🚀