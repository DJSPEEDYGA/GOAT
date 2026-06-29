/**
 * Offline Data Service
 * 
 * Manages staged data from Google Apps Script for offline AI processing
 * 
 * @author DJSPEEDYGA
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

class OfflineDataService extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.stagedData = new Map();
    this.syncSchedule = null;
    this.metrics = {
      totalSyncs: 0,
      lastSyncTime: null,
      dataTypes: {},
      offlineMode: false
    };
  }

  /**
   * Initialize offline data service
   */
  async initialize() {
    console.log('🔄 Initializing Offline Data Service...');
    
    try {
      // Create offline data directory
      await this.createDirectories();
      
      // Load previously staged data
      await this.loadStagedData();
      
      // Check internet connectivity
      await this.checkConnectivity();
      
      console.log('✅ Offline Data Service initialized');
      return true;
    } catch (error) {
      console.error('❌ Offline Data Service initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Create offline data directories
   */
  async createDirectories() {
    const directories = [
      'offline-data/staged',
      'offline-data/processed',
      'offline-data/cache',
      'offline-data/backup'
    ];

    for (const dir of directories) {
      const fullPath = path.join(this.config.rootDir, dir);
      await fs.mkdir(fullPath, { recursive: true });
    }
  }

  /**
   * Check internet connectivity
   */
  async checkConnectivity() {
    try {
      const https = require('https');
      
      return new Promise((resolve) => {
        const req = https.get('https://www.google.com', (res) => {
          this.metrics.offlineMode = false;
          console.log('✅ Online mode - Sync enabled');
          resolve(true);
        });

        req.on('error', () => {
          this.metrics.offlineMode = true;
          console.log('⚠️  Offline mode - Using cached data');
          resolve(false);
        });

        req.setTimeout(5000, () => {
          req.destroy();
          this.metrics.offlineMode = true;
          console.log('⚠️  Offline mode - Using cached data');
          resolve(false);
        });
      });
    } catch (error) {
      this.metrics.offlineMode = true;
      console.log('⚠️  Offline mode - Using cached data');
      return false;
    }
  }

  /**
   * Load previously staged data
   */
  async loadStagedData() {
    try {
      const stagedDir = path.join(this.config.rootDir, 'offline-data/staged');
      const files = await fs.readdir(stagedDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(stagedDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          const data = JSON.parse(content);
          
          const dataKey = data.type + '_' + data.timestamp;
          this.stagedData.set(dataKey, {
            data: data,
            filePath: filePath,
            loadedAt: new Date()
          });
          
          // Track metrics
          this.metrics.dataTypes[data.type] = (this.metrics.dataTypes[data.type] || 0) + 1;
        }
      }
      
      console.log(`📊 Loaded ${this.stagedData.size} staged datasets`);
    } catch (error) {
      console.log('ℹ️  No previously staged data found');
    }
  }

  /**
   * Sync staged data from Google Drive
   */
  async syncFromGoogleDrive() {
    if (this.metrics.offlineMode) {
      console.log('⚠️  Offline mode - Cannot sync');
      return { success: false, message: 'Offline mode' };
    }

    console.log('🔄 Syncing staged data from Google Drive...');
    
    try {
      const { GoogleDriveAPI } = require('./googleDriveService');
      const googleDrive = new GoogleDriveAPI({
        credentialsPath: this.config.credentialsPath
      });
      
      await googleDrive.authenticate();
      
      // Get all JSON files from staging folder
      const files = await googleDrive.listFiles({
        query: "mimeType='application/json'",
        orderBy: 'createdTime desc'
      });
      
      let syncedCount = 0;
      
      for (const file of files) {
        if (file.name.includes('staging_log')) continue;
        
        try {
          // Download file
          const outputPath = path.join(
            this.config.rootDir,
            'offline-data/staged',
            file.name
          );
          
          await googleDrive.downloadFile(file.id, outputPath);
          
          // Load and index data
          const content = await fs.readFile(outputPath, 'utf8');
          const data = JSON.parse(content);
          
          const dataKey = data.type + '_' + data.timestamp;
          this.stagedData.set(dataKey, {
            data: data,
            filePath: outputPath,
            syncedAt: new Date()
          });
          
          // Track metrics
          this.metrics.dataTypes[data.type] = (this.metrics.dataTypes[data.type] || 0) + 1;
          
          syncedCount++;
        } catch (error) {
          console.error(`Failed to sync ${file.name}:`, error.message);
        }
      }
      
      this.metrics.totalSyncs++;
      this.metrics.lastSyncTime = new Date();
      
      console.log(`✅ Synced ${syncedCount} datasets from Google Drive`);
      this.emit('sync:complete', { syncedCount });
      
      return { success: true, syncedCount };
    } catch (error) {
      console.error('Sync failed:', error.message);
      this.emit('sync:error', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get staged data by type
   */
  async getDataByType(type) {
    const results = [];
    
    for (const [key, value] of this.stagedData) {
      if (value.data.type === type) {
        results.push(value.data);
      }
    }
    
    return results;
  }

  /**
   * Get latest staged data by type
   */
  async getLatestData(type) {
    let latest = null;
    let latestTimestamp = 0;
    
    for (const [key, value] of this.stagedData) {
      if (value.data.type === type) {
        const timestamp = new Date(value.data.timestamp).getTime();
        if (timestamp > latestTimestamp) {
          latest = value.data;
          latestTimestamp = timestamp;
        }
      }
    }
    
    return latest;
  }

  /**
   * Search staged data
   */
  async searchData(query) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const [key, value] of this.stagedData) {
      const dataStr = JSON.stringify(value.data).toLowerCase();
      if (dataStr.includes(queryLower)) {
        results.push({
          type: value.data.type,
          timestamp: value.data.timestamp,
          source: value.data.source,
          matchCount: (dataStr.match(new RegExp(queryLower, 'g')) || []).length,
          data: value.data
        });
      }
    }
    
    // Sort by match count
    results.sort((a, b) => b.matchCount - a.matchCount);
    
    return results;
  }

  /**
   * Get data for AI processing
   */
  async getDataForAI(options = {}) {
    const { types, limit, includeMetadata = true } = options;
    
    let results = [];
    
    for (const [key, value] of this.stagedData) {
      // Filter by type if specified
      if (types && !types.includes(value.data.type)) {
        continue;
      }
      
      results.push({
        type: value.data.type,
        timestamp: value.data.timestamp,
        data: value.data.data,
        metadata: includeMetadata ? value.data.metadata : undefined
      });
      
      // Apply limit
      if (limit && results.length >= limit) {
        break;
      }
    }
    
    return results;
  }

  /**
   * Process data locally (offline AI)
   */
  async processLocally(task, data) {
    console.log('🤖 Processing locally (offline mode)...');
    
    try {
      // Use Super LLM for processing
      const { SuperLLM } = require('../../super-llm/core/SuperLLM');
      
      const llm = new SuperLLM({
        apiKey: this.config.nvidiaApiKey,
        enableCache: true
      });
      
      const prompt = this.buildProcessingPrompt(task, data);
      
      const response = await llm.query(prompt);
      
      return {
        success: true,
        response: response.content,
        model: response.model,
        processedAt: new Date(),
        offline: true
      };
    } catch (error) {
      console.error('Local processing failed:', error.message);
      throw error;
    }
  }

  /**
   * Build processing prompt for AI
   */
  buildProcessingPrompt(task, data) {
    return `You are an AI assistant for the GOAT Royalty App. Process the following data task.

Task: ${task}

Data:
${JSON.stringify(data, null, 2)}

Please provide a comprehensive response with analysis and recommendations.`;
  }

  /**
   * Start scheduled sync
   */
  async startScheduledSync(intervalMinutes = 30) {
    if (this.syncSchedule) {
      clearInterval(this.syncSchedule);
    }
    
    console.log(`⏰ Starting scheduled sync every ${intervalMinutes} minutes...`);
    
    this.syncSchedule = setInterval(async () => {
      try {
        await this.checkConnectivity();
        
        if (!this.metrics.offlineMode) {
          await this.syncFromGoogleDrive();
        }
      } catch (error) {
        console.error('Scheduled sync failed:', error.message);
      }
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop scheduled sync
   */
  async stopScheduledSync() {
    if (this.syncSchedule) {
      clearInterval(this.syncSchedule);
      this.syncSchedule = null;
      console.log('⏹️  Scheduled sync stopped');
    }
  }

  /**
   * Export data for offline backup
   */
  async exportForBackup() {
    const backupData = {
      exportedAt: new Date().toISOString(),
      dataTypes: this.metrics.dataTypes,
      datasets: []
    };
    
    for (const [key, value] of this.stagedData) {
      backupData.datasets.push(value.data);
    }
    
    const backupPath = path.join(
      this.config.rootDir,
      'offline-data/backup',
      `backup_${Date.now()}.json`
    );
    
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
  }

  /**
   * Import data from backup
   */
  async importFromBackup(backupPath) {
    console.log('📥 Importing data from backup...');
    
    try {
      const content = await fs.readFile(backupPath, 'utf8');
      const backupData = JSON.parse(content);
      
      let importedCount = 0;
      
      for (const dataset of backupData.datasets) {
        const dataKey = dataset.type + '_' + dataset.timestamp;
        
        // Save to staged directory
        const filePath = path.join(
          this.config.rootDir,
          'offline-data/staged',
          `${dataset.type}_${dataset.timestamp}.json`
        );
        
        await fs.writeFile(filePath, JSON.stringify(dataset, null, 2));
        
        this.stagedData.set(dataKey, {
          data: dataset,
          filePath: filePath,
          importedAt: new Date()
        });
        
        importedCount++;
      }
      
      console.log(`✅ Imported ${importedCount} datasets from backup`);
      return { success: true, importedCount };
    } catch (error) {
      console.error('Backup import failed:', error.message);
      throw error;
    }
  }

  /**
   * Get service metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      stagedDataCount: this.stagedData.size,
      isOnline: !this.metrics.offlineMode
    };
  }

  /**
   * Clear cache
   */
  async clearCache() {
    const cacheDir = path.join(this.config.rootDir, 'offline-data/cache');
    const files = await fs.readdir(cacheDir);
    
    for (const file of files) {
      const filePath = path.join(cacheDir, file);
      await fs.unlink(filePath);
    }
    
    console.log('✅ Cache cleared');
  }
}

module.exports = { OfflineDataService };