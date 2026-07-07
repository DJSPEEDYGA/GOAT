/**
 * SUPER GOAT ROYALTIES - Lightning AI Client
 * Universal Model API Hub - Access 14+ models from one endpoint
 * Providers: Lightning AI, OpenAI, Google
 * 
 * Supports: GPT OSS 20B/120B, Llama 3.3 70B, DeepSeek V3.1,
 *           GPT 5 nano/mini, GPT 3.5 Turbo, Gemini 2.5/3 Flash,
 *           Nemotron 3 Super 120B, MiniMax M2.5, Kimi K2.5, GLM-5
 */

const axios = require('axios');
const config = require('../ai/ai-config');

class LightningAIClient {
    constructor() {
        this.baseUrl = config.lightning.baseUrl;
        this.apiKey = config.lightning.apiKey;
        this.models = config.lightning.models;
        this.demoMode = config.demoMode;
        this.cache = new Map();
        this.usageTracker = {
            totalRequests: 0,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            totalCost: 0,
            byModel: {},
            history: []
        };
    }

    // ==========================================
    // CORE API METHODS
    // ==========================================

    /**
     * Send a chat completion request to any Lightning AI model
     */
    async chatCompletion(messages, modelKey = 'llama-3.3-70b', options = {}) {
        try {
            const modelConfig = this.models[modelKey];
            if (!modelConfig) {
                throw new Error(`Model "${modelKey}" not found. Available: ${Object.keys(this.models).join(', ')}`);
            }

            const cacheKey = `${modelKey}:${JSON.stringify(messages).substring(0, 200)}`;
            if (this.cache.has(cacheKey) && !options.skipCache) {
                return this.cache.get(cacheKey);
            }

            // Demo mode
            if (this.demoMode) {
                const result = this._demoChatCompletion(messages, modelKey, modelConfig);
                this.cache.set(cacheKey, result);
                return result;
            }

            const startTime = Date.now();

            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model: modelConfig.id,
                    messages: messages,
                    temperature: options.temperature ?? 0.7,
                    max_tokens: options.maxTokens ?? 2000,
                    top_p: options.topP ?? 0.9,
                    stream: options.stream ?? false,
                    ...(options.responseFormat && { response_format: options.responseFormat })
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: options.timeout ?? 120000
                }
            );

            const latency = Date.now() - startTime;
            const result = this._processResponse(response.data, modelKey, modelConfig, latency);

