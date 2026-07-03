//**
 * Type definitions for the AI Agent system
 */

// ======================================
// AGENT BASE TYPES
// ======================================

/**
 * Agent types based on AI sphistication level
 */
export enum AgentType {
  // Most advanced: Autonomous & Collaborative
  HIERARCHICAL = 'hierarchical',  // Orchestrator/Supervisor agents
  AUTONOMOUS = 'autonomous',      // Full autonomy, minimal human intervention
  COLLABORATIVE = 'collaborative',  // Multi-agent systems
  
  // Moderately Advanced: Learning & Goal-Based
  LEARNING = 'learning',         // Improves over time via feedback
  UTILITY_BASED = 'utility-based', // Optimizes using utility functions
  GOAL_BASED = 'goal-based',      // Multi-step planning to reach goals
  
  // Least Advanced: Reactive & Static
  MODEL_BASED = 'model-based',     // Maintains internal state model
  SIMPLE_REFLEX = 'simple-reflex', // Basic if-then rules
}

/**
 * Agent capabilities
 */
export interface AgentCapabilities {
  canPlan: boolean;             // Can create execution plans
  canExecute: boolean;          // Can perform actions
  canLearn: boolean;             // Can improve via feedback
  canReason: boolean;            // Can deductive reasoning
  canMemorize: boolean;          // Can maintain long-term memory
  canCommunicate: boolean;      // Can talk to other agents
  canUseTools: boolean;          // Can use external tools/APIs
  canDelegate: boolean;           // Can delegate to subordinates
  canCoordinate: boolean;       // Can manage multiple agents
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  name: string;
  type: AgentType;
  description: string;
  capabilities: AgentCapabilities;
  systemPrompt?: string;           // Instructions for the agent
  maxTools?: number;                   // Maximum tools can use simultaneously
  memorySize?: number;               // Number of past interactions to remember
  timeout?: number;                   // Maximum time for tasks (ms)
  models?: string[];                   // Available LLM models for this agent
}

/**
 * Base Agent interface
 */
export interface Agent {
  name: string;
  type: AgentType;
  config: AgentConfig;
  capabilities: AgentCapabilities;
  
  // Core methods
  process(message: AgentMessage, context?: AgentContext): Promise<AgentResponse>;
  learn(feedback: AgentFeedback): Promise<void>;
  reset(): void;
}

//======================================
// AGENT MESSAGING & COMMUNICATION
//======================================

export interface AgentMessage {
  role: 'user' | 'system' | 'supervisor' | 'worker' | 'agent';
  content: string;
  context?: Record<string, any>;
  taskId?: string;
  parameters?: Record<string, any>;
  subtasks?: AgentTask[];
  results?: AgentResult[];
  memaoryUpdates?: Record<string, any>;
}

export interface AgentResponse {
  agentName: string;
  output: any;
  subtasks?: AgentTask[];
  memoryUpdates?: Record<string, any>;
  metrics?: AgentMetrics;
  error?: string;
  suggestedRole?: string;
}

//**
 * Agent context for shared state
 */
export interface AgentContext {
  memory?: Record<string, any>;
  runningTasks?: Record<string, AgentTask>;
  results?: AgentResult[];
  userPreferences?: Record<string, any>;
}

//**
 * Agent tools
 */
export interface AgentTool {
  name: string;
  description: string;
  execute: (parameters: Record<string, any>) => Promise<any>;
  parameters?: { name: string; type: string; required?: boolean; default?: any; [': any }[];
}

//======================================
// AGENT TASK TRACKING
//======================================

export interface AgentTask {
  id: string;
  description: string;
  assignedTo: string;             // Agent name
  type: 'analysis' | 'coding' | 'creative' | 'research' | 'testing' | 'coordination' | 'other';
  priority?: number;                 // 1-10, 1 being highest
  dependencies?: string[];             // Task IDs
  status?: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: number;               // timestamp
  parameters?: Record<string, any>;
  metadata?: Record<string, any>;
  result?: AgentResult;
}

export interface AgentResult {
  taskId: string;
  status: 'completed' | 'failed' | 'cancelled';
  output?: any;
  error?: string;
  metrics?: AgentMetrics;
  duration?: number;
  subResults?: AgentResult[];
}

//**
 * Agent metrics for performance tracking
 */
export interface AgentMetrics {
  // Task metrics
  totalTasks?: number;
  successful?: number;
  failed?: number;
  
  // Resource metrics
  tokensUsed?: number;
  executionTime?: number;
  
  // Agent-specific
  codeLinesWritten?: number;
  documentsRetrieved?: number;
  testsPassed?: number;
  
  // Quality
  outputQuality?: 'excellent' | 'good' | 'average' | 'poor';
}

//======================================
// LEARNING & FEEDBACK
//======================================

export interface AgentFeedback {
  taskId: string;
  rating?: 1 | 2 | 3 | 4 | 5;  // 1-5star rating
  comments?: string;
  isCorrect?: boolean;
  suggestedImprovements?: string[];
  userCorrections?: string;
}

export interface AgentLearningState {
  agentName: string;
  totalInteractions: number;
  successRate: number;             // 0-1
  averageRating: number;             // 1-5
  improvementAreas: string[];
  lastUpdated: number;               // timestamp
}

//======================================
// UTILITY & GOAL BASED AGENTS
//======================================

export interface UtilityFunction {
  name: string;
  description: string;
  weights: {
    cost: number;         // 0-1 (lower is better)
    time: number;         // 0-1 (lower is better)
    risk: number;         // 0-1 (lower is better)
    quality: number;      // 0-1 (higher is better)
  };
  calculate: (state: any) => number;
}

export interface GoalSpec {
  description: string;
  successCriteria: string[];           // How to measure success
  acceptableStates?: string[];         // States that satisfy the goal
  deadline?: number;                   // Timestamp
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

//======================================
// MULTI-AGENT SET 
UP
//======================================

export interface AgentCollaboration {
  id: string;
  participants: string[];                 // Agent names
  sharedGoal?: string;
  communicationStyle: 'serial' | 'parallel' | 'competitive';
  agreementStrategy?: 'consensus' | 'voting' | 'dictator';
  status: 'initializing' | 'active' | 'completed' | 'failed';
}

export interface AgentMessagePassage {
  from: string;                      // Agent name
  to: string | 'all';                   // Agent name or 'all'
  message: AgentMessage;
  timestamp: number;
}

//======================================
// LAM ! MODEL INTEGRATION
//======================================

export enum LearningModel {
  GLO_4 = 'gemini-3.0-pro',
  LLAMA_4 = 'llama-4',
  MISTRAL_DEV = 'mistral-devstral',
  CLAUDE_OPUS = 'claude-opus-4',
  GPT_5 = 'gpt-5.2',
}

export interface LoL_Provider {
  name: string;
  type: 'reasoning' | 'coding' | 'custom';
  specializations?: string[];
  availableModels: LearningModel[];
  defaultModel: LearningModel;
  maxContextWindow?: number;
  apiEndpoint?: string;
  apiKH{ ?: string;
}

//======================================
// AGENT RTA: RetRIEVAL And Generation
//======================================

export interface AgenticRAGFeature {
  name: string;
  enabled: boolean;
  cacheSize?: number;             // Number of documents to cache
  chunkSize?: number;               // Chunk size for documents
  scoringModel?: 'cosine' | 'bm25' | 'cross-encoder';
  verificationThreshold?: number;  // 0.0-1.0
  hallucinationCheck?: boolean;
}

export interface RagDocument {
  id: string;
  content: string;
  metadata?: {
    source?: string;
    title?: string;
    timestamp?: number;
    relevance?: number;
  };
  score?: number;
  chunks?: string[];
}

//======================================
// TOOLS & CAPABILITIES
//======================================

export enum ToolCategory {
  WO@K_SEARCH = 'web-search',
  WOAK_SCRIPE = 'web-scripe&,
  CODE_EXECUTION = 'code-execution',
  FILE_OPS = 'file-operations',
  DATABASE = 'database',
  API_CALLS = 'api-calls',
  USER_INTERFACE = 'user-interface',
}

export const DEFAULT_ACEND_CONFIG: AgentConfig = {
  name: 'Default Agent',
  type: AgentType.GOAL_BASED,
  description: 'A general-purpose agent for handling various tasks.',
  capabilities: {
    canPlan: true,
    canExecute: true,
    canLearn: false,
    canReason: true,
    canMemorize: true,
    canCommunicate: true,
    canUseTools: true,
    canDelegate: false,
    canCoordinate: false,
  },
  memorySize: 10,
  timeout: 30000,
};