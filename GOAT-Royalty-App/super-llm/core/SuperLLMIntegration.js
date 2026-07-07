/**
 * Super LLM Integration Module
 * 
 * Integrates Super LLM with GOAT-Royalty-App and other applications
 */

const SuperLLM = require('./SuperLLM');
const EventEmitter = require('events');

class SuperLLMIntegration extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.llm = new SuperLLM(config);
    this.context = {};
    this.plugins = new Map();
    
    // Initialize with common integrations
    this.initializeIntegrations();
  }

  /**
   * Initialize integration points
   */
  initializeIntegrations() {
    // Register built-in plugins
    this.registerPlugin('royalty', {
      name: 'Royalty Analysis',
      description: 'Analyze royalty data and provide insights',
      systemPrompt: 'You are a royalty management assistant. Help analyze payments, calculate distributions, and provide insights about artist revenue.',
      preferredModels: ['anthropic/claude-opus-4', 'openai/gpt-4o']
    });
    
    this.registerPlugin('artist', {
      name: 'Artist Management',
      description: 'Manage artist profiles and communications',
      systemPrompt: 'You are an artist relations assistant. Help manage artist communications, contracts, and career planning.',
      preferredModels: ['openai/gpt-4o', 'anthropic/claude-sonnet-4']
    });
    
    this.registerPlugin('code', {
      name: 'Code Assistant',
      description: 'Generate and review code',
      systemPrompt: 'You are an expert software developer. Help write, review, and debug code.',
      preferredModels: ['deepseek/deepseek-coder-v3', 'anthropic/claude-sonnet-4', 'meta/codellama-70b']
    });
    
    this.registerPlugin('hosting', {
      name: 'Hosting Management',
      description: 'Manage hosting via Hostinger API',
      systemPrompt: 'You are a DevOps assistant. Help manage servers, domains, SSL certificates, and hosting infrastructure.',
      preferredModels: ['openai/gpt-4o', 'anthropic/claude-sonnet-4']
    });
    
    this.registerPlugin('analytics', {
      name: 'Analytics',
      description: 'Analyze data and generate reports',
      systemPrompt: 'You are a data analyst. Help analyze business data, generate reports, and provide actionable insights.',
      preferredModels: ['openai/gpt-4o', 'google/gemini-2.0-flash', 'anthropic/claude-opus-4']
    });
  }

  /**
   * Register a new plugin
   */
  registerPlugin(id, config) {
    this.plugins.set(id, {
      id,
      ...config,
      enabled: true
    });
    
    this.emit('pluginRegistered', { id, config });
  }

  /**
   * Get all registered plugins
   */
  getPlugins() {
    return Array.from(this.plugins.values());
  }

  /**
   * Enable/disable a plugin
   */
  togglePlugin(id, enabled) {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = enabled;
      this.emit('pluginToggled', { id, enabled });
    }
  }

  /**
   * Query with plugin context
   */
  async queryWithPlugin(pluginId, prompt, options = {}) {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }
    
    if (!plugin.enabled) {
      throw new Error(`Plugin is disabled: ${pluginId}`);
    }
    
    // Get preferred model for this plugin
    const modelPreference = plugin.preferredModels?.[0] || 'auto';
    
    const response = await this.llm.query(prompt, {
      ...options,
      model: options.model || modelPreference,
      systemPrompt: plugin.systemPrompt
    });
    
    this.emit('queryComplete', {
      plugin: pluginId,
      model: response.model,
      latency: response.latency
    });
    
    return response;
  }

  /**
   * Chat with context (for multi-turn conversations)
   */
  async chat(message, conversationHistory = [], options = {}) {
    const systemPrompt = options.systemPrompt || 
      'You are an intelligent AI assistant with access to 215 language models. Provide helpful, accurate, and thoughtful responses.';
    
    // Build conversation context
    const contextPrompt = conversationHistory.length > 0
      ? conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n') + '\n\n'
      : '';
    
    const fullPrompt = contextPrompt + `User: ${message}`;
    
    return await this.llm.query(fullPrompt, {
      ...options,
      systemPrompt
    });
  }

  /**
   * Analyze royalty data
   */
  async analyzeRoyalties(royaltyData, options = {}) {
    const prompt = `Analyze the following royalty data and provide insights:
    
${JSON.stringify(royaltyData, null, 2)}

Please provide:
1. Key trends and patterns
2. Revenue insights
3. Recommendations for optimization
4. Potential issues or anomalies`;

    return await this.queryWithPlugin('royalty', prompt, options);
  }

  /**
   * Generate code
   */
  async generateCode(description, options = {}) {
    const prompt = `Generate code for the following:
    
${description}

Please provide:
1. Clean, well-commented code
2. Error handling
3. Usage examples
4. Any necessary dependencies`;

    return await this.queryWithPlugin('code', prompt, options);
  }

  /**
   * Analyze contract
   */
  async analyzeContract(contractText, options = {}) {
    const prompt = `Analyze the following contract and highlight key terms:
    
${contractText}

Please provide:
1. Key terms and obligations
2. Royalty rates and payment terms
3. Important dates and deadlines
4. Potential concerns or red flags
5. Recommendations`;

    return await this.queryWithPlugin('royalty', prompt, options);
  }

  /**
   * Generate report
   */
  async generateReport(data, reportType = 'general', options = {}) {
    const prompt = `Generate a ${reportType} report based on the following data:

${JSON.stringify(data, null, 2)}

Please provide a professional report with:
1. Executive summary
2. Key findings
3. Detailed analysis
4. Recommendations
5. Data visualizations (describe what charts would be helpful)`;

    return await this.queryWithPlugin('analytics', prompt, options);
  }

  /**
   * Optimize payments
   */
  async optimizePayments(paymentData, options = {}) {
    const prompt = `Analyze and optimize the following payment schedule:

${JSON.stringify(paymentData, null, 2)}

Please provide:
1. Optimization recommendations
2. Cost savings opportunities
3. Improved payment schedule
4. Risk assessment
5. Cash flow projections`;

    return await this.queryWithPlugin('royalty', prompt, options);
  }

  /**
   * Predict revenue
   */
  async predictRevenue(historicalData, months = 6, options = {}) {
    const prompt = `Based on the following historical data, predict revenue for the next ${months} months:

${JSON.stringify(historicalData, null, 2)}

Please provide:
1. Monthly predictions
2. Confidence intervals
3. Key assumptions
4. Risk factors
5. Growth opportunities`;

    return await this.queryWithPlugin('analytics', prompt, options);
  }

  /**
   * Help with hosting management
   */
  async helpWithHosting(task, context = {}, options = {}) {
    const prompt = `Help with hosting task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Please provide:
1. Step-by-step instructions
2. Commands to run (if applicable)
3. Potential issues and solutions
4. Best practices`;

    return await this.queryWithPlugin('hosting', prompt, options);
  }

  /**
   * Get model recommendations for a task
   */
  getModelRecommendations(task) {
    const taskType = this.llm.detectTaskType(task);
    const models = this.llm.getModelsForTask(taskType);
    
    return {
      taskType,
      recommended: models.slice(0, 3).map(m => ({
        id: m.id,
        name: m.name,
        reason: `Optimized for ${m.capabilities?.join(', ') || 'general use'}`
      })),
      alternatives: models.slice(3, 6).map(m => ({
        id: m.id,
        name: m.name
      }))
    };
  }

  /**
   * Get performance statistics
   */
  getStats() {
    return {
      llm: this.llm.getPerformanceStats(),
      plugins: this.getPlugins().map(p => ({
        id: p.id,
        name: p.name,
        enabled: p.enabled
      }))
    };
  }
}

module.exports = SuperLLMIntegration;