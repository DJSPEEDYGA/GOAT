/**
 * GOAT Force LLM API Route
 * Enhanced AI system with autonomous capabilities and music industry specialization
 */

// Use correct relative path from pages/api/ai/ to lib/
const { EnhancedGOATForceLLM } = require('../../../lib/GOAT_FORCE_LLM_COMPLETE');

// Initialize the GOAT Force LLM
let goatForce = null;

// Get API keys from environment
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';
const GOOGLE_AI_KEY = process.env.GOOGLE_AI_KEY || '';

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
    // Initialize GOAT Force LLM if not already done
    if (!goatForce) {
      goatForce = new EnhancedGOATForceLLM({
        nvidiaApiKey: NVIDIA_API_KEY,
        googleAiKey: GOOGLE_AI_KEY
      });
      console.log('🦁 GOAT Force LLM initialized with autonomous capabilities');
    }

    const { action, task, context, options } = req.body || {};

    switch (action) {
      case 'initialize':
        return res.status(200).json({
          success: true,
          message: 'GOAT Force LLM initialized and ready',
          capabilities: {
            nvidiaModels: 215,
            googleAITools: 350,
            autonomousAgents: true,
            musicIndustryAI: true,
            longTermMemory: true
          }
        });

      case 'executeAutonomousTask':
        if (!task) {
          return res.status(400).json({ error: 'Task is required' });
        }
        const autonomousResult = await goatForce.executeAutonomousTask(task, context || {});
        return res.status(200).json({
          success: true,
          task: task,
          result: autonomousResult,
          timestamp: new Date().toISOString()
        });

      case 'optimizeRoyalties':
        if (!context?.artistId && !context?.catalogData) {
          return res.status(400).json({ error: 'Artist ID or catalog data is required' });
        }
        const royaltyResult = await goatForce.optimizeRoyalties(
          context.artistId,
          context.catalogData,
          context.options || {}
        );
        return res.status(200).json({
          success: true,
          action: 'royalty_optimization',
          result: royaltyResult,
          recommendations: royaltyResult.recommendations,
          projectedIncrease: royaltyResult.projectedIncrease
        });

      case 'analyzeContract':
        if (!context?.contractText) {
          return res.status(400).json({ error: 'Contract text is required' });
        }
        const contractAnalysis = await goatForce.analyzeContract(
          context.contractText,
          context.options || {}
        );
        return res.status(200).json({
          success: true,
          action: 'contract_analysis',
          analysis: contractAnalysis,
          riskLevel: contractAnalysis.riskLevel,
          recommendations: contractAnalysis.recommendations,
          keyTerms: contractAnalysis.keyTerms
        });

      case 'predictMarketTrends':
        const marketPrediction = await goatForce.predictMarketTrends(
          context?.genre,
          context?.timeframe || '30d',
          context?.options || {}
        );
        return res.status(200).json({
          success: true,
          action: 'market_prediction',
          prediction: marketPrediction,
          trends: marketPrediction.trends,
          confidence: marketPrediction.confidence,
          timeframe: context?.timeframe || '30d'
        });

      case 'manageArtistCareer':
        if (!context?.artistId && !context?.artistData) {
          return res.status(400).json({ error: 'Artist ID or artist data is required' });
        }
        const careerGuidance = await goatForce.manageArtistCareer(
          context.artistId,
          context.artistData,
          context.options || {}
        );
        return res.status(200).json({
          success: true,
          action: 'career_management',
          guidance: careerGuidance,
          milestones: careerGuidance.milestones,
          strategies: careerGuidance.strategies
        });

      case 'generateMusicContent':
        if (!task) {
          return res.status(400).json({ error: 'Content task is required' });
        }
        const content = await goatForce.generateMusicContent(
          task,
          context?.style,
          context?.genre
        );
        return res.status(200).json({
          success: true,
          action: 'content_generation',
          content: content,
          task: task
        });

      case 'getAIStatus':
        return res.status(200).json({
          success: true,
          status: {
            nvidiaLLM: {
              status: NVIDIA_API_KEY ? 'connected' : 'api_key_needed',
              models: 215
            },
            googleAI: {
              status: GOOGLE_AI_KEY ? 'connected' : 'api_key_needed',
              tools: 350
            },
            autonomousSystem: 'active',
            memorySystem: 'initialized',
            learningSystem: 'adaptive',
            specialization: 'music_industry'
          },
          uptime: process.uptime(),
          lastUpdate: new Date().toISOString()
        });

      case 'storeMemory':
        if (!context?.key || !context?.value) {
          return res.status(400).json({ error: 'Key and value are required' });
        }
        await goatForce.storeMemory(context.key, context.value, context?.metadata || {});
        return res.status(200).json({
          success: true,
          action: 'memory_store',
          key: context.key
        });

      case 'retrieveMemory':
        if (!context?.key) {
          return res.status(400).json({ error: 'Key is required' });
        }
        const memory = await goatForce.retrieveMemory(context.key);
        return res.status(200).json({
          success: true,
          action: 'memory_retrieve',
          key: context.key,
          memory: memory
        });

      case 'learnFromFeedback':
        if (!context?.feedback || !context?.taskId) {
          return res.status(400).json({ error: 'Feedback and task ID are required' });
        }
        await goatForce.learnFromFeedback(
          context.taskId,
          context.feedback,
          context?.rating
        );
        return res.status(200).json({
          success: true,
          action: 'learning',
          message: 'Feedback incorporated into learning system'
        });

      default:
        return res.status(400).json({
          error: 'Invalid action',
          availableActions: [
            'initialize',
            'executeAutonomousTask',
            'optimizeRoyalties',
            'analyzeContract',
            'predictMarketTrends',
            'manageArtistCareer',
            'generateMusicContent',
            'getAIStatus',
            'storeMemory',
            'retrieveMemory',
            'learnFromFeedback'
          ]
        });
    }
  } catch (error) {
    console.error('❌ GOAT Force LLM API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}