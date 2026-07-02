/**
 * RAG API Routes for GOAT Royalty App
 * 
 * Provides REST API endpoints for the RAG system including:
 * - Query generation
 * - Document management
 * - System metrics
 * - Query history
 * 
 * @module RAGRoutes
 */

const express = require('express');
const router = express.Router();

// Initialize RAG system
let ragSystem = null;

/**
 * Initialize RAG system on first request
 */
async function getRAGSystem() {
  if (!ragSystem) {
    const RAGSystem = require('../services/ragSystem');
    ragSystem = new RAGSystem({
      embedding: {
        provider: process.env.RAG_EMBEDDING_PROVIDER || 'nvidia',
        model: process.env.RAG_EMBEDDING_MODEL || 'nvidia/embedding-model',
        dimension: parseInt(process.env.RAG_EMBEDDING_DIMENSION) || 1536,
        batchSize: parseInt(process.env.RAG_EMBEDDING_BATCH_SIZE) || 32
      },
      vectorDB: {
        type: process.env.RAG_VECTOR_DB_TYPE || 'chroma',
        host: process.env.RAG_VECTOR_DB_HOST || 'localhost',
        port: parseInt(process.env.RAG_VECTOR_DB_PORT) || 8000,
        collection: process.env.RAG_VECTOR_DB_COLLECTION || 'goat-royalty',
        persistDirectory: process.env.RAG_VECTOR_DB_PERSIST_DIR || './vector-db'
      },
      llm: {
        provider: process.env.RAG_LLM_PROVIDER || 'nvidia',
        model: process.env.RAG_LLM_MODEL || 'meta/llama-3.1-405b-instruct',
        apiKey: process.env.NVIDIA_API_KEY,
        maxTokens: parseInt(process.env.RAG_LLM_MAX_TOKENS) || 2048,
        temperature: parseFloat(process.env.RAG_LLM_TEMPERATURE) || 0.7
      },
      retrieval: {
        topK: parseInt(process.env.RAG_RETRIEVAL_TOP_K) || 5,
        scoreThreshold: parseFloat(process.env.RAG_RETRIEVAL_SCORE_THRESHOLD) || 0.7,
        maxContextLength: parseInt(process.env.RAG_RETRIEVAL_MAX_CONTEXT) || 4000
      },
      dataSources: {
        googleDrive: process.env.RAG_ENABLE_GOOGLE_DRIVE !== 'false',
        offlineData: process.env.RAG_ENABLE_OFFLINE_DATA !== 'false',
        localFiles: process.env.RAG_ENABLE_LOCAL_FILES !== 'false',
        offlineDataDir: process.env.RAG_OFFLINE_DATA_DIR || './offline-data',
        localDataDir: process.env.RAG_LOCAL_DATA_DIR || './data'
      },
      logFile: './logs/rag-system.log',
      enableConsole: process.env.NODE_ENV !== 'production'
    });
    
    await ragSystem.initialize();
  }
  
  return ragSystem;
}

/**
 * POST /rag/query
 * Generate a response using RAG
 */
router.post('/query', async (req, res) => {
  try {
    const { query, options } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }
    
    const system = await getRAGSystem();
    const result = await system.generateResponse(query, options);
    
    res.json(result);
    
  } catch (error) {
    console.error('RAG query error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /rag/search
 * Perform semantic search without generation
 */
router.post('/search', async (req, res) => {
  try {
    const { query, options } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }
    
    const system = await getRAGSystem();
    const results = await system.search(query, options);
    
    res.json({
      success: true,
      query,
      results,
      count: results.length
    });
    
  } catch (error) {
    console.error('RAG search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /rag/documents
 * Add a document to the knowledge base
 */
router.post('/documents', async (req, res) => {
  try {
    const { content, metadata, id } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }
    
    const system = await getRAGSystem();
    const result = await system.addDocument({ content, metadata, id });
    
    res.json(result);
    
  } catch (error) {
    console.error('Add document error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /rag/documents/:id
 * Remove a document from the knowledge base
 */
router.delete('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const system = await getRAGSystem();
    const result = await system.removeDocument(id);
    
    res.json(result);
    
  } catch (error) {
    console.error('Remove document error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /rag/documents
 * List all documents in the knowledge base
 */
router.get('/documents', async (req, res) => {
  try {
    const system = await getRAGSystem();
    
    const documents = Array.from(system.documents.values()).map(doc => ({
      id: doc.id,
      metadata: doc.metadata,
      contentLength: doc.content.length
    }));
    
    res.json({
      success: true,
      documents,
      count: documents.length
    });
    
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /rag/history
 * Get query history
 */
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const system = await getRAGSystem();
    const history = system.getQueryHistory(limit);
    
    res.json({
      success: true,
      history,
      count: history.length
    });
    
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /rag/metrics
 * Get system metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const system = await getRAGSystem();
    const metrics = system.getMetrics();
    
    res.json({
      success: true,
      metrics
    });
    
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /rag/rebuild
 * Rebuild the entire knowledge base
 */
router.post('/rebuild', async (req, res) => {
  try {
    const system = await getRAGSystem();
    
    // Clear current embeddings
    system.vectorStore.embeddings = [];
    system.vectorStore.documents = [];
    system.vectorStore.metadata = [];
    system.vectorStore.ids = [];
    system.documents.clear();
    
    // Rebuild
    await system.buildEmbeddings();
    
    res.json({
      success: true,
      message: 'Knowledge base rebuilt successfully',
      documentsCount: system.vectorStore.embeddings.length
    });
    
  } catch (error) {
    console.error('Rebuild error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /rag/status
 * Get RAG system status
 */
router.get('/status', async (req, res) => {
  try {
    const system = await getRAGSystem();
    const metrics = system.getMetrics();
    
    res.json({
      success: true,
      status: {
        initialized: true,
        vectorDB: {
          type: system.vectorStore.type,
          documents: metrics.totalDocuments
        },
        llm: {
          provider: system.config.llm.provider,
          model: system.config.llm.model
        },
        embedding: {
          provider: system.config.embedding.provider,
          dimension: system.config.embedding.dimension
        },
        dataSources: system.config.dataSources
      },
      metrics
    });
    
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;