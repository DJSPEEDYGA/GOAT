/**
 * SUPER GOAT ROYALTIES - HuggingFace Inference Client
 * Universal client supporting 16 inference providers + local runners
 * Supports: Groq, Cerebras, SambaNova, Together AI, Fireworks, Novita,
 *           Replicate, Cohere, Scaleway, Hyperbolic, fal, Featherless,
 *           Nscale, HF Inference API, Ollama, vLLM
 */

const axios = require('axios');

class HFInferenceClient {
    constructor() {
        this.providers = {
            groq: {
                name: 'Groq',
                baseUrl: 'https://api.groq.com/openai/v1',
                apiKeyEnv: 'GROQ_API_KEY',
                icon: '⚡',
                color: '#f55036',
                description: 'Ultra-fast LPU inference engine',
                speed: 'ultra-fast',
                specialty: 'Low-latency inference',
                format: 'openai',
                models: [
                    'meta-llama/Llama-3.3-70B-Instruct',
                    'meta-llama/Llama-3.1-8B-Instruct',
                    'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
                    'google/gemma-2-9b-it',
                    'mistralai/Mixtral-8x7B-Instruct-v0.1',
                    'Qwen/Qwen2.5-72B-Instruct',
                    'Qwen/QwQ-32B'
                ]
            },
            cerebras: {
                name: 'Cerebras',
                baseUrl: 'https://api.cerebras.ai/v1',
                apiKeyEnv: 'CEREBRAS_API_KEY',
                icon: '🧠',
                color: '#ff6600',
                description: 'Wafer-scale AI inference at record speeds',
                speed: 'ultra-fast',
                specialty: 'Wafer-scale inference',
                format: 'openai',
                models: [
                    'meta-llama/Llama-3.3-70B-Instruct',
                    'meta-llama/Llama-3.1-8B-Instruct',
                    'Qwen/Qwen2.5-32B-Instruct'
                ]
            },
            sambanova: {
                name: 'SambaNova',
                baseUrl: 'https://api.sambanova.ai/v1',
                apiKeyEnv: 'SAMBANOVA_API_KEY',
                icon: '🔥',
                color: '#ff4500',
                description: 'Enterprise-grade AI platform with RDU architecture',
                speed: 'fast',
                specialty: 'Enterprise AI',
                format: 'openai',
                models: [
                    'meta-llama/Llama-3.3-70B-Instruct',
                    'meta-llama/Llama-3.1-405B-Instruct',
                    'deepseek-ai/DeepSeek-V3-0324',
                    'Qwen/Qwen3-235B-A22B'
                ]
            },
            together: {
                name: 'Together AI',
                baseUrl: 'https://api.together.xyz/v1',
                apiKeyEnv: 'TOGETHER_API_KEY',
                icon: '🤝',
                color: '#3b82f6',
                description: 'Leading open-source model hosting platform',
                speed: 'fast',
                specialty: 'Open-source model hosting',
                format: 'openai',
                models: [
                    'meta-llama/Llama-3.3-70B-Instruct',
                    'meta-llama/Llama-3.1-405B-Instruct',
                    'deepseek-ai/DeepSeek-R1',
                    'deepseek-ai/DeepSeek-V3',
                    'Qwen/Qwen2.5-72B-Instruct',
                    'mistralai/Mixtral-8x22B-Instruct-v0.1',
                    'google/gemma-2-27b-it',
                    'NousResearch/Hermes-3-Llama-3.1-405B',
                    'Qwen/Qwen2.5-Coder-32B-Instruct'
                ]
            },
            fireworks: {
                name: 'Fireworks AI',
                baseUrl: 'https://api.fireworks.ai/inference/v1',
                apiKeyEnv: 'FIREWORKS_API_KEY',
                icon: '🎆',
                color: '#ef4444',
                description: 'Fastest production-grade inference platform',
                speed: 'fast',
                specialty: 'Optimized inference',
                format: 'openai',
                models: [
                    'meta-llama/Llama-3.3-70B-Instruct',
                    'meta-llama/Llama-3.1-405B-Instruct',
                    'deepseek-ai/DeepSeek-V3-0324',
                    'Qwen/Qwen2.5-72B-Instruct',
                    'mistralai/Mistral-Small-3.1-24B-Instruct-2503'
                ]
            },
            novita: {
                name: 'Novita AI',
                baseUrl: 'https://api.novita.ai/v3/openai',
                apiKeyEnv: 'NOVITA_API_KEY',
                icon: '✨',
                color: '#8b5cf6',
                description: 'Multi-modal AI inference with GPU cloud',
                speed: 'standard',
                specialty: 'Multi-modal inference',
                format: 'openai',
                models: [
                    'meta-llama/Llama-3.3-70B-Instruct',
                    'deepseek-ai/DeepSeek-R1',
                    'Qwen/Qwen2.5-72B-Instruct',
                    'microsoft/phi-4'
                ]
            },
            replicate: {
                name: 'Replicate',
                baseUrl: 'https://api.replicate.com/v1',
                apiKeyEnv: 'REPLICATE_API_KEY',
                icon: '🔄',
                color: '#10b981',
                description: 'Run and fine-tune open-source models at scale',
                speed: 'standard',
                specialty: 'Model marketplace',
                format: 'replicate',
                models: [
                    'meta-llama/Llama-3.3-70B-Instruct',
                    'black-forest-labs/FLUX.1-schnell',
                    'black-forest-labs/FLUX.1-dev',
                    'stability-ai/sdxl'
                ]
            },
            cohere: {
                name: 'Cohere',
                baseUrl: 'https://api.cohere.com/v2',
                apiKeyEnv: 'COHERE_API_KEY',
                icon: '💎',
                color: '#6366f1',
                description: 'Enterprise NLP with best-in-class RAG capabilities',
                speed: 'fast',
                specialty: 'RAG & enterprise NLP',
                format: 'cohere',
                models: [
                    'CohereForAI/c4ai-command-r-plus',
                    'CohereForAI/c4ai-command-r-v01'
                ]
            },
            scaleway: {
                name: 'Scaleway',
                baseUrl: 'https://api.scaleway.ai/v1',
                apiKeyEnv: 'SCALEWAY_API_KEY',
                icon: '🇪🇺',
                color: '#7c3aed',
                description: 'European sovereign cloud AI inference',
                speed: 'standard',
                specialty: 'European cloud AI',
                format: 'openai',
                models: [
                    'meta-llama/Llama-3.3-70B-Instruct',
                    'Qwen/Qwen2.5-72B-Instruct',
                    'mistralai/Mistral-Small-3.1-24B-Instruct-2503'
                ]
            },
            hyperbolic: {
                name: 'Hyperbolic',
                baseUrl: 'https://api.hyperbolic.xyz/v1',
                apiKeyEnv: 'HYPERBOLIC_API_KEY',
                icon: '🌀',
                color: '#06b6d4',
                description: 'Affordable GPU cloud for open-source AI',
                speed: 'fast',
                specialty: 'Affordable GPU inference',
                format: 'openai',
                models: [
                    'meta-llama/Llama-3.3-70B-Instruct',
                    'deepseek-ai/DeepSeek-R1',
                    'Qwen/Qwen2.5-72B-Instruct',
                    'meta-llama/Llama-3.1-405B-Instruct'
                ]
            },
            fal: {
                name: 'fal.ai',
                baseUrl: 'https://fal.run',
                apiKeyEnv: 'FAL_API_KEY',
                icon: '🎨',
                color: '#f59e0b',
                description: 'Fastest platform for image & video generation',
                speed: 'fast',
                specialty: 'Image & video generation',
                format: 'openai',
                models: [
                    'black-forest-labs/FLUX.1-schnell',
                    'black-forest-labs/FLUX.1-dev',
                    'fal-ai/fast-sdxl'
                ]
            },
            featherless: {
                name: 'Featherless AI',
                baseUrl: 'https://api.featherless.ai/v1',
                apiKeyEnv: 'FEATHERLESS_API_KEY',
                icon: '🪶',
                color: '#d946ef',
                description: 'Serverless inference for any HuggingFace model',
                speed: 'fast',
                specialty: 'Serverless inference',
                format: 'openai',
                models: [
                    'meta-llama/Llama-3.3-70B-Instruct',
                    'mistralai/Mistral-Small-3.1-24B-Instruct-2503',
                    'NousResearch/Hermes-3-Llama-3.1-70B'
                ]
            },
            nscale: {
                name: 'Nscale',
                baseUrl: 'https://inference.api.nscale.com/v1',
                apiKeyEnv: 'NSCALE_API_KEY',
                icon: '📐',
                color: '#0ea5e9',
                description: 'Scalable GPU inference infrastructure',
                speed: 'standard',
                specialty: 'Scalable inference',
                format: 'openai',
                models: [
                    'meta-llama/Llama-3.3-70B-Instruct',
                    'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
                    'Qwen/Qwen2.5-72B-Instruct'
                ]
            },
            'hf-inference': {
                name: 'HF Inference API',
                baseUrl: 'https://api-inference.huggingface.co',
                apiKeyEnv: 'HF_TOKEN',
                icon: '🤗',
                color: '#fbbf24',
                description: 'Official HuggingFace serverless inference API',
                speed: 'standard',
                specialty: 'Official HF Inference API',
                format: 'hf',
                models: [
                    'meta-llama/Llama-3.3-70B-Instruct',
                    'mistralai/Mistral-Small-3.1-24B-Instruct-2503',
                    'google/gemma-3-27b-it',
                    'Qwen/Qwen2.5-72B-Instruct',
                    'openai/whisper-large-v3',
                    'BAAI/bge-large-en-v1.5'
                ]
            },
            ollama: {
                name: 'Ollama',
                baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
                apiKeyEnv: null,
                icon: '🦙',
                color: '#22c55e',
                description: 'Run LLMs locally - no cloud needed',
                speed: 'variable',
                specialty: 'Local inference',
                format: 'ollama',
                models: [
                    'llama3.3:70b', 'llama3.1:8b', 'qwen2.5:72b',
                    'deepseek-r1:70b', 'gemma3:27b', 'mistral-small:24b',
                    'phi4:14b', 'codellama:34b'
                ]
            },
            vllm: {
                name: 'vLLM',
                baseUrl: process.env.VLLM_URL || 'http://localhost:8000',
                apiKeyEnv: null,
                icon: '🚄',
                color: '#a855f7',
                description: 'High-throughput local LLM serving engine',
                speed: 'fast',
                specialty: 'High-throughput local serving',
                format: 'openai',
                models: []
            }
        };

        // Usage tracking
        this.usage = {
            totalRequests: 0,
            byProvider: {},
            errors: 0
        };

        // Auto-routing priority map: model family → preferred providers (ordered)
        this.routingPriority = {
            'llama': ['groq', 'cerebras', 'together', 'fireworks', 'sambanova', 'hyperbolic', 'featherless', 'nscale', 'hf-inference'],
            'qwen': ['together', 'fireworks', 'groq', 'hyperbolic', 'novita', 'scaleway', 'nscale', 'hf-inference'],
            'deepseek': ['together', 'fireworks', 'sambanova', 'novita', 'hyperbolic', 'nscale', 'hf-inference'],
            'gemma': ['groq', 'together', 'hf-inference'],
            'mistral': ['together', 'fireworks', 'scaleway', 'featherless', 'hf-inference'],
            'mixtral': ['groq', 'together', 'fireworks'],
            'phi': ['novita', 'together', 'hf-inference'],
            'hermes': ['together', 'featherless'],
            'command-r': ['cohere'],
            'flux': ['fal', 'replicate'],
            'sdxl': ['fal', 'replicate'],
            'whisper': ['hf-inference'],
            'bge': ['hf-inference']
        };
    }

