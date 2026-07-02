/**
 * NVIDIA LLM Integration API Route
 * Provides access to 215+ NVIDIA AI models for the GOAT Royalty App
 */

// Use correct relative path from pages/api/ai/ to lib/
const { NVIDIALLMManager } = require('../../../lib/NVIDIA_LLM_INTEGRATION_SYSTEM');

// Initialize the NVIDIA LLM manager
let nvidiaManager = null;

// Get NVIDIA API key from environment
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Initialize NVIDIA LLM manager if not already done
    if (!nvidiaManager) {
      nvidiaManager = new NVIDIALLMManager(NVIDIA_API_KEY);
      console.log('🎮 NVIDIA LLM Manager initialized with 215+ models');
    }

    const { action, modelId, prompt, options, task } = req.body || {};

    switch (action) {
      case 'listModels':
        const models = nvidiaManager.getAvailableModels();
        return res.status(200).json({
          success: true,
          models: models,
          count: models.length
        });

      case 'getModelDetails':
        if (!modelId) {
          return res.status(400).json({ error: 'Model ID is required' });
        }
        const details = nvidiaManager.getModelDetails(modelId);
        return res.status(200).json({
          success: true,
          details: details
        });

      case 'selectBestModel':
        if (!task) {
          return res.status(400).json({ error: 'Task description is required' });
        }
        const bestModel = nvidiaManager.selectBestModel(task);
        return res.status(200).json({
          success: true,
          bestModel: bestModel
        });

      case 'generate':
        if (!prompt) {
          return res.status(400).json({ error: 'Prompt is required' });
        }
        const modelToUse = modelId || nvidiaManager.selectBestModel(prompt || task || 'text generation').id;
        const generation = await nvidiaManager.makeRequest(modelToUse, prompt, options || {});
        return res.status(200).json({
          success: true,
          model: modelToUse,
          result: generation,
          metrics: {
            latency: generation.latency,
            tokens: generation.tokensUsed
          }
        });

      case 'getMusicRecommendations':
        if (!task) {
          return res.status(400).json({ error: 'Task description is required' });
        }
        const musicModel = nvidiaManager.selectBestModel('music ' + task);
        const musicResult = await nvidiaManager.makeRequest(musicModel.id, prompt, options || {});
        return res.status(200).json({
          success: true,
          task: task,
          model: musicModel.id,
          result: musicResult
        });

      case 'getPerformanceMetrics':
        const metrics = nvidiaManager.getMetrics();
        return res.status(200).json({
          success: true,
          metrics: metrics
        });

      case 'batchGenerate':
        if (!prompt || !options?.models) {
          return res.status(400).json({ error: 'Prompt and models array are required' });
        }
        const batchResults = await Promise.all(
          options.models.map(mid => 
            nvidiaManager.makeRequest(mid, prompt, options)
          )
        );
        return res.status(200).json({
          success: true,
          results: batchResults,
          count: batchResults.length
        });

      default:
        return res.status(400).json({
          error: 'Invalid action',
          availableActions: [
            'listModels',
            'getModelDetails',
            'selectBestModel',
            'generate',
            'getMusicRecommendations',
            'getPerformanceMetrics',
            'batchGenerate'
          ]
        });
    }
  } catch (error) {
    console.error('❌ NVIDIA LLM API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}