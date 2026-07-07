/**
 * SUPER GOAT ROYALTIES - NVIDIA NIM Client
 * Integration with NVIDIA Inference Microservices for LLM capabilities
 * Includes demo mode with realistic mock responses when no API key is set
 */

const axios = require('axios');
const config = require('../ai/ai-config');

class NvidiaNIMClient {
    constructor() {
        this.baseUrl = config.nvidia.baseUrl;
        this.apiKey = config.nvidia.apiKey;
        this.models = config.nvidia.models;
        this.demoMode = config.demoMode;
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessing = false;
    }

    /**
     * Generate text completion using NVIDIA NIM (or demo fallback)
     */
    async generateText(prompt, model = 'mixtral-8x7b', options = {}) {
        try {
            const modelId = this.models[model] || model;
            const cacheKey = `${modelId}:${prompt.substring(0, 100)}`;
            
            // Check cache
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            // Demo mode - return realistic mock responses
            if (this.demoMode) {
                const result = this._demoGenerate(prompt, model);
                this.cache.set(cacheKey, result);
                return result;
            }

            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model: modelId,
                    messages: [
                        { role: 'system', content: options.systemPrompt || 'You are an AI assistant for the GOAT Royalties platform, helping creators maximize their revenue and manage their careers.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 2000,
                    top_p: options.topP || 0.9,
                    stream: options.stream || false
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 60000
                }
            );

            const result = response.data.choices[0].message.content;
            this.cache.set(cacheKey, result);
            return result;
        } catch (error) {
            const statusCode = error.response?.status;
            const apiMessage = error.response?.data?.message || error.response?.data || error.message;
            console.error(`[NVIDIA NIM] Text generation failed (status=${statusCode || 'N/A'}): ${apiMessage}`);
            if (statusCode === 401) {
                console.error('[NVIDIA NIM] Invalid or missing API key. Check NVIDIA_API_KEY in .env');
            } else if (statusCode === 429) {
                console.error('[NVIDIA NIM] Rate limit exceeded. Reduce request frequency or upgrade plan.');
            }
            // Graceful degradation: fall back to demo response so the UI stays functional
            console.warn('⚡ Falling back to demo response due to API failure');
            return this._demoGenerate(prompt, model);
        }
    }