    // ==================== PROVIDER INFO ====================

    getAvailableProviders() {
        return Object.entries(this.providers).map(([id, p]) => ({
            id,
            name: p.name,
            icon: p.icon,
            color: p.color,
            description: p.description,
            speed: p.speed,
            specialty: p.specialty,
            format: p.format,
            modelCount: p.models.length,
            hasApiKey: p.apiKeyEnv ? !!process.env[p.apiKeyEnv] : true,
            isLocal: ['ollama', 'vllm'].includes(id)
        }));
    }

    getProviderInfo(providerId) {
        const p = this.providers[providerId];
        if (!p) return null;
        return {
            id: providerId,
            name: p.name,
            icon: p.icon,
            color: p.color,
            description: p.description,
            speed: p.speed,
            specialty: p.specialty,
            format: p.format,
            baseUrl: p.baseUrl,
            models: p.models,
            hasApiKey: p.apiKeyEnv ? !!process.env[p.apiKeyEnv] : true,
            isLocal: ['ollama', 'vllm'].includes(providerId)
        };
    }

    // ==================== CHAT COMPLETION ====================

    async chatCompletion(messages, model, providerId, options = {}) {
        const provider = this.providers[providerId];
        if (!provider) {
            throw new Error(`Unknown provider: ${providerId}`);
        }

        // Demo mode
        if (!provider.apiKeyEnv || (!process.env[provider.apiKeyEnv] && !['ollama', 'vllm'].includes(providerId))) {
            return this._demoResponse(messages, model, providerId);
        }

        this.usage.totalRequests++;
        this.usage.byProvider[providerId] = (this.usage.byProvider[providerId] || 0) + 1;

        try {
            switch (provider.format) {
                case 'openai':
                    return await this._openAIFormatRequest(provider, model, messages, options);
                case 'cohere':
                    return await this._cohereFormatRequest(provider, model, messages, options);
                case 'replicate':
                    return await this._replicateFormatRequest(provider, model, messages, options);
                case 'ollama':
                    return await this._ollamaFormatRequest(provider, model, messages, options);
                case 'hf':
                    return await this._hfFormatRequest(provider, model, messages, options);
                default:
                    return await this._openAIFormatRequest(provider, model, messages, options);
            }
        } catch (error) {
            this.usage.errors++;
            throw error;
        }
    }

