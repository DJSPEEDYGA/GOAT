# 🐐 Super GOAT Royalty v3.0.0

## AI-Powered Music Production & Royalty Management Command Center

**Created by Harvey Miller (DJ Speedy) — @DJSPEEDYGA**

Super GOAT Royalty is a standalone desktop application that combines **1000+ Large Language Models** from 12+ providers into one unified AI command center. Built specifically for music producers, artists, and creators who need powerful AI tools alongside music production and royalty management capabilities.

![Version](https://img.shields.io/badge/version-3.0.0-brightgreen)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Models](https://img.shields.io/badge/models-1000%2B-orange)
![License](https://img.shields.io/badge/license-MIT-purple)

---

## 🚀 What's New in v3.0.0

### 🟢 NVIDIA NIM Integration (80+ Models)
- Full access to NVIDIA's build.nvidia.com inference API
- Models from Meta (Llama 3.1), Mistral, DeepSeek, Google (Gemma), Microsoft (Phi), NVIDIA (Nemotron), and more
- Categories: Text Generation, Code, Reasoning, Vision, Audio, Embedding, Reranking
- OpenAI-compatible API for seamless integration

### 🌐 OpenRouter Integration (653+ Models)
- Unified access to 653+ models from every major AI provider
- Single API key for Anthropic, OpenAI, Google, Meta, Mistral, DeepSeek, Qwen, Cohere, Perplexity, and many more
- Automatic model routing and fallback support

### 🤗 Hugging Face + Speed Providers
- Direct Hugging Face Inference API access
- **Groq** — Lightning-fast inference with LPU™ technology
- **Cerebras** — Wafer-scale AI chip powered inference
- **SambaNova** — Reconfigurable Dataflow Unit speeds
- **Together AI** — Leading open-source model hosting
- **Fireworks AI** — Production-grade fast inference
- **Novita AI** — Affordable GPU inference
- **Hyperbolic** — Decentralized GPU cloud

### 🧠 GOAT Brain — Multi-Model Super Intelligence
The GOAT Brain system combines multiple LLMs into one unified intelligence with 7 orchestration modes:

| Mode | Description |
|------|-------------|
| 🎯 **Specialist** | Auto-routes to the best model for the task type (code, reasoning, creative, music, analysis) |
| 🗳️ **Consensus** | Queries multiple models and synthesizes a consensus response |
| 🏆 **Best of N** | Gets responses from N models and picks the highest quality one |
| 🔗 **Chain** | Sequential refinement — each model improves the previous response |
| 🎭 **Ensemble** | Merges unique perspectives from different models |
| ⚔️ **Debate** | Models argue opposing viewpoints, a judge synthesizes the verdict |
| ⚡ **Parallel** | Queries all models simultaneously, returns the fastest response |

### 🛠️ Full Tool Suite
All tools from v2.0 are preserved and enhanced:
- **Terminal** — Full command-line interface with quick commands
- **File Manager** — Browse and manage files and directories
- **Code Editor** — Write, edit, run code with syntax support
- **Web Browser** — Search the web and scrape data
- **Image Tools** — AI-powered image generation and editing
- **Audio Tools** — Audio file processing and transcription
- **PDF Tools** — Extract text and summarize PDF documents
- **Data Analysis** — CSV, JSON, Excel analysis with visualizations
- **Music Production** — Catalog analysis, beat ideas, lyric writing, trends
- **Royalty Calculator** — Calculate streaming earnings across all platforms
- **Axiom AI** — No-code browser automation bots and web scraping

---

## 📦 Installation

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ (for development)
- [Git](https://git-scm.com/)

### From Source
```bash
# Clone the repository
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App..git
cd GOAT-Royalty-App.

# Install dependencies
npm install

# Run in development mode
npm start
```

### Build Installers
```bash
# Windows (.exe)
npm run build:win

# macOS (.dmg)
npm run build:mac

# Linux (.AppImage, .deb)
npm run build:linux

# All platforms
npm run build:all
```

---

## 🔑 API Key Setup

Open **Settings** (⚙ icon in top bar) to configure your API keys:

| Provider | Key Format | Get Key |
|----------|-----------|---------|
| NVIDIA NIM | `nvapi-...` | [build.nvidia.com](https://build.nvidia.com) |
| OpenAI | `sk-...` | [platform.openai.com](https://platform.openai.com) |
| Google AI | `AI...` | [aistudio.google.com](https://aistudio.google.com) |
| Anthropic | `sk-ant-...` | [console.anthropic.com](https://console.anthropic.com) |
| Groq | `gsk_...` | [console.groq.com](https://console.groq.com) |
| Cerebras | `csk-...` | [cloud.cerebras.ai](https://cloud.cerebras.ai) |
| SambaNova | — | [cloud.sambanova.ai](https://cloud.sambanova.ai) |
| Together AI | — | [api.together.xyz](https://api.together.xyz) |
| Fireworks AI | — | [fireworks.ai](https://fireworks.ai) |
| OpenRouter | `sk-or-...` | [openrouter.ai](https://openrouter.ai) |
| Hugging Face | `hf_...` | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| Novita AI | — | [novita.ai](https://novita.ai) |
| Hyperbolic | — | [hyperbolic.xyz](https://hyperbolic.xyz) |

**Local Models:** Install [Ollama](https://ollama.com) and pull models (`ollama pull llama3`). No API key required.

---

## 🏗️ Architecture

```
super-goat-royalty/
├── package.json              # App config + electron-builder settings
├── README.md                 # This file
├── src/
│   ├── main.js               # Electron main process
│   ├── preload.js            # Secure context bridge
│   ├── renderer/
│   │   ├── index.html        # Main UI (1000+ model selector, all tools)
│   │   ├── styles.css        # Complete CSS with NVIDIA + GOAT theming
│   │   └── app.js            # Renderer logic (AI routing, tools, UI)
│   ├── providers/
│   │   ├── nvidia-nim.js     # NVIDIA NIM API (80+ models, categories)
│   │   ├── huggingface.js    # HF Inference + 8 speed providers
│   │   ├── openrouter.js     # OpenRouter unified API (653+ models)
│   │   └── goat-brain.js     # Multi-model orchestration engine
│   └── axiom/
│       ├── axiom-ui.js       # Axiom bot builder UI
│       └── browser-automation.js  # Browser automation engine
├── assets/                   # App icons and resources
└── build/                    # Build resources
```

### Provider Architecture
All providers use an OpenAI-compatible chat/completions API pattern:
```
User → Model Selector → Provider Router → API Call → Response
         ↓ (if GOAT Brain enabled)
     GOAT Brain → Multi-Model Orchestration → Synthesized Response
```

### Model Routing
```javascript
// Format: "provider:model-id"
"nvidia:meta/llama-3.1-405b-instruct"  → NVIDIA NIM API
"openai:gpt-4o"                         → OpenAI API
"google:gemini-2.0-flash"               → Google AI API
"anthropic:claude-3.5-sonnet"           → Anthropic API
"groq:llama-3.1-70b-versatile"          → Groq API
"cerebras:llama3.1-70b"                 → Cerebras API
"sambanova:Meta-Llama-3.1-405B"         → SambaNova API
"together:meta-llama/..."               → Together AI API
"fireworks:accounts/fireworks/..."       → Fireworks AI API
"openrouter:anthropic/claude-3.5-sonnet" → OpenRouter API
"hf:meta-llama/..."                     → Hugging Face API
"ollama:llama3"                         → Local Ollama
```

---

## 🎵 Music Features

### Royalty Calculator
Calculate earnings across all major streaming platforms:
- **Spotify** — $0.00437/stream
- **Apple Music** — $0.00783/stream
- **YouTube Music** — $0.00274/stream
- **TikTok** — $0.00069/stream
- **Tidal** — $0.01284/stream
- **Amazon Music** — $0.00402/stream

### Music Production Tools
- **Catalog Analysis** — AI-powered analysis of your music catalog
- **Beat Ideas** — Generate beat concepts and production ideas
- **Lyric Writer** — AI songwriting with genre-specific styles
- **Industry Trends** — Research current music industry trends
- **Release Marketing** — Generate marketing strategies for releases

---

## 🤖 Axiom AI Automation
Built-in no-code browser automation:
- **Visual Bot Builder** — Drag-and-drop automation steps
- **Pre-built Templates** — Common automation workflows
- **Step Types** — Navigate, Click, Type, Extract, Scroll, Wait, Screenshot, Conditional
- **Bot Management** — Save, run, and schedule bots

---

## 🧠 GOAT Brain Usage

### Enable GOAT Brain
1. Click the 🧠 toggle in the sidebar or input toolbar
2. Select a mode from the GOAT Brain panel
3. Send a message — it will be processed by multiple models

### Specialist Mode (Recommended)
The Specialist mode automatically classifies your task and routes to the best model:
- **Code tasks** → DeepSeek Coder, CodeLlama, GPT-4o
- **Reasoning tasks** → Llama 3.1 405B, Claude 3.5 Sonnet, o1
- **Creative tasks** → Claude 3 Opus, Gemini Pro, GPT-4o
- **Music tasks** → GPT-4o, Claude 3.5, Llama 3.1
- **Analysis tasks** → Llama 3.1 405B, Gemini 1.5 Pro, GPT-4 Turbo

---

## 🔧 Development

### Tech Stack
- **Electron 28.x** — Desktop application framework
- **electron-builder** — Cross-platform packaging
- **Node.js** — Backend runtime
- **axios** — HTTP client for API calls
- **cheerio** — HTML parsing for web scraping

### Scripts
```bash
npm start          # Launch in development mode
npm run build:win  # Build Windows installer (.exe)
npm run build:mac  # Build macOS installer (.dmg)
npm run build:linux # Build Linux packages
npm run build:all  # Build for all platforms
```

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| **3.0.0** | 2025 | NVIDIA NIM (80+ models), OpenRouter (653+ models), HF + 8 speed providers, GOAT Brain multi-model intelligence, complete UI redesign |
| **2.0.0** | 2024 | Electron app with OpenAI, Google, Anthropic, Ollama, full tool suite, Axiom automation |
| **1.0.0** | 2024 | Initial release |

---

## 📄 License

MIT License — Copyright (c) 2025 Harvey Miller (DJ Speedy)

---

## 🤝 Credits

- **NVIDIA** — NIM inference API and GPU acceleration
- **OpenRouter** — Unified model routing
- **Hugging Face** — Model hub and inference API
- **Groq, Cerebras, SambaNova** — Ultra-fast inference hardware
- **Together AI, Fireworks AI** — Open-source model hosting
- **OpenAI, Google, Anthropic** — Foundation models
- **Ollama** — Local model runtime
- **Electron** — Desktop application framework

---

**Built with ❤️ by DJ Speedy | @DJSPEEDYGA**