# Super LLM Quick Start Guide

Get up and running with Super LLM in 5 minutes.

## 1. Install

```bash
# macOS/Linux
curl -fsSL https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/super-llm/install/install-super-llm.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/super-llm/install/install-super-llm.ps1 | iex

# Or via NPM
npm install -g super-llm
```

## 2. Configure

```bash
# Set your NVIDIA Build API key
super-llm config --api-key nvapi-xxxxx
```

Don't have an API key? Get one free at [build.nvidia.com](https://build.nvidia.com/).

## 3. Use

```bash
# Ask a question
super-llm query "What is machine learning?"

# Generate code
super-llm code "Write a Python function to calculate fibonacci"

# Start interactive chat
super-llm chat

# List available models
super-llm models
```

## 4. Integrate

```javascript
const SuperLLM = require('super-llm');

const llm = new SuperLLM();

// Simple query
const response = await llm.query("Hello!");
console.log(response.content);

// Code generation
const code = await llm.query("Write Python code to sort a list", {
  task: 'code'
});

// Multi-model ensemble
const analysis = await llm.ensembleQuery("Analyze this data", {
  models: ['gpt-4o', 'claude-opus-4']
});
```

## 5. Explore

- **CLI Commands**: `super-llm --help`
- **Models**: `super-llm models`
- **Stats**: `super-llm stats`
- **Config**: `super-llm config`

## Common Use Cases

### Royalty Analysis

```bash
super-llm query "Analyze royalty trends for Q4 2024"
```

### Contract Review

```bash
super-llm query "Review this contract clause for potential risks"
```

### Report Generation

```bash
super-llm query "Generate a monthly revenue report summary"
```

### Code Generation

```bash
super-llm code "Create a REST API endpoint in Node.js"
```

## Tips

1. **Use `auto` model selection** - The system automatically picks the best model
2. **Enable caching** - Reduces API calls and costs
3. **Use streaming** - For long responses, use `--stream`
4. **Check stats** - Monitor your usage with `super-llm stats`

## Need Help?

- 📖 [Full Documentation](../README.md)
- 🔧 [Installation Guide](./INSTALLATION.md)
- 🐛 [Report Issues](https://github.com/DJSPEEDYGA/GOAT-Royalty-App/issues)
- 💬 [Discord](https://discord.gg/clawd)