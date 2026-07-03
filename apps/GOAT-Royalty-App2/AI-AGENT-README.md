# SUPER GOAT ROYALTIES APP v2.0.0 - AI Agent Enhanced Edition

## 🚀 New AI Agent Features

This version includes advanced AI agent capabilities:

### Agent Types Implemented:
1. **Hierarchical Orchestrator Agent** - Manages multiple specialized agents with workflow coordination
2. **Autonomous Agent** - Full self-directed operation with tool use and self-healing
3. **Multi-Agent System** - Collaborative and competitive problem solving
4. **Agentic RAG** - Enterprise retrieval with hallucination prevention
5. **Learning Agent** - Q-learning with experience replay
6. **Utility-Based Agent** - Optimal decision making using utility functions
7. **Goal-Based Planning Agent** - Multi-step planning and execution
8. **Agent Communication Protocol (ACP)** - Cross-framework agent messaging

### AI Model Support:
- **Flagship Models**: GPT-5.2, Claude Opus 4.6, Gemini 3.0 Pro
- **Specialized Models**: Mistral Devstral (coding), Perplexity (search)
- **Open-Source Models**: Llama 4, Gemma 3

## 📦 Installation

### Portable Version (tar.gz / zip)
1. Extract the archive to your desired location
2. Run `npm install` in the extracted directory
3. Run `npm start` to start the Next.js server
4. Open http://localhost:3000 in your browser

### Building Desktop Installers

#### Windows EXE Installer
```bash
# Prerequisites: Node.js 18+, npm
npm install
npm run build
npx electron-builder --win --x64
```

#### macOS DMG Installer
```bash
# Prerequisites: macOS with Xcode Command Line Tools
npm install
npm run build
npx electron-builder --mac --x64
```

#### Linux AppImage
```bash
npm install
npm run build
npx electron-builder --linux --x64
```

## 🎯 Features

### AI Agent Hub
Access the new AI Agent Hub at `/ai-agent-hub` to:
- Select and interact with different agent types
- Choose AI models for processing
- View agent hierarchy and capabilities
- Execute quick actions for royalty management

### API Endpoints
All agent capabilities are exposed via REST APIs:
- `POST /api/agents/orchestrator` - Hierarchical orchestration
- `POST /api/agents/autonomous` - Autonomous task execution
- `POST /api/agents/multi-agent` - Multi-agent collaboration
- `POST /api/agents/agentic-rag` - Verified retrieval
- `POST /api/agents/learning` - Learning and adaptation
- `POST /api/agents/protocol` - Agent communication

## 📋 System Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB for application, 2GB for build artifacts

## 🔧 Configuration

Environment variables (create `.env.local`):
```
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GOOGLE_AI_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

## 📄 License

MIT License - Created by Harvey L. Miller Jr. (DJ Speedy)

## 🐐 GOAT Royalty App

The GREATEST OF ALL TIME royalty collection application for music artists and publishers.