            this.cache.set(cacheKey, result);
            return result;

        } catch (error) {
            console.error(`Lightning AI Error [${modelKey}]:`, error.response?.data || error.message);
            
            // Fallback to demo mode on error
            console.log('⚡ Falling back to demo response');
            const modelConfig = this.models[modelKey] || { name: modelKey, provider: 'Unknown' };
            return this._demoChatCompletion(
                messages,
                modelKey,
                modelConfig
            );
        }
    }

    /**
     * Simple text generation (convenience wrapper)
     */
    async generateText(prompt, modelKey = 'llama-3.3-70b', options = {}) {
        const messages = [
            {
                role: 'system',
                content: options.systemPrompt || 'You are an AI assistant for the GOAT Royalties platform, helping creators maximize their revenue and manage their careers.'
            },
            { role: 'user', content: prompt }
        ];

        const result = await this.chatCompletion(messages, modelKey, options);
        return result.content;
    }

    /**
     * Multi-turn conversation
     */
    async conversation(conversationHistory, modelKey = 'llama-3.3-70b', options = {}) {
        return await this.chatCompletion(conversationHistory, modelKey, options);
    }

    /**
     * Compare responses across multiple models
     */
    async compareModels(prompt, modelKeys = [], options = {}) {
        const models = modelKeys.length > 0 ? modelKeys : Object.keys(this.models).slice(0, 5);
        
        const results = await Promise.allSettled(
            models.map(async (modelKey) => {
                const startTime = Date.now();
                const result = await this.generateText(prompt, modelKey, options);
                const latency = Date.now() - startTime;
                const modelConfig = this.models[modelKey];

                return {
                    model: modelKey,
                    name: modelConfig?.name || modelKey,
                    provider: modelConfig?.provider || 'Unknown',
                    content: result,
                    latency: latency,
                    costInput: modelConfig?.costInput || 0,
                    costOutput: modelConfig?.costOutput || 0
                };
            })
        );

        return results.map((r, i) => ({
            model: models[i],
            success: r.status === 'fulfilled',
            ...(r.status === 'fulfilled' ? r.value : { error: r.reason?.message })
        }));
    }

    /**
     * Smart routing - automatically select best model based on task
     */
    async smartRoute(prompt, taskType = 'general', options = {}) {
        const routingMap = {
            'general': 'llama-3.3-70b',
            'fast': 'gpt-oss-20b',
            'powerful': 'nemotron-3-super-120b',
            'reasoning': 'deepseek-v3.1',
            'budget': 'gpt-5-nano',
            'code': 'deepseek-v3.1',
            'creative': 'gemini-3-flash',
            'analysis': 'gpt-oss-120b',
            'long-context': 'gemini-2.5-flash',
            'multilingual': 'glm-5',
            'high-throughput': 'kimi-k2.5',
            'conversation': 'gpt-3.5-turbo',
            'revenue': 'llama-3.3-70b',
            'contract': 'nemotron-3-super-120b',
            'marketing': 'gemini-3-flash',
            'content': 'minimax-m2.5'
        };

        const selectedModel = routingMap[taskType] || routingMap['general'];
        console.log(`🧠 Smart Route: Task="${taskType}" → Model="${selectedModel}"`);

        return await this.generateText(prompt, selectedModel, options);
    }

    // ==========================================
    // MODEL INFORMATION
    // ==========================================

    /**
     * Get all available models with full metadata
     */
    getAllModels() {
        return Object.entries(this.models).map(([key, model]) => ({
            key,
            ...model,
            status: this.demoMode ? 'demo' : 'live'
        }));
    }

    /**
     * Get models filtered by provider
     */
    getModelsByProvider(provider) {
        return this.getAllModels().filter(m =>
            m.provider.toLowerCase() === provider.toLowerCase()
        );
    }

    /**
     * Get models sorted by a specific metric
     */
    getModelsSortedBy(metric = 'costInput', ascending = true) {
        const models = this.getAllModels();
        return models.sort((a, b) => {
            const valA = a[metric] || 0;
            const valB = b[metric] || 0;
            return ascending ? valA - valB : valB - valA;
        });
    }

    /**
     * Get the cheapest model for a task
     */
    getCheapestModel() {
        return this.getModelsSortedBy('costInput', true)[0];
    }

    /**
     * Get the fastest model (lowest latency)
     */
    getFastestModel() {
        return this.getModelsSortedBy('latency', true)[0];
    }

    /**
     * Get models with largest context window
     */
    getLargestContextModels(limit = 5) {
        return this.getModelsSortedBy('contextLength', false).slice(0, limit);
    }

    /**
     * Get model by key
     */
    getModel(key) {
        const model = this.models[key];
        if (!model) return null;
        return { key, ...model, status: this.demoMode ? 'demo' : 'live' };
    }

    // ==========================================
    // GOAT ROYALTIES DOMAIN METHODS
    // ==========================================

    /**
     * Analyze royalty revenue data
     */
    async analyzeRevenue(revenueData, modelKey = 'llama-3.3-70b') {
        const prompt = `Analyze this royalty revenue data and provide actionable insights:

Total Revenue: $${revenueData.totalRevenue?.toLocaleString() || 'N/A'}
Growth Rate: ${revenueData.growthRate || 'N/A'}%
Platform Performance: ${JSON.stringify(revenueData.platforms || {}, null, 2)}

Provide:
1. Key performance insights with specific numbers
2. Top growth opportunities ranked by potential
3. Platform optimization recommendations
4. Predictive analysis for next quarter
5. Risk factors and mitigation strategies`;

        return this.generateText(prompt, modelKey, {
            temperature: 0.5,
            maxTokens: 2000,
            systemPrompt: 'You are a senior music industry revenue analyst. Provide data-driven, actionable insights.'
        });
    }

    /**
     * Generate smart contract terms
     */
    async generateContract(contractType, parties, terms, modelKey = 'nemotron-3-super-120b') {
        const prompt = `Generate professional ${contractType} contract terms:

Parties: ${JSON.stringify(parties, null, 2)}
Key Terms: ${JSON.stringify(terms, null, 2)}

Provide complete, legally-informed:
1. Contract clauses with specific language
2. Royalty split structure with percentages
3. Performance metrics and milestones
4. Payment terms and schedule
5. Termination conditions and post-term obligations
6. Legal compliance notes (MMA, GDPR, etc.)`;

        return this.generateText(prompt, modelKey, {
            temperature: 0.3,
            maxTokens: 3000,
            systemPrompt: 'You are a music industry contract attorney. Draft precise, fair contract language.'
        });
    }

    /**
     * Predict market trends
     */
    async predictMarketTrends(genre, platform, timeframe, modelKey = 'deepseek-v3.1') {
        const prompt = `Predict market trends for ${genre} music on ${platform} over the next ${timeframe}:

Provide detailed:
1. Growth projections with percentage ranges
2. Audience demographics and shifts
3. Monetization opportunities ranked by ROI
4. Competitive landscape analysis
5. Strategic recommendations with timelines`;

        return this.generateText(prompt, modelKey, {
            temperature: 0.6,
            maxTokens: 2000,
            systemPrompt: 'You are a music industry market analyst with deep knowledge of streaming economics.'
        });
    }

    /**
     * Generate content recommendations
     */
    async generateContentStrategy(artistProfile, currentContent, modelKey = 'gemini-3-flash') {
        const prompt = `Generate a comprehensive content strategy:

Artist Profile: ${JSON.stringify(artistProfile, null, 2)}
Current Content: ${JSON.stringify(currentContent, null, 2)}

Provide:
1. Release calendar with optimal timing
2. Platform-specific content adaptations
3. Cross-promotion strategies
4. Collaboration opportunities
5. Revenue maximization tactics`;

        return this.generateText(prompt, modelKey, {
            temperature: 0.7,
            maxTokens: 2000,
            systemPrompt: 'You are a music content strategist specializing in digital platforms.'
        });
    }

    // ==========================================
    // USAGE TRACKING
    // ==========================================

    /**
     * Get usage statistics
     */
    getUsageStats() {
        return {
            ...this.usageTracker,
            cacheSize: this.cache.size,
            modelsAvailable: Object.keys(this.models).length,
            mode: this.demoMode ? 'demo' : 'live'
        };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    // ==========================================
    // INTERNAL METHODS
    // ==========================================

    /**
     * Process API response and track usage
     */
    _processResponse(data, modelKey, modelConfig, latency) {
        const content = data.choices?.[0]?.message?.content || '';
        const usage = data.usage || {};

        // Track usage
        this.usageTracker.totalRequests++;
        this.usageTracker.totalInputTokens += usage.prompt_tokens || 0;
        this.usageTracker.totalOutputTokens += usage.completion_tokens || 0;

        const inputCost = ((usage.prompt_tokens || 0) / 1000000) * (modelConfig.costInput || 0);
        const outputCost = ((usage.completion_tokens || 0) / 1000000) * (modelConfig.costOutput || 0);
        const totalCost = inputCost + outputCost;

        this.usageTracker.totalCost += totalCost;

        if (!this.usageTracker.byModel[modelKey]) {
            this.usageTracker.byModel[modelKey] = { requests: 0, tokens: 0, cost: 0 };
        }
        this.usageTracker.byModel[modelKey].requests++;
        this.usageTracker.byModel[modelKey].tokens += (usage.prompt_tokens || 0) + (usage.completion_tokens || 0);
        this.usageTracker.byModel[modelKey].cost += totalCost;

        this.usageTracker.history.push({
            model: modelKey,
            tokens: (usage.prompt_tokens || 0) + (usage.completion_tokens || 0),
            cost: totalCost,
            latency,
            timestamp: new Date().toISOString()
        });

        // Keep history bounded
        if (this.usageTracker.history.length > 500) {
            this.usageTracker.history = this.usageTracker.history.slice(-500);
        }

        return {
            content,
            model: modelKey,
            modelName: modelConfig.name,
            provider: modelConfig.provider,
            usage: {
                promptTokens: usage.prompt_tokens || 0,
                completionTokens: usage.completion_tokens || 0,
                totalTokens: usage.total_tokens || 0
            },
            cost: {
                input: inputCost,
                output: outputCost,
                total: totalCost
            },
            latency,
            finishReason: data.choices?.[0]?.finish_reason || 'unknown'
        };
    }

    /**
     * Demo mode chat completion with context-aware responses
     */
    _demoChatCompletion(messages, modelKey, modelConfig) {
        const lastMessage = messages[messages.length - 1]?.content || '';
        const lowerPrompt = lastMessage.toLowerCase();

        let content = '';

        if (lowerPrompt.includes('revenue') || lowerPrompt.includes('royalt')) {
            content = `📊 **Revenue Analysis Report** (via ${modelConfig.name} - Demo Mode)

**Key Performance Insights:**
• Total streaming revenue shows a 23.5% increase quarter-over-quarter
• Spotify remains the dominant platform at 42% of total revenue ($12,847)
• Apple Music shows the highest growth rate at 31.2%
• YouTube Music engagement is up 18.7% with improving RPM rates

**Growth Opportunities:**
1. TikTok Sounds integration could unlock ~$2,400/month in sync revenue
2. Expanding to Amazon Music would capture underserved audience segments
3. Playlist placement optimization could increase streams by 35-40%

**Predictive Analysis (Next Quarter):**
• Projected total revenue: $38,500 - $42,200 (15-20% growth)
• Spotify streams expected to reach 285,000
• Emerging platforms showing 45% growth trajectory

*Powered by ${modelConfig.name} | ${modelConfig.provider} | Context: ${(modelConfig.contextLength / 1000).toFixed(0)}K tokens*`;
        }
        else if (lowerPrompt.includes('market') || lowerPrompt.includes('trend')) {
            content = `📈 **Market Trends Analysis** (via ${modelConfig.name} - Demo Mode)

**Current Market Overview:**
Global streaming revenue reached $19.3B in 2024, with continued growth in 2025.

**Key Trends:**
1. **AI-Enhanced Production** - 34% of top-charting tracks use AI-assisted tools
2. **Short-Form Content** - TikTok/Reels driving 62% of Gen Z music discovery
3. **Direct-to-Fan Models** - Bandcamp showing 28% revenue growth
4. **Spatial Audio** - Dolby Atmos adoption up 156% YoY
5. **NFT Music** - Digital collectibles market up 89% in Q3

**Genre Performance:**
• Hip-Hop/R&B: 28.5% market share (stable)
• Pop: 24.1% (growing +2.3%)
• Latin: 9.8% (fastest growing +34%)

*Powered by ${modelConfig.name} | ${modelConfig.provider}*`;
        }
        else if (lowerPrompt.includes('contract') || lowerPrompt.includes('legal')) {
            content = `📋 **Smart Contract Analysis** (via ${modelConfig.name} - Demo Mode)

**Recommended Royalty Split Structure:**
• Master Recording Rights: 80/20 (Creator/Platform)
• Publishing Rights: 70/30 (Creator/Publisher)
• Sync Licensing: 50/50 (Creator/Licensor)
• Merchandise & Brand Deals: 85/15 (Creator/Manager)

**Key Terms:**
• Monthly royalty statements within 30 days
• Payment processing within 45 days
• Late payment interest: 1.5% per month
• Initial term: 2 years with auto-renewal
• 90-day written notice for termination

**Compliance:** GDPR, MMA, MLC adherent

*Powered by ${modelConfig.name} | ${modelConfig.provider}*`;
        }
        else if (lowerPrompt.includes('content') || lowerPrompt.includes('recommend') || lowerPrompt.includes('strateg')) {
            content = `🎵 **Content Strategy** (via ${modelConfig.name} - Demo Mode)

**Release Strategy:**
1. Singles every 4-6 weeks for algorithmic momentum
2. Tuesday/Friday releases for optimal playlist consideration
3. Pre-save campaigns targeting 500+ pre-saves

**Platform Optimization:**
• **Spotify**: Editorial playlist pitching 7 days before release
• **Apple Music**: Spatial audio mixes for premium placement
• **YouTube**: Lyric videos + BTS content per release
• **TikTok**: 3-5 short clips per track with trending formats

**Revenue Maximization:**
1. Register all works with PROs (ASCAP/BMI/SESAC)
2. Claim neighboring rights via SoundExchange
3. Explore sync licensing in gaming/streaming
4. Create deluxe/acoustic versions for additional revenue

*Powered by ${modelConfig.name} | ${modelConfig.provider}*`;
        }
        else {
            content = `🤖 **AI Analysis** (via ${modelConfig.name} - Demo Mode)

Thank you for your query. Here's my analysis:

**Summary:**
Based on available data and current market conditions, several key insights emerge.

**Key Findings:**
1. Performance metrics show positive trends across all tracked categories
2. 3-4 high-priority optimization opportunities identified
3. Risk factors within acceptable parameters
4. Growth trajectory suggests 15-25% improvement potential next quarter

**Recommendations:**
• Implement data-driven decision making for content scheduling
• Diversify revenue streams across multiple platforms
• Leverage AI-powered analytics for real-time performance monitoring
• Focus on audience engagement alongside revenue metrics

**Model Info:**
• Model: ${modelConfig.name}
• Provider: ${modelConfig.provider}
• Context Window: ${(modelConfig.contextLength / 1000).toFixed(0)}K tokens
• Throughput: ${modelConfig.throughput} tok/s

*Note: Demo mode active. Set LIGHTNING_API_KEY in .env for live AI responses.*`;
        }

        return {
            content,
            model: modelKey,
            modelName: modelConfig.name,
            provider: modelConfig.provider,
            usage: {
                promptTokens: Math.ceil(lastMessage.length / 4),
                completionTokens: Math.ceil(content.length / 4),
                totalTokens: Math.ceil((lastMessage.length + content.length) / 4)
            },
            cost: { input: 0, output: 0, total: 0 },
            latency: Math.random() * 500 + 200,
            finishReason: 'stop',
            demo: true
        };
    }
}

module.exports = new LightningAIClient();