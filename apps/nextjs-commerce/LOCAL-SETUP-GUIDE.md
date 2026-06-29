# 🚀 GOAT Royalty App - Local Setup Guide

## 📍 Location: D:\GOAT-Royalty-App

---

## 🎯 Quick Start (Windows)

### **Step 1: Open Terminal**
```bash
cd D:\GOAT-Royalty-App
```

### **Step 2: Run Setup Script**
```bash
.\setup-local.bat
```

This will automatically:
- ✅ Install all dependencies
- ✅ Create data directories
- ✅ Set up configuration
- ✅ Create startup script

### **Step 3: Start the Server**
```bash
.\start-local.bat
```

### **Step 4: Access Dashboard**
Open: http://localhost:5001/crypto-mining.html

---

## 📦 What Gets Downloaded

### **1. Node.js Dependencies**
- express, mongoose, cors
- All required packages for backend

### **2. Mining Dependencies**
- axios (HTTP client)
- node-fetch (API calls)
- jsdom (web scraping)
- cheerio (HTML parsing)
- stripe (payments)

### **3. Data Directories**
```
D:\GOAT-Royalty-App\
├── data\
│   ├── llms\          # LLM model files
│   ├── models\        # AI model configurations
│   ├── knowledge\     # Knowledge base
│   └── logs\          # Application logs
```

---

## 🧠 Download LLM Models Locally

### **Option 1: Using Ollama (Recommended)**

1. **Install Ollama:**
   Download from: https://ollama.ai

2. **Download Models:**
   ```bash
   ollama pull llama2        # LLaMA 2 7B
   ollama pull mistral       # Mistral 7B
   ollama pull qwen          # Qwen 7B
   ollama pull codellama     # CodeLlama
   ollama pull phi           # Phi-2
   ```

3. **Verify Installation:**
   ```bash
   ollama list
   ```

### **Option 2: Manual Model Download**

Create file `data/llms/model-config.json`:
```json
{
  "models": {
    "llama2": {
      "name": "LLaMA 2",
      "size": "7B",
      "status": "Download via Ollama"
    },
    "mistral": {
      "name": "Mistral",
      "size": "7B",
      "status": "Download via Ollama"
    },
    "qwen": {
      "name": "Qwen",
      "size": "7B",
      "status": "Download via Ollama"
    }
  }
}
```

---

## ⛏️ Mining Data Storage

### **Pool Monitoring Data:**
- **Location:** `data/pool-monitoring.json`
- **Auto-generated** on first startup
- **Updates** every 30 seconds

### **Mining Statistics:**
- **Location:** `data/mining-stats.json`
- **Tracks:** hash rates, workers, balances
- **History:** stored for 30 days

---

## 🔧 Manual Setup (If Script Fails)

### **1. Install Dependencies**
```bash
npm install
npm install axios node-fetch jsdom cheerio stripe
```

### **2. Create Directories**
```bash
mkdir data
mkdir data\llms
mkdir data\models
mkdir data\knowledge
mkdir logs
```

### **3. Start Server**
```bash
node src/server.js
```

---

## 🌐 Configuration

### **Edit `.env.local`:**
```env
PORT=5001
NODE_ENV=development
DATA_DIR=./data

# Optional: Cloud Server Integration
CLOUD_SERVER_URL=http://169.254.24.18
```

### **Edit `web-app/js/api-config.js`:**
```javascript
const API_CONFIG = {
    CLOUD_URL: 'http://169.254.24.18',    // Your cloud server
    PORT: 5001,
    
    // Or use localhost:
    get API_URL() {
        return 'http://localhost:5001';
    }
};
```

---

## 🚀 Start Commands

### **Start Server:**
```bash
node src/server.js
```

### **Start with Auto-Reload (Dev Mode):**
```bash
node --watch src/server.js
```

---

## 📊 Access Points

| Service | URL |
|---------|-----|
| **Dashboard** | http://localhost:5001/crypto-mining.html |
| **Main App** | http://localhost:5001/index.html |
| **API Health** | http://localhost:5001/health |
| **Pool API** | http://localhost:5001/api/pool/dashboard |
| **WebSocket** | ws://localhost:5001 |

---

## 🔍 Troubleshooting

### **Port Already in Use:**
```bash
# Find process using port 5001
netstat -ano | findstr :5001

# Kill process
taskkill /PID <PID> /F
```

### **Missing Dependencies:**
```bash
npm install --force
```

### **CORS Errors:**
The server already has CORS enabled. If you still get errors:
- Check `src/server.js` for CORS configuration
- Ensure you're using correct port (5001)

### **Pool Data Not Loading:**
- Check internet connection
- Verify wallet addresses
- Check browser console (F12) for errors
- Test API: http://localhost:5001/api/pool/dashboard

---

## 📁 File Structure After Setup

```
D:\GOAT-Royalty-App\
├── src\
│   ├── server.js              # Main server file
│   ├── routes\                # API routes
│   ├── services\              # Business logic
│   └── middleware\            # Custom middleware
├── web-app\
│   ├── crypto-mining.html     # Mining dashboard
│   ├── index.html             # Main page
│   └── js\                    # JavaScript files
├── data\
│   ├── llms\                  # LLM models
│   ├── models\                # AI configurations
│   ├── knowledge\             # Knowledge base
│   └── logs\                  # Application logs
├── node_modules\              # Dependencies
├── setup-local.bat            # Setup script
├── start-local.bat            # Startup script
└── .env.local                 # Local configuration
```

---

## 🎯 Checklist Before Running

- [ ] Node.js installed (v18+)
- [ ] Git installed
- [ ] Ollama installed (for LLMs)
- [ ] Dependencies installed
- [ ] Data directories created
- [ ] Configuration files updated
- [ ] Port 5001 available

---

## 💰 Pool Mining Setup

### **1. Configure Wallets:**
Open dashboard → Enter your wallet addresses → Click "Update Wallets"

### **2. Connect Mining Rigs:**
```bash
# Example for F2Pool
cgminer -o stratum+tcp://ltc.f2pool.com:8888 -u YOUR_WALLET_ADDRESS -p x
```

### **3. Monitor:**
Dashboard will auto-refresh every 30 seconds

---

## 🚀 Next Steps

1. **Run setup script:** `.\setup-local.bat`
2. **Download LLMs:** Install Ollama and pull models
3. **Start server:** `.\start-local.bat`
4. **Access dashboard:** http://localhost:5001/crypto-mining.html
5. **Configure wallets:** Enter your mining wallet addresses
6. **Start mining:** Connect your rigs to pools

---

**Need Help?** Check the logs in `logs/` directory!

**Estimated Setup Time:** 15-30 minutes

**Disk Space Required:** ~5GB (with LLMs)