import { AgenticRAG, VectorStore, DocumentProcessor, RetrievalAgent, VerificationAgent, GenerationAgent } from '../../../lib/agents/agentic-rag.js';

// Initialize Agentic RAG system
const vectorStore = new VectorStore();
const documentProcessor = new DocumentProcessor();

const agenticRAG = new AgenticRAG({
  retrievalAgent: new RetrievalAgent({ vectorStore }),
  verificationAgent: new VerificationAgent(),
  generationAgent: new GenerationAgent(),
  vectorStore
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { action, query, documents, documentPath, topK, verificationLevel } = req.body;

      switch (action) {
        case 'query':
          // Execute an agentic RAG query with verification
          if (!query) {
            return res.status(400).json({
              success: false,
              error: 'query is required'
            });
          }
          const result = await agenticRAG.query(query, {
            topK: topK || 5,
            verificationLevel: verificationLevel || 'strict'
          });
          return res.status(200).json({
            success: true,
            query,
            result,
            verified: result.verified,
            confidence: result.confidence,
            message: result.verified ? 'Response verified and trusted' : 'Response could not be fully verified'
          });

        case 'index':
          // Index documents into the vector store
          if (!documents || !Array.isArray(documents)) {
            return res.status(400).json({
              success: false,
              error: 'documents array is required'
            });
          }
          const indexResult = await agenticRAG.indexDocuments(documents);
          return res.status(200).json({
            success: true,
            indexed: indexResult.count,
            message: `${indexResult.count} documents indexed successfully`
          });

        case 'process':
          // Process a document and extract chunks
          const processed = await documentProcessor.process(documentPath || documents);
          return res.status(200).json({
            success: true,
            chunks: processed.chunks?.length || processed.length,
            message: 'Document processed successfully'
          });

        case 'search':
          // Pure vector search without generation
          const searchResults = await vectorStore.search(query, topK || 5);
          return res.status(200).json({
            success: true,
            query,
            results: searchResults,
            count: searchResults.length
          });

        case 'verify':
          // Verify a claim against knowledge base
          const claim = req.body.claim;
          const verification = await agenticRAG.verificationAgent.verify(claim, req.body.context || {});
          return res.status(200).json({
            success: true,
            claim,
            verified: verification.verified,
            confidence: verification.confidence,
            evidence: verification.evidence,
            sources: verification.sources
          });

        case 'stats':
          // Get vector store statistics
          const stats = vectorStore.getStats();
          return res.status(200).json({
            success: true,
            stats: {
              totalDocuments: stats.totalDocuments,
              totalVectors: stats.totalVectors,
              lastUpdated: stats.lastUpdated
            }
          });

        case 'clear':
          // Clear the vector store
          vectorStore.clear();
          return res.status(200).json({
            success: true,
            message: 'Vector store cleared'
          });

        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid action. Use: query, index, process, search, verify, stats, clear'
          });
      }
    } catch (error) {
      console.error('Agentic RAG API error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET request - return API info
  return res.status(200).json({
    name: 'GOAT Agentic RAG API',
    version: '1.0.0',
    capabilities: [
      'Intelligent document retrieval',
      'Hallucination prevention',
      'Fact verification',
      'Source attribution',
      'Confidence scoring',
      'Multi-document indexing'
    ],
    endpoints: {
      'POST /api/agents/agentic-rag': {
        actions: ['query', 'index', 'process', 'search', 'verify', 'stats', 'clear'],
        description: 'Enterprise RAG with verification and hallucination prevention'
      }
    }
  });
}