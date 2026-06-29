# 🚀 Deploy GOAT Royalty App to 93.127.214.171

## ✅ VPS Information

- **IP**: 93.127.214.171
- **Username**: root
- **Location**: Lithuania - Vilnius
- **Plan**: KVM 2 (2 CPU, 8GB RAM, 100GB disk)
- **OS**: Ubuntu 24.04 with Ollama

## 📦 Step-by-Step Deployment

### Step 1: Wait for VPS to be Ready

Check in hPanel until status changes from "restoring" to "running" (usually 5-10 minutes)

### Step 2: Get Root Password

In hPanel, click "Change" next to "Root password" to set/view your password

### Step 3: Upload Deployment Files

**Option A - Using hPanel File Manager:**
1. Go to https://hpanel.hostinger.com
2. Click your VPS (srv832760.hstgr.cloud)
3. Click "File Manager"
4. Navigate to `/root/`
5. Upload these files:
   - `goat-app-deployment-v3-with-gemini.tar.gz`
   - `auto-deploy.sh`

**Option B - Using SCP:**
```bash
scp goat-app-deployment-v3-with-gemini.tar.gz root@93.127.214.171:/root/
scp auto-deploy.sh root@93.127.214.171:/root/
```

### Step 4: SSH into VPS

```bash
ssh root@93.127.214.171
# Enter your root password when prompted
```

### Step 5: Run Automated Deployment

```bash
cd /root && chmod +x auto-deploy.sh && ./auto-deploy.sh
```

This will take 15-20 minutes and install everything automatically!

### Step 6: Access Your App

Once deployment completes, open your browser:

```
http://93.127.214.171
```

You should see the GOAT Royalty App login page!

## 🎯 What You'll Get

- ✅ App running at http://93.127.214.171
- ✅ User authentication (sign up/login)
- ✅ Real database (Supabase)
- ✅ Google Gemini AI Copilot
- ✅ All 12 tabs functional
- ✅ Running 24/7
- ✅ Auto-restart on crashes

## 🔧 Useful Commands

After deployment:

```bash
# Check app status
pm2 status

# View logs
pm2 logs goat-app

# Restart app
pm2 restart goat-app

# Stop app
pm2 stop goat-app

# Check Nginx
sudo systemctl status nginx
```

## 🆘 Troubleshooting

If something goes wrong:

1. Check logs: `pm2 logs goat-app`
2. Check if app is running: `pm2 status`
3. Check Nginx: `sudo systemctl status nginx`
4. Restart everything: `pm2 restart goat-app && sudo systemctl restart nginx`

## 🎊 Success Checklist

- [ ] VPS status is "running"
- [ ] Files uploaded to /root/
- [ ] SSH connection successful
- [ ] Deployment script completed
- [ ] App accessible at http://93.127.214.171
- [ ] Login page loads
- [ ] Can create account
- [ ] All tabs visible

## 📞 Need Help?

If you encounter any issues, let me know:
- What step you're on
- Any error messages
- What you see in the logs

---

**Your app will be live at**: http://93.127.214.171

**Estimated time**: 20-30 minutes total