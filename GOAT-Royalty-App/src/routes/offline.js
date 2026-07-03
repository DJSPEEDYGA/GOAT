/**
 * Offline Data API Routes
 * 
 * Provides API endpoints for offline data management and processing
 */

const express = require('express');
const router = express.Router();
const { OfflineDataService } = require('../services/offlineDataService');

let offlineDataInstance = null;

/**
 * Initialize offline data service
 */
router.post('/initialize', async (req, res) => {
  try {
    const config = {
      rootDir: req.body.rootDir || './offline-data',
      credentialsPath: req.body.credentialsPath || './config/google-drive-credentials.json',
      nvidiaApiKey: process.env.NVIDIA_BUILD_API_KEY
    };
    
    offlineDataInstance = new OfflineDataService(config);
    await offlineDataInstance.initialize();
    
    res.json({ success: true, message: 'Offline data service initialized' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Sync staged data from Google Drive
 */
router.post('/sync', async (req, res) => {
  try {
    if (!offlineDataInstance) {
      return res.status(400).json({ success: false, error: 'Offline data service not initialized' });
    }
    
    const result = await offlineDataInstance.syncFromGoogleDrive();
    
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get data by type
 */
router.get('/data/:type', async (req, res) => {
  try {
    if (!offlineDataInstance) {
      return res.status(400).json({ success: false, error: 'Offline data service not initialized' });
    }
    
    const { type } = req.params;
    const data = await offlineDataInstance.getDataByType(type);
    
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get latest data by type
 */
router.get('/latest/:type', async (req, res) => {
  try {
    if (!offlineDataInstance) {
      return res.status(400).json({ success: false, error: 'Offline data service not initialized' });
    }
    
    const { type } = req.params;
    const data = await offlineDataInstance.getLatestData(type);
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Search data
 */
router.get('/search', async (req, res) => {
  try {
    if (!offlineDataInstance) {
      return res.status(400).json({ success: false, error: 'Offline data service not initialized' });
    }
    
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query parameter required' });
    }
    
    const results = await offlineDataInstance.searchData(query);
    
    res.json({ success: true, results, count: results.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get data for AI processing
 */
router.get('/ai-data', async (req, res) => {
  try {
    if (!offlineDataInstance) {
      return res.status(400).json({ success: false, error: 'Offline data service not initialized' });
    }
    
    const options = {
      types: req.query.types ? req.query.types.split(',') : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      includeMetadata: req.query.includeMetadata !== 'false'
    };
    
    const data = await offlineDataInstance.getDataForAI(options);
    
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Process data locally (offline AI)
 */
router.post('/process', async (req, res) => {
  try {
    if (!offlineDataInstance) {
      return res.status(400).json({ success: false, error: 'Offline data service not initialized' });
    }
    
    const { task, dataTypes } = req.body;
    
    if (!task) {
      return res.status(400).json({ success: false, error: 'Task parameter required' });
    }
    
    // Get data for processing
    const data = await offlineDataInstance.getDataForAI({
      types: dataTypes,
      includeMetadata: true
    });
    
    if (data.length === 0) {
      return res.status(404).json({ success: false, error: 'No data available for processing' });
    }
    
    // Process locally
    const result = await offlineDataInstance.processLocally(task, data);
    
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Start scheduled sync
 */
router.post('/schedule-sync', async (req, res) => {
  try {
    if (!offlineDataInstance) {
      return res.status(400).json({ success: false, error: 'Offline data service not initialized' });
    }
    
    const { intervalMinutes } = req.body;
    const interval = intervalMinutes || 30;
    
    await offlineDataInstance.startScheduledSync(interval);
    
    res.json({ 
      success: true, 
      message: `Scheduled sync started every ${interval} minutes` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Stop scheduled sync
 */
router.post('/stop-sync', async (req, res) => {
  try {
    if (!offlineDataInstance) {
      return res.status(400).json({ success: false, error: 'Offline data service not initialized' });
    }
    
    await offlineDataInstance.stopScheduledSync();
    
    res.json({ success: true, message: 'Scheduled sync stopped' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Export data for backup
 */
router.post('/backup', async (req, res) => {
  try {
    if (!offlineDataInstance) {
      return res.status(400).json({ success: false, error: 'Offline data service not initialized' });
    }
    
    const backupPath = await offlineDataInstance.exportForBackup();
    
    res.json({ success: true, backupPath });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Import data from backup
 */
router.post('/restore', async (req, res) => {
  try {
    if (!offlineDataInstance) {
      return res.status(400).json({ success: false, error: 'Offline data service not initialized' });
    }
    
    const { backupPath } = req.body;
    
    if (!backupPath) {
      return res.status(400).json({ success: false, error: 'backupPath parameter required' });
    }
    
    const result = await offlineDataInstance.importFromBackup(backupPath);
    
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get service metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    if (!offlineDataInstance) {
      return res.status(400).json({ success: false, error: 'Offline data service not initialized' });
    }
    
    const metrics = offlineDataInstance.getMetrics();
    
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Check connectivity
 */
router.get('/status', async (req, res) => {
  try {
    if (!offlineDataInstance) {
      return res.json({ 
        success: true, 
        status: 'not_initialized',
        message: 'Offline data service not initialized' 
      });
    }
    
    const isOnline = await offlineDataInstance.checkConnectivity();
    const metrics = offlineDataInstance.getMetrics();
    
    res.json({ 
      success: true, 
      status: isOnline ? 'online' : 'offline',
      isOnline,
      metrics 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Clear cache
 */
router.post('/clear-cache', async (req, res) => {
  try {
    if (!offlineDataInstance) {
      return res.status(400).json({ success: false, error: 'Offline data service not initialized' });
    }
    
    await offlineDataInstance.clearCache();
    
    res.json({ success: true, message: 'Cache cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;