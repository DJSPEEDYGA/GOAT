/**
 * SUPER GOAT ROYALTIES - RAG (Retrieval Augmented Generation) System
 * Advanced knowledge retrieval and generation for enhanced AI responses
 * Includes graceful degradation and keyword-based fallback retrieval
 */

const nvidiaClient = require('../nvidia/nvidia-nim-client');
const NodeCache = require('node-cache');

class RAGSystem {
    constructor() {
        this.knowledgeBase = new Map();
        this.documentStore = new Map();
        this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
        this.chunkSize = 1000;
        this.chunkOverlap = 200;
    }

    /**
     * Add document to knowledge base (with graceful fallback)
     */
    async addDocument(id, content, metadata = {}) {
        try {
            const chunks = this.chunkText(content);
            let successCount = 0;
            
            for (let i = 0; i < chunks.length; i++) {
                const chunkId = `${id}-chunk-${i}`;
                let embedding = null;
                
                try {
                    embedding = await nvidiaClient.generateEmbedding(chunks[i]);
                } catch (embError) {
                    console.warn(`⚠ Embedding failed for ${chunkId}, storing without embedding`);
                }
                
                this.knowledgeBase.set(chunkId, {
                    content: chunks[i],
                    embedding: embedding,
                    fallback: embedding === null,
                    metadata: {
                        ...metadata,
                        chunkIndex: i,
                        totalChunks: chunks.length
                    }
                });
                successCount++;
            }
            
            this.documentStore.set(id, {
                content,
                metadata,
                chunks: chunks.length,
                timestamp: Date.now()
            });

            return { success: true, chunks: successCount };
        } catch (error) {
            console.error('Error adding document:', error.message);
            // Still store the document even if chunking/embedding fails
            this.documentStore.set(id, {
                content,
                metadata,
                chunks: 0,
                timestamp: Date.now(),
                error: error.message
            });
            return { success: false, error: error.message };
        }
    }

    /**
     * Chunk text for embedding
     */
    chunkText(text) {
        const chunks = [];
        let start = 0;

        while (start < text.length) {
            let end = start + this.chunkSize;
            
            // Try to break at sentence boundary
            if (end < text.length) {
                const sentenceBreak = text.lastIndexOf('.', end);
                if (sentenceBreak > start + this.chunkSize * 0.5) {
                    end = sentenceBreak + 1;
                }
            }

            chunks.push(text.slice(start, end));
            start = end - this.chunkOverlap;
        }

        return chunks;
    }

    /**
     * Retrieve relevant documents (with keyword fallback)
     */
    async retrieve(query, topK = 5) {
        // Guard: empty or null query
        if (!query || typeof query !== 'string' || query.trim() === '') {
            console.warn('[RAG] retrieve() called with empty query; returning empty results');
            return [];
        }

        try {
            // Check cache
            const cacheKey = `retrieve:${query}`;
            const cached = this.cache.get(cacheKey);
            if (cached) return cached;

            let results;
            let usedEmbeddings = false;

            try {
                // Generate query embedding
                const queryEmbedding = await nvidiaClient.generateEmbedding(query);

                // Calculate similarities only against documents that have embeddings
                const similarities = [];
                
                for (const [id, doc] of this.knowledgeBase) {
                    const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
                    if (similarity !== null) {
                        similarities.push({
                            id,
                            similarity,
                            content: doc.content,
                            metadata: doc.metadata
                        });
                    }
                }

                // Sort by similarity and get top K
                results = similarities
                    .sort((a, b) => b.similarity - a.similarity)
                    .slice(0, topK);

                if (results.length > 0) {
                    usedEmbeddings = true;
                }
            } catch (embError) {
                console.warn(`[RAG] Embedding retrieval failed: ${embError.message}. Switching to keyword fallback.`);
            }

            // If embedding retrieval returned nothing (API failure or all docs lack embeddings),
            // use keyword fallback so the UI stays functional.
            if (!results || results.length === 0) {
                if (!usedEmbeddings) {
                    console.info('[RAG] Using keyword-based retrieval (no embedding results available)');
                }
                results = this._keywordRetrieve(query, topK);
            }

            // Cache results
            this.cache.set(cacheKey, results);

            return results;
        } catch (error) {
            console.error(`[RAG] Error retrieving documents: ${error.message}`);
            // Last resort: keyword fallback
            return this._keywordRetrieve(query, topK);
        }
    }

