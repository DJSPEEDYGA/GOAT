/**
 * SUPER NINJA INTEGRATION MODULE
 * Main entry point for all SuperNinja features
 * Created by SuperNinja - NinjaTech AI
 */

const SuperNinjaCore = require('./superninja-core');
const AutonomousRunner = require('./autonomous-runner');
const NinjaWorkspace = require('./ninja-workspace');
const AIProducer = require('./ai-producer');
const AIRoyaltyOptimizer = require('./ai-royalty-optimizer');
const AIPlaylistCurator = require('./ai-playlist-curator');
const AIContractAnalyzer = require('./ai-contract-analyzer');
const AnalyticsDashboard = require('./analytics-dashboard');
const FanEngagementHeatmap = require('./fan-engagement-heatmap');
const CrossPlatformTracker = require('./cross-platform-tracker');

class SuperNinjaIntegration {
  constructor(config = {}) {
    this.config = {
      workspacePath: config.workspacePath || './workspace',
      goatBrain: config.goatBrain || null,
      distributionHub: config.distributionHub || null,
      ...config
    };
    
    this.core = new SuperNinjaCore();
    this.autonomousRunner = new AutonomousRunner(this.core);
    this.workspace = new NinjaWorkspace();
    this.aiProducer = new AIProducer(this.config.goatBrain);
    this.royaltyOptimizer = new AIRoyaltyOptimizer(this.config.distributionHub);
    this.playlistCurator = new AIPlaylistCurator(this.config.goatBrain);
    this.contractAnalyzer = new AIContractAnalyzer(this.config.goatBrain);
    this.analyticsDashboard = new AnalyticsDashboard(this.config.distributionHub);
    this.fanEngagementHeatmap = new FanEngagementHeatmap();
    this.crossPlatformTracker = new CrossPlatformTracker();
    
    this.initialized = false;
  }

  /**
   * Initialize all SuperNinja modules
   */
  async initialize() {
    if (this.initialized) {
      console.log('⚠️ SuperNinja already initialized');
      return;
    }
    
    console.log('🥷 Initializing SuperNinja Integration...');
    
    try {
      // Initialize core systems
      await this.core.initialize();
      console.log('✅ SuperNinja Core initialized');
      
      // Initialize autonomous runner
      this.autonomousRunner.start();
      console.log('✅ Autonomous Runner started');
      
      // Initialize workspace manager
      await this.workspace.initialize(this.config.workspacePath);
      console.log('✅ Workspace Manager initialized');
      
      // Initialize AI modules
      await this.aiProducer.initialize();
      console.log('✅ AI Producer initialized');
      
      await this.royaltyOptimizer.initialize();
      console.log('✅ Royalty Optimizer initialized');
      
      await this.playlistCurator.initialize();
      console.log('✅ Playlist Curator initialized');
      
      await this.contractAnalyzer.initialize();
      console.log('✅ Contract Analyzer initialized');
      
      // Initialize analytics modules
      await this.analyticsDashboard.initialize();
      console.log('✅ Analytics Dashboard initialized');
      
      await this.fanEngagementHeatmap.initialize();
      console.log('✅ Fan Engagement Heatmap initialized');
      
      await this.crossPlatformTracker.initialize();
      console.log('✅ Cross-Platform Tracker initialized');
      
      this.initialized = true;
      
      console.log('🎉 SuperNinja Integration fully initialized!');
      console.log('🥷 All systems operational - GOAT Force ready!');
      
    } catch (error) {
      console.error('❌ SuperNinja initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      initialized: this.initialized,
      core: this.core.getSystemStatus(),
      autonomousRunner: this.autonomousRunner.getStatistics(),
      workspace: this.workspace.getWorkspaceStats(),
      aiProducer: {
        isProducing: this.aiProducer.isProducing,
        productionHistory: this.aiProducer.getProductionHistory(5)
      },
      royaltyOptimizer: {
        isOptimizing: this.royaltyOptimizer.isOptimizing,
        optimizationHistory: this.royaltyOptimizer.getOptimizationHistory(5)
      },
      playlistCurator: {
        isCurating: this.playlistCurator.isCurating,
        curationHistory: this.playlistCurator.getCurationHistory(5)
      },
      contractAnalyzer: {
        isAnalyzing: this.contractAnalyzer.isAnalyzing,
        analysisHistory: this.contractAnalyzer.getAnalysisHistory(5)
      },
      analyticsDashboard: {
        isMonitoring: this.analyticsDashboard.isMonitoring,
        alerts: this.analyticsDashboard.getAlerts(5)
      },
      fanEngagementHeatmap: {
        isTracking: this.fanEngagementHeatmap.isTracking,
        summary: this.fanEngagementHeatmap.getSummary()
      },
      crossPlatformTracker: {
        isTracking: this.crossPlatformTracker.isTracking,
        overview: this.crossPlatformTracker.getCrossPlatformOverview()
      }
    };
  }

  /**
   * Queue task for autonomous execution
   */
  queueTask(task) {
    return this.core.queueTask(task);
  }

  /**
   * Toggle stealth mode
   */
  toggleStealthMode() {
    return this.core.toggleStealthMode();
  }

  /**
   * Create new project
   */
  async createProject(projectConfig) {
    return await this.workspace.createProject(projectConfig);
  }

  /**
   * Load project
   */
  async loadProject(projectId) {
    return await this.workspace.loadProject(projectId);
  }

  /**
   * Produce music arrangement
   */
  async produceMusic(config) {
    return await this.aiProducer.produceArrangement(config);
  }

  /**
   * Optimize royalties
   */
  async optimizeRoyalties(catalogData) {
    return await this.royaltyOptimizer.optimizeRoyaltyStrategy(catalogData);
  }

  /**
   * Curate playlist
   */
  async curatePlaylist(config) {
    return await this.playlistCurator.curatePlaylist(config);
  }

  /**
   * Analyze contract
   */
  async analyzeContract(contractData) {
    return await this.contractAnalyzer.analyzeContract(contractData);
  }

  /**
   * Get real-time analytics
   */
  getRealTimeAnalytics() {
    return this.analyticsDashboard.getRealTimeDashboard();
  }

  /**
   * Get fan engagement data
   */
  getFanEngagement() {
    return this.fanEngagementHeatmap.getHeatmapData();
  }

  /**
   * Get cross-platform data
   */
  getCrossPlatformData() {
    return this.crossPlatformTracker.getCrossPlatformOverview();
  }

  /**
   * Shutdown all systems
   */
  async shutdown() {
    console.log('🛑 Shutting down SuperNinja Integration...');
    
    try {
      // Stop autonomous runner
      this.autonomousRunner.stop();
      console.log('✅ Autonomous Runner stopped');
      
      // Stop analytics monitoring
      this.analyticsDashboard.stopMonitoring();
      console.log('✅ Analytics Dashboard stopped');
      
      // Stop tracking
      this.fanEngagementHeatmap.stopTracking();
      console.log('✅ Fan Engagement Heatmap stopped');
      
      this.crossPlatformTracker.stopTracking();
      console.log('✅ Cross-Platform Tracker stopped');
      
      this.initialized = false;
      
      console.log('👋 SuperNinja Integration shutdown complete');
      
    } catch (error) {
      console.error('❌ Shutdown error:', error);
      throw error;
    }
  }
}

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SuperNinjaIntegration;
}