    /**
     * Demo mode text generation - context-aware mock responses
     */
    _demoGenerate(prompt, model) {
        const lowerPrompt = prompt.toLowerCase();
        
        if (lowerPrompt.includes('revenue') || lowerPrompt.includes('royalt')) {
            return `📊 **Revenue Analysis Report** (Demo Mode - ${model})

Based on the current data analysis:

**Key Performance Insights:**
• Total streaming revenue shows a 23.5% increase quarter-over-quarter
• Spotify remains the dominant platform at 42% of total revenue ($12,847)
• Apple Music shows the highest growth rate at 31.2%
• YouTube Music engagement is up 18.7% with improving RPM rates

**Growth Opportunities:**
1. TikTok Sounds integration could unlock an estimated $2,400/month in additional sync revenue
2. Expanding to Amazon Music would capture an underserved audience segment
3. Playlist placement optimization could increase streams by 35-40%

**Predictive Analysis (Next Quarter):**
• Projected total revenue: $38,500 - $42,200 (15-20% growth)
• Spotify streams expected to reach 285,000
• Apple Music projected at $4,200 revenue
• Emerging platforms (Tidal, Deezer) showing 45% growth trajectory

**Recommendations:**
- Focus on playlist pitching 3-4 weeks before release dates
- Increase social media cross-promotion to drive platform-specific growth
- Consider exclusive content deals for premium tier platforms`;
        }
        
        if (lowerPrompt.includes('market') || lowerPrompt.includes('trend')) {
            return `📈 **Market Trends Analysis** (Demo Mode - ${model})

**Current Market Overview:**
The digital music market continues its strong growth trajectory with global streaming revenue reaching $19.3B in 2024.

**Key Trends:**
1. **AI-Enhanced Production** - 34% of top-charting tracks now use AI-assisted production tools
2. **Short-Form Content** - TikTok/Reels driving 62% of music discovery for Gen Z
3. **Direct-to-Fan Models** - Platforms like Bandcamp showing 28% revenue growth
4. **Spatial Audio** - Apple's Dolby Atmos adoption up 156% year-over-year
5. **NFT Music** - Digital collectibles market recovering with 89% increase in Q3

**Genre Performance:**
• Hip-Hop/R&B: 28.5% market share (stable)
• Pop: 24.1% (growing +2.3%)
• Latin: 9.8% (fastest growing +34%)
• Electronic/Dance: 7.2% (growing +12%)

**Strategic Recommendations:**
- Diversify across 4+ platforms to maximize reach
- Invest in short-form content creation (15-30 second clips)
- Explore sync licensing opportunities in gaming/streaming
- Build direct fan relationships through email and Discord`;
        }
        
        if (lowerPrompt.includes('contract') || lowerPrompt.includes('legal')) {
            return `📋 **Smart Contract Analysis** (Demo Mode - ${model})

**Contract Structure Recommendation:**

**Article 1 - Parties & Scope:**
This agreement establishes a royalty distribution framework between the creator (Licensor) and the platform/label (Licensee) for digital content monetization.

**Article 2 - Royalty Split Structure:**
• Master Recording Rights: 80/20 (Creator/Platform)
• Publishing Rights: 70/30 (Creator/Publisher)
• Sync Licensing: 50/50 (Creator/Licensor)
• Merchandise & Brand Deals: 85/15 (Creator/Manager)

**Article 3 - Performance Metrics:**
• Minimum quarterly revenue threshold: $500
• Streaming milestone bonuses at 100K, 500K, 1M streams
• Annual performance review with adjustment rights

**Article 4 - Payment Terms:**
• Monthly royalty statements within 30 days
• Payment processing within 45 days of statement
• Late payment interest: 1.5% per month

**Article 5 - Term & Termination:**
• Initial term: 2 years with automatic renewal
• 90-day written notice for termination
• Post-termination royalty obligations continue for 3 years

**Compliance Notes:**
- GDPR compliant data handling required
- Music Modernization Act (MMA) adherence
- Mechanical licensing through The MLC`;
        }
        
        if (lowerPrompt.includes('content') || lowerPrompt.includes('recommend')) {
            return `🎵 **Content Strategy Recommendations** (Demo Mode - ${model})

**Release Strategy:**
1. **Frequency**: Release singles every 4-6 weeks to maintain algorithmic momentum
2. **Timing**: Tuesday/Friday releases for optimal playlist consideration
3. **Pre-Save Campaigns**: Start 2 weeks before release, target 500+ pre-saves

**Platform-Specific Optimization:**
• **Spotify**: Focus on editorial playlist pitching via Spotify for Artists (submit 7 days early)
• **Apple Music**: Leverage spatial audio mixes for premium placement
• **YouTube**: Create lyric videos + behind-the-scenes content for each release
• **TikTok**: Produce 3-5 short clips with trending sounds/formats

**Collaboration Opportunities:**
- Feature exchanges with artists in 50K-200K monthly listener range
- Producer collaborations for cross-genre appeal
- Remix partnerships to extend track lifecycle

**Revenue Maximization:**
1. Register all works with PROs (ASCAP/BMI/SESAC)
2. Claim all neighboring rights via SoundExchange
3. Explore sync licensing through agencies
4. Create deluxe/acoustic versions for additional streaming revenue
5. Bundle physical merchandise with digital releases`;
        }
        
        // Generic response for any other query
        return `🤖 **AI Analysis** (Demo Mode - ${model})

Thank you for your query. Here's my analysis:

**Summary:**
Based on the available data and current market conditions, I've identified several key insights relevant to your request.

**Key Findings:**
1. Performance metrics show positive trends across all tracked categories
2. There are 3-4 high-priority optimization opportunities identified
3. Risk factors are within acceptable parameters with proper mitigation strategies
4. Growth trajectory suggests 15-25% improvement potential over the next quarter

**Recommendations:**
• Implement data-driven decision making for content scheduling
• Diversify revenue streams across multiple platforms
• Leverage AI-powered analytics for real-time performance monitoring
• Focus on audience engagement metrics alongside revenue metrics
• Consider strategic partnerships to expand market reach

**Next Steps:**
1. Review the detailed metrics dashboard for specific numbers
2. Set up automated alerts for performance thresholds
3. Schedule quarterly strategy reviews
4. Implement A/B testing for content optimization

*Note: This is a demo response. Connect your NVIDIA API key for live AI-powered analysis.*`;
    }