    // ==================== API FORMAT HANDLERS ====================

    async _openAIFormatRequest(provider, model, messages, options) {
        const apiKey = process.env[provider.apiKeyEnv];
        const response = await axios.post(
            `${provider.baseUrl}/chat/completions`,
            {
                model: model,
                messages: messages,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.maxTokens ?? 2000,
                top_p: options.topP ?? 0.9,
                stream: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: options.timeout ?? 30000
            }
        );

        const choice = response.data.choices?.[0];
        return {
            content: choice?.message?.content || '',
            model: response.data.model || model,
            provider: provider.name,
            usage: response.data.usage || {},
            finishReason: choice?.finish_reason
        };
    }

    async _cohereFormatRequest(provider, model, messages, options) {
        const apiKey = process.env[provider.apiKeyEnv];
        
        // Convert messages to Cohere format
        const chatHistory = [];
        let lastMessage = '';
        
        for (const msg of messages) {
            if (msg.role === 'user') {
                lastMessage = msg.content;
            } else if (msg.role === 'assistant') {
                chatHistory.push({ role: 'CHATBOT', message: msg.content });
            } else if (msg.role === 'system') {
                // Cohere handles system via preamble
            }
            if (msg.role === 'user' && messages.indexOf(msg) < messages.length - 1) {
                chatHistory.push({ role: 'USER', message: msg.content });
            }
        }

        const response = await axios.post(
            `${provider.baseUrl}/chat`,
            {
                model: model.includes('/') ? model.split('/').pop() : model,
                message: lastMessage,
                chat_history: chatHistory,
                preamble: messages.find(m => m.role === 'system')?.content || '',
                temperature: options.temperature ?? 0.7,
                max_tokens: options.maxTokens ?? 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: options.timeout ?? 30000
            }
        );

        return {
            content: response.data.text || '',
            model: model,
            provider: provider.name,
            usage: {
                prompt_tokens: response.data.meta?.tokens?.input_tokens || 0,
                completion_tokens: response.data.meta?.tokens?.output_tokens || 0
            },
            finishReason: response.data.finish_reason || 'complete'
        };
    }

