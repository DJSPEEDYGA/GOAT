/**
 * AI Agent Router
 * Routes tasks to specialized agents based on type and complexity
 * Part of the Hierarchical Agent Architecture
 */

const OrchestratorAgent = require('./orchestrator');
const CoderAgent = require('./workers/coder');
const AnalystAgent = require('./workers/analyst');
const RoyaltyAgent = require('./workers/royalty');
const BlockchainAgent = require('./workers/blockchain');
const MiningAgent = require('./workers/mining');
const DistributionAgent = require('./workers/distribution');
const VideoAgent = require('./workers/video');
const AudioAgent = require('./workers/audio');
const ReportAgent = require('./workers/report');
const ResearchAgent = require('./workers/research');
const SupportAgent = require('./workers/support');

// Agent registry with capabilities
const AGENT_REGISTRY = {
  orchestrator: {
    name: 'Orchestrator Agent',
    class: OrchestratorAgent,
    capabilities: ['planning', 'delegation', 'coordination', 'monitoring'],
    priority: 1,
    description: 'Supervisor agent that decomposes goals and coordinates workers'
  },
  coder: {
    name: 'Coder Agent',
    class: CoderAgent,
    capabilities: ['code-generation', 'debugging', 'refactoring', 'testing'],
    priority: 2,
    description: 'Writes, reviews, and debugs code'
  },
  analyst: {
    name: 'Analyst Agent',
    class: AnalystAgent,
    capabilities: ['data-analysis', 'visualization', 'forecasting', 'insights'],
    priority: 2,
    description: 'Analyzes data and generates insights'
  },
  royalty: {
    name: 'Royalty Agent',
    class: RoyaltyAgent,
    capabilities: ['royalty-calculation', 'payment-processing', 'contract-management', 'reporting'],
    priority: 2,
    description: 'Manages royalty calculations and payments'
  },
  blockchain: {
    name: 'Blockchain Agent',
    class: BlockchainAgent,
    capabilities: ['smart-contracts', 'verification', 'wallet-management', 'transactions'],
    priority: 2,
    description: 'Handles blockchain operations and verification'
  },
  mining: {
    name: 'Mining Agent',
    class: MiningAgent,
    capabilities: ['crypto-mining', 'pool-management', 'optimization', 'monitoring'],
    priority: 2,
    description: 'Manages cryptocurrency mining operations'
  },
  distribution: {
    name: 'Distribution Agent',
    class: DistributionAgent,
    capabilities: ['dsp-distribution', 'content-delivery', 'platform-sync', 'metadata-management'],
    priority: 2,
    description: 'Handles content distribution to DSPs'
  },
  video: {
    name: 'Video Agent',
    class: VideoAgent,
    capabilities: ['video-editing', 'effects', 'encoding', 'streaming'],
    priority: 2,
    description: 'AI-powered video editing and processing'
  },
  audio: {
    name: 'Audio Agent',
    class: AudioAgent,
    capabilities: ['audio-processing', 'mixing', 'mastering', 'transcription'],
    priority: 2,
    description: 'Audio production and processing'
  },
  report: {
    name: 'Report Agent',
    class: ReportAgent,
    capabilities: ['report-generation', 'pdf-creation', 'scheduling', 'templates'],
    priority: 2,
    description: 'Generates comprehensive reports'
  },
  research: {
    name: 'Research Agent',
    class: ResearchAgent,
    capabilities: ['web-search', 'data-collection', 'summarization', 'fact-checking'],
    priority: 2,
    description: 'Conducts research and gathers information'
  },
  support: {
    name: 'Support Agent',
    class: SupportAgent,
    capabilities: ['customer-support', 'faq', 'troubleshooting', 'documentation'],
    priority: 3,
    description: 'Provides user support and assistance'
  }
};

