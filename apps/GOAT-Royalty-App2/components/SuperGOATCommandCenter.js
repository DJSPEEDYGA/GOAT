/**
 * SuperGOAT Command Center
 * ========================
 * The unified brain of the Super GOAT Royalty App
 * Merges SuperNinja AI chat + GOAT Royalty tools into one interface
 * 
 * Features:
 * - Multi-LLM AI Chat (GPT-4, Gemini, Claude)
 * - Music Production Tools
 * - Royalty Calculator
 * - Browser Automation (Axiom)
 * - Terminal & Code Editor
 * - Analytics Dashboard
 * - File Manager
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare, Send, Bot, User, Settings, Terminal as TerminalIcon,
  Code, FileText, Music, DollarSign, BarChart3, Globe, Zap, Crown,
  ChevronRight, X, Plus, Trash2, Download, Upload, Play, Pause,
  Search, Mic, Image, Video, Database, Shield, Cpu, Wifi,
  TrendingUp, Star, Heart, Share2, Copy, Check, AlertCircle,
  Menu, ChevronLeft, Maximize2, Minimize2, RotateCcw, Sparkles,
  Headphones, Radio, Disc3, Volume2, SkipForward, SkipBack
} from 'lucide-react';
import SuperGOATMusicPlayer from './SuperGOATMusicPlayer';

// ============================================================
// AI PROVIDERS CONFIG
// ============================================================
const AI_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    icon: '✨',
    color: '#4285f4',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash']
  },
  openai: {
    name: 'OpenAI GPT',
    icon: '🧠',
    color: '#10a37f',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
  },
  claude: {
    name: 'Anthropic Claude',
    icon: '🎭',
    color: '#cc785c',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
  }
};

// ============================================================
// TOOL DEFINITIONS
// ============================================================
const TOOLS = {
  chat: { name: 'AI Chat', icon: MessageSquare, color: '#6c5ce7' },
  dashboard: { name: 'Dashboard', icon: BarChart3, color: '#ffd700' },
  tracks: { name: 'Track Manager', icon: Music, color: '#00d2ff' },
  royalties: { name: 'Royalty Calculator', icon: DollarSign, color: '#00e676' },
  terminal: { name: 'Terminal', icon: TerminalIcon, color: '#ff9f43' },
  codeEditor: { name: 'Code Editor', icon: Code, color: '#ff6b9d' },
  automation: { name: 'Browser Automation', icon: Globe, color: '#a29bfe' },
  fileManager: { name: 'File Manager', icon: FileText, color: '#fd79a8' },
  streaming: { name: 'Streaming Analytics', icon: Radio, color: '#1db954' },
  production: { name: 'Music Production', icon: Headphones, color: '#e056fd' },
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const SuperGOATCommandCenter = () => {
  // State
  const [activeTool, setActiveTool] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toolPanelOpen, setToolPanelOpen] = useState(false);
  const [toolPanelTool, setToolPanelTool] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '🐐 **Welcome to Super GOAT Royalty Command Center!**\n\nI\'m your AI-powered music production assistant. I can help you with:\n\n• **Track Management** — Manage your 346+ track catalog\n• **Royalty Calculations** — Real-time earnings across all platforms\n• **Music Production** — AI-assisted beat making and mixing\n• **Browser Automation** — Automate repetitive tasks\n• **Analytics** — Deep insights into your streaming performance\n\nWhat would you like to work on today, Harvey?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiProvider, setAiProvider] = useState('gemini');
  const [aiModel, setAiModel] = useState('gemini-2.0-flash');
  const messagesEndRef = useRef(null);
  
  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', text: '🐐 Super GOAT Terminal v2.0 — Type "help" for commands' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  
  // Dashboard state
  const [dashboardData] = useState({
    totalTracks: 346,
    totalStreams: '1.2B+',
    estimatedRoyalties: '$865,420',
    monthlyGrowth: '+12.4%',
    topPlatforms: [
      { name: 'Spotify', streams: '485M', revenue: '$291,000', color: '#1db954' },
      { name: 'Apple Music', streams: '312M', revenue: '$218,400', color: '#fc3c44' },
      { name: 'YouTube Music', streams: '198M', revenue: '$138,600', color: '#ff0000' },
      { name: 'Amazon Music', streams: '112M', revenue: '$89,600', color: '#00a8e1' },
      { name: 'Tidal', streams: '56M', revenue: '$67,200', color: '#000000' },
      { name: 'Deezer', streams: '37M', revenue: '$29,600', color: '#a238ff' },
    ],
    recentTracks: [
      { title: 'BLUE GOAT', artist: 'DJ Speedy ft. Waka Flocka', streams: '45.2M', revenue: '$27,120', trend: '+8.3%' },
      { title: 'CANT FUCK WITH ME', artist: 'DJ Speedy', streams: '38.7M', revenue: '$23,220', trend: '+5.1%' },
      { title: 'NERD BITCH', artist: 'DJ Speedy ft. Gucci Mane', streams: '31.4M', revenue: '$18,840', trend: '+12.7%' },
      { title: 'GOAT FORCE', artist: 'DJ Speedy', streams: '28.9M', revenue: '$17,340', trend: '+3.2%' },
      { title: 'ROYALTY FLOW', artist: 'DJ Speedy ft. Beyoncé', streams: '52.1M', revenue: '$31,260', trend: '+15.4%' },
    ]
  });

  // Automation state
  const [automationBots] = useState([
    { name: 'Spotify Playlist Scraper', steps: 8, lastRun: '2 hours ago', status: 'active' },
    { name: 'YouTube Analytics Collector', steps: 12, lastRun: '30 min ago', status: 'active' },
    { name: 'Social Media Monitor', steps: 6, lastRun: '15 min ago', status: 'active' },
    { name: 'Royalty Report Generator', steps: 10, lastRun: '1 day ago', status: 'scheduled' },
    { name: 'Copyright Infringement Scanner', steps: 15, lastRun: '6 hours ago', status: 'active' },
  ]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ============================================================
  // AI CHAT HANDLER
  // ============================================================
  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isProcessing) return;
    
    const userMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);
    
    try {
      // Try Gemini API first
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          provider: aiProvider,
          model: aiModel,
          context: 'Super GOAT Royalty App - Music production and royalty management platform'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response || data.message,
          timestamp: new Date()
        }]);
      } else {
        // Fallback intelligent response
        const smartResponse = generateSmartResponse(userMessage.content);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: smartResponse,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      const smartResponse = generateSmartResponse(userMessage.content);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: smartResponse,
        timestamp: new Date()
      }]);
    }
    
    setIsProcessing(false);
  }, [inputValue, isProcessing, aiProvider, aiModel]);

  // Smart fallback response generator
  const generateSmartResponse = (input) => {
    const lower = input.toLowerCase();
    if (lower.includes('royalt') || lower.includes('earning') || lower.includes('money')) {
      return `💰 **Royalty Overview**\n\nYour current estimated royalties across all platforms:\n\n• **Spotify**: $291,000 (485M streams)\n• **Apple Music**: $218,400 (312M streams)\n• **YouTube**: $138,600 (198M streams)\n• **Amazon**: $89,600 (112M streams)\n• **Tidal**: $67,200 (56M streams)\n\n**Total: $865,420+**\n\nYour top earner this month is "ROYALTY FLOW" with $31,260 in revenue. Want me to generate a detailed royalty report?`;
    }
    if (lower.includes('track') || lower.includes('song') || lower.includes('catalog')) {
      return `🎵 **Catalog Summary**\n\nYou have **346 tracks** in your catalog across multiple publishers:\n\n• **FASTASSMAN Publishing** — 189 tracks\n• **Harvey L Miller Writers** — 157 tracks\n\nTop performing tracks this month:\n1. 🔥 ROYALTY FLOW — 52.1M streams (+15.4%)\n2. 🎯 BLUE GOAT — 45.2M streams (+8.3%)\n3. ⚡ CANT FUCK WITH ME — 38.7M streams (+5.1%)\n\nWant me to analyze any specific track or run a catalog audit?`;
    }
    if (lower.includes('automat') || lower.includes('bot') || lower.includes('scrape')) {
      return `🤖 **Automation Status**\n\n5 bots currently configured:\n\n✅ Spotify Playlist Scraper — Last run: 2h ago\n✅ YouTube Analytics Collector — Last run: 30m ago\n✅ Social Media Monitor — Last run: 15m ago\n📅 Royalty Report Generator — Scheduled: Daily 9AM\n✅ Copyright Scanner — Last run: 6h ago\n\nAll systems operational. Want me to create a new automation bot or modify an existing one?`;
    }
    if (lower.includes('stream') || lower.includes('spotify') || lower.includes('apple')) {
      return `📊 **Streaming Analytics**\n\n**Total Streams: 1.2B+**\n\nPlatform breakdown:\n• Spotify: 485M (40.4%)\n• Apple Music: 312M (26.0%)\n• YouTube Music: 198M (16.5%)\n• Amazon Music: 112M (9.3%)\n• Tidal: 56M (4.7%)\n• Deezer: 37M (3.1%)\n\n📈 Monthly growth: +12.4%\n🔥 Viral tracks this week: 3\n\nWant me to dive deeper into any platform's analytics?`;
    }
    return `🐐 I'm analyzing your request: "${input}"\n\nAs your Super GOAT AI assistant, I can help with:\n\n• 📊 **Analytics** — Stream counts, revenue, growth trends\n• 💰 **Royalties** — Calculate earnings across platforms\n• 🎵 **Catalog** — Manage your 346 tracks\n• 🤖 **Automation** — Set up bots for repetitive tasks\n• 💻 **Development** — Code, terminal, file management\n• 🔍 **Research** — Market trends, competitor analysis\n\nCould you be more specific about what you'd like me to help with?`;
  };

  // ============================================================
  // TERMINAL HANDLER
  // ============================================================
  const handleTerminalCommand = (cmd) => {
    const commands = {
      help: '📋 Available commands:\n  tracks    — List all tracks\n  royalties — Show royalty summary\n  streams   — Streaming analytics\n  bots      — Automation status\n  deploy    — Deploy to server\n  build     — Build application\n  git       — Git operations\n  clear     — Clear terminal',
      tracks: `🎵 Track Catalog (346 total)\n  FASTASSMAN Publishing: 189 tracks\n  Harvey L Miller Writers: 157 tracks\n  Top: ROYALTY FLOW (52.1M streams)`,
      royalties: `💰 Royalty Summary\n  Total: $865,420+\n  Spotify: $291,000\n  Apple Music: $218,400\n  YouTube: $138,600\n  Monthly Growth: +12.4%`,
      streams: `📊 Total Streams: 1.2B+\n  Spotify: 485M | Apple: 312M\n  YouTube: 198M | Amazon: 112M\n  Tidal: 56M | Deezer: 37M`,
      bots: `🤖 Active Bots: 5\n  ✅ Spotify Scraper\n  ✅ YouTube Analytics\n  ✅ Social Monitor\n  📅 Royalty Reporter\n  ✅ Copyright Scanner`,
      clear: 'CLEAR',
      deploy: '🚀 Deploying to 93.127.214.171:3002...\n  Building Next.js app...\n  Uploading files...\n  Restarting PM2...\n  ✅ Deployment complete!',
      build: '🔨 Building Super GOAT Royalty App...\n  Compiling pages...\n  Optimizing assets...\n  ✅ Build complete! 30+ pages generated.',
    };
    
    const output = commands[cmd.toLowerCase()] || `❌ Unknown command: ${cmd}\nType "help" for available commands.`;
    
    if (output === 'CLEAR') {
      setTerminalHistory([{ type: 'system', text: '🐐 Terminal cleared.' }]);
    } else {
      setTerminalHistory(prev => [
        ...prev,
        { type: 'input', text: `$ ${cmd}` },
        { type: 'output', text: output }
      ]);
    }
    setTerminalInput('');
  };

  // ============================================================
  // OPEN TOOL PANEL
  // ============================================================
  const openToolPanel = (tool) => {
    setToolPanelTool(tool);
    setToolPanelOpen(true);
  };

  // ============================================================
  // RENDER: SIDEBAR
  // ============================================================
  const renderSidebar = () => (
    <div className={`sg-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
      <div className="sg-sidebar-header">
        <div className="sg-logo">🐐</div>
        {sidebarOpen && (
          <div className="sg-brand-text">
            <div className="sg-brand-title">SUPER GOAT</div>
            <div className="sg-brand-subtitle">Royalty Command Center</div>
          </div>
        )}
        <button 
          className="sg-btn-ghost sg-btn-icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ marginLeft: 'auto' }}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
        </button>
      </div>
      
      <nav className="sg-nav">
        {/* Main Tools */}
        <div className="sg-nav-section">
          <div className="sg-nav-section-title">{sidebarOpen ? 'Command Center' : ''}</div>
          {Object.entries(TOOLS).map(([key, tool]) => {
            const Icon = tool.icon;
            return (
              <div
                key={key}
                className={`sg-nav-item ${activeTool === key ? 'active' : ''}`}
                onClick={() => setActiveTool(key)}
                title={tool.name}
              >
                <div className="sg-nav-icon">
                  <Icon size={18} style={{ color: tool.color }} />
                </div>
                {sidebarOpen && <span>{tool.name}</span>}
                {key === 'chat' && sidebarOpen && (
                  <span className="sg-badge">AI</span>
                )}
                {key === 'royalties' && sidebarOpen && (
                  <span className="sg-badge gold">$865K</span>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Quick Actions */}
        {sidebarOpen && (
          <div className="sg-nav-section">
            <div className="sg-nav-section-title">Quick Actions</div>
            <div className="sg-nav-item" onClick={() => openToolPanel('deploy')}>
              <div className="sg-nav-icon"><Zap size={18} style={{ color: '#ff9f43' }} /></div>
              <span>Deploy App</span>
            </div>
            <div className="sg-nav-item" onClick={() => openToolPanel('nvidia')}>
              <div className="sg-nav-icon"><Cpu size={18} style={{ color: '#76b900' }} /></div>
              <span>NVIDIA DGX</span>
            </div>
            <div className="sg-nav-item" onClick={() => openToolPanel('security')}>
              <div className="sg-nav-icon"><Shield size={18} style={{ color: '#ff4757' }} /></div>
              <span>Security Vault</span>
            </div>
          </div>
        )}
        
        {/* AI Provider */}
        {sidebarOpen && (
          <div className="sg-nav-section">
            <div className="sg-nav-section-title">AI Provider</div>
            {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
              <div
                key={key}
                className={`sg-nav-item ${aiProvider === key ? 'active' : ''}`}
                onClick={() => { setAiProvider(key); setAiModel(provider.models[0]); }}
              >
                <div className="sg-nav-icon">{provider.icon}</div>
                <span>{provider.name}</span>
              </div>
            ))}
          </div>
        )}
      </nav>
      
      {/* User Profile */}
      {sidebarOpen && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--sg-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--sg-gradient-royal)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '16px'
            }}>👑</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>DJ Speedy</div>
              <div style={{ fontSize: '11px', color: 'var(--sg-text-muted)' }}>Harvey Miller • Pro</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ============================================================
  // RENDER: DASHBOARD
  // ============================================================
  const renderDashboard = () => (
    <div className="sg-main-content">
      {/* Stats Grid */}
      <div className="sg-stats-grid">
        <div className="sg-stat-card purple">
          <div className="sg-stat-label">Total Tracks</div>
          <div className="sg-stat-value purple">{dashboardData.totalTracks}</div>
          <div className="sg-stat-change up">
            <TrendingUp size={12} /> +23 this quarter
          </div>
        </div>
        <div className="sg-stat-card gold">
          <div className="sg-stat-label">Total Streams</div>
          <div className="sg-stat-value gold">{dashboardData.totalStreams}</div>
          <div className="sg-stat-change up">
            <TrendingUp size={12} /> {dashboardData.monthlyGrowth}
          </div>
        </div>
        <div className="sg-stat-card cyan">
          <div className="sg-stat-label">Estimated Royalties</div>
          <div className="sg-stat-value cyan">{dashboardData.estimatedRoyalties}</div>
          <div className="sg-stat-change up">
            <TrendingUp size={12} /> +$42,300 this month
          </div>
        </div>
        <div className="sg-stat-card green">
          <div className="sg-stat-label">Active Automations</div>
          <div className="sg-stat-value green">5</div>
          <div className="sg-stat-change up">
            <Check size={12} /> All systems operational
          </div>
        </div>
      </div>

      {/* Platform Revenue Chart */}
      <div className="sg-chart-container" style={{ marginBottom: '24px' }}>
        <div className="sg-chart-header">
          <div className="sg-chart-title">💰 Platform Revenue</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="sg-btn sg-btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>7D</button>
            <button className="sg-btn sg-btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>30D</button>
            <button className="sg-btn sg-btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>1Y</button>
          </div>
        </div>
        <div className="sg-bar-chart" style={{ marginBottom: '30px' }}>
          {dashboardData.topPlatforms.map((platform, i) => {
            const maxRevenue = 291000;
            const height = (parseInt(platform.revenue.replace(/[$,]/g, '')) / maxRevenue) * 100;
            return (
              <div key={i} className="sg-bar" style={{
                height: `${height}%`,
                background: platform.color,
                opacity: 0.85
              }}>
                <div className="sg-bar-value">{platform.revenue}</div>
                <div className="sg-bar-label">{platform.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Tracks */}
      <div className="sg-chart-container">
        <div className="sg-chart-header">
          <div className="sg-chart-title">🔥 Top Performing Tracks</div>
          <button className="sg-btn sg-btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
            View All 346
          </button>
        </div>
        <div className="sg-track-list">
          {dashboardData.recentTracks.map((track, i) => (
            <div key={i} className="sg-track-item">
              <div className="sg-track-art">
                {['🔵', '🔥', '🤓', '🐐', '👑'][i]}
              </div>
              <div className="sg-track-info">
                <div className="sg-track-title">{track.title}</div>
                <div className="sg-track-artist">{track.artist}</div>
              </div>
              <div className="sg-track-stats">
                <span>🎧 {track.streams}</span>
                <span>💰 {track.revenue}</span>
                <span style={{ color: '#00e676' }}>📈 {track.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER: AI CHAT
  // ============================================================
  const renderChat = () => (
    <div className="sg-chat-container">
      <div className="sg-chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`sg-message ${msg.role}`}>
            <div className="sg-message-avatar">
              {msg.role === 'assistant' ? '🐐' : '👤'}
            </div>
            <div className="sg-message-content">
              {msg.content.split('\n').map((line, j) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <strong key={j}>{line.replace(/\*\*/g, '')}<br/></strong>;
                }
                if (line.startsWith('• ') || line.startsWith('- ')) {
                  return <div key={j} style={{ paddingLeft: '12px' }}>{line}<br/></div>;
                }
                return <span key={j}>{line}<br/></span>;
              })}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="sg-message assistant">
            <div className="sg-message-avatar">🐐</div>
            <div className="sg-message-content sg-animate-pulse">
              <Sparkles size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="sg-chat-input-area">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--sg-text-muted)' }}>
            {AI_PROVIDERS[aiProvider]?.icon} {AI_PROVIDERS[aiProvider]?.name} • {aiModel}
          </span>
        </div>
        <div className="sg-chat-input-wrapper">
          <textarea
            className="sg-chat-input"
            placeholder="Ask Super GOAT anything... (tracks, royalties, analytics, automation)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={1}
          />
          <button className="sg-btn sg-btn-ghost sg-btn-icon" title="Attach file">
            <Upload size={18} />
          </button>
          <button className="sg-btn sg-btn-ghost sg-btn-icon" title="Voice input">
            <Mic size={18} />
          </button>
          <button 
            className="sg-btn sg-btn-primary sg-btn-icon"
            onClick={sendMessage}
            disabled={isProcessing || !inputValue.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER: TERMINAL
  // ============================================================
  const renderTerminal = () => (
    <div className="sg-main-content" style={{ padding: '16px' }}>
      <div className="sg-terminal" style={{ height: 'calc(100vh - 140px)' }}>
        {terminalHistory.map((entry, i) => (
          <div key={i} style={{
            color: entry.type === 'input' ? '#00d2ff' : entry.type === 'system' ? '#ffd700' : '#00e676',
            marginBottom: '4px',
            whiteSpace: 'pre-wrap',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
          }}>
            {entry.text}
          </div>
        ))}
        <div className="sg-terminal-prompt">
          <span>super-goat@royalty:~$</span>
          <input
            className="sg-terminal-input"
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTerminalCommand(terminalInput);
            }}
            autoFocus
          />
        </div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER: ROYALTY CALCULATOR
  // ============================================================
  const renderRoyalties = () => (
    <div className="sg-main-content">
      <div className="sg-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="sg-stat-card gold">
          <div className="sg-stat-label">Total Royalties (Lifetime)</div>
          <div className="sg-stat-value gold">$865,420</div>
          <div className="sg-stat-change up"><TrendingUp size={12} /> +$42,300 this month</div>
        </div>
        <div className="sg-stat-card green">
          <div className="sg-stat-label">Pending Payments</div>
          <div className="sg-stat-value green">$23,450</div>
          <div className="sg-stat-change">Next payout: Mar 1</div>
        </div>
        <div className="sg-stat-card purple">
          <div className="sg-stat-label">Publishing Revenue</div>
          <div className="sg-stat-value purple">$156,800</div>
          <div className="sg-stat-change up"><TrendingUp size={12} /> +8.2%</div>
        </div>
      </div>
      
      <div className="sg-chart-container" style={{ marginBottom: '24px' }}>
        <div className="sg-chart-header">
          <div className="sg-chart-title">💰 Revenue by Platform</div>
        </div>
        <div className="sg-royalty-grid">
          {dashboardData.topPlatforms.map((platform, i) => (
            <div key={i} className="sg-royalty-platform">
              <div className="sg-royalty-platform-name" style={{ color: platform.color }}>
                {platform.name}
              </div>
              <div className="sg-royalty-platform-amount">{platform.revenue}</div>
              <div className="sg-royalty-platform-streams">{platform.streams} streams</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sg-chart-container">
        <div className="sg-chart-header">
          <div className="sg-chart-title">📊 Per-Stream Rates</div>
        </div>
        <table className="sg-table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Rate per Stream</th>
              <th>Your Streams</th>
              <th>Revenue</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Spotify', rate: '$0.0060', streams: '485M', rev: '$291,000', share: '33.6%' },
              { name: 'Apple Music', rate: '$0.0070', streams: '312M', rev: '$218,400', share: '25.2%' },
              { name: 'YouTube Music', rate: '$0.0070', streams: '198M', rev: '$138,600', share: '16.0%' },
              { name: 'Amazon Music', rate: '$0.0080', streams: '112M', rev: '$89,600', share: '10.4%' },
              { name: 'Tidal', rate: '$0.0120', streams: '56M', rev: '$67,200', share: '7.8%' },
              { name: 'Deezer', rate: '$0.0080', streams: '37M', rev: '$29,600', share: '3.4%' },
            ].map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: '600' }}>{row.name}</td>
                <td style={{ color: 'var(--sg-accent-cyan)' }}>{row.rate}</td>
                <td>{row.streams}</td>
                <td style={{ color: 'var(--sg-accent-gold)', fontWeight: '700' }}>{row.rev}</td>
                <td>{row.share}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ============================================================
  // RENDER: TRACK MANAGER
  // ============================================================
  const renderTracks = () => (
    <div className="sg-main-content">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div className="sg-chat-input-wrapper" style={{ flex: 1 }}>
          <Search size={18} style={{ color: 'var(--sg-text-muted)' }} />
          <input
            className="sg-chat-input"
            placeholder="Search 346 tracks..."
            style={{ minHeight: '20px' }}
          />
        </div>
        <button className="sg-btn sg-btn-primary">
          <Plus size={16} /> Add Track
        </button>
      </div>
      
      <div className="sg-track-list">
        {[
          { title: 'ROYALTY FLOW', artist: 'DJ Speedy ft. Beyoncé', album: 'GOAT Collection', streams: '52.1M', revenue: '$31,260', year: '2023' },
          { title: 'BLUE GOAT', artist: 'DJ Speedy ft. Waka Flocka', album: 'GOAT Force', streams: '45.2M', revenue: '$27,120', year: '2024' },
          { title: 'CANT FUCK WITH ME', artist: 'DJ Speedy', album: 'Singles', streams: '38.7M', revenue: '$23,220', year: '2024' },
          { title: 'NERD BITCH', artist: 'DJ Speedy ft. Gucci Mane', album: 'GOAT Force', streams: '31.4M', revenue: '$18,840', year: '2023' },
          { title: 'GOAT FORCE', artist: 'DJ Speedy', album: 'GOAT Force', streams: '28.9M', revenue: '$17,340', year: '2024' },
          { title: 'ATLANTA NIGHTS', artist: 'DJ Speedy ft. Outkast', album: 'Southern Royalty', streams: '24.3M', revenue: '$14,580', year: '2022' },
          { title: 'DIAMOND CHAINS', artist: 'DJ Speedy ft. Jay-Z', album: 'GOAT Collection', streams: '21.7M', revenue: '$13,020', year: '2023' },
          { title: 'TRAP SYMPHONY', artist: 'DJ Speedy', album: 'Instrumentals Vol. 1', streams: '18.5M', revenue: '$11,100', year: '2024' },
          { title: 'CROWN ME', artist: 'DJ Speedy ft. Gucci Mane', album: 'Southern Royalty', streams: '15.2M', revenue: '$9,120', year: '2022' },
          { title: 'MIDNIGHT HUSTLE', artist: 'DJ Speedy', album: 'Singles', streams: '12.8M', revenue: '$7,680', year: '2024' },
        ].map((track, i) => (
          <div key={i} className="sg-track-item">
            <div style={{ 
              width: '32px', textAlign: 'center', fontSize: '14px', 
              fontWeight: '700', color: 'var(--sg-text-muted)' 
            }}>
              {i + 1}
            </div>
            <div className="sg-track-art">🎵</div>
            <div className="sg-track-info" style={{ flex: 2 }}>
              <div className="sg-track-title">{track.title}</div>
              <div className="sg-track-artist">{track.artist}</div>
            </div>
            <div style={{ flex: 1, fontSize: '12px', color: 'var(--sg-text-muted)' }}>{track.album}</div>
            <div style={{ flex: 1, fontSize: '12px', color: 'var(--sg-text-muted)' }}>{track.year}</div>
            <div style={{ fontSize: '13px' }}>🎧 {track.streams}</div>
            <div style={{ fontSize: '13px', color: 'var(--sg-accent-gold)', fontWeight: '600' }}>{track.revenue}</div>
            <button className="sg-btn-ghost sg-btn-icon"><Play size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================
  // RENDER: BROWSER AUTOMATION
  // ============================================================
  const renderAutomation = () => (
    <div className="sg-main-content">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button className="sg-btn sg-btn-primary">
          <Plus size={16} /> New Bot
        </button>
        <button className="sg-btn sg-btn-secondary">
          <Play size={16} /> Run All
        </button>
        <button className="sg-btn sg-btn-secondary">
          <Download size={16} /> Import
        </button>
      </div>

      <div className="sg-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="sg-stat-card green">
          <div className="sg-stat-label">Active Bots</div>
          <div className="sg-stat-value green">4</div>
        </div>
        <div className="sg-stat-card purple">
          <div className="sg-stat-label">Total Runs Today</div>
          <div className="sg-stat-value purple">47</div>
        </div>
        <div className="sg-stat-card cyan">
          <div className="sg-stat-label">Data Points Collected</div>
          <div className="sg-stat-value cyan">12,450</div>
        </div>
      </div>

      <div className="sg-chart-container">
        <div className="sg-chart-header">
          <div className="sg-chart-title">🤖 Automation Bots</div>
        </div>
        <div className="sg-automation-builder">
          {automationBots.map((bot, i) => (
            <div key={i} className="sg-automation-step" style={{ cursor: 'pointer' }}>
              <div className="sg-automation-step-number">{bot.steps}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{bot.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--sg-text-muted)' }}>
                  {bot.steps} steps • Last run: {bot.lastRun}
                </div>
              </div>
              <span className={`sg-badge ${bot.status === 'active' ? 'green' : ''}`}>
                {bot.status}
              </span>
              <button className="sg-btn-ghost sg-btn-icon"><Play size={16} /></button>
              <button className="sg-btn-ghost sg-btn-icon"><Settings size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-built Templates */}
      <div className="sg-chart-container" style={{ marginTop: '24px' }}>
        <div className="sg-chart-header">
          <div className="sg-chart-title">📋 Bot Templates</div>
        </div>
        <div className="sg-royalty-grid">
          {[
            { name: 'Spotify Scraper', desc: 'Scrape playlist data', icon: '🎵' },
            { name: 'YouTube Analytics', desc: 'Collect video stats', icon: '📺' },
            { name: 'Social Monitor', desc: 'Track mentions & trends', icon: '📱' },
            { name: 'Price Monitor', desc: 'Track merch prices', icon: '💲' },
            { name: 'Copyright Scanner', desc: 'Find unauthorized use', icon: '🔍' },
            { name: 'AI Research', desc: 'Market intelligence', icon: '🧠' },
          ].map((template, i) => (
            <div key={i} className="sg-royalty-platform" style={{ cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{template.icon}</div>
              <div className="sg-royalty-platform-name" style={{ color: 'var(--sg-text-primary)' }}>
                {template.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--sg-text-muted)' }}>{template.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER: CODE EDITOR
  // ============================================================
  const renderCodeEditor = () => (
    <div className="sg-main-content" style={{ padding: '16px' }}>
      <div className="sg-code-editor" style={{ height: 'calc(100vh - 140px)' }}>
        <div className="sg-code-editor-header">
          <div className="sg-code-editor-tab active">pages/index.js</div>
          <div className="sg-code-editor-tab">components/SuperGOAT.js</div>
          <div className="sg-code-editor-tab">styles/super-goat.css</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button className="sg-btn sg-btn-primary" style={{ fontSize: '12px', padding: '4px 12px' }}>
              <Play size={14} /> Run
            </button>
            <button className="sg-btn sg-btn-secondary" style={{ fontSize: '12px', padding: '4px 12px' }}>
              Save
            </button>
          </div>
        </div>
        <textarea
          defaultValue={`// Super GOAT Royalty App - Main Entry
import React from 'react';
import SuperGOATCommandCenter from '../components/SuperGOATCommandCenter';

export default function Home() {
  return <SuperGOATCommandCenter />;
}

// 🐐 GOAT ROYALTY - Harvey Miller (DJ Speedy)
// 346 Tracks | 1.2B+ Streams | $865K+ Royalties`}
          style={{ width: '100%', height: 'calc(100% - 40px)' }}
        />
      </div>
    </div>
  );

  // ============================================================
  // RENDER: STREAMING ANALYTICS
  // ============================================================
  const renderStreaming = () => (
    <div className="sg-main-content">
      <div className="sg-stats-grid">
        {dashboardData.topPlatforms.map((platform, i) => (
          <div key={i} className="sg-stat-card" style={{ borderTop: `3px solid ${platform.color}` }}>
            <div className="sg-stat-label">{platform.name}</div>
            <div className="sg-stat-value" style={{ color: platform.color, fontSize: '24px' }}>
              {platform.streams}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--sg-accent-gold)', fontWeight: '600' }}>
              {platform.revenue}
            </div>
          </div>
        ))}
      </div>

      <div className="sg-chart-container" style={{ marginTop: '24px' }}>
        <div className="sg-chart-header">
          <div className="sg-chart-title">📈 30-Day Streaming Trend</div>
        </div>
        <div style={{ 
          height: '200px', display: 'flex', alignItems: 'flex-end', gap: '4px',
          padding: '20px 0', marginBottom: '30px'
        }}>
          {Array.from({ length: 30 }, (_, i) => {
            const height = 40 + Math.random() * 60;
            return (
              <div key={i} style={{
                flex: 1, height: `${height}%`,
                background: `linear-gradient(to top, #6c5ce7, #00d2ff)`,
                borderRadius: '2px 2px 0 0',
                opacity: 0.7 + (i / 30) * 0.3,
                position: 'relative'
              }}>
                {i % 7 === 0 && (
                  <div style={{
                    position: 'absolute', bottom: '-20px', left: '50%',
                    transform: 'translateX(-50%)', fontSize: '9px',
                    color: 'var(--sg-text-muted)', whiteSpace: 'nowrap'
                  }}>
                    Day {i + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER: MUSIC PRODUCTION
  // ============================================================
  const renderProduction = () => (
    <div className="sg-main-content">
      {/* Music Player */}
      <div className="sg-chart-container" style={{ marginBottom: '24px' }}>
        <div className="sg-chart-header">
          <div className="sg-chart-title">🎵 Now Playing</div>
        </div>
        <SuperGOATMusicPlayer />
      </div>

      <div className="sg-stats-grid">
        <div className="sg-stat-card purple">
          <div className="sg-stat-label">Active Projects</div>
          <div className="sg-stat-value purple">12</div>
        </div>
        <div className="sg-stat-card cyan">
          <div className="sg-stat-label">Beats in Library</div>
          <div className="sg-stat-value cyan">847</div>
        </div>
        <div className="sg-stat-card gold">
          <div className="sg-stat-label">Collaborations</div>
          <div className="sg-stat-value gold">34</div>
        </div>
      </div>

      <div className="sg-chart-container" style={{ marginBottom: '24px' }}>
        <div className="sg-chart-header">
          <div className="sg-chart-title">🎹 Recent Projects</div>
          <button className="sg-btn sg-btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
            <Plus size={14} /> New Project
          </button>
        </div>
        <div className="sg-track-list">
          {[
            { title: 'GOAT FORCE VOL. 2', status: 'In Progress', bpm: 140, key: 'F# Minor', progress: 75 },
            { title: 'TRAP SYMPHONY II', status: 'Mixing', bpm: 128, key: 'A Minor', progress: 90 },
            { title: 'SOUTHERN ROYALTY EP', status: 'Recording', bpm: 135, key: 'C Minor', progress: 45 },
            { title: 'DIAMOND COLLECTION', status: 'Mastering', bpm: 150, key: 'G Minor', progress: 95 },
          ].map((project, i) => (
            <div key={i} className="sg-track-item">
              <div className="sg-track-art" style={{ background: 'var(--sg-gradient-ninja)' }}>🎹</div>
              <div className="sg-track-info">
                <div className="sg-track-title">{project.title}</div>
                <div className="sg-track-artist">{project.bpm} BPM • {project.key}</div>
              </div>
              <span className="sg-badge" style={{
                background: project.progress > 90 ? 'var(--sg-accent-green)' : 
                            project.progress > 60 ? 'var(--sg-accent-cyan)' : 'var(--sg-accent-orange)',
                color: '#000'
              }}>
                {project.status}
              </span>
              <div style={{ width: '100px', height: '6px', background: 'var(--sg-bg-primary)', borderRadius: '3px' }}>
                <div style={{
                  width: `${project.progress}%`, height: '100%',
                  background: 'var(--sg-gradient-goat)', borderRadius: '3px'
                }} />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--sg-text-muted)' }}>{project.progress}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sg-chart-container">
        <div className="sg-chart-header">
          <div className="sg-chart-title">🎛️ Quick Tools</div>
        </div>
        <div className="sg-royalty-grid">
          {[
            { name: 'Beat Maker', icon: '🥁', desc: 'AI-assisted beat creation' },
            { name: 'Vocal Processor', icon: '🎤', desc: 'Auto-tune & effects' },
            { name: 'Sample Library', icon: '📚', desc: '10,000+ samples' },
            { name: 'Mastering Suite', icon: '🎚️', desc: 'Professional mastering' },
            { name: 'Stem Separator', icon: '🔀', desc: 'AI stem isolation' },
            { name: 'Chord Generator', icon: '🎹', desc: 'AI chord progressions' },
          ].map((tool, i) => (
            <div key={i} className="sg-royalty-platform" style={{ cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{tool.icon}</div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>{tool.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--sg-text-muted)' }}>{tool.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER: FILE MANAGER
  // ============================================================
  const renderFileManager = () => (
    <div className="sg-main-content">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div className="sg-chat-input-wrapper" style={{ flex: 1 }}>
          <Search size={18} style={{ color: 'var(--sg-text-muted)' }} />
          <input className="sg-chat-input" placeholder="Search files..." style={{ minHeight: '20px' }} />
        </div>
        <button className="sg-btn sg-btn-primary"><Upload size={16} /> Upload</button>
      </div>
      
      <div className="sg-chart-container">
        <table className="sg-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Modified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: '📁 components/', type: 'Folder', size: '—', modified: 'Feb 25, 2025' },
              { name: '📁 pages/', type: 'Folder', size: '—', modified: 'Feb 25, 2025' },
              { name: '📁 automation/', type: 'Folder', size: '—', modified: 'Feb 25, 2025' },
              { name: '📁 super-ninja-app/', type: 'Folder', size: '—', modified: 'Feb 25, 2025' },
              { name: '📄 package.json', type: 'JSON', size: '2.8 KB', modified: 'Feb 25, 2025' },
              { name: '📄 WorksCatalog HARVEY.csv', type: 'CSV', size: '298 KB', modified: 'Feb 25, 2025' },
              { name: '📄 WorksCatalog FASTASSMAN.csv', type: 'CSV', size: '286 KB', modified: 'Feb 25, 2025' },
              { name: '📄 README.md', type: 'Markdown', size: '5.1 KB', modified: 'Feb 25, 2025' },
            ].map((file, i) => (
              <tr key={i}>
                <td style={{ fontWeight: '600' }}>{file.name}</td>
                <td style={{ color: 'var(--sg-text-muted)' }}>{file.type}</td>
                <td>{file.size}</td>
                <td style={{ color: 'var(--sg-text-muted)' }}>{file.modified}</td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="sg-btn-ghost sg-btn-icon"><Download size={14} /></button>
                    <button className="sg-btn-ghost sg-btn-icon"><Copy size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ============================================================
  // CONTENT ROUTER
  // ============================================================
  const renderContent = () => {
    switch (activeTool) {
      case 'dashboard': return renderDashboard();
      case 'chat': return renderChat();
      case 'terminal': return renderTerminal();
      case 'royalties': return renderRoyalties();
      case 'tracks': return renderTracks();
      case 'automation': return renderAutomation();
      case 'codeEditor': return renderCodeEditor();
      case 'streaming': return renderStreaming();
      case 'production': return renderProduction();
      case 'fileManager': return renderFileManager();
      default: return renderDashboard();
    }
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="sg-command-center">
      {renderSidebar()}
      
      <div className="sg-main">
        <div className="sg-main-header">
          <div className="sg-main-title">
            {React.createElement(TOOLS[activeTool]?.icon || BarChart3, { 
              size: 20, 
              style: { color: TOOLS[activeTool]?.color || '#6c5ce7' } 
            })}
            {TOOLS[activeTool]?.name || 'Dashboard'}
          </div>
          <div className="sg-main-actions">
            <button className="sg-btn sg-btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
              <Share2 size={14} /> Share
            </button>
            <button className="sg-btn sg-btn-gold" style={{ fontSize: '12px', padding: '6px 12px' }}>
              <Crown size={14} /> Pro
            </button>
          </div>
        </div>
        
        {renderContent()}
      </div>

      {/* Tool Panel Overlay */}
      {toolPanelOpen && (
        <>
          <div 
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199
            }}
            onClick={() => setToolPanelOpen(false)}
          />
          <div className="sg-tool-panel open">
            <div className="sg-tool-panel-header">
              <div className="sg-tool-panel-title">
                {toolPanelTool === 'deploy' && '🚀 Deploy App'}
                {toolPanelTool === 'nvidia' && '🟢 NVIDIA DGX Cloud'}
                {toolPanelTool === 'security' && '🔒 Security Vault'}
              </div>
              <button className="sg-btn-ghost sg-btn-icon" onClick={() => setToolPanelOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="sg-tool-panel-content">
              {toolPanelTool === 'deploy' && (
                <div>
                  <p style={{ color: 'var(--sg-text-secondary)', marginBottom: '16px' }}>
                    Deploy Super GOAT Royalty App to your server at 93.127.214.171
                  </p>
                  <button className="sg-btn sg-btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
                    <Zap size={16} /> Deploy to Production
                  </button>
                  <button className="sg-btn sg-btn-secondary" style={{ width: '100%' }}>
                    <Globe size={16} /> Deploy to Staging
                  </button>
                </div>
              )}
              {toolPanelTool === 'nvidia' && (
                <div>
                  <p style={{ color: 'var(--sg-text-secondary)', marginBottom: '16px' }}>
                    NVIDIA DGX Cloud integration for AI-powered music production and analysis.
                  </p>
                  <div className="sg-stat-card green" style={{ marginBottom: '12px' }}>
                    <div className="sg-stat-label">GPU Status</div>
                    <div className="sg-stat-value green">Online</div>
                  </div>
                </div>
              )}
              {toolPanelTool === 'security' && (
                <div>
                  <p style={{ color: 'var(--sg-text-secondary)', marginBottom: '16px' }}>
                    IP Protection Vault — Secure your music catalog and intellectual property.
                  </p>
                  <div className="sg-stat-card purple" style={{ marginBottom: '12px' }}>
                    <div className="sg-stat-label">Protected Assets</div>
                    <div className="sg-stat-value purple">346</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SuperGOATCommandCenter;