/**
 * AI Studio Workspace - Google AI Studio-style Interface
 * Full-featured AI workspace with prompt editor, model selector, 
 * parameter controls, multimodal support, and tool calling
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles, Send, Settings, Sliders, Code, Image, FileText, 
  Brain, Zap, Copy, Check, Trash2, Download, Upload, Plus,
  ChevronDown, ChevronRight, RotateCcw, Maximize2, Minimize2,
  BookOpen, Globe, Shield, Terminal, Palette, Music, Film,
  MessageSquare, Bot, User, Loader, AlertCircle, X, Search,
  Layers, Database, GitBranch, Cpu, Cloud, Lock, Eye, EyeOff,
  Hash, Type, BarChart3, PieChart, TrendingUp, Mic, Camera,
  Wand2, Lightbulb, Target, Rocket, Star, Heart, Bookmark
} from 'lucide-react';

// ═══════════════ MODEL CONFIGURATIONS ═══════════════
const AI_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google', icon: '🔮', speed: 'fast', quality: 'high', description: 'Fast multimodal model' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', icon: '💎', speed: 'medium', quality: 'highest', description: 'Most capable Gemini model' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', icon: '🧠', speed: 'medium', quality: 'highest', description: 'OpenAI flagship model' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', icon: '⚡', speed: 'fast', quality: 'high', description: 'Fast & affordable' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic', icon: '🎭', speed: 'medium', quality: 'highest', description: 'Anthropic reasoning model' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic', icon: '🌸', speed: 'fast', quality: 'high', description: 'Fast Claude model' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'deepseek', icon: '🌊', speed: 'fast', quality: 'high', description: 'Open-source powerhouse' },
  { id: 'super-goat-v1', name: 'Super GOAT Local', provider: 'local', icon: '🐐', speed: 'instant', quality: 'good', description: 'Built-in local model' },
];

const PROMPT_TEMPLATES = [
  { id: 'royalty-analysis', name: '📊 Royalty Analysis', prompt: 'Analyze the royalty performance for my music catalog. Break down earnings by platform, identify top performers, and suggest optimization strategies.' },
  { id: 'contract-review', name: '📋 Contract Review', prompt: 'Review this music contract and identify key terms, potential issues, and negotiation points. Focus on royalty splits, rights retention, and termination clauses.' },
  { id: 'market-research', name: '🔍 Market Research', prompt: 'Research the current music industry trends for [genre]. Include streaming statistics, audience demographics, and emerging opportunities.' },
  { id: 'code-generation', name: '💻 Code Generation', prompt: 'Generate production-ready code for: ' },
  { id: 'image-prompt', name: '🎨 Image Generation', prompt: 'Create a detailed image prompt for: ' },
  { id: 'content-writing', name: '✍️ Content Writing', prompt: 'Write professional content about: ' },
  { id: 'data-analysis', name: '📈 Data Analysis', prompt: 'Analyze the following data and provide insights, trends, and actionable recommendations: ' },
  { id: 'security-audit', name: '🔒 Security Audit', prompt: 'Perform a security analysis on: ' },
];

// ═══════════════ MAIN COMPONENT ═══════════════
export default function AIStudioWorkspace() {
  // State management
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [systemPrompt, setSystemPrompt] = useState('You are the Super GOAT Royalty AI — an advanced AI assistant for music production, royalty management, and creative workflows.');
  const [streamingText, setStreamingText] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Parameters
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [topP, setTopP] = useState(0.95);
  const [topK, setTopK] = useState(40);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);
  const [presencePenalty, setPresencePenalty] = useState(0);
  const [enableGrounding, setEnableGrounding] = useState(false);
  const [enableCodeExecution, setEnableCodeExecution] = useState(false);
  const [structuredOutput, setStructuredOutput] = useState(false);
  const [outputFormat, setOutputFormat] = useState('text');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, streamingText]);

  // ═══════════════ SEND MESSAGE ═══════════════
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage, timestamp: new Date() }];
    setMessages(newMessages);
    setLoading(true);
    setStreamingText('');

    try {
      const response = await fetch('/api/ai-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          model: selectedModel.id,
          provider: selectedModel.provider,
          systemPrompt,
          temperature,
          maxTokens,
          topP,
          topK,
          frequencyPenalty,
          presencePenalty,
          enableGrounding,
          enableCodeExecution,
          structuredOutput,
          outputFormat,
          context: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          files: uploadedFiles.map(f => f.name)
        })
      });

      const data = await response.json();
      
      if (data.response) {
        setMessages([...newMessages, {
          role: 'assistant',
          content: data.response,
          model: data.model || selectedModel.name,
          provider: data.provider || selectedModel.provider,
          timestamp: new Date(),
          tokens: data.tokens,
          latency: data.latency
        }]);
      }
    } catch (error) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: `⚠️ Error: ${error.message}. Using local fallback.`,
        model: 'System',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      setStreamingText('');
    }
  };

  // ═══════════════ FILE UPLOAD ═══════════════
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  // ═══════════════ COPY TO CLIPBOARD ═══════════════
  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // ═══════════════ EXPORT CONVERSATION ═══════════════
  const exportConversation = () => {
    const content = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-studio-conversation-${Date.now()}.txt`;
    a.click();
  };

  // ═══════════════ GET CODE EXPORT ═══════════════
  const getCodeExport = () => {
    const code = `// Generated by GOAT AI Studio
// Model: ${selectedModel.name} | Provider: ${selectedModel.provider}

const response = await fetch('/api/ai-studio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "YOUR_PROMPT_HERE",
    model: "${selectedModel.id}",
    provider: "${selectedModel.provider}",
    temperature: ${temperature},
    maxTokens: ${maxTokens},
    topP: ${topP},
    topK: ${topK},
    systemPrompt: \`${systemPrompt}\`
  })
});

const data = await response.json();
console.log(data.response);`;
    return code;
  };

  // ═══════════════ RENDER MESSAGE ═══════════════
  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    const isCode = msg.content?.includes('```');
    
    return (
      <div key={index} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center flex-shrink-0 mt-1">
            <Bot className="w-4 h-4 text-black" />
          </div>
        )}
        <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
          <div className={`rounded-2xl px-4 py-3 ${
            isUser 
              ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white' 
              : 'bg-gray-800/80 border border-gray-700/50 text-gray-100'
          }`}>
            {/* Message content with code block support */}
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {msg.content?.split('```').map((part, i) => {
                if (i % 2 === 1) {
                  const [lang, ...codeLines] = part.split('\n');
                  return (
                    <div key={i} className="my-3 rounded-lg overflow-hidden border border-gray-600/50">
                      <div className="flex items-center justify-between bg-gray-900 px-3 py-1.5">
                        <span className="text-xs text-gray-400 font-mono">{lang || 'code'}</span>
                        <button onClick={() => copyToClipboard(codeLines.join('\n'), `code-${index}-${i}`)} 
                                className="text-gray-400 hover:text-white transition-colors">
                          {copiedIndex === `code-${index}-${i}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <pre className="bg-gray-950 p-3 overflow-x-auto text-xs font-mono text-green-400">
                        {codeLines.join('\n')}
                      </pre>
                    </div>
                  );
                }
                return <span key={i}>{part}</span>;
              })}
            </div>
          </div>
          {/* Message metadata */}
          <div className={`flex items-center gap-2 mt-1 px-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-gray-500">
              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
            </span>
            {msg.model && <span className="text-[10px] text-gray-600">via {msg.model}</span>}
            {msg.tokens && <span className="text-[10px] text-gray-600">{msg.tokens} tokens</span>}
            {!isUser && (
              <button onClick={() => copyToClipboard(msg.content, index)} 
                      className="text-gray-500 hover:text-white transition-colors">
                {copiedIndex === index ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
        {isUser && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    );
  };

  // ═══════════════ RENDER ═══════════════
  return (
    <div className={`flex h-full ${isFullscreen ? 'fixed inset-0 z-50' : ''} bg-gray-950`}>
      
      {/* ═══════ LEFT SIDEBAR - History & Templates ═══════ */}
      <div className="w-64 bg-gray-900/50 border-r border-gray-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-red-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">GOAT AI Studio</h2>
              <p className="text-[10px] text-gray-500">Powered by SuperNinja</p>
            </div>
          </div>
          <button onClick={() => { setMessages([]); setInput(''); }}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm transition-all">
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button onClick={() => setShowTemplates(false)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${!showTemplates ? 'text-yellow-400 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}>
            History
          </button>
          <button onClick={() => setShowTemplates(true)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${showTemplates ? 'text-yellow-400 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}>
            Templates
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {showTemplates ? (
            <div className="space-y-1">
              {PROMPT_TEMPLATES.map(template => (
                <button key={template.id}
                        onClick={() => setInput(template.prompt)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800/50 text-gray-300 text-xs transition-colors group">
                  <span className="group-hover:text-yellow-400 transition-colors">{template.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {conversationHistory.length === 0 ? (
                <p className="text-gray-600 text-xs text-center py-4">No conversations yet</p>
              ) : (
                conversationHistory.map((conv, i) => (
                  <button key={i} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800/50 text-gray-400 text-xs truncate">
                    {conv.title}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Quick Tools */}
        <div className="p-3 border-t border-gray-800">
          <p className="text-[10px] text-gray-600 mb-2 font-medium uppercase tracking-wider">Quick Tools</p>
          <div className="grid grid-cols-2 gap-1">
            {[
              { icon: <Image className="w-3.5 h-3.5" />, label: 'Images', tab: 'image' },
              { icon: <Code className="w-3.5 h-3.5" />, label: 'Code', tab: 'code' },
              { icon: <FileText className="w-3.5 h-3.5" />, label: 'Writer', tab: 'writer' },
              { icon: <Search className="w-3.5 h-3.5" />, label: 'Research', tab: 'research' },
            ].map(tool => (
              <button key={tool.tab}
                      onClick={() => setActiveTab(tool.tab)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] transition-all ${
                        activeTab === tool.tab 
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                          : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                      }`}>
                {tool.icon} {tool.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ MAIN CHAT AREA ═══════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/30">
          <div className="flex items-center gap-3">
            {/* Model Selector */}
            <div className="relative">
              <button onClick={() => setShowModelSelector(!showModelSelector)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-white transition-all">
                <span>{selectedModel.icon}</span>
                <span className="font-medium">{selectedModel.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              
              {showModelSelector && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-gray-800">
                    <p className="text-xs text-gray-500 font-medium px-2">Select AI Model</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-1">
                    {AI_MODELS.map(model => (
                      <button key={model.id}
                              onClick={() => { setSelectedModel(model); setShowModelSelector(false); }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                                selectedModel.id === model.id ? 'bg-yellow-500/20 border border-yellow-500/30' : 'hover:bg-gray-800'
                              }`}>
                        <span className="text-lg">{model.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{model.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                              model.speed === 'fast' ? 'bg-green-500/20 text-green-400' :
                              model.speed === 'instant' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-orange-500/20 text-orange-400'
                            }`}>{model.speed}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 truncate">{model.description}</p>
                        </div>
                        <span className="text-[9px] text-gray-600 uppercase">{model.provider}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active Tab Indicator */}
            <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-0.5">
              {['chat', 'image', 'code', 'writer', 'research'].map(tab => (
                <button key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                          activeTab === tab ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-500 hover:text-gray-300'
                        }`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 rounded-lg transition-all ${showSettings ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
              <Sliders className="w-4 h-4" />
            </button>
            <button onClick={exportConversation} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/20">
                <Sparkles className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">GOAT AI Studio</h3>
              <p className="text-gray-500 text-sm mb-8 max-w-md">
                Your all-in-one AI workspace. Chat, generate images, write code, research, and create — powered by the world's best AI models.
              </p>
              
              {/* Quick Start Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
                {[
                  { icon: <MessageSquare className="w-5 h-5" />, title: 'Chat', desc: 'Ask anything', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/20 text-blue-400' },
                  { icon: <Image className="w-5 h-5" />, title: 'Generate', desc: 'Create images', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/20 text-purple-400' },
                  { icon: <Code className="w-5 h-5" />, title: 'Code', desc: 'Write & debug', color: 'from-green-500/20 to-green-600/20 border-green-500/20 text-green-400' },
                  { icon: <Search className="w-5 h-5" />, title: 'Research', desc: 'Deep analysis', color: 'from-orange-500/20 to-orange-600/20 border-orange-500/20 text-orange-400' },
                ].map((card, i) => (
                  <button key={i}
                          onClick={() => setActiveTab(card.title.toLowerCase())}
                          className={`p-4 rounded-xl bg-gradient-to-br ${card.color} border hover:scale-105 transition-all text-left`}>
                    {card.icon}
                    <p className="text-sm font-semibold text-white mt-2">{card.title}</p>
                    <p className="text-[10px] text-gray-400">{card.desc}</p>
                  </button>
                ))}
              </div>

              {/* Suggested Prompts */}
              <div className="mt-8 max-w-2xl w-full">
                <p className="text-xs text-gray-600 mb-3 font-medium">Try these prompts:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    '📊 Analyze my royalty earnings across all platforms',
                    '🎵 Generate a beat production workflow guide',
                    '💻 Create a React component for a music player',
                    '🔍 Research current hip-hop streaming trends'
                  ].map((prompt, i) => (
                    <button key={i}
                            onClick={() => setInput(prompt)}
                            className="text-left px-4 py-2.5 bg-gray-800/30 hover:bg-gray-800/60 border border-gray-800 rounded-xl text-xs text-gray-400 hover:text-white transition-all">
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => renderMessage(msg, i))}
              {loading && (
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-black" />
                  </div>
                  <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader className="w-4 h-4 text-yellow-500 animate-spin" />
                      <span className="text-sm text-gray-400">
                        {selectedModel.name} is thinking...
                      </span>
                    </div>
                    {streamingText && (
                      <p className="text-sm text-gray-300 mt-2">{streamingText}</p>
                    )}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Uploaded Files Bar */}
        {uploadedFiles.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-800 bg-gray-900/30">
            <div className="flex items-center gap-2 overflow-x-auto">
              {uploadedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-800 rounded-lg text-xs text-gray-300 flex-shrink-0">
                  <FileText className="w-3 h-3 text-yellow-500" />
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button onClick={() => setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i))}
                          className="text-gray-500 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/30">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Message ${selectedModel.name}...`}
                rows={Math.min(input.split('\n').length, 6)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 resize-none text-sm"
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
                <button onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 text-gray-500 hover:text-yellow-400 transition-colors rounded-lg hover:bg-gray-700/50">
                  <Upload className="w-4 h-4" />
                </button>
                <button onClick={() => {
                          const code = getCodeExport();
                          navigator.clipboard.writeText(code);
                        }}
                        className="p-1.5 text-gray-500 hover:text-yellow-400 transition-colors rounded-lg hover:bg-gray-700/50"
                        title="Copy API code">
                  <Terminal className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-black font-bold transition-all shadow-lg shadow-yellow-500/20">
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-[10px] text-gray-600">
              {selectedModel.icon} {selectedModel.name} • Temp: {temperature} • Max: {maxTokens} tokens
            </span>
            <span className="text-[10px] text-gray-600">
              Shift+Enter for new line
            </span>
          </div>
        </div>
      </div>

      {/* ═══════ RIGHT SIDEBAR - Settings ═══════ */}
      {showSettings && (
        <div className="w-72 bg-gray-900/50 border-l border-gray-800 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-yellow-500" /> Parameters
              </h3>
              <button onClick={() => {
                setTemperature(0.7); setMaxTokens(2048); setTopP(0.95); setTopK(40);
                setFrequencyPenalty(0); setPresencePenalty(0);
              }} className="text-[10px] text-gray-500 hover:text-yellow-400 transition-colors">
                Reset
              </button>
            </div>

            {/* System Prompt */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1 block font-medium">System Prompt</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 resize-none"
              />
            </div>

            {/* Temperature */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400 font-medium">Temperature</label>
                <span className="text-xs text-yellow-400 font-mono">{temperature}</span>
              </div>
              <input type="range" min="0" max="2" step="0.1" value={temperature}
                     onChange={(e) => setTemperature(parseFloat(e.target.value))}
                     className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-yellow-500" />
              <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
                <span>Precise</span><span>Creative</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400 font-medium">Max Output Tokens</label>
                <span className="text-xs text-yellow-400 font-mono">{maxTokens}</span>
              </div>
              <input type="range" min="256" max="8192" step="256" value={maxTokens}
                     onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                     className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-yellow-500" />
            </div>

            {/* Top P */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400 font-medium">Top P</label>
                <span className="text-xs text-yellow-400 font-mono">{topP}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={topP}
                     onChange={(e) => setTopP(parseFloat(e.target.value))}
                     className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-yellow-500" />
            </div>

            {/* Top K */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400 font-medium">Top K</label>
                <span className="text-xs text-yellow-400 font-mono">{topK}</span>
              </div>
              <input type="range" min="1" max="100" step="1" value={topK}
                     onChange={(e) => setTopK(parseInt(e.target.value))}
                     className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-yellow-500" />
            </div>

            {/* Frequency Penalty */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400 font-medium">Frequency Penalty</label>
                <span className="text-xs text-yellow-400 font-mono">{frequencyPenalty}</span>
              </div>
              <input type="range" min="0" max="2" step="0.1" value={frequencyPenalty}
                     onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                     className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-yellow-500" />
            </div>

            {/* Presence Penalty */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400 font-medium">Presence Penalty</label>
                <span className="text-xs text-yellow-400 font-mono">{presencePenalty}</span>
              </div>
              <input type="range" min="0" max="2" step="0.1" value={presencePenalty}
                     onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                     className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-yellow-500" />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800 my-4"></div>

            {/* Advanced Features */}
            <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-yellow-500" /> Advanced Features
            </h4>

            {/* Grounding */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                  <Globe className="w-3 h-3" /> Web Grounding
                </label>
                <p className="text-[9px] text-gray-600">Search-backed answers</p>
              </div>
              <button onClick={() => setEnableGrounding(!enableGrounding)}
                      className={`w-9 h-5 rounded-full transition-all ${enableGrounding ? 'bg-yellow-500' : 'bg-gray-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${enableGrounding ? 'translate-x-4.5 ml-[18px]' : 'ml-0.5'}`} />
              </button>
            </div>

            {/* Code Execution */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                  <Terminal className="w-3 h-3" /> Code Execution
                </label>
                <p className="text-[9px] text-gray-600">Run code in sandbox</p>
              </div>
              <button onClick={() => setEnableCodeExecution(!enableCodeExecution)}
                      className={`w-9 h-5 rounded-full transition-all ${enableCodeExecution ? 'bg-yellow-500' : 'bg-gray-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${enableCodeExecution ? 'translate-x-4.5 ml-[18px]' : 'ml-0.5'}`} />
              </button>
            </div>

            {/* Structured Output */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                  <Database className="w-3 h-3" /> Structured Output
                </label>
                <p className="text-[9px] text-gray-600">JSON schema output</p>
              </div>
              <button onClick={() => setStructuredOutput(!structuredOutput)}
                      className={`w-9 h-5 rounded-full transition-all ${structuredOutput ? 'bg-yellow-500' : 'bg-gray-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${structuredOutput ? 'translate-x-4.5 ml-[18px]' : 'ml-0.5'}`} />
              </button>
            </div>

            {/* Output Format */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1 block font-medium">Output Format</label>
              <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-yellow-500/50">
                <option value="text">Plain Text</option>
                <option value="markdown">Markdown</option>
                <option value="json">JSON</option>
                <option value="html">HTML</option>
                <option value="code">Code</option>
              </select>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800 my-4"></div>

            {/* Code Export */}
            <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
              <Code className="w-3.5 h-3.5 text-yellow-500" /> Get Code
            </h4>
            <button onClick={() => {
                      const code = getCodeExport();
                      navigator.clipboard.writeText(code);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-300 hover:text-white transition-all">
              <Copy className="w-3.5 h-3.5" /> Copy API Code
            </button>

            {/* Model Info */}
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{selectedModel.icon}</span>
                <div>
                  <p className="text-xs font-medium text-white">{selectedModel.name}</p>
                  <p className="text-[9px] text-gray-500">{selectedModel.provider}</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400">{selectedModel.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  selectedModel.speed === 'fast' ? 'bg-green-500/20 text-green-400' :
                  selectedModel.speed === 'instant' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>⚡ {selectedModel.speed}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  selectedModel.quality === 'highest' ? 'bg-purple-500/20 text-purple-400' :
                  selectedModel.quality === 'high' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>✨ {selectedModel.quality}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close model selector */}
      {showModelSelector && (
        <div className="fixed inset-0 z-40" onClick={() => setShowModelSelector(false)} />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #eab308;
          cursor: pointer;
          border: 2px solid #1f2937;
        }
      `}</style>
    </div>
  );
}