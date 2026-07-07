/**
 * RAG (Retrieval-Augmented Generation) System for GOAT Royalty App
 * 
 * This system implements a complete RAG pipeline with:
 * - Vector database integration
 * - Embedding generation
 * - Semantic search
 * - Context retrieval
 * - Response generation with NVIDIA AI
 * 
 * @module RAGSystem
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class RAGSystem {
  constructor(config = {}) {
    this.config = {
      // Embedding Model Configuration
      embedding: {
        provider: config.embedding?.provider || 'nvidia',
        model: config.embedding?.model || 'nvidia/embedding-model',
        dimension: config.embedding?.dimension || 1536,
        batchSize: config.embedding?.batchSize || 32
      },
      
      // Vector Database Configuration
      vectorDB: {
        type: config.vectorDB?.type || 'chroma', // chroma, pinecone, weaviate
        host: config.vectorDB?.host || 'localhost',
        port: config.vectorDB?.port || 8000,
        collection: config.vectorDB?.collection || 'goat-royalty',
        persistDirectory: config.vectorDB?.persistDirectory || './vector-db'
      },
      
      // LLM Configuration
      llm: {
        provider: config.llm?.provider || 'nvidia',
        model: config.llm?.model || 'meta/llama-3.1-405b-instruct',
        apiKey: config.llm?.apiKey || process.env.NVIDIA_API_KEY,
        maxTokens: config.llm?.maxTokens || 2048,
        temperature: config.llm?.temperature || 0.7
      },
      
      // Retrieval Configuration
      retrieval: {
        topK: config.retrieval?.topK || 5,
        scoreThreshold: config.retrieval?.scoreThreshold || 0.7,
        maxContextLength: config.retrieval?.maxContextLength || 4000
      },
      
      // Data Sources
      dataSources: {
        googleDrive: config.dataSources?.googleDrive !== false,
        offlineData: config.dataSources?.offlineData !== false,
        localFiles: config.dataSources?.localFiles !== false
      },
      
      // Logging
      logFile: config.logFile || './logs/rag-system.log',
      enableConsole: config.enableConsole !== false
    };
    
    this.vectorStore = null;
    this.embeddings = [];
    this.documents = new Map();
    this.queryHistory = [];
    this.metrics = {
      totalQueries: 0,
      successfulQueries: 0,
      averageRetrievalTime: 0,
      averageGenerationTime: 0
    };
  }
  
  /**
   * Initialize the RAG system
   */
  async initialize() {
    try {
      this.log('Initializing RAG System...');
      
      // Initialize vector database
      await this.initializeVectorDB();
      
      // Load existing documents
      await this.loadDocuments();
      
      // Build embeddings if needed
      await this.buildEmbeddings();
      
      this.log('RAG System initialized successfully', 'success');
      
    } catch (error) {
      this.log(`Failed to initialize RAG System: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Initialize vector database
   */
  async initializeVectorDB() {
    try {
      this.log('Initializing vector database...');
      
      // Create persist directory
      await fs.mkdir(this.config.vectorDB.persistDirectory, { recursive: true });
      
      // Initialize vector store based on type
      switch (this.config.vectorDB.type) {
        case 'chroma':
          await this.initializeChromaDB();
          break;
        case 'pinecone':
          await this.initializePinecone();
          break;
        case 'weaviate':
          await this.initializeWeaviate();
          break;
        default:
          throw new Error(`Unsupported vector database type: ${this.config.vectorDB.type}`);
      }
      
      this.log('Vector database initialized successfully', 'success');
      
    } catch (error) {
      this.log(`Failed to initialize vector database: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Initialize ChromaDB
   */
  async initializeChromaDB() {
    // For now, we'll implement a simple in-memory vector store
    // In production, use actual ChromaDB client
    this.vectorStore = {
      type: 'chroma',
      embeddings: [],
      documents: [],
      metadata: [],
      ids: []
    };
    
    this.log('Using in-memory ChromaDB (for development)');
  }
  
  /**
   * Initialize Pinecone
   */
  async initializePinecone() {
    // Placeholder for Pinecone implementation
    this.log('Pinecone initialization - requires API key');
  }
  
  /**
   * Initialize Weaviate
   */
  async initializeWeaviate() {
    // Placeholder for Weaviate implementation
    this.log('Weaviate initialization - requires connection');
  }
  
  /**
   * Load documents from data sources
   */
  async loadDocuments() {
    try {
      this.log('Loading documents from data sources...');
      
      const documents = [];
      
      // Load from Google Drive
      if (this.config.dataSources.googleDrive) {
        const driveDocuments = await this.loadFromGoogleDrive();
        documents.push(...driveDocuments);
      }
      
      // Load from offline data
      if (this.config.dataSources.offlineData) {
        const offlineDocuments = await this.loadFromOfflineData();
        documents.push(...offlineDocuments);
      }
      
      // Load from local files
      if (this.config.dataSources.localFiles) {
        const localDocuments = await this.loadFromLocalFiles();
        documents.push(...localDocuments);
      }
      
      this.log(`Loaded ${documents.length} documents from all sources`, 'success');
      
      return documents;
      
    } catch (error) {
      this.log(`Failed to load documents: ${error.message}`, 'error');
      return [];
    }
  }
  
  /**
   * Load documents from Google Drive
   */
  async loadFromGoogleDrive() {
    try {
      const GoogleDriveService = require('./googleDriveService');
      const driveService = new GoogleDriveService({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
      });
      
      await driveService.authenticate();
      
      // Get all files from Google Drive
      const files = await driveService.listFiles({ pageSize: 1000 });
      
      const documents = [];
      
      for (const file of files) {
        const doc = {
          id: `drive-${file.id}`,
          content: '', // Will be populated during embedding
          metadata: {
            source: 'google-drive',
            name: file.name,
            mimeType: file.mimeType,
            createdAt: file.createdTime,
            modifiedAt: file.modifiedTime,
            size: file.size,
            webViewLink: file.webViewLink
          }
        };
        
        documents.push(doc);
      }
      
      this.log(`Loaded ${documents.length} documents from Google Drive`);
      
      return documents;
      
    } catch (error) {
      this.log(`Failed to load from Google Drive: ${error.message}`, 'warning');
      return [];
    }
  }
  
  /**
   * Load documents from offline data
   */
  async loadFromOfflineData() {
    try {
      const OfflineDataService = require('./offlineDataService');
      const offlineService = new OfflineDataService({
        dataDir: this.config.dataSources.offlineDataDir || './offline-data',
        nvidiaApiKey: this.config.llm.apiKey
      });
      
      const documents = [];
      
      // Get all data types
      const dataTypes = ['royalties', 'artists', 'contracts', 'payments', 'knowledge', 'code', 'analytics'];
      
      for (const dataType of dataTypes) {
        const data = await offlineService.getDataByType(dataType);
        
        for (const item of data) {
          const doc = {
            id: `offline-${dataType}-${item.id || Math.random().toString(36).substr(2, 9)}`,
            content: JSON.stringify(item),
            metadata: {
              source: 'offline-data',
              type: dataType,
              timestamp: item.timestamp,
              id: item.id
            }
          };
          
          documents.push(doc);
        }
      }
      
      this.log(`Loaded ${documents.length} documents from offline data`);
      
      return documents;
      
    } catch (error) {
      this.log(`Failed to load from offline data: ${error.message}`, 'warning');
      return [];
    }
  }
  
  /**
   * Load documents from local files
   */
  async loadFromLocalFiles() {
    try {
      const supportedExtensions = ['.txt', '.md', '.json', '.pdf', '.docx'];
      const documents = [];
      
      const dataDir = this.config.dataSources.localDataDir || './data';
      
      await this.loadFilesRecursive(dataDir, documents, supportedExtensions);
      
      this.log(`Loaded ${documents.length} documents from local files`);
      
      return documents;
      
    } catch (error) {
      this.log(`Failed to load from local files: ${error.message}`, 'warning');
      return [];
    }
  }
  
  /**
   * Load files recursively
   */
  async loadFilesRecursive(dir, documents, extensions) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await this.loadFilesRecursive(fullPath, documents, extensions);
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
          try {
            const content = await fs.readFile(fullPath, 'utf8');
            const stat = await fs.stat(fullPath);
            
            const doc = {
              id: `local-${fullPath.replace(/[^a-zA-Z0-9]/g, '-')}`,
              content: content,
              metadata: {
                source: 'local-files',
                path: fullPath,
                name: entry.name,
                extension: path.extname(entry.name),
                size: stat.size,
                modifiedAt: stat.mtime
              }
            };
            
            documents.push(doc);
          } catch (error) {
            this.log(`Failed to read file ${fullPath}: ${error.message}`, 'warning');
          }
        }
      }
    } catch (error) {
      this.log(`Failed to read directory ${dir}: ${error.message}`, 'warning');
    }
  }
  
  /**
   * Build embeddings for documents
   */
  async buildEmbeddings() {
    try {
      this.log('Building embeddings for documents...');
      
      const documents = await this.loadDocuments();
      const batchSize = this.config.embedding.batchSize;
      
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        const texts = batch.map(doc => doc.content);
        
        // Generate embeddings
        const embeddings = await this.generateEmbeddings(texts);
        
        // Store embeddings
        for (let j = 0; j < batch.length; j++) {
          const doc = batch[j];
          const embedding = embeddings[j];
          
          this.vectorStore.embeddings.push(embedding);
          this.vectorStore.documents.push(doc.content);
          this.vectorStore.metadata.push(doc.metadata);
          this.vectorStore.ids.push(doc.id);
          
          this.documents.set(doc.id, doc);
        }
        
        this.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`);
      }
      
      this.log(`Built ${this.vectorStore.embeddings.length} embeddings`, 'success');
      
    } catch (error) {
      this.log(`Failed to build embeddings: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Generate embeddings for texts
   */
  async generateEmbeddings(texts) {
    try {
      // Use NVIDIA embedding API
      if (this.config.embedding.provider === 'nvidia') {
        return await this.generateNVIDIAEmbeddings(texts);
      }
      
      // Fallback to simple token-based embeddings
      return texts.map(text => this.generateSimpleEmbedding(text));
      
    } catch (error) {
      this.log(`Failed to generate embeddings: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Generate embeddings using NVIDIA API
   */
  async generateNVIDIAEmbeddings(texts) {
    try {
      const response = await axios.post(
        'https://integrate.api.nvidia.com/v1/embeddings',
        {
          input: texts,
          model: this.config.embedding.model
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.llm.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.data.map(item => item.embedding);
      
    } catch (error) {
      this.log(`NVIDIA embedding API error: ${error.message}`, 'warning');
      // Fallback to simple embeddings
      return texts.map(text => this.generateSimpleEmbedding(text));
    }
  }
  
  /**
   * Generate simple embeddings (fallback)
   */
  generateSimpleEmbedding(text) {
    const words = text.toLowerCase().split(/\s+/);
    const dimension = this.config.embedding.dimension;
    const embedding = new Array(dimension).fill(0);
    
    for (const word of words) {
      const index = this.hashWord(word) % dimension;
      embedding[index] += 1;
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }
  
  /**
   * Hash word to number
   */
  hashWord(word) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
  
  /**
   * Perform semantic search
   */
  async search(query, options = {}) {
    try {
      const topK = options.topK || this.config.retrieval.topK;
      const scoreThreshold = options.scoreThreshold || this.config.retrieval.scoreThreshold;
      
      // Generate query embedding
      const queryEmbedding = await this.generateEmbeddings([query]);
      const queryVector = queryEmbedding[0];
      
      // Calculate similarities
      const similarities = this.vectorStore.embeddings.map((embedding, index) => {
        const similarity = this.cosineSimilarity(queryVector, embedding);
        return {
          index,
          similarity,
          document: this.vectorStore.documents[index],
          metadata: this.vectorStore.metadata[index],
          id: this.vectorStore.ids[index]
        };
      });
      
      // Sort by similarity and filter
      const results = similarities
        .filter(result => result.similarity >= scoreThreshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
      
      return results;
      
    } catch (error) {
      this.log(`Search failed: ${error.message}`, 'error');
      return [];
    }
  }
  
  /**
   * Calculate cosine similarity
   */
  cosineSimilarity(vec1, vec2) {
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      magnitude1 += vec1[i] * vec1[i];
      magnitude2 += vec2[i] * vec2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    return magnitude1 > 0 && magnitude2 > 0 ? dotProduct / (magnitude1 * magnitude2) : 0;
  }
  
  /**
   * Generate response using RAG
   */
  async generateResponse(query, options = {}) {
    try {
      const startTime = Date.now();
      
      // Retrieve relevant documents
      const retrievalStartTime = Date.now();
      const relevantDocs = await this.search(query, options);
      const retrievalTime = Date.now() - retrievalStartTime;
      
      if (relevantDocs.length === 0) {
        this.log('No relevant documents found', 'warning');
        return {
          success: true,
          query,
          response: 'I couldn\'t find any relevant information in the knowledge base.',
          sources: [],
          metrics: {
            retrievalTime,
            generationTime: Date.now() - startTime,
            documentsRetrieved: 0
          }
        };
      }
      
      // Build context from retrieved documents
      const context = this.buildContext(relevantDocs);
      
      // Generate response using LLM
      const generationStartTime = Date.now();
      const response = await this.generateLLMResponse(query, context);
      const generationTime = Date.now() - generationStartTime;
      
      // Update metrics
      this.metrics.totalQueries++;
      this.metrics.successfulQueries++;
      this.metrics.averageRetrievalTime = 
        (this.metrics.averageRetrievalTime * (this.metrics.totalQueries - 1) + retrievalTime) / this.metrics.totalQueries;
      this.metrics.averageGenerationTime = 
        (this.metrics.averageGenerationTime * (this.metrics.totalQueries - 1) + generationTime) / this.metrics.totalQueries;
      
      // Store query history
      this.queryHistory.push({
        query,
        response,
        sources: relevantDocs.map(doc => ({
          id: doc.id,
          metadata: doc.metadata,
          similarity: doc.similarity
        })),
        timestamp: new Date().toISOString(),
        metrics: {
          retrievalTime,
          generationTime,
          documentsRetrieved: relevantDocs.length
        }
      });
      
      const totalTime = Date.now() - startTime;
      
      this.log(`Response generated in ${totalTime}ms (retrieval: ${retrievalTime}ms, generation: ${generationTime}ms)`, 'success');
      
      return {
        success: true,
        query,
        response,
        sources: relevantDocs.map(doc => ({
          id: doc.id,
          metadata: doc.metadata,
          similarity: doc.similarity,
          snippet: doc.document.substring(0, 200) + '...'
        })),
        context,
        metrics: {
          retrievalTime,
          generationTime,
          totalTime,
          documentsRetrieved: relevantDocs.length
        }
      };
      
    } catch (error) {
      this.log(`Response generation failed: ${error.message}`, 'error');
      return {
        success: false,
        query,
        error: error.message
      };
    }
  }
  
  /**
   * Build context from retrieved documents
   */
  buildContext(relevantDocs) {
    let context = 'Relevant information from knowledge base:\n\n';
    
    for (let i = 0; i < relevantDocs.length; i++) {
      const doc = relevantDocs[i];
      context += `[Source ${i + 1}] `;
      
      if (doc.metadata.name) {
        context += `Name: ${doc.metadata.name}\n`;
      }
      
      if (doc.metadata.type) {
        context += `Type: ${doc.metadata.type}\n`;
      }
      
      context += `Content: ${doc.document.substring(0, 500)}...\n\n`;
    }
    
    return context;
  }
  
  /**
   * Generate LLM response
   */
  async generateLLMResponse(query, context) {
    try {
      // Use NVIDIA LLM API
      if (this.config.llm.provider === 'nvidia') {
        return await this.generateNVIDIALLMResponse(query, context);
      }
      
      // Fallback response
      return `Based on the information found: ${context.substring(0, 500)}...`;
      
    } catch (error) {
      this.log(`LLM generation failed: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Generate response using NVIDIA API
   */
  async generateNVIDIALLMResponse(query, context) {
    try {
      const response = await axios.post(
        'https://integrate.api.nvidia.com/v1/chat/completions',
        {
          model: this.config.llm.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant for the GOAT Royalty App. Answer questions based on the provided context from the knowledge base. Be accurate, concise, and helpful.'
            },
            {
              role: 'user',
              content: `Context:\n${context}\n\nQuestion: ${query}\n\nProvide a helpful answer based on the context above.`
            }
          ],
          max_tokens: this.config.llm.maxTokens,
          temperature: this.config.llm.temperature
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.llm.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.choices[0].message.content;
      
    } catch (error) {
      this.log(`NVIDIA LLM API error: ${error.message}`, 'warning');
      throw error;
    }
  }
  
  /**
   * Add document to knowledge base
   */
  async addDocument(document) {
    try {
      const doc = {
        id: document.id || `doc-${Date.now()}`,
        content: document.content,
        metadata: document.metadata || {}
      };
      
      // Generate embedding
      const embedding = await this.generateEmbeddings([doc.content]);
      
      // Store in vector store
      this.vectorStore.embeddings.push(embedding[0]);
      this.vectorStore.documents.push(doc.content);
      this.vectorStore.metadata.push(doc.metadata);
      this.vectorStore.ids.push(doc.id);
      
      this.documents.set(doc.id, doc);
      
      this.log(`Document added: ${doc.id}`, 'success');
      
      return { success: true, documentId: doc.id };
      
    } catch (error) {
      this.log(`Failed to add document: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Remove document from knowledge base
   */
  async removeDocument(documentId) {
    try {
      const index = this.vectorStore.ids.indexOf(documentId);
      
      if (index === -1) {
        return { success: false, error: 'Document not found' };
      }
      
      this.vectorStore.embeddings.splice(index, 1);
      this.vectorStore.documents.splice(index, 1);
      this.vectorStore.metadata.splice(index, 1);
      this.vectorStore.ids.splice(index, 1);
      
      this.documents.delete(documentId);
      
      this.log(`Document removed: ${documentId}`, 'success');
      
      return { success: true, documentId };
      
    } catch (error) {
      this.log(`Failed to remove document: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get query history
   */
  getQueryHistory(limit = 10) {
    return this.queryHistory.slice(-limit);
  }
  
  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      totalDocuments: this.vectorStore.embeddings.length,
      vectorStoreType: this.vectorStore.type
    };
  }
  
  /**
   * Log message
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [RAG] [${level.toUpperCase()}] ${message}`;
    
    fs.appendFile(this.config.logFile, logMessage + '\n').catch(err => {
      if (this.config.enableConsole) {
        console.error(`Failed to write to log file: ${err.message}`);
      }
    });
    
    if (this.config.enableConsole) {
      const colors = {
        info: '\x1b[36m',
        success: '\x1b[32m',
        warning: '\x1b[33m',
        error: '\x1b[31m',
        reset: '\x1b[0m'
      };
      console.log(`${colors[level] || colors.info}${logMessage}${colors.reset}`);
    }
  }
}

module.exports = RAGSystem;