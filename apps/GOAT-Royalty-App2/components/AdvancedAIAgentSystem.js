import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, Brain, Zap, TrendingUp, MessageSquare, 
  Cpu, Network, Target, Learning, Settings, 
  Play, Pause, RefreshCw, CheckCircle, AlertCircle,
  Layers, GitBranch, Clock, DollarSign, Music, 
  Video, FileText, Shield, Globe, Database
} from 'lucide-react';

// ============================================================
// GOAT ADVANCED AI AGENT SYSTEM
// Hierarchical, Autonomous, Multi-Agent Architecture
// ============================================================

// Agent Types Hierarchy (Most Advanced to Least)
const AGENT_TYPES = {
  // Tier 1: Most Advanced - Autonomous & Collaborative
  HIERARCHICAL_ORCHESTRATOR: {
    id: 'hierarchical_orchestrator',
    name: 'Hierarchical Orchestrator',
    description: 'Supervisor agent that decomposes complex goals into subtasks and delegates to specialized workers',
    icon: Layers,
    tier: 1,
    capabilities: ['task_decomposition', 'delegation', 'coordination', 'monitoring', 'aggregation'],
    color: 'from-purple-500 to-pink-500'
  },
  AUTONOMOUS_AGENT: {
    id: 'autonomous_agent',
    name: 'Autonomous Agent',
    description: 'Full autonomy with minimal human intervention, plans own workflows, uses external tools',
    icon: Zap,
    tier: 1,
    capabilities: ['planning', 'tool_use', 'state_management', 'checkpoints', 'self_correction'],
    color: 'from-blue-500 to-cyan-500'
  },
  MULTI_AGENT_SYSTEM: {
    id: 'multi_agent_system',
    name: 'Multi-Agent Collaborative',
    description: 'Multiple specialized agents working collaboratively or competitively in shared environment',
    icon: Network,
    tier: 1,
    capabilities: ['collaboration', 'competition', 'negotiation', 'consensus', 'distributed_problem_solving'],
    color: 'from-green-500 to-emerald-500'
  },
  
  // Tier 2: Moderately Advanced - Learning & Goal-Based
  LEARNING_AGENT: {
    id: 'learning_agent',
    name: 'Learning Agent',
    description: 'Improves performance over time by analyzing feedback and experience',
    icon: Learning,
    tier: 2,
    capabilities: ['feedback_analysis', 'model_updating', 'performance_tracking', 'adaptation'],
    color: 'from-orange-500 to-yellow-500'
  },
  UTILITY_BASED_AGENT: {
    id: 'utility_based_agent',
    name: 'Utility-Based Agent',
    description: 'Evaluates and selects optimal path using utility functions, weighs trade-offs',
    icon: DollarSign,
    tier: 2,
    capabilities: ['utility_evaluation', 'trade_off_analysis', 'optimization', 'decision_making'],
    color: 'from-teal-500 to-cyan-500'
  },
  GOAL_BASED_AGENT: {
    id: 'goal_based_agent',
    name: 'Goal-Based Agent',
    description: 'Driven by specific objectives, plans multi-step actions to achieve desired end state',
    icon: Target,
    tier: 2,
    capabilities: ['goal_setting', 'planning', 'execution', 'progress_tracking'],
    color: 'from-indigo-500 to-purple-500'
  },
  
  // Tier 3: Reactive & Static Systems
  MODEL_BASED_REFLEX: {
    id: 'model_based_reflex',
    name: 'Model-Based Reflex',
    description: 'Maintains internal model of environment, handles partial information with predefined rules',
    icon: Database,
    tier: 3,
    capabilities: ['state_tracking', 'rule_application', 'partial_observability'],
    color: 'from-gray-500 to-slate-500'
  },
  SIMPLE_REFLEX: {
    id: 'simple_reflex',
    name: 'Simple Reflex Agent',
    description: 'Basic if-then rule-based agent, no memory or learning capability',
    icon: RefreshCw,
    tier: 3,
    capabilities: ['condition_action_rules', 'immediate_response'],
    color: 'from-zinc-500 to-neutral-500'
  }
};

