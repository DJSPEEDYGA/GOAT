# 🚀 GOAT Royalty App - Download & Run Instructions

## 📥 How to Download and Run

### Step 1: Download the App

**Option A: Download ZIP from GitHub**
1. Go to: https://github.com/DJSPEEDYGA/GOAT-Royalty-App2
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to a folder (e.g., `C:\GOAT-Royalty-App`)

**Option B: Clone with Git**
```cmd
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2
```

---

### Step 2: Install Node.js (If Not Installed)

**Check if you have Node.js:**
```cmd
node --version
```

If you see a version number (e.g., v20.10.0), you're good! Skip to Step 3.

**If not installed:**
1. Download from: https://nodejs.org/
2. Choose "LTS" version (recommended)
3. Run installer with default settings
4. Restart your computer

---

### Step 3: Run the App

**EASY METHOD - Double-click the startup script:**

1. Navigate to the folder where you extracted/cloned the app
2. Find `START-APP.bat`
3. **Double-click `START-APP.bat`**
4. Wait 15-20 seconds
5. The app will open automatically!

**That's it!** 🎉

---

## 🎯 What Happens When You Run START-APP.bat

1. ✅ Checks if dependencies are installed
2. ✅ Installs them if needed (first time only, takes 3-5 minutes)
3. ✅ Starts the Next.js server
4. ✅ Waits for server to be ready
5. ✅ Opens the Electron app
6. ✅ Your GOAT Royalty App is running!

---

## 📋 System Requirements

- **Operating System:** Windows 10 or Windows 11
- **Node.js:** Version 18 or higher (LTS recommended)
- **RAM:** 4 GB minimum, 8 GB recommended
- **Disk Space:** 500 MB for app + dependencies
- **Internet:** Required for first-time setup only

---

## 🐛 Troubleshooting

### Issue: "npm is not recognized"

**Solution:** Node.js is not installed or not in PATH
1. Install Node.js from https://nodejs.org/
2. Restart your computer
3. Try again

### Issue: Script doesn't start

**Solution:** Run as Administrator
1. Right-click `START-APP.bat`
2. Choose "Run as Administrator"

### Issue: Port 3000 already in use

**Solution:** Close other apps using port 3000
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: App window is blank

**Solution:** Wait longer (up to 30 seconds on first run)
- The server needs time to start
- You'll see "Ready" in the server window when it's ready

---

## 🔄 Updating the App

To get the latest version:

**If you downloaded ZIP:**
1. Download the new ZIP
2. Extract to a new folder
3. Run `START-APP.bat`

**If you cloned with Git:**
```cmd
cd GOAT-Royalty-App2
git pull origin main
npm install --legacy-peer-deps
```

---

## 🛑 Stopping the App

1. Close the Electron app window
2. Press **Ctrl+C** in the server window
3. Or just close both windows

---

## 💡 Pro Tips

### Tip 1: Create Desktop Shortcut

1. Right-click `START-APP.bat`
2. Choose "Create shortcut"
3. Drag shortcut to Desktop
4. Rename to "GOAT Royalty App"

### Tip 2: Keep Server Running

You can minimize the server window and keep it running in the background. Only close it when you're done using the app.

### Tip 3: First Run Takes Longer

The first time you run the app:
- Dependencies need to be installed (3-5 minutes)
- Subsequent runs are much faster (15-20 seconds)

---

## 📊 File Structure

```
GOAT-Royalty-App2/
├── START-APP.bat          ← Double-click this to run!
├── package.json           ← App configuration
├── main.js                ← Electron entry point
├── pages/                 ← Next.js pages
├── components/            ← React components
├── public/                ← Static files
└── node_modules/          ← Dependencies (auto-installed)
```

---

## 🎉 You're Ready!

Just double-click `START-APP.bat` and enjoy your GOAT Royalty App!

**Need help?** Check the troubleshooting section above or contact support.

---

## 🔗 Quick Links

- **GitHub Repository:** https://github.com/DJSPEEDYGA/GOAT-Royalty-App2
- **Node.js Download:** https://nodejs.org/
- **Issues/Support:** https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/issues

---

**Version:** 1.0.0  
**Last Updated:** October 30, 2025  
**Author:** DJ Speedy (Harvey L. Miller Jr.)