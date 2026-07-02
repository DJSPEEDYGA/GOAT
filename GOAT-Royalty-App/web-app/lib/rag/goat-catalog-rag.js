/**
 * SUPER GOAT ROYALTIES - GOAT Force Master Works Catalog RAG System
 * 
 * This module processes the GOAT_FORCE_MASTER_WORKS_CATALOG.csv and creates
 * a RAG (Retrieval Augmented Generation) system for querying the catalog data.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

class GoatCatalogRAG {
    constructor(config = {}) {
        this.catalogPath = config.catalogPath || './GOAT_FORCE_MASTER_WORKS_CATALOG.csv';
        this.ollamaUrl = config.ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434';
        this.embeddingModel = config.embeddingModel || 'nomic-embed-text';
        this.chunks = [];
        this.embeddings = [];
        this.worksIndex = new Map();
        this.artistIndex = new Map();
    }

    /**
     * Load and parse the CSV catalog
     */
    async loadCatalog() {
        console.log('Loading GOAT Force Master Works Catalog...');
        
        try {
            const csvContent = fs.readFileSync(this.catalogPath, 'utf-8');
            const lines = csvContent.split('\n');
            const headers = lines[0].split(',');
            
            const works = [];
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCSVLine(lines[i]);
                if (values && values.length > 5) {
                    works.push({
                        partyId: values[0] || values[2],
                        memberName: values[4],
                        workTitle: values[5],
                        ascapWorkId: values[6],
                        interestedParties: values[7],
                        role: values[11],
                        society: values[12],
                        ownPercent: values[13],
                        collectPercent: values[14],
                        registrationDate: values[15],
                        registrationStatus: values[16],
                        iswcNumber: values[18]
                    });
                }
            }
            
            console.log(`Loaded ${works.length} catalog entries`);
            return works;
        } catch (error) {
            console.error('Error loading catalog:', error.message);
            return [];
        }
    }

    /**
     * Parse CSV line handling quoted fields
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        
        return result;
    }

    /**
     * Create text chunks for embedding
     */
    createChunks(works) {
        this.chunks = [];
        
        // Group works by title
        const worksByTitle = {};
        works.forEach(work => {
            if (!work.workTitle) return;
            if (!worksByTitle[work.workTitle]) {
                worksByTitle[work.workTitle] = [];
            }
            worksByTitle[work.workTitle].push(work);
        });

        // Create chunks
        Object.entries(worksByTitle).forEach(([title, workList]) => {
            const chunk = {
                id: `work-${title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20)}`,
                title: title,
                text: this.workToText(title, workList),
                metadata: {
                    workTitle: title,
                    partyCount: workList.length,
                    primaryArtist: workList[0]?.memberName,
                    ascapIds: workList.map(w => w.ascapWorkId).filter(Boolean)
                }
            };
            this.chunks.push(chunk);
            this.worksIndex.set(title.toLowerCase(), chunk);
        });

        console.log(`Created ${this.chunks.length} chunks from catalog`);
        return this.chunks;
    }

    /**
     * Convert work data to text for embedding
     */
    workToText(title, works) {
        let text = `Work Title: "${title}"\n`;
        
        const artists = new Set();
        const roles = new Set();
        const societies = new Set();
        
        works.forEach(work => {
            if (work.memberName) artists.add(work.memberName);
            if (work.interestedParties) artists.add(work.interestedParties);
            if (work.role) roles.add(work.role);
            if (work.society) societies.add(work.society);
        });
        
        if (artists.size > 0) {
            text += `Artists/Parties: ${Array.from(artists).join(', ')}\n`;
        }
        if (roles.size > 0) {
            text += `Roles: ${Array.from(roles).join(', ')}\n`;
        }
        if (societies.size > 0) {
            text += `PRO/Society: ${Array.from(societies).join(', ')}\n`;
        }
        
        text += `Number of Registrations: ${works.length}\n`;
        
        const totalOwnership = works.reduce((sum, w) => sum + (parseFloat(w.ownPercent) || 0), 0);
        text += `Total Ownership Share: ${totalOwnership.toFixed(2)}%\n`;
        
        return text;
    }

    /**
     * Generate embeddings using Ollama
     */
    async generateEmbeddings() {
        console.log('Generating embeddings...');
        this.embeddings = [];

        for (const chunk of this.chunks) {
            try {
                const response = await axios.post(`${this.ollamaUrl}/api/embeddings`, {
                    model: this.embeddingModel,
                    prompt: chunk.text
                }, { timeout: 30000 });

                this.embeddings.push({
                    id: chunk.id,
                    embedding: response.data.embedding,
                    chunk: chunk
                });
            } catch (error) {
                console.error(`Failed to embed chunk ${chunk.id}:`, error.message);
            }
        }

        console.log(`Generated ${this.embeddings.length} embeddings`);
        return this.embeddings;
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(a, b) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Search for relevant chunks
     */
    async search(query, topK = 5) {
        // Generate embedding for query
        try {
            const response = await axios.post(`${this.ollamaUrl}/api/embeddings`, {
                model: this.embeddingModel,
                prompt: query
            }, { timeout: 30000 });

            const queryEmbedding = response.data.embedding;
            
            // Calculate similarities
            const results = this.embeddings.map(item => ({
                chunk: item.chunk,
                score: this.cosineSimilarity(queryEmbedding, item.embedding)
            }));

            // Sort by score and return top K
            results.sort((a, b) => b.score - a.score);
            return results.slice(0, topK);
        } catch (error) {
            console.error('Search error:', error.message);
            // Fallback to keyword search
            return this.keywordSearch(query, topK);
        }
    }

    /**
     * Fallback keyword search
     */
    keywordSearch(query, topK = 5) {
        const queryLower = query.toLowerCase();
        const results = [];

        this.chunks.forEach(chunk => {
            const textLower = chunk.text.toLowerCase();
            const titleLower = chunk.title.toLowerCase();
            
            let score = 0;
            
            // Check for matches in title
            if (titleLower.includes(queryLower)) {
                score += 0.9;
            }
            
            // Check for matches in text
            if (textLower.includes(queryLower)) {
                score += 0.7;
            }
            
            // Check for partial matches
            const queryWords = queryLower.split(' ');
            queryWords.forEach(word => {
                if (textLower.includes(word)) {
                    score += 0.1;
                }
            });

            if (score > 0) {
                results.push({ chunk, score });
            }
        });

        results.sort((a, b) => b.score - a.score);
        return results.slice(0, topK);
    }

    /**
     * Generate RAG response
     */
    async generateResponse(query, context = null) {
        // Search for relevant context
        const searchResults = await this.search(query, 3);
        const contextText = searchResults
            .map(r => r.chunk.text)
            .join('\n\n---\n\n');

        // Create prompt with context
        const prompt = `You are the GOAT Force Master Works Catalog AI Assistant. You have access to information about music works, royalties, and catalog data. Use the provided context to answer questions accurately.

CONTEXT FROM CATALOG:
${contextText}

QUESTION: ${query}

Provide a helpful, accurate response based on the catalog data. If the information is not in the context, say so.`;

        return prompt;
    }

    /**
     * Get catalog statistics
     */
    getStats() {
        return {
            totalChunks: this.chunks.length,
            totalEmbeddings: this.embeddings.length,
            worksInIndex: this.worksIndex.size
        };
    }

    /**
     * Export catalog data for the app
     */
    exportForApp() {
        return {
            works: Array.from(this.worksIndex.entries()).map(([key, chunk]) => ({
                title: chunk.title,
                artist: chunk.metadata.primaryArtist,
                partyCount: chunk.metadata.partyCount,
                ascapIds: chunk.metadata.ascapIds
            })),
            stats: this.getStats()
        };
    }
}

// Export
module.exports = GoatCatalogRAG;