// Task type to agent mapping
const TASK_MAPPING = {
  'code': 'coder',
  'debug': 'coder',
  'refactor': 'coder',
  'analyze': 'analyst',
  'visualization': 'analyst',
  'forecast': 'analyst',
  'royalty': 'royalty',
  'payment': 'royalty',
  'contract': 'royalty',
  'blockchain': 'blockchain',
  'verify': 'blockchain',
  'wallet': 'blockchain',
  'mining': 'mining',
  'crypto': 'mining',
  'distribute': 'distribution',
  'dsp': 'distribution',
  'upload': 'distribution',
  'video': 'video',
  'edit': 'video',
  'audio': 'audio',
  'mix': 'audio',
  'master': 'audio',
  'report': 'report',
  'pdf': 'report',
  'research': 'research',
  'search': 'research',
  'help': 'support',
  'support': 'support'
};

class AgentRouter {
  constructor() {
    this.agents = {};
    this.activeTasks = new Map();
    this.taskHistory = [];
    this.initialized = false;
  }

  /**
   * Initialize all agents
   */
  async initialize() {
    if (this.initialized) return;
    
    for (const [key, config] of Object.entries(AGENT_REGISTRY)) {
      this.agents[key] = new config.class();
      await this.agents[key].initialize();
    }
    
    this.initialized = true;
    console.log('[AgentRouter] All agents initialized');
  }

  /**
   * Determine which agent should handle a task
   */
  routeTask(task) {
    const taskLower = task.toLowerCase();
    
    for (const [keyword, agent] of Object.entries(TASK_MAPPING)) {
      if (taskLower.includes(keyword)) {
        return agent;
      }
    }
    
    return 'orchestrator'; // Default to orchestrator for complex tasks
  }

  /**
   * Invoke a specific agent for a task
   */
  async invokeAgent(agentName, task, params = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const agentConfig = AGENT_REGISTRY[agentName];
    if (!agentConfig) {
      throw new Error(`Unknown agent: ${agentName}`);
    }

    const agent = this.agents[agentName];
    const taskId = this.generateTaskId();
    
    console.log(`[AgentRouter] Invoking ${agentConfig.name} for task: ${task}`);
    
    const taskRecord = {
      id: taskId,
      agent: agentName,
      task,
      params,
      status: 'running',
      startTime: Date.now()
    };
    
    this.activeTasks.set(taskId, taskRecord);

    try {
      const result = await agent.execute(task, params);
      
      taskRecord.status = 'completed';
      taskRecord.endTime = Date.now();
      taskRecord.duration = taskRecord.endTime - taskRecord.startTime;
      taskRecord.result = result;
      
      this.taskHistory.push(taskRecord);
      this.activeTasks.delete(taskId);
      
      return {
        success: true,
        taskId,
        agent: agentName,
        result,
        duration: taskRecord.duration
      };
    } catch (error) {
      taskRecord.status = 'failed';
      taskRecord.error = error.message;
      taskRecord.endTime = Date.now();
      
      this.taskHistory.push(taskRecord);
      this.activeTasks.delete(taskId);
      
      return {
        success: false,
        taskId,
        agent: agentName,
        error: error.message
      };
    }
  }

  /**
   * Execute a complex goal using orchestrator
   */
  async executeGoal(goal, context = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const orchestrator = this.agents.orchestrator;
    return await orchestrator.executeGoal(goal, context, this);
  }

  /**
   * Get available agents and their capabilities
   */
  getAvailableAgents() {
    return Object.entries(AGENT_REGISTRY).map(([key, config]) => ({
      id: key,
      name: config.name,
      capabilities: config.capabilities,
      description: config.description,
      status: this.agents[key]?.status || 'uninitialized'
    }));
  }

  /**
   * Get task history
   */
  getTaskHistory(limit = 100) {
    return this.taskHistory.slice(-limit);
  }

  /**
   * Get active tasks
   */
  getActiveTasks() {
    return Array.from(this.activeTasks.values());
  }

  /**
   * Generate unique task ID
   */
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
module.exports = new AgentRouter();