    /**
     * Generate embeddings for RAG (or demo fallback)
     */
    async generateEmbedding(text) {
        try {
            // Demo mode - return deterministic pseudo-embeddings
            if (this.demoMode) {
                return this._demoEmbedding(text);
            }

            const response = await axios.post(
                `${this.baseUrl}/embeddings`,
                {
                    input: text,
                    model: this.models['nv-embedqa'],
                    input_type: 'query'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.data[0].embedding;
        } catch (error) {
            const statusCode = error.response?.status;
            const apiMessage = error.response?.data?.message || error.response?.data || error.message;
            console.error(`[NVIDIA NIM] Embedding generation failed (status=${statusCode || 'N/A'}): ${apiMessage}`);
            if (statusCode === 401) {
                console.error('[NVIDIA NIM] Invalid or missing API key for embeddings. Check NVIDIA_API_KEY in .env');
            }
            // Graceful degradation: fall back to deterministic demo embedding
            // (keyword-based search in RAG will still work via _keywordRetrieve)
            console.warn('[NVIDIA NIM] Using deterministic demo embedding as fallback (keyword search will still work)');
            return this._demoEmbedding(text);
        }
    }

    /**
     * Demo mode embedding - generates deterministic pseudo-embeddings from text
     * Uses a hash-based approach to produce consistent vectors for the same input
     */
    _demoEmbedding(text) {
        const dimensions = 1024;
        const embedding = new Array(dimensions);
        
        // Simple hash-based deterministic pseudo-embedding
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Generate pseudo-random but deterministic embedding values
        let seed = Math.abs(hash);
        for (let i = 0; i < dimensions; i++) {
            seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            embedding[i] = (seed / 0x7fffffff) * 2 - 1; // Range [-1, 1]
        }
        
        // Normalize the vector
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        for (let i = 0; i < dimensions; i++) {
            embedding[i] = embedding[i] / magnitude;
        }
        
        return embedding;
    }

    /**
     * Analyze royalty data with AI
     */
    async analyzeRoyaltyData(revenueData) {
        const prompt = `Analyze this royalty data and provide insights:
        
Total Revenue: $${revenueData.totalRevenue.toLocaleString()}
Growth Rate: ${revenueData.growthRate}%
Platform Performance: ${JSON.stringify(revenueData.platforms, null, 2)}

Please provide:
1. Key performance insights
2. Growth opportunities
3. Platform optimization recommendations
4. Predictive analysis for next quarter`;

        return this.generateText(prompt, 'mixtral-8x7b', {
            temperature: 0.5,
            maxTokens: 1500
        });
    }

    /**
     * Generate smart contract terms
     */
    async generateContractTerms(contractType, parties, terms) {
        const prompt = `Generate professional contract terms for ${contractType}:
        
Parties: ${JSON.stringify(parties, null, 2)}
Key Terms: ${JSON.stringify(terms, null, 2)}

Provide:
1. Complete contract clauses
2. Royalty split structure
3. Performance metrics
4. Termination conditions
5. Legal compliance notes`;

        return this.generateText(prompt, 'nemotron-70b', {
            temperature: 0.3,
            maxTokens: 2500
        });
    }

    /**
     * Predict market trends
     */
    async predictMarketTrends(genre, platform, timeframe) {
        const prompt = `Predict market trends for ${genre} music on ${platform} over the next ${timeframe}:

Provide:
1. Growth projections
2. Audience demographics
3. Monetization opportunities
4. Competitive landscape
5. Strategic recommendations`;

        return this.generateText(prompt, 'llama2-70b', {
            temperature: 0.6,
            maxTokens: 1500
        });
    }

    /**
     * Generate content recommendations
     */
    async generateContentRecommendations(artistProfile, currentContent) {
        const prompt = `Analyze artist profile and generate content recommendations:

Artist Profile: ${JSON.stringify(artistProfile, null, 2)}
Current Content: ${JSON.stringify(currentContent, null, 2)}

Provide:
1. Content strategy recommendations
2. Release timing suggestions
3. Platform-specific optimizations
4. Collaboration opportunities
5. Revenue maximization tactics`;

        return this.generateText(prompt, 'phi-3', {
            temperature: 0.7,
            maxTokens: 2000
        });
    }

    /**
     * Batch process multiple requests
     */
    async batchProcess(requests) {
        const results = await Promise.allSettled(
            requests.map(req => this.generateText(req.prompt, req.model, req.options))
        );

        return results.map((result, index) => ({
            id: requests[index].id,
            success: result.status === 'fulfilled',
            result: result.status === 'fulfilled' ? result.value : null,
            error: result.status === 'rejected' ? result.reason.message : null
        }));
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get model capabilities
     */
    getModelCapabilities() {
        return Object.keys(this.models).map(model => ({
            name: model,
            id: this.models[model],
            type: model.includes('code') ? 'code' : 
                  model.includes('embed') ? 'embedding' : 
                  model.includes('multimodal') ? 'multimodal' : 'text'
        }));
    }
}

module.exports = new NvidiaNIMClient();