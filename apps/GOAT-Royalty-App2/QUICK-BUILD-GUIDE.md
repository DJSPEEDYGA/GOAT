# 🚀 Quick Build Guide - Get Your .exe Files

## 🎯 FASTEST METHOD: GitHub Actions (Recommended)

### What You Get:
- ✅ Windows .exe (installer + portable)
- ✅ macOS .dmg
- ✅ Linux AppImage
- ✅ All built automatically on GitHub servers
- ✅ No Wine installation needed!

### Steps:

#### 1️⃣ Push the GitHub Actions file to your repository
```bash
cd /var/www/goat-app
git add .github/workflows/build-desktop-apps.yml
git commit -m "Add automated desktop app builds"
git push origin main
```

#### 2️⃣ Watch the build process
1. Go to: https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/actions
2. You'll see "Build Desktop Apps" workflow running
3. Wait 10-15 minutes for all 3 platforms to build

#### 3️⃣ Download your executables
1. Click on the completed workflow
2. Scroll down to "Artifacts"
3. Download:
   - `windows-executable.zip` - Contains your .exe files
   - `macos-executable.zip` - Contains .dmg for Mac
   - `linux-executable.zip` - Contains AppImage for Linux

---

## ⚡ ALTERNATIVE: Build on VPS with Wine

If you need the .exe RIGHT NOW (takes 15 minutes):

```bash
# Install Wine
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install -y wine64 wine32

# Build Windows app
cd /var/www/goat-app
npm run electron:build:win

# Your .exe will be in dist/ folder
ls -lh dist/*.exe
```

---

## 📦 What You'll Get

### Windows Files:
- `GOAT Royalty App Setup.exe` - Installer (users run this)
- `GOAT Royalty App.exe` - Portable version (no install needed)

### macOS Files:
- `GOAT Royalty App.dmg` - Mac installer

### Linux Files:
- `GOAT Royalty App.AppImage` - Linux executable

---

## 🎬 After Building

### Share with Users:
1. Upload to Google Drive / Dropbox
2. Share the download link
3. Users double-click to install/run

### Or Create GitHub Release:
```bash
# Tag your version
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will automatically create a release with all files
```

---

## 🆘 Troubleshooting

### "Wine is required" error?
- Use GitHub Actions instead (no Wine needed)
- Or install Wine with the commands above

### Build takes too long?
- GitHub Actions runs in parallel (all 3 platforms at once)
- Total time: ~10-15 minutes

### Can't access GitHub Actions?
- Make sure you're logged into GitHub
- Check: https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/actions

---

## 💡 Pro Tips

1. **First time?** Use GitHub Actions - it's the easiest
2. **Need updates?** Just push code, GitHub rebuilds automatically
3. **Want portable version?** It's included in the Windows build
4. **Testing?** Download and run on your Windows PC

---

## 📞 Quick Commands Reference

```bash
# Push to GitHub (triggers automatic build)
git add .
git commit -m "Update app"
git push origin main

# Check build status
# Visit: https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/actions

# Build locally with Wine (if needed)
npm run electron:build:win
```

---

## ✅ Success Checklist

- [ ] GitHub Actions workflow file created
- [ ] Code pushed to GitHub
- [ ] Workflow running (check Actions tab)
- [ ] Build completed (green checkmark)
- [ ] Artifacts downloaded
- [ ] .exe file tested on Windows

**You're ready to distribute your app! 🎉**