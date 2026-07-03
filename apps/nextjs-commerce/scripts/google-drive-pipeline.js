/**
 * GOAT Royalty App - Google Drive Data Pipeline
 * 
 * This script creates a bidirectional data pipeline between:
 * 1. Google Drive (6.5 TB vault) → GOAT Royalty App
 * 2. GOAT Royalty App → Google Drive (backup/sync)
 * 3. AI Assistant ← Direct access to both systems
 * 
 * @author DJSPEEDYGA
 * @version 1.0.0
 */

const { GoogleDriveAPI } = require('../services/googleDriveService');
const { DataProcessor } = require('../services/dataProcessor');
const { AIAssistantHub } = require('../services/aiAssistantHub');
const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');

class GoogleDriveDataPipeline extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.googleDrive = new GoogleDriveAPI(config.googleDrive);
    this.dataProcessor = new DataProcessor(config.dataProcessor);
    this.aiHub = new AIAssistantHub(config.aiHub);
    this.isRunning = false;
    this.syncQueue = [];
    this.metrics = {
      filesProcessed: 0,
      bytesTransferred: 0,
      syncErrors: 0,
      lastSyncTime: null,
      averageSpeed: 0
    };
  }

  /**
   * Initialize the pipeline
   */
  async initialize() {
    console.log('🚀 Initializing GOAT Royalty App Data Pipeline...');
    
    try {
      // Validate Google Drive credentials
      await this.googleDrive.authenticate();
      console.log('✅ Google Drive authenticated');
      
      // Initialize data processor
      await this.dataProcessor.initialize();
      console.log('✅ Data processor initialized');
      
      // Initialize AI assistant hub
      await this.aiHub.initialize();
      console.log('✅ AI Assistant hub initialized');
      
      // Create necessary directories
      await this.createDirectories();
      console.log('✅ Directory structure created');
      
      // Load previous sync state
      await this.loadSyncState();
      console.log('✅ Sync state loaded');
      
      this.emit('initialized');
      console.log('🎉 Pipeline initialized successfully!\n');
      return true;
    } catch (error) {
      console.error('❌ Pipeline initialization failed:', error.message);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create necessary directory structure
   */
  async createDirectories() {
    const directories = [
      'pipeline/input',
      'pipeline/output',
      'pipeline/processing',
      'pipeline/cache',
      'pipeline/logs',
      'pipeline/metadata',
      'pipeline/ai-access'
    ];

    for (const dir of directories) {
      const fullPath = path.join(this.config.pipeline.rootDir, dir);
      await fs.mkdir(fullPath, { recursive: true });
    }
  }

  /**
   * Start the pipeline - bidirectional sync
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Pipeline is already running');
      return;
    }

    console.log('🔄 Starting GOAT Royalty App Data Pipeline...\n');
    this.isRunning = true;
    this.emit('started');

    try {
      // Initial full sync from Google Drive
      await this.syncFromGoogleDrive();
      
      // Start continuous monitoring
      await this.startContinuousSync();
      
      // Start AI assistant integration
      await this.startAIIntegration();
      
      console.log('✅ Pipeline is now running!\n');
      this.emit('running');
    } catch (error) {
      console.error('❌ Pipeline start failed:', error.message);
      this.isRunning = false;
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Sync files from Google Drive to local app
   */
  async syncFromGoogleDrive() {
    console.log('📥 Syncing from Google Drive...');
    const startTime = Date.now();

    try {
      // Get all files from Google Drive
      const files = await this.googleDrive.listFiles({
        pageSize: 1000,
        fields: 'files(id, name, mimeType, size, modifiedTime, parents, webContentLink)'
      });

      console.log(`📊 Found ${files.length} files in Google Drive`);

      // Process files in batches
      const batchSize = 50;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        await this.processFileBatch(batch);
        
        const progress = Math.min(100, Math.round(((i + batchSize) / files.length) * 100));
        console.log(`📈 Progress: ${progress}% (${Math.min(i + batchSize, files.length)}/${files.length} files)`);
      }

      const duration = (Date.now() - startTime) / 1000;
      console.log(`✅ Sync from Google Drive completed in ${duration}s`);
      
      // Update metrics
      this.metrics.lastSyncTime = new Date();
      await this.saveSyncState();
      
      this.emit('sync:complete', { direction: 'from-drive', fileCount: files.length, duration });
    } catch (error) {
      console.error('❌ Sync from Google Drive failed:', error.message);
      this.metrics.syncErrors++;
      this.emit('sync:error', { direction: 'from-drive', error });
      throw error;
    }
  }

  /**
   * Process a batch of files
   */
  async processFileBatch(files) {
    for (const file of files) {
      try {
        await this.processFile(file);
        this.metrics.filesProcessed++;
      } catch (error) {
        console.error(`⚠️  Error processing file ${file.name}:`, error.message);
        this.metrics.syncErrors++;
      }
    }
  }

  /**
   * Process a single file
   */
  async processFile(file) {
    // Determine file category
    const category = this.categorizeFile(file);
    
    // Download or stream file based on size
    if (file.size && parseInt(file.size) > 100 * 1024 * 1024) { // > 100MB
      await this.streamFile(file, category);
    } else {
      await this.downloadFile(file, category);
    }
    
    // Extract metadata
    const metadata = await this.extractMetadata(file, category);
    
    // Store metadata for AI access
    await this.storeMetadataForAI(file, metadata, category);
    
    // Update sync queue
    this.syncQueue.push({
      fileId: file.id,
      fileName: file.name,
      category,
      status: 'synced',
      timestamp: new Date()
    });
  }

  /**
   * Categorize file based on type and name
   */
  categorizeFile(file) {
    const mimeType = file.mimeType.toLowerCase();
    const name = file.name.toLowerCase();

    // Books
    if (mimeType.includes('pdf') || 
        mimeType.includes('epub') ||
        mimeType.includes('mobi') ||
        name.includes('.pdf') ||
        name.includes('.epub') ||
        name.includes('.mobi')) {
      return 'books';
    }

    // Music
    if (mimeType.includes('audio') ||
        name.includes('.mp3') ||
        name.includes('.wav') ||
        name.includes('.flac') ||
        name.includes('.aac')) {
      return 'music';
    }

    // Code
    if (mimeType.includes('javascript') ||
        mimeType.includes('json') ||
        mimeType.includes('text/') ||
        name.includes('.js') ||
        name.includes('.py') ||
        name.includes('.java') ||
        name.includes('.json')) {
      return 'code';
    }

    // Images/Visual
    if (mimeType.includes('image') ||
        name.includes('.png') ||
        name.includes('.jpg') ||
        name.includes('.svg')) {
      return 'visuals';
    }

    // Videos
    if (mimeType.includes('video') ||
        name.includes('.mp4') ||
        name.includes('.mov') ||
        name.includes('.avi')) {
      return 'videos';
    }

    // Contracts/Documents
    if (mimeType.includes('document') ||
        name.includes('.doc') ||
        name.includes('.docx') ||
        name.includes('.contract') ||
        name.includes('.agreement')) {
      return 'contracts';
    }

    // Data/Database
    if (mimeType.includes('database') ||
        name.includes('.sql') ||
        name.includes('.csv') ||
        name.includes('.xls') ||
        name.includes('.json')) {
      return 'data';
    }

    // Default
    return 'other';
  }

  /**
   * Download file to local storage
   */
  async downloadFile(file, category) {
    const outputPath = path.join(
      this.config.pipeline.rootDir,
      'pipeline/input',
      category,
      file.name
    );

    await this.googleDrive.downloadFile(file.id, outputPath);
    
    // Calculate file size for metrics
    const stats = await fs.stat(outputPath);
    this.metrics.bytesTransferred += stats.size;
  }

  /**
   * Stream large files without full download
   */
  async streamFile(file, category) {
    const outputPath = path.join(
      this.config.pipeline.rootDir,
      'pipeline/processing',
      category,
      file.name + '.stream'
    );

    await this.googleDrive.streamFile(file.id, outputPath);
    
    // Create reference file for AI access
    const referencePath = path.join(
      this.config.pipeline.rootDir,
      'pipeline/ai-access',
      category,
      file.name + '.ref'
    );

    await fs.writeFile(referencePath, JSON.stringify({
      fileId: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      googleDriveUrl: file.webContentLink,
      category,
      streamPath: outputPath
    }));
  }

  /**
   * Extract metadata from file
   */
  async extractMetadata(file, category) {
    const metadata = {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      modifiedTime: file.modifiedTime,
      category,
      parents: file.parents,
      googleDriveUrl: file.webContentLink,
      extractedAt: new Date().toISOString()
    };

    // Category-specific metadata extraction
    switch (category) {
      case 'books':
        metadata.bookMetadata = await this.dataProcessor.extractBookMetadata(file);
        break;
      case 'music':
        metadata.musicMetadata = await this.dataProcessor.extractMusicMetadata(file);
        break;
      case 'code':
        metadata.codeMetadata = await this.dataProcessor.extractCodeMetadata(file);
        break;
      case 'contracts':
        metadata.contractMetadata = await this.dataProcessor.extractContractMetadata(file);
        break;
    }

    return metadata;
  }

  /**
   * Store metadata for AI assistant access
   */
  async storeMetadataForAI(file, metadata, category) {
    const aiAccessPath = path.join(
      this.config.pipeline.rootDir,
      'pipeline/ai-access',
      category,
      file.name + '.meta.json'
    );

    await fs.writeFile(aiAccessPath, JSON.stringify(metadata, null, 2));
    
    // Also add to AI hub index
    await this.aiHub.indexResource({
      type: 'google-drive-file',
      category,
      metadata,
      filePath: aiAccessPath
    });
  }

  /**
   * Start continuous sync monitoring
   */
  async startContinuousSync() {
    console.log('🔄 Starting continuous sync monitoring...');
    
    // Check for changes every 5 minutes
    this.syncInterval = setInterval(async () => {
      try {
        await this.syncChanges();
      } catch (error) {
        console.error('⚠️  Continuous sync error:', error.message);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Sync only changed files
   */
  async syncChanges() {
    console.log('🔄 Checking for changes in Google Drive...');
    
    const changedFiles = await this.googleDrive.listChangedFiles(this.metrics.lastSyncTime);
    
    if (changedFiles.length > 0) {
      console.log(`📝 Found ${changedFiles.length} changed files`);
      await this.processFileBatch(changedFiles);
      this.metrics.lastSyncTime = new Date();
      await this.saveSyncState();
    } else {
      console.log('✅ No changes detected');
    }
  }

  /**
   * Start AI assistant integration
   */
  async startAIIntegration() {
    console.log('🤖 Starting AI assistant integration...');
    
    // Create API endpoints for AI assistant
    await this.aiHub.createEndpoints({
      googleDrive: this.googleDrive,
      localStorage: path.join(this.config.pipeline.rootDir, 'pipeline/ai-access'),
      pipeline: this
    });
    
    console.log('✅ AI assistant integration ready');
  }

  /**
   * Sync local data back to Google Drive
   */
  async syncToGoogleDrive(localPath, remotePath = null) {
    console.log(`📤 Syncing ${localPath} to Google Drive...`);
    
    try {
      const stats = await fs.stat(localPath);
      
      if (stats.isDirectory()) {
        // Sync directory
        const files = await fs.readdir(localPath);
        for (const file of files) {
          const filePath = path.join(localPath, file);
          await this.syncToGoogleDrive(filePath, remotePath);
        }
      } else {
        // Sync file
        const fileData = await fs.readFile(localPath);
        await this.googleDrive.uploadFile({
          name: path.basename(localPath),
          data: fileData,
          parents: remotePath ? [remotePath] : undefined
        });
        
        console.log(`✅ Uploaded ${path.basename(localPath)}`);
      }
    } catch (error) {
      console.error(`❌ Sync to Google Drive failed:`, error.message);
      throw error;
    }
  }

  /**
   * Search files for AI assistant
   */
  async searchFiles(query, options = {}) {
    return await this.aiHub.search(query, options);
  }

  /**
   * Get file content for AI assistant
   */
  async getFileContent(fileId, options = {}) {
    return await this.aiHub.getFileContent(fileId, options);
  }

  /**
   * Stop the pipeline
   */
  async stop() {
    console.log('⏹️  Stopping pipeline...');
    
    this.isRunning = false;
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    await this.saveSyncState();
    console.log('✅ Pipeline stopped');
    this.emit('stopped');
  }

  /**
   * Get pipeline metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      isRunning: this.isRunning,
      queueLength: this.syncQueue.length,
      uptime: this.startTime ? (Date.now() - this.startTime) / 1000 : 0
    };
  }

  /**
   * Load sync state from disk
   */
  async loadSyncState() {
    try {
      const statePath = path.join(this.config.pipeline.rootDir, 'pipeline/metadata/sync-state.json');
      const stateData = await fs.readFile(statePath, 'utf8');
      const state = JSON.parse(stateData);
      
      this.metrics = { ...this.metrics, ...state.metrics };
      this.syncQueue = state.syncQueue || [];
      
      console.log('📊 Loaded previous sync state:', {
        filesProcessed: this.metrics.filesProcessed,
        lastSync: this.metrics.lastSyncTime
      });
    } catch (error) {
      console.log('ℹ️  No previous sync state found, starting fresh');
    }
  }

  /**
   * Save sync state to disk
   */
  async saveSyncState() {
    const state = {
      metrics: this.metrics,
      syncQueue: this.syncQueue,
      savedAt: new Date().toISOString()
    };

    const statePath = path.join(this.config.pipeline.rootDir, 'pipeline/metadata/sync-state.json');
    await fs.writeFile(statePath, JSON.stringify(state, null, 2));
  }
}

module.exports = { GoogleDriveDataPipeline };