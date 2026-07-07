/**
 * Jetson AGX Orin 64GB Deployment Module for GOAT Royalty App
 * Optimized for edge AI inference with unified memory architecture
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class JetsonDeployer {
    constructor() {
        this.jetsonConfig = {
            model: 'Jetson AGX Orin 64GB',
            architecture: 'ARM64 (aarch64)',
            os: 'Ubuntu Linux (L4T)',
            unifiedMemory: 64, // GB shared CPU+GPU
            gpuCores: 2048, // Ampere architecture
            cpuCores: 12, // ARM Cortex-A78AE
            powerModes: {
                '15W': { cpus: 2, freq: '1.5GHz', gpuFreq: '300MHz' },
                '30W': { cpus: 6, freq: '2.0GHz', gpuFreq: '600MHz' },
                '60W': { cpus: 12, freq: '2.2GHz', gpuFreq: '1000MHz' },
                'MAX': { cpus: 12, freq: '2.2GHz', gpuFreq: '1300MHz' }
            }
        };

        // Models optimized for 64GB unified memory
        this.recommendedModels = {
            // Large reasoning models (fits in 64GB)
            '70b-reasoning': {
                name: 'deepseek-r1:70b',
                size: 42,
                quantization: 'Q4_K_M',
                contextWindow: 131072,
                useCase: 'Complex reasoning, code, analysis',
                performance: '~8-12 tok/s'
            },
            'llama3-70b': {
                name: 'llama3:70b-instruct-q4',
                size: 40,
                quantization: 'Q4_K_M',
                contextWindow: 8192,
                useCase: 'General purpose, conversations',
                performance: '~10-15 tok/s'
            },
            // Mid-size models (faster inference)
            'qwen-32b': {
                name: 'qwen2.5:32b-instruct-q4',
                size: 20,
                quantization: 'Q4_K_M',
                contextWindow: 32768,
                useCase: 'Fast chat, code assistance',
                performance: '~25-35 tok/s'
            },
            'codestral-22b': {
                name: 'codestral:22b-q8',
                size: 16,
                quantization: 'Q8_0',
                contextWindow: 32768,
                useCase: 'Code completion',
                performance: '~40-50 tok/s'
            },
            // Small fast models
            'llama3-8b': {
                name: 'llama3:8b-instruct-q8',
                size: 8,
                quantization: 'Q8_0',
                contextWindow: 8192,
                useCase: 'Fast responses, simple tasks',
                performance: '~80-100 tok/s'
            }
        };
    }

    /**
     * Setup Jetson for LLM inference
     */
    async setupJetson() {
        console.log('🚀 Setting up Jetson AGX Orin 64GB for GOAT App...\n');

        const steps = [
            { name: 'Check JetPack installation', cmd: 'dpkg -l | grep nvidia-jetpack' },
            { name: 'Check CUDA installation', cmd: 'nvcc --version' },
            { name: 'Check jtop (GPU monitor)', cmd: 'which jtop' },
            { name: 'Check memory status', cmd: 'free -h' }
        ];

        const results = [];
        for (const step of steps) {
            try {
                const result = await this.execCommand(step.cmd);
                results.push({ step: step.name, status: 'OK', output: result });
                console.log(`✅ ${step.name}: OK`);
            } catch (error) {
                results.push({ step: step.name, status: 'MISSING', error: error.message });
                console.log(`❌ ${step.name}: MISSING`);
            }
        }

        return results;
    }

    /**
     * Install required packages for GOAT App on Jetson
     */
    getInstallCommands() {
        return {
            jetpack: 'sudo apt update && sudo apt install -y nvidia-jetpack',
            jtop: 'sudo apt install -y python3-pip && sudo pip3 install -U jetson-stats',
            nodejs: 'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs',
            ollama: 'curl -fsSL https://ollama.com/install.sh | sh',
            cudaEnv: `
# Add to ~/.profile
export PATH="/usr/local/cuda/bin:$PATH"
export LD_LIBRARY_PATH="/usr/local/cuda/lib64:$LD_LIBRARY_PATH"
`
        };
    }

    /**
     * Set Jetson power mode
     */
    async setPowerMode(mode = '60W') {
        return new Promise((resolve, reject) => {
            exec(`sudo nvpmodel -m ${mode}`, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Failed to set power mode: ${error.message}`));
                    return;
                }
                resolve({
                    success: true,
                    mode: mode,
                    message: `Power mode set to ${mode}`
                });
            });
        });
    }

    /**
     * Get current Jetson status using jtop
     */
    async getStatus() {
        try {
            // jtop provides comprehensive GPU/CPU/memory stats
            const result = await this.execCommand('jtop --json');
            return JSON.parse(result);
        } catch {
            // Fallback to basic commands
            const memInfo = await this.execCommand('free -h');
            const cpuInfo = await this.execCommand('lscpu | grep -E "Model name|CPU\\(s\\)|CPU MHz"');
            
            return {
                memory: memInfo,
                cpu: cpuInfo
            };
        }
    }

    /**
     * Get optimal LLM configuration for Jetson
     */
    getLLMConfig(modelKey = 'qwen-32b') {
        const model = this.recommendedModels[modelKey];
        if (!model) {
            return { error: 'Model not found. Available: ' + Object.keys(this.recommendedModels).join(', ') };
        }

        return {
            model: model,
            installCommand: `ollama pull ${model.name}`,
            runCommand: `ollama run ${model.name}`,
            // Jetson uses same memory for CPU and GPU, so no tensor split needed
            environmentVariables: {
                // Optimize for Jetson's unified memory
                OLLAMA_MAX_LOADED_MODELS: '1',
                OLLAMA_NUM_GPU: '1',
                // Use all available memory
                CUDA_VISIBLE_DEVICES: '0'
            },
            expectedPerformance: model.performance,
            memoryUsage: `${model.size}GB of 64GB unified memory`
        };
    }

    /**
     * Generate Docker deployment for Jetson
     */
    getDockerConfig() {
        return {
            dockerfile: `# GOAT App for Jetson AGX Orin 64GB
FROM dustynv/jetson-inference:r36.2.0

# Install Node.js for ARM64
RUN apt-get update && apt-get install -y curl \\
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \\
    && apt-get install -y nodejs \\
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set CUDA environment
ENV PATH="/usr/local/cuda/bin:$PATH"
ENV LD_LIBRARY_PATH="/usr/local/cuda/lib64:$LD_LIBRARY_PATH"

# Copy GOAT App
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

# Expose ports
EXPOSE 3000 11434

# Start command
CMD ["node", "server.js"]
`,
            dockerCompose: `version: '3.8'
services:
  goat-app:
    build: .
    ports:
      - "3000:3000"
      - "11434:11434"
    volumes:
      - ./data:/app/data
      - ollama-models:/root/.ollama
    environment:
      - NODE_ENV=production
      - JETSON_MODE=64GB
    deploy:
      resources:
        reservations:
          memory: 58G  # Leave some for OS

volumes:
  ollama-models:
`
        };
    }

    /**
     * Get startup script for GOAT App on Jetson
     */
    getStartupScript() {
        return `#!/bin/bash
# GOAT App Startup Script for Jetson AGX Orin 64GB

echo "🚀 Starting GOAT Royalty App on Jetson AGX Orin 64GB..."

# Set power mode to MAX for best performance
echo "Setting power mode to MAX performance..."
sudo nvpmodel -m MAX

# Maximize GPU/CPU clocks
echo "Maximizing clock speeds..."
sudo jetson_clocks

# Start Ollama service if not running
if ! pgrep -x "ollama" > /dev/null; then
    echo "Starting Ollama service..."
    ollama serve &
    sleep 5
fi

# Load default model if not loaded
echo "Checking models..."
if ! ollama list | grep -q "qwen2.5:32b"; then
    echo "Pulling recommended model (qwen2.5:32b)..."
    ollama pull qwen2.5:32b-instruct-q4
fi

# Start GOAT App
echo "Starting GOAT Royalty App..."
cd /app
node server.js

echo "✅ GOAT App is running on http://localhost:3000"
`;
    }

    /**
     * Get benchmark script for Jetson
     */
    getBenchmarkScript() {
        return `#!/bin/bash
# Jetson AGX Orin 64GB Benchmark Script

echo "📊 Running Jetson AGX Orin 64GB Benchmark..."
echo "============================================"

# System Info
echo -e "\n🖥️  System Information:"
echo "Model: $(cat /sys/firmware/devicetree/base/model 2>/dev/null || echo 'Jetson AGX Orin')"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "CUDA: $(nvcc --version | grep release | awk '{print $5}')"

# Memory Info
echo -e "\n💾 Memory Information:"
free -h

# GPU Status (using jtop if available)
echo -e "\n🎮 GPU Status:"
if command -v jtop &> /dev/null; then
    jtop --json 2>/dev/null | head -50
else
    echo "Install jtop for GPU stats: sudo pip3 install jetson-stats"
fi

# Power Mode
echo -e "\n⚡ Current Power Mode:"
sudo nvpmodel -q

# Clock Speeds
echo -e "\n⏱️  Clock Speeds:"
sudo jetson_clocks --show

# Temperature
echo -e "\n🌡️  Temperature:"
cat /sys/devices/virtual/thermal/thermal_zone*/temp 2>/dev/null | while read temp; do
    echo "$((temp/1000))°C"
done

# Run Ollama benchmark
echo -e "\n🤖 LLM Benchmark (Ollama):"
if command -v ollama &> /dev/null; then
    echo "Testing qwen2.5:32b..."
    time (echo "What is 2+2? Answer briefly." | ollama run qwen2.5:32b-instruct-q4 2>/dev/null)
else
    echo "Ollama not installed. Install with: curl -fsSL https://ollama.com/install.sh | sh"
fi

echo -e "\n✅ Benchmark complete!"
`;
    }

    /**
     * Helper: Execute command
     */
    execCommand(cmd) {
        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(error.message));
                    return;
                }
                resolve(stdout.trim());
            });
        });
    }
}

// Export
module.exports = { JetsonDeployer };

// CLI usage
if (require.main === module) {
    const deployer = new JetsonDeployer();
    
    console.log('🚀 GOAT App - Jetson AGX Orin 64GB Deployment');
    console.log('============================================\n');
    
    console.log('📋 Setup Commands:');
    console.log(JSON.stringify(deployer.getInstallCommands(), null, 2));
    
    console.log('\n🤖 Recommended Models for 64GB Unified Memory:');
    console.log(JSON.stringify(deployer.recommendedModels, null, 2));
    
    console.log('\n📝 Startup Script:');
    console.log(deployer.getStartupScript());
}