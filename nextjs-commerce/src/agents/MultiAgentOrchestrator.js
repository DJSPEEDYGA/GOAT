/**
 * GOAT Royalty App - Multi-Agent Orchestrator
 * 
 * Inspired by: Agentic AI platforms from NVIDIA
 * 
 * This orchestrator manages multiple specialized AI agents that work together
 * to automate complex tasks across the GOAT Royalty platform.
 * 
 * Agents:
 * - ContractAnalystAgent: Contract analysis and review
 * - RevenueOptimizationAgent: Revenue forecasting and optimization
 * - ComplianceGuardAgent: Compliance monitoring and alerts
 * - AnalyticsIntelligenceAgent: Advanced analytics and insights
 * - WorkflowAutomationAgent: Automated task execution
 */

const EventEmitter = require('events');
const axios = require('axios');

class MultiAgentOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      ollamaUrl: config.ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434',
      ollamaModel: config.ollamaModel || process.env.OLLAMA_MODEL || 'llama3.1:8b',
      maxConcurrentAgents: config.maxConcurrentAgents || 5,
      taskTimeout: config.taskTimeout || 300000, // 5 minutes
      ...config
    };

    // Agent registry
    this.agents = new Map();
    
    // Task queue
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.completedTasks = new Map();
    
    // Performance metrics
    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageCompletionTime: 0
    };

    // Initialize agents
    this.initializeAgents();
  }

  /**
   * Initialize all agents
   */
  initializeAgents() {
    const agentDefinitions = [
      {
        id: 'contract-analyst',
        name: 'Contract Analyst Agent',
        description: 'Specializes in contract analysis, clause extraction, and risk assessment',
        capabilities: ['analyze-contract', 'extract-clauses', 'assess-risk', 'compare-contracts'],
        model: this.config.ollamaModel
      },
      {
        id: 'revenue-optimization',
        name: 'Revenue Optimization Agent',
        description: 'Optimizes royalty revenue through predictive analytics and strategic recommendations',
        capabilities: ['predict-revenue', 'optimize-territory', 'analyze-performance', 'forecast-trends'],
        model: 'mistral-nemo:12b'
      },
      {
        id: 'compliance-guard',
        name: 'Compliance Guard Agent',
        description: 'Monitors compliance with industry regulations and contract obligations',
        capabilities: ['check-compliance', 'audit-records', 'flag-violations', 'report-finding'],
        model: this.config.ollamaModel
      },
      {
        id: 'analytics-intelligence',
        name: 'Analytics Intelligence Agent',
        description: 'Provides advanced analytics, insights, and business intelligence',
        capabilities: ['generate-reports', 'track-kpis', 'analyze-trends', 'benchmarking'],
        model: 'qwen2.5:14b'
      },
      {
        id: 'workflow-automation',
        name: 'Workflow Automation Agent',
        description: 'Automates complex workflows and orchestrates multi-step processes',
        capabilities: ['automate-workflow', 'schedule-tasks', 'coordinate-agents', 'monitor-progress'],
        model: this.config.ollamaModel
      }
    ];

    agentDefinitions.forEach(agentDef => {
      this.agents.set(agentDef.id, {
        ...agentDef,
        isAvailable: true,
        currentTask: null
      });
    });

    console.log('🤖 Multi-Agent Orchestrator initialized');
    console.log(`   Registered ${this.agents.size} specialized agents`);
  }

  /**
   * Submit a task to the agent system
   */
  async submitTask(task) {
    try {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const taskWithId = {
        id: taskId,
        type: task.type,
        data: task.data,
        priority: task.priority || 'normal',
        deadline: task.deadline,
        createdAt: new Date(),
        status: 'queued',
        result: null,
        error: null
      };

      // Add to queue
      this.taskQueue.push(taskWithId);
      this.metrics.totalTasks++;

      this.emit('taskSubmitted', taskWithId);
      console.log(`📋 Task submitted: ${taskId} (${task.type})`);

      // Start processing
      this.processQueue();

      return taskWithId;

    } catch (error) {
      console.error(`❌ Error submitting task: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process the task queue
   */
  async processQueue() {
    if (this.taskQueue.length === 0) {
      return;
    }

    // Get available agents
    const availableAgents = Array.from(this.agents.entries())
      .filter(([_, agent]) => agent.isAvailable && !agent.currentTask)
      .slice(0, this.config.maxConcurrentAgents);

    if (availableAgents.length === 0) {
      console.log('⏸️ No available agents, waiting...');
      return;
    }

    // Assign tasks to agents
    while (this.taskQueue.length > 0 && availableAgents.length > 0) {
      const [agentId, agent] = availableAgents.shift();
      const task = this.taskQueue.shift();

      this.executeTask(agentId, agent, task);
    }
  }

  /**
   * Execute a task with a specific agent
   */
  async executeTask(agentId, agent, task) {
    const startTime = Date.now();

    // Update agent status
    agent.currentTask = task.id;
    agent.isAvailable = false;

    // Update task status
    task.status = 'processing';
    task.assignedAgent = agentId;
    task.startedAt = new Date();

    this.activeTasks.set(task.id, task);
    this.emit('taskStarted', task);

    console.log(`🚀 Agent ${agentId} started task: ${task.id}`);

    try {
      // Execute task based on type
      const result = await this.executeTaskByType(task, agent);

      // Mark as complete
      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date();
      task.duration = Date.now() - startTime;

      // Update metrics
      this.metrics.completedTasks++;
      this.metrics.averageCompletionTime = 
        ((this.metrics.averageCompletionTime * (this.metrics.completedTasks - 1)) + task.duration) / 
        this.metrics.completedTasks;

      // Mark agent as available
      agent.currentTask = null;
      agent.isAvailable = true;

      this.activeTasks.delete(task.id);
      this.completedTasks.set(task.id, task);

      this.emit('taskCompleted', task);
      console.log(`✅ Task completed: ${task.id} (${task.duration}ms)`);

      // Process next tasks
      this.processQueue();

      return result;

    } catch (error) {
      // Mark as failed
      task.status = 'failed';
      task.error = error.message;
      task.completedAt = new Date();

      // Update metrics
      this.metrics.failedTasks++;

      // Mark agent as available
      agent.currentTask = null;
      agent.isAvailable = true;

      this.activeTasks.delete(task.id);
      this.completedTasks.set(task.id, task);

      this.emit('taskFailed', task);
      console.error(`❌ Task failed: ${task.id} - ${error.message}`);

      // Process next tasks
      this.processQueue();

      throw error;
    }
  }

  /**
   * Execute task by type using appropriate agent
   */
  async executeTaskByType(task, agent) {
    const { type, data } = task;

    switch (type) {
      case 'analyze-contract':
        return await this.analyzeContract(data, agent);
      
      case 'predict-revenue':
        return await this.predictRevenue(data, agent);
      
      case 'check-compliance':
        return await this.checkCompliance(data, agent);
      
      case 'generate-analytics-report':
        return await this.generateAnalyticsReport(data, agent);
      
      case 'optimize-territories':
        return await this.optimizeTerritories(data, agent);
      
      case 'coordinate-workflow':
        return await this.coordinateWorkflow(data, agent);
      
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  /**
   * Analyze contract using Contract Analyst Agent
   */
  async analyzeContract(data, agent) {
    const prompt = `You are the Contract Analyst Agent. Analyze this music contract comprehensively.

Contract text: ${data.contractText || data.text || ''}

Provide analysis in JSON format:
{
  "agent": "${agent.name}",
  "contractType": "type",
  "parties": ["party 1", "party 2"],
  "keyTerms": {
    "duration": "contract length",
    "royaltyRates": {"mechanical": "rate", "performance": "rate"},
    "territory": "coverage",
    "exclusivity": true/false
  },
  "clauses": [
    {"type": "clause type", "text": "extract", "importance": "high/medium/low"}
  ],
  "risks": [
    {"type": "risk type", "severity": "critical/high/medium/low", "description": "explanation"}
  ],
  "recommendations": [
    "recommendation 1",
    "recommendation 2"
  ],
  "summary": "brief summary"
}`;

    const response = await this.callOllama(prompt, { model: agent.model, temperature: 0.4 });
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: response };
    } catch (e) {
      return { summary: response };
    }
  }

  /**
   * Predict revenue using Revenue Optimization Agent
   */
  async predictRevenue(data, agent) {
    const prompt = `You are the Revenue Optimization Agent. Predict future revenue based on historical data.

Historical data: ${JSON.stringify(data.historicalData, null, 2)}
Forecast period: ${data.forecastPeriod || '90 days'}
Artist: ${data.artistId || 'All artists'}

Provide forecast in JSON format:
{
  "agent": "${agent.name}",
  "forecastPeriod": "${data.forecastPeriod || '90 days'}",
  "currentMonthlyRevenue": "amount",
  "predictedRevenue": {
    "total": "amount",
    "byMonth": [
      {"month": "MMM", "revenue": "amount", "confidence": "%"}
    ]
  },
  "growthRate": "percentage",
  "confidence": "high/medium/low",
  "keyDrivers": ["driver 1", "driver 2"],
  "risks": [
    {"risk": "description", "probability": "high/medium/low"}
  ],
  "opportunities": [
    {"opportunity": "description", "potential": "impact"}
  ],
  "recommendations": [
    "strategic recommendation 1"
  ]
}`;

    const response = await this.callOllama(prompt, { model: agent.model, temperature: 0.5 });
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: response };
    } catch (e) {
      return { summary: response };
    }
  }

  /**
   * Check compliance using Compliance Guard Agent
   */
  async checkCompliance(data, agent) {
    const prompt = `You are the Compliance Guard Agent. Check for regulatory compliance issues.

Contract or data: ${data.content || data.text || JSON.stringify(data)}
Compliance standards: ${data.standards || 'Standard music industry regulations'}

Provide compliance check in JSON format:
{
  "agent": "${agent.name}",
  "isCompliant": true/false,
  "complianceScore": 1-100,
  "violations": [
    {
      "type": "violation type",
      "severity": "critical/high/medium/low",
      "description": "explanation",
      "affectedClauses": ["clause reference"],
      "remediation": "how to fix"
    }
  ],
  "missingElements": [
    "required element 1",
    "required element 2"
  ],
  "recommendations": [
    "compliance recommendation 1"
  ],
  "nextAuditDate": "YYYY-MM-DD"
}`;

    const response = await this.callOllama(prompt, { model: agent.model, temperature: 0.4 });
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: response };
    } catch (e) {
      return { summary: response };
    }
  }

  /**
   * Generate analytics report using Analytics Intelligence Agent
   */
  async generateAnalyticsReport(data, agent) {
    const prompt = `You are the Analytics Intelligence Agent. Generate comprehensive analytics report.

Data: ${JSON.stringify(data.data, null, 2)}
Report type: ${data.reportType || 'comprehensive'}
Time period: ${data.timePeriod || '30 days'}

Provide report in JSON format:
{
  "agent": "${agent.name}",
  "reportType": "${data.reportType || 'comprehensive'}",
  "timePeriod": "${data.timePeriod || '30 days'}",
  "executiveSummary": "overview",
  "keyMetrics": {
    "totalRevenue": "amount",
    "growth": "%",
    "topPerformer": "name"
  },
  "insights": [
    "insight 1 with explanation",
    "insight 2 with explanation"
  ],
  "recommendations": [
    "actionable recommendation 1"
  ],
  "visualizations": [
    {"type": "chart type", "data": "", "description": ""}
  ]
}`;

    const response = await this.callOllama(prompt, { model: agent.model, temperature: 0.6 });
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: response };
    } catch (e) {
      return { summary: response };
    }
  }

  /**
   * Optimize territories using Revenue Optimization Agent
   */
  async optimizeTerritories(data, agent) {
    const prompt = `You are the Revenue Optimization Agent. Optimize territorial revenue performance.

Current territorial data: ${JSON.stringify(data.data, null, 2)}
Target increase: ${data.targetIncrease || '10%'}

Provide optimization plan in JSON format:
{
  "agent": "${agent.name}",
  "targetIncrease": "${data.targetIncrease || '10%'}",
  "currentPerformance": {
    "topTerritories": [
      {"territory": "name", "revenue": "amount", "growth": "%"}
    ],
    "underperforming": [
      {"territory": "name", "revenue": "amount", "potential": "% growth"}
    ]
  },
  "optimizationPlan": [
    {
      "territory": "name",
      "potential": "amount",
      "actions": ["action 1", "action 2"],
      "investment": "amount"
    }
  ],
  "priorities": [
    {"territory": "name", "priority": 1-5, "reason": "why"}
  ],
  "expectedOutcome": {
    "additionalRevenue": "amount",
    "timeline": "X months"
  }
}`;

    const response = await this.callOllama(prompt, { model: agent.model, temperature: 0.6 });
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: response };
    } catch (e) {
      return { summary: response };
    }
  }

  /**
   * Coordinate multi-agent workflow
   */
  async coordinateWorkflow(data, agent) {
    const { steps = [] } = data;

    if (steps.length === 0) {
      return { error: 'No workflow steps defined' };
    }

    const results = [];
    let currentData = data.initialData;

    for (const step of steps) {
      console.log(`🔄 Executing workflow step: ${step.name}`);

      const stepTask = {
        type: step.taskType,
        data: step.data ? { ...step.data, ...currentData } : currentData
      };

      const stepResult = await this.executeTaskByType(stepTask, this.agents.get(step.agentId || 'workflow-automation'));
      results.push({ step: step.name, result: stepResult });

      currentData = { ...currentData, ...stepResult };
    }

    return {
      workflowName: data.workflowName,
      results,
      finalData: currentData
    };
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId) {
    return (
      this.activeTasks.get(taskId) ||
      this.completedTasks.get(taskId) ||
      this.taskQueue.find(t => t.id === taskId)
    );
  }

  /**
   * Get system metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      taskQueue: this.taskQueue.length,
      activeTasks: this.activeTasks.size,
      completedTasks: this.completedTasks.size,
      availableAgents: Array.from(this.agents.entries())
        .filter(([_, agent]) => agent.isAvailable)
        .length,
      totalAgents: this.agents.size
    };
  }

  /**
   * Get all agents
   */
  getAgents() {
    return Array.from(this.agents.entries()).map(([id, agent]) => ({
      id,
      ...agent
    }));
  }

  /**
   * Clear completed tasks
   */
  clearCompletedTasks() {
    this.completedTasks.clear();
    console.log('🗑️ Cleared completed tasks');
  }

  /**
   * Call local Ollama
   */
  async callOllama(prompt, options = {}) {
    try {
      const response = await axios.post(`${this.config.ollamaUrl}/api/chat`, {
        model: options.model || this.config.ollamaModel,
        messages: [
          {
            role: 'system',
            content: 'You are a specialized AI agent for the GOAT Royalty Management System. Analyze data, extract insights, and provide clear, actionable recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_ctx: 16384
        }
      }, {
        timeout: this.config.taskTimeout
      });

      return response.data.message?.content || '';

    } catch (error) {
      console.error(`❌ Ollama API error: ${error.message}`);
      throw new Error('Agent execution failed');
    }
  }
}

module.exports = MultiAgentOrchestrator;