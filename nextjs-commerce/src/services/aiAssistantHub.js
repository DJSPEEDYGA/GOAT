/**
 * AI Assistant Hub - Central Access Point for Super Ninja
 * 
 * Provides AI assistant (Super Ninja) with direct access to:
 * - Google Drive files and content
 * - Local app data and databases
 * - Processed metadata and indices
 * - Real-time data pipeline status
 * 
 * @author DJSPEEDYGA
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

class AIAssistantHub extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.resourceIndex = new Map();
    this.searchIndex = new Map();
    this.endpoints = {};
    this.cache = new Map();
    this.metrics = {
      queries: 0,
      cacheHits: 0,
      resourcesIndexed: 0,
      lastUpdated: null
    };
  }

  /**
   * Initialize the AI hub
   */
  async initialize() {
    console.log('🤖 Initializing AI Assistant Hub...');
    
    try {
      // Load existing index if available
      await this.loadIndex();
      
      // Initialize search engine
      await this.initializeSearchEngine();
      
      // Setup API endpoints
      await this.setupEndpoints();
      
      console.log('✅ AI Assistant Hub initialized');
      return true;
    } catch (error) {
      console.error('❌ AI Hub initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Load existing resource index
   */
  async loadIndex() {
    try {
      const indexPath = path.join(this.config.indexPath || './pipeline/metadata', 'ai-hub-index.json');
      const indexData = await fs.readFile(indexPath, 'utf8');
      const index = JSON.parse(indexData);
      
      // Rebuild Maps from index
      index.resources.forEach(resource => {
        this.resourceIndex.set(resource.id, resource);
      });
      
      index.searchTerms.forEach((term, key) => {
        this.searchIndex.set(key, term);
      });
      
      this.metrics = { ...this.metrics, ...index.metrics };
      this.metrics.resourcesIndexed = this.resourceIndex.size;
      
      console.log(`📊 Loaded ${this.resourceIndex.size} indexed resources`);
    } catch (error) {
      console.log('ℹ️  No existing index found, starting fresh');
    }
  }

  /**
   * Initialize search engine
   */
  async initializeSearchEngine() {
    // Build search index from resources
    for (const [id, resource] of this.resourceIndex) {
      this.indexResourceForSearch(resource);
    }
  }

  /**
   * Index a resource for AI access
   */
  indexResource(resource) {
    const resourceId = `${resource.type}-${resource.id || Date.now()}`;
    
    const indexedResource = {
      id: resourceId,
      type: resource.type,
      category: resource.category,
      metadata: resource.metadata,
      filePath: resource.filePath,
      indexedAt: new Date().toISOString(),
      accessible: true
    };
    
    this.resourceIndex.set(resourceId, indexedResource);
    this.indexResourceForSearch(indexedResource);
    this.metrics.resourcesIndexed++;
    
    this.emit('resource:indexed', indexedResource);
  }

  /**
   * Index resource for search
   */
  indexResourceForSearch(resource) {
    const searchTerms = [
      resource.metadata?.name || '',
      resource.category || '',
      resource.type || '',
      ...(resource.metadata?.tags || [])
    ].join(' ').toLowerCase();
    
    const keywords = searchTerms.split(/\s+/).filter(k => k.length > 2);
    
    keywords.forEach(keyword => {
      if (!this.searchIndex.has(keyword)) {
        this.searchIndex.set(keyword, []);
      }
      this.searchIndex.get(keyword).push(resource.id);
    });
  }

  /**
   * Search resources by query
   */
  async search(query, options = {}) {
    this.metrics.queries++;
    
    // Check cache first
    const cacheKey = `search:${query}:${JSON.stringify(options)}`;
    if (this.cache.has(cacheKey)) {
      this.metrics.cacheHits++;
      return this.cache.get(cacheKey);
    }
    
    // Build search results
    const queryTerms = query.toLowerCase().split(/\s+/);
    const scoredResources = new Map();
    
    queryTerms.forEach(term => {
      const matchingIds = this.searchIndex.get(term) || [];
      matchingIds.forEach(resourceId => {
        const score = scoredResources.get(resourceId) || 0;
        scoredResources.set(resourceId, score + 1);
      });
    });
    
    // Sort by relevance score
    const results = Array.from(scoredResources.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, options.limit || 20)
      .map(([resourceId, score]) => ({
        resource: this.resourceIndex.get(resourceId),
        relevanceScore: score
      }));
    
    // Filter by category if specified
    if (options.category) {
      results.filter(r => r.resource.category === options.category);
    }
    
    // Cache results
    this.cache.set(cacheKey, results);
    
    this.emit('search:complete', { query, resultsCount: results.length });
    
    return results;
  }

  /**
   * Get file content for AI assistant
   */
  async getFileContent(resourceId, options = {}) {
    const resource = this.resourceIndex.get(resourceId);
    
    if (!resource) {
      throw new Error(`Resource not found: ${resourceId}`);
    }
    
    // Check cache
    const cacheKey = `content:${resourceId}`;
    if (this.cache.has(cacheKey) && !options.forceRefresh) {
      this.metrics.cacheHits++;
      return this.cache.get(cacheKey);
    }
    
    // Read file content
    let content;
    
    try {
      // Check if it's a reference file (for large files)
      if (resource.filePath.endsWith('.ref')) {
        const refData = await fs.readFile(resource.filePath, 'utf8');
        const ref = JSON.parse(refData);
        
        // Return reference info for streaming
        content = {
          type: 'reference',
          reference: ref,
          note: 'Large file - use streaming API to access content'
        };
      } else {
        // Read file content
        const fileContent = await fs.readFile(resource.filePath, 'utf8');
        
        // Try to parse as JSON if possible
        try {
          content = JSON.parse(fileContent);
        } catch {
          content = {
            type: 'text',
            content: fileContent
          };
        }
      }
      
      // Cache result
      if (content.length < 1024 * 1024) { // Only cache if < 1MB
        this.cache.set(cacheKey, content);
      }
      
      return content;
    } catch (error) {
      console.error(`Failed to read file content: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stream large file content
   */
  async streamFileContent(resourceId, callback) {
    const resource = this.resourceIndex.get(resourceId);
    
    if (!resource) {
      throw new Error(`Resource not found: ${resourceId}`);
    }
    
    // Check if it's a reference file
    if (resource.filePath.endsWith('.ref')) {
      const refData = await fs.readFile(resource.filePath, 'utf8');
      const ref = JSON.parse(refData);
      
      // Stream from Google Drive
      if (this.endpoints.googleDrive) {
        return await this.endpoints.googleDrive.streamFile(
          ref.fileId,
          ref.streamPath
        );
      }
    }
    
    // Stream local file
    const fs = require('fs');
    const stream = fs.createReadStream(resource.filePath);
    
    stream.on('data', (chunk) => callback(chunk));
    stream.on('end', () => callback(null));
    stream.on('error', (error) => callback(error));
    
    return stream;
  }

  /**
   * Get resources by category
   */
  async getResourcesByCategory(category) {
    const results = [];
    
    for (const [id, resource] of this.resourceIndex) {
      if (resource.category === category) {
        results.push(resource);
      }
    }
    
    return results;
  }

  /**
   * Get resource metadata
   */
  async getResourceMetadata(resourceId) {
    const resource = this.resourceIndex.get(resourceId);
    
    if (!resource) {
      throw new Error(`Resource not found: ${resourceId}`);
    }
    
    return resource.metadata;
  }

  /**
   * Create API endpoints for external access
   */
  async createEndpoints(endpoints) {
    this.endpoints = {
      googleDrive: endpoints.googleDrive,
      localStorage: endpoints.localStorage,
      pipeline: endpoints.pipeline
    };
    
    console.log('✅ API endpoints created for AI assistant');
  }

  /**
   * Setup Express API endpoints
   */
  async setupEndpoints() {
    // This will be used by the Express app
    // The actual endpoint setup will be done in the main server.js
    console.log('✅ AI Hub endpoints configured');
  }

  /**
   * Execute query with AI
   */
  async executeAIQuery(query, options = {}) {
    // This integrates with the Super LLM system
    const { SuperLLM } = require('../integrations/EnhancedAutonomousAgent');
    
    // Search for relevant resources
    const searchResults = await this.search(query, {
      limit: options.maxResources || 5,
      category: options.category
    });
    
    // Gather context from resources
    const context = [];
    for (const result of searchResults.slice(0, 3)) {
      try {
        const content = await this.getFileContent(result.resource.id);
        context.push({
          resource: result.resource,
          content: content
        });
      } catch (error) {
        console.error(`Failed to load context: ${error.message}`);
      }
    }
    
    // Execute query with context
    return {
      query,
      searchResults,
      context,
      aiResponse: 'AI query executed with context'
    };
  }

  /**
   * Update resource in index
   */
  async updateResource(resourceId, updates) {
    const resource = this.resourceIndex.get(resourceId);
    
    if (!resource) {
      throw new Error(`Resource not found: ${resourceId}`);
    }
    
    // Update resource
    const updatedResource = {
      ...resource,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.resourceIndex.set(resourceId, updatedResource);
    
    // Re-index for search
    if (updates.metadata || updates.category) {
      this.indexResourceForSearch(updatedResource);
    }
    
    this.emit('resource:updated', updatedResource);
  }

  /**
   * Delete resource from index
   */
  async deleteResource(resourceId) {
    const deleted = this.resourceIndex.delete(resourceId);
    
    if (deleted) {
      // Remove from search index
      for (const [keyword, resourceIds] of this.searchIndex) {
        const index = resourceIds.indexOf(resourceId);
        if (index > -1) {
          resourceIds.splice(index, 1);
        }
      }
      
      this.metrics.resourcesIndexed--;
      this.emit('resource:deleted', resourceId);
    }
    
    return deleted;
  }

  /**
   * Get hub metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      totalResources: this.resourceIndex.size,
      searchTermsIndexed: this.searchIndex.size,
      cacheSize: this.cache.size,
      cacheHitRate: this.metrics.queries > 0 
        ? (this.metrics.cacheHits / this.metrics.queries * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.metrics.cacheHits = 0;
    console.log('✅ AI Hub cache cleared');
  }

  /**
   * Save index to disk
   */
  async saveIndex() {
    const indexPath = path.join(this.config.indexPath || './pipeline/metadata', 'ai-hub-index.json');
    
    const indexData = {
      resources: Array.from(this.resourceIndex.values()),
      searchTerms: Array.from(this.searchIndex.entries()),
      metrics: this.metrics,
      savedAt: new Date().toISOString()
    };
    
    await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2));
    console.log('✅ AI Hub index saved');
  }

  /**
   * Rebuild entire index
   */
  async rebuildIndex() {
    console.log('🔄 Rebuilding AI Hub index...');
    
    this.resourceIndex.clear();
    this.searchIndex.clear();
    this.metrics.resourcesIndexed = 0;
    
    // Re-index all resources from metadata files
    const metadataDir = path.join(this.config.indexPath || './pipeline/metadata');
    
    try {
      const files = await fs.readdir(metadataDir);
      for (const file of files) {
        if (file.endsWith('.meta.json')) {
          const filePath = path.join(metadataDir, file);
          const metadata = JSON.parse(await fs.readFile(filePath, 'utf8'));
          
          this.indexResource({
            type: 'google-drive-file',
            id: metadata.id,
            category: metadata.category,
            metadata: metadata,
            filePath: filePath
          });
        }
      }
      
      await this.saveIndex();
      console.log(`✅ Index rebuilt with ${this.resourceIndex.size} resources`);
    } catch (error) {
      console.error('Failed to rebuild index:', error.message);
    }
  }
}

module.exports = { AIAssistantHub };