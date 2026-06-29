@echo off
echo 🚀 Setting up GOAT Royalty App Locally...
echo ==========================================
echo.

REM Step 1: Check Node.js
echo 📦 Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install from https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js is installed
echo.

REM Step 2: Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Step 3: Install mining dependencies
echo ⛏️  Installing mining dependencies...
call npm install axios node-fetch jsdom cheerio stripe
if %errorlevel% neq 0 (
    echo ❌ Failed to install mining dependencies
    pause
    exit /b 1
)
echo ✅ Mining dependencies installed
echo.

REM Step 4: Create data directories
echo 📁 Creating data directories...
if not exist "data" mkdir data
if not exist "data\llms" mkdir data\llms
if not exist "data\models" mkdir data\models
if not exist "data\knowledge" mkdir data\knowledge
if not exist "logs" mkdir logs
echo ✅ Directories created
echo.

REM Step 5: Setup Ollama (if available)
echo 🔌 Checking for Ollama...
ollama --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Ollama found - downloading models...
    ollama pull llama2
    ollama pull mistral
    ollama pull qwen
    echo ✅ Models downloaded
) else (
    echo ⚠️  Ollama not found - install from https://ollama.ai
)
echo.

REM Step 6: Create local configuration
echo ⚙️  Creating local configuration...
(
echo PORT=5001
echo NODE_ENV=development
echo DATA_DIR=./data
) > .env.local
echo ✅ Configuration created
echo.

REM Step 7: Create startup script
echo 📝 Creating startup script...
(
echo @echo off
echo echo 🚀 Starting GOAT Royalty App...
echo node src/server.js
echo pause
) > start-local.bat
echo ✅ Startup script created
echo.

REM Final message
echo.
echo ==========================================
echo ✅ Setup Complete!
echo ==========================================
echo.
echo 📁 Installation directory: %CD%
echo 🚀 To start the app, run: start-local.bat
echo 🌐 Dashboard will be at: http://localhost:5001/crypto-mining.html
echo.
echo 📊 Quick Start Commands:
echo   • Start server:       node src/server.js
echo   • View dashboard:     http://localhost:5001/crypto-mining.html
echo   • Check API health:   http://localhost:5001/health
echo   • View pool data:     http://localhost:5001/api/pool/dashboard
echo.
echo 🧠 LLM Setup:
echo   • Install Ollama:     https://ollama.ai
echo   • Download models:    ollama pull llama2 mistral qwen
echo.
pause