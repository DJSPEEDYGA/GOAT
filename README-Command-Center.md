# 🐐 GOAT Force Command Center

**Supreme Commander Dashboard for DJ Speedy**

## 🎯 Overview

The GOAT Force Command Center is a comprehensive web-based dashboard that allows you to monitor and control all GOAT Force applications from a single interface. Built with HTML5, CSS3, and Python Flask backend.

## 🚀 Quick Start

### Method 1: Use the Launcher (Recommended)
```bash
cd /Users/be100radio/GOAT-Royalty-App
./start-command-center.sh
```

### Method 2: Manual Start
```bash
# Start the backend server
cd /Users/be100radio/GOAT-Royalty-App
python3 command-center-server.py

# Open the dashboard in your browser
open goat-command-center.html
```

## 📡 Access URLs

- **Command Center Dashboard**: `file:///Users/be100radio/GOAT-Royalty-App/goat-command-center.html`
- **API Server**: `http://localhost:8080`
- **Intel Server**: `http://localhost:5500`
- **Ollama Server**: `http://localhost:11434`

## 🎛️ Features

### 📊 **Real-time Monitoring**
- Live status of all GOAT Force applications
- Intel Server and Ollama Server health checks
- System resource monitoring (CPU, Memory, Disk)
- Auto-refresh every 30 seconds

### 🎮 **Application Control**
- Start/Stop individual applications
- Batch operations (Start All, Stop All)
- Organized by categories:
  - 👑 Leadership (THE GOAT, Ms. Money Penny)
  - 🧠 Core Agents (Dr. Devin, Sir Codex, Nexus, Lexi, etc.)
  - 🎨 Specialized (GONBRAZY, Wooh Da Kid, Hannah Miller)
  - 🛠️ Utilities (Command Hub, GOAT Royalty App)

### 🔄 **Server Management**
- Restart Intel Server
- Open Intel Dashboard
- View system logs
- Clear log history

### 📱 **Responsive Design**
- Works on desktop, tablet, and mobile
- Dark theme with GOAT Force branding
- Smooth animations and transitions

## 🛠️ Technical Details

### Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Get status of all applications |
| `/api/start-app` | POST | Start a specific application |
| `/api/stop-app` | POST | Stop a specific application |
| `/api/start-all` | POST | Start all applications |
| `/api/stop-all` | POST | Stop all applications |
| `/api/system-stats` | GET | Get system statistics |
| `/api/intel-status` | GET | Check Intel Server status |
| `/api/ollama-status` | GET | Check Ollama Server status |

### Dependencies

- **Python 3.x**
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin resource sharing
- **psutil** - System monitoring
- **requests** - HTTP client

### Installation

```bash
pip3 install flask flask-cors psutil requests
```

## 📋 Application Categories

### 👑 Leadership
- THE GOAT — SUPREME COMMANDER
- THE GOAT — GOAT Force Supreme Commander  
- THE GOAT
- Ms. Money Penny — BOSS LADY
- Ms. Money Penny
- Ms Money Penny — 🐐👑 The GOAT Royalty Store

### 🧠 Core Agents
- Dr. Devin — WHAT'S UP DOC
- Dr. Devin — GOAT Force AI
- Dr. Devin
- Sir Codex — SENTINEL
- Sir Codex
- Nexus — ORACLE
- Nexus
- Lexi — THE SPARK
- Lexi
- Ms. Vanessa — ICON
- Master Oscar — DEALMAKER
- Master Oscar

### 🎨 Specialized
- GONBRAZY — STUDIO BOSS
- Wooh Da Kid — TONY STARKS
- Hannah Miller — AMIGO KEEPER

### 🛠️ Utilities
- GOAT Force Command Hub
- GOAT Royalty App
- Ms Money Penny — AI Tools & Runtimes

## 🔧 Troubleshooting

### Server Won't Start
```bash
# Check Python version
python3 --version

# Install dependencies
pip3 install flask flask-cors psutil requests

# Check port availability
lsof -i :8080
```

### Applications Not Responding
```bash
# Check if Intel Server is running
curl http://localhost:5500/health

# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Intel Server
cd /Users/be100radio/GOAT-Royalty-App/goat-intel-server
python3 goat_intel.py
```

### Permission Issues
```bash
# Make launcher executable
chmod +x /Users/be100radio/GOAT-Royalty-App/start-command-center.sh

# Check file permissions
ls -la /Users/be100radio/GOAT-Royalty-App/
```

## 🎨 Customization

### Adding New Applications
Edit `command-center-server.py` and add your app to the `GOAT_APPS` dictionary:

```python
GOAT_APPS = {
    'your_category': [
        'Your App Name'
    ]
}
```

### Changing Theme
Edit the CSS variables in `goat-command-center.html`:

```css
:root {
    --primary-color: #d4a03c;
    --secondary-color: #f0c040;
    --background-color: #030205;
    --card-background: rgba(26, 26, 46, 0.8);
}
```

## 📞 Support

For issues or suggestions:
1. Check the system logs in the Command Center
2. Verify all dependencies are installed
3. Ensure Intel Server is running on port 5500
4. Contact your system administrator

---

**🐐 GOAT Force Empire - DJ Speedy - Supreme Commander**

*Built with ❤️ for the GOAT Force*