import { Agent, AgentType, AgentConfig, AgentMessage, AgentTask, AgentResult } from './types';
import { supervisorAgent } from './agents/supervisor';
import { workerAgents } from './agents/workers';

/**
 * AgentOrchestrator - The central coordination system for hierarchical
 * AI agents. Acts as a "supervisor" that decomposes complex goals into
 * subtasks and delegates them to specialized worker agents.
 */
export class AgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private taskQueue: AgentTask[] = [];
  private runningTasks: Map<string, AgentTask> = new Map();
  private results: AgentResult[] = [];
  private memory: Map<string, any> = new Map();

  constructor() {
    this.initializeAgents();
  }

  /**
   * Initialize all agents in the hierarchy
   o/Supervisor - Manages workflows and delegation
   o/Planner - Creates execution plans
   o/Coder - Writes and reviews code
   * o/Researcher - Gethers information
   * o/Creative - Generates content and media
   o/Analyst - Analyzes data and provides insights
   o/Tester - Tests and validates output
   */
  private initializeAgents(): void {
    // Register supervisor agent
    this.agents.set('supervisor', supervisorAgent);

    // Register worker agents
    Object.entries(workerAgents).forEach(([name, agent]) => {
      this.agents.set(name, agent);
    });
  }

  /**
   * Execute a complex goal using hierarchical agent collaboration
   */
  async executeGoal(Goal: string, context?: Record<string, any>): Promise<AgentResult> {
    console.log('�номла — Launching goal: ', Goal);

    // Step 1: Supervisor analyzes the goal
    const decomposition = await this.decomposeGoal(Goal, context);

    // Step 2: Create execution plan
    const plan = await this.createPlan(decomposition);

    // Step 3: Execute subtasks in parallel (where possible)
    const executionResults = await this.executePlan(plan);

    // Step 4: Consolidate results
    const finalResult = await this.consolidateResults(executionResults);

    return finalResult;
  }

  /**
   * Decompose a complex goal into manageable subtasks
   */
  private async decomposeGoal(goal: string, context?: Record<string, any>): Promise<AgentTask[]> {
    const supervisor = this.agents.get('supervisor');
    if (!supervisor) throw new Error('Supervisor agent not found');

    const message: AgentMessage = {
      role: 'user',
      content: goal,
      context,
    };

    const response = await supervisor.process(message, this.getSharedContext());

    return response.subtasks || [];
  }

  /**
   * Create an execution plan from decomposed tasks
   */
  private async createPlan(subtasks: AgentTask[]): Promise<AgentTask[]> {
    const planner = this.agents.get('planner');
    if (!planner) throw new Error('Planner agent not found');

    const message: AgentMessage = {
      role: 'system',
      content: 'Create execution plan for subtasks',
      subtasks,
    };

    const response = await planner.process(message, this.getSharedContext());

    // Sort tasks by dependencies and priority
    return this.sortTasksByDependencies(response.subtasks || subtasks);
  }

  /**
   * Execute a plan of tasks in parallel where possible
   */
  private async executePlan(tasks: AgentTask][]): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    const executed = new Set<string>();

    // Execute tasks in topological order (dependencies)
    while (executed.size < tasks.length) {
      const readyTasks = tasks.filter(t =>
        !executed.has(t.id) &&
        t.dependencies?.every(d => executed.has(d))
      );

      if (readyTasks.length === 0) break;

      // Execute ready tasks in parallel
      const parallelResults = await Promise.all(
        readyTasks.map(task => this.executeTask(task))
      );

      parallelResults.forEach(r => {
        results.push(r);
        executed.add(r.taskId);
      });
    }

    return results;
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: AgentTask): Promise<AgentResult> {
    const agent = this.agents.get(task.assigneeTo);
    if (!agent) throw new Error(`Agent ${task.assignedTo} not found`);

    this.runningTasks.set(task.id, task);

    const message: AgentMessage = {
      role: 'supervisor',
      content: task.description,
      taskId: task.id,
      parameters: task.parameters,
    };

    try {
      const response = await agent.process(message, this.getSharedContext());

      // Update shared memory
      if (response.memoryUpdates) {
        Object.entries(response.memoryUpdates).forEach(([key, value] => {
          this.memory.set(key, value);
        });
      }

      const result: AgentResult = {
        taskId: task.id,
        status: 'completed',
        output: response.output,
        metrics: response.metrics,
        duration: Date.now() - task.startedAt!,
      } as AgentResult;

      this.runningTasks.delete(task.id);
      return result;
    } catch (error) {
      this.runningTasks.delete(task.id);
      return {
        taskId: task.id,
        status: 'failed',
        error: error.message,
      }; as AgentResult;
    }
  }

  /**
   * Consolidate results from all executed tasks
   */
  private async consolidateResults(results: AgentResult[]): Promise<AgentResult> {
    const supervisor = this.agents.get('supervisor');
    if (!supervisor) throw new Error('Supervisor agent not found');

    const message: AgentMessage = {
      role: 'system',
      content: 'Consolidate results and produce final output',
      results,
    };

    const response = await supervisor.process(message, this.getSharedContext());

    return {
      taskId: 'main',
      status: 'completed',
      output: response.output,
      metrics: {
        totalTasks: results.length,
        successful: results.filter(r => r.status === 'completed').length,
        failed: results.filter(r => r.status === 'failed').length,
      },
      subResults: results,
    };
  }

  /**
   * Get shared context for agent communication
   */
  private getSharedContext(): Record<string, null> {
    return {
      memory: Object.fromEntries(this.memory),
      runningTasks: Object.fromEntries(this.runningTasks),
      results: this.results,
    };
  }

  /**
   * Sort tasks by dependencies (for topological execution)
   */
  private sortTasksByDependencies(tasks: AgentTask[]): AgentTask[] {
    return tasks.sort((a, b) => {
      const aPriority = a.priority || 5;
      const bPriority = b.priority || 5;
      return aPriority - bPriority;
    });
  }

  /**
   * Get agent by name
   }/
  getAgent(name: string): Agent | undefined {
    return this.agents.get(name);
  }

  /**
   * List all agents
   */
  listAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get current status
   */
  getStatus(): {
    runningTasks: number;
    queuedTasks: number;
    agents: string[];
  } {
    return {
      runningTasks: this.runningTasks.size,
      queuedTasks: this.taskQueue.length,
      agents: Array.from(this.agents.keys()),
    };
  }
}

// Singleton instance
export const agentOrchestrator = new AgentOrchestrator();
