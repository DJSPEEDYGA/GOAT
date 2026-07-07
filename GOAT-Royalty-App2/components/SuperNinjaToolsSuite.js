/**
 * SuperNinja Tools Suite - All-in-One AI Tools Hub
 * Image Generation, Code Generator, AI Writer, Research Agent, File Analyzer
 */

import React, { useState } from 'react';
import {
  Sparkles, Image, Code, FileText, Search, Upload, Brain,
  Wand2, Palette, Terminal, BookOpen, Globe, Shield, Zap,
  Camera, Mic, Film, Music, BarChart3, Database, GitBranch,
  Cpu, Lock, Eye, Layers, Target, Rocket, Star, PenTool,
  MessageSquare, Bot, ChevronRight, ExternalLink, ArrowRight
} from 'lucide-react';

const TOOLS = [
  {
    id: 'ai-studio',
    name: 'AI Studio',
    description: 'Google AI Studio-style workspace with multi-model support, parameter tuning, and code export',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-yellow-500 to-orange-500',
    borderColor: 'border-yellow-500/30',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-400',
    href: '/ai-studio',
    features: ['Multi-Model Chat', 'Parameter Controls', 'Code Export', 'Structured Output'],
    badge: 'NEW'
  },
  {
    id: 'image-studio',
    name: 'AI Image Studio',
    description: 'Generate and edit images with AI. Album art, social media, brand assets, and more',
    icon: <Image className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    href: '/ai-image-studio',
    features: ['Text-to-Image', 'Image Editing', 'Style Transfer', 'Batch Generation'],
    badge: 'NEW'
  },
  {
    id: 'code-generator',
    name: 'AI Code Generator',
    description: 'Write, debug, and refactor code in any language. Full syntax highlighting and execution',
    icon: <Code className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-400',
    href: '/ai-code',
    features: ['Multi-Language', 'Debug & Fix', 'Code Review', 'Documentation'],
    badge: 'NEW'
  },
  {
    id: 'ai-writer',
    name: 'AI Writer',
    description: 'Draft and refine professional content. Press releases, blogs, emails, and marketing copy',
    icon: <PenTool className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    href: '/ai-writer',
    features: ['Templates', 'Tone Control', 'SEO Optimization', 'Multi-Format'],
    badge: 'NEW'
  },
  {
    id: 'research-agent',
    name: 'AI Research Agent',
    description: 'Deep research with multi-source analysis, citations, and comprehensive reports',
    icon: <Search className="w-6 h-6" />,
    color: 'from-orange-500 to-red-500',
    borderColor: 'border-orange-500/30',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-400',
    href: '/ai-research',
    features: ['Multi-Source', 'Citations', 'Trend Analysis', 'Reports'],
    badge: 'NEW'
  },
  {
    id: 'deep-research',
    name: 'Deep Research',
    description: 'In-depth analysis and planning with grounded search, fact-checking, and structured insights',
    icon: <Brain className="w-6 h-6" />,
    color: 'from-indigo-500 to-violet-500',
    borderColor: 'border-indigo-500/30',
    bgColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-400',
    href: '/deep-research',
    features: ['Web Grounding', 'Fact-Check', 'Planning', 'Analysis'],
    badge: 'NEW'
  },
  {
    id: 'file-analyzer',
    name: 'File Upload & Analysis',
    description: 'Upload and analyze documents, spreadsheets, images, and data files with AI',
    icon: <Upload className="w-6 h-6" />,
    color: 'from-teal-500 to-green-500',
    borderColor: 'border-teal-500/30',
    bgColor: 'bg-teal-500/10',
    textColor: 'text-teal-400',
    href: '/ai-studio',
    features: ['PDF Analysis', 'Data Extraction', 'Image OCR', 'Summarization'],
    badge: 'NEW'
  },
  {
    id: 'prompt-tools',
    name: 'Prompt Tools',
    description: 'Templates, prompt optimization, and prompt engineering tools for better AI results',
    icon: <Target className="w-6 h-6" />,
    color: 'from-rose-500 to-pink-500',
    borderColor: 'border-rose-500/30',
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-400',
    href: '/ai-studio',
    features: ['Templates', 'Optimization', 'A/B Testing', 'History'],
    badge: 'NEW'
  }
];

