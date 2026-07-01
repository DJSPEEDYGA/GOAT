/**
 * GOAT Royalty App — Avatar Studio
 * D-ID, MetaHuman, DAZ3D avatar creation and animation system
 * Includes Money Penny animated assistant concept
 */

import React, { useState } from 'react';
import {
  User, Camera, Wand2, Sparkles, Play, Pause, Download,
  Upload, Settings, Palette, Layers, Move, RotateCcw,
  Mic, Volume2, Eye, Smile, Frown, Meh, Zap, Crown,
  Monitor, Smartphone, Globe, Image, Video, Film,
  RefreshCw, CheckCircle, Star, Shield, ExternalLink,
  ChevronDown, ChevronUp, ArrowRight, Package, Cpu
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// AVATAR ENGINES
// ═══════════════════════════════════════════════════════════════════

const AVATAR_ENGINES = {
  did: {
    id: 'did',
    name: 'D-ID',
    icon: '🎭',
    color: '#7c3aed',
    description: 'AI-powered talking avatars from photos',
    features: ['Photo to Avatar', 'Text-to-Speech', 'Lip Sync', 'Real-time Streaming', 'Multi-Language'],
    pricing: 'API Credits',
    status: 'connected',
    apiEndpoint: 'https://api.d-id.com',
    capabilities: {
      photoAnimation: true,
      voiceCloning: true,
      lipSync: true,
      emotionControl: true,
      realTimeStreaming: true,
      multiLanguage: true,
    }
  },
  metahuman: {
    id: 'metahuman',
    name: 'MetaHuman (UE5)',
    icon: '🧑‍🎤',
    color: '#0ea5e9',
    description: 'Photorealistic digital humans for Unreal Engine',
    features: ['Photorealistic', 'Full Body', 'Motion Capture', 'Facial Animation', 'Real-time'],
    pricing: 'Free (with UE5)',
    status: 'available',
    apiEndpoint: 'Unreal Engine Plugin',
    capabilities: {
      fullBody: true,
      facialCapture: true,
      motionCapture: true,
      clothSimulation: true,
      hairSimulation: true,
      realTimeRendering: true,
    }
  },
  daz3d: {
    id: 'daz3d',
    name: 'DAZ 3D',
    icon: '🎨',
    color: '#ef4444',
    description: '3D character creation and posing studio',
    features: ['Character Creator', 'Morphs', 'Clothing', 'Hair', 'Environments', 'Rendering'],
    pricing: 'Free + Marketplace',
    status: 'available',
    apiEndpoint: 'DAZ Studio Plugin',
    capabilities: {
      characterCreation: true,
      morphing: true,
      clothing: true,
      hairSystem: true,
      environments: true,
      irayRendering: true,
    }
  },
  readyPlayerMe: {
    id: 'readyPlayerMe',
    name: 'Ready Player Me',
    icon: '🕹️',
    color: '#10b981',
    description: 'Cross-platform avatar system for web & gaming',
    features: ['Selfie to Avatar', 'Cross-Platform', 'VR/AR Ready', 'Customization', 'Web Embed'],
    pricing: 'Free Tier Available',
    status: 'available',
    apiEndpoint: 'https://api.readyplayer.me',
    capabilities: {
      selfieToAvatar: true,
      crossPlatform: true,
      vrReady: true,
      arReady: true,
      webEmbed: true,
      customization: true,
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
// MONEY PENNY AVATAR CONFIG
// ═══════════════════════════════════════════════════════════════════

const MONEY_PENNY = {
  name: 'Money Penny',
  role: 'Executive AI Avatar Assistant',
  description: 'Your Marvel-style animated AI assistant with voice interaction, financial insights, and executive management capabilities.',
  avatar: '💎',
  styles: [
    { id: 'marvel', name: 'Marvel Superhero', description: 'Comic book style with dynamic poses', color: '#ef4444' },
    { id: 'anime', name: 'Anime', description: 'Japanese animation style', color: '#7c3aed' },
    { id: 'realistic', name: 'Photorealistic', description: 'Lifelike D-ID animated avatar', color: '#0ea5e9' },
    { id: 'pixar', name: 'Pixar/3D', description: '3D animated cartoon style', color: '#f59e0b' },
    { id: 'cyberpunk', name: 'Cyberpunk', description: 'Futuristic neon-lit aesthetic', color: '#ec4899' },
    { id: 'retro', name: 'Retro Comic', description: 'Vintage comic book aesthetic', color: '#10b981' },
  ],
  voices: [
    { id: 'confident', name: 'Confident Executive', pitch: 'medium', speed: 'normal' },
    { id: 'friendly', name: 'Friendly Assistant', pitch: 'medium-high', speed: 'slightly-fast' },
    { id: 'professional', name: 'Corporate Professional', pitch: 'low-medium', speed: 'measured' },
    { id: 'energetic', name: 'Energetic Creative', pitch: 'high', speed: 'fast' },
  ],
  expressions: ['neutral', 'happy', 'thinking', 'surprised', 'determined', 'playful'],
  capabilities: [
    'Voice-activated financial reports',
    'Real-time royalty dashboard narration',
    'Contract review explanations',
    'Meeting scheduling & reminders',
    'Music industry news briefings',
    'Motivational check-ins',
  ],
};

// ═══════════════════════════════════════════════════════════════════
// PRESET AVATARS
// ═══════════════════════════════════════════════════════════════════

const PRESET_AVATARS = [
  { id: 1, name: 'DJ Speedy Avatar', style: 'Photorealistic', engine: 'D-ID', status: 'ready', thumbnail: '🎧' },
  { id: 2, name: 'Money Penny', style: 'Marvel Superhero', engine: 'DAZ 3D', status: 'ready', thumbnail: '💎' },
  { id: 3, name: 'GOAT Mascot', style: 'Cartoon', engine: 'Ready Player Me', status: 'ready', thumbnail: '🐐' },
  { id: 4, name: 'Stage Performer', style: 'MetaHuman', engine: 'MetaHuman', status: 'rendering', thumbnail: '🎤' },
  { id: 5, name: 'Studio Assistant', style: 'Anime', engine: 'DAZ 3D', status: 'draft', thumbnail: '🎹' },
];

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function AvatarStudio() {
  const [activeTab, setActiveTab] = useState('engines');
  const [selectedEngine, setSelectedEngine] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('marvel');
  const [selectedVoice, setSelectedVoice] = useState('confident');
  const [selectedExpression, setSelectedExpression] = useState('neutral');
  const [isAnimating, setIsAnimating] = useState(false);
  const [textToSpeak, setTextToSpeak] = useState('');

  const startAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-900 via-purple-800 to-fuchsia-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Avatar Studio</h1>
              <p className="text-purple-200 mt-1">Create, animate & deploy AI-powered avatars</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{Object.keys(AVATAR_ENGINES).length}</p>
              <p className="text-xs text-purple-200">Avatar Engines</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{PRESET_AVATARS.length}</p>
              <p className="text-xs text-purple-200">Created Avatars</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{MONEY_PENNY.styles.length}</p>
              <p className="text-xs text-purple-200">Art Styles</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{MONEY_PENNY.voices.length}</p>
              <p className="text-xs text-purple-200">Voice Options</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'engines', label: 'Avatar Engines', icon: <Cpu size={16} /> },
            { id: 'moneypenny', label: 'Money Penny', icon: <Crown size={16} /> },
            { id: 'gallery', label: 'My Avatars', icon: <Layers size={16} /> },
            { id: 'create', label: 'Create New', icon: <Wand2 size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Avatar Engines Tab */}
        {activeTab === 'engines' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(AVATAR_ENGINES).map(engine => (
              <div key={engine.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{engine.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg">{engine.name}</h3>
                        <p className="text-xs text-gray-500">{engine.pricing}</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-semibold ${
                      engine.status === 'connected' ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      <CheckCircle size={12} /> {engine.status === 'connected' ? 'Connected' : 'Available'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{engine.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {engine.features.map((f, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-full" style={{ background: `${engine.color}15`, color: engine.color }}>
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Capabilities */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {Object.entries(engine.capabilities).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        {val ? <CheckCircle size={12} className="text-green-500" /> : <span className="w-3 h-3 rounded-full bg-gray-300" />}
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full py-2 rounded-lg text-sm font-bold text-white transition-colors"
                    style={{ background: engine.color }}
                  >
                    {engine.status === 'connected' ? 'Open Studio' : `Connect ${engine.name}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Money Penny Tab */}
        {activeTab === 'moneypenny' && (
          <div className="space-y-6">
            {/* Money Penny Hero */}
            <div className="bg-gradient-to-br from-purple-900 via-fuchsia-800 to-pink-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-[200px] opacity-10 leading-none">💎</div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-6xl">{MONEY_PENNY.avatar}</div>
                  <div>
                    <h2 className="text-3xl font-black">{MONEY_PENNY.name}</h2>
                    <p className="text-purple-200">{MONEY_PENNY.role}</p>
                  </div>
                </div>
                <p className="text-lg text-purple-100 max-w-2xl">{MONEY_PENNY.description}</p>

                {/* Capabilities */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                  {MONEY_PENNY.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                      <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Style Selection */}
            <div>
              <h3 className="text-lg font-bold mb-4">Choose Art Style</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {MONEY_PENNY.styles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedStyle === style.id
                        ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2" style={{ color: style.color }}>
                      {style.id === 'marvel' && '🦸‍♀️'}
                      {style.id === 'anime' && '🎌'}
                      {style.id === 'realistic' && '📸'}
                      {style.id === 'pixar' && '🎬'}
                      {style.id === 'cyberpunk' && '🌆'}
                      {style.id === 'retro' && '📰'}
                    </div>
                    <h4 className="font-bold text-sm">{style.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selection */}
            <div>
              <h3 className="text-lg font-bold mb-4">Voice Profile</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MONEY_PENNY.voices.map(voice => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedVoice === voice.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Volume2 size={20} className={selectedVoice === voice.id ? 'text-purple-500' : 'text-gray-400'} />
                    <h4 className="font-bold text-sm mt-2">{voice.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">Pitch: {voice.pitch}</p>
                    <p className="text-xs text-gray-500">Speed: {voice.speed}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Expression Control */}
            <div>
              <h3 className="text-lg font-bold mb-4">Expression</h3>
              <div className="flex gap-3">
                {MONEY_PENNY.expressions.map(expr => (
                  <button
                    key={expr}
                    onClick={() => setSelectedExpression(expr)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      selectedExpression === expr
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {expr === 'neutral' && '😐'} {expr === 'happy' && '😊'} {expr === 'thinking' && '🤔'}
                    {expr === 'surprised' && '😲'} {expr === 'determined' && '😤'} {expr === 'playful' && '😜'}
                    {' '}{expr}
                  </button>
                ))}
              </div>
            </div>

            {/* Text-to-Speech Test */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-lg mb-4">🗣️ Test Money Penny's Voice</h3>
              <textarea
                value={textToSpeak}
                onChange={e => setTextToSpeak(e.target.value)}
                placeholder="Type what you want Money Penny to say..."
                className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={startAnimation}
                  disabled={isAnimating}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isAnimating ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
                  {isAnimating ? 'Animating...' : 'Animate & Speak'}
                </button>
                <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Download size={16} /> Export Video
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">My Avatars</h2>
              <button onClick={() => setActiveTab('create')} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700">
                <Wand2 size={14} /> Create New
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PRESET_AVATARS.map(avatar => (
                <div key={avatar.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all">
                  <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                    <span className="text-8xl">{avatar.thumbnail}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">{avatar.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        avatar.status === 'ready' ? 'bg-green-100 text-green-600' :
                        avatar.status === 'rendering' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {avatar.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{avatar.style} • {avatar.engine}</p>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold">
                        <Play size={12} className="inline mr-1" /> Animate
                      </button>
                      <button className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-xs">
                        <Settings size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create New Tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-center">Create New Avatar</h2>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Avatar Name</label>
                <input type="text" placeholder="Enter avatar name..." className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Engine</label>
                <select className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm">
                  {Object.values(AVATAR_ENGINES).map(e => (
                    <option key={e.id} value={e.id}>{e.icon} {e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Source Image</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-colors">
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Drop an image or click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Realistic', 'Cartoon', 'Anime', 'Marvel', 'Cyberpunk', 'Classic'].map(style => (
                    <button key={style} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold hover:border-purple-500 transition-colors">
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all">
                <Wand2 size={18} className="inline mr-2" /> Generate Avatar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}