    async _replicateFormatRequest(provider, model, messages, options) {
        const apiKey = process.env[provider.apiKeyEnv];
        
        // Build prompt from messages
        let prompt = '';
        for (const msg of messages) {
            if (msg.role === 'system') prompt += `[INST] <<SYS>>\n${msg.content}\n<</SYS>>\n\n`;
            else if (msg.role === 'user') prompt += `${msg.content} [/INST]\n`;
            else if (msg.role === 'assistant') prompt += `${msg.content}\n[INST] `;
        }

        const response = await axios.post(
            `${provider.baseUrl}/predictions`,
            {
                model: model,
                input: {
                    prompt: prompt,
                    max_tokens: options.maxTokens ?? 2000,
                    temperature: options.temperature ?? 0.7
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: options.timeout ?? 60000
            }
        );

        // Replicate returns async - poll for result
        let prediction = response.data;
        if (prediction.status !== 'succeeded') {
            for (let i = 0; i < 30; i++) {
                await new Promise(r => setTimeout(r, 2000));
                const poll = await axios.get(prediction.urls.get, {
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });
                prediction = poll.data;
                if (['succeeded', 'failed', 'canceled'].includes(prediction.status)) break;
            }
        }

        const output = Array.isArray(prediction.output) ? prediction.output.join('') : (prediction.output || '');
        return {
            content: output,
            model: model,
            provider: provider.name,
            usage: {},
            finishReason: prediction.status
        };
    }

    async _ollamaFormatRequest(provider, model, messages, options) {
        const response = await axios.post(
            `${provider.baseUrl}/api/chat`,
            {
                model: model,
                messages: messages,
                stream: false,
                options: {
                    temperature: options.temperature ?? 0.7,
                    num_predict: options.maxTokens ?? 2000
                }
            },
            {
                timeout: options.timeout ?? 120000
            }
        );

        return {
            content: response.data.message?.content || '',
            model: response.data.model || model,
            provider: provider.name,
            usage: {
                prompt_tokens: response.data.prompt_eval_count || 0,
                completion_tokens: response.data.eval_count || 0,
                total_duration: response.data.total_duration || 0
            },
            finishReason: response.data.done ? 'stop' : 'incomplete'
        };
    }

    async _hfFormatRequest(provider, model, messages, options) {
        const apiKey = process.env[provider.apiKeyEnv];
        
        // Build prompt from messages
        let prompt = '';
        for (const msg of messages) {
            if (msg.role === 'system') prompt += `<|system|>\n${msg.content}\n`;
            else if (msg.role === 'user') prompt += `<|user|>\n${msg.content}\n`;
            else if (msg.role === 'assistant') prompt += `<|assistant|>\n${msg.content}\n`;
        }
        prompt += '<|assistant|>\n';

        const response = await axios.post(
            `${provider.baseUrl}/models/${model}`,
            {
                inputs: prompt,
                parameters: {
                    max_new_tokens: options.maxTokens ?? 2000,
                    temperature: options.temperature ?? 0.7,
                    top_p: options.topP ?? 0.9,
                    return_full_text: false
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: options.timeout ?? 60000
            }
        );

        const output = Array.isArray(response.data) ? response.data[0]?.generated_text : (response.data?.generated_text || '');
        return {
            content: output || '',
            model: model,
            provider: provider.name,
            usage: {},
            finishReason: 'complete'
        };
    }

    // ==================== AUTO-ROUTING ====================

    async autoRoute(messages, model, options = {}) {
        // Determine model family
        const modelLower = model.toLowerCase();
        let family = null;
        
        for (const [fam, _] of Object.entries(this.routingPriority)) {
            if (modelLower.includes(fam)) {
                family = fam;
                break;
            }
        }

        const priorityList = family ? this.routingPriority[family] : ['groq', 'together', 'fireworks', 'hf-inference'];

        // Try each provider in priority order
        for (const providerId of priorityList) {
            const provider = this.providers[providerId];
            if (!provider) continue;

            // Check if provider has API key
            if (provider.apiKeyEnv && !process.env[provider.apiKeyEnv] && !['ollama', 'vllm'].includes(providerId)) {
                continue; // Skip providers without keys (unless local)
            }

            try {
                const result = await this.chatCompletion(messages, model, providerId, options);
                result.autoRouted = true;
                result.selectedProvider = providerId;
                return result;
            } catch (error) {
                console.warn(`Auto-route: ${providerId} failed for ${model}:`, error.message);
                continue;
            }
        }

        // All providers failed - return demo response
        return this._demoResponse(messages, model, 'auto-route');
    }

    // ==================== LOCAL RUNNER DETECTION ====================

    async checkOllamaStatus() {
        try {
            const baseUrl = this.providers.ollama.baseUrl;
            const response = await axios.get(`${baseUrl}/api/tags`, { timeout: 3000 });
            const models = response.data?.models || [];
            return {
                running: true,
                url: baseUrl,
                models: models.map(m => ({
                    name: m.name,
                    size: m.size,
                    modified: m.modified_at
                })),
                modelCount: models.length
            };
        } catch {
            return { running: false, url: this.providers.ollama.baseUrl, models: [], modelCount: 0 };
        }
    }

    async checkVLLMStatus() {
        try {
            const baseUrl = this.providers.vllm.baseUrl;
            const response = await axios.get(`${baseUrl}/v1/models`, { timeout: 3000 });
            const models = response.data?.data || [];
            return {
                running: true,
                url: baseUrl,
                models: models.map(m => ({ id: m.id })),
                modelCount: models.length
            };
        } catch {
            return { running: false, url: this.providers.vllm.baseUrl, models: [], modelCount: 0 };
        }
    }

    // ==================== USAGE STATS ====================

    getUsageStats() {
        return {
            ...this.usage,
            providerCount: Object.keys(this.providers).length,
            cloudProviders: Object.keys(this.providers).filter(id => !['ollama', 'vllm'].includes(id)).length,
            localRunners: 2
        };
    }

    // ==================== DEMO RESPONSES ====================

    _demoResponse(messages, model, providerId) {
        const lastMsg = messages[messages.length - 1]?.content || '';
        const providerName = this.providers[providerId]?.name || providerId;
        const lower = lastMsg.toLowerCase();

        let content;
        if (lower.includes('revenue') || lower.includes('royalt')) {
            content = `[${providerName} Demo] Revenue Analysis via ${model}:\n\n📊 Based on current streaming data analysis:\n- Total portfolio revenue trending upward with 23.5% YoY growth\n- Spotify remains the dominant revenue source at 38% of total\n- YouTube shows highest growth potential at 22.3% monthly increase\n- Recommended: Focus on playlist placement and short-form content to maximize reach\n- NFT royalty integration could add additional 15-20% revenue stream\n\nNote: Connect your ${providerName} API key for live AI-powered analysis.`;
        } else if (lower.includes('market') || lower.includes('trend')) {
            content = `[${providerName} Demo] Market Trends via ${model}:\n\n📈 Music Industry Trend Analysis:\n- Hip-Hop/Rap continues dominance with 25.4% streaming growth\n- AI-generated music creating new licensing opportunities\n- Short-form content (TikTok, Reels) driving 40% of new music discovery\n- Web3 royalty systems gaining mainstream adoption\n- Cross-platform sync licensing revenue up 18% year-over-year\n\nNote: Connect your ${providerName} API key for real-time market intelligence.`;
        } else if (lower.includes('contract') || lower.includes('legal')) {
            content = `[${providerName} Demo] Contract Analysis via ${model}:\n\n📋 Smart Contract Generation:\n- Standard music licensing terms identified\n- Royalty split: Configurable per-party percentage\n- Territory: Worldwide digital distribution\n- Duration: Suggested 2-year term with auto-renewal\n- Payment: Quarterly distribution via blockchain\n- Rights: Non-exclusive with first-refusal clause\n\nNote: Connect your ${providerName} API key for live contract generation.`;
        } else if (lower.includes('code') || lower.includes('program')) {
            content = `[${providerName} Demo] Code Generation via ${model}:\n\n\`\`\`javascript\n// GOAT Royalties - Revenue Tracker\nclass RoyaltyTracker {\n  constructor(artistId) {\n    this.artistId = artistId;\n    this.platforms = new Map();\n    this.totalRevenue = 0;\n  }\n\n  addRevenue(platform, amount, streams) {\n    const existing = this.platforms.get(platform) || { total: 0, streams: 0 };\n    existing.total += amount;\n    existing.streams += streams;\n    this.platforms.set(platform, existing);\n    this.totalRevenue += amount;\n  }\n\n  getReport() {\n    return {\n      artist: this.artistId,\n      totalRevenue: this.totalRevenue,\n      platforms: Object.fromEntries(this.platforms)\n    };\n  }\n}\n\`\`\`\n\nNote: Connect your ${providerName} API key for advanced code generation.`;
        } else {
            content = `[${providerName} Demo] Response via ${model}:\n\n🤖 Hello from the GOAT Royalties AI platform! I'm running through the ${providerName} inference provider.\n\nI can help you with:\n• Revenue analysis and optimization\n• Market trend predictions\n• Contract generation and analysis\n• Content strategy recommendations\n• Code generation for music tech\n• NFT portfolio management\n\nThis is a demo response. Connect your ${providerName} API key (${this.providers[providerId]?.apiKeyEnv || 'N/A'}) to unlock live AI capabilities with ${model}.\n\nPlatform: SUPER GOAT Royalties v3.2.0\nProviders Available: ${Object.keys(this.providers).length}\nModel Registry: 40+ curated open-source models`;
        }

        return {
            content,
            model,
            provider: providerName,
            usage: { prompt_tokens: 0, completion_tokens: 0 },
            finishReason: 'demo',
            demo: true
        };
    }
}

module.exports = new HFInferenceClient();