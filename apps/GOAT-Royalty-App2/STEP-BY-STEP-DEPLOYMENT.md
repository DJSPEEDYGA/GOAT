# 🎯 STEP-BY-STEP DEPLOYMENT GUIDE

Choose your method below and follow the exact steps!

---

## 🚀 METHOD 1: SSH + WGET (EASIEST - RECOMMENDED!)

This downloads files directly to your VPS. No need to download to your computer!

### Step 1: Get Your VPS Password

1. Go to https://hpanel.hostinger.com
2. Click on your VPS (srv832760.hstgr.cloud)
3. Look for "Root password"
4. Click "Change" to set a new password
5. **Write down this password!**

### Step 2: Open Terminal/Command Prompt

**On Windows:**
- Press `Windows Key + R`
- Type `cmd` and press Enter
- OR use PowerShell

**On Mac:**
- Press `Command + Space`
- Type `Terminal` and press Enter

**On Linux:**
- Press `Ctrl + Alt + T`

### Step 3: SSH into Your VPS

Copy and paste this command:
```bash
ssh root@93.127.214.171
```

Press Enter.

You'll see:
```
The authenticity of host '93.127.214.171' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

Type `yes` and press Enter.

Then it will ask for password. Type (or paste) your root password and press Enter.

**Note:** You won't see the password as you type - that's normal!

### Step 4: Download Files

Once you're logged in, copy and paste these commands ONE BY ONE:

```bash
cd /root
```
Press Enter. Then:

```bash
wget https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/raw/main/goat-app-deployment-v3-with-gemini.tar.gz
```
Press Enter. Wait for download (takes ~30 seconds). Then:

```bash
wget https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/raw/main/auto-deploy.sh
```
Press Enter. Then:

```bash
chmod +x auto-deploy.sh
```
Press Enter.

### Step 5: Run Deployment

```bash
./auto-deploy.sh
```
Press Enter.

**Now wait 15-20 minutes!** The script will show you what it's doing.

You'll see messages like:
- "Step 1: Updating system..."
- "Step 2: Installing Node.js..."
- etc.

### Step 6: Open Your App

When you see "✅ DEPLOYMENT COMPLETE!", open your browser and go to:
```
http://93.127.214.171
```

**DONE!** 🎉

---

## 📥 METHOD 2: DOWNLOAD TO COMPUTER FIRST

If you prefer to download files to your computer first:

### Step 1: Download Files

**File 1 - App Package:**
1. Open browser
2. Go to: https://github.com/DJSPEEDYGA/GOAT-Royalty-App2
3. Scroll down and click on `goat-app-deployment-v3-with-gemini.tar.gz`
4. Click the "Download" button (or right-click → Save As)
5. Save to your Downloads folder

**File 2 - Deploy Script:**
1. Go to: https://github.com/DJSPEEDYGA/GOAT-Royalty-App2
2. Click on `auto-deploy.sh`
3. Click "Download" button
4. Save to your Downloads folder

### Step 2: Upload to VPS via hPanel

1. Go to https://hpanel.hostinger.com
2. Click on your VPS (srv832760.hstgr.cloud)
3. Click "File Manager" button
4. Navigate to `/root/` folder
5. Click "Upload" button
6. Select both files from your Downloads folder
7. Wait for upload to complete

### Step 3: SSH and Deploy

Open Terminal/Command Prompt and run:

```bash
ssh root@93.127.214.171
```

Enter your password when prompted.

Then run:
```bash
cd /root
chmod +x auto-deploy.sh
./auto-deploy.sh
```

Wait 15-20 minutes, then open: http://93.127.214.171

---

## 🖥️ METHOD 3: USE HOSTINGER TERMINAL (NO SSH CLIENT NEEDED!)

If you don't want to use your computer's terminal:

### Step 1: Open Hostinger Terminal

1. Go to https://hpanel.hostinger.com
2. Click on your VPS (srv832760.hstgr.cloud)
3. Click "SSH Access" or "Terminal" button
4. A browser-based terminal will open

### Step 2: Download and Deploy

In the browser terminal, copy and paste these commands:

```bash
cd /root
wget https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/raw/main/goat-app-deployment-v3-with-gemini.tar.gz
wget https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/raw/main/auto-deploy.sh
chmod +x auto-deploy.sh
./auto-deploy.sh
```

Wait 15-20 minutes, then open: http://93.127.214.171

---

## ❓ TROUBLESHOOTING

### "Connection refused" when SSH

- Wait a few more minutes - VPS might still be starting
- Check VPS status in hPanel (should say "running")
- Make sure you typed the IP correctly: 93.127.214.171

### "Permission denied" when SSH

- Make sure you're using the correct password
- Try resetting password in hPanel
- Remember: password won't show as you type

### "wget: command not found"

Your VPS might need wget installed. Run:
```bash
apt update && apt install wget -y
```

Then try the wget commands again.

### "File not found" error

Make sure you're in /root/ directory:
```bash
cd /root
ls -la
```

You should see the two files listed.

### Script fails during installation

Check the error message. Common fixes:
```bash
# If Node.js installation fails:
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# If permissions issue:
chmod +x auto-deploy.sh

# Try running script again:
./auto-deploy.sh
```

---

## 📞 NEED HELP?

If you get stuck:
1. Take a screenshot of the error
2. Tell me which step you're on
3. Copy/paste any error messages

I'll help you fix it!

---

## ✅ SUCCESS CHECKLIST

- [ ] VPS status is "running" in hPanel
- [ ] Got root password
- [ ] SSH connection successful
- [ ] Files downloaded to /root/
- [ ] Script running (shows progress messages)
- [ ] Script completed (shows "✅ DEPLOYMENT COMPLETE!")
- [ ] Can access http://93.127.214.171 in browser
- [ ] Login page loads

---

**Estimated Time:**
- Method 1: 20 minutes
- Method 2: 25 minutes  
- Method 3: 20 minutes

**Recommended:** Method 1 or Method 3 (easiest!)