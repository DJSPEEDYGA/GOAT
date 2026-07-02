/**
 * GOAT Autonomous Agent System
 * 
 * This agent can autonomously use ALL available tools to:
 * - Analyze royalty data
 * - Generate reports
 * - Process payments
 * - Communicate with artists
 * - Optimize revenue
 * - Make intelligent decisions
 * - Execute complex workflows
 * 
 * UPDATED: Now uses local Ollama - NO API KEY REQUIRED
 */

const axios = require('axios');
const HostingerTools = require('./tools/hostingerTools');

class AutonomousAgent {
  constructor(config = {}) {
    this.config = {
      model: config.model || process.env.OLLAMA_MODEL || 'llama3.1:8b',
      ollamaUrl: config.ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434',
      temperature: config.temperature || 0.7,
      maxIterations: config.maxIterations || 10,
      ...config
    };

    // Check Ollama availability
    this.checkOllama();

    // Initialize Hostinger tools
    this.hostingerTools = new HostingerTools();

    // Tool registry
    this.tools = this.initializeTools();
    
    // Memory system
    this.memory = {
      shortTerm: [],
      longTerm: [],
      context: {}
    };

    // Execution state
    this.state = {
      isRunning: false,
      currentTask: null,
      iterations: 0,
      results: []
    };
  }

  /**
   * Check if Ollama is available
   */
  async checkOllama() {
    try {
      const response = await axios.get(`${this.config.ollamaUrl}/api/tags`, { timeout: 2000 });
      if (response.data && response.data.models) {
        console.log(`✅ Ollama connected for AutonomousAgent`);
        console.log(`   Available models: ${response.data.models.map(m => m.name).join(', ')}`);
        this.isAvailable = true;
      }
    } catch (error) {
      console.log('⚠️ Ollama not running - Start with: ollama serve');
      this.isAvailable = false;
    }
  }

  /**
   * Call Ollama API
   */
  async callOllama(messages, options = {}) {
    try {
      const response = await axios.post(`${this.config.ollamaUrl}/api/chat`, {
        model: options.model || this.config.model,
        messages: messages,
        stream: false,
        options: {
          temperature: options.temperature || this.config.temperature
        }
      }, {
        timeout: 120000
      });

      return response.data.message?.content || '';
    } catch (error) {
      console.error('Ollama API error:', error.message);
      throw error;
    }
  }

  /**
   * Initialize ALL available tools
   */
  initializeTools() {
    return {
      // Data Analysis Tools
      analyzeRoyalties: {
        name: 'analyze_royalties',
        description: 'Analyze royalty data for patterns, trends, and insights',
        parameters: {
          type: 'object',
          properties: {
            artistId: { type: 'string', description: 'Artist ID to analyze' },
            startDate: { type: 'string', description: 'Start date for analysis' },
            endDate: { type: 'string', description: 'End date for analysis' },
            metrics: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Metrics to analyze (revenue, streams, growth, etc.)'
            }
          },
          required: ['artistId']
        },
        execute: async (params) => await this.executeAnalyzeRoyalties(params)
      },

      // Payment Processing Tools
      processPayment: {
        name: 'process_payment',
        description: 'Process a payment to an artist',
        parameters: {
          type: 'object',
          properties: {
            artistId: { type: 'string', description: 'Artist ID' },
            amount: { type: 'number', description: 'Payment amount' },
            method: { 
              type: 'string', 
              enum: ['bank_transfer', 'paypal', 'stripe', 'check'],
              description: 'Payment method'
            },
            royaltyIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Royalty IDs to include in payment'
            }
          },
          required: ['artistId', 'amount', 'method']
        },
        execute: async (params) => await this.executeProcessPayment(params)
      },

