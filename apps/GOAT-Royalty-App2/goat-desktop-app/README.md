# GOAT Royalty App 🐐

**The Greatest of All Time Royalty Management Platform**

Built by DJ Speedy

---

## Features

### 🤖 Advanced AI Agent System
- **Hierarchical Orchestrator**: Supervisor agent that decomposes complex goals and coordinates worker agents
- **12 Specialized Worker Agents**: Coder, Analyst, Royalty, Blockchain, Mining, Distribution, Video, Audio, Report, Research, Support
- **Autonomous Operation**: AI agents can operate with minimal human intervention
- **Multi-Agent Collaboration**: Agents work together on complex tasks

### 💰 Royalty Management
- Track royalties across all major DSPs (Spotify, Apple Music, YouTube Music, Amazon, Tidal, Deezer)
- Automatic royalty calculation with real-time rates
- Split management for multiple parties
- Revenue forecasting and analytics

### ⛓️ Blockchain Integration
- Wallet management for multiple networks (Ethereum, Polygon, Arbitrum, Base)
- On-chain royalty verification
- Smart contract deployment
- Immutable proof of ownership

### ⛏️ Cryptocurrency Mining
- Support for Bitcoin, Ethereum Classic, Ravencoin, Litecoin, Kaspa
- Automatic profit switching
- Real-time hashrate and temperature monitoring
- Pool management

### 📡 DSP Distribution
- One-click distribution to 50+ platforms
- Metadata management
- Content delivery optimization

### 🎬 Creative Tools
- AI-powered video editing
- Audio production suite
- Report generation

### 🧠 LLM Support
- 215+ language models supported
- Multi-provider support: OpenAI, Anthropic, Google, NVIDIA, Mistral, DeepSeek, Cohere, Groq
- Automatic fallback routing
- Optimized for cost and performance

---

## Installation

### Prerequisites
- Node.js 18+ (recommended: 20+)
- npm or yarn

### Development

```bash
# Clone or download the repository
cd goat-app

# Install dependencies
npm install

# Start development mode
npm start
```

### Production Build

**Windows:**
```bash
# Run the build script
build.bat

# Or manually
npm run build:win
```

**macOS/Linux:**
```bash
# Run the build script
chmod +x build.sh
./build.sh

# Or manually
npm run build:mac   # For macOS DMG
npm run build:linux # For Linux AppImage
```

### Build Outputs

After building, you'll find the following in the `dist/` folder:

| Platform | File Type | Description |
|----------|-----------|-------------|
| Windows | `.exe` | Windows installer (NSIS) |
| Windows | `-portable.exe` | Portable Windows app (no installation) |
| macOS | `.dmg` | macOS disk image |
| Linux | `.AppImage` | Linux portable app |
| Linux | `.deb` | Debian/Ubuntu package |

---

## Architecture

```
goat-app/
├── main.js                 # Electron main process
├── index.html              # Application UI
├── styles/
│   └── main.css            # Application styles
├── scripts/
│   └── app.js              # Application logic
├── backend/
│   ├── agents/
│   │   ├── router.js       # Agent routing system
│   │   ├── orchestrator.js # Supervisor agent
│   │   ├── base-worker.js  # Base worker class
│   │   └── workers/        # Specialized agents
│   ├── llm/
│   │   └── router.js       # LLM provider router
│   ├── royalty/
│   │   └── engine.js       # Royalty calculation engine
│   └── blockchain/
│       ├── provider.js     # Blockchain connections
│       ├── verification.js # Transaction verification
│       └── mining.js       # Mining operations
├── assets/
│   └── icon.png            # Application icon
├── package.json            # Dependencies and build config
├── build.sh                # Linux/macOS build script
└── build.bat               # Windows build script
```

---

## AI Agent Hierarchy

```
┌─────────────────────────────────────┐
│         ORCHESTRATOR (Supervisor)    │
│    - Goal decomposition             │
│    - Task coordination              │
│    - Result synthesis               │
└───────────────┬─────────────────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
┌───────┐  ┌───────┐  ┌───────┐
│ Coder │  │Analyst│  │Royalty│
└───────┘  └───────┘  └───────┘
    │           │           │
    ▼           ▼           ▼
┌───────────┐ ┌───────┐ ┌─────────┐
│Blockchain │ │Mining │ │Distrib. │
└───────────┘ └───────┘ └─────────┘
    │           │           │
    ▼           ▼           ▼
┌───────┐  ┌───────┐  ┌───────┐
│ Video │  │ Audio │  │Report │
└───────┘  └───────┘  └───────┘
```

---

## Supported LLM Providers

| Provider | Models | Priority |
|----------|--------|----------|
| OpenAI | GPT-4 Turbo, GPT-4o, GPT-4o-mini | 1 |
| Anthropic | Claude Opus 4, Sonnet 4, Haiku | 2 |
| Google | Gemini 2.0 Pro, 1.5 Pro/Flash | 3 |
| NVIDIA NIM | Llama 3.1 405B, Mixtral 8x22B | 4 |
| Meta | Llama 3.2 Vision, 3.1 | 5 |
| Mistral | Mistral Large 2, Codestral | 6 |
| DeepSeek | DeepSeek Chat, Coder, Reasoner | 7 |
| Cohere | Command R+, Command R | 8 |
| Groq | Llama 3.3 70B, Mixtral | 11 |
| Local | Ollama models (Llama, Mistral, Phi) | 12 |

---

## Configuration

### Settings

Access settings from the app or modify the stored configuration:

```javascript
{
  "theme": "dark",           // dark, light, goat
  "aiProvider": "auto",      // auto, openai, anthropic, google, nvidia
  "defaultNetwork": "ethereum", // ethereum, polygon, arbitrum, base
  "blockchainVerification": true,
  "autonomousMode": true
}
```

---

## License

© 2024 DJ Speedy. All rights reserved.

---

## Support

For issues and feature requests, visit the GitHub repository.

**GOAT Royalty App - "IF YOU CAN THINK IT! You CAN DO IT IN THE APP"**