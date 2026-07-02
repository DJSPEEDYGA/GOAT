/**
 * Base Worker Agent Class
 * All specialized agents extend this class
 */

const EventEmitter = require('events');

class BaseWorkerAgent extends EventEmitter {
  constructor(config = {}) {
    super();
    this.name = config.name || 'BaseWorker';
    this.capabilities = config.capabilities || [];
    this.status = 'idle';
    this.memory = new Map();
    this.maxMemory = config.maxMemory || 100;
    this.llmProvider = null;
  }

  async initialize() {
    this.status = 'ready';
    console.log(`[${this.name}] Initialized`);
  }

  /**
   * Main execution method - to be overridden by subclasses
   */
  async execute(task, params = {}) {
    throw new Error('execute() must be implemented by subclass');
  }

  /**
   * Store information in agent memory
   */
  remember(key, value) {
    if (this.memory.size >= this.maxMemory) {
      const firstKey = this.memory.keys().next().value;
      this.memory.delete(firstKey);
    }
    this.memory.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Retrieve information from agent memory
   */
  recall(key) {
    const item = this.memory.get(key);
    return item ? item.value : null;
  }

  /**
   * Clear agent memory
   */
  forget() {
    this.memory.clear();
  }

  /**
   * Get agent status and capabilities
   */
  getStatus() {
    return {
      name: this.name,
      status: this.status,
      capabilities: this.capabilities,
      memoryUsage: this.memory.size
    };
  }

  /**
   * Set LLM provider for this agent
   */
  setLLMProvider(provider) {
    this.llmProvider = provider;
  }

  /**
   * Generate a response using the LLM
   */
  async generateResponse(prompt, options = {}) {
    if (!this.llmProvider) {
      throw new Error('No LLM provider configured');
    }
    return await this.llmProvider.generate(prompt, options);
  }

  /**
   * Log activity
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.name}] [${level.toUpperCase()}] ${message}`);
  }
}

module.exports = BaseWorkerAgent;