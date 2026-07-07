#!/bin/bash

echo "🚀 Setting up GOAT Royalty App Locally..."
echo "=========================================="

# Step 1: Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Step 2: Install mining dependencies
echo "⛏️  Installing mining dependencies..."
npm install axios node-fetch jsdom cheerio stripe

# Step 3: Create data directories
echo "📁 Creating data directories..."
mkdir -p data/llms
mkdir -p data/models
mkdir -p data/knowledge
mkdir -p logs

# Step 4: Download LLM Models
echo "🧠 Downloading LLM models..."
echo "This may take a while..."

# Download model configurations
cat > data/llms/model-config.json <<EOF
{
  "models": {
    "llama": {
      "name": "LLaMA",
      "size": "7B",
      "type": "text-generation"
    },
    "mistral": {
      "name": "Mistral",
      "size": "7B",
      "type": "text-generation"
    },
    "qwen": {
      "name": "Qwen",
      "size": "7B",
      "type": "text-generation"
    }
  }
}
EOF

# Step 5: Create knowledge base
echo "📚 Creating knowledge base..."
cat > data/knowledge/mining-guide.txt <<EOF
# Crypto Mining Guide for GOAT Royalty

## Supported Pools:
- F2Pool: https://f2pool.com
- ViaBTC: https://viabtc.com
- Poolin: https://poolin.com
- ZergPool: https://zergpool.com

## Setup Instructions:
1. Configure your wallet address
2. Connect mining rig to pool
3. Monitor via dashboard
EOF

# Step 6: Setup Ollama (if available)
echo "🔌 Checking for Ollama..."
if command -v ollama &> /dev/null; then
    echo "✅ Ollama found - downloading models..."
    ollama pull llama2
    ollama pull mistral
    ollama pull qwen
else
    echo "⚠️  Ollama not found - install from https://ollama.ai"
fi

# Step 7: Create startup script
echo "📝 Creating startup script..."
cat > start.sh <<'EOF'
#!/bin/bash
echo "🚀 Starting GOAT Royalty App..."
node src/server.js
EOF

chmod +x start.sh

# Step 8: Configuration
echo "⚙️  Setting up configuration..."
cat > .env.local <<EOF
PORT=5001
NODE_ENV=development
DATA_DIR=./data
EOF

echo ""
echo "✅ Setup Complete!"
echo "=========================================="
echo "📁 Installation directory: $(pwd)"
echo "🚀 To start the app, run: ./start.sh"
echo "🌐 Dashboard will be at: http://localhost:5001/crypto-mining.html"
echo ""
echo "📊 Quick Start Commands:"
echo "  • Start server:       node src/server.js"
echo "  • View dashboard:     http://localhost:5001/crypto-mining.html"
echo "  • Check API health:   http://localhost:5001/health"
echo "  • View pool data:     http://localhost:5001/api/pool/dashboard"
echo ""