const EXISTING_TOOLS = [
  { name: 'Gemini AI Copilot', href: '/super-goat-command', icon: <Bot className="w-5 h-5" />, color: 'text-yellow-400' },
  { name: 'Super Ninja Panel', href: '/super-ninja-dashboard', icon: <Shield className="w-5 h-5" />, color: 'text-red-400' },
  { name: 'OpenClaw Studio', href: '/openclaw', icon: <Terminal className="w-5 h-5" />, color: 'text-green-400' },
  { name: 'Sora AI Studio', href: '/sora-ai-studio', icon: <Film className="w-5 h-5" />, color: 'text-purple-400' },
  { name: 'Cyber Warrior', href: '/cyber-warrior', icon: <Shield className="w-5 h-5" />, color: 'text-red-400' },
  { name: 'Codex 008', href: '/codex-008', icon: <Cpu className="w-5 h-5" />, color: 'text-blue-400' },
  { name: 'Voice Studio', href: '/voice-studio', icon: <Mic className="w-5 h-5" />, color: 'text-pink-400' },
  { name: 'Animation Studio', href: '/animation-studio', icon: <Film className="w-5 h-5" />, color: 'text-orange-400' },
];

export default function SuperNinjaToolsSuite() {
  const [hoveredTool, setHoveredTool] = useState(null);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[120px]" />
        
        <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-medium text-yellow-400">SuperNinja AI × Google AI Studio</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                AI Tools Suite
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Every AI tool you need in one place. Generate images, write code, research, create content, 
              and analyze files — powered by the world's best AI models.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-8 mb-12">
            {[
              { label: 'AI Models', value: '8+' },
              { label: 'Tools', value: '16+' },
              { label: 'Templates', value: '50+' },
              { label: 'Integrations', value: '100+' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New AI Tools Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-yellow-500" />
          New AI-Powered Tools
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOOLS.map(tool => (
            <a key={tool.id}
               href={tool.href}
               onMouseEnter={() => setHoveredTool(tool.id)}
               onMouseLeave={() => setHoveredTool(null)}
               className={`group relative p-5 rounded-2xl border ${tool.borderColor} ${tool.bgColor} hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden`}>
              
              {/* Badge */}
              {tool.badge && (
                <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 bg-yellow-500 text-black rounded-full">
                  {tool.badge}
                </span>
              )}

              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 text-white shadow-lg`}>
                {tool.icon}
              </div>

              {/* Content */}
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">
                {tool.name}
              </h3>
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">{tool.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {tool.features.map((feature, i) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 bg-gray-800/50 border border-gray-700/50 rounded-full text-gray-400">
                    {feature}
                  </span>
                ))}
              </div>

              {/* Arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight className={`w-4 h-4 ${tool.textColor}`} />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Existing Tools */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-yellow-500" />
          Existing Platform Tools
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {EXISTING_TOOLS.map((tool, i) => (
            <a key={i}
               href={tool.href}
               className="flex items-center gap-3 p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:bg-gray-800/50 hover:border-gray-700 transition-all group">
              <div className={tool.color}>{tool.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-yellow-400 transition-colors">{tool.name}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-yellow-400 transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {/* Multi-Model Section */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Multiple AI Models, One Platform</h2>
            <p className="text-gray-400 text-sm">Access the world's best AI models without multiple subscriptions</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Gemini 2.0', provider: 'Google', icon: '🔮', color: 'border-blue-500/30 bg-blue-500/10' },
              { name: 'GPT-4o', provider: 'OpenAI', icon: '🧠', color: 'border-green-500/30 bg-green-500/10' },
              { name: 'Claude 3', provider: 'Anthropic', icon: '🎭', color: 'border-purple-500/30 bg-purple-500/10' },
              { name: 'DeepSeek V3', provider: 'DeepSeek', icon: '🌊', color: 'border-cyan-500/30 bg-cyan-500/10' },
              { name: 'FLUX', provider: 'Image Gen', icon: '🎨', color: 'border-pink-500/30 bg-pink-500/10' },
              { name: 'Whisper', provider: 'Audio', icon: '🎤', color: 'border-orange-500/30 bg-orange-500/10' },
              { name: 'DALL-E 3', provider: 'OpenAI', icon: '🖼️', color: 'border-yellow-500/30 bg-yellow-500/10' },
              { name: 'Super GOAT', provider: 'Local', icon: '🐐', color: 'border-red-500/30 bg-red-500/10' },
            ].map((model, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${model.color}`}>
                <span className="text-2xl">{model.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{model.name}</p>
                  <p className="text-[10px] text-gray-500">{model.provider}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}