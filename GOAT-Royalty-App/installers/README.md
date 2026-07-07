# 🐐 GOAT Royalty App — One-Click Installers

**Owner:** DJ Speedy (Harvey L. Miller Jr.) + Waka Flocka Flame  
**Repo:** https://github.com/DJSPEEDYGA/GOAT-Royalty-App

---

## 🚀 Quick Install

### 🍎 macOS
Open **Terminal** and paste:
```bash
curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/installers/install.sh | bash
```

### 🐧 Linux (Ubuntu, Debian, Fedora, Arch)
Open your terminal and paste:
```bash
curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/installers/install.sh | bash
```

### 🪟 Windows 10 / 11
Open **PowerShell** (right-click Start → Windows PowerShell) and paste:
```powershell
iwr -useb https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/installers/install.ps1 | iex
```

**Or** download [`install.bat`](https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/installers/install.bat) and double-click it.

---

## ⚙️ What Gets Installed

The installer is idempotent — safe to run multiple times. It will:

1. ✅ **Git** — version control (needed to pull updates)
2. ✅ **Python 3** — runs the Intel server + web app
3. ✅ **Ollama** — runs local AI (Gemma 3 4B, ~3 GB)
4. ✅ **Python libraries** — flask, flask-cors, requests, yt-dlp, python-dotenv
5. ✅ **GOAT Royalty App** — cloned to `~/GOAT-Royalty-App` (or `C:\Users\YOU\GOAT-Royalty-App` on Windows)
6. ✅ **Gemma 3 4B model** — Google's open-weight LLM (your free GPT)
7. ✅ **Desktop shortcut** — 🐐 icon, one-click launcher

After install the app auto-launches on:
- **Powerhouse:** http://localhost:8090/powerhouse.html
- **AI Brain + 11 Agents:** http://localhost:8090/agents-brain.html
- **Intel API:** http://localhost:5500

---

## 🔐 Your Keys (Important!)

The installer does **NOT** ship with API keys. After install, open the app and paste your keys:

| Service | Where to get it | Where to paste it |
|---|---|---|
| **Gemini** (free) | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | `goat-intel-server/local_keys.json` |
| **Spotify** (free) | [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) | Open `spotify-setup.html` in app |
| **NVIDIA Build** (free) | [build.nvidia.com](https://build.nvidia.com) | `goat-app/.env` as `NVIDIA_API_KEY` |
| **Supabase** (already set) | — | Pre-wired to project `xmvlnonsxmrpvlssjstl` |

**Local keys file format** (`goat-intel-server/local_keys.json`):
```json
{
  "gemini_key": "AIzaSy...",
  "spotify_client_id": "abc123",
  "spotify_client_secret": "xyz789"
}
```

This file is in `.gitignore` — your keys never get pushed to GitHub.

---

## 🛠 Manual Install

If the auto-installer fails (corporate firewall, no admin rights, etc.):

```bash
# 1. Clone
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git
cd GOAT-Royalty-App

# 2. Python deps
pip3 install flask flask-cors requests yt-dlp python-dotenv

# 3. Ollama (local AI)
# macOS/Linux:
curl -fsSL https://ollama.com/install.sh | sh
# Windows: download from ollama.com/download

# 4. Pull AI model
ollama serve &
ollama pull gemma3:4b

# 5. Run Intel server
cd goat-intel-server && python3 goat_intel.py &

# 6. Run web app
cd ../web-app && python3 -m http.server 8090

# 7. Open in browser
# → http://localhost:8090/powerhouse.html
```

---

## 🆘 Troubleshooting

| Issue | Fix |
|---|---|
| "Running scripts is disabled" (Windows) | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` in PowerShell |
| "brew: command not found" (Mac) | Installer handles it. Otherwise: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| Port 5500 or 8090 in use | Close Skype/other apps, or edit ports in `start-goat.sh` / `start-goat.bat` |
| Ollama too slow | Press Ctrl+C during pull — app works without it using NVIDIA + Gemini cloud (also free) |
| Linux: `permission denied` | `chmod +x ~/GOAT-Royalty-App/start-goat.sh` |

---

## 📞 Launch Commands

After install, launch anytime by:

**macOS / Linux:**
```bash
~/GOAT-Royalty-App/start-goat.sh
```
Or double-click `🐐 GOAT Royalty App.command` on Desktop.

**Windows:**
```powershell
C:\Users\YOU\GOAT-Royalty-App\start-goat.bat
```
Or double-click `🐐 GOAT Royalty App.lnk` on Desktop.

---

## 🛑 Stopping the App

Press **Ctrl+C** in the terminal window, or close the command window. This stops:
- Intel server (port 5500)
- Web app (port 8090)
- Ollama stays running in background (light, low memory)

To fully kill Ollama:
- **macOS:** `pkill ollama`  
- **Linux:** `pkill ollama`  
- **Windows:** Task Manager → End `ollama.exe`

---

## 🧬 Updating

Re-run the installer and it auto-pulls the latest from GitHub, or manually:
```bash
cd ~/GOAT-Royalty-App
git pull --rebase
```

---

*Built for the lawsuit. Built for the catalog. Built for the culture.*  
🐐 **Our Network Is Our Net Worth.**