/**
 * SUPER GOAT ROYALTIES - AI Configuration
 * Supports 3 modes:
 * 1. LOCAL MODE - 100% offline, no API, no login, no internet (DEFAULT)
 * 2. NVIDIA NIM - Cloud API with 215 LLM tools
 * 3. Google AI Studio - Gemini models
 * 
 * Local mode stores models on external drive (e.g., 10TB HDD)
 */

const path = require('path');
const fs = require('fs');

// Default local data path - can be changed to external drive
const DEFAULT_LOCAL_PATH = path.join(
    process.env.GOAT_DATA_PATH || 
    process.env.USERPROFILE || 
    process.env.HOME || 
    '.', 
    '.goat-royalties'
);

// Determine AI mode
// LOCAL_MODE=true forces local LLM (default when no API keys)
// LOCAL_MODE=false forces cloud API mode
let aiMode = 'local'; // default to local
let isDemoMode = false;

if (process.env.LOCAL_MODE === 'false' && process.env.NVIDIA_API_KEY) {
    aiMode = 'nvidia';
    isDemoMode = false;
    console.log('🚀 Running in NVIDIA NIM MODE - Cloud API with 215 LLM tools');
} else if (process.env.LOCAL_MODE === 'false' && process.env.GOOGLE_AI_STUDIO_KEY) {
    aiMode = 'google';
    isDemoMode = false;
    console.log('🚀 Running in GOOGLE AI MODE - Gemini models');
} else {
    // Local mode - completely offline
    aiMode = 'local';
    isDemoMode = false;
    console.log('💻 Running in LOCAL MODE - 100% offline, no API, no login, no internet');
    console.log('   Models stored at: ' + DEFAULT_LOCAL_PATH);
    console.log('   Set GOAT_DATA_PATH env var to use external drive (e.g., your 10TB HDD)');
}

