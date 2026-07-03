/**
 * GOAT Royalty App — DAW Integration Hub
 * Complete Digital Audio Workstation integration system
 * 
 * Supports: Logic Pro, Ableton Live, FL Studio, Pro Tools, Cubase,
 * Akai MPC, Waves, Native Instruments, iZotope, Antares
 */

import React, { useState, useEffect } from 'react';
import { 
  Music, Settings, Link2, CheckCircle, XCircle, RefreshCw, 
  Download, Upload, Sliders, Headphones, Mic, Piano, 
  Disc, Volume2, Wand2, Zap, Monitor, Cpu, ArrowRight,
  Play, Pause, SkipForward, SkipBack, Clock, FileAudio,
  Layers, Package, Star, Shield, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// DAW CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════

const DAWS = {
  logicPro: {
    id: 'logicPro',
    name: 'Logic Pro',
    version: '11.1',
    icon: '🎹',
    color: '#1a1a2e',
    accent: '#6366f1',
    developer: 'Apple',
    platform: 'macOS',
    description: 'Professional music production and MIDI sequencing',
    features: ['MIDI Editing', 'Audio Recording', 'Mixing', 'Mastering', 'Spatial Audio', 'Dolby Atmos'],
    fileFormats: ['.logicx', '.aif', '.wav', '.mp3', '.caf'],
    pluginFormats: ['AU', 'AUv3'],
    apiEndpoint: '/api/daw/logic-pro',
    connectionType: 'OSC/MIDI',
    status: 'available',
    integrations: {
      midiExport: true,
      stemExport: true,
      projectSync: true,
      remoteControl: true,
      dolbyAtmos: true,
      spatialAudio: true,
    }
  },
  abletonLive: {
    id: 'abletonLive',
    name: 'Ableton Live',
    version: '12 Suite',
    icon: '🎛️',
    color: '#1a1a1a',
    accent: '#00d4aa',
    developer: 'Ableton',
    platform: 'macOS / Windows',
    description: 'Live performance and electronic music production',
    features: ['Session View', 'Arrangement View', 'Max for Live', 'Wavetable', 'Push Integration'],
    fileFormats: ['.als', '.alc', '.adg', '.wav', '.aif'],
    pluginFormats: ['VST2', 'VST3', 'AU', 'Max4Live'],
    apiEndpoint: '/api/daw/ableton',
    connectionType: 'Link/MIDI/OSC',
    status: 'available',
    integrations: {
      abletonLink: true,
      maxForLive: true,
      pushController: true,
      clipExport: true,
      midiExport: true,
      stemExport: true,
    }
  },
  flStudio: {
    id: 'flStudio',
    name: 'FL Studio',
    version: '2024',
    icon: '🍊',
    color: '#2d2d2d',
    accent: '#ff6b00',
    developer: 'Image-Line',
    platform: 'Windows / macOS',
    description: 'Beat-making powerhouse with legendary step sequencer',
    features: ['Step Sequencer', 'Piano Roll', 'Mixer', 'Playlist', 'Edison', 'Harmor'],
    fileFormats: ['.flp', '.wav', '.mp3', '.ogg', '.mid'],
    pluginFormats: ['VST2', 'VST3', 'AU'],
    apiEndpoint: '/api/daw/fl-studio',
    connectionType: 'MIDI/Link',
    status: 'available',
    integrations: {
      midiExport: true,
      stemExport: true,
      patternExport: true,
      scoreExport: true,
      projectSync: false,
    }
  },
  proTools: {
    id: 'proTools',
    name: 'Pro Tools',
    version: '2024.6',
    icon: '🎚️',
    color: '#1c1c2e',
    accent: '#7c3aed',
    developer: 'Avid',
    platform: 'macOS / Windows',
    description: 'Industry-standard recording and mixing platform',
    features: ['HDX Hardware', 'Cloud Collaboration', 'Dolby Atmos', 'HEAT', 'Advanced Automation'],
    fileFormats: ['.ptx', '.ptf', '.wav', '.aif', '.mp3'],
    pluginFormats: ['AAX', 'AAX DSP', 'AudioSuite'],
    apiEndpoint: '/api/daw/pro-tools',
    connectionType: 'EUCON/MIDI',
    status: 'available',
    integrations: {
      avidCloud: true,
      euconControl: true,
      dolbyAtmos: true,
      stemExport: true,
      omfAafExchange: true,
      satelliteLink: true,
    }
  },
  cubase: {
    id: 'cubase',
    name: 'Cubase Pro',
    version: '14',
    icon: '🎼',
    color: '#1a2332',
    accent: '#e11d48',
    developer: 'Steinberg / Yamaha',
    platform: 'macOS / Windows',
    description: 'Composition, recording, mixing and editing',
    features: ['Score Editor', 'VariAudio', 'Chord Track', 'MixConsole', 'Control Room'],
    fileFormats: ['.cpr', '.wav', '.aif', '.mid', '.xml'],
    pluginFormats: ['VST2', 'VST3'],
    apiEndpoint: '/api/daw/cubase',
    connectionType: 'MIDI/VST Connect',
    status: 'available',
    integrations: {
      vstConnect: true,
      midiExport: true,
      scoreExport: true,
      stemExport: true,
      musicXml: true,
      variAudio: true,
    }
  },
  akaiMPC: {
    id: 'akaiMPC',
    name: 'Akai MPC',
    version: 'MPC Software 2.14',
    icon: '🥁',
    color: '#1a1a1a',
    accent: '#ef4444',
    developer: 'Akai Professional / inMusic',
    platform: 'Standalone / macOS / Windows',
    description: 'Legendary beat-making and sampling workstation',
    features: ['16-Level Pads', 'Sampling', 'Drum Programs', 'Plugin Mode', 'Standalone'],
    fileFormats: ['.xpj', '.pgm', '.wav', '.snd', '.mid'],
    pluginFormats: ['VST2', 'AU', 'Standalone'],
    apiEndpoint: '/api/daw/akai-mpc',
    connectionType: 'MIDI/USB',
    status: 'available',
    integrations: {
      sampleImport: true,
      drumPrograms: true,
      midiExport: true,
      stemExport: true,
      standaloneSync: true,
      ableton_export: true,
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
// PLUGIN ECOSYSTEMS
// ═══════════════════════════════════════════════════════════════════

const PLUGIN_ECOSYSTEMS = {
  waves: {
    id: 'waves',
    name: 'Waves Audio',
    icon: '🌊',
    color: '#0ea5e9',
    pluginCount: 200,
    categories: ['Mixing', 'Mastering', 'Vocal', 'Guitar', 'Live Sound'],
    featured: ['SSL E-Channel', 'CLA-2A', 'L2 Ultramaximizer', 'H-Delay', 'Renaissance Reverb', 'Vocal Rider'],
    formats: ['VST', 'VST3', 'AU', 'AAX', 'SoundGrid'],
    subscription: 'Waves Creative Access',
    status: 'connected',
  },
  nativeInstruments: {
    id: 'nativeInstruments',
    name: 'Native Instruments',
    icon: '🎹',
    color: '#f97316',
    pluginCount: 150,
    categories: ['Synths', 'Samplers', 'Effects', 'DJ', 'Drums'],
    featured: ['Kontakt 7', 'Massive X', 'Battery 4', 'Guitar Rig 7', 'Reaktor 6', 'Maschine'],
    formats: ['VST', 'VST3', 'AU', 'AAX', 'Standalone'],
    subscription: 'Komplete',
    status: 'connected',
  },
  izotope: {
    id: 'izotope',
    name: 'iZotope',
    icon: '✨',
    color: '#8b5cf6',
    pluginCount: 30,
    categories: ['Mixing', 'Mastering', 'Repair', 'Vocal', 'Creative'],
    featured: ['Ozone 11', 'Neutron 4', 'RX 11', 'Nectar 4', 'VocalSynth 2', 'Trash'],
    formats: ['VST', 'VST3', 'AU', 'AAX'],
    subscription: 'Music Production Suite',
    status: 'connected',
  },
  antares: {
    id: 'antares',
    name: 'Antares Audio',
    icon: '🎤',
    color: '#ec4899',
    pluginCount: 20,
    categories: ['Vocal', 'Pitch Correction', 'Harmony', 'Effects'],
    featured: ['Auto-Tune Pro X', 'Auto-Tune Access', 'Harmony Engine', 'AVOX', 'Mic Mod', 'Choir'],
    formats: ['VST', 'VST3', 'AU', 'AAX'],
    subscription: 'Auto-Tune Unlimited',
    status: 'connected',
  },
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function DAWIntegrationHub() {
  const [activeTab, setActiveTab] = useState('daws');
  const [selectedDAW, setSelectedDAW] = useState(null);
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [syncingDAW, setSyncingDAW] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [expandedDAW, setExpandedDAW] = useState(null);

  // Initialize connection statuses
  useEffect(() => {
    const statuses = {};
    Object.keys(DAWS).forEach(key => {
      statuses[key] = { connected: false, lastSync: null, projects: 0 };
    });
    setConnectionStatus(statuses);

    // Simulate recent projects
    setRecentProjects([
      { id: 1, name: 'Summer Vibes Beat', daw: 'flStudio', modified: '2 hours ago', bpm: 140, key: 'Am' },
      { id: 2, name: 'Trap Symphony', daw: 'logicPro', modified: '5 hours ago', bpm: 145, key: 'Cm' },
      { id: 3, name: 'Soul Sample Pack', daw: 'akaiMPC', modified: '1 day ago', bpm: 90, key: 'Eb' },
      { id: 4, name: 'EDM Festival Mix', daw: 'abletonLive', modified: '2 days ago', bpm: 128, key: 'F' },
      { id: 5, name: 'Film Score Draft', daw: 'cubase', modified: '3 days ago', bpm: 72, key: 'Dm' },
      { id: 6, name: 'Vocal Session Master', daw: 'proTools', modified: '4 days ago', bpm: 100, key: 'G' },
    ]);
  }, []);

  // Connect to DAW
  const connectDAW = async (dawId) => {
    setSyncingDAW(dawId);
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConnectionStatus(prev => ({
      ...prev,
      [dawId]: { connected: true, lastSync: new Date().toISOString(), projects: Math.floor(Math.random() * 50) + 5 }
    }));
    setSyncingDAW(null);
  };

  // Disconnect DAW
  const disconnectDAW = (dawId) => {
    setConnectionStatus(prev => ({
      ...prev,
      [dawId]: { connected: false, lastSync: null, projects: 0 }
    }));
  };

  // ═══════════════════════════════════════════════════════════════════
  // DAW CARD
  // ═══════════════════════════════════════════════════════════════════
  const DAWCard = ({ daw }) => {
    const status = connectionStatus[daw.id] || {};
    const isExpanded = expandedDAW === daw.id;
    const isSyncing = syncingDAW === daw.id;

    return (
      <div 
        className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl"
        style={{ borderColor: status.connected ? daw.accent : undefined }}
      >
        {/* Header */}
        <div 
          className="p-5 cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${daw.color}, ${daw.color}dd)` }}
          onClick={() => setExpandedDAW(isExpanded ? null : daw.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{daw.icon}</span>
              <div>
                <h3 className="text-white font-bold text-lg">{daw.name}</h3>
                <p className="text-gray-400 text-xs">{daw.developer} • v{daw.version}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {status.connected ? (
                <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                  <CheckCircle size={14} /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-500 text-xs">
                  <XCircle size={14} /> Disconnected
                </span>
              )}
              {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>
          </div>
          <p className="text-gray-300 text-sm mt-2">{daw.description}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full">{daw.platform}</span>
            <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full">{daw.connectionType}</span>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-5 bg-white dark:bg-gray-900 space-y-4">
            {/* Features */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Features</h4>
              <div className="flex flex-wrap gap-2">
                {daw.features.map((feature, idx) => (
                  <span key={idx} className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* File Formats */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Supported Formats</h4>
              <div className="flex flex-wrap gap-2">
                {daw.fileFormats.map((format, idx) => (
                  <code key={idx} className="text-xs px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-mono">
                    {format}
                  </code>
                ))}
              </div>
            </div>

            {/* Plugin Formats */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Plugin Formats</h4>
              <div className="flex flex-wrap gap-2">
                {daw.pluginFormats.map((format, idx) => (
                  <span key={idx} className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: `${daw.accent}20`, color: daw.accent }}>
                    {format}
                  </span>
                ))}
              </div>
            </div>

            {/* Integration Capabilities */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Integration Capabilities</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(daw.integrations).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    {value ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <XCircle size={14} className="text-gray-400" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connection Button */}
            <div className="pt-2 flex gap-3">
              {status.connected ? (
                <>
                  <button
                    onClick={() => connectDAW(daw.id)}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    style={{ background: `${daw.accent}20`, color: daw.accent }}
                  >
                    {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                  <button
                    onClick={() => disconnectDAW(daw.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <XCircle size={14} /> Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => connectDAW(daw.id)}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                  style={{ background: daw.accent }}
                >
                  {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Link2 size={14} />}
                  {isSyncing ? 'Connecting...' : `Connect to ${daw.name}`}
                </button>
              )}
            </div>

            {/* Connection Info */}
            {status.connected && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-sm">
                <p className="text-green-700 dark:text-green-300 font-semibold">✅ Connected</p>
                <p className="text-green-600 dark:text-green-400 text-xs mt-1">
                  {status.projects} projects synced • Last sync: {status.lastSync ? new Date(status.lastSync).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // PLUGIN ECOSYSTEM CARD
  // ═══════════════════════════════════════════════════════════════════
  const PluginCard = ({ plugin }) => (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{plugin.icon}</span>
            <div>
              <h3 className="font-bold text-lg">{plugin.name}</h3>
              <p className="text-xs text-gray-500">{plugin.pluginCount}+ plugins • {plugin.subscription}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-green-500 text-xs font-semibold">
            <CheckCircle size={14} /> Active
          </span>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {plugin.categories.map((cat, idx) => (
            <span key={idx} className="text-xs px-3 py-1 rounded-full" style={{ background: `${plugin.color}15`, color: plugin.color }}>
              {cat}
            </span>
          ))}
        </div>

        {/* Featured Plugins */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Featured Plugins</h4>
          <div className="grid grid-cols-2 gap-2">
            {plugin.featured.map((name, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                <Star size={12} style={{ color: plugin.color }} />
                <span className="truncate">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formats */}
        <div className="flex flex-wrap gap-2 mb-4">
          {plugin.formats.map((format, idx) => (
            <code key={idx} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 font-mono">
              {format}
            </code>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: plugin.color }}>
            <Sliders size={14} /> Manage Plugins
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════
  // RECENT PROJECTS
  // ═══════════════════════════════════════════════════════════════════
  const RecentProjectCard = ({ project }) => {
    const daw = DAWS[project.daw];
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{daw?.icon}</span>
          <div>
            <h4 className="font-semibold text-sm">{project.name}</h4>
            <p className="text-xs text-gray-500">{daw?.name} • {project.modified}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-mono text-gray-500">{project.bpm} BPM</p>
            <p className="text-xs font-mono text-gray-500">Key: {project.key}</p>
          </div>
          <button className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // STATS BAR
  // ═══════════════════════════════════════════════════════════════════
  const connectedCount = Object.values(connectionStatus).filter(s => s.connected).length;
  const totalPlugins = Object.values(PLUGIN_ECOSYSTEMS).reduce((sum, p) => sum + p.pluginCount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0djJoLTJ2LTJoMnptMCAyMHYyaC0ydi0yaDJ6bS0yMC0yMHYyaC0ydi0yaDJ6bTAgMjB2MmgtMnYtMmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Headphones size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">DAW Integration Hub</h1>
              <p className="text-gray-300 mt-1">Connect your music production workflow to GOAT Royalty</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{Object.keys(DAWS).length}</p>
              <p className="text-xs text-gray-300 mt-1">DAWs Supported</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{connectedCount}</p>
              <p className="text-xs text-gray-300 mt-1">Connected</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{Object.keys(PLUGIN_ECOSYSTEMS).length}</p>
              <p className="text-xs text-gray-300 mt-1">Plugin Suites</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{totalPlugins}+</p>
              <p className="text-xs text-gray-300 mt-1">Total Plugins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'daws', label: 'DAW Connections', icon: <Monitor size={16} /> },
            { id: 'plugins', label: 'Plugin Ecosystems', icon: <Package size={16} /> },
            { id: 'projects', label: 'Recent Projects', icon: <FileAudio size={16} /> },
            { id: 'workflow', label: 'Workflow', icon: <Layers size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* DAW Connections Tab */}
        {activeTab === 'daws' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.values(DAWS).map(daw => (
              <DAWCard key={daw.id} daw={daw} />
            ))}
          </div>
        )}

        {/* Plugin Ecosystems Tab */}
        {activeTab === 'plugins' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(PLUGIN_ECOSYSTEMS).map(plugin => (
              <PluginCard key={plugin.id} plugin={plugin} />
            ))}
          </div>
        )}

        {/* Recent Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Projects</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                <Upload size={14} /> Import Project
              </button>
            </div>
            {recentProjects.map(project => (
              <RecentProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Production Workflow Pipeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { step: 1, title: 'Create', desc: 'Produce in your DAW', icon: '🎹', color: '#6366f1' },
                { step: 2, title: 'Export', desc: 'Stems & masters', icon: '📤', color: '#0ea5e9' },
                { step: 3, title: 'Register', desc: 'ISRC & metadata', icon: '📋', color: '#10b981' },
                { step: 4, title: 'Distribute', desc: 'All platforms', icon: '🌐', color: '#f59e0b' },
                { step: 5, title: 'Collect', desc: 'Track royalties', icon: '💰', color: '#ef4444' },
              ].map((step, idx) => (
                <div key={step.step} className="relative">
                  <div className="text-center p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <div className="text-4xl mb-3">{step.icon}</div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: step.color }}>
                      Step {step.step}
                    </div>
                    <h3 className="font-bold text-lg">{step.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
                  </div>
                  {idx < 4 && (
                    <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight size={20} className="text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* DAW Export Settings */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-lg mb-4">🎯 Export Settings for GOAT Platform</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h4 className="font-semibold text-sm mb-2">Audio Format</h4>
                  <select className="w-full p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm">
                    <option>WAV 24-bit / 48kHz</option>
                    <option>WAV 16-bit / 44.1kHz</option>
                    <option>AIFF 24-bit / 48kHz</option>
                    <option>FLAC Lossless</option>
                  </select>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h4 className="font-semibold text-sm mb-2">Stem Export</h4>
                  <select className="w-full p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm">
                    <option>Full Mix + Stems</option>
                    <option>Full Mix Only</option>
                    <option>Stems Only</option>
                    <option>Dolby Atmos Bed + Objects</option>
                  </select>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h4 className="font-semibold text-sm mb-2">Metadata</h4>
                  <select className="w-full p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm">
                    <option>Auto-tag ISRC + ISWC</option>
                    <option>Manual Entry</option>
                    <option>Import from Catalog</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}