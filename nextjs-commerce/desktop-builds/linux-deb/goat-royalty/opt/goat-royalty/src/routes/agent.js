const express = require('express');
const AutonomousAgent = require('../agents/AutonomousAgent');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Store active agents
const activeAgents = new Map();

// @desc    Start autonomous agent task
// @route   POST /api/agent/execute
// @access  Private/Admin/Manager
router.post('/execute',
  protect,
  authorize('admin', 'manager'),
  asyncHandler(async (req, res) => {
    const { task, context } = req.body;

    if (!task) {
      throw new AppError('Task is required', 400);
    }

    // Create new agent instance
    const agent = new AutonomousAgent({
      model: req.body.model || 'gpt-4-turbo-preview',
      temperature: req.body.temperature || 0.7,
      maxIterations: req.body.maxIterations || 10
    });

    // Generate agent ID
    const agentId = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    activeAgents.set(agentId, agent);

    // Execute agent asynchronously
    const executionPromise = agent.run(task, {
      ...context,
      userId: req.user.id,
      userRole: req.user.role
    });

    // Return immediately with agent ID
    res.status(202).json({
      success: true,
      message: 'Agent execution started',
      data: {
        agentId,
        task,
        status: 'running'
      }
    });

    // Handle completion
    executionPromise.then(result => {
      console.log(`Agent ${agentId} completed:`, result);
      // Store result for retrieval
      activeAgents.set(`${agentId}-result`, result);
    }).catch(error => {
      console.error(`Agent ${agentId} failed:`, error);
      activeAgents.set(`${agentId}-result`, { success: false, error: error.message });
    });
  })
);

// @desc    Get agent execution status
// @route   GET /api/agent/status/:agentId
// @access  Private
router.get('/status/:agentId',
  protect,
  asyncHandler(async (req, res) => {
    const { agentId } = req.params;
    
    const agent = activeAgents.get(agentId);
    const result = activeAgents.get(`${agentId}-result`);

    if (!agent && !result) {
      throw new AppError('Agent not found', 404);
    }

    if (result) {
      return res.json({
        success: true,
        data: {
          agentId,
          status: 'completed',
          result
        }
      });
    }

    res.json({
      success: true,
      data: {
        agentId,
        status: agent.state.isRunning ? 'running' : 'idle',
        currentTask: agent.state.currentTask,
        iterations: agent.state.iterations,
        results: agent.state.results
      }
    });
  })
);

// @desc    List all active agents
// @route   GET /api/agent/list
// @access  Private/Admin/Manager
router.get('/list',
  protect,
  authorize('admin', 'manager'),
  asyncHandler(async (req, res) => {
    const agents = [];
    
    for (const [agentId, agent] of activeAgents.entries()) {
      if (!agentId.includes('-result')) {
        agents.push({
          agentId,
          status: agent.state.isRunning ? 'running' : 'idle',
          currentTask: agent.state.currentTask,
          iterations: agent.state.iterations
        });
      }
    }

    res.json({
      success: true,
      data: {
        agents,
        count: agents.length
      }
    });
  })
);

