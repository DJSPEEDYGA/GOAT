# 🚀 Super LLM System

## Overview

A revolutionary AI system that combines **215 LLMs from NVIDIA Build** into one intelligent, self-routing super LLM with automatic model selection, fallback mechanisms, and response aggregation.

## ✨ Features

- **Intelligent Model Routing** - Automatically selects the best model for each task based on query analysis
- **Multi-Model Ensemble** - Combines responses from multiple models for critical decisions
- **Automatic Fallback** - Graceful degradation when models are unavailable
- **Cost Optimization** - Routes to cost-effective models when appropriate
- **Performance Tracking** - Monitors model performance and reliability
- **Cross-Platform Support** - Works on Windows, macOS, and Linux
- **Offline Capabilities** - Portable distribution for disconnected environments

## 📋 Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [CLI Reference](#cli-reference)
5. [API Documentation](#api-documentation)
6. [Model Categories](#model-categories)
7. [Integration Guide](#integration-guide)
8. [Building Installers](#building-installers)

## 🔧 Installation

### Option 1: NPM Global Install

```bash
npm install -g super-llm
super-llm --help
```

### Option 2: From Source

```bash
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git
cd GOAT-Royalty-App/super-llm
npm install
npm link
```

### Option 3: Portable Distribution

Download the portable distribution for your platform:
- **Windows**: `super-llm-portable-windows.zip`
- **macOS**: `super-llm-portable-macos.zip`
- **Linux**: `super-llm-portable-linux.tar.gz`

Extract and run:
```bash
# Unix/macOS
./super-llm.sh query "Hello world"

# Windows
super-llm.bat query "Hello world"
```

## 🚀 Quick Start

### 1. Configure API Key

```bash
# Set environment variable
export NVIDIA_BUILD_API_KEY=your-api-key-here

# Or use the config command
super-llm config --api-key your-api-key-here
```

Get your API key from [NVIDIA Build](https://build.nvidia.com/).

### 2. Make Your First Query

```bash
# Simple query
super-llm query "Explain quantum computing"

# Code generation
super-llm code "Write a Python function to sort a list"

# Interactive chat
super-llm chat
```

### 3. Use in Code

```javascript
const SuperLLM = require('super-llm');

const llm = new SuperLLM({
  apiKey: process.env.NVIDIA_BUILD_API_KEY
});

// Simple query
const response = await llm.query("Explain quantum computing");
console.log(response.content);

// Task-specific routing
const codeResponse = await llm.query("Write a Python function", {
  task: 'code',
  model: 'auto'
});

// Multi-model ensemble
const ensembleResponse = await llm.ensembleQuery("Analyze this data", {
  models: ['gpt-4o', 'claude-opus-4', 'gemini-ultra']
});
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NVIDIA_BUILD_API_KEY` | Your NVIDIA Build API key | Required |
| `SUPER_LLM_DEFAULT_MODEL` | Default model to use | `auto` |
| `SUPER_LLM_CACHE` | Enable response caching | `true` |
| `SUPER_LLM_MAX_RETRIES` | Max retry attempts | `3` |
| `SUPER_LLM_TIMEOUT` | Request timeout (ms) | `60000` |

### Configuration File

Configuration is stored in `~/.super-llm/config.json`:

```json
{
  "apiKey": "your-api-key",
  "defaultModel": "auto",
  "enableCache": true,
  "maxRetries": 3,
  "timeout": 60000
}
```

## 📖 CLI Reference

### Query Command

```bash
super-llm query <prompt> [options]

Options:
  -m, --model <model>      Model to use (default: "auto")
  -t, --task <type>        Task type (code, reasoning, creative, math)
  -e, --ensemble           Use multi-model ensemble
  --models <models>        Comma-separated models for ensemble
  -o, --output <format>    Output format (text, json, markdown)
  --stream                 Stream the response
  --no-cache               Disable caching
```

### Code Command

```bash
super-llm code <prompt> [options]

Options:
  -l, --language <lang>    Programming language
  -m, --model <model>      Override model selection
  --explain                Include explanation
```

### Chat Command

```bash
super-llm chat [options]

Options:
  -m, --model <model>      Initial model (default: "auto")
  -s, --system <prompt>    System prompt
```

### Models Command

```bash
super-llm models [options]

Options:
  -c, --category <cat>     Filter by category
  --json                   Output as JSON
```

### Config Command

```bash
super-llm config [options]

Options:
  --api-key <key>          Set API key
  --default-model <model>  Set default model
  --enable-cache <bool>    Enable/disable cache
  --max-retries <num>      Set max retries
```

### Stats Command

```bash
super-llm stats [options]

Options:
  --reset                  Reset statistics
```

## 📚 API Documentation

### SuperLLM Class

```javascript
const SuperLLM = require('super-llm');

const llm = new SuperLLM({
  apiKey: 'your-api-key',           // NVIDIA Build API key
  defaultModel: 'auto',             // Default model
  maxRetries: 3,                    // Max retry attempts
  timeout: 60000,                   // Request timeout (ms)
  enableEnsemble: false,            // Enable ensemble mode
  trackPerformance: true,           // Track performance
  cacheEnabled: true                // Enable caching
});
```

### Methods

#### `query(prompt, options)`

Execute a single query with intelligent routing.

```javascript
const response = await llm.query("Your prompt", {
  model: 'auto',        // Model selection (auto, gpt-4o, etc.)
  task: 'code',         // Task type hint
  temperature: 0.7,     // Response randomness
  maxTokens: 2048,      // Max response length
  history: [],          // Conversation history
  system: '...',        // System prompt
  cache: true           // Use cache
});

console.log(response.content);
console.log(response.model);    // Model used
console.log(response.latency);  // Response time
```

#### `ensembleQuery(prompt, options)`

Query multiple models and aggregate responses.

```javascript
const response = await llm.ensembleQuery("Analyze this", {
  models: ['gpt-4o', 'claude-opus-4', 'gemini-ultra'],
  aggregation: 'best'  // 'first', 'longest', 'best', 'merge'
});
```

#### `streamQuery(prompt, options)`

Stream response in real-time.

```javascript
for await (const chunk of llm.streamQuery("Tell me a story")) {
  process.stdout.write(chunk.content);
}
```

#### `selectModel(prompt, options)`

Get the model that would be selected for a query.

```javascript
const model = llm.selectModel("Write Python code");
console.log(model.name);  // e.g., "DeepSeek Coder"
```

#### `getAvailableModels()`

List all available models.

```javascript
const models = llm.getAvailableModels();
// Returns array of { id, name, capabilities, contextWindow, ... }
```

#### `getPerformanceStats()`

Get performance statistics.

```javascript
const stats = llm.getPerformanceStats();
console.log(stats.queries);     // Total queries
console.log(stats.successRate); // Success rate
console.log(stats.avgLatency);  // Average latency
```

## 🏷️ Model Categories

The system includes 215+ models organized by capability:

### Code Generation (30+ models)
- DeepSeek-Coder, CodeLlama, StarCoder, Qwen-Coder
- Automatic selection based on language and complexity

### Reasoning (20+ models)
- GPT-4o, Claude Opus 4, o1-preview, Gemini Ultra
- For complex analysis and problem-solving

### Creative Writing (25+ models)
- Claude, GPT-4, Mistral Large, Llama 3
- For content creation and storytelling

### Mathematics (15+ models)
- Phi-3, Llama 3, GPT-4, Claude
- For calculations and mathematical reasoning

### Multilingual (40+ models)
- Qwen, Aya, BLOOM, XGLM
- For translations and multilingual tasks

### Specialized (85+ models)
- Medical, Legal, Financial, Scientific models
- Domain-specific expertise

## 🔌 Integration Guide

### GOAT Royalty App Integration

The Super LLM system integrates with GOAT Royalty App for enhanced royalty management:

```javascript
const GOATIntegration = require('super-llm/integrations/GOATIntegration');

const goatAI = new GOATIntegration({
  apiKey: process.env.NVIDIA_BUILD_API_KEY
});

// Analyze royalties
const analysis = await goatAI.analyzeRoyalties(royaltyData);

// Generate reports
const report = await goatAI.generateReport('revenue', data);

// Predict revenue
const prediction = await goatAI.predictRevenue(historicalData);
```

### Enhanced Autonomous Agent

Use the enhanced autonomous agent for complex workflows:

```javascript
const EnhancedAgent = require('super-llm/integrations/EnhancedAutonomousAgent');

const agent = new EnhancedAgent({
  apiKey: process.env.NVIDIA_BUILD_API_KEY,
  enableEnsemble: true
});

// Execute autonomous workflow
const result = await agent.executeWorkflow(
  "Analyze Q4 royalties and identify optimization opportunities"
);

// Interactive chat
const response = await agent.chat("What are the top earning artists?");
```

### Available Tools

The enhanced agent provides these AI-powered tools:

| Tool | Description | Category |
|------|-------------|----------|
| `analyzeRoyalties` | AI-powered royalty analysis | analysis |
| `analyzeContract` | Contract analysis with risk assessment | legal |
| `predictRevenue` | Revenue forecasting | analytics |
| `optimizeRevenue` | Revenue optimization recommendations | analytics |
| `generateReport` | Comprehensive report generation | reporting |
| `generateCommunication` | Artist communication generation | communication |
| `processPaymentRequest` | Natural language payment processing | payments |
| `ensembleAnalysis` | Multi-model critical analysis | analysis |

## 📦 Building Installers

### Windows EXE

```bash
# Prerequisites: NSIS installed
cd super-llm
npm run build:exe
```

Output: `dist/super-llm-setup.exe`

### macOS DMG

```bash
# Prerequisites: Xcode command line tools
cd super-llm
npm run build:dmg
```

Output: `dist/super-llm.dmg`

### Portable Distribution

```bash
cd super-llm
npm run build:portable
```

Output: `dist/super-llm-portable.zip`

### All Platforms

```bash
npm run build:all
```

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. Use environment variables or the config command
3. The config file is stored in `~/.super-llm/` with restricted permissions
4. API keys are never logged or exposed in error messages

## 🐛 Troubleshooting

### Common Issues

**"No API key configured"**
```bash
export NVIDIA_BUILD_API_KEY=your-key
# or
super-llm config --api-key your-key
```

**"Model not found"**
- Check available models with `super-llm models`
- Ensure your API key has access to the model

**"Request timeout"**
```bash
super-llm config --max-retries 5
# or increase timeout in code
```

**"Rate limit exceeded"**
- The system automatically retries with backoff
- Consider using caching: `super-llm config --enable-cache true`

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/DJSPEEDYGA/GOAT-Royalty-App/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DJSPEEDYGA/GOAT-Royalty-App/discussions)

---

**Built with ❤️ by DJSPEEDYGA**