    /**
     * Keyword-based fallback retrieval when embeddings are unavailable
     */
    _keywordRetrieve(query, topK = 5) {
        if (!query || typeof query !== 'string') return [];
        const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        if (queryWords.length === 0) return [];
        const scores = [];

        for (const [id, doc] of this.knowledgeBase) {
            const contentLower = doc.content.toLowerCase();
            let score = 0;

            for (const word of queryWords) {
                const regex = new RegExp(word, 'gi');
                const matches = contentLower.match(regex);
                if (matches) {
                    score += matches.length;
                }
            }

            if (score > 0) {
                scores.push({
                    id,
                    similarity: score / queryWords.length, // Normalized score
                    content: doc.content,
                    metadata: doc.metadata
                });
            }
        }

        return scores
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);
    }

    /**
     * Generate response with context
     */
    async generateResponse(query, model = 'llama2-70b') {
        // Guard: empty query
        if (!query || typeof query !== 'string' || query.trim() === '') {
            return 'Please provide a valid question or query.';
        }

        try {
            // Retrieve relevant context
            const context = await this.retrieve(query, 3);
            
            if (!context || context.length === 0) {
                console.info('[RAG] No context documents found; answering without RAG context');
                return await nvidiaClient.generateText(query, model);
            }

            // Build context-enhanced prompt
            const contextText = context.map(doc => 
                `Document: ${doc.metadata?.title || `Untitled Document (${doc.id})`}\n${doc.content}`
            ).join('\n\n');

            const enhancedPrompt = `Context:\n${contextText}\n\nQuestion: ${query}\n\nBased on the context provided, answer the question comprehensively.`;

            return await nvidiaClient.generateText(enhancedPrompt, model, {
                temperature: 0.6,
                maxTokens: 2000
            });
        } catch (error) {
            console.error(`[RAG] Error generating response: ${error.message}`);
            // Fallback: try without context
            try {
                return await nvidiaClient.generateText(query, model);
            } catch (fallbackError) {
                console.error(`[RAG] Fallback text generation also failed: ${fallbackError.message}`);
                return `I apologize, but I'm unable to process this request at the moment. Please try again later or check your API configuration.`;
            }
        }
    }

    /**
     * Calculate cosine similarity (with null safety)
     */
    cosineSimilarity(vec1, vec2) {
        if (!vec1 || !vec2) return null;
        if (vec1.length !== vec2.length) return null;

        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }

        const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
        if (denominator === 0) return 0;

        return dotProduct / denominator;
    }

    /**
     * Add music industry knowledge (with graceful per-document error handling)
     */
    async initializeIndustryKnowledge() {
        const knowledgeDocuments = [
            {
                id: 'royalty-distribution',
                content: `Royalty distribution in the music industry follows complex structures. Streaming platforms typically pay out 70% of revenue to rights holders, with the split determined by ownership percentages. Mechanical royalties go to songwriters and publishers (9.1 cents per song in the US), while performance royalties are collected by PROs like ASCAP, BMI, and SESAC. Digital performance royalties are collected through SoundExchange. The Harry Fox Agency handles mechanical licensing for digital downloads and physical sales.`,
                metadata: { title: 'Royalty Distribution', category: 'legal' }
            },
            {
                id: 'nft-monetization',
                content: `NFT monetization in music allows artists to sell digital assets directly to fans. Smart contracts can automatically distribute royalties on secondary sales, with typical rates ranging from 5-15%. Popular blockchains for music NFTs include Ethereum, Polygon, and Solana due to lower gas fees and faster transaction times. Music NFTs can include exclusive content, concert access, and governance rights in artist DAOs.`,
                metadata: { title: 'NFT Monetization', category: 'blockchain' }
            },
            {
                id: 'platform-strategies',
                content: `Platform-specific strategies are crucial for maximum revenue. Spotify requires playlist placement for significant streams, with editorial playlists driving 20-30% of total listens. TikTok has emerged as a major discovery platform, with viral trends often leading to Spotify chart positions. YouTube monetization requires 1000 subscribers and 4000 watch hours for ad revenue. Apple Music pays higher per-stream rates averaging $0.007-0.01 compared to Spotify's $0.003-0.005.`,
                metadata: { title: 'Platform Strategies', category: 'marketing' }
            },
            {
                id: 'contract-negotiations',
                content: `Contract negotiations should focus on ownership percentages, advance terms, and royalty splits. Standard deals range from 50/50 to 80/20 artist-to-label splits. Key terms include territory, duration, mechanical royalties, performance royalties, and digital distribution rights. Independent artists should maintain ownership whenever possible. 360 deals include revenue from touring, merchandise, and endorsements.`,
                metadata: { title: 'Contract Negotiations', category: 'legal' }
            },
            {
                id: 'revenue-optimization',
                content: `Revenue optimization requires multi-platform strategy. Distribute to all major streaming platforms (Spotify, Apple Music, YouTube Music, Amazon Music, Tidal) for maximum reach. Sync licensing opportunities can generate substantial revenue, with placements paying from $500 to $50,000 depending on usage. Merchandise and touring remain significant revenue streams beyond streaming. Direct-to-fan platforms like Bandcamp allow artists to keep 82-85% of sales revenue.`,
                metadata: { title: 'Revenue Optimization', category: 'business' }
            },
            {
                id: 'ai-music-tools',
                content: `AI-powered music tools are transforming the industry. AI can assist with mastering, mixing, stem separation, and even composition. Tools like NVIDIA's audio AI models enable real-time audio processing, noise removal, and voice synthesis. AI-driven analytics help artists understand listener demographics, predict trends, and optimize release strategies. Machine learning models can analyze streaming patterns to predict which songs will perform well on specific platforms.`,
                metadata: { title: 'AI Music Tools', category: 'technology' }
            }
        ];

        let successCount = 0;
        for (const doc of knowledgeDocuments) {
            try {
                await this.addDocument(doc.id, doc.content, doc.metadata);
                successCount++;
            } catch (error) {
                console.error(`⚠ Failed to add knowledge doc "${doc.id}":`, error.message);
                // Continue with remaining documents
            }
        }

        console.log(`✅ Industry knowledge initialized: ${successCount}/${knowledgeDocuments.length} documents`);
        return { loaded: successCount, total: knowledgeDocuments.length };
    }

    /**
     * Clear all knowledge
     */
    clearKnowledge() {
        this.knowledgeBase.clear();
        this.documentStore.clear();
        this.cache.flushAll();
    }

    /**
     * Get knowledge base stats
     */
    getStats() {
        return {
            totalChunks: this.knowledgeBase.size,
            totalDocuments: this.documentStore.size,
            cacheSize: this.cache.keys().length
        };
    }
}

module.exports = new RAGSystem();