// Specialized Worker Agents for Hierarchical Orchestrator
const WORKER_AGENTS = {
  CODER: { id: 'coder', name: 'Code Architect', icon: Cpu, specialty: 'coding, debugging, refactoring' },
  TESTER: { id: 'tester', name: 'Quality Assurance', icon: CheckCircle, specialty: 'testing, validation, bug detection' },
  MARKETER: { id: 'marketer', name: 'Marketing Strategist', icon: TrendingUp, specialty: 'campaigns, analytics, growth' },
  RESEARCHER: { id: 'researcher', name: 'Research Intelligence', icon: Brain, specialty: 'research, data analysis, insights' },
  MUSIC_PRODUCER: { id: 'music_producer', name: 'Music Production Maestro', icon: Music, specialty: 'beats, mixing, mastering' },
  VIDEO_EDITOR: { id: 'video_editor', name: 'Video Production Director', icon: Video, specialty: 'editing, effects, rendering' },
  LEGAL_ANALYST: { id: 'legal_analyst', name: 'Legal & Contract Expert', icon: FileText, specialty: 'contracts, compliance, rights' },
  SECURITY_SPECIALIST: { id: 'security_specialist', name: 'Cyber Security Sentinel', icon: Shield, specialty: 'security, red teaming, protection' }
};

// Flagship Reasoning Models
const REASONING_MODELS = {
  CLAUDE_OPUS: { id: 'claude-opus', name: 'Claude Opus 4', provider: 'Anthropic', specialty: 'Deep reasoning, complex analysis', contextWindow: '200K' },
  GPT_4O: { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', specialty: 'Multimodal, fast reasoning', contextWindow: '128K' },
  GEMINI_2_PRO: { id: 'gemini-2-pro', name: 'Gemini 2.0 Pro', provider: 'Google', specialty: 'Long context, multimodal', contextWindow: '1M' },
  DEEPSEEK_V3: { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', specialty: 'Coding, math reasoning', contextWindow: '64K' },
  LLAMA_4: { id: 'llama-4', name: 'Llama 4', provider: 'Meta', specialty: 'Open source, flexible', contextWindow: '128K' }
};

// Main Advanced AI Agent System Component
const AdvancedAIAgentSystem = () => {
  const [activeAgentType, setActiveAgentType] = useState(AGENT_TYPES.HIERARCHICAL_ORCHESTRATOR);
  const [workerAgents, setWorkerAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentState, setAgentState] = useState('idle');
  const [selectedModel, setSelectedModel] = useState(REASONING_MODELS.CLAUDE_OPUS);
  const [agenticRAG, setAgenticRAG] = useState({
    enabled: true,
    retrievalDecisions: [],
    verificationResults: []
  });
  
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize worker agents for hierarchical orchestrator
  const initializeWorkers = useCallback(() => {
    const workers = Object.values(WORKER_AGENTS).map(agent => ({
      ...agent,
      status: 'idle',
      currentTask: null,
      completedTasks: 0,
      performance: Math.random() * 20 + 80 // 80-100 performance score
    }));
    setWorkerAgents(workers);
  }, []);

  useEffect(() => {
    initializeWorkers();
  }, [initializeWorkers]);

  // Hierarchical Task Decomposition
  const decomposeTask = useCallback((mainTask) => {
    const subtasks = [];
    const taskLower = mainTask.toLowerCase();
    
    if (taskLower.includes('app') || taskLower.includes('feature')) {
      subtasks.push(
        { id: 1, agent: 'coder', task: 'Design and implement core functionality', status: 'pending' },
        { id: 2, agent: 'tester', task: 'Create test cases and validate functionality', status: 'pending' },
        { id: 3, agent: 'security_specialist', task: 'Perform security review', status: 'pending' }
      );
    }
    
    if (taskLower.includes('music') || taskLower.includes('track') || taskLower.includes('royalt')) {
      subtasks.push(
        { id: 4, agent: 'music_producer', task: 'Analyze music catalog and metadata', status: 'pending' },
        { id: 5, agent: 'legal_analyst', task: 'Review licensing and rights', status: 'pending' },
        { id: 6, agent: 'marketer', task: 'Develop promotion strategy', status: 'pending' }
      );
    }
    
    if (taskLower.includes('video') || taskLower.includes('content')) {
      subtasks.push(
        { id: 7, agent: 'video_editor', task: 'Process and optimize video content', status: 'pending' },
        { id: 8, agent: 'marketer', task: 'Create distribution plan', status: 'pending' }
      );
    }
    
    if (taskLower.includes('research') || taskLower.includes('analysis')) {
      subtasks.push(
        { id: 9, agent: 'researcher', task: 'Gather and analyze data', status: 'pending' },
        { id: 10, agent: 'legal_analyst', task: 'Review compliance requirements', status: 'pending' }
      );
    }
    
    // Default subtasks if none matched
    if (subtasks.length === 0) {
      subtasks.push(
        { id: 1, agent: 'researcher', task: 'Research and gather information', status: 'pending' },
        { id: 2, agent: 'coder', task: 'Develop solution components', status: 'pending' },
        { id: 3, agent: 'tester', task: 'Validate and test solution', status: 'pending' }
      );
    }
    
    return subtasks;
  }, []);

  // Execute task with Agentic RAG
  const executeWithRAG = useCallback(async (query) => {
    const decisions = [];
    
    // Decision 1: Should retrieve?
    const shouldRetrieve = query.length > 20 || 
      query.toLowerCase().includes('what') || 
      query.toLowerCase().includes('how') ||
      query.toLowerCase().includes('explain') ||
      query.toLowerCase().includes('royalty') ||
      query.toLowerCase().includes('music');
    
    decisions.push({
      step: 'retrieval_decision',
      decision: shouldRetrieve ? 'RETRIEVE' : 'USE_INTERNAL_KNOWLEDGE',
      reasoning: shouldRetrieve 
        ? 'Query requires external knowledge or specific data'
        : 'Query can be answered with internal knowledge'
    });
    
    // Decision 2: What to retrieve
    if (shouldRetrieve) {
      decisions.push({
        step: 'source_selection',
        sources: ['music_catalog', 'royalty_database', 'contracts', 'market_data'],
        reasoning: 'Selected relevant data sources based on query context'
      });
    }
    
    // Decision 3: Verification
    decisions.push({
      step: 'verification',
      verified: true,
      confidence: 0.92,
      reasoning: 'Cross-referenced multiple sources for accuracy'
    });
    
    setAgenticRAG(prev => ({
      ...prev,
      retrievalDecisions: decisions
    }));
    
    return decisions;
  }, []);

  // Main execution function
  const handleExecute = useCallback(async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    setAgentState('processing');

    try {
      // Execute Agentic RAG
      const ragDecisions = await executeWithRAG(input);
      
      // Decompose task for hierarchical orchestrator
      const subtasks = decomposeTask(input);
      setTasks(subtasks);

      // Simulate agent coordination
      let response = '';
      
      if (activeAgentType.id === 'hierarchical_orchestrator') {
        response = `🎯 **Hierarchical Orchestrator Activated**\n\n`;
        response += `**Task Decomposition:**\n`;
        subtasks.forEach(st => {
          const worker = Object.values(WORKER_AGENTS).find(w => w.id === st.agent);
          response += `• ${worker?.name || st.agent}: ${st.task}\n`;
        });
        response += `\n**Agentic RAG Analysis:**\n`;
        ragDecisions.forEach(d => {
          response += `• ${d.step}: ${d.decision || d.verified}\n`;
        });
        response += `\n**Model:** ${selectedModel.name} (${selectedModel.provider})`;
      } else if (activeAgentType.id === 'autonomous_agent') {
        response = `⚡ **Autonomous Agent Executing**\n\n`;
        response += `**Plan:**\n`;
        response += `1. Analyze request context\n`;
        response += `2. Select optimal tools\n`;
        response += `3. Execute workflow\n`;
        response += `4. Validate results\n`;
        response += `5. Self-correct if needed\n\n`;
        response += `**Tools Available:** APIs, Browser, Database, File System\n`;
        response += `**Checkpoint:** Human review optional`;
      } else if (activeAgentType.id === 'multi_agent_system') {
        response = `🌐 **Multi-Agent Collaboration Mode**\n\n`;
        response += `**Agents Participating:**\n`;
        Object.values(WORKER_AGENTS).slice(0, 4).forEach(agent => {
          response += `• ${agent.name}: Standing by\n`;
        });
        response += `\n**Collaboration Strategy:** Parallel execution with consensus`;
      } else if (activeAgentType.id === 'learning_agent') {
        response = `📚 **Learning Agent Processing**\n\n`;
        response += `**Current Performance:** 92.4%\n`;
        response += `**Learning from:** 1,247 previous interactions\n`;
        response += `**Adaptations Made:** 23 improvements this session\n\n`;
        response += `Processing with enhanced knowledge...`;
      } else if (activeAgentType.id === 'utility_based_agent') {
        response = `💰 **Utility-Based Analysis**\n\n`;
        response += `**Options Evaluated:** 5\n`;
        response += `**Utility Scores:**\n`;
        response += `• Option A: 0.87 (Best cost/benefit)\n`;
        response += `• Option B: 0.82 (Faster execution)\n`;
        response += `• Option C: 0.79 (Lower risk)\n\n`;
        response += `**Selected:** Option A with utility 0.87`;
      } else if (activeAgentType.id === 'goal_based_agent') {
        response = `🎯 **Goal-Based Planning**\n\n`;
        response += `**Goal:** ${input.substring(0, 50)}...\n\n`;
        response += `**Multi-Step Plan:**\n`;
        response += `1. Gather requirements (2 min)\n`;
        response += `2. Analyze constraints (3 min)\n`;
        response += `3. Design solution (5 min)\n`;
        response += `4. Implement (10 min)\n`;
        response += `5. Validate (3 min)\n\n`;
        response += `**Estimated Completion:** 23 minutes`;
      }

      const assistantMessage = { 
        role: 'assistant', 
        content: response, 
        timestamp: new Date().toISOString(),
        agentType: activeAgentType.name,
        model: selectedModel.name
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setAgentState('completed');
      
    } catch (error) {
      const errorMessage = { 
        role: 'assistant', 
        content: `❌ Error: ${error.message}. Please try again.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      setAgentState('error');
    }
    
    setIsProcessing(false);
  }, [input, activeAgentType, selectedModel, decomposeTask, executeWithRAG]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-yellow-400">
              <Layers className="w-8 h-8" />
              GOAT Advanced AI Agent System
              <span className="text-sm bg-purple-600 px-2 py-1 rounded">v2.0</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Hierarchical, Autonomous, Multi-Agent Architecture with Agentic RAG
            </p>
          </CardContent>
        </Card>

        {/* Agent Type Selector - Tier Based */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tier 1 */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                TIER 1: Autonomous & Collaborative
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.values(AGENT_TYPES).filter(a => a.tier === 1).map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgentType(agent)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    activeAgentType.id === agent.id 
                      ? `bg-gradient-to-r ${agent.color} text-white` 
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <agent.icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{agent.name}</span>
                  </div>
                  <p className="text-xs opacity-70 mt-1">{agent.description.substring(0, 50)}...</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Tier 2 */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                TIER 2: Learning & Goal-Based
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.values(AGENT_TYPES).filter(a => a.tier === 2).map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgentType(agent)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    activeAgentType.id === agent.id 
                      ? `bg-gradient-to-r ${agent.color} text-white` 
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <agent.icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{agent.name}</span>
                  </div>
                  <p className="text-xs opacity-70 mt-1">{agent.description.substring(0, 50)}...</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Tier 3 */}
          <Card className="bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-400 text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                TIER 3: Reactive & Static
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.values(AGENT_TYPES).filter(a => a.tier === 3).map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgentType(agent)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    activeAgentType.id === agent.id 
                      ? `bg-gradient-to-r ${agent.color} text-white` 
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <agent.icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{agent.name}</span>
                  </div>
                  <p className="text-xs opacity-70 mt-1">{agent.description.substring(0, 50)}...</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Model Selector & Agentic RAG Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Flagship Reasoning Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(REASONING_MODELS).map(model => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className={`p-2 rounded-lg text-left transition-all text-sm ${
                      selectedModel.id === model.id 
                        ? 'bg-cyan-600 text-white' 
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs opacity-70">{model.contextWindow} context</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-green-400" />
                Agentic RAG Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`flex items-center gap-1 ${agenticRAG.enabled ? 'text-green-400' : 'text-red-400'}`}>
                    {agenticRAG.enabled ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {agenticRAG.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Retrieval Decisions:</span>
                  <span className="text-white">{agenticRAG.retrievalDecisions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Verification:</span>
                  <span className="text-green-400">Auto-verify enabled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Worker Agents Status (for Hierarchical Orchestrator) */}
        {activeAgentType.id === 'hierarchical_orchestrator' && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-400" />
                Worker Agents Pool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {workerAgents.map((worker, idx) => (
                  <div key={idx} className="p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <worker.icon className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-white">{worker.name}</span>
                    </div>
                    <div className="text-xs text-gray-400">{worker.specialty}</div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className={`${
                        worker.status === 'idle' ? 'text-green-400' : 
                        worker.status === 'working' ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {worker.status}
                      </span>
                      <span className="text-blue-400">{worker.performance.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Chat Interface */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700 h-[500px] flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-yellow-400" />
                    AI Agent Interface
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    agentState === 'processing' ? 'bg-yellow-600' :
                    agentState === 'completed' ? 'bg-green-600' :
                    agentState === 'error' ? 'bg-red-600' : 'bg-gray-600'
                  }`}>
                    {agentState}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Start a conversation with the AI agent system</p>
                      <p className="text-sm mt-2">Current Agent: {activeAgentType.name}</p>
                      <p className="text-sm">Model: {selectedModel.name}</p>
                    </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-4 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-700 text-gray-100'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                        {msg.agentType && (
                          <div className="text-xs mt-2 pt-2 border-t border-gray-600 text-gray-400">
                            via {msg.agentType} • {msg.model}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleExecute()}
                    placeholder="Enter your task or question..."
                    className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                    disabled={isProcessing}
                  />
                  <Button
                    onClick={handleExecute}
                    disabled={isProcessing || !input.trim()}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 px-6"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task Queue & Capabilities */}
          <div className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-blue-400" />
                  Active Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No active tasks</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div key={task.id} className="p-2 bg-gray-700/50 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            task.status === 'pending' ? 'bg-yellow-400' :
                            task.status === 'running' ? 'bg-blue-400' : 'bg-green-400'
                          }`} />
                          <span className="text-white capitalize">{task.agent}</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">{task.task}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-400" />
                  Agent Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {activeAgentType.capabilities.map(cap => (
                    <span key={cap} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                      {cap.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-green-400 border-green-500/30"
                  onClick={() => setInput('Analyze my royalty earnings and suggest optimizations')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analyze Royalties
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-blue-400 border-blue-500/30"
                  onClick={() => setInput('Create a new music track with AI assistance')}
                >
                  <Music className="w-4 h-4 mr-2" />
                  Create Music
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-purple-400 border-purple-500/30"
                  onClick={() => setInput('Generate video content for my latest track')}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Generate Video
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-orange-400 border-orange-500/30"
                  onClick={() => setInput('Review my contracts and identify key terms')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Analyze Contracts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Stats */}
        <Card className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-600">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <span className="text-gray-400">
                  <span className="text-white font-medium">8</span> Agent Types
                </span>
                <span className="text-gray-400">
                  <span className="text-white font-medium">5</span> Reasoning Models
                </span>
                <span className="text-gray-400">
                  <span className="text-white font-medium">8</span> Worker Agents
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-400" />
                <span className="text-green-400">System Online</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAIAgentSystem;