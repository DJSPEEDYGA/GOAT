# 🪟 Building GOAT Royalty App .exe on Windows

## ⚠️ Important: Build on Windows Computer

The .exe file **must be built on a Windows computer**. This Linux environment cannot create Windows executables.

---

## 📋 Prerequisites (One-Time Setup)

### 1. Install Node.js
- Download from: https://nodejs.org/
- Choose LTS version (20.x or higher)
- Run installer, accept defaults
- Restart computer after installation

### 2. Verify Installation
Open Command Prompt (cmd) and run:
```cmd
node --version
npm --version
```
Should show version numbers (e.g., v20.10.0 and 10.2.3)

---

## 🚀 Step-by-Step Build Instructions

### Step 1: Get the Code
You have two options:

#### Option A: Clone from GitHub
```cmd
cd C:\
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2
```

#### Option B: Download ZIP
1. Go to: https://github.com/DJSPEEDYGA/GOAT-Royalty-App2
2. Click "Code" → "Download ZIP"
3. Extract to `C:\GOAT-Royalty-App2`
4. Open Command Prompt:
```cmd
cd C:\GOAT-Royalty-App2
```

### Step 2: Install Dependencies
```cmd
npm install
```
⏱️ This takes 2-5 minutes (downloads ~200MB)

### Step 3: Build Next.js App
```cmd
npm run build
```
⏱️ This takes 1-2 minutes

### Step 4: Build Windows .exe
```cmd
npm run build:win
```
⏱️ First time: 10-15 minutes (downloads Electron binaries ~200MB)
⏱️ Subsequent builds: 3-5 minutes

---

## 📦 What You Get

After building, check the `dist` folder:

```
C:\GOAT-Royalty-App2\dist\
├── GOAT Royalty App Setup 1.0.0.exe    (~250 MB) - Installer
├── GOAT-Royalty-App-Portable.exe       (~250 MB) - Portable
└── win-unpacked\                        (Unpacked files)
```

### Two Types of .exe Files:

#### 1. Installer Version
**File**: `GOAT Royalty App Setup 1.0.0.exe`
- Professional Windows installer
- Installs to `C:\Program Files\GOAT Royalty App`
- Creates desktop shortcut
- Creates Start Menu entry
- Includes uninstaller
- **Best for**: Permanent installation

#### 2. Portable Version
**File**: `GOAT-Royalty-App-Portable.exe`
- No installation required
- Run from any folder
- Run from USB drive
- No registry changes
- **Best for**: Testing, sharing, USB deployment

---

## 🎯 How to Use the .exe Files

### Using the Installer
1. Double-click `GOAT Royalty App Setup 1.0.0.exe`
2. Windows may show "Unknown Publisher" warning
   - Click "More info" → "Run anyway"
3. Follow installation wizard
4. Choose installation directory (default: C:\Program Files\GOAT Royalty App)
5. Click Install
6. Launch from Desktop shortcut

### Using the Portable Version
1. Copy `GOAT-Royalty-App-Portable.exe` anywhere
2. Double-click to run
3. Windows may show "Unknown Publisher" warning
   - Click "More info" → "Run anyway"
4. App starts automatically!

---

## 🔧 Troubleshooting

### Problem: "npm is not recognized"
**Solution**: Node.js not installed or not in PATH
```cmd
# Reinstall Node.js from nodejs.org
# Make sure to check "Add to PATH" during installation
```

### Problem: Build fails with "EPERM" or "Access Denied"
**Solution**: Run Command Prompt as Administrator
1. Right-click Command Prompt
2. Choose "Run as Administrator"
3. Try build again

### Problem: Windows Defender blocks the .exe
**Solution**: Add exception
1. Open Windows Security
2. Virus & threat protection
3. Manage settings
4. Add exclusion
5. Add folder: `C:\GOAT-Royalty-App2\dist`

### Problem: "Port 3000 already in use"
**Solution**: Close other apps using port 3000
```cmd
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Problem: Build takes forever
**Solution**: This is normal for first build
- First build: 10-15 minutes (downloads Electron)
- Subsequent builds: 3-5 minutes
- Be patient!

---

## 📊 Build Process Explained

### What Happens During Build:

1. **npm install** (Step 2)
   - Downloads all dependencies
   - Installs React, Next.js, Electron, etc.
   - Creates `node_modules` folder

2. **npm run build** (Step 3)
   - Compiles React components
   - Optimizes JavaScript
   - Creates `.next` folder with production build

3. **npm run build:win** (Step 4)
   - Downloads Electron binaries (first time only)
   - Packages Next.js app with Electron
   - Creates Windows installer
   - Creates portable .exe
   - Outputs to `dist` folder

---

## 🎨 Customization (Optional)

### Change App Name
Edit `package.json`:
```json
"build": {
  "productName": "Your Custom Name Here"
}
```

### Change App Icon
1. Replace `public/icon.ico` with your icon
2. Icon must be .ico format
3. Recommended size: 256x256 pixels

### Change Version Number
Edit `package.json`:
```json
"version": "2.0.0"
```

After any changes, rebuild:
```cmd
npm run build:win
```

---

## 💾 Sharing Your .exe

### Option 1: Direct Share
- Copy `GOAT-Royalty-App-Portable.exe` to USB drive
- Share via email (if under 25MB - may need to compress)
- Upload to cloud storage (Google Drive, Dropbox, OneDrive)

### Option 2: Create Installer Package
- Share `GOAT Royalty App Setup 1.0.0.exe`
- Users run installer
- More professional appearance

### Option 3: GitHub Release
1. Go to your GitHub repository
2. Click "Releases" → "Create new release"
3. Upload both .exe files
4. Users can download from GitHub

---

## 🚀 Quick Reference

```cmd
# Full build process (run these in order)
cd C:\GOAT-Royalty-App2
npm install
npm run build
npm run build:win

# Output location
C:\GOAT-Royalty-App2\dist\

# Test the portable version
cd dist
GOAT-Royalty-App-Portable.exe
```

---

## ✅ Success Checklist

- [ ] Node.js installed (v20+)
- [ ] Code downloaded/cloned
- [ ] `npm install` completed successfully
- [ ] `npm run build` completed successfully
- [ ] `npm run build:win` completed successfully
- [ ] Found .exe files in `dist` folder
- [ ] Tested portable .exe - it works!
- [ ] Tested installer .exe - it works!
- [ ] Ready to share with users!

---

## 📞 Need Help?

Common issues and solutions:
1. **Build fails**: Run as Administrator
2. **Slow build**: Normal for first time (10-15 min)
3. **Windows blocks .exe**: Add security exception
4. **Port 3000 busy**: Close other apps
5. **npm not found**: Reinstall Node.js

---

## 🎉 You're Done!

Once you have the .exe files:
- ✅ No internet required to run
- ✅ Works on any Windows 10/11 PC
- ✅ All features included
- ✅ Professional desktop application
- ✅ Ready to distribute!

**Enjoy your GOAT Royalty App!** 🐐👑