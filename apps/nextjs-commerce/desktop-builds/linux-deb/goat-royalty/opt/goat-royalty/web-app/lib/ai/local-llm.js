/**
 * SUPER GOAT ROYALTIES - Local LLM Engine
 * 100% Offline, No API, No Login, No Internet Required
 * Models stored on user's external drive (e.g., 10TB HDD)
 * 
 * Supports: Llama, Mistral, Phi, Gemma, Qwen, and more
 * Engine: llama.cpp WebAssembly for cross-platform local inference
 */

const path = require('path');
const fs = require('fs');
const { EventEmitter } = require('events');

// Default paths - can be configured to use external drive
const DEFAULT_DATA_PATH = path.join(process.env.GOAT_DATA_PATH || path.join(process.env.USERPROFILE || process.env.HOME || '.', '.goat-royalties'));
const MODELS_DIR = 'models';
const CONTEXT_DIR = 'context';

class LocalLLMEngine extends EventEmitter {
    constructor(options = {}) {
        super();
        
        // Configuration
        this.dataPath = options.dataPath || DEFAULT_DATA_PATH;
        this.modelsPath = path.join(this.dataPath, MODELS_DIR);
        this.contextPath = path.join(this.dataPath, CONTEXT_DIR);
        
        // Model registry
        this.models = new Map();
        this.activeModel = null;
        this.loadedModel = null;
        
        // Inference settings
        this.config = {
            temperature: options.temperature || 0.7,
            maxTokens: options.maxTokens || 4096,
            contextSize: options.contextSize || 8192,
            threads: options.threads || 4,
            gpuLayers: options.gpuLayers || 0, // 0 = CPU only, higher = more GPU
            seed: options.seed || -1 // -1 = random
        };
        
        // Initialize
        this._initialize();
    }
    
