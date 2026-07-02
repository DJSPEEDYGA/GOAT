import { AgentOrchestrator, DataCollectorAgent, RoyaltyCalculatorAgent, AIAnalyzerAgent, ModelRouterAgent } from '../../../lib/agents/orchestrator.js';

// Initialize the orchestrator with specialized agents
const orchestrator = new AgentOrchestrator({
  name: 'GOAT Orchestrator',
  description: 'Main orchestrator for music royalty operations'
});

// Register specialized agents
orchestrator.registerAgent(new DataCollectorAgent());
orchestrator.registerAgent(new RoyaltyCalculatorAgent());
orchestrator.registerAgent(new AIAnalyzerAgent());
orchestrator.registerAgent(new ModelRouterAgent());

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { action, goal, task, context } = req.body;

      switch (action) {
        case 'decompose':
          // Decompose a high-level goal into subtasks
          const subtasks = await orchestrator.decomposeGoal(goal, context || {});
          return res.status(200).json({
            success: true,
            goal,
            subtasks,
            message: `Goal decomposed into ${subtasks.length} subtasks`
          });

        case 'execute':
          // Execute a workflow with the given tasks
          const result = await orchestrator.executeWorkflow(task, context || {});
          return res.status(200).json({
            success: true,
            result,
            message: 'Workflow executed successfully'
          });

        case 'status':
          // Get orchestrator status
          return res.status(200).json({
            success: true,
            status: {
              name: orchestrator.name,
              description: orchestrator.description,
              registeredAgents: orchestrator.agents.size,
              activeWorkflows: orchestrator.activeWorkflows?.size || 0
            }
          });

        case 'agents':
          // List all registered agents
          const agents = Array.from(orchestrator.agents.entries()).map(([name, agent]) => ({
            name,
            type: agent.constructor.name,
            capabilities: agent.capabilities || []
          }));
          return res.status(200).json({
            success: true,
            agents
          });

        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid action. Use: decompose, execute, status, or agents'
          });
      }
    } catch (error) {
      console.error('Orchestrator API error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET request - return API info
  return res.status(200).json({
    name: 'GOAT Orchestrator Agent API',
    version: '1.0.0',
    endpoints: {
      'POST /api/agents/orchestrator': {
        actions: ['decompose', 'execute', 'status', 'agents'],
        description: 'Hierarchical orchestrator for multi-agent workflows'
      }
    }
  });
}