/**
 * Pipeline API Routes
 * 
 * Provides API endpoints for the Google Drive data pipeline
 */

const express = require('express');
const router = express.Router();
const path = require('path');

let pipelineInstance = null;

/**
 * Initialize pipeline
 */
router.post('/initialize', async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../../config/pipeline-config.json');
    const config = require(configPath);
    
    // Load the pipeline class
    const { GoogleDriveDataPipeline } = require('../../scripts/google-drive-pipeline');
    pipelineInstance = new GoogleDriveDataPipeline(config);
    await pipelineInstance.initialize();
    
    res.json({ success: true, message: 'Pipeline initialized' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Start pipeline
 */
router.post('/start', async (req, res) => {
  try {
    if (!pipelineInstance) {
      return res.status(400).json({ success: false, error: 'Pipeline not initialized' });
    }
    
    await pipelineInstance.start();
    
    res.json({ success: true, message: 'Pipeline started' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Stop pipeline
 */
router.post('/stop', async (req, res) => {
  try {
    if (!pipelineInstance) {
      return res.status(400).json({ success: false, error: 'Pipeline not initialized' });
    }
    
    await pipelineInstance.stop();
    
    res.json({ success: true, message: 'Pipeline stopped' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get pipeline metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    if (!pipelineInstance) {
      return res.status(400).json({ success: false, error: 'Pipeline not initialized' });
    }
    
    const metrics = pipelineInstance.getMetrics();
    
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Search files
 */
router.get('/search', async (req, res) => {
  try {
    const { query, category, limit } = req.query;
    
    if (!pipelineInstance) {
      return res.status(400).json({ success: false, error: 'Pipeline not initialized' });
    }
    
    const results = await pipelineInstance.searchFiles(query, {
      category,
      limit: parseInt(limit) || 20
    });
    
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get file content
 */
router.get('/file/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!pipelineInstance) {
      return res.status(400).json({ success: false, error: 'Pipeline not initialized' });
    }
    
    const content = await pipelineInstance.getFileContent(id);
    
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Sync to Google Drive
 */
router.post('/sync-to-drive', async (req, res) => {
  try {
    const { localPath, remotePath } = req.body;
    
    if (!pipelineInstance) {
      return res.status(400).json({ success: false, error: 'Pipeline not initialized' });
    }
    
    await pipelineInstance.syncToGoogleDrive(localPath, remotePath);
    
    res.json({ success: true, message: 'Synced to Google Drive' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get resources by category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!pipelineInstance) {
      return res.status(400).json({ success: false, error: 'Pipeline not initialized' });
    }
    
    const resources = await pipelineInstance.aiHub.getResourcesByCategory(category);
    
    res.json({ success: true, resources, count: resources.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get pipeline status
 */
router.get('/status', async (req, res) => {
  try {
    if (!pipelineInstance) {
      return res.json({ 
        success: true, 
        status: 'not_initialized',
        message: 'Pipeline not initialized' 
      });
    }
    
    const metrics = pipelineInstance.getMetrics();
    
    res.json({ 
      success: true, 
      status: metrics.isRunning ? 'running' : 'stopped',
      metrics 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;