    _initialize() {
        // Create directories if they don't exist
        [this.modelsPath, this.contextPath].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`[LocalLLM] Created directory: ${dir}`);
            }
        });
        
        // Scan for existing models
        this._scanModels();
        
        console.log(`[LocalLLM] Initialized with data path: ${this.dataPath}`);
        console.log(`[LocalLLM] Models directory: ${this.modelsPath}`);
        console.log(`[LocalLLM] Found ${this.models.size} model(s)`);

        // Emit ready event
        this.emit('ready', {
            dataPath: this.dataPath,
            modelsPath: this.modelsPath,
            modelCount: this.models.size
        });
    }
    
    _scanModels() {
        try {
            const files = fs.readdirSync(this.modelsPath);
            
            files.forEach(file => {
                if (file.endsWith('.gguf') || file.endsWith('.bin')) {
                    const modelInfo = this._parseModelFile(file);
                    this.models.set(modelInfo.id, modelInfo);
                }
            });
        } catch (error) {
            console.warn('[LocalLLM] Error scanning models:', error.message);
        }
    }
    
    _parseModelFile(filename) {
        const basename = path.basename(filename, path.extname(filename));
        const parts = basename.split('-');
        
        // Parse model info from filename
        let family = 'unknown';
        let size = 'unknown';
        let quantization = 'Q4_0';
        
        // Detect model family
        const familyMap = {
            'llama': 'Llama',
            'mistral': 'Mistral',
            'phi': 'Phi',
            'gemma': 'Gemma',
            'qwen': 'Qwen',
            'codellama': 'CodeLlama',
            'deepseek': 'DeepSeek',
            'mixtral': 'Mixtral',
            'starling': 'Starling',
            'openchat': 'OpenChat',
            'nous-hermes': 'Nous Hermes',
            'wizardlm': 'WizardLM',
            'vicuna': 'Vicuna',
            'orca': 'Orca',
            'phi-3': 'Phi-3',
            'phi3': 'Phi-3'
        };
        
        for (const [key, value] of Object.entries(familyMap)) {
            if (basename.toLowerCase().includes(key)) {
                family = value;
                break;
            }
        }
        
        // Detect size
        const sizeMatch = basename.match(/(\d+b|\d+x\d+b|\d+\.\d+b)/i);
        if (sizeMatch) {
            size = sizeMatch[1].toUpperCase();
        }
        
        // Detect quantization
        const quantMatch = basename.match(/(q\d_\d+|q\d|iq\d_\d+|k\d+s?)/i);
        if (quantMatch) {
            quantization = quantMatch[1].toUpperCase();
        }
        
        return {
            id: basename,
            filename: filename,
            path: path.join(this.modelsPath, filename),
            family: family,
            size: size,
            quantization: quantization,
            sizeBytes: fs.statSync(path.join(this.modelsPath, filename)).size,
            loaded: false
        };
    }
    
    // ============================================
    // MODEL MANAGEMENT
    // ============================================
    
    listModels() {
        return Array.from(this.models.values()).map(m => ({
            id: m.id,
            family: m.family,
            size: m.size,
            quantization: m.quantization,
            sizeGB: (m.sizeBytes / (1024 * 1024 * 1024)).toFixed(2),
            loaded: m.loaded
        }));
    }
    
    getModelInfo(modelId) {
        return this.models.get(modelId);
    }
    
    setDataPath(newPath) {
        // Change data path (e.g., to external drive)
        this.dataPath = newPath;
        this.modelsPath = path.join(newPath, MODELS_DIR);
        this.contextPath = path.join(newPath, CONTEXT_DIR);
        this._initialize();
        return this.dataPath;
    }
    
    getDataPath() {
        return {
            dataPath: this.dataPath,
            modelsPath: this.modelsPath,
            contextPath: this.contextPath,
            freeSpaceGB: this._getFreeSpace()
        };
    }
    
    _getFreeSpace() {
        try {
            // This is approximate - actual implementation would use platform-specific calls
            const stats = fs.statfsSync(this.dataPath);
            return (stats.bavail * stats.bsize / (1024 * 1024 * 1024)).toFixed(2);
        } catch {
            return 'unknown';
        }
    }
    
    // ============================================
    // MODEL DOWNLOAD (for offline setup)
    // ============================================
    
    getDownloadInstructions(modelName) {
        // Return instructions for manually downloading models
        // User can download on a connected machine, then transfer to external drive
        const modelSources = {
            'llama-3-8b': {
                url: 'https://huggingface.co/maziyarpanahi/Llama-3-8B-Instruct-GGUF',
                file: 'Llama-3-8B-Instruct.Q4_K_M.gguf',
                size: '4.9 GB'
            },
            'llama-3-70b': {
                url: 'https://huggingface.co/maziyarpanahi/Llama-3-70B-Instruct-GGUF',
                file: 'Llama-3-70B-Instruct.Q4_K_M.gguf',
                size: '40 GB'
            },
            'mistral-7b': {
                url: 'https://huggingface.co/maziyarpanahi/Mistral-7B-Instruct-v0.3-GGUF',
                file: 'Mistral-7B-Instruct-v0.3.Q4_K_M.gguf',
                size: '4.4 GB'
            },
            'phi-3-mini': {
                url: 'https://huggingface.co/maziyarpanahi/Phi-3-mini-4k-instruct-GGUF',
                file: 'Phi-3-mini-4k-instruct.Q4_K_M.gguf',
                size: '2.2 GB'
            },
            'phi-3-medium': {
                url: 'https://huggingface.co/maziyarpanahi/Phi-3-medium-4k-instruct-GGUF',
                file: 'Phi-3-medium-4k-instruct.Q4_K_M.gguf',
                size: '12 GB'
            },
            'gemma-2-9b': {
                url: 'https://huggingface.co/maziyarpanahi/gemma-2-9b-it-GGUF',
                file: 'gemma-2-9b-it.Q4_K_M.gguf',
                size: '5.5 GB'
            },
            'qwen-2-7b': {
                url: 'https://huggingface.co/maziyarpanahi/Qwen2-7B-Instruct-GGUF',
                file: 'Qwen2-7B-Instruct.Q4_K_M.gguf',
                size: '4.4 GB'
            },
            'codellama-34b': {
                url: 'https://huggingface.co/maziyarpanahi/CodeLlama-34b-Instruct-GGUF',
                file: 'CodeLlama-34b-Instruct.Q4_K_M.gguf',
                size: '19 GB'
            },
            'deepseek-coder-33b': {
                url: 'https://huggingface.co/maziyarpanahi/DeepSeek-Coder-33B-Instruct-GGUF',
                file: 'DeepSeek-Coder-33B-Instruct.Q4_K_M.gguf',
                size: '18 GB'
            },
            'mixtral-8x7b': {
                url: 'https://huggingface.co/maziyarpanahi/Mixtral-8x7B-Instruct-v0.1-GGUF',
                file: 'mixtral-8x7b-instruct-v0.1.Q4_K_M.gguf',
                size: '24 GB'
            }
        };
        
        const info = modelSources[modelName.toLowerCase()];
        if (info) {
            return {
                name: modelName,
                ...info,
                destination: this.modelsPath,
                instructions: `1. Download ${info.file} from ${info.url}\n2. Copy to: ${this.modelsPath}\n3. Restart the app to detect the model`
            };
        }
        
        return null;
    }
    
    listAvailableModels() {
        return Object.keys({
            'llama-3-8b': true,
            'llama-3-70b': true,
            'mistral-7b': true,
            'phi-3-mini': true,
            'phi-3-medium': true,
            'gemma-2-9b': true,
            'qwen-2-7b': true,
            'codellama-34b': true,
            'deepseek-coder-33b': true,
            'mixtral-8x7b': true
        });
    }
    
    // ============================================
    // INFERENCE (Simulated for demo, real impl uses llama.cpp)
    // ============================================
    
    async loadModel(modelId) {
        const model = this.models.get(modelId);
        if (!model) {
            throw new Error(`Model not found: ${modelId}`);
        }
        
        console.log(`[LocalLLM] Loading model: ${modelId}`);
        this.emit('loading', { modelId, path: model.path });
        
        // In a real implementation, this would initialize llama.cpp
        // For now, we simulate the loading
        await new Promise(resolve => setTimeout(resolve, 500));
        
        model.loaded = true;
        this.loadedModel = model;
        this.activeModel = modelId;
        
        console.log(`[LocalLLM] Model loaded: ${modelId}`);
        this.emit('loaded', { modelId, model });
        
        return {
            success: true,
            model: {
                id: model.id,
                family: model.family,
                size: model.size,
                quantization: model.quantization
            }
        };
    }
    
    async unloadModel() {
        if (this.loadedModel) {
            console.log(`[LocalLLM] Unloading model: ${this.loadedModel.id}`);
            this.loadedModel.loaded = false;
            this.loadedModel = null;
            this.activeModel = null;
            this.emit('unloaded', {});
        }
    }
    
    async generate(prompt, options = {}) {
        if (!this.loadedModel) {
            throw new Error('No model loaded. Call loadModel() first.');
        }
        
        const config = {
            ...this.config,
            ...options
        };
        
        console.log(`[LocalLLM] Generating response with ${this.activeModel}`);
        this.emit('generating', { prompt: prompt.substring(0, 100) + '...' });
        
        // In a real implementation, this would call llama.cpp
        // For demonstration, we return a simulated response
        const startTime = Date.now();
        
        // Simulate processing time based on prompt length
        await new Promise(resolve => setTimeout(resolve, Math.min(2000, prompt.length * 10)));
        
        const response = this._simulateResponse(prompt, config);
        
        const endTime = Date.now();
        
        const result = {
            text: response,
            model: this.activeModel,
            tokensGenerated: response.split(' ').length,
            tokensPerSecond: Math.round(response.split(' ').length / ((endTime - startTime) / 1000)),
            duration: endTime - startTime,
            config: {
                temperature: config.temperature,
                maxTokens: config.maxTokens
            }
        };
        
        this.emit('generated', result);
        return result;
    }
    
    async chat(messages, options = {}) {
        if (!this.loadedModel) {
            throw new Error('No model loaded. Call loadModel() first.');
        }
        
        const config = {
            ...this.config,
            ...options
        };
        
        console.log(`[LocalLLM] Chat completion with ${this.activeModel}`);
        this.emit('chatting', { messageCount: messages.length });
        
        // Format messages for the model
        const formattedPrompt = this._formatChatPrompt(messages);
        
        // Generate response
        const response = await this.generate(formattedPrompt, config);
        
        return {
            message: {
                role: 'assistant',
                content: response.text
            },
            ...response
        };
    }
    
    _formatChatPrompt(messages) {
        // Format messages for Llama-style chat
        let prompt = '<|begin_of_text|>';
        
        for (const msg of messages) {
            if (msg.role === 'system') {
                prompt += `<|start_header_id|>system<|end_header_id|>\n\n${msg.content}<|eot_id|>`;
            } else if (msg.role === 'user') {
                prompt += `<|start_header_id|>user<|end_header_id|>\n\n${msg.content}<|eot_id|>`;
            } else if (msg.role === 'assistant') {
                prompt += `<|start_header_id|>assistant<|end_header_id|>\n\n${msg.content}<|eot_id|>`;
            }
        }
        
        prompt += '<|start_header_id|>assistant<|end_header_id|>\n\n';
        
        return prompt;
    }
    
    _simulateResponse(prompt, config) {
        // Simulated responses for demonstration
        // In production, this would be actual llama.cpp inference
        
        const responses = {
            default: `I understand you're asking about: "${prompt.substring(0, 100)}..."\n\nAs a local AI running entirely on your machine with no internet connection, I can help you with:\n\n1. **Royalty Tracking** - Analyze your music revenue across platforms\n2. **Content Creation** - Generate lyrics, scripts, marketing copy\n3. **Code Assistance** - Help with programming and technical questions\n4. **Document Analysis** - Process contracts, reports, and documents\n5. **Creative Projects** - Brainstorm ideas and develop concepts\n\nAll processing happens locally on your computer - your data never leaves your machine.\n\nHow can I assist you today?`,
            
            royalty: `🎵 **Royalty Analysis Report**\n\nBased on the data you've provided, here's your revenue breakdown:\n\n**Streaming Revenue:**\n- Spotify: $X,XXX.XX\n- Apple Music: $X,XXX.XX\n- YouTube Music: $X,XXX.XX\n\n**Performance Royalties:**\n- ASCAP/BMI: $X,XXX.XX\n- SoundExchange: $X,XXX.XX\n\n**Sync & Licensing:**\n- Placements: $X,XXX.XX\n\n**Recommendations:**\n1. Focus on playlist placement for top-performing tracks\n2. Register all works with your PRO\n3. Consider sync licensing opportunities\n\nThis analysis was generated locally - your financial data never leaves your computer.`,
            
            code: `Here's a code solution for your request:\n\n\`\`\`javascript\n// Example implementation\nfunction processData(input) {\n    // Process the input data\n    const result = input.map(item => ({\n        ...item,\n        processed: true,\n        timestamp: Date.now()\n    }));\n    \n    return result;\n}\n\`\`\`\n\nThis code runs locally in your GOAT app. Let me know if you need modifications!`,
            
            creative: `✨ **Creative Output**\n\nHere's some creative content based on your request:\n\n---\n\nIn the rhythm of the night, where dreams take flight,\nEvery beat tells a story, every sound is light.\nFrom the studio to the stage, we write our own page,\nIn this game called life, we break every cage.\n\n---\n\nThis was generated locally by your AI. Want me to continue or try a different style?`
        };
        
        // Select response based on prompt content
        const promptLower = prompt.toLowerCase();
        if (promptLower.includes('royalt') || promptLower.includes('revenue') || promptLower.includes('streaming')) {
            return responses.royalty;
        } else if (promptLower.includes('code') || promptLower.includes('function') || promptLower.includes('program')) {
            return responses.code;
        } else if (promptLower.includes('creative') || promptLower.includes('write') || promptLower.includes('lyrics')) {
            return responses.creative;
        }
        
        return responses.default;
    }
    
    // ============================================
    // EMBEDDINGS (for RAG)
    // ============================================
    
    async embed(text) {
        if (!this.loadedModel) {
            throw new Error('No model loaded. Call loadModel() first.');
        }
        
        // Simulated embedding - in production, use actual model embeddings
        const dimensions = 768;
        const embedding = [];
        
        for (let i = 0; i < dimensions; i++) {
            embedding.push(Math.random() * 2 - 1);
        }
        
        return {
            embedding: embedding,
            dimensions: dimensions,
            model: this.activeModel
        };
    }
    
    // ============================================
    // CONFIGURATION
    // ============================================
    
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        return this.config;
    }
    
    getConfig() {
        return { ...this.config };
    }
    
    // ============================================
    // SYSTEM INFO
    // ============================================
    
    getSystemInfo() {
        return {
            platform: process.platform,
            arch: process.arch,
            cpus: require('os').cpus().length,
            totalMemoryGB: (require('os').totalmem() / (1024 * 1024 * 1024)).toFixed(2),
            dataPath: this.dataPath,
            modelsPath: this.modelsPath,
            modelsLoaded: this.models.size,
            activeModel: this.activeModel,
            config: this.config
        };
    }
}

// Singleton instance
let instance = null;

function getLocalLLM(options = {}) {
    if (!instance) {
        instance = new LocalLLMEngine(options);
    }
    return instance;
}

module.exports = {
    LocalLLMEngine,
    getLocalLLM,
    DEFAULT_DATA_PATH
};