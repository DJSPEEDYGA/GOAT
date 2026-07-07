# RAG System Implementation Guide

## Overview

The GOAT Royalty App now includes a complete **Retrieval-Augmented Generation (RAG) system** that enables intelligent AI chatbot capabilities with domain-specific knowledge from your Google Drive vault, offline data, and local files.

## What is RAG?

Retrieval-Augmented Generation (RAG) is an AI technique that:
- Combines a large language model (LLM) with an external knowledge base
- Retrieves relevant information before generating responses
- Provides accurate, domain-specific answers
- Reduces hallucinations by grounding responses in actual data
- Enables the AI to access up-to-date information beyond its training data

## Features

### ✅ Core Capabilities

1. **Vector Database Integration**
   - ChromaDB support (in-memory for development)
   - Pinecone and Weaviate support (coming soon)
   - Persistent storage of embeddings
   - Efficient similarity search

2. **Multi-Source Data Integration**
   - Google Drive (syncs with your 6.5 TB vault)
   - Offline data (staged from Google Sheets)
   - Local files (documents, PDFs, text files)
   - Real-time updates

3. **Semantic Search**
   - Embedding generation with NVIDIA AI
   - Cosine similarity for relevance scoring
   - Configurable top-K results
   - Score threshold filtering

4. **Context-Aware Responses**
   - Relevant document retrieval
   - Context building from multiple sources
   - LLM-powered response generation
   - Source citation and transparency

5. **Document Management**
   - Add documents to knowledge base
   - Remove documents
   - Rebuild entire knowledge base
   - Automatic embedding updates

6. **Query Analytics**
   - Query history tracking
   - Performance metrics
   - Retrieval and generation timing
   - Success rate monitoring

## Architecture

```
User Query
    ↓
RAG System
    ↓
┌─────────────────────────────────────┐
│  Query Embedding Generation         │
│  (NVIDIA Embedding Model)           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Vector Similarity Search           │
│  (ChromaDB)                         │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Top-K Relevant Documents           │
│  (Scored & Filtered)                │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Context Building                   │
│  (Combine retrieved content)        │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  LLM Response Generation            │
│  (NVIDIA LLM)                       │
└─────────────────────────────────────┘
    ↓
Final Response with Sources
```

## API Endpoints

### Query Generation

**POST /api/rag/query**
Generate a response using RAG

```json
{
  "query": "What are the royalty rates for streaming services?",
  "options": {
    "topK": 5,
    "scoreThreshold": 0.7
  }
}
```

**Response:**
```json
{
  "success": true,
  "query": "What are the royalty rates for streaming services?",
  "response": "Based on the documents...",
  "sources": [
    {
      "id": "doc-123",
      "metadata": {
        "source": "google-drive",
        "name": "royalty-rates.pdf"
      },
      "similarity": 0.95,
      "snippet": "Spotify pays $0.00318 per stream..."
    }
  ],
  "context": "...",
  "metrics": {
    "retrievalTime": 150,
    "generationTime": 1200,
    "totalTime": 1350,
    "documentsRetrieved": 5
  }
}
```

### Semantic Search

**POST /api/rag/search**
Perform semantic search without generation

```json
{
  "query": "contract termination clauses",
  "options": {
    "topK": 10,
    "scoreThreshold": 0.6
  }
}
```

**Response:**
```json
{
  "success": true,
  "query": "contract termination clauses",
  "results": [...],
  "count": 8
}
```

### Document Management

**POST /api/rag/documents**
Add a document to knowledge base

```json
{
  "content": "Document content here...",
  "metadata": {
    "source": "manual",
    "type": "contract",
    "name": "Artist Contract 2024"
  },
  "id": "contract-001"
}
```

**DELETE /api/rag/documents/:id**
Remove a document from knowledge base

**GET /api/rag/documents**
List all documents in knowledge base

**POST /api/rag/rebuild**
Rebuild entire knowledge base

### System Monitoring

**GET /api/rag/history**
Get query history

**GET /api/rag/metrics**
Get system metrics

**GET /api/rag/status**
Get RAG system status

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# RAG System Configuration

# Embedding Settings
RAG_EMBEDDING_PROVIDER=nvidia
RAG_EMBEDDING_MODEL=nvidia/embedding-model
RAG_EMBEDDING_DIMENSION=1536
RAG_EMBEDDING_BATCH_SIZE=32

# Vector Database
RAG_VECTOR_DB_TYPE=chroma
RAG_VECTOR_DB_HOST=localhost
RAG_VECTOR_DB_PORT=8000
RAG_VECTOR_DB_COLLECTION=goat-royalty
RAG_VECTOR_DB_PERSIST_DIR=./vector-db

# LLM Settings
RAG_LLM_PROVIDER=nvidia
RAG_LLM_MODEL=meta/llama-3.1-405b-instruct
RAG_LLM_MAX_TOKENS=2048
RAG_LLM_TEMPERATURE=0.7

# Retrieval Settings
RAG_RETRIEVAL_TOP_K=5
RAG_RETRIEVAL_SCORE_THRESHOLD=0.7
RAG_RETRIEVAL_MAX_CONTEXT=4000