// @desc    Execute predefined agent tasks
// @route   POST /api/agent/tasks/:taskName
// @access  Private/Admin/Manager
router.post('/tasks/:taskName',
  protect,
  authorize('admin', 'manager'),
  asyncHandler(async (req, res) => {
    const { taskName } = req.params;
    const { parameters } = req.body;

    // Predefined tasks
    const tasks = {
      'monthly-close': 'Execute the monthly close process: calculate all royalties, generate reports, and prepare payments for all artists',
      'quarterly-reports': 'Generate quarterly reports for all artists including earnings summaries, payment history, and analytics',
      'optimize-payments': 'Analyze all pending payments and optimize the payment schedule to minimize fees and maximize efficiency',
      'sync-platforms': 'Sync data from all streaming platforms (Spotify, Apple Music, YouTube) for all artists',
      'compliance-check': 'Run a comprehensive compliance check on all contracts, payments, and reporting',
      'revenue-forecast': 'Analyze historical data and predict revenue for the next 6 months for all artists',
      'artist-insights': `Generate detailed insights and recommendations for artist: ${parameters?.artistId || 'all artists'}`,
      'payment-reminders': 'Send payment reminders to all artists with pending payments',
      'contract-renewals': 'Identify contracts expiring in the next 90 days and prepare renewal notices',
      'anomaly-detection': 'Analyze all royalty data for anomalies, discrepancies, or unusual patterns'
    };

    const task = tasks[taskName];
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Create and execute agent
    const agent = new AutonomousAgent();
    const agentId = `agent-${taskName}-${Date.now()}`;
    activeAgents.set(agentId, agent);

    const executionPromise = agent.run(task, {
      taskName,
      parameters,
      userId: req.user.id,
      userRole: req.user.role
    });

    res.status(202).json({
      success: true,
      message: `Task '${taskName}' started`,
      data: {
        agentId,
        taskName,
        task,
        status: 'running'
      }
    });

    executionPromise.then(result => {
      activeAgents.set(`${agentId}-result`, result);
    }).catch(error => {
      activeAgents.set(`${agentId}-result`, { success: false, error: error.message });
    });
  })
);

// @desc    Chat with autonomous agent
// @route   POST /api/agent/chat
// @access  Private
router.post('/chat',
  protect,
  asyncHandler(async (req, res) => {
    const { message, conversationId } = req.body;

    if (!message) {
      throw new AppError('Message is required', 400);
    }

    // Get or create agent for this conversation
    const resolvedConversationId = conversationId || `conv-${Date.now()}`;
    let agent = activeAgents.get(resolvedConversationId);
    if (!agent) {
      agent = new AutonomousAgent();
      activeAgents.set(resolvedConversationId, agent);
    }

    // Process message and get response
    const task = `Respond to user message: "${message}". If the message requires action, execute the appropriate tools. Otherwise, provide a helpful response.`;
    
    const result = await agent.run(task, {
      userId: req.user.id,
      userRole: req.user.role,
      conversationId: resolvedConversationId
    });

    res.json({
      success: true,
      data: {
        response: result.summary,
        conversationId: resolvedConversationId,
        actions: result.results
      }
    });
  })
);

// @desc    Get available agent capabilities
// @route   GET /api/agent/capabilities
// @access  Private
router.get('/capabilities',
  protect,
  asyncHandler(async (req, res) => {
    const agent = new AutonomousAgent();
    
    const capabilities = Object.entries(agent.tools).map(([key, tool]) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }));

    res.json({
      success: true,
      data: {
        capabilities,
        count: capabilities.length,
        categories: {
          'Data Analysis': ['analyze_royalties', 'query_database', 'predict_revenue'],
          'Payment Processing': ['process_payment', 'optimize_payments'],
          'Reporting': ['generate_report', 'export_data'],
          'Communication': ['send_email', 'send_notification'],
          'Calculations': ['calculate_royalties'],
          'Integration': ['sync_platform_data', 'search_web'],
          'Contract Management': ['analyze_contract'],
          'Compliance': ['check_compliance'],
          'Automation': ['execute_workflow']
        }
      }
    });
  })
);

// @desc    Stop agent execution
// @route   POST /api/agent/stop/:agentId
// @access  Private/Admin/Manager
router.post('/stop/:agentId',
  protect,
  authorize('admin', 'manager'),
  asyncHandler(async (req, res) => {
    const { agentId } = req.params;
    
    const agent = activeAgents.get(agentId);
    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    agent.state.isRunning = false;
    activeAgents.delete(agentId);

    res.json({
      success: true,
      message: 'Agent stopped successfully',
      data: {
        agentId,
        status: 'stopped'
      }
    });
  })
);

module.exports = router;