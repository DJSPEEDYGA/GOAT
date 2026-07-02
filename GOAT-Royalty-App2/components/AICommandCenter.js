import React, { useState, useEffect } from 'react';

/**
 * AI Command Center Component
 * Central hub for all AI capabilities in GOAT Royalty App
 * - NVIDIA LLMs (215+ models)
 * - GOAT Force LLM with autonomous capabilities
 * - Music Industry AI features
 */

export default function AICommandCenter() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiStatus, setAIStatus] = useState(null);
  const [nvidiaModels, setNvidiaModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [taskInput, setTaskInput] = useState('');
  const [taskResult, setTaskResult] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  // Initialize AI systems on component mount
  useEffect(() => {
    initializeAI();
  }, []);

  const initializeAI = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/goat-force', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' })
      });
      const data = await response.json();
      setAIStatus(data);
    } catch (error) {
      console.error('Failed to initialize AI:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNVIDIAModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/nvidia-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'listModels' })
      });
      const data = await response.json();
      setNvidiaModels(data.models || []);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeTask = async (action, context = {}) => {
    try {
      setLoading(true);
      setTaskResult(null);

      const response = await fetch('/api/ai/goat-force', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          task: taskInput,
          context
        })
      });

      const data = await response.json();
      setTaskResult(data);

      // Add to chat history
      if (data.success) {
        setChatHistory([
          ...chatHistory,
          { type: 'user', content: taskInput },
          { type: 'ai', content: JSON.stringify(data, null, 2) }
        ]);
      }
    } catch (error) {
      console.error('Task execution failed:', error);
      setTaskResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">🎮 AI Command Center</h2>
        <p className="text-purple-100">
          Your autonomous AI-powered music royalty management system
        </p>
      </div>

      {aiStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">NVIDIA LLMs</p>
                <p className="text-2xl font-bold text-purple-600">
                  {aiStatus.capabilities.nvidiaModels}+
                </p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Google AI Tools</p>
                <p className="text-2xl font-bold text-blue-600">
                  {aiStatus.capabilities.googleAITools}+
                </p>
              </div>
              <div className="text-4xl">🤖</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Autonomous Agents</p>
                <p className="text-2xl font-bold text-green-600">
                  {aiStatus.capabilities.autonomousAgents ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="text-4xl">🦁</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-lg mb-3">🎵 Music Industry AI</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Royalty Optimization Agent
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Contract Analysis AI
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Market Trend Prediction
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Artist Career Management
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-lg mb-3">🧠 Advanced AI Systems</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Long-term AI Memory
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Adaptive Learning System
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Multi-step Reasoning Engine
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Autonomous Task Execution
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const NVIDIAView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">🎯 NVIDIA LLM Manager</h2>
        <p className="text-gray-600 mb-4">
          Access 215+ NVIDIA AI models for any task
        </p>

        <button
          onClick={loadNVIDIAModels}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load Available Models'}
        </button>

        {nvidiaModels.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">
              Available Models: {nvidiaModels.length}
            </p>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {nvidiaModels.map((model) => (
                <div
                  key={model.id}
                  className={`p-3 rounded border cursor-pointer ${
                    selectedModel?.id === model.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => setSelectedModel(model)}
                >
                  <div className="font-semibold">{model.name}</div>
                  <div className="text-sm text-gray-600">
                    {model.capabilities?.join(', ') || 'General purpose'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedModel && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-2">Selected Model</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(selectedModel, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );

  const MusicAIView = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🎵 Music Industry AI</h2>
        <p className="text-blue-100">
          Specialized AI agents for music royalty management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">💰 Royalty Optimization</h3>
          <p className="text-gray-600 text-sm mb-3">
            Analyze your catalog and maximize royalty revenue
          </p>
          <button
            onClick={() => executeTask('optimizeRoyalties', {
              artistId: 'demo',
              catalogData: {}
            })}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
          >
            Analyze Royalties
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">📄 Contract Analysis</h3>
          <p className="text-gray-600 text-sm mb-3">
            AI-powered contract review and risk assessment
          </p>
          <button
            onClick={() => executeTask('analyzeContract', {
              contractText: 'Sample contract text...'
            })}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Analyze Contract
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">📈 Market Trends</h3>
          <p className="text-gray-600 text-sm mb-3">
            Predict market trends and identify opportunities
          </p>
          <button
            onClick={() => executeTask('predictMarketTrends', {
              genre: 'pop',
              timeframe: '30d'
            })}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full"
          >
            Predict Trends
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">🌟 Career Management</h3>
          <p className="text-gray-600 text-sm mb-3">
            Get AI-powered career guidance and strategies
          </p>
          <button
            onClick={() => executeTask('manageArtistCareer', {
              artistId: 'demo',
              artistData: {}
            })}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 w-full"
          >
            Get Guidance
          </button>
        </div>
      </div>
    </div>
  );

  const AutonomousView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">🤖 Autonomous Task Execution</h2>
        <p className="text-gray-600 mb-4">
          Let AI autonomously complete complex tasks
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your task
          </label>
          <textarea
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            className="w-full p-3 border rounded-lg"
            rows={4}
            placeholder="Example: Analyze my catalog revenue from Q1 2024 and suggest optimization strategies..."
          />
        </div>

        <button
          onClick={() => executeTask('executeAutonomousTask')}
          disabled={loading || !taskInput}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 w-full"
        >
          {loading ? 'Processing...' : '🚀 Execute Autonomous Task'}
        </button>

        {taskResult && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Result</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(taskResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {chatHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-3">Chat History</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded ${
                  msg.type === 'user'
                    ? 'bg-blue-100 ml-8'
                    : 'bg-green-100 mr-8'
                }`}
              >
                <div className="text-xs font-semibold text-gray-500 mb-1">
                  {msg.type === 'user' ? '👤 You' : '🤖 AI'}
                </div>
                <div className="text-sm">{msg.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
            { id: 'nvidia', label: '🎯 NVIDIA LLMs', icon: '🎯' },
            { id: 'music', label: '🎵 Music AI', icon: '🎵' },
            { id: 'autonomous', label: '🤖 Autonomous', icon: '🤖' },
            { id: 'memory', label: '🧠 Memory', icon: '🧠' },
            { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'nvidia' && <NVIDIAView />}
          {activeTab === 'music' && <MusicAIView />}
          {activeTab === 'autonomous' && <AutonomousView />}
          {activeTab === 'memory' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">🧠 Long-term AI Memory</h2>
              <p className="text-gray-600">
                AI remembers your preferences and learns from your interactions
              </p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">⚙️ AI Settings</h2>
              <p className="text-gray-600">
                Configure AI system preferences and API keys
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}