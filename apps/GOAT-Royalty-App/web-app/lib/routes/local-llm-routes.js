/**
 * SUPER GOAT ROYALTIES - Local LLM API Routes
 * 
 * Endpoints for interacting with local LLM servers (Ollama, LM Studio)
 */

const express = require('express');
const router = express.Router();
const localLLMClient = require('../ai/local-llm-client');
const GoatCatalogRAG = require('../rag/goat-catalog-rag');

// Initialize RAG system
let catalogRAG = null;

/**
 * GET /api/llm/status
 * Get local LLM server status
 */
router.get('/status', async (req, res) => {
    try {
        const status = localLLMClient.getStatus();
        res.json({
            success: true,
            ...status,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/llm/models
 * List available models
 */
router.get('/models', async (req, res) => {
    try {
        const models = await localLLMClient.loadAvailableModels();
        res.json({
            success: true,
            provider: localLLMClient.preferredProvider,
            models: models
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/llm/chat
 * Chat completion endpoint
 */
router.post('/chat', async (req, res) => {
    try {
        const { messages, model, temperature, maxTokens } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                success: false,
                error: 'Messages array is required'
            });
        }

        const result = await localLLMClient.chatCompletion(messages, {
            model: model || localLLMClient.defaultModel,
            temperature: temperature || 0.7,
            maxTokens: maxTokens || 2000
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/llm/pull
 * Pull a new model from registry
 */
router.post('/pull', async (req, res) => {
    try {
        const { modelName } = req.body;
        
        if (!modelName) {
            return res.status(400).json({
                success: false,
                error: 'Model name is required'
            });
        }

        const result = await localLLMClient.pullModel(modelName);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/llm/embeddings
 * Generate embeddings for text
 */
router.post('/embeddings', async (req, res) => {
    try {
        const { text, model } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text is required'
            });
        }

        const result = await localLLMClient.generateEmbeddings(text, model);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/llm/royalty-query
 * Query royalty information with RAG
 */
router.post('/royalty-query', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query is required'
            });
        }

        // Initialize RAG if not already done
        if (!catalogRAG) {
            catalogRAG = new GoatCatalogRAG();
            const works = await catalogRAG.loadCatalog();
            catalogRAG.createChunks(works);
        }

        // Search catalog
        const searchResults = await catalogRAG.search(query, 5);
        
        // Generate response prompt
        const ragPrompt = await catalogRAG.generateResponse(query);

        // Get AI response
        const messages = [
            { role: 'system', content: ragPrompt },
            { role: 'user', content: query }
        ];

        const aiResponse = await localLLMClient.chatCompletion(messages);

        res.json({
            success: true,
            query: query,
            response: aiResponse.message?.content || aiResponse.message,
            context: searchResults.map(r => ({
                title: r.chunk?.title,
                score: r.score
            })),
            provider: aiResponse.provider,
            isDemo: aiResponse.isDemo || false
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/llm/catalog/stats
 * Get catalog statistics
 */
router.get('/catalog/stats', async (req, res) => {
    try {
        if (!catalogRAG) {
            catalogRAG = new GoatCatalogRAG();
            const works = await catalogRAG.loadCatalog();
            catalogRAG.createChunks(works);
        }

        const stats = catalogRAG.getStats();
        const exportedData = catalogRAG.exportForApp();

        res.json({
            success: true,
            stats: stats,
            sampleWorks: exportedData.works.slice(0, 10),
            totalWorks: exportedData.works.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/llm/stream
 * Streaming chat endpoint (Server-Sent Events)
 */
router.post('/stream', async (req, res) => {
    try {
        const { messages, model } = req.body;
        
        if (!messages) {
            return res.status(400).json({
                success: false,
                error: 'Messages are required'
            });
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of localLLMClient.streamChat(messages, { model })) {
            if (chunk.error) {
                res.write(`data: ${JSON.stringify({ error: chunk.error })}\n\n`);
                break;
            }
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;