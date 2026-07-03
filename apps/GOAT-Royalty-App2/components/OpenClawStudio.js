/**
 * 🦞 OpenClaw Local LLM Studio — GOAT Royalty Integration
 * Personal AI Assistant with Local Language Models
 * Based on OpenClaw v2026.2.26 (241K+ stars)
 * https://github.com/openclaw/openclaw
 * 
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, MessageSquare, Terminal, Settings, Download, Play, 
  Square, Cpu, HardDrive, Zap, Globe, Shield, Mic, Camera,
  Code, FileText, RefreshCw, ChevronRight, Check, AlertCircle,
  Wifi, WifiOff, Volume2, Eye, Layers, Bot, Sparkles, Crown,
  Server, Database, Monitor, Smartphone, Clock, BarChart3,
  Send, Trash2, Copy, ExternalLink, Package, GitBranch
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// OpenClaw Local LLM Models Registry
// ═══════════════════════════════════════════════════════════════
const LOCAL_MODELS = [
  { id: 'llama3.3-70b', name: 'Llama 3.3 70B', provider: 'Ollama', size: '40GB', params: '70B', type: 'Chat', speed: 'Medium', quality: '★★★★★', description: 'Meta\'s flagship open model — excellent for complex reasoning and code' },
  { id: 'llama3.2-3b', name: 'Llama 3.2 3B', provider: 'Ollama', size: '2GB', params: '3B', type: 'Chat', speed: 'Fast', quality: '★★★☆☆', description: 'Lightweight model perfect for quick tasks and mobile devices' },
  { id: 'mistral-7b', name: 'Mistral 7B', provider: 'Ollama', size: '4.1GB', params: '7B', type: 'Chat', speed: 'Fast', quality: '★★★★☆', description: 'Efficient European model with strong multilingual capabilities' },
  { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'Ollama', size: '26GB', params: '47B MoE', type: 'Chat', speed: 'Medium', quality: '★★★★★', description: 'Mixture of Experts — GPT-4 class performance locally' },
  { id: 'codellama-34b', name: 'Code Llama 34B', provider: 'Ollama', size: '19GB', params: '34B', type: 'Code', speed: 'Medium', quality: '★★★★★', description: 'Specialized for code generation, debugging, and analysis' },
  { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2', provider: 'Ollama', size: '8.9GB', params: '16B', type: 'Code', speed: 'Fast', quality: '★★★★★', description: 'State-of-the-art coding model with 128K context' },
  { id: 'phi-3-medium', name: 'Phi-3 Medium', provider: 'Ollama', size: '7.9GB', params: '14B', type: 'Chat', speed: 'Fast', quality: '★★★★☆', description: 'Microsoft\'s compact powerhouse — great reasoning per parameter' },
  { id: 'gemma2-27b', name: 'Gemma 2 27B', provider: 'Ollama', size: '16GB', params: '27B', type: 'Chat', speed: 'Medium', quality: '★★★★★', description: 'Google\'s open model with excellent instruction following' },
  { id: 'qwen2.5-72b', name: 'Qwen 2.5 72B', provider: 'Ollama', size: '41GB', params: '72B', type: 'Chat', speed: 'Slow', quality: '★★★★★', description: 'Alibaba\'s top model — multilingual champion with tool use' },
  { id: 'starcoder2-15b', name: 'StarCoder2 15B', provider: 'Ollama', size: '9GB', params: '15B', type: 'Code', speed: 'Fast', quality: '★★★★☆', description: 'BigCode\'s coding model trained on 600+ languages' },
  { id: 'llava-v1.6', name: 'LLaVA v1.6', provider: 'Ollama', size: '4.7GB', params: '7B', type: 'Vision', speed: 'Fast', quality: '★★★★☆', description: 'Multimodal model — understands images and text together' },
  { id: 'whisper-large-v3', name: 'Whisper Large V3', provider: 'Local', size: '3GB', params: '1.5B', type: 'Audio', speed: 'Fast', quality: '★★★★★', description: 'OpenAI\'s speech recognition — transcribe any audio locally' },
];

// OpenClaw Channel Integrations
const CHANNELS = [
  { name: 'WhatsApp', icon: '💬', status: 'available', description: 'Connect via Baileys' },
  { name: 'Telegram', icon: '✈️', status: 'available', description: 'Bot API integration' },
  { name: 'Discord', icon: '🎮', status: 'available', description: 'discord.js powered' },
  { name: 'Slack', icon: '💼', status: 'available', description: 'Bolt framework' },
  { name: 'Signal', icon: '🔒', status: 'available', description: 'signal-cli bridge' },
  { name: 'iMessage', icon: '🍎', status: 'available', description: 'BlueBubbles/native' },
  { name: 'MS Teams', icon: '🏢', status: 'available', description: 'Bot Framework' },
  { name: 'WebChat', icon: '🌐', status: 'active', description: 'Built-in gateway' },
  { name: 'Matrix', icon: '🔗', status: 'available', description: 'Decentralized chat' },
  { name: 'Google Chat', icon: '📧', status: 'available', description: 'Chat API' },
];

// OpenClaw Skills/Tools
const SKILLS = [
  { name: 'Browser Control', icon: '🌐', category: 'Tools', description: 'CDP-powered Chrome automation' },
  { name: 'Canvas/A2UI', icon: '🎨', category: 'Visual', description: 'Agent-driven visual workspace' },
  { name: 'Voice Wake', icon: '🎤', category: 'Voice', description: 'Always-on speech recognition' },
  { name: 'Talk Mode', icon: '🗣️', category: 'Voice', description: 'Continuous conversation with ElevenLabs' },
  { name: 'Cron Jobs', icon: '⏰', category: 'Automation', description: 'Scheduled task execution' },
  { name: 'Webhooks', icon: '🔗', category: 'Automation', description: 'External trigger integration' },
  { name: 'File System', icon: '📁', category: 'Tools', description: 'Read/write/edit files' },
  { name: 'Code Execution', icon: '💻', category: 'Tools', description: 'Run code in sandboxed env' },
  { name: 'Camera/Screen', icon: '📸', category: 'Nodes', description: 'Capture from devices' },
  { name: 'Gmail Pub/Sub', icon: '📬', category: 'Automation', description: 'Email trigger hooks' },
  { name: 'Music Analysis', icon: '🎵', category: 'GOAT Custom', description: 'Analyze tracks & royalties' },
  { name: 'Royalty Calculator', icon: '💰', category: 'GOAT Custom', description: 'Real-time royalty computation' },
];

const OpenClawStudio = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedModel, setSelectedModel] = useState(LOCAL_MODELS[0]);
  const [gatewayStatus, setGatewayStatus] = useState('disconnected');
  const [messages, setMessages] = useState([
    { role: 'system', content: '🦞 OpenClaw Gateway connected. Local LLM ready. How can I help with your music empire today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [gatewayPort, setGatewayPort] = useState('18789');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [systemPrompt, setSystemPrompt] = useState(
    'You are the GOAT Royalty AI Assistant powered by OpenClaw. You help Harvey Miller (DJ Speedy) manage his music empire, track royalties across 3,650+ tracks, analyze streaming data, and provide insights for FASTASSMAN Publishing Inc. You have access to local LLM models running via Ollama for maximum privacy and speed.'
  );
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectGateway = async () => {
    setGatewayStatus('connecting');
    setTimeout(() => {
      setGatewayStatus('connected');
      setOllamaModels(LOCAL_MODELS.slice(0, 6));
    }, 1500);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;
    
    const userMsg = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsGenerating(true);

    // Simulate local LLM response
    setTimeout(() => {
      const responses = [
        `Based on your catalog of 3,650 tracks, I've analyzed the royalty distribution. Your top earner "Royalty Flow" ft. Outkast has generated $53,400 across all platforms. The ${selectedModel.name} model suggests optimizing your Spotify playlist placement could increase streams by 15-20%.`,
        `I've run a local analysis using ${selectedModel.name}. Your FASTASSMAN Publishing catalog shows strong growth — 1,836 tracks with an average of $471 per track in estimated royalties. The Southern Hip-Hop genre is trending +23% this quarter.`,
        `Using ${selectedModel.name} locally (no data leaves your machine), I've identified 12 tracks that are underperforming relative to their genre benchmarks. "ATL Nights" and "Empire State of Grind" could benefit from playlist pitching on Apple Music and Tidal.`,
        `The OpenClaw automation engine has detected a royalty discrepancy on 3 tracks. "Crown Royal" ft. Waka Flocka shows $20,400 on our records but the ASCAP statement indicates $22,150. I recommend filing a correction with your PRO.`,
        `Running ${selectedModel.name} analysis on your streaming patterns: Peak listening hours are 6-9 PM EST (commute time). I suggest scheduling your next release drop for Thursday 5 PM EST to maximize first-week streams. Your Beyoncé collaboration tracks consistently outperform by 340%.`,
      ];
      
      const aiMsg = { 
        role: 'assistant', 
        content: responses[Math.floor(Math.random() * responses.length)],
        model: selectedModel.name
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 2000 + Math.random() * 2000);
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Monitor },
    { id: 'chat', name: 'AI Chat', icon: MessageSquare },
    { id: 'models', name: 'Local Models', icon: Brain },
    { id: 'channels', name: 'Channels', icon: Globe },
    { id: 'skills', name: 'Skills & Tools', icon: Zap },
    { id: 'gateway', name: 'Gateway', icon: Server },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/20 to-gray-950 text-white">
      {/* Header */}
      <div className="bg-black/60 backdrop-blur-md border-b border-red-500/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🦞</div>
            <div>
              <h1 className="text-2xl font-black">
                <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  OpenClaw Local LLM Studio
                </span>
              </h1>
              <p className="text-sm text-gray-400">Personal AI Assistant • Local Models • Zero Data Leakage • v2026.2.26</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              gatewayStatus === 'connected' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              gatewayStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {gatewayStatus === 'connected' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              Gateway: {gatewayStatus}
            </div>
            <a href="https://github.com/openclaw/openclaw/releases" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm hover:bg-white/20 transition-all">
              <GitBranch className="w-4 h-4" /> v2026.2.26
            </a>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-full text-sm border border-purple-500/30">
              <Crown className="w-4 h-4 text-yellow-400" /> GOAT Royalty
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/25' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}>
                <Icon className="w-4 h-4" /> {tab.name}
              </button>
            );
          })}
        </div>

        {/* ═══ DASHBOARD TAB ═══ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-500/20 rounded-xl"><Brain className="w-6 h-6 text-red-400" /></div>
                  <div className="text-sm text-gray-400">Local Models</div>
                </div>
                <div className="text-3xl font-bold text-white">{LOCAL_MODELS.length}</div>
                <div className="text-sm text-green-400 mt-1">Available via Ollama</div>
              </div>
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl"><Globe className="w-6 h-6 text-blue-400" /></div>
                  <div className="text-sm text-gray-400">Channels</div>
                </div>
                <div className="text-3xl font-bold text-white">{CHANNELS.length}</div>
                <div className="text-sm text-blue-400 mt-1">WhatsApp, Telegram, Discord...</div>
              </div>
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-xl"><Zap className="w-6 h-6 text-purple-400" /></div>
                  <div className="text-sm text-gray-400">Skills & Tools</div>
                </div>
                <div className="text-3xl font-bold text-white">{SKILLS.length}</div>
                <div className="text-sm text-purple-400 mt-1">Browser, Voice, Automation...</div>
              </div>
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-xl"><Shield className="w-6 h-6 text-green-400" /></div>
                  <div className="text-sm text-gray-400">Privacy</div>
                </div>
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-sm text-green-400 mt-1">All data stays local</div>
              </div>
            </div>

            {/* Quick Start */}
            <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl p-8 border border-red-500/20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">🦞</span> Quick Start — OpenClaw + GOAT Royalty
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/30 rounded-xl p-5">
                  <div className="text-lg font-bold text-red-400 mb-2">1. Install OpenClaw</div>
                  <code className="block bg-black/50 rounded-xl p-3 text-sm text-green-400 font-mono mb-3">
                    npm install -g openclaw@latest
                  </code>
                  <p className="text-sm text-gray-400">Requires Node.js ≥22. Works on macOS, Linux, Windows (WSL2).</p>
                </div>
                <div className="bg-black/30 rounded-xl p-5">
                  <div className="text-lg font-bold text-orange-400 mb-2">2. Install Ollama</div>
                  <code className="block bg-black/50 rounded-xl p-3 text-sm text-green-400 font-mono mb-3">
                    curl -fsSL https://ollama.com/install.sh | sh
                  </code>
                  <p className="text-sm text-gray-400">Then pull a model: <code className="text-yellow-400">ollama pull llama3.3</code></p>
                </div>
                <div className="bg-black/30 rounded-xl p-5">
                  <div className="text-lg font-bold text-yellow-400 mb-2">3. Start Gateway</div>
                  <code className="block bg-black/50 rounded-xl p-3 text-sm text-green-400 font-mono mb-3">
                    openclaw onboard --install-daemon
                  </code>
                  <p className="text-sm text-gray-400">The wizard guides you through setup. Gateway runs on port 18789.</p>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <button onClick={connectGateway}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-bold hover:from-red-500 hover:to-orange-500 transition-all flex items-center gap-2">
                  <Play className="w-5 h-5" /> Connect to Gateway
                </button>
                <a href="https://github.com/openclaw/openclaw" target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-all flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" /> GitHub (241K ⭐)
                </a>
                <a href="https://docs.openclaw.ai" target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-all flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Documentation
                </a>
              </div>
            </div>

            {/* Architecture Diagram */}
            <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">🏗️ OpenClaw Architecture</h3>
              <div className="bg-black/40 rounded-xl p-6 font-mono text-sm text-gray-300">
                <pre>{`
  WhatsApp / Telegram / Discord / Slack / Signal / iMessage / WebChat
                              │
                              ▼
                ┌──────────────────────────────┐
                │     OpenClaw Gateway          │
                │   (Local Control Plane)       │
                │   ws://127.0.0.1:18789        │
                └──────────────┬───────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                     │
          ▼                    ▼                     ▼
   ┌─────────────┐   ┌──────────────┐   ┌──────────────────┐
   │  Ollama LLM  │   │  Pi Agent    │   │  GOAT Royalty    │
   │  (Local AI)  │   │  (Runtime)   │   │  (Music Tools)   │
   │  Llama 3.3   │   │  Tools/Code  │   │  3,650 Tracks    │
   │  Mixtral     │   │  Browser     │   │  $865K Royalties │
   │  DeepSeek    │   │  Canvas      │   │  Analytics       │
   └─────────────┘   └──────────────┘   └──────────────────┘
                `}</pre>
              </div>
            </div>
          </div>
        )}

        {/* ═══ CHAT TAB ═══ */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Area */}
            <div className="lg:col-span-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col" style={{ height: '70vh' }}>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🦞</div>
                  <div>
                    <div className="font-bold">OpenClaw AI Chat</div>
                    <div className="text-xs text-gray-400">Model: {selectedModel.name} • Local • Private</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={selectedModel.id} onChange={(e) => setSelectedModel(LOCAL_MODELS.find(m => m.id === e.target.value))}
                    className="goat-gradient-card goat-gradient-card goat-card-hover/10 border border-white/20 rounded-xl px-3 py-1.5 text-sm">
                    {LOCAL_MODELS.map(m => (
                      <option key={m.id} value={m.id} className="bg-gray-900">{m.name} ({m.params})</option>
                    ))}
                  </select>
                  <button onClick={() => setMessages([messages[0]])} className="p-2 hover:bg-white/10 rounded-xl" title="Clear chat">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      msg.role === 'user' ? 'bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-600 to-pink-600 text-white' :
                      msg.role === 'system' ? 'bg-red-500/20 text-red-200 border border-red-500/30' :
                      'bg-white/10 text-gray-200'
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="text-xs text-red-400 mb-1 flex items-center gap-1">
                          <Brain className="w-3 h-3" /> {msg.model || selectedModel.name} • Local
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="goat-gradient-card goat-gradient-card goat-card-hover/10 rounded-2xl px-5 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {selectedModel.name} is thinking locally...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="px-6 py-4 border-t border-white/10">
                <div className="flex gap-3">
                  <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about your royalties, tracks, or anything..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50" />
                  <button onClick={sendMessage} disabled={isGenerating}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-bold hover:from-red-500 hover:to-orange-500 transition-all disabled:opacity-50 flex items-center gap-2">
                    <Send className="w-4 h-4" /> Send
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-5 border border-white/10">
                <h3 className="font-bold mb-3 flex items-center gap-2"><Settings className="w-4 h-4" /> Model Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400">Temperature: {temperature}</label>
                    <input type="range" min="0" max="2" step="0.1" value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-red-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Max Tokens: {maxTokens}</label>
                    <input type="range" min="256" max="32768" step="256" value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                      className="w-full accent-red-500" />
                  </div>
                </div>
              </div>
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-5 border border-white/10">
                <h3 className="font-bold mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> System Prompt</h3>
                <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-xs h-32 resize-none focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-5 border border-white/10">
                <h3 className="font-bold mb-3">🎵 GOAT Quick Actions</h3>
                <div className="space-y-2">
                  {['Analyze my top tracks', 'Calculate royalties', 'Find underperforming songs', 'Generate release strategy', 'Check ASCAP discrepancies'].map((action, i) => (
                    <button key={i} onClick={() => { setInputMessage(action); }}
                      className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-all flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-red-400" /> {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ MODELS TAB ═══ */}
        {activeTab === 'models' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">🧠 Local Language Models</h2>
              <div className="flex gap-3">
                <div className="px-4 py-2 bg-white/10 rounded-xl text-sm">
                  Ollama URL: <code className="text-green-400">{ollamaUrl}</code>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LOCAL_MODELS.map(model => (
                <div key={model.id} className={`bg-white/5 rounded-2xl p-5 border transition-all cursor-pointer hover:bg-white/10 ${
                  selectedModel.id === model.id ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'
                }`} onClick={() => setSelectedModel(model)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-red-400" />
                      <span className="font-bold">{model.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      model.type === 'Chat' ? 'bg-blue-500/20 text-blue-400' :
                      model.type === 'Code' ? 'bg-green-500/20 text-green-400' :
                      model.type === 'Vision' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>{model.type}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{model.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-black/30 rounded-xl p-2 text-center">
                      <div className="text-gray-500">Size</div>
                      <div className="font-bold text-white">{model.size}</div>
                    </div>
                    <div className="bg-black/30 rounded-xl p-2 text-center">
                      <div className="text-gray-500">Params</div>
                      <div className="font-bold text-white">{model.params}</div>
                    </div>
                    <div className="bg-black/30 rounded-xl p-2 text-center">
                      <div className="text-gray-500">Speed</div>
                      <div className="font-bold text-white">{model.speed}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-yellow-400 text-sm">{model.quality}</span>
                    <span className="text-xs text-gray-500">{model.provider}</span>
                  </div>
                  <button className="mt-3 w-full py-2 bg-gradient-to-r from-red-600/50 to-orange-600/50 hover:from-red-600 hover:to-orange-600 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Pull Model
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ CHANNELS TAB ═══ */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">🌐 Multi-Channel Inbox</h2>
            <p className="text-gray-400">OpenClaw connects your AI assistant to all your messaging platforms. One assistant, every channel.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {CHANNELS.map((ch, i) => (
                <div key={i} className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all text-center">
                  <div className="text-4xl mb-3">{ch.icon}</div>
                  <div className="font-bold mb-1">{ch.name}</div>
                  <div className="text-xs text-gray-400 mb-3">{ch.description}</div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    ch.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${ch.status === 'active' ? 'bg-green-400' : 'bg-gray-500'}`} />
                    {ch.status === 'active' ? 'Connected' : 'Available'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ SKILLS TAB ═══ */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">⚡ Skills & Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SKILLS.map((skill, i) => (
                <div key={i} className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{skill.icon}</div>
                    <div>
                      <div className="font-bold text-sm">{skill.name}</div>
                      <div className="text-xs text-gray-500">{skill.category}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ GATEWAY TAB ═══ */}
        {activeTab === 'gateway' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">🖥️ Gateway Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold mb-4">Connection Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Gateway Port</label>
                    <input type="text" value={gatewayPort} onChange={(e) => setGatewayPort(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 mt-1" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Ollama URL</label>
                    <input type="text" value={ollamaUrl} onChange={(e) => setOllamaUrl(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 mt-1" />
                  </div>
                  <button onClick={connectGateway}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-bold hover:from-red-500 hover:to-orange-500 transition-all">
                    {gatewayStatus === 'connected' ? '✅ Connected' : '🔌 Connect Gateway'}
                  </button>
                </div>
              </div>
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold mb-4">Server Commands</h3>
                <div className="space-y-2 font-mono text-sm">
                  {[
                    'openclaw onboard --install-daemon',
                    'openclaw gateway --port 18789 --verbose',
                    'openclaw doctor',
                    'openclaw models status --probe',
                    'openclaw channels login',
                    'ollama list',
                    'ollama pull llama3.3:70b',
                  ].map((cmd, i) => (
                    <div key={i} className="flex items-center justify-between bg-black/30 rounded-xl px-4 py-2">
                      <code className="text-green-400">$ {cmd}</code>
                      <button onClick={() => navigator.clipboard?.writeText(cmd)} className="p-1 hover:bg-white/10 rounded">
                        <Copy className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenClawStudio;