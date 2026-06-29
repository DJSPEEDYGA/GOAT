/**
 * SUPER GOAT ROYALTIES - Local LLM Client
 * Integration with Ollama, LM Studio, and other local LLM servers
 * 
 * Features:
 * - Ollama API integration (localhost:11434)
 * - LM Studio API integration (localhost:1234)
 * - OpenAI-compatible local endpoints
 * - Custom model support
 * - Automatic fallback to demo mode
 */

const axios = require('axios');

class LocalLLMClient {
    constructor(config = {}) {
        this.ollamaUrl = config.ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434';
        this.lmStudioUrl = config.lmStudioUrl || process.env.LM_STUDIO_URL || 'http://localhost:1234';
        this.preferredProvider = config.preferredProvider || process.env.LOCAL_LLM_PROVIDER || 'ollama';
        this.timeout = config.timeout || 60000; // 60 seconds for local models
        this.defaultModel = config.defaultModel || process.env.LOCAL_LLM_MODEL || 'llama3.3';
        this.isConnected = false;
        this.availableModels = [];
        
        // Check connection on init
        this.checkConnection();
    }

    /**
     * Check if local LLM server is running
     */
    async checkConnection() {
        try {
            const url = this.preferredProvider === 'ollama' 
                ? `${this.ollamaUrl}` 
                : `${this.lmStudioUrl}/v1/models`;
            
            const response = await axios.get(url, { timeout: 5000 });
            this.isConnected = response.status === 200 || response.data;
            
            if (this.isConnected) {
                await this.loadAvailableModels();
                console.log(`✅ Local LLM connected: ${this.preferredProvider}`);
                console.log(`   Models available: ${this.availableModels.join(', ')}`);
            }
            
            return this.isConnected;
        } catch (error) {
            console.log(`⚠️ Local LLM not available: ${error.message}`);
            console.log(`   Make sure Ollama or LM Studio is running`);
            this.isConnected = false;
            return false;
        }
    }

    /**
     * Load available models from the local server
     */
    async loadAvailableModels() {
        try {
            if (this.preferredProvider === 'ollama') {
                const response = await axios.get(`${this.ollamaUrl}/api/tags`, { timeout: 5000 });
                this.availableModels = response.data.models?.map(m => m.name) || [];
            } else {
                const response = await axios.get(`${this.lmStudioUrl}/v1/models`, { timeout: 5000 });
                this.availableModels = response.data.data?.map(m => m.id) || [];
            }
            return this.availableModels;
        } catch (error) {
            console.error('Failed to load models:', error.message);
            return [];
        }
    }

    /**
     * Get the active provider URL
     */
    getProviderUrl() {
        return this.preferredProvider === 'ollama' ? this.ollamaUrl : this.lmStudioUrl;
    }

    /**
     * Chat completion - OpenAI compatible
     */
    async chatCompletion(messages, options = {}) {
        const model = options.model || this.defaultModel;
        
        if (!this.isConnected) {
            await this.checkConnection();
            if (!this.isConnected) {
                return this.getDemoResponse(messages);
            }
        }

        try {
            if (this.preferredProvider === 'ollama') {
                return await this.ollamaChat(model, messages, options);
            } else {
                return await this.openAICompatibleChat(model, messages, options);
            }
        } catch (error) {
            console.error('Local LLM error:', error.message);
            return this.getDemoResponse(messages);
        }
    }

    /**
     * Ollama-specific chat API
     */
    async ollamaChat(model, messages, options = {}) {
        const url = `${this.ollamaUrl}/api/chat`;
        
        const payload = {
            model: model,
            messages: messages,
            stream: false,
            options: {
                temperature: options.temperature || 0.7,
                num_predict: options.maxTokens || 2000,
                top_p: options.topP || 0.9,
                top_k: options.topK || 40
            }
        };

        const response = await axios.post(url, payload, {
            timeout: this.timeout,
            headers: { 'Content-Type': 'application/json' }
        });

        return {
            success: true,
            provider: 'ollama',
            model: model,
            message: response.data.message,
            usage: {
                promptTokens: response.data.prompt_eval_count || 0,
                completionTokens: response.data.eval_count || 0,
                totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
            },
            raw: response.data
        };
    }

    /**
     * OpenAI-compatible chat API (for LM Studio and others)
     */
    async openAICompatibleChat(model, messages, options = {}) {
        const url = `${this.lmStudioUrl}/v1/chat/completions`;
        
        const payload = {
            model: model,
            messages: messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000,
            stream: false
        };

        const response = await axios.post(url, payload, {
            timeout: this.timeout,
            headers: { 'Content-Type': 'application/json' }
        });

        const choice = response.data.choices[0];
        return {
            success: true,
            provider: 'openai-compatible',
            model: model,
            message: {
                role: choice.message.role,
                content: choice.message.content
            },
            usage: response.data.usage,
            raw: response.data
        };
    }

    /**
     * Generate embeddings for RAG
     */
    async generateEmbeddings(text, model = 'nomic-embed-text') {
        if (!this.isConnected) {
            await this.checkConnection();
        }

        try {
            if (this.preferredProvider === 'ollama') {
                const response = await axios.post(`${this.ollamaUrl}/api/embeddings`, {
                    model: model,
                    prompt: text
                }, { timeout: this.timeout });

                return {
                    success: true,
                    embedding: response.data.embedding,
                    model: model
                };
            }
        } catch (error) {
            console.error('Embedding error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Pull a model from Ollama registry
     */
    async pullModel(modelName) {
        if (this.preferredProvider !== 'ollama') {
            throw new Error('Model pulling only supported for Ollama');
        }

        try {
            const response = await axios.post(`${this.ollamaUrl}/api/pull`, {
                name: modelName,
                stream: false
            }, { timeout: 300000 }); // 5 minutes for model download

            return {
                success: true,
                message: `Model ${modelName} downloaded successfully`,
                status: response.data.status
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create a custom model with Modelfile
     */
    async createCustomModel(name, modelfile) {
        if (this.preferredProvider !== 'ollama') {
            throw new Error('Custom model creation only supported for Ollama');
        }

        try {
            const response = await axios.post(`${this.ollamaUrl}/api/create`, {
                name: name,
                modelfile: modelfile,
                stream: false
            }, { timeout: 300000 });

            return {
                success: true,
                message: `Custom model ${name} created successfully`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Streaming chat completion
     */
    async *streamChat(messages, options = {}) {
        if (!this.isConnected) {
            await this.checkConnection();
        }

        const model = options.model || this.defaultModel;

        if (this.preferredProvider === 'ollama') {
            const url = `${this.ollamaUrl}/api/chat`;
            const payload = {
                model: model,
                messages: messages,
                stream: true,
                options: {
                    temperature: options.temperature || 0.7,
                    num_predict: options.maxTokens || 2000
                }
            };

            try {
                const response = await axios.post(url, payload, {
                    responseType: 'stream',
                    timeout: this.timeout
                });

                for await (const chunk of response.data) {
                    const lines = chunk.toString().split('\n').filter(Boolean);
                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);
                            if (data.message?.content) {
                                yield {
                                    content: data.message.content,
                                    done: data.done || false
                                };
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            } catch (error) {
                yield { error: error.message, done: true };
            }
        }
    }

    /**
     * Demo response when no local LLM is available
     */
    getDemoResponse(messages) {
        const lastMessage = messages[messages.length - 1]?.content || '';
        
        const demoResponses = {
            royalty: `Based on your royalty data, here's an analysis:

💰 **Revenue Summary**
- Total streaming revenue: $233,600
- Growth rate: 23.5% YoY
- Top platform: Spotify ($89,200)

📊 **Recommendations**
1. Focus on YouTube for highest growth (22.3%)
2. Expand Tidal presence for premium listeners
3. Consider NFT releases for additional revenue

*Note: Connect Ollama or LM Studio for live AI analysis*`,
            
            default: `I'm the SUPER GOAT Royalties AI assistant.

To enable full AI capabilities, please:
1. Install Ollama: https://ollama.ai
2. Run: \`ollama pull llama3.3\`
3. Start server: \`ollama serve\`

Your question was: "${lastMessage.substring(0, 100)}..."

*Demo mode - Connect a local LLM for real responses*`
        };

        const isRoyaltyQuestion = lastMessage.toLowerCase().includes('royal') ||
                                   lastMessage.toLowerCase().includes('revenue') ||
                                   lastMessage.toLowerCase().includes('music');

        return {
            success: true,
            provider: 'demo',
            model: 'demo-mode',
            message: {
                role: 'assistant',
                content: isRoyaltyQuestion ? demoResponses.royalty : demoResponses.default
            },
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            isDemo: true
        };
    }

    /**
     * Get system status
     */
    getStatus() {
        return {
            connected: this.isConnected,
            provider: this.preferredProvider,
            providerUrl: this.getProviderUrl(),
            models: this.availableModels,
            defaultModel: this.defaultModel
        };
    }
}

// Export singleton instance
const localLLMClient = new LocalLLMClient();

module.exports = localLLMClient;
module.exports.LocalLLMClient = LocalLLMClient;