module.exports = {
    // Demo Mode Flag
    demoMode: isDemoMode,

    // NVIDIA NIM Integration
    nvidia: {
        baseUrl: process.env.NVIDIA_NIM_URL || 'https://integrate.api.nvidia.com/v1',
        apiKey: process.env.NVIDIA_API_KEY,
        models: {
            // Llama Models
            'llama2-70b': 'meta/llama-2-70b-chat',
            'llama2-13b': 'meta/llama-2-13b-chat',
            'mixtral-8x7b': 'mistralai/mixtral-8x7b-instruct-v0.1',
            'nemotron-70b': 'nvidia/nemotron-4-340b-instruct',
            'phi-3': 'microsoft/phi-3-mini-128k-instruct',
            
            // Code Generation Models
            'codellama-34b': 'codellama/codellama-34b-instruct',
            'starcoder2': 'bigcode/starcoder2-15b',
            
            // Multimodal Models
            'nemo-multimodal': 'nvidia/nemotron-4-340b-multimodal',
            
            // Embedding Models
            'nv-embedqa': 'nvidia/nv-embedqa-e5-v5'
        }
    },

    // Google AI Studio Integration
    googleAI: {
        apiKey: process.env.GOOGLE_AI_STUDIO_KEY,
        models: {
            'gemini-pro': 'gemini-pro',
            'gemini-pro-vision': 'gemini-pro-vision',
            'gemini-ultra': 'gemini-ultra'
        }
    },

    // LangChain Configuration
    langchain: {
        temperature: 0.7,
        maxTokens: 2000,
        model: 'llama2-70b',
        enableStreaming: true
    },

    // RAG Configuration
    rag: {
        chunkSize: 1000,
        chunkOverlap: 200,
        maxRetrievalDocuments: 5,
        embeddingModel: 'nv-embedqa'
    },

    // Agent Configuration
    agents: {
        royaltyTracker: {
            model: 'mixtral-8x7b',
            tools: ['revenue-analyzer', 'platform-integrator', 'prediction-engine']
        },
        contentAdvisor: {
            model: 'llama2-70b',
            tools: ['market-analyzer', 'trend-detector', 'recommender']
        },
        contractAnalyst: {
            model: 'nemotron-70b',
            tools: ['legal-analyzer', 'compliance-checker', 'risk-assessor']
        },
        marketingAgent: {
            model: 'phi-3',
            tools: ['campaign-generator', 'seo-optimizer', 'content-creator']
        }
    },

    // Current AI Mode
    aiMode: aiMode,
    
    // Local LLM Configuration (100% offline)
    local: {
        enabled: true,
        dataPath: DEFAULT_LOCAL_PATH,
        modelsPath: path.join(DEFAULT_LOCAL_PATH, 'models'),
        contextPath: path.join(DEFAULT_LOCAL_PATH, 'context'),
        
        // Available local models (download manually to models folder)
        availableModels: {
            'llama-3-8b': {
                family: 'Llama',
                size: '8B',
                file: 'Llama-3-8B-Instruct.Q4_K_M.gguf',
                downloadUrl: 'https://huggingface.co/maziyarpanahi/Llama-3-8B-Instruct-GGUF',
                sizeGB: 4.9,
                recommended: true
            },
            'llama-3-70b': {
                family: 'Llama',
                size: '70B',
                file: 'Llama-3-70B-Instruct.Q4_K_M.gguf',
                downloadUrl: 'https://huggingface.co/maziyarpanahi/Llama-3-70B-Instruct-GGUF',
                sizeGB: 40,
                recommended: false
            },
            'mistral-7b': {
                family: 'Mistral',
                size: '7B',
                file: 'Mistral-7B-Instruct-v0.3.Q4_K_M.gguf',
                downloadUrl: 'https://huggingface.co/maziyarpanahi/Mistral-7B-Instruct-v0.3-GGUF',
                sizeGB: 4.4,
                recommended: true
            },
            'phi-3-mini': {
                family: 'Phi',
                size: '3.8B',
                file: 'Phi-3-mini-4k-instruct.Q4_K_M.gguf',
                downloadUrl: 'https://huggingface.co/maziyarpanahi/Phi-3-mini-4k-instruct-GGUF',
                sizeGB: 2.2,
                recommended: true
            },
            'phi-3-medium': {
                family: 'Phi',
                size: '14B',
                file: 'Phi-3-medium-4k-instruct.Q4_K_M.gguf',
                downloadUrl: 'https://huggingface.co/maziyarpanahi/Phi-3-medium-4k-instruct-GGUF',
                sizeGB: 12,
                recommended: false
            },
            'gemma-2-9b': {
                family: 'Gemma',
                size: '9B',
                file: 'gemma-2-9b-it.Q4_K_M.gguf',
                downloadUrl: 'https://huggingface.co/maziyarpanahi/gemma-2-9b-it-GGUF',
                sizeGB: 5.5,
                recommended: true
            },
            'qwen-2-7b': {
                family: 'Qwen',
                size: '7B',
                file: 'Qwen2-7B-Instruct.Q4_K_M.gguf',
                downloadUrl: 'https://huggingface.co/maziyarpanahi/Qwen2-7B-Instruct-GGUF',
                sizeGB: 4.4,
                recommended: false
            },
            'codellama-34b': {
                family: 'CodeLlama',
                size: '34B',
                file: 'CodeLlama-34b-Instruct.Q4_K_M.gguf',
                downloadUrl: 'https://huggingface.co/maziyarpanahi/CodeLlama-34b-Instruct-GGUF',
                sizeGB: 19,
                recommended: false
            },
            'deepseek-coder-33b': {
                family: 'DeepSeek',
                size: '33B',
                file: 'DeepSeek-Coder-33B-Instruct.Q4_K_M.gguf',
                downloadUrl: 'https://huggingface.co/maziyarpanahi/DeepSeek-Coder-33B-Instruct-GGUF',
                sizeGB: 18,
                recommended: false
            },
            'mixtral-8x7b': {
                family: 'Mixtral',
                size: '8x7B',
                file: 'mixtral-8x7b-instruct-v0.1.Q4_K_M.gguf',
                downloadUrl: 'https://huggingface.co/maziyarpanahi/Mixtral-8x7B-Instruct-v0.1-GGUF',
                sizeGB: 24,
                recommended: false
            }
        },
        
        // Default model settings
        defaultModel: 'phi-3-mini', // Small, fast, good quality
        
        // Inference settings
        inference: {
            temperature: 0.7,
            maxTokens: 4096,
            contextSize: 8192,
            threads: 4,
            gpuLayers: 0 // 0 = CPU only, higher = more GPU offload
        }
    },
    
    // Autonomous Features
    autonomous: {
        enabled: true,
        decisionConfidence: 0.85,
        autoOptimization: true,
        selfLearning: true
    }
};