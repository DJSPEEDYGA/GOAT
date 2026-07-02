# 🚀 Building GOAT Royalty App .exe File

## Quick Build Instructions

### Option 1: Build Installer + Portable .exe (Recommended)
```bash
cd GOAT-Royalty-App2
npm run build:win
```

This creates:
- **Installer**: `dist/GOAT Royalty App Setup 1.0.0.exe` (installs to Program Files)
- **Portable**: `dist/GOAT-Royalty-App-Portable.exe` (run from anywhere, no installation)

### Option 2: Build Only Portable .exe
```bash
cd GOAT-Royalty-App2
npm run build:portable
```

This creates only:
- **Portable**: `dist/GOAT-Royalty-App-Portable.exe`

---

## 📦 What Gets Built

### Installer Version (.exe with Setup)
- **File**: `GOAT Royalty App Setup 1.0.0.exe`
- **Size**: ~200-300 MB
- **Features**:
  - Professional Windows installer
  - Desktop shortcut creation
  - Start menu entry
  - Uninstaller included
  - Auto-updates support (if configured)

### Portable Version (.exe standalone)
- **File**: `GOAT-Royalty-App-Portable.exe`
- **Size**: ~200-300 MB
- **Features**:
  - No installation required
  - Run from USB drive
  - Run from any folder
  - No registry changes
  - Perfect for testing

---

## 🎯 How to Use the .exe Files

### Using the Installer
1. Double-click `GOAT Royalty App Setup 1.0.0.exe`
2. Follow the installation wizard
3. Choose installation directory
4. Click Install
5. Launch from Desktop shortcut or Start Menu

### Using the Portable Version
1. Copy `GOAT-Royalty-App-Portable.exe` to any folder
2. Double-click to run
3. The app starts automatically
4. No installation needed!

---

## ⚙️ How It Works

The .exe file contains:
1. **Electron Runtime** - Desktop app framework
2. **Next.js Server** - Runs automatically in background
3. **React App** - Your GOAT Royalty App UI
4. **All Dependencies** - Everything bundled together

When you run the .exe:
1. Electron starts
2. Next.js server starts on localhost:3000
3. Browser window opens showing your app
4. Everything runs locally on your computer

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clean and rebuild
rm -rf dist node_modules .next
npm install
npm run build:win
```

### .exe Won't Start
- Check Windows Defender/Antivirus (may block unsigned apps)
- Right-click .exe → Properties → Unblock
- Run as Administrator

### Port 3000 Already in Use
- Close any other apps using port 3000
- Or modify main.js to use different port

---

## 📊 Build Output Location

All built files go to: `GOAT-Royalty-App2/dist/`

```
dist/
├── GOAT Royalty App Setup 1.0.0.exe    (Installer)
├── GOAT-Royalty-App-Portable.exe       (Portable)
└── win-unpacked/                        (Unpacked files)
```

---

## 🎨 Customization

### Change App Icon
1. Replace `public/icon.ico` with your icon
2. Rebuild: `npm run build:win`

### Change App Name
1. Edit `package.json` → `build.productName`
2. Rebuild: `npm run build:win`

### Change Version
1. Edit `package.json` → `version`
2. Rebuild: `npm run build:win`

---

## 💡 Pro Tips

1. **First Build Takes Longer** (~5-10 minutes)
   - Downloads Electron binaries
   - Subsequent builds are faster

2. **Test Portable Version First**
   - Faster to build
   - Easier to test
   - No installation needed

3. **Distribute Portable Version**
   - Easier for users
   - No admin rights needed
   - Works on any Windows PC

4. **Sign Your App** (Optional)
   - Get code signing certificate
   - Prevents Windows warnings
   - Looks more professional

---

## 🚀 Quick Start (TL;DR)

```bash
# Navigate to project
cd GOAT-Royalty-App2

# Build everything
npm run build:win

# Find your .exe files in dist/ folder
# Double-click to run!
```

---

## 📝 Notes

- Build requires Windows or Wine on Linux/Mac
- First build downloads ~200MB of Electron binaries
- .exe files are large (~200-300MB) because they include everything
- No internet required to run the .exe (everything is bundled)
- The app runs completely offline once built

---

## ✅ Success Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] Next.js build successful (`npm run build`)
- [ ] Electron builder installed
- [ ] Run build command
- [ ] Check dist/ folder for .exe files
- [ ] Test the .exe file
- [ ] Share with users!

---

**Need Help?** Check the error messages during build and search for solutions, or ask for assistance!