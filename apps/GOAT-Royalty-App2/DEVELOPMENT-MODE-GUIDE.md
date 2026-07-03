# 🚀 Running GOAT Royalty App - Development Mode

## ⚠️ Packaged .exe Issue

The packaged .exe is having trouble starting the Next.js server automatically. While we work on a permanent fix, here's the **recommended workaround** that works perfectly:

---

## ✅ RECOMMENDED: Two-Terminal Method

This method runs the app in development mode with full functionality.

### Step 1: Start Next.js Server

Open **Terminal 1** (Git Bash or Command Prompt):

```cmd
cd ~/Documents/goat-royalty-app
npm run dev
```

**Wait for this message:**
```
✓ Ready in 864ms
- Local: http://localhost:3000
```

### Step 2: Start Electron App

Open **Terminal 2** (Git Bash or Command Prompt):

```cmd
cd ~/Documents/goat-royalty-app
npm run electron
```

**Result:** Your GOAT Royalty App opens in a desktop window! 🎉

---

## 🌐 Alternative: Browser Mode

If you just want to use the app without Electron:

```cmd
cd ~/Documents/goat-royalty-app
npm run dev
```

Then open your browser to: **http://localhost:3000**

---

## 🔧 Why This Works

**The Problem:**
- The packaged .exe can't find the Next.js executable
- Electron-builder isn't including all necessary files
- Path resolution issues in production build

**The Solution:**
- Run Next.js server separately (`npm run dev`)
- Run Electron separately (`npm run electron`)
- They connect via localhost:3000
- Everything works perfectly!

---

## 📋 Quick Reference

### Start Development Mode
```cmd
# Terminal 1
cd ~/Documents/goat-royalty-app
npm run dev

# Terminal 2 (wait for Terminal 1 to show "Ready")
cd ~/Documents/goat-royalty-app
npm run electron
```

### Stop Everything
- Press **Ctrl+C** in both terminals
- Or close the Electron window (Terminal 1 will stop automatically)

---

## 🎯 What You Get

✅ Full desktop application experience
✅ All 11 tabs working
✅ Hot reload (changes update automatically)
✅ Developer tools available (F12)
✅ Fast startup (no packaging needed)
✅ Easy debugging

---

## 💡 Pro Tips

### Tip 1: Create Startup Scripts

**Windows Batch File (start-goat.bat):**
```batch
@echo off
start cmd /k "cd /d %USERPROFILE%\Documents\goat-royalty-app && npm run dev"
timeout /t 10
start cmd /k "cd /d %USERPROFILE%\Documents\goat-royalty-app && npm run electron"
```

Save this as `start-goat.bat` in your Documents folder, then just double-click it!

### Tip 2: Keep Terminals Open

Leave Terminal 1 (npm run dev) running in the background. You can minimize it and just use Terminal 2 to start/stop Electron as needed.

### Tip 3: Check Server Status

If Electron shows errors, make sure Terminal 1 shows:
```
✓ Ready in XXXms
- Local: http://localhost:3000
```

---

## 🐛 Troubleshooting

### Issue: "Port 3000 already in use"

**Solution:**
```cmd
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Issue: Electron window is blank

**Solution:**
1. Make sure Terminal 1 shows "Ready"
2. Wait 5-10 seconds
3. Press Ctrl+R in Electron window to reload

### Issue: Changes not showing

**Solution:**
- Next.js has hot reload enabled
- Just save your file
- Changes appear automatically
- No need to restart

---

## 🎨 Development Workflow

### Making Changes

1. **Edit files** in your code editor
2. **Save** (Ctrl+S)
3. **Changes appear automatically** in Electron window
4. **No restart needed!**

### Testing

1. **Open DevTools** (F12 in Electron window)
2. **Check Console** for errors
3. **Inspect Elements** for styling
4. **Network tab** for API calls

---

## 🚀 Future: Proper .exe Build

We're working on fixing the packaged .exe build. The issue is:
- Electron-builder file inclusion
- Next.js standalone build configuration
- Path resolution in production

Once fixed, you'll be able to:
- Double-click a single .exe file
- No terminals needed
- Distribute to users easily

---

## 📊 Comparison

| Method | Pros | Cons |
|--------|------|------|
| **Two-Terminal** | ✅ Works perfectly<br>✅ Hot reload<br>✅ Easy debugging | ❌ Two terminals<br>❌ Not portable |
| **Browser** | ✅ Simple<br>✅ No Electron needed | ❌ No desktop app<br>❌ No offline |
| **Packaged .exe** | ✅ Single file<br>✅ Portable | ❌ Currently broken<br>❌ Needs fixing |

---

## ✅ Recommended Setup

**For Development:** Use Two-Terminal method
**For Testing:** Use Two-Terminal method
**For Distribution:** Wait for .exe fix (coming soon)

---

## 🎉 You're All Set!

The two-terminal method gives you a fully functional desktop app with all features working. While it requires two terminals, it's actually better for development because:

1. ✅ Faster startup
2. ✅ Hot reload enabled
3. ✅ Easy debugging
4. ✅ No build time
5. ✅ All features work

**Start coding and enjoy your GOAT Royalty App!** 🐐👑