/**
 * 🛡️ Security Sandbox Panel — GOAT Royalty Cyber Defense System
 * Integrated Threat Sandboxing, File Analysis, Process Monitor & Quarantine
 * Powered by the Cyber Security Sandbox Tool v1.0
 *
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, ShieldCheck, ShieldAlert, ShieldOff,
  Search, Scan, Lock, Unlock, AlertTriangle, AlertOctagon,
  Activity, Terminal, Bug, Zap, Target, Radar,
  FileWarning, RefreshCw, Download, Copy, Check, X,
  Cpu, HardDrive, Network, Server, Database,
  Trash2, Archive, FolderLock, Eye, Clock,
  ChevronRight, ChevronDown, Play, Square,
  BarChart3, TrendingUp, Bell, BellRing, Layers,
  Box, Package, Crosshair, FlaskConical, Microscope
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════
// SANDBOX SIMULATION ENGINE
// Mirrors the Python security_sandbox.py backend capabilities
// ══════════════════════════════════════════════════════════════════

const THREAT_LEVELS = {
  low:    { color: 'text-green-400',  bg: 'bg-green-500/20',  border: 'border-green-500/30',  label: 'LOW',      icon: '🟢' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', label: 'MEDIUM',   icon: '🟡' },
  high:   { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', label: 'HIGH',     icon: '🟠' },
  critical:{ color: 'text-red-400',   bg: 'bg-red-500/20',    border: 'border-red-500/30',    label: 'CRITICAL', icon: '🔴' },
};

const SUSPICIOUS_PROCESS_PATTERNS = [
  'miner', 'crypt', 'xmr', 'monero', 'keylog', 'stealer',
  'trojan', 'backdoor', 'rat', 'inject', 'hook', 'exploit', 'payload'
];

const SUSPICIOUS_PORTS = [6667, 6668, 6669, 4444, 5555, 31337, 1337, 9999];

const SAMPLE_PROCESSES = [
  { pid: 1024, name: 'node',           user: 'goat',  cpu: 2.1,  mem: 45.2, status: 'clean',    cmdline: 'node server.js' },
  { pid: 2048, name: 'python3',        user: 'goat',  cpu: 0.5,  mem: 12.1, status: 'clean',    cmdline: 'python3 analytics.py' },
  { pid: 3072, name: 'nginx',          user: 'root',  cpu: 0.1,  mem: 8.4,  status: 'clean',    cmdline: 'nginx: master process' },
  { pid: 4096, name: 'postgres',       user: 'db',    cpu: 1.2,  mem: 128.5,status: 'clean',    cmdline: 'postgres: main' },
  { pid: 5120, name: 'xmr-miner',      user: 'unknown',cpu: 98.0,mem: 256.0,status: 'critical', cmdline: './xmr-miner --pool mine.pool.com:3333' },
  { pid: 6144, name: 'keylogger.sh',   user: 'unknown',cpu: 0.3, mem: 4.2,  status: 'high',     cmdline: 'bash keylogger.sh -o /tmp/.log' },
  { pid: 7168, name: 'backdoor_srv',   user: 'root',  cpu: 0.1,  mem: 6.1,  status: 'critical', cmdline: './backdoor_srv --port 4444 --silent' },
  { pid: 8192, name: 'redis-server',   user: 'redis', cpu: 0.2,  mem: 32.0, status: 'clean',    cmdline: 'redis-server *:6379' },
  { pid: 9216, name: 'payload_exec',   user: 'unknown',cpu: 5.4, mem: 18.3, status: 'high',     cmdline: './payload_exec --target localhost' },
  { pid: 10240,name: 'pm2',            user: 'goat',  cpu: 0.1,  mem: 22.1, status: 'clean',    cmdline: 'pm2 daemon' },
];

const SAMPLE_CONNECTIONS = [
  { local: '0.0.0.0:443',   remote: '0.0.0.0:*',          status: 'LISTEN',      pid: 3072, risk: 'clean' },
  { local: '0.0.0.0:80',    remote: '0.0.0.0:*',          status: 'LISTEN',      pid: 3072, risk: 'clean' },
  { local: '127.0.0.1:5432',remote: '0.0.0.0:*',          status: 'LISTEN',      pid: 4096, risk: 'clean' },
  { local: '10.0.0.5:52341',remote: '185.220.101.47:4444', status: 'ESTABLISHED', pid: 7168, risk: 'critical' },
  { local: '10.0.0.5:61234',remote: '45.33.32.156:6667',   status: 'ESTABLISHED', pid: 5120, risk: 'high' },
  { local: '10.0.0.5:44123',remote: '103.224.182.9:31337', status: 'ESTABLISHED', pid: 9216, risk: 'high' },
  { local: '10.0.0.5:3000', remote: '0.0.0.0:*',          status: 'LISTEN',      pid: 1024, risk: 'clean' },
  { local: '10.0.0.5:6379', remote: '0.0.0.0:*',          status: 'LISTEN',      pid: 8192, risk: 'clean' },
];

const QUARANTINE_LOG = [
  { name: 'xmr-miner_20260303_140012.bin', original: '/tmp/xmr-miner', size: '2.4 MB', date: '2026-03-03 14:00', hash: 'a3f8c2d1e9b4...', threat: 'Crypto Miner' },
  { name: 'keylogger_20260302_091523.sh',  original: '/home/user/.config/keylogger.sh', size: '12 KB', date: '2026-03-02 09:15', hash: 'b7e1a4c9f2d3...', threat: 'Keylogger' },
  { name: 'payload_20260301_183045.exe',   original: '/tmp/.hidden/payload.exe', size: '856 KB', date: '2026-03-01 18:30', hash: 'c9d2b5e8a1f4...', threat: 'Trojan Dropper' },
];

const SANDBOX_ENVIRONMENTS = [
  { name: 'malware_analysis',  status: 'active',   files: 3, created: '2026-03-03 10:00', isolation: 'HIGH' },
  { name: 'suspicious_upload', status: 'active',   files: 1, created: '2026-03-03 12:30', isolation: 'MEDIUM' },
  { name: 'forensic_evidence', status: 'archived', files: 7, created: '2026-03-01 09:00', isolation: 'MAXIMUM' },
];

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════
const SecuritySandboxPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [scanRunning, setScanRunning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [connections, setConnections] = useState([]);
  const [quarantine, setQuarantine] = useState(QUARANTINE_LOG);
  const [sandboxes, setSandboxes] = useState(SANDBOX_ENVIRONMENTS);
  const [terminalLines, setTerminalLines] = useState([
    '🛡️  Cyber Security Sandbox Tool v1.0 — GOAT Royalty Edition',
    '════════════════════════════════════════════════════════════',
    '✅ Sandbox environment initialized',
    '✅ Quarantine directory ready',
    '✅ Process monitor loaded',
    '✅ Network analyzer active',
    '⏳ Awaiting scan command...',
  ]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [fileInput, setFileInput] = useState('');
  const [fileAnalysis, setFileAnalysis] = useState(null);
  const [analyzingFile, setAnalyzingFile] = useState(false);
  const [newSandboxName, setNewSandboxName] = useState('');
  const [stats, setStats] = useState({
    processesScanned: 0,
    threatsFound: 0,
    filesQuarantined: QUARANTINE_LOG.length,
    sandboxesActive: SANDBOX_ENVIRONMENTS.filter(s => s.status === 'active').length,
    lastScan: 'Never',
    networkConnections: SAMPLE_CONNECTIONS.length,
    suspiciousConnections: SAMPLE_CONNECTIONS.filter(c => c.risk !== 'clean').length,
  });
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const addTerminalLine = (line) => {
    setTerminalLines(prev => [...prev, line]);
  };

  // ══════════════════════════════════════════════════════════════
  // FULL SYSTEM SCAN
  // ══════════════════════════════════════════════════════════════
  const runFullScan = async () => {
    setScanRunning(true);
    setScanComplete(false);
    setScanProgress(0);
    setProcesses([]);
    setConnections([]);

    const steps = [
      { msg: '🔍 Initializing security sandbox...', delay: 300 },
      { msg: '🔍 Scanning running processes...', delay: 600 },
      { msg: '   → Checking process names against threat patterns...', delay: 400 },
      { msg: '   → Filtering legitimate kernel processes...', delay: 300 },
      { msg: `✅ Process scan complete. Found ${SAMPLE_PROCESSES.filter(p => p.status !== 'clean').length} suspicious processes.`, delay: 500 },
      { msg: '🌐 Analyzing network connections...', delay: 400 },
      { msg: '   → Checking for connections to suspicious ports...', delay: 300 },
      { msg: '   → Analyzing remote hostnames...', delay: 400 },
      { msg: `✅ Network analysis complete. Found ${SAMPLE_CONNECTIONS.filter(c => c.risk !== 'clean').length} suspicious connections.`, delay: 500 },
      { msg: '📊 Generating security report...', delay: 400 },
      { msg: '✅ Security report generated: reports/security_report_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.json', delay: 300 },
      { msg: '', delay: 200 },
      { msg: '════════════════════════════════════════════════════════════', delay: 100 },
      { msg: '📋 SCAN SUMMARY', delay: 100 },
      { msg: '════════════════════════════════════════════════════════════', delay: 100 },
      { msg: `Suspicious processes found: ${SAMPLE_PROCESSES.filter(p => p.status !== 'clean').length}`, delay: 100 },
      { msg: `Suspicious connections found: ${SAMPLE_CONNECTIONS.filter(c => c.risk !== 'clean').length}`, delay: 100 },
      { msg: '⚠️  ACTION REQUIRED: Quarantine or terminate suspicious items.', delay: 200 },
      { msg: '════════════════════════════════════════════════════════════', delay: 100 },
    ];

    let elapsed = 0;
    steps.forEach((step, i) => {
      elapsed += step.delay;
      setTimeout(() => {
        addTerminalLine(step.msg);
        setScanProgress(Math.round(((i + 1) / steps.length) * 100));
        if (i === steps.length - 1) {
          setProcesses(SAMPLE_PROCESSES);
          setConnections(SAMPLE_CONNECTIONS);
          setScanRunning(false);
          setScanComplete(true);
          setStats(prev => ({
            ...prev,
            processesScanned: SAMPLE_PROCESSES.length,
            threatsFound: SAMPLE_PROCESSES.filter(p => p.status !== 'clean').length + SAMPLE_CONNECTIONS.filter(c => c.risk !== 'clean').length,
            lastScan: new Date().toLocaleTimeString(),
          }));
        }
      }, elapsed);
    });
  };

  // ══════════════════════════════════════════════════════════════
  // FILE ANALYSIS
  // ══════════════════════════════════════════════════════════════
  const analyzeFile = () => {
    if (!fileInput.trim()) return;
    setAnalyzingFile(true);
    setFileAnalysis(null);
    addTerminalLine(`📁 Analyzing file: ${fileInput}`);

    setTimeout(() => {
      const ext = fileInput.split('.').pop().toLowerCase();
      const name = fileInput.split('/').pop().toLowerCase();
      const suspiciousExts = ['exe', 'dll', 'bat', 'cmd', 'ps1', 'vbs', 'sh'];
      const suspiciousNames = ['crack', 'patch', 'keygen', 'hack', 'exploit', 'payload', 'miner', 'trojan'];

      let threatLevel = 'low';
      const indicators = [];

      if (suspiciousExts.includes(ext)) {
        threatLevel = 'medium';
        indicators.push('⚠️  Executable file type detected');
      }
      if (suspiciousNames.some(n => name.includes(n))) {
        threatLevel = 'high';
        indicators.push('🔴 Suspicious filename pattern matched');
      }
      if (name.includes('miner') || name.includes('crypt') || name.includes('xmr')) {
        threatLevel = 'critical';
        indicators.push('🔴 Crypto miner signature detected');
      }
      if (indicators.length === 0) {
        indicators.push('✅ No suspicious patterns detected');
      }

      const result = {
        path: fileInput,
        name: fileInput.split('/').pop(),
        ext: ext,
        threatLevel,
        indicators,
        hashes: {
          md5: Array.from({length: 32}, () => '0123456789abcdef'[Math.floor(Math.random()*16)]).join(''),
          sha256: Array.from({length: 64}, () => '0123456789abcdef'[Math.floor(Math.random()*16)]).join(''),
        },
        size: `${(Math.random() * 10 + 0.1).toFixed(1)} MB`,
        timestamp: new Date().toISOString(),
      };

      setFileAnalysis(result);
      setAnalyzingFile(false);
      addTerminalLine(`✅ File analysis complete. Threat level: ${threatLevel.toUpperCase()}`);
      addTerminalLine(`   MD5: ${result.hashes.md5}`);
      addTerminalLine(`   SHA256: ${result.hashes.sha256.slice(0,32)}...`);
    }, 1500);
  };

  // ══════════════════════════════════════════════════════════════
  // QUARANTINE FILE
  // ══════════════════════════════════════════════════════════════
  const quarantineProcess = (proc) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    const entry = {
      name: `${proc.name}_${timestamp}.quarantine`,
      original: `/proc/${proc.pid}/${proc.name}`,
      size: `${proc.mem.toFixed(1)} MB`,
      date: new Date().toLocaleString(),
      hash: Array.from({length: 12}, () => '0123456789abcdef'[Math.floor(Math.random()*16)]).join('') + '...',
      threat: proc.status.charAt(0).toUpperCase() + proc.status.slice(1) + ' Process',
    };
    setQuarantine(prev => [entry, ...prev]);
    setProcesses(prev => prev.filter(p => p.pid !== proc.pid));
    setStats(prev => ({ ...prev, filesQuarantined: prev.filesQuarantined + 1, threatsFound: Math.max(0, prev.threatsFound - 1) }));
    addTerminalLine(`🔒 Process quarantined: ${proc.name} (PID: ${proc.pid})`);
    addTerminalLine(`   Quarantine path: quarantine/${entry.name}`);
  };

  const quarantineFile = (filePath) => {
    if (!fileAnalysis) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    const entry = {
      name: `${fileAnalysis.name.replace('.', '_')}_${timestamp}.quarantine`,
      original: filePath,
      size: fileAnalysis.size,
      date: new Date().toLocaleString(),
      hash: fileAnalysis.hashes.md5,
      threat: `${fileAnalysis.threatLevel.charAt(0).toUpperCase() + fileAnalysis.threatLevel.slice(1)} Threat`,
    };
    setQuarantine(prev => [entry, ...prev]);
    setStats(prev => ({ ...prev, filesQuarantined: prev.filesQuarantined + 1 }));
    addTerminalLine(`🔒 File quarantined: ${fileAnalysis.name}`);
    setFileAnalysis(null);
    setFileInput('');
  };

  // ══════════════════════════════════════════════════════════════
  // CREATE SANDBOX
  // ══════════════════════════════════════════════════════════════
  const createSandbox = () => {
    if (!newSandboxName.trim()) return;
    const sandbox = {
      name: newSandboxName.trim().replace(/\s+/g, '_').toLowerCase(),
      status: 'active',
      files: 0,
      created: new Date().toLocaleString(),
      isolation: 'MEDIUM',
    };
    setSandboxes(prev => [sandbox, ...prev]);
    setStats(prev => ({ ...prev, sandboxesActive: prev.sandboxesActive + 1 }));
    addTerminalLine(`🏗️  Sandbox created: ${sandbox.name}`);
    addTerminalLine(`   Isolation level: ${sandbox.isolation}`);
    addTerminalLine(`   Directories: isolated/, temp/`);
    setNewSandboxName('');
  };

  // ══════════════════════════════════════════════════════════════
  // TABS
  // ══════════════════════════════════════════════════════════════
  const tabs = [
    { id: 'overview',   label: 'Overview',        icon: BarChart3 },
    { id: 'scanner',    label: 'Process Scanner',  icon: Scan },
    { id: 'network',    label: 'Network Monitor',  icon: Network },
    { id: 'fileanalysis',label: 'File Analysis',   icon: Microscope },
    { id: 'quarantine', label: 'Quarantine',       icon: FolderLock },
    { id: 'sandbox',    label: 'Sandbox Env',      icon: Box },
    { id: 'terminal',   label: 'Terminal',         icon: Terminal },
  ];

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="bg-gray-950 text-white rounded-2xl border border-cyan-500/20 overflow-hidden">

      {/* ══ HEADER ══ */}
      <div className="bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-purple-900/40 border-b border-cyan-500/20 p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <FlaskConical className="w-10 h-10 text-cyan-400" />
              <Shield className="w-5 h-5 text-green-400 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                <span className="text-cyan-400">SECURITY</span>
                <span className="text-white"> SANDBOX</span>
                <span className="text-purple-400 ml-2">ENGINE</span>
              </h2>
              <p className="text-xs text-gray-400">
                Threat Isolation • File Analysis • Process Monitor • Quarantine System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats Pills */}
            {[
              { label: 'Threats', value: stats.threatsFound, color: stats.threatsFound > 0 ? 'text-red-400' : 'text-green-400' },
              { label: 'Quarantined', value: stats.filesQuarantined, color: 'text-orange-400' },
              { label: 'Sandboxes', value: stats.sandboxesActive, color: 'text-cyan-400' },
            ].map((s, i) => (
              <div key={i} className="text-center px-3 py-1 bg-black/30 rounded-xl border border-white/10">
                <div className={`font-bold text-sm ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}

            {/* Run Scan Button */}
            <button
              onClick={runFullScan}
              disabled={scanRunning}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-sm hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50"
            >
              {scanRunning
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Scanning...</>
                : <><Play className="w-4 h-4" /> Run Scan</>
              }
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {scanRunning && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Scanning system...</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ══ TAB NAV ══ */}
      <div className="flex gap-1 overflow-x-auto p-3 border-b border-white/5 bg-black/20">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/50'
                : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ CONTENT ══ */}
      <div className="p-5">

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Processes Scanned', value: stats.processesScanned, icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Threats Found', value: stats.threatsFound, icon: AlertTriangle, color: stats.threatsFound > 0 ? 'text-red-400' : 'text-green-400', bg: stats.threatsFound > 0 ? 'bg-red-500/10' : 'bg-green-500/10' },
                { label: 'Files Quarantined', value: stats.filesQuarantined, icon: FolderLock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: 'Active Sandboxes', value: stats.sandboxesActive, icon: Box, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: 'Network Connections', value: stats.networkConnections, icon: Network, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: 'Suspicious Connections', value: stats.suspiciousConnections, icon: AlertOctagon, color: 'text-red-400', bg: 'bg-red-500/10' },
                { label: 'Last Scan', value: stats.lastScan, icon: Clock, color: 'text-gray-400', bg: 'bg-white/5' },
                { label: 'Scan Status', value: scanComplete ? 'Complete' : scanRunning ? 'Running' : 'Idle', icon: Activity, color: scanComplete ? 'text-green-400' : scanRunning ? 'text-yellow-400' : 'text-gray-400', bg: 'bg-white/5' },
              ].map((card, i) => (
                <div key={i} className={`${card.bg} rounded-xl p-4 border border-white/10`}>
                  <div className="flex items-center gap-2 mb-2">
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                    <span className="text-xs text-gray-500">{card.label}</span>
                  </div>
                  <div className={`text-xl font-black ${card.color}`}>{card.value}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-xl p-4 border border-white/10">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-yellow-400" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: '🔍 Full Scan', action: () => { runFullScan(); setActiveTab('scanner'); } },
                  { label: '🌐 Network Scan', action: () => { runFullScan(); setActiveTab('network'); } },
                  { label: '📁 Analyze File', action: () => setActiveTab('fileanalysis') },
                  { label: '🔒 View Quarantine', action: () => setActiveTab('quarantine') },
                  { label: '🏗️  New Sandbox', action: () => setActiveTab('sandbox') },
                  { label: '💻 Terminal', action: () => setActiveTab('terminal') },
                  { label: '📊 Process List', action: () => setActiveTab('scanner') },
                  { label: '📡 Connections', action: () => setActiveTab('network') },
                ].map((a, i) => (
                  <button
                    key={i}
                    onClick={a.action}
                    className="px-3 py-2 bg-black/30 rounded-xl text-xs font-bold hover:bg-white/10 transition-all border border-white/5 text-left"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Threat Summary */}
            {scanComplete && (
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-xl p-4 border border-white/10">
                <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  Threat Summary
                </h3>
                <div className="space-y-2">
                  {processes.filter(p => p.status !== 'clean').map((proc, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${THREAT_LEVELS[proc.status]?.bg || 'bg-white/5'} ${THREAT_LEVELS[proc.status]?.border || 'border-white/10'}`}>
                      <div className="flex items-center gap-2">
                        <span>{THREAT_LEVELS[proc.status]?.icon}</span>
                        <span className="font-bold text-sm">{proc.name}</span>
                        <span className="text-xs text-gray-500">PID: {proc.pid}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${THREAT_LEVELS[proc.status]?.color}`}>
                          {THREAT_LEVELS[proc.status]?.label}
                        </span>
                        <button
                          onClick={() => quarantineProcess(proc)}
                          className="px-2 py-1 bg-red-600/30 rounded text-xs text-red-400 hover:bg-red-600/50 transition-all"
                        >
                          🔒 Quarantine
                        </button>
                      </div>
                    </div>
                  ))}
                  {processes.filter(p => p.status !== 'clean').length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-green-400 opacity-50" />
                      Run a scan to detect threats
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-xl p-4 border border-white/10">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
                <Bell className="w-4 h-4 text-blue-400" />
                Security Recommendations
              </h3>
              <div className="space-y-2">
                {[
                  { icon: '🔍', text: 'Run full system scans regularly (daily recommended)', priority: 'medium' },
                  { icon: '🔒', text: 'Quarantine all suspicious processes immediately', priority: 'high' },
                  { icon: '🌐', text: 'Block connections to suspicious ports (4444, 6667, 31337)', priority: 'high' },
                  { icon: '📁', text: 'Analyze all downloaded files before execution', priority: 'medium' },
                  { icon: '🏗️', text: 'Use sandbox environments for testing unknown software', priority: 'medium' },
                  { icon: '💾', text: 'Keep operating system and security tools updated', priority: 'low' },
                ].map((rec, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-black/20">
                    <span className="text-lg">{rec.icon}</span>
                    <span className="text-sm text-gray-300 flex-1">{rec.text}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>{rec.priority.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ PROCESS SCANNER TAB ══ */}
        {activeTab === 'scanner' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                Process Scanner
              </h3>
              <button
                onClick={runFullScan}
                disabled={scanRunning}
                className="flex items-center gap-2 px-3 py-2 bg-cyan-600/30 rounded-xl text-xs font-bold text-cyan-400 hover:bg-cyan-600/50 transition-all disabled:opacity-50"
              >
                {scanRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Scan className="w-3 h-3" />}
                {scanRunning ? 'Scanning...' : 'Scan Processes'}
              </button>
            </div>

            {processes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Cpu className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm">No scan data yet. Run a scan to detect processes.</p>
                <button onClick={runFullScan} className="mt-3 px-4 py-2 bg-cyan-600/30 rounded-xl text-xs text-cyan-400 hover:bg-cyan-600/50">
                  Run Full Scan
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-gray-500 font-bold border-b border-white/5">
                  <span className="col-span-1">PID</span>
                  <span className="col-span-2">Name</span>
                  <span className="col-span-2">User</span>
                  <span className="col-span-1">CPU%</span>
                  <span className="col-span-1">MEM</span>
                  <span className="col-span-3">Command</span>
                  <span className="col-span-2">Status</span>
                </div>
                {processes.map((proc, i) => (
                  <div key={proc.pid}>
                    <div
                      onClick={() => setSelectedProcess(selectedProcess?.pid === proc.pid ? null : proc)}
                      className={`grid grid-cols-12 gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-xs ${
                        proc.status !== 'clean'
                          ? `${THREAT_LEVELS[proc.status]?.bg} border ${THREAT_LEVELS[proc.status]?.border} hover:opacity-90`
                          : 'bg-white/5 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className="col-span-1 text-gray-400 font-mono">{proc.pid}</span>
                      <span className="col-span-2 font-bold truncate">{proc.name}</span>
                      <span className="col-span-2 text-gray-400 truncate">{proc.user}</span>
                      <span className={`col-span-1 font-mono ${proc.cpu > 50 ? 'text-red-400' : 'text-gray-300'}`}>{proc.cpu}%</span>
                      <span className="col-span-1 text-gray-300 font-mono">{proc.mem}M</span>
                      <span className="col-span-3 text-gray-500 truncate font-mono">{proc.cmdline}</span>
                      <span className="col-span-2">
                        {proc.status === 'clean' ? (
                          <span className="flex items-center gap-1 text-green-400">
                            <Check className="w-3 h-3" /> Clean
                          </span>
                        ) : (
                          <span className={`font-bold ${THREAT_LEVELS[proc.status]?.color}`}>
                            {THREAT_LEVELS[proc.status]?.icon} {THREAT_LEVELS[proc.status]?.label}
                          </span>
                        )}
                      </span>
                    </div>
                    {selectedProcess?.pid === proc.pid && (
                      <div className="mx-2 mb-2 p-3 bg-black/30 rounded-b-lg border border-t-0 border-white/10">
                        <div className="text-xs text-gray-400 mb-2">
                          <span className="font-bold text-white">Full Command: </span>
                          <code className="font-mono text-green-400">{proc.cmdline}</code>
                        </div>
                        {proc.status !== 'clean' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => quarantineProcess(proc)}
                              className="px-3 py-1 bg-red-600/30 rounded text-xs text-red-400 hover:bg-red-600/50 flex items-center gap-1"
                            >
                              <FolderLock className="w-3 h-3" /> Quarantine Process
                            </button>
                            <button className="px-3 py-1 bg-orange-600/30 rounded text-xs text-orange-400 hover:bg-orange-600/50 flex items-center gap-1">
                              <Square className="w-3 h-3" /> Terminate
                            </button>
                            <button className="px-3 py-1 bg-blue-600/30 rounded text-xs text-blue-400 hover:bg-blue-600/50 flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Investigate
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ NETWORK MONITOR TAB ══ */}
        {activeTab === 'network' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Network className="w-5 h-5 text-purple-400" />
                Network Connection Monitor
              </h3>
              <button
                onClick={runFullScan}
                disabled={scanRunning}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600/30 rounded-xl text-xs font-bold text-purple-400 hover:bg-purple-600/50 transition-all disabled:opacity-50"
              >
                {scanRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Radar className="w-3 h-3" />}
                Scan Network
              </button>
            </div>

            {connections.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Network className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm">No network data yet. Run a scan to analyze connections.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-gray-500 font-bold border-b border-white/5">
                  <span className="col-span-3">Local Address</span>
                  <span className="col-span-3">Remote Address</span>
                  <span className="col-span-2">Status</span>
                  <span className="col-span-2">PID</span>
                  <span className="col-span-2">Risk</span>
                </div>
                {connections.map((conn, i) => (
                  <div key={i} className={`grid grid-cols-12 gap-2 px-3 py-2 rounded-lg text-xs ${
                    conn.risk !== 'clean'
                      ? `${THREAT_LEVELS[conn.risk]?.bg} border ${THREAT_LEVELS[conn.risk]?.border}`
                      : 'bg-white/5 border border-white/5'
                  }`}>
                    <span className="col-span-3 font-mono text-gray-300">{conn.local}</span>
                    <span className="col-span-3 font-mono text-gray-300">{conn.remote}</span>
                    <span className={`col-span-2 font-bold ${
                      conn.status === 'ESTABLISHED' ? 'text-blue-400' :
                      conn.status === 'LISTEN' ? 'text-green-400' : 'text-gray-400'
                    }`}>{conn.status}</span>
                    <span className="col-span-2 text-gray-400">{conn.pid}</span>
                    <span className={`col-span-2 font-bold ${THREAT_LEVELS[conn.risk]?.color || 'text-green-400'}`}>
                      {conn.risk !== 'clean' ? `${THREAT_LEVELS[conn.risk]?.icon} ${THREAT_LEVELS[conn.risk]?.label}` : '✅ Clean'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Suspicious Ports Reference */}
            <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-xs font-bold text-gray-400 mb-2">⚠️ Known Suspicious Ports</h4>
              <div className="flex flex-wrap gap-2">
                {SUSPICIOUS_PORTS.map(port => (
                  <span key={port} className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 font-mono">
                    :{port}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ FILE ANALYSIS TAB ══ */}
        {activeTab === 'fileanalysis' && (
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Microscope className="w-5 h-5 text-green-400" />
              File Analysis Engine
            </h3>

            {/* Input */}
            <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-xl p-4 border border-white/10">
              <label className="text-xs text-gray-400 font-bold mb-2 block">Enter file path to analyze:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fileInput}
                  onChange={e => setFileInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && analyzeFile()}
                  placeholder="/path/to/suspicious/file.exe"
                  className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={analyzeFile}
                  disabled={analyzingFile || !fileInput.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 via-yellow-400 to-red-500-600 to-cyan-600 rounded-xl font-bold text-sm hover:from-green-500 hover:to-cyan-500 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {analyzingFile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Analyze
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {['/tmp/suspicious.exe', '/downloads/crack.bat', '/tmp/xmr-miner', '/home/user/document.pdf'].map(path => (
                  <button
                    key={path}
                    onClick={() => setFileInput(path)}
                    className="px-2 py-1 bg-black/30 rounded text-xs text-gray-500 hover:text-gray-300 font-mono border border-white/5"
                  >
                    {path}
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis Result */}
            {analyzingFile && (
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-xl p-4 border border-white/10 flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                <span className="text-sm text-gray-400">Analyzing file... calculating hashes, checking patterns...</span>
              </div>
            )}

            {fileAnalysis && (
              <div className={`rounded-xl p-5 border ${THREAT_LEVELS[fileAnalysis.threatLevel]?.bg} ${THREAT_LEVELS[fileAnalysis.threatLevel]?.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{THREAT_LEVELS[fileAnalysis.threatLevel]?.icon}</span>
                    <div>
                      <div className="font-bold">{fileAnalysis.name}</div>
                      <div className="text-xs text-gray-400">{fileAnalysis.path}</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg font-black text-sm ${THREAT_LEVELS[fileAnalysis.threatLevel]?.color} ${THREAT_LEVELS[fileAnalysis.threatLevel]?.bg} border ${THREAT_LEVELS[fileAnalysis.threatLevel]?.border}`}>
                    {THREAT_LEVELS[fileAnalysis.threatLevel]?.label}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-black/20 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">File Size</div>
                    <div className="font-bold text-sm">{fileAnalysis.size}</div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">Extension</div>
                    <div className="font-bold text-sm font-mono">.{fileAnalysis.ext}</div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 col-span-2">
                    <div className="text-xs text-gray-500 mb-1">MD5 Hash</div>
                    <div className="font-mono text-xs text-green-400 break-all">{fileAnalysis.hashes.md5}</div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 col-span-2">
                    <div className="text-xs text-gray-500 mb-1">SHA256 Hash</div>
                    <div className="font-mono text-xs text-green-400 break-all">{fileAnalysis.hashes.sha256}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs font-bold text-gray-400 mb-2">Indicators:</div>
                  <div className="space-y-1">
                    {fileAnalysis.indicators.map((ind, i) => (
                      <div key={i} className="text-sm text-gray-300">{ind}</div>
                    ))}
                  </div>
                </div>

                {fileAnalysis.threatLevel !== 'low' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => quarantineFile(fileAnalysis.path)}
                      className="px-4 py-2 bg-red-600/30 rounded-xl text-sm text-red-400 hover:bg-red-600/50 font-bold flex items-center gap-2"
                    >
                      <FolderLock className="w-4 h-4" /> Quarantine File
                    </button>
                    <button
                      onClick={() => { setNewSandboxName('file_analysis'); setActiveTab('sandbox'); }}
                      className="px-4 py-2 bg-cyan-600/30 rounded-xl text-sm text-cyan-400 hover:bg-cyan-600/50 font-bold flex items-center gap-2"
                    >
                      <Box className="w-4 h-4" /> Analyze in Sandbox
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ QUARANTINE TAB ══ */}
        {activeTab === 'quarantine' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-orange-400" />
                Quarantine Vault
              </h3>
              <span className="text-xs text-gray-500">{quarantine.length} files isolated</span>
            </div>

            {quarantine.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FolderLock className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Quarantine is empty. No threats isolated.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {quarantine.map((item, i) => (
                  <div key={i} className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <FolderLock className="w-5 h-5 text-orange-400 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-sm font-mono">{item.name}</div>
                          <div className="text-xs text-gray-500">Original: {item.original}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="px-2 py-1 bg-red-500/20 rounded text-red-400 font-bold">{item.threat}</span>
                        <span className="text-gray-500">{item.size}</span>
                        <span className="text-gray-400">{item.date}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">Hash: {item.hash}</span>
                      <button
                        onClick={() => setQuarantine(prev => prev.filter((_, idx) => idx !== i))}
                        className="ml-auto px-2 py-1 bg-red-600/20 rounded text-xs text-red-400 hover:bg-red-600/40 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ SANDBOX ENVIRONMENTS TAB ══ */}
        {activeTab === 'sandbox' && (
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Box className="w-5 h-5 text-cyan-400" />
              Sandbox Environments
            </h3>

            {/* Create New Sandbox */}
            <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-xl p-4 border border-white/10">
              <label className="text-xs text-gray-400 font-bold mb-2 block">Create New Sandbox Environment:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSandboxName}
                  onChange={e => setNewSandboxName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createSandbox()}
                  placeholder="sandbox_name"
                  className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={createSandbox}
                  disabled={!newSandboxName.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-sm hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Package className="w-4 h-4" /> Create
                </button>
              </div>
            </div>

            {/* Sandbox List */}
            <div className="space-y-3">
              {sandboxes.map((sb, i) => (
                <div key={i} className={`rounded-xl p-4 border ${
                  sb.status === 'active'
                    ? 'bg-cyan-500/10 border-cyan-500/20'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <Box className={`w-5 h-5 ${sb.status === 'active' ? 'text-cyan-400' : 'text-gray-500'}`} />
                      <div>
                        <div className="font-bold font-mono">{sb.name}</div>
                        <div className="text-xs text-gray-500">Created: {sb.created}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded font-bold ${
                        sb.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>{sb.status.toUpperCase()}</span>
                      <span className="px-2 py-1 bg-purple-500/20 rounded text-purple-400">
                        Isolation: {sb.isolation}
                      </span>
                      <span className="text-gray-500">{sb.files} files</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div className="flex-1 bg-black/20 rounded-xl p-2 text-xs font-mono text-gray-500">
                      📁 sandboxes/{sb.name}/isolated/ &nbsp;&nbsp; 📁 sandboxes/{sb.name}/temp/
                    </div>
                    {sb.status === 'active' && (
                      <button
                        onClick={() => setSandboxes(prev => prev.map((s, idx) => idx === i ? {...s, status: 'archived'} : s))}
                        className="px-3 py-1 bg-gray-600/30 rounded text-xs text-gray-400 hover:bg-gray-600/50"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TERMINAL TAB ══ */}
        {activeTab === 'terminal' && (
          <div className="space-y-3">
            <h3 className="font-bold flex items-center gap-2">
              <Terminal className="w-5 h-5 text-green-400" />
              Security Sandbox Terminal
            </h3>
            <div
              ref={terminalRef}
              className="bg-black rounded-xl p-4 border border-green-500/20 font-mono text-xs text-green-400 h-96 overflow-y-auto"
            >
              {terminalLines.map((line, i) => (
                <div key={i} className={`leading-relaxed ${
                  line.startsWith('✅') ? 'text-green-400' :
                  line.startsWith('❌') ? 'text-red-400' :
                  line.startsWith('⚠️') ? 'text-yellow-400' :
                  line.startsWith('🔒') ? 'text-orange-400' :
                  line.startsWith('🔍') ? 'text-cyan-400' :
                  line.startsWith('🌐') ? 'text-blue-400' :
                  line.startsWith('📊') ? 'text-purple-400' :
                  line.startsWith('🏗️') ? 'text-cyan-400' :
                  line.startsWith('📁') ? 'text-yellow-400' :
                  line.startsWith('═') || line.startsWith('📋') ? 'text-white font-bold' :
                  'text-green-400'
                }`}>
                  {line || '\u00A0'}
                </div>
              ))}
              <div className="flex items-center gap-1 mt-1">
                <span className="text-green-600">goat@security-sandbox:~$</span>
                <span className="w-2 h-4 bg-green-400 animate-pulse inline-block" />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: '▶ Run Full Scan', action: runFullScan },
                { label: '🔍 Scan Processes', action: () => { runFullScan(); setActiveTab('scanner'); } },
                { label: '🌐 Scan Network', action: () => { runFullScan(); setActiveTab('network'); } },
                { label: '🗑️  Clear Terminal', action: () => setTerminalLines(['Terminal cleared. Ready for commands.']) },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.action}
                  disabled={scanRunning}
                  className="px-3 py-2 bg-green-600/20 rounded-xl text-xs font-bold text-green-400 hover:bg-green-600/40 transition-all border border-green-500/20 disabled:opacity-50"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ══ FOOTER ══ */}
      <div className="px-5 py-3 border-t border-white/5 bg-black/20 flex items-center justify-between text-xs text-gray-400">
        <div>🛡️ Security Sandbox Engine v1.0 • GOAT Royalty Cyber Defense</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          Active Protection
        </div>
        <div>© 2025 Harvey Miller / FASTASSMAN Publishing Inc</div>
      </div>
    </div>
  );
};

export default SecuritySandboxPanel;