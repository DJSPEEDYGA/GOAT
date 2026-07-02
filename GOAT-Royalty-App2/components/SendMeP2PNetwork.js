/**
 * 📡 SendMe P2P AI Network — GOAT Royalty App
 * Peer-to-Peer AI Agent Communication & File Sharing
 * Two local LLMs talking to each other over LAN — no internet needed
 * 
 * Technology Stack:
 * - SendMe/Iroh: QUIC-based P2P file transfer with BLAKE3 verification
 * - mDNS/Bonjour: Zero-config peer discovery on local network
 * - Ollama: Local LLM inference on each node
 * - WebSocket: Real-time agent-to-agent messaging
 * 
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Radio, Wifi, WifiOff, Send, Download, Upload, FileText,
  Monitor, Smartphone, Server, Cpu, HardDrive, Globe,
  MessageSquare, Bot, Brain, Zap, Shield, Lock, Unlock,
  RefreshCw, Check, X, AlertTriangle, ChevronRight, Copy,
  Folder, File, Image, Music, Video, Archive, Code,
  Network, Link2, Unlink, Activity, BarChart3, Clock,
  Settings, Terminal, Play, Square, Pause, Crown, Sparkles,
  ArrowLeftRight, ArrowUpDown, Share2, Eye, Layers, Search
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// P2P NETWORK CONFIGURATION
// ═══════════════════════════════════════════════════════════════
const P2P_CONFIG = {
  discoveryPort: 5353,       // mDNS standard port
  servicePort: 18800,        // SendMe P2P service port
  wsPort: 18801,             // WebSocket for agent messaging
  protocol: 'QUIC',          // QUIC over UDP
  encryption: 'TLS 1.3',    // End-to-end encryption
  hashAlgo: 'BLAKE3',       // Content verification
  maxPeers: 16,             // Max simultaneous peers
  heartbeatInterval: 5000,  // Peer heartbeat (ms)
  version: '2.0.0',
};

// ═══════════════════════════════════════════════════════════════
// SIMULATED PEER NODES ON THE NETWORK
// ═══════════════════════════════════════════════════════════════
const NETWORK_PEERS = [
  {
    id: 'node-alpha',
    name: 'GOAT-Studio-Main',
    hostname: 'goat-studio.local',
    ip: '192.168.1.100',
    os: 'Windows 11 Pro',
    role: 'Primary',
    model: 'Llama 3.3 70B',
    modelSize: '40GB',
    ollama: true,
    status: 'online',
    cpu: 'AMD Ryzen 9 7950X',
    gpu: 'NVIDIA RTX 4090 24GB',
    ram: '128GB DDR5',
    storage: '4TB NVMe',
    uptime: '14d 7h 23m',
    lastSeen: 'now',
    transferSpeed: '2.4 Gbps',
    filesShared: 847,
    messagesExchanged: 12450,
  },
  {
    id: 'node-beta',
    name: 'GOAT-Production-2',
    hostname: 'goat-prod2.local',
    ip: '192.168.1.101',
    os: 'Ubuntu 24.04 LTS',
    role: 'Secondary',
    model: 'Mixtral 8x7B',
    modelSize: '26GB',
    ollama: true,
    status: 'online',
    cpu: 'Intel Xeon W-3475X',
    gpu: 'NVIDIA A6000 48GB',
    ram: '256GB ECC',
    storage: '8TB NVMe RAID',
    uptime: '31d 2h 15m',
    lastSeen: 'now',
    transferSpeed: '4.1 Gbps',
    filesShared: 1234,
    messagesExchanged: 8920,
  },
  {
    id: 'node-gamma',
    name: 'GOAT-Mobile-DJ',
    hostname: 'dj-speedy-laptop.local',
    ip: '192.168.1.105',
    os: 'macOS Sequoia',
    role: 'Mobile',
    model: 'Llama 3.2 3B',
    modelSize: '2GB',
    ollama: true,
    status: 'online',
    cpu: 'Apple M4 Max',
    gpu: 'M4 Max 40-core GPU',
    ram: '64GB Unified',
    storage: '2TB SSD',
    uptime: '2d 11h 45m',
    lastSeen: '3s ago',
    transferSpeed: '1.2 Gbps',
    filesShared: 234,
    messagesExchanged: 3450,
  },
  {
    id: 'node-delta',
    name: 'GOAT-NAS-Vault',
    hostname: 'goat-nas.local',
    ip: '192.168.1.110',
    os: 'TrueNAS SCALE',
    role: 'Storage',
    model: 'None (Storage Only)',
    modelSize: '—',
    ollama: false,
    status: 'online',
    cpu: 'Intel Xeon E-2388G',
    gpu: 'None',
    ram: '64GB ECC',
    storage: '48TB ZFS RAIDZ2',
    uptime: '89d 14h 02m',
    lastSeen: 'now',
    transferSpeed: '10 Gbps',
    filesShared: 15670,
    messagesExchanged: 0,
  },
];

// ═══════════════════════════════════════════════════════════════
// FILE TYPES FOR SHARING
// ═══════════════════════════════════════════════════════════════
const SHARED_FILES = [
  { name: 'FIVE_DEUCES_Master.wav', size: '847 MB', type: 'audio', from: 'node-alpha', to: 'node-beta', status: 'complete', hash: 'blake3:a7f2c9...', speed: '2.1 Gbps' },
  { name: 'GOAT_FORCE_Stems/', size: '3.2 GB', type: 'folder', from: 'node-beta', to: 'node-alpha', status: 'transferring', progress: 67, hash: 'blake3:b3e1d8...', speed: '1.8 Gbps' },
  { name: 'royalty_report_Q4_2025.csv', size: '12 MB', type: 'data', from: 'node-alpha', to: 'node-gamma', status: 'complete', hash: 'blake3:c4f5a2...', speed: '890 Mbps' },
  { name: 'catalog_backup_full.zip', size: '15.7 GB', type: 'archive', from: 'node-delta', to: 'node-alpha', status: 'complete', hash: 'blake3:d6g7h3...', speed: '4.1 Gbps' },
  { name: 'album_artwork_2025/', size: '890 MB', type: 'folder', from: 'node-gamma', to: 'node-delta', status: 'queued', hash: 'pending', speed: '—' },
  { name: 'llama3.3-70b-q4.gguf', size: '40 GB', type: 'model', from: 'node-beta', to: 'node-gamma', status: 'transferring', progress: 23, hash: 'blake3:e8i9j4...', speed: '1.2 Gbps' },
  { name: 'mix_session_friday.als', size: '234 MB', type: 'project', from: 'node-alpha', to: 'node-beta', status: 'complete', hash: 'blake3:f0k1l5...', speed: '2.4 Gbps' },
];

const FILE_ICONS = {
  audio: Music, folder: Folder, data: FileText, archive: Archive,
  model: Brain, project: Code, image: Image, video: Video, default: File,
};

// ═══════════════════════════════════════════════════════════════
// AI AGENT CONVERSATION SIMULATOR
// ═══════════════════════════════════════════════════════════════
const AI_CONVERSATIONS = [
  { from: 'node-alpha', fromModel: 'Llama 3.3 70B', to: 'node-beta', toModel: 'Mixtral 8x7B', messages: [
    { sender: 'alpha', text: '🎵 I\'ve analyzed the FIVE DEUCES master tracks. Track 7 "Boss Moves" has a peak loudness of -3.2 LUFS — might need limiting before distribution.' },
    { sender: 'beta', text: '📊 Confirmed. I ran spectral analysis on my end. The low-end below 40Hz is heavy. Recommend a high-pass filter at 35Hz with a gentle 6dB/oct slope. Also, the stereo width on the chorus could be widened by 15% for streaming optimization.' },
    { sender: 'alpha', text: '✅ Good catch. I\'ll apply the HPF and stereo widening. Can you also check the ISRC codes against the MLC database? I want to make sure all 22 tracks are properly registered before the Q1 royalty cycle.' },
    { sender: 'beta', text: '🔍 Running MLC cross-reference now... All 22 ISRCs verified against MLC Publisher Number P0041X. Writer IPI 00348202968 confirmed for Harvey Miller across all works. No conflicts detected. Ready for distribution.' },
    { sender: 'alpha', text: '💰 Perfect. Calculate projected Q1 royalties based on current streaming velocity. Use the weighted average across Spotify ($0.004/stream), Apple Music ($0.008/stream), and YouTube Music ($0.002/stream).' },
    { sender: 'beta', text: '📈 Q1 2026 Projection: Based on 3,650 tracks at current velocity:\n• Spotify: ~$14,200 (42% share)\n• Apple Music: ~$9,500 (28% share)\n• YouTube Music: ~$5,100 (15% share)\n• Others: ~$5,200 (15% share)\n• **Total Projected: ~$34,000**\nGrowth trend: +8.3% QoQ. Recommend increasing playlist placement budget.' },
  ]},
  { from: 'node-alpha', fromModel: 'Llama 3.3 70B', to: 'node-gamma', toModel: 'Llama 3.2 3B', messages: [
    { sender: 'alpha', text: '📱 Hey mobile node — I need you to sync the latest catalog updates. 47 new tracks added this week.' },
    { sender: 'gamma', text: '📥 Received. Syncing catalog delta... 47 tracks downloaded. Local cache updated. I\'m running on battery so using the 3B model for efficiency. Want me to generate social media captions for the new releases?' },
    { sender: 'alpha', text: '🎯 Yes! Generate Instagram captions for the top 5 tracks by projected stream count. Keep them under 150 chars, use relevant hashtags, and maintain the GOAT Royalty brand voice.' },
    { sender: 'gamma', text: '✍️ Generated:\n1. "Crown Me" — 👑 They said it couldn\'t be done. We did it twice. #GOATRoyalty #CrownMe #NewMusic\n2. "Boss Moves" — 💼 Every move calculated. Every beat intentional. #BossMoves #HarveyMiller\n3. "GOAT Status" — 🐐 Status: Legendary. #GOATStatus #FASTASSMAN #HipHop\n4. "Legends Never Die" — ⚡ The legacy continues... #LegendsNeverDie #DJSpeedy\n5. "Victory Lap" — 🏆 This isn\'t the end. It\'s just the beginning. #VictoryLap #GOATForce' },
  ]},
];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const SendMeP2PNetwork = () => {
  const [activeTab, setActiveTab] = useState('network');
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('connected');
  const [discoveredPeers, setDiscoveredPeers] = useState(NETWORK_PEERS);
  const [activeConversation, setActiveConversation] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState(1);
  const [agentInput, setAgentInput] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [customAgentChat, setCustomAgentChat] = useState([]);
  const [transfers, setTransfers] = useState(SHARED_FILES);
  const [networkStats, setNetworkStats] = useState({
    totalTransferred: '2.4 TB',
    activeConnections: 4,
    messagesExchanged: 24820,
    avgLatency: '0.3ms',
    uptime: '99.99%',
    encryptedStreams: 12,
    peersDiscovered: 4,
    filesShared: 17985,
  });
  const chatEndRef = useRef(null);

  // Simulate transfer progress
  useEffect(() => {
    const interval = setInterval(() => {
      setTransfers(prev => prev.map(t => {
        if (t.status === 'transferring' && t.progress < 100) {
          const newProgress = Math.min(100, t.progress + Math.random() * 3);
          return { ...t, progress: Math.round(newProgress), status: newProgress >= 100 ? 'complete' : 'transferring' };
        }
        return t;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-reveal agent conversation messages
  useEffect(() => {
    const conv = AI_CONVERSATIONS[activeConversation];
    if (visibleMessages < conv.messages.length) {
      const timer = setTimeout(() => {
        setVisibleMessages(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visibleMessages, activeConversation]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages, customAgentChat]);

  const sendAgentMessage = () => {
    if (!agentInput.trim() || isAgentThinking) return;
    const userMsg = agentInput.trim();
    setAgentInput('');
    setCustomAgentChat(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsAgentThinking(true);

    setTimeout(() => {
      const response = generateAgentResponse(userMsg);
      setCustomAgentChat(prev => [...prev, { sender: 'agent', text: response }]);
      setIsAgentThinking(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAgentResponse = (input) => {
    const lower = input.toLowerCase();

    if (lower.includes('discover') || lower.includes('scan') || lower.includes('find')) {
      return `📡 **Network Discovery Scan**\n\n\`\`\`\n[mDNS] Broadcasting on 224.0.0.251:5353...\n[mDNS] Query: _goat-p2p._tcp.local\n[FOUND] GOAT-Studio-Main (192.168.1.100) — Llama 3.3 70B\n[FOUND] GOAT-Production-2 (192.168.1.101) — Mixtral 8x7B\n[FOUND] GOAT-Mobile-DJ (192.168.1.105) — Llama 3.2 3B\n[FOUND] GOAT-NAS-Vault (192.168.1.110) — Storage Node\n\`\`\`\n\n✅ 4 peers discovered on local network. All connections encrypted with TLS 1.3 over QUIC.\n🔒 No internet required — pure LAN communication.`;
    }

    if (lower.includes('send') || lower.includes('transfer') || lower.includes('share')) {
      return `📤 **File Transfer Protocol**\n\nTo send files between nodes:\n\n\`\`\`bash\n# From GOAT-Studio-Main to GOAT-Production-2\nsendme send ~/music/FIVE_DEUCES_Master.wav\n# Output: ticket blob:a7f2c9e3...\n\n# On GOAT-Production-2\nsendme receive blob:a7f2c9e3...\n# Fetching... 847 MB at 2.1 Gbps\n# ✅ Verified (BLAKE3: a7f2c9e3...)\n\`\`\`\n\n**Features:**\n• Direct P2P — no cloud, no internet needed\n• BLAKE3 integrity verification\n• Resumable transfers\n• End-to-end encrypted (TLS 1.3)\n• Saturates multi-gigabit connections`;
    }

    if (lower.includes('talk') || lower.includes('chat') || lower.includes('agent') || lower.includes('ai')) {
      return `🤖 **AI Agent-to-Agent Communication**\n\nYour GOAT network has ${discoveredPeers.filter(p => p.ollama).length} AI-capable nodes:\n\n• **GOAT-Studio-Main**: Llama 3.3 70B (complex reasoning)\n• **GOAT-Production-2**: Mixtral 8x7B (parallel processing)\n• **GOAT-Mobile-DJ**: Llama 3.2 3B (fast, lightweight)\n\n**How it works:**\n1. Node A sends a task via WebSocket (port ${P2P_CONFIG.wsPort})\n2. Node B processes with its local LLM via Ollama\n3. Response sent back over encrypted QUIC channel\n4. No data leaves your local network!\n\n**Example:**\n\`\`\`\nNode-Alpha → Node-Beta: "Analyze royalty data for Q4"\nNode-Beta (Mixtral): Processing with 47B MoE parameters...\nNode-Beta → Node-Alpha: "Analysis complete. Report attached."\n\`\`\``;
    }

    if (lower.includes('status') || lower.includes('network') || lower.includes('health')) {
      return `📊 **Network Status Report**\n\n**Peers:** ${discoveredPeers.length} online\n**Protocol:** QUIC over UDP (${P2P_CONFIG.encryption})\n**Discovery:** mDNS (zero-config, no internet)\n**Total Transferred:** ${networkStats.totalTransferred}\n**Messages Exchanged:** ${networkStats.messagesExchanged.toLocaleString()}\n**Avg Latency:** ${networkStats.avgLatency}\n**Uptime:** ${networkStats.uptime}\n\n**Node Health:**\n✅ GOAT-Studio-Main — Online (14d uptime)\n✅ GOAT-Production-2 — Online (31d uptime)\n✅ GOAT-Mobile-DJ — Online (2d uptime)\n✅ GOAT-NAS-Vault — Online (89d uptime)\n\n🔒 All connections encrypted. Zero internet dependency.`;
    }

    if (lower.includes('model') || lower.includes('ollama') || lower.includes('llm')) {
      return `🧠 **Local LLM Fleet Status**\n\n| Node | Model | Params | VRAM | Status |\n|------|-------|--------|------|--------|\n| Studio-Main | Llama 3.3 70B | 70B | 40GB/24GB | ✅ Active |\n| Production-2 | Mixtral 8x7B | 47B MoE | 26GB/48GB | ✅ Active |\n| Mobile-DJ | Llama 3.2 3B | 3B | 2GB/64GB | ✅ Active |\n| NAS-Vault | None | — | — | 📦 Storage |\n\n**To share a model between nodes:**\n\`\`\`bash\n# Export from Production-2\nollama push mixtral:8x7b --to goat-studio.local\n\n# Or use SendMe for raw GGUF transfer\nsendme send ~/.ollama/models/mixtral-8x7b.gguf\n\`\`\`\n\n💡 Models can be shared over LAN at multi-gigabit speeds!`;
    }

    return `📡 **SendMe P2P Network — GOAT Royalty**\n\nI received: "${input.substring(0, 80)}${input.length > 80 ? '...' : ''}"\n\n**Available Commands:**\n• \`discover\` — Scan for peers on local network\n• \`send\` — Transfer files between nodes\n• \`talk\` — AI agent-to-agent communication\n• \`status\` — Network health report\n• \`model\` — LLM fleet status\n\n🔒 All communication is encrypted and stays on your local network.\n📡 No internet, no cloud, no Wi-Fi needed — just Ethernet/LAN.`;
  };

  const peerStatusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-red-500',
    syncing: 'bg-blue-500',
  };

  const tabs = [
    { id: 'network', label: 'Network Map', icon: Network },
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'transfers', label: 'File Transfers', icon: ArrowLeftRight },
    { id: 'command', label: 'Command', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-black text-white">
      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-red-500-900/30 to-cyan-900/30 border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Radio className="w-12 h-12 text-cyan-400 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-ping" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  <span className="text-cyan-400">Send</span>
                  <span className="text-white">Me</span>
                  <span className="text-blue-400 ml-2">P2P Network</span>
                </h1>
                <p className="text-xs text-gray-400">Local AI Agent Communication • No Internet Required • QUIC + TLS 1.3</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-xl border ${networkStatus === 'connected' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400'}`}>
                <div className="text-xs font-bold">NETWORK</div>
                <div className="flex items-center gap-2">
                  {networkStatus === 'connected' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  <span className="font-bold">{networkStatus === 'connected' ? 'LAN ACTIVE' : 'OFFLINE'}</span>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-3 text-xs">
                <div className="text-center px-3 py-1 bg-white/5 rounded-xl">
                  <div className="text-cyan-400 font-bold">{discoveredPeers.length}</div>
                  <div className="text-gray-500">Peers</div>
                </div>
                <div className="text-center px-3 py-1 bg-white/5 rounded-xl">
                  <div className="text-green-400 font-bold">{networkStats.totalTransferred}</div>
                  <div className="text-gray-500">Transferred</div>
                </div>
                <div className="text-center px-3 py-1 bg-white/5 rounded-xl">
                  <div className="text-purple-400 font-bold">{networkStats.avgLatency}</div>
                  <div className="text-gray-500">Latency</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 rounded-xl border border-red-500/20">
                  <Globe className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-red-400 font-bold">NO INTERNET</span>
                </div>
                <a href="/" className="px-3 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-sm">👑 GOAT Home</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TAB NAVIGATION ═══ */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/50' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ═══ NETWORK MAP TAB ═══ */}
        {activeTab === 'network' && (
          <div className="space-y-6">
            {/* Network Topology Banner */}
            <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-2xl p-6 border border-cyan-500/20">
              <div className="flex items-center gap-3 mb-4">
                <Network className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-bold">GOAT Royalty Local Network</h2>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">● MESH ACTIVE</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-black/30 rounded-xl p-3"><span className="text-gray-500">Protocol:</span> <span className="text-cyan-400 font-bold">QUIC/UDP</span></div>
                <div className="bg-black/30 rounded-xl p-3"><span className="text-gray-500">Encryption:</span> <span className="text-green-400 font-bold">TLS 1.3 E2E</span></div>
                <div className="bg-black/30 rounded-xl p-3"><span className="text-gray-500">Discovery:</span> <span className="text-blue-400 font-bold">mDNS Zero-Config</span></div>
                <div className="bg-black/30 rounded-xl p-3"><span className="text-gray-500">Verification:</span> <span className="text-purple-400 font-bold">BLAKE3 Hash</span></div>
              </div>
            </div>

            {/* Peer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {discoveredPeers.map(peer => (
                <div key={peer.id} onClick={() => setSelectedPeer(selectedPeer?.id === peer.id ? null : peer)} className={`bg-white/5 rounded-2xl p-5 border cursor-pointer transition-all hover:bg-white/10 ${selectedPeer?.id === peer.id ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/10'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {peer.role === 'Primary' ? <Monitor className="w-8 h-8 text-cyan-400" /> :
                         peer.role === 'Secondary' ? <Server className="w-8 h-8 text-blue-400" /> :
                         peer.role === 'Mobile' ? <Smartphone className="w-8 h-8 text-purple-400" /> :
                         <HardDrive className="w-8 h-8 text-orange-400" />}
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${peerStatusColors[peer.status]}`} />
                      </div>
                      <div>
                        <div className="font-bold">{peer.name}</div>
                        <div className="text-xs text-gray-500">{peer.hostname} • {peer.ip}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${peer.role === 'Primary' ? 'bg-cyan-500/20 text-cyan-400' : peer.role === 'Secondary' ? 'bg-blue-500/20 text-blue-400' : peer.role === 'Mobile' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {peer.role}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-black/20 rounded-xl p-2">
                      <span className="text-gray-500">OS:</span> <span className="text-white">{peer.os}</span>
                    </div>
                    <div className="bg-black/20 rounded-xl p-2">
                      <span className="text-gray-500">Model:</span> <span className="text-cyan-400 font-bold">{peer.model}</span>
                    </div>
                    <div className="bg-black/20 rounded-xl p-2">
                      <span className="text-gray-500">Speed:</span> <span className="text-green-400">{peer.transferSpeed}</span>
                    </div>
                    <div className="bg-black/20 rounded-xl p-2">
                      <span className="text-gray-500">Uptime:</span> <span className="text-white">{peer.uptime}</span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedPeer?.id === peer.id && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-black/30 rounded-xl p-2"><span className="text-gray-500">CPU:</span> <span className="text-white">{peer.cpu}</span></div>
                        <div className="bg-black/30 rounded-xl p-2"><span className="text-gray-500">GPU:</span> <span className="text-white">{peer.gpu}</span></div>
                        <div className="bg-black/30 rounded-xl p-2"><span className="text-gray-500">RAM:</span> <span className="text-white">{peer.ram}</span></div>
                        <div className="bg-black/30 rounded-xl p-2"><span className="text-gray-500">Storage:</span> <span className="text-white">{peer.storage}</span></div>
                        <div className="bg-black/30 rounded-xl p-2"><span className="text-gray-500">Files Shared:</span> <span className="text-cyan-400 font-bold">{peer.filesShared.toLocaleString()}</span></div>
                        <div className="bg-black/30 rounded-xl p-2"><span className="text-gray-500">Messages:</span> <span className="text-purple-400 font-bold">{peer.messagesExchanged.toLocaleString()}</span></div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {peer.ollama && <button className="px-3 py-1 bg-cyan-600/30 rounded-xl text-xs text-cyan-400 hover:bg-cyan-600/50">🤖 Chat with AI</button>}
                        <button className="px-3 py-1 bg-blue-600/30 rounded-xl text-xs text-blue-400 hover:bg-blue-600/50">📤 Send File</button>
                        <button className="px-3 py-1 bg-purple-600/30 rounded-xl text-xs text-purple-400 hover:bg-purple-600/50">🔍 Browse Files</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ AI AGENTS TAB ═══ */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-900/20 to-pink-900/20 rounded-2xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-purple-400" />
                <div>
                  <div className="font-bold text-purple-400">AI Agent-to-Agent Communication</div>
                  <div className="text-xs text-gray-400">Watch two local LLMs collaborate on tasks — all processing happens on your machines, no data leaves the network.</div>
                </div>
              </div>
            </div>

            {/* Conversation Selector */}
            <div className="flex gap-2">
              {AI_CONVERSATIONS.map((conv, i) => (
                <button key={i} onClick={() => { setActiveConversation(i); setVisibleMessages(1); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeConversation === i ? 'bg-purple-600/30 text-purple-400 border border-purple-500/50' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                  {NETWORK_PEERS.find(p => p.id === conv.from)?.name?.split('-').pop()} ↔ {NETWORK_PEERS.find(p => p.id === conv.to)?.name?.split('-').pop()}
                </button>
              ))}
            </div>

            {/* Agent Conversation */}
            <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl border border-white/10">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-sm">{AI_CONVERSATIONS[activeConversation].fromModel}</span>
                  </div>
                  <ArrowLeftRight className="w-4 h-4 text-gray-500" />
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className="font-bold text-sm">{AI_CONVERSATIONS[activeConversation].toModel}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Lock className="w-3 h-3 text-green-400" />
                  <span>E2E Encrypted • LAN Only</span>
                </div>
              </div>

              <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {AI_CONVERSATIONS[activeConversation].messages.slice(0, visibleMessages).map((msg, i) => {
                  const isAlpha = msg.sender === 'alpha';
                  const peer = NETWORK_PEERS.find(p => p.id === (isAlpha ? AI_CONVERSATIONS[activeConversation].from : AI_CONVERSATIONS[activeConversation].to));
                  return (
                    <div key={i} className={`flex ${isAlpha ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isAlpha ? 'bg-cyan-600/20 border border-cyan-500/30' : 'bg-purple-600/20 border border-purple-500/30'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className={`w-4 h-4 ${isAlpha ? 'text-cyan-400' : 'text-purple-400'}`} />
                          <span className={`text-xs font-bold ${isAlpha ? 'text-cyan-400' : 'text-purple-400'}`}>{peer?.name}</span>
                          <span className="text-xs text-gray-400">({isAlpha ? AI_CONVERSATIONS[activeConversation].fromModel : AI_CONVERSATIONS[activeConversation].toModel})</span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                      </div>
                    </div>
                  );
                })}
                {visibleMessages < AI_CONVERSATIONS[activeConversation].messages.length && (
                  <div className="flex justify-center">
                    <div className="goat-gradient-card goat-gradient-card goat-card-hover/10 rounded-xl px-4 py-2 flex items-center gap-2 text-sm text-gray-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Agent processing...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
          </div>
        )}

        {/* ═══ FILE TRANSFERS TAB ═══ */}
        {activeTab === 'transfers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ArrowLeftRight className="w-6 h-6 text-cyan-400" />
                P2P File Transfers
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-green-400" />
                <span>BLAKE3 verified • TLS 1.3 encrypted • No cloud</span>
              </div>
            </div>

            <div className="space-y-3">
              {transfers.map((transfer, i) => {
                const FileIcon = FILE_ICONS[transfer.type] || FILE_ICONS.default;
                const fromPeer = NETWORK_PEERS.find(p => p.id === transfer.from);
                const toPeer = NETWORK_PEERS.find(p => p.id === transfer.to);
                return (
                  <div key={i} className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-xl p-4 border border-white/10 hover:bg-white/8 transition-all">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <FileIcon className={`w-8 h-8 ${transfer.type === 'audio' ? 'text-pink-400' : transfer.type === 'model' ? 'text-purple-400' : transfer.type === 'data' ? 'text-green-400' : 'text-cyan-400'}`} />
                        <div>
                          <div className="font-bold text-sm">{transfer.name}</div>
                          <div className="text-xs text-gray-500">{transfer.size}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-cyan-400">{fromPeer?.name?.split('-').pop()}</span>
                        <ArrowLeftRight className="w-3 h-3 text-gray-500" />
                        <span className="text-purple-400">{toPeer?.name?.split('-').pop()}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {transfer.status === 'transferring' && (
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-blue-400">{transfer.progress}%</span>
                              <span className="text-gray-500">{transfer.speed}</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full">
                              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${transfer.progress}%` }} />
                            </div>
                          </div>
                        )}
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          transfer.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                          transfer.status === 'transferring' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {transfer.status === 'complete' ? '✅ Complete' : transfer.status === 'transferring' ? '📡 Transferring' : '⏳ Queued'}
                        </span>
                      </div>
                    </div>
                    {transfer.hash !== 'pending' && (
                      <div className="mt-2 text-xs text-gray-400 font-mono">Hash: {transfer.hash}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ COMMAND TAB ═══ */}
        {activeTab === 'command' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/5 rounded-2xl border border-white/10 flex flex-col" style={{ height: '600px' }}>
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="font-bold">SendMe P2P Terminal</span>
                <span className="text-xs text-gray-500 ml-auto">QUIC Encrypted • LAN Only</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {customAgentChat.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Radio className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">SendMe P2P Network Terminal</p>
                    <p className="text-xs mt-1">Try: discover, send, talk, status, model</p>
                  </div>
                )}
                {customAgentChat.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.sender === 'user' ? 'bg-cyan-600/30 border border-cyan-500/30' : 'bg-white/10 border border-white/10'}`}>
                      <div className="text-xs text-gray-500 mb-1">{msg.sender === 'user' ? '👑 Commander' : '📡 SendMe Network'}</div>
                      <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                ))}
                {isAgentThinking && (
                  <div className="flex justify-start">
                    <div className="goat-gradient-card goat-gradient-card goat-card-hover/10 rounded-2xl px-4 py-3 border border-white/10">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Querying network nodes...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input type="text" value={agentInput} onChange={(e) => setAgentInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendAgentMessage()} placeholder="Enter command (discover, send, talk, status, model)..." className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50" />
                  <button onClick={sendAgentMessage} disabled={isAgentThinking} className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Reference */}
            <div className="space-y-4">
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-5 border border-white/10">
                <h3 className="font-bold mb-3 flex items-center gap-2"><Terminal className="w-5 h-5 text-cyan-400" />CLI Commands</h3>
                <div className="space-y-2 font-mono text-xs">
                  {[
                    'sendme send ~/music/track.wav',
                    'sendme receive blob:a7f2c9...',
                    'sendme discover --lan',
                    'sendme status --all-peers',
                    'sendme agent chat node-beta "analyze Q4"',
                    'sendme model share llama3.3:70b node-gamma',
                    'sendme sync --catalog --to all',
                    'ollama list',
                  ].map((cmd, i) => (
                    <div key={i} className="flex items-center justify-between bg-black/30 rounded-xl px-3 py-2">
                      <code className="text-green-400">$ {cmd}</code>
                      <button onClick={() => navigator.clipboard?.writeText(cmd)} className="p-1 hover:bg-white/10 rounded"><Copy className="w-3 h-3 text-gray-500" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-5 border border-white/10">
                <h3 className="font-bold mb-3 flex items-center gap-2"><Activity className="w-5 h-5 text-green-400" />Network Stats</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(networkStats).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400 text-xs">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-bold text-cyan-400 text-xs">{typeof val === 'number' ? val.toLocaleString() : val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Settings className="w-6 h-6 text-gray-400" />Network Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold mb-4">P2P Settings</h3>
                <div className="space-y-4">
                  {[
                    { label: 'mDNS Discovery Port', value: P2P_CONFIG.discoveryPort, desc: 'Standard mDNS multicast port' },
                    { label: 'SendMe Service Port', value: P2P_CONFIG.servicePort, desc: 'QUIC data transfer port' },
                    { label: 'WebSocket Agent Port', value: P2P_CONFIG.wsPort, desc: 'AI agent messaging port' },
                    { label: 'Max Peers', value: P2P_CONFIG.maxPeers, desc: 'Maximum simultaneous connections' },
                    { label: 'Heartbeat Interval', value: `${P2P_CONFIG.heartbeatInterval}ms`, desc: 'Peer keepalive frequency' },
                  ].map((setting, i) => (
                    <div key={i}>
                      <label className="text-sm text-gray-400">{setting.label}</label>
                      <input type="text" defaultValue={setting.value} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 mt-1 text-sm" />
                      <p className="text-xs text-gray-400 mt-1">{setting.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold mb-4">Security & Encryption</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Protocol', value: 'QUIC over UDP', status: 'active' },
                    { label: 'Encryption', value: 'TLS 1.3 (E2E)', status: 'active' },
                    { label: 'Hash Verification', value: 'BLAKE3', status: 'active' },
                    { label: 'Key Exchange', value: 'Ed25519', status: 'active' },
                    { label: 'NAT Traversal', value: 'QUIC Hole Punching', status: 'active' },
                    { label: 'Relay Fallback', value: 'Encrypted relay (if needed)', status: 'standby' },
                    { label: 'Internet Required', value: 'NO — Pure LAN', status: 'disabled' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{item.value}</span>
                        <div className={`w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-green-500' : item.status === 'standby' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                    <Shield className="w-4 h-4" />
                    Zero Internet Dependency
                  </div>
                  <p className="text-xs text-gray-400 mt-1">All communication stays on your local network. No data is sent to any external server. AI models run 100% locally via Ollama.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ FOOTER ═══ */}
      <div className="max-w-7xl mx-auto px-4 py-6 mt-8 border-t border-white/5">
        <div className="flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
          <div>📡 SendMe P2P AI Network v{P2P_CONFIG.version} • GOAT Royalty Division</div>
          <div>Powered by Iroh/QUIC • mDNS Discovery • Ollama Local LLM</div>
          <div>© 2025 Harvey Miller / FASTASSMAN Publishing Inc</div>
        </div>
      </div>
    </div>
  );
};

export default SendMeP2PNetwork;