# Data Sources
RAG_ENABLE_GOOGLE_DRIVE=true
RAG_ENABLE_OFFLINE_DATA=true
RAG_ENABLE_LOCAL_FILES=true
RAG_OFFLINE_DATA_DIR=./offline-data
RAG_LOCAL_DATA_DIR=./data

# NVIDIA API Key (required)
NVIDIA_API_KEY=your_nvidia_api_key_here
```

## Usage Examples

### Basic Query

```javascript
const response = await fetch('/api/rag/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'How do I calculate mechanical royalties?'
  })
});

const data = await response.json();
console.log(data.response);
console.log('Sources:', data.sources);
```

### Add Custom Document

```javascript
const response = await fetch('/api/rag/documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Custom royalty calculation rules...',
    metadata: {
      source: 'manual',
      type: 'knowledge',
      name: 'Royalty Rules 2024'
    }
  })
});
```

### Get Query History

```javascript
const response = await fetch('/api/rag/history?limit=20');
const data = await response.json();
console.log('Recent queries:', data.history);
```

### System Status Check

```javascript
const response = await fetch('/api/rag/status');
const data = await response.json();
console.log('System status:', data.status);
console.log('Metrics:', data.metrics);
```

## Integration with Existing Features

### Google Drive Pipeline

The RAG system automatically integrates with your Google Drive pipeline:
- Syncs files from your 6.5 TB vault
- Processes documents as they're added
- Updates embeddings automatically
- Supports all file types (PDFs, DOCX, TXT, etc.)

### Offline Mode

Works seamlessly with offline mode:
- Accesses staged data from Google Sheets
- Processes queries without internet
- Uses local embeddings
- Falls back to simple embeddings if API unavailable

### AI Assistant Hub

Complements the existing AI Assistant Hub:
- Enhanced search with semantic understanding
- Context-aware responses
- Source transparency
- Better accuracy for domain-specific queries

## Performance Optimization

### Embedding Generation

- **Batch Processing**: Processes documents in batches (32 by default)
- **Caching**: Stores embeddings to avoid regeneration
- **Async Processing**: Non-blocking operations

### Search Performance

- **Vector Indexing**: Efficient similarity search
- **Top-K Limitation**: Limits results to improve speed
- **Score Threshold**: Filters out irrelevant results

### Response Generation

- **Context Truncation**: Limits context length for faster generation
- **Token Limits**: Controls response length
- **Temperature Control**: Balances creativity and accuracy

## Monitoring and Analytics

### Query Metrics

Track:
- Total queries
- Success rate
- Average retrieval time
- Average generation time
- Documents retrieved per query

### Document Metrics

Monitor:
- Total documents in knowledge base
- Documents by source (Google Drive, offline, local)
- Documents by type
- Embedding count

### Performance Metrics

Measure:
- Query latency
- Embedding generation time
- Search time
- Generation time

## Troubleshooting

### Common Issues

**1. No documents found**
- Check data source configuration
- Verify Google Drive sync is working
- Ensure offline data directory exists
- Check logs for errors

**2. Slow response times**
- Reduce top-K value
- Increase score threshold
- Check NVIDIA API rate limits
- Consider using a local embedding model

**3. API errors**
- Verify NVIDIA_API_KEY is set
- Check API key permissions
- Monitor API quota usage
- Check network connectivity

**4. Outdated information**
- Rebuild knowledge base regularly
- Sync Google Drive frequently
- Update offline data
- Clear and rebuild embeddings

### Debug Mode

Enable console logging:
```env
NODE_ENV=development
```

Check logs:
```bash
tail -f logs/rag-system.log
```

## Best Practices

1. **Regular Updates**
   - Rebuild knowledge base weekly
   - Sync Google Drive daily
   - Update offline data regularly

2. **Query Optimization**
   - Use specific, clear questions
   - Include relevant context
   - Refine queries based on sources

3. **Document Management**
   - Organize documents by type
   - Use meaningful metadata
   - Remove outdated documents
   - Add new documents regularly

4. **Performance Tuning**
   - Adjust top-K based on needs
   - Set appropriate score thresholds
   - Monitor API usage
   - Optimize batch sizes

## Future Enhancements

Planned features:
- [ ] Pinecone vector database integration
- [ ] Weaviate vector database integration
- [ ] Multi-modal support (images, audio)
- [ ] Hybrid search (semantic + keyword)
- [ ] Query suggestion and autocomplete
- [ ] Document versioning
- [ ] Advanced filtering options
- [ ] Real-time embedding updates
- [ ] Distributed processing
- [ ] GPU acceleration

## Support

For issues or questions:
- Check logs: `logs/rag-system.log`
- Review API responses
- Verify configuration
- Check NVIDIA API status

## Conclusion

The RAG system transforms the GOAT Royalty App into an intelligent, knowledge-driven platform that can answer questions based on your actual data, documents, and contracts. Combined with Google Drive integration, offline mode, and AI capabilities, this creates a truly comprehensive royalty management solution.

**The GOAT Royalty App is now THE GREATEST ROYALTY APP OF ALL TIME with AI-powered intelligence!** 🐐🏆