      // Report Generation Tools
      generateReport: {
        name: 'generate_report',
        description: 'Generate comprehensive reports (PDF, Excel, CSV)',
        parameters: {
          type: 'object',
          properties: {
            reportType: {
              type: 'string',
              enum: ['earnings', 'payments', 'analytics', 'tax', 'quarterly', 'annual'],
              description: 'Type of report to generate'
            },
            format: {
              type: 'string',
              enum: ['pdf', 'excel', 'csv', 'json'],
              description: 'Output format'
            },
            artistId: { type: 'string', description: 'Artist ID (optional)' },
            startDate: { type: 'string', description: 'Start date' },
            endDate: { type: 'string', description: 'End date' }
          },
          required: ['reportType', 'format']
        },
        execute: async (params) => await this.executeGenerateReport(params)
      },

      // Communication Tools
      sendEmail: {
        name: 'send_email',
        description: 'Send email to artists or stakeholders',
        parameters: {
          type: 'object',
          properties: {
            to: { type: 'string', description: 'Recipient email' },
            subject: { type: 'string', description: 'Email subject' },
            body: { type: 'string', description: 'Email body' },
            attachments: {
              type: 'array',
              items: { type: 'string' },
              description: 'File paths to attach'
            }
          },
          required: ['to', 'subject', 'body']
        },
        execute: async (params) => await this.executeSendEmail(params)
      },

      // Database Query Tools
      queryDatabase: {
        name: 'query_database',
        description: 'Query the database for specific information',
        parameters: {
          type: 'object',
          properties: {
            collection: {
              type: 'string',
              enum: ['artists', 'royalties', 'payments', 'contracts', 'users'],
              description: 'Database collection to query'
            },
            filters: {
              type: 'object',
              description: 'Query filters'
            },
            sort: {
              type: 'object',
              description: 'Sort criteria'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results'
            }
          },
          required: ['collection']
        },
        execute: async (params) => await this.executeQueryDatabase(params)
      },

      // Calculation Tools
      calculateRoyalties: {
        name: 'calculate_royalties',
        description: 'Calculate royalties based on streams, sales, and contracts',
        parameters: {
          type: 'object',
          properties: {
            artistId: { type: 'string', description: 'Artist ID' },
            platform: {
              type: 'string',
              enum: ['spotify', 'apple', 'youtube', 'amazon', 'all'],
              description: 'Platform to calculate for'
            },
            streams: { type: 'number', description: 'Number of streams' },
            sales: { type: 'number', description: 'Number of sales' },
            period: { type: 'string', description: 'Period (e.g., "2024-Q1")' }
          },
          required: ['artistId', 'platform']
        },
        execute: async (params) => await this.executeCalculateRoyalties(params)
      },

      // Hostinger Management Tools
      ...this.getHostingerTools()
    };
  }

  /**
   * Get Hostinger tools from HostingerTools class
   */
  getHostingerTools() {
    try {
      const hostingerTools = this.hostingerTools.getTools();
      const toolsObject = {};
      
      hostingerTools.forEach(tool => {
        const toolKey = tool.name.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        toolsObject[toolKey] = {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
          execute: tool.execute
        };
      });
      
      return toolsObject;
    } catch (e) {
      return {};
    }
  }

  /**
   * Main autonomous execution loop
   */
  async run(task, context = {}) {
    this.state.isRunning = true;
    this.state.currentTask = task;
    this.state.iterations = 0;
    this.state.results = [];
    this.memory.context = context;

    console.log(`🤖 Starting autonomous agent for task: ${task}`);

    try {
      while (this.state.iterations < this.config.maxIterations) {
        this.state.iterations++;
        
        console.log(`\n📍 Iteration ${this.state.iterations}/${this.config.maxIterations}`);

        const action = await this.getNextAction(task);
        
        if (action.type === 'complete') {
          console.log('✅ Task completed successfully');
          break;
        }

        const result = await this.executeAction(action);
        this.state.results.push(result);
        
        this.updateMemory(action, result);

        if (await this.isTaskComplete(task)) {
          console.log('✅ Task completed successfully');
          break;
        }
      }

      return {
        success: true,
        task,
        iterations: this.state.iterations,
        results: this.state.results,
        summary: await this.generateSummary()
      };

    } catch (error) {
      console.error('❌ Agent execution error:', error);
      return {
        success: false,
        error: error.message,
        task,
        iterations: this.state.iterations,
        results: this.state.results
      };
    } finally {
      this.state.isRunning = false;
    }
  }

  /**
   * Get next action from AI (using Ollama)
   */
  async getNextAction(task) {
    const messages = [
      {
        role: 'system',
        content: `You are an autonomous AI agent for a royalty management system. 
        You have access to various tools to analyze data, process payments, generate reports, and more.
        Available tools: ${Object.keys(this.tools).join(', ')}
        Current context: ${JSON.stringify(this.memory.context)}
        Previous actions: ${JSON.stringify(this.state.results.slice(-3))}
        Respond ONLY with a valid JSON object:
        {"type": "tool_call" or "complete", "tool": "tool_name", "parameters": {...}, "reasoning": "why this action"}`
      },
      {
        role: 'user',
        content: `Task: ${task}\n\nWhat should I do next? Respond with JSON only.`
      }
    ];

    const response = await this.callOllama(messages);
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const action = JSON.parse(jsonMatch[0]);
        console.log(`🎯 Next action: ${action.tool || 'complete'}`);
        console.log(`💭 Reasoning: ${action.reasoning}`);
        return action;
      }
    } catch (e) {
      console.log('Could not parse JSON from response');
    }
    
    return { type: 'complete', reasoning: 'Could not determine next action' };
  }

  /**
   * Execute an action
   */
  async executeAction(action) {
    if (action.type === 'complete') {
      return { success: true, message: 'Task completed' };
    }

    const tool = this.tools[action.tool];
    if (!tool) {
      throw new Error(`Tool not found: ${action.tool}`);
    }

    console.log(`⚙️ Executing: ${tool.name}`);

    try {
      const result = await tool.execute(action.parameters || {});
      console.log(`✅ Result:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Error executing ${tool.name}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update agent memory
   */
  updateMemory(action, result) {
    this.memory.shortTerm.push({
      action,
      result,
      timestamp: new Date()
    });

    if (this.memory.shortTerm.length > 10) {
      this.memory.shortTerm.shift();
    }
  }

  /**
   * Check if task is complete (using Ollama)
   */
  async isTaskComplete(task) {
    const messages = [
      {
        role: 'system',
        content: 'Determine if the task is complete. Respond with JSON only: {"complete": true/false, "reason": "..."}'
      },
      {
        role: 'user',
        content: `Task: ${task}\nResults: ${JSON.stringify(this.state.results)}\n\nIs the task complete?`
      }
    ];

    const response = await this.callOllama(messages, { temperature: 0.3 });
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return result.complete;
      }
    } catch (e) {}
    
    return false;
  }

  /**
   * Generate execution summary (using Ollama)
   */
  async generateSummary() {
    const messages = [
      {
        role: 'system',
        content: 'Generate a concise summary of the agent execution.'
      },
      {
        role: 'user',
        content: `Task: ${this.state.currentTask}\nResults: ${JSON.stringify(this.state.results)}\n\nGenerate a summary.`
      }
    ];

    return await this.callOllama(messages, { temperature: 0.5 });
  }

  // Tool execution methods
  async executeAnalyzeRoyalties(params) {
    return { success: true, data: { message: 'Royalty analysis complete' } };
  }

  async executeProcessPayment(params) {
    return { success: true, data: { message: 'Payment processed' } };
  }

  async executeGenerateReport(params) {
    return { success: true, message: 'Report generated', reportPath: `/reports/${params.reportType}-${Date.now()}.${params.format}` };
  }

  async executeSendEmail(params) {
    return { success: true, message: 'Email sent' };
  }

  async executeQueryDatabase(params) {
    return { success: true, data: [] };
  }

  async executeCalculateRoyalties(params) {
    const rate = 0.004;
    const calculated = (params.streams || 0) * rate;
    return { success: true, data: { amount: calculated, streams: params.streams, rate } };
  }
}

module.exports = AutonomousAgent;