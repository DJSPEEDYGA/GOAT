'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Bot, 
  Send, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Sparkles,
  Zap,
  Brain,
  Activity,
  Play,
  Square
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  actions?: any[];
}

interface AgentTask {
  agentId: string;
  name?: string;
  description?: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentTask?: string;
  iterations?: number;
  result?: Record<string, unknown>;
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'agent',
      content: '👋 Hello! I\'m your autonomous AI agent. I can help you with royalty analysis, payment processing, report generation, and much more. What would you like me to do?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [activeAgents, setActiveAgents] = useState<AgentTask[]>([]);
  const [capabilities, setCapabilities] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCapabilities();
    loadActiveAgents();
    const interval = setInterval(loadActiveAgents, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadCapabilities = async () => {
    try {
      const response = await fetch('/api/agent/capabilities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCapabilities(data.data.capabilities);
      }
    } catch (error) {
      console.error('Failed to load capabilities:', error);
    }
  };

  const loadActiveAgents = async () => {
    try {
      const response = await fetch('/api/agent/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setActiveAgents(data.data.agents);
      }
    } catch (error) {
      console.error('Failed to load active agents:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: input,
          conversationId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'agent',
          content: data.data.response,
          timestamp: new Date(),
          actions: data.data.actions
        };
        
        setMessages(prev => [...prev, agentMessage]);
        setConversationId(data.data.conversationId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeTask = async (taskName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/agent/tasks/${taskName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ parameters: {} })
      });

      const data = await response.json();
      
      if (data.success) {
        const agentMessage: Message = {
          id: Date.now().toString(),
          role: 'agent',
          content: `✅ Started task: ${data.data.taskName}. Agent ID: ${data.data.agentId}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, agentMessage]);
        loadActiveAgents();
      }
    } catch (error) {
      console.error('Failed to execute task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopAgent = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agent/stop/${agentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        loadActiveAgents();
        const agentMessage: Message = {
          id: Date.now().toString(),
          role: 'agent',
          content: `🛑 Agent ${agentId} has been stopped.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, agentMessage]);
      }
    } catch (error) {
      console.error('Failed to stop agent:', error);
    }
  };

  const predefinedTasks = [
    { name: 'monthly-close', label: 'Monthly Close', icon: '📊', description: 'Execute monthly close process' },
    { name: 'quarterly-reports', label: 'Quarterly Reports', icon: '📈', description: 'Generate quarterly reports' },
    { name: 'optimize-payments', label: 'Optimize Payments', icon: '💰', description: 'Optimize payment schedules' },
    { name: 'sync-platforms', label: 'Sync Platforms', icon: '🔄', description: 'Sync all platform data' },
    { name: 'compliance-check', label: 'Compliance Check', icon: '✅', description: 'Run compliance checks' },
    { name: 'revenue-forecast', label: 'Revenue Forecast', icon: '🔮', description: 'Predict future revenue' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white bg-opacity-20 rounded-xl">
              <Bot className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Autonomous AI Agent</h1>
              <p className="text-purple-100 text-lg">
                Your intelligent assistant with {capabilities.length} powerful tools
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-col h-[600px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === 'agent' && (
                          <Bot className="h-5 w-5 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{message.content}</p>
                          {message.actions && message.actions.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                              <p className="text-xs opacity-75 mb-1">Actions taken:</p>
                              <ul className="text-xs space-y-1">
                                {message.actions.map((action, idx) => (
                                  <li key={idx} className="flex items-center space-x-1">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>{action.tool || 'Action'}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs opacity-75 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Agent is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Ask me anything or give me a task..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Quick Tasks
              </h3>
              <div className="space-y-2">
                {predefinedTasks.map((task) => (
                  <button
                    key={task.name}
                    onClick={() => executeTask(task.name)}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{task.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {task.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Agents */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-500" />
                Active Agents ({activeAgents.length})
              </h3>
              <div className="space-y-2">
                {activeAgents.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No active agents
                  </p>
                ) : (
                  activeAgents.map((agent) => (
                    <div
                      key={agent.agentId}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                          {agent.name || agent.agentId}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            agent.status === 'running' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                          }`}>
                            {agent.status}
                          </span>
                          {agent.status === 'running' && (
                            <button
                              onClick={() => stopAgent(agent.agentId)}
                              title="Stop agent"
                              className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Square className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Iteration: {agent.iterations || 0}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Capabilities */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-blue-500" />
                Agent Capabilities
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Tools:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{capabilities.length}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Categories:</p>
                  <div className="flex flex-wrap gap-1">
                    {['Analysis', 'Payments', 'Reports', 'Communication', 'Integration'].map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded text-xs"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Prompts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
            Example Prompts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              'Analyze royalties for all artists this month',
              'Generate a quarterly report for Artist X',
              'Process pending payments for all artists',
              'Predict revenue for the next 6 months',
              'Check compliance for all active contracts',
              'Optimize payment schedules to minimize fees',
              'Sync data from all streaming platforms',
              'Send payment reminders to artists',
              'Identify contracts expiring soon'
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInput(prompt)}
                className="text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">{prompt}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}