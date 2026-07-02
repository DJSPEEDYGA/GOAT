/**
 * SUPER GOAT ROYALTIES APP - Learning Agent System
 * Improves performance over time through feedback and experience
 */

class LearningAgent {
  constructor(config = {}) {
    this.id = `learner-${Date.now()}`;
    this.name = config.name || 'LearningAgent';
    
    // Learning systems
    this.experienceBuffer = new ExperienceBuffer(10000);
    this.modelWeights = new Map();
    this.performanceMetrics = {
      totalActions: 0,
      successfulActions: 0,
      averageReward: 0,
      improvementRate: 0
    };
    
    // Learning parameters
    this.learningRate = config.learningRate || 0.1;
    this.discountFactor = config.discountFactor || 0.95;
    this.explorationRate = config.explorationRate || 0.1;
    
    // Feedback collection
    this.feedbackHistory = [];
    this.pendingFeedback = [];
  }

  // Execute action with learning capability
  async executeAction(state, actionSpace) {
    this.performanceMetrics.totalActions++;
    
    // Epsilon-greedy exploration
    if (Math.random() < this.explorationRate) {
      // Explore: random action
      const randomAction = actionSpace[Math.floor(Math.random() * actionSpace.length)];
      return this.performAction(randomAction, state);
    } else {
      // Exploit: best known action
      const bestAction = this.selectBestAction(state, actionSpace);
      return this.performAction(bestAction, state);
    }
  }

  // Perform action and record experience
  async performAction(action, state) {
    const result = await this.implementAction(action, state);
    
    // Record experience
    this.experienceBuffer.add({
      state,
      action,
      reward: result.reward,
      nextState: result.newState,
      timestamp: Date.now()
    });
    
    return result;
  }

  // Implement actual action (override in subclass)
  async implementAction(action, state) {
    return {
      success: true,
      reward: 1,
      newState: { ...state, actionExecuted: action },
      output: `Executed: ${action}`
    };
  }

  // Select best action based on learned Q-values
  selectBestAction(state, actionSpace) {
    let bestAction = actionSpace[0];
    let bestValue = -Infinity;
    
    for (const action of actionSpace) {
      const qValue = this.getQValue(state, action);
      if (qValue > bestValue) {
        bestValue = qValue;
        bestAction = action;
      }
    }
    
    return bestAction;
  }

  // Get Q-value for state-action pair
  getQValue(state, action) {
    const key = this.getStateActionKey(state, action);
    return this.modelWeights.get(key) || 0;
  }

  // Update Q-value using Q-learning
  updateQValue(state, action, reward, nextState, actionSpace) {
    const currentQ = this.getQValue(state, action);
    
    // Find max Q-value for next state
    let maxNextQ = 0;
    for (const nextAction of actionSpace) {
      const nextQ = this.getQValue(nextState, nextAction);
      if (nextQ > maxNextQ) maxNextQ = nextQ;
    }
    
    // Q-learning update
    const newQ = currentQ + this.learningRate * (
      reward + this.discountFactor * maxNextQ - currentQ
    );
    
    const key = this.getStateActionKey(state, action);
    this.modelWeights.set(key, newQ);
    
    return newQ;
  }

  // Learn from batch of experiences
  async learnFromExperiences(batchSize = 32) {
    const batch = this.experienceBuffer.sample(batchSize);
    let totalImprovement = 0;
    
    for (const experience of batch) {
      const oldQ = this.getQValue(experience.state, experience.action);
      this.updateQValue(
        experience.state,
        experience.action,
        experience.reward,
        experience.nextState,
        ['continue', 'retry', 'abort'] // Default action space
      );
      const newQ = this.getQValue(experience.state, experience.action);
      totalImprovement += Math.abs(newQ - oldQ);
    }
    
    // Update improvement rate
    this.performanceMetrics.improvementRate = totalImprovement / batch.length;
    
    return this.performanceMetrics.improvementRate;
  }

  // Receive feedback and learn from it
  receiveFeedback(feedback) {
    this.feedbackHistory.push({
      ...feedback,
      timestamp: Date.now()
    });
    
    // Process feedback
    this.processFeedback(feedback);
    
    // Update performance metrics
    if (feedback.positive) {
      this.performanceMetrics.successfulActions++;
    }
    
    const totalFeedback = this.feedbackHistory.length;
    this.performanceMetrics.averageReward = 
      this.feedbackHistory.reduce((sum, f) => sum + (f.positive ? 1 : 0), 0) / totalFeedback;
  }

  // Process and learn from feedback
  processFeedback(feedback) {
    // Find related experience
    const relatedExperience = this.experienceBuffer.buffer
      .reverse()
      .find(exp => 
        exp.timestamp > feedback.timestamp - 60000 && // Within last minute
        exp.action === feedback.action
      );
    
    if (relatedExperience) {
      // Adjust reward based on feedback
      const adjustedReward = feedback.positive 
        ? relatedExperience.reward + 1 
        : relatedExperience.reward - 1;
      
      // Re-learn with adjusted reward
      this.updateQValue(
        relatedExperience.state,
        relatedExperience.action,
        adjustedReward,
        relatedExperience.nextState,
        ['continue', 'retry', 'abort']
      );
    }
  }

  // Get state-action key for storage
  getStateActionKey(state, action) {
    const stateKey = JSON.stringify(state).slice(0, 100);
    return `${stateKey}-${action}`;
  }

  // Decay exploration rate over time
  decayExploration(decayFactor = 0.995) {
    this.explorationRate *= decayFactor;
    this.explorationRate = Math.max(0.01, this.explorationRate); // Minimum exploration
  }

  // Get learning progress
  getProgress() {
    return {
      ...this.performanceMetrics,
      successRate: this.performanceMetrics.totalActions > 0 
        ? this.performanceMetrics.successfulActions / this.performanceMetrics.totalActions 
        : 0,
      experienceCount: this.experienceBuffer.size(),
      explorationRate: this.explorationRate,
      modelSize: this.modelWeights.size
    };
  }
}

// Experience Buffer for replay
class ExperienceBuffer {
  constructor(maxSize = 10000) {
    this.buffer = [];
    this.maxSize = maxSize;
  }

  add(experience) {
    this.buffer.push(experience);
    
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }

  sample(n) {
    const samples = [];
    const indices = new Set();
    
    while (indices.size < Math.min(n, this.buffer.length)) {
      indices.add(Math.floor(Math.random() * this.buffer.length));
    }
    
    for (const i of indices) {
      samples.push(this.buffer[i]);
    }
    
    return samples;
  }

  size() {
    return this.buffer.length;
  }
}

// Utility-Based Decision Agent
class UtilityBasedAgent extends LearningAgent {
  constructor(config = {}) {
    super(config);
    this.utilityFunction = config.utilityFunction || this.defaultUtilityFunction;
    this.constraints = config.constraints || [];
  }

  // Default utility function
  defaultUtilityFunction(state, action, outcome) {
    const weights = {
      success: 0.4,
      speed: 0.2,
      cost: 0.2,
      risk: 0.2
    };
    
    return (
      weights.success * (outcome.success ? 1 : 0) +
      weights.speed * (1 / (outcome.time / 1000)) +
      weights.cost * (1 - outcome.cost / 100) +
      weights.risk * (1 - outcome.risk)
    );
  }

  // Select action that maximizes utility
  selectActionByUtility(state, actionSpace) {
    let bestAction = null;
    let bestUtility = -Infinity;
    const evaluations = [];
    
    for (const action of actionSpace) {
      // Predict outcome
      const predictedOutcome = this.predictOutcome(state, action);
      
      // Calculate utility
      const utility = this.utilityFunction(state, action, predictedOutcome);
      
      // Check constraints
      const satisfiesConstraints = this.constraints.every(
        constraint => constraint(state, action, predictedOutcome)
      );
      
      if (satisfiesConstraints && utility > bestUtility) {
        bestUtility = utility;
        bestAction = action;
      }
      
      evaluations.push({ action, utility, satisfiesConstraints });
    }
    
    return { action: bestAction, utility: bestUtility, evaluations };
  }

  // Predict outcome for action (simplified)
  predictOutcome(state, action) {
    return {
      success: Math.random() > 0.2,
      time: Math.random() * 10000,
      cost: Math.random() * 50,
      risk: Math.random() * 0.3
    };
  }
}

// Goal-Based Planning Agent
class GoalBasedAgent extends LearningAgent {
  constructor(config = {}) {
    super(config);
    this.currentGoal = null;
    this.goalStack = [];
    this.plan = [];
    this.planIndex = 0;
  }

  // Set goal and create plan
  setGoal(goal) {
    this.currentGoal = goal;
    this.plan = this.createPlan(goal);
    this.planIndex = 0;
    
    return {
      goal,
      plan: this.plan,
      estimatedSteps: this.plan.length
    };
  }

  // Create plan to achieve goal
  createPlan(goal) {
    const plan = [];
    
    // Decompose goal into sub-goals
    const subGoals = this.decomposeGoal(goal);
    
    for (const subGoal of subGoals) {
      const actions = this.goalToActions(subGoal);
      plan.push(...actions);
    }
    
    return plan;
  }

  // Decompose complex goal
  decomposeGoal(goal) {
    if (goal.type === 'maximize_revenue') {
      return [
        { type: 'analyze', target: 'current_revenue' },
        { type: 'identify', target: 'growth_opportunities' },
        { type: 'execute', target: 'optimization_strategies' },
        { type: 'monitor', target: 'results' }
      ];
    }
    
    if (goal.type === 'publish_catalog') {
      return [
        { type: 'validate', target: 'metadata' },
        { type: 'prepare', target: 'assets' },
        { type: 'distribute', target: 'platforms' },
        { type: 'verify', target: 'delivery' }
      ];
    }
    
    return [goal];
  }

  // Convert goal to actions
  goalToActions(goal) {
    const actionMap = {
      analyze: ['collect_data', 'process_data', 'generate_insights'],
      identify: ['scan_database', 'apply_heuristics', 'rank_results'],
      execute: ['prepare_action', 'execute_action', 'verify_result'],
      monitor: ['setup_tracking', 'collect_metrics', 'report_status'],
      validate: ['load_data', 'check_rules', 'report_errors'],
      prepare: ['gather_resources', 'format_content', 'quality_check'],
      distribute: ['connect_platform', 'upload_content', 'confirm_delivery'],
      verify: ['check_status', 'validate_output', 'report_success']
    };
    
    return actionMap[goal.type] || [goal.type];
  }

  // Execute next step in plan
  async executeNextStep(state) {
    if (this.planIndex >= this.plan.length) {
      return {
        complete: true,
        goal: this.currentGoal,
        stepsExecuted: this.planIndex
      };
    }
    
    const action = this.plan[this.planIndex];
    const result = await this.performAction(action, state);
    
    this.planIndex++;
    
    return {
      complete: false,
      action,
      result,
      progress: this.planIndex / this.plan.length
    };
  }

  // Check if goal is achieved
  isGoalAchieved(state) {
    if (!this.currentGoal) return false;
    
    // Simplified goal achievement check
    return this.planIndex >= this.plan.length;
  }

  // Replan if obstacles encountered
  async replan(state, obstacle) {
    console.log(`[GoalAgent] Replanning due to: ${obstacle}`);
    
    // Add obstacle to goal stack
    this.goalStack.push({
      type: 'overcome_obstacle',
      obstacle,
      timestamp: Date.now()
    });
    
    // Create new plan
    const newSubGoal = { type: 'resolve', target: obstacle };
    const newActions = this.goalToActions(newSubGoal);
    
    // Insert new actions into plan
    this.plan = [
      ...this.plan.slice(0, this.planIndex),
      ...newActions,
      ...this.plan.slice(this.planIndex)
    ];
    
    return this.plan;
  }
}

module.exports = {
  LearningAgent,
  ExperienceBuffer,
  UtilityBasedAgent,
  GoalBasedAgent
};