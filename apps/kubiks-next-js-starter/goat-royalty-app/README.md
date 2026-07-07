# 🐐 GOAT - All-in-One AI-Powered Royalty App

> **"IF YOU CAN THINK IT! You CAN DO IT IN THE APP"** — DJ Speedy

![GOAT Banner](assets/goat-banner.png)

## 🚀 Overview

GOAT is a revolutionary all-in-one desktop application that combines cutting-edge AI technology with music industry tools, blockchain verification, and crypto mining capabilities. Built with a hierarchical multi-agent architecture powered by NVIDIA NIM's 220+ LLM models.

## ✨ Features

### 🤖 AI Assistant
- **215+ LLM Models** integrated through NVIDIA NIM
- Hierarchical multi-agent architecture (LangGraph + CrewAI)
- Specialized agents for different tasks
- Memory and learning capabilities
- No login required - ready to use out of the box

### 💰 Royalty Tracking
- Multi-platform royalty aggregation (Spotify, Apple Music, YouTube Music, etc.)
- Real-time earnings tracking across 20+ platforms
- Blockchain-verified royalty records
- Automated split sheet calculations
- Revenue forecasting with AI

### ⛓️ Blockchain Verification
- Multi-chain support (Ethereum, Polygon, Bitcoin)
- Public ledger verification for royalties
- Smart contract interactions
- Users can independently verify earnings
- Transparent and immutable records

### 🎵 DSP Distribution
- Distribute to 20+ streaming platforms worldwide
- Automatic ISRC/UPC code generation
- Google Sheets database integration
- Release scheduling and management
- Real-time delivery status tracking

### 🎬 Video Editing
- AI-powered video editing
- 3D effects and professional transitions
- Auto-captioning in 10+ languages
- AI-recommended thumbnails
- Background removal and replacement
- GPU-accelerated rendering

### ⛏️ Crypto Mining
- Multi-coin mining (ETH, BTC, RVN, ETC, and more)
- GPU optimization and monitoring
- Profitability calculator
- Auto-switching to most profitable coin
- Pool management

### 📊 Analytics
- Cross-platform performance analysis
- Trend detection and recommendations
- Audience demographics
- Competitor analysis
- Automated reporting

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GOAT Application                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Orchestrator Agent (LangGraph)              │   │
│  │         State Machine + Memory + Reasoning           │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│  ┌─────────────────────┼───────────────────────────────┐   │
│  │                     │                                │   │
│  │  ┌─────────┐ ┌──────┴─────┐ ┌─────────┐ ┌─────────┐ │   │
│  │  │ Royalty │ │ Blockchain │ │   DSP   │ │  Video  │ │   │
│  │  │ Tracker │ │ Verifier   │ │ Distrib │ │ Editor  │ │   │
│  │  └─────────┘ └───────────┘ └─────────┘ └─────────┘ │   │
│  │                                                      │   │
│  │  ┌─────────┐ ┌───────────┐ ┌─────────┐ ┌─────────┐ │   │
│  │  │  Crypto │ │  Content  │ │ Contract│ │   API   │ │   │
│  │  │  Miner  │ │  Analyst  │ │ Manager │ │Connector│ │   │
│  │  └─────────┘ └───────────┘ └─────────┘ └─────────┘ │   │
│  │                                                      │   │
│  │           Worker Agents (CrewAI)                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              NVIDIA NIM API (220+ Models)            │   │
│  │   Nemotron, Llama, Mistral, Qwen, DeepSeek, etc.    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

- **Backend**: Python 3.11+, FastAPI, Uvicorn
- **AI Framework**: LangChain, LangGraph, CrewAI
- **LLM Provider**: NVIDIA NIM (220+ models)
- **Frontend**: HTML5, Tailwind CSS, JavaScript
- **Desktop**: PyQt5 / Tauri (optional)
- **Blockchain**: Web3.py, Ethers.js
- **Video**: MoviePy, OpenCV, FFmpeg
- **Database**: SQLite, ChromaDB

## 📦 Installation

### Quick Start (Copy-Paste)

```bash
# One-line installation
curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/kubiks-next-js-starter/main/goat-royalty-app/install.sh | bash
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/DJSPEEDYGA/kubiks-next-js-starter.git
cd kubiks-next-js-starter/goat-royalty-app

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
npm install

# Run the application
python src/core/main.py
```

## 🚀 Usage

### Starting the App

```bash
# From installation directory
./goat

# Or with Python
python src/core/main.py
```

### Accessing the Interface

- **Web UI**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs
- **WebSocket**: ws://127.0.0.1:8000/ws

### API Examples

```bash
# Chat with AI
curl -X POST http://127.0.0.1:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Calculate royalties for 1 million Spotify streams"}'

# List available agents
curl http://127.0.0.1:8000/api/agents

# Start mining
curl -X POST http://127.0.0.1:8000/api/mining/start \
  -H "Content-Type: application/json" \
  -d '{"coin": "ETH"}'
```

## 🔨 Building Executables

### Windows EXE

```bash
# On Windows
scripts\build.bat

# Output: dist/GOAT-Windows-x64.exe
```

### macOS DMG

```bash
# On macOS
chmod +x scripts/build.sh
./scripts/build.sh --macos

# Output: dist/GOAT-macOS.dmg
```

### Portable Version

```bash
# Any platform
./scripts/build.sh --portable

# Output: dist/GOAT-Portable.zip
```

### Build All

```bash
./scripts/build.sh --all
```

## ⚙️ Configuration

Edit `config/config.yaml` to customize:

```yaml
# NVIDIA API Key (get from build.nvidia.com)
nvidia:
  api_key: "nvapi-xxx"

# Blockchain settings
blockchain:
  ethereum_rpc_url: "https://eth.llamarpc.com"
  mining_enabled: true

# AI Agent settings
agents:
  orchestrator_model: "nvidia/nemotron-3-super-120b-a12b"
  worker_model: "meta/llama-3.3-70b-instruct"
  memory_enabled: true

# Video settings
video:
  gpu_acceleration: true
```

## 🎯 Supported Platforms

### DSP Distribution
- Spotify
- Apple Music
- YouTube Music
- Amazon Music
- Tidal
- Deezer
- SoundCloud
- Pandora
- And 12+ more...

### Crypto Mining
- Ethereum (ETH)
- Bitcoin (BTC)
- Ravencoin (RVN)
- Ethereum Classic (ETC)
- Litecoin (LTC)
- Dogecoin (DOGE)
- Kaspa (KAS)
- Zcash (ZEC)

### AI Models (via NVIDIA NIM)
- NVIDIA Nemotron (340B, 120B)
- Meta Llama 3.3 (70B)
- Mistral Large
- Google Gemma 2
- Qwen 2.5 (72B)
- DeepSeek R1
- And 200+ more...

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Credits

- **DJ Speedy** - Creator & Vision
- **NVIDIA NIM** - AI Infrastructure
- **LangChain** - Agent Framework
- **CrewAI** - Multi-Agent Orchestration
- **FastAPI** - Backend Framework

---

<div align="center">

**"IF YOU CAN THINK IT! You CAN DO IT IN THE APP"**

Made with 🐐 by DJ Speedy

</div>