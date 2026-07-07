import { LearningAgent, ExperienceBuffer, UtilityBasedAgent, GoalBasedAgent } from '../../../lib/agents/learning-agent.js';

// Initialize learning agents
const learningAgent = new LearningAgent({
  name: 'GOAT Learning Agent',
  learningRate: 0.1,
  discountFactor: 0.95
});

const utilityAgent = new UtilityBasedAgent({
  name: 'GOAT Utility Agent'
});

const goalAgent = new GoalBasedAgent({
  name: 'GOAT Goal Agent'
});

// Experience buffer for storing learning experiences
const experienceBuffer = new ExperienceBuffer(10000);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { agentType, action, state, action: agentAction, reward, feedback, goal, preferences } = req.body;

      // Select the appropriate agent
      const agent = agentType === 'utility' ? utilityAgent :
                   agentType === 'goal' ? goalAgent :
                   learningAgent;

      switch (action) {
        case 'execute':
          // Execute an action and learn from the result
          const result = await learningAgent.executeAction(state, agentAction);
          return res.status(200).json({
            success: true,
            action: agentAction,
            result,
            message: 'Action executed and learned from'
          });

        case 'learn':
          // Learn from experiences in the buffer
          const learnResult = await learningAgent.learnFromExperiences();
          return res.status(200).json({
            success: true,
            experiencesProcessed: learnResult.count,
            improvement: learnResult.improvement,
            message: 'Learning completed from experience buffer'
          });

        case 'feedback':
          // Receive feedback and update model
          const feedbackResult = await learningAgent.receiveFeedback(feedback);
          return res.status(200).json({
            success: true,
            feedback: feedback,
            incorporated: feedbackResult.incorporated,
            message: 'Feedback incorporated into learning model'
          });

        case 'qvalue':
          // Get Q-value for state-action pair
          const qValue = learningAgent.getQValue(state, agentAction);
          return res.status(200).json({
            success: true,
            state,
            action: agentAction,
            qValue
          });

        case 'best-action':
          // Get the best action for a given state
          const bestAction = learningAgent.getBestAction(state);
          return res.status(200).json({
            success: true,
            state,
            bestAction
          });

        case 'utility':
          // Calculate utility for options (utility agent)
          const options = req.body.options || [];
          const utilities = options.map(option => ({
            option,
            utility: utilityAgent.calculateUtility(option, preferences || {})
          }));
          const optimalChoice = utilityAgent.selectOptimal(options, preferences || {});
          return res.status(200).json({
            success: true,
            utilities,
            optimalChoice,
            message: 'Utility calculation completed'
          });

        case 'plan':
          // Create a plan for a goal (goal agent)
          const plan = await goalAgent.createPlan(goal);
          return res.status(200).json({
            success: true,
            goal,
            plan,
            message: 'Goal plan created successfully'
          });

        case 'execute-plan':
          // Execute a plan step by step
          const executionResult = await goalAgent.executePlan(plan || req.body.plan);
          return res.status(200).json({
            success: true,
            result: executionResult,
            message: 'Plan execution completed'
          });

        case 'add-experience':
          // Add experience to buffer
          experienceBuffer.add({
            state,
            action: agentAction,
            reward,
            nextState: req.body.nextState,
            done: req.body.done || false
          });
          return res.status(200).json({
            success: true,
            bufferSize: experienceBuffer.size(),
            message: 'Experience added to buffer'
          });

        case 'stats':
          // Get learning statistics
          return res.status(200).json({
            success: true,
            stats: {
              bufferSize: experienceBuffer.size(),
              episodes: learningAgent.episodes || 0,
              totalReward: learningAgent.totalReward || 0,
              averageReward: learningAgent.averageReward || 0
            }
          });

        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid action'
          });
      }
    } catch (error) {
      console.error('Learning Agent API error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET request - return API info
  return res.status(200).json({
    name: 'GOAT Learning Agent API',
    version: '1.0.0',
    agentTypes: {
      learning: 'Reinforcement learning agent with Q-learning',
      utility: 'Utility-based decision making agent',
      goal: 'Goal-based planning and execution agent'
    },
    capabilities: [
      'Q-learning for optimal policies',
      'Experience replay for efficient learning',
      'Feedback incorporation',
      'Utility-based decision making',
      'Goal-based planning',
      'Multi-step plan execution'
    ],
    endpoints: {
      'POST /api/agents/learning': {
        actions: ['execute', 'learn', 'feedback', 'qvalue', 'best-action', 'utility', 'plan', 'execute-plan', 'add-experience', 'stats'],
        description: 'Learning agents with Q-learning, utility optimization, and goal planning'
      }
    }
  });
}