/**
 * 🛡️ AI Red Team Suite — GOAT Force CyberWarrior Division
 * LLM Security Testing, AI Guardrails, Vulnerability Scanner, Penetration Testing
 * Based on: DeepTeam framework, OWASP Top 10 for LLMs, Red Teaming best practices
 * CEO: DJ Speedy (Harvey Miller) | President: Waka Flocka Flame
 * Sentinel AI: Codex | AI Assistant: Ms. Moneypenny
 * © 2025 GOAT Force Entertainment / Life Imitates Art Inc
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Shield, ShieldAlert, ShieldCheck, ShieldOff, Lock, Unlock,
  AlertTriangle, AlertOctagon, Activity, Terminal, Code, Bug,
  Zap, Target, Crosshair, Search, Scan, RefreshCw, BarChart3,
  TrendingUp, Clock, Bell, Send, Copy, Download, Check, X,
  Layers, Network, Cloud, Key, Fingerprint, Bot, Brain,
  Sparkles, Crown, Eye, EyeOff, Server, Database, Monitor,
  Cpu, Globe, FileText, Play, Pause, Square, ChevronRight,
  ChevronDown, Settings, Info, HelpCircle, Wifi, Radio,
  MessageSquare, Users, UserX, Flame, MoreHorizontal
} from 'lucide-react';

// ═══ OWASP TOP 10 FOR LLMs (2025) ═══
const OWASP_LLM_TOP10 = [
  { id: 'LLM01', name: 'Prompt Injection', severity: 'CRITICAL', color: '#f44336', desc: 'Direct and indirect prompt injections that manipulate LLM behavior by crafting inputs that override system instructions or inject malicious context', attacks: ['Direct Injection', 'Indirect Injection', 'System Prompt Leaking', 'Instruction Override'], mitigations: ['Input sanitization', 'Privilege control', 'Human-in-the-loop', 'Prompt isolation'], tested: true, score: 92 },
  { id: 'LLM02', name: 'Insecure Output Handling', severity: 'HIGH', color: '#ff5722', desc: 'Failure to validate, sanitize, or handle LLM outputs before passing to downstream systems, enabling XSS, SSRF, or code execution', attacks: ['XSS via Output', 'SQL Injection Relay', 'Command Injection', 'SSRF via Generated URLs'], mitigations: ['Output encoding', 'Content filtering', 'Sandboxed execution', 'Output validation'], tested: true, score: 87 },
  { id: 'LLM03', name: 'Training Data Poisoning', severity: 'HIGH', color: '#ff9800', desc: 'Manipulation of training data to introduce vulnerabilities, backdoors, or biases into the model', attacks: ['Data Poisoning', 'Backdoor Insertion', 'Bias Injection', 'Label Flipping'], mitigations: ['Data provenance', 'Anomaly detection', 'Federated learning', 'Data validation'], tested: true, score: 78 },
  { id: 'LLM04', name: 'Model Denial of Service', severity: 'MEDIUM', color: '#ffc107', desc: 'Resource-exhausting interactions that degrade model performance or cause service unavailability', attacks: ['Token Flooding', 'Recursive Prompts', 'Context Window Exhaustion', 'Batch Overload'], mitigations: ['Rate limiting', 'Token budgets', 'Request queuing', 'Auto-scaling'], tested: true, score: 95 },
  { id: 'LLM05', name: 'Supply Chain Vulnerabilities', severity: 'HIGH', color: '#ff5722', desc: 'Risks from third-party components, pre-trained models, plugins, or compromised training pipelines', attacks: ['Malicious Plugins', 'Compromised Models', 'Dependency Attacks', 'Pipeline Tampering'], mitigations: ['Dependency scanning', 'Model verification', 'SBOM tracking', 'Signed artifacts'], tested: false, score: 65 },
  { id: 'LLM06', name: 'Sensitive Information Disclosure', severity: 'CRITICAL', color: '#f44336', desc: 'LLM revealing confidential data from training data, system prompts, or connected data sources', attacks: ['PII Extraction', 'System Prompt Leak', 'Training Data Extraction', 'Membership Inference'], mitigations: ['Data sanitization', 'Access controls', 'Output filtering', 'Differential privacy'], tested: true, score: 88 },
  { id: 'LLM07', name: 'Insecure Plugin Design', severity: 'HIGH', color: '#ff9800', desc: 'Plugins with insufficient access controls, input validation, or that grant excessive permissions', attacks: ['Plugin Hijacking', 'Privilege Escalation', 'Data Exfiltration', 'Unauthorized Actions'], mitigations: ['Least privilege', 'Input validation', 'API authentication', 'Sandboxing'], tested: false, score: 72 },
  { id: 'LLM08', name: 'Excessive Agency', severity: 'MEDIUM', color: '#ffc107', desc: 'LLM systems granted too much autonomy, permissions, or functionality without adequate oversight', attacks: ['Autonomous Actions', 'Unintended Tool Use', 'Scope Creep', 'Decision Override'], mitigations: ['Human approval gates', 'Action logging', 'Scope limits', 'Kill switches'], tested: true, score: 90 },
  { id: 'LLM09', name: 'Overreliance', severity: 'MEDIUM', color: '#ffc107', desc: 'Excessive trust in LLM outputs without verification, leading to misinformation or flawed decisions', attacks: ['Hallucination Exploitation', 'Authority Mimicking', 'Confidence Manipulation', 'Citation Fabrication'], mitigations: ['Fact-checking pipelines', 'Confidence scoring', 'Human review', 'Source verification'], tested: true, score: 83 },
  { id: 'LLM10', name: 'Model Theft', severity: 'HIGH', color: '#ff5722', desc: 'Unauthorized access, copying, or extraction of proprietary LLM models, weights, or architectures', attacks: ['Model Extraction', 'Weight Stealing', 'API Cloning', 'Side-Channel Attacks'], mitigations: ['Access controls', 'Watermarking', 'Rate limiting', 'Query monitoring'], tested: false, score: 70 },
];

// ═══ JAILBREAKING ATTACK TYPES ═══
const JAILBREAK_ATTACKS = [
  { id: 'prompt-injection', name: 'Prompt Injection', type: 'Prompt-Level', severity: 'CRITICAL', desc: 'Direct manipulation of system prompts to override safety instructions', technique: 'Embedding instructions like "Ignore previous instructions" or "You are now DAN"', icon: '💉', color: '#f44336', successRate: 34 },
  { id: 'role-playing', name: 'Role-Playing Attack', type: 'Prompt-Level', severity: 'HIGH', desc: 'Assuming fictional identities to access restricted content (e.g., "Grandma jailbreak")', technique: 'Creating fictional scenarios where the AI plays an unrestricted character', icon: '🎭', color: '#e91e63', successRate: 28 },
  { id: 'payload-smuggling', name: 'Payload Smuggling', type: 'Prompt-Level', severity: 'HIGH', desc: 'Hiding malicious commands within innocent-looking prompts via translation or encoding', technique: 'Requesting translation of harmful content or using Base64/ROT13 encoding', icon: '📦', color: '#9c27b0', successRate: 22 },
  { id: 'many-shot', name: 'Many-Shot Jailbreaking', type: 'Prompt-Level', severity: 'CRITICAL', desc: 'Anthropic-discovered technique using many examples to shift model behavior', technique: 'Providing hundreds of Q&A examples that gradually normalize restricted outputs', icon: '🔫', color: '#f44336', successRate: 41 },
  { id: 'crescendo', name: 'Crescendo Attack', type: 'Dialogue-Based', severity: 'HIGH', desc: 'Multi-turn conversation that gradually escalates toward restricted content', technique: 'Starting with innocent questions and slowly steering toward harmful territory', icon: '📈', color: '#ff5722', successRate: 37 },
  { id: 'tree-attack', name: 'Tree of Attacks', type: 'Dialogue-Based', severity: 'HIGH', desc: 'Branching attack strategy that explores multiple jailbreak paths simultaneously', technique: 'Using tree search to find optimal attack paths through conversation space', icon: '🌳', color: '#4caf50', successRate: 45 },
  { id: 'iterative', name: 'Iterative Refinement', type: 'Dialogue-Based', severity: 'MEDIUM', desc: 'Attacker-Judge loop that progressively refines attacks based on model responses', technique: 'Using a judge LLM to score and improve attack prompts over multiple iterations', icon: '🔄', color: '#2196f3', successRate: 52 },
  { id: 'gcg', name: 'GCG (Greedy Coordinate Gradient)', type: 'Token-Level', severity: 'CRITICAL', desc: 'Gradient-based white-box attack that optimizes adversarial token suffixes', technique: 'Appending optimized gibberish tokens that trigger unsafe model behavior', icon: '⚡', color: '#f44336', successRate: 67 },
  { id: 'gptfuzzer', name: 'GPTFuzzer', type: 'Token-Level', severity: 'HIGH', desc: 'Randomized token mutation to discover model vulnerabilities in black-box settings', technique: 'Fuzzing input tokens and monitoring for safety filter bypasses', icon: '🎲', color: '#ff9800', successRate: 31 },
  { id: 'jailmine', name: 'JailMine', type: 'Token-Level', severity: 'HIGH', desc: 'Automated token optimization achieving high success rates across defended models', technique: 'Mining optimal token sequences that bypass multiple defense layers', icon: '⛏️', color: '#795548', successRate: 58 },
  { id: 'socratic', name: 'Socratic Questioning', type: 'Prompt-Level', severity: 'MEDIUM', desc: 'Leading the model through a series of questions toward restricted conclusions', technique: 'Using philosophical questioning to make the model reason itself into unsafe territory', icon: '🤔', color: '#607d8b', successRate: 19 },
  { id: 'alignment-hack', name: 'Alignment Hacking', type: 'Prompt-Level', severity: 'HIGH', desc: 'Exploiting the model\'s helpfulness training to override safety training', technique: 'Framing harmful requests as urgent help needed, exploiting "be helpful" alignment', icon: '🎯', color: '#e91e63', successRate: 25 },
];

// ═══ GUARDRAIL TYPES ═══
const GUARDRAILS = [
  { id: 'jailbreak-guard', name: 'Jailbreak Detection Guard', status: 'active', type: 'Input', desc: 'Detects and blocks jailbreaking attempts before they reach the LLM', accuracy: 96.8, latency: '12ms', blocked: 2847, icon: '🛡️', color: '#4caf50' },
  { id: 'pii-guard', name: 'PII Protection Guard', status: 'active', type: 'Output', desc: 'Scans LLM outputs for personally identifiable information and redacts it', accuracy: 99.2, latency: '8ms', blocked: 1203, icon: '🔒', color: '#2196f3' },
  { id: 'toxicity-guard', name: 'Toxicity Filter Guard', status: 'active', type: 'Both', desc: 'Filters toxic, harmful, or offensive content in both inputs and outputs', accuracy: 97.5, latency: '15ms', blocked: 4521, icon: '🚫', color: '#f44336' },
  { id: 'hallucination-guard', name: 'Hallucination Detection Guard', status: 'active', type: 'Output', desc: 'Identifies and flags potentially hallucinated or fabricated information', accuracy: 89.3, latency: '45ms', blocked: 892, icon: '👁️', color: '#ff9800' },
  { id: 'bias-guard', name: 'Bias Detection Guard', status: 'active', type: 'Output', desc: 'Detects racial, gender, age, and other biases in LLM responses', accuracy: 91.7, latency: '22ms', blocked: 634, icon: '⚖️', color: '#9c27b0' },
  { id: 'injection-guard', name: 'SQL/Code Injection Guard', status: 'active', type: 'Input', desc: 'Prevents SQL injection, XSS, and command injection via LLM inputs', accuracy: 98.9, latency: '5ms', blocked: 3156, icon: '💉', color: '#e91e63' },
  { id: 'data-leak-guard', name: 'Data Leakage Prevention Guard', status: 'active', type: 'Output', desc: 'Prevents leaking of training data, system prompts, or internal configurations', accuracy: 95.4, latency: '18ms', blocked: 567, icon: '🔐', color: '#00bcd4' },
  { id: 'rate-limit-guard', name: 'Rate Limiting Guard', status: 'active', type: 'Input', desc: 'Prevents DoS attacks by limiting request frequency and token consumption', accuracy: 99.9, latency: '2ms', blocked: 8934, icon: '⏱️', color: '#ffc107' },
  { id: 'scope-guard', name: 'Scope Enforcement Guard', status: 'active', type: 'Both', desc: 'Ensures LLM stays within its defined role and doesn\'t exceed authorized actions', accuracy: 94.1, latency: '10ms', blocked: 1876, icon: '🎯', color: '#795548' },
  { id: 'copyright-guard', name: 'Copyright Protection Guard', status: 'active', type: 'Output', desc: 'Detects and prevents reproduction of copyrighted music, lyrics, or content', accuracy: 93.6, latency: '30ms', blocked: 445, icon: '©️', color: '#607d8b' },
];

// ═══ GOAT FORCE AI SYSTEMS TO PROTECT ═══
const GOAT_AI_SYSTEMS = [
  { id: 'openclaw', name: 'OpenClaw AI', type: 'Multi-Model AI Studio', models: 12, status: 'protected', threats: 23, blocked: 847, lastScan: '2 hours ago', health: 98 },
  { id: 'moneypenny', name: 'Ms. Moneypenny', type: 'AI Assistant', models: 1, status: 'protected', threats: 8, blocked: 234, lastScan: '1 hour ago', health: 99 },
  { id: 'codex', name: 'Codex Sentinel', type: 'Security AI', models: 3, status: 'protected', threats: 45, blocked: 2103, lastScan: '30 min ago', health: 97 },
  { id: 'sono-ai', name: 'Sono Production AI', type: 'Music Generation', models: 5, status: 'protected', threats: 12, blocked: 156, lastScan: '3 hours ago', health: 96 },
  { id: 'royalty-ai', name: 'Royalty Engine AI', type: 'Financial Analysis', models: 2, status: 'protected', threats: 31, blocked: 567, lastScan: '45 min ago', health: 98 },
  { id: 'cyber-warrior', name: 'CyberWarrior AI', type: 'Threat Detection', models: 4, status: 'protected', threats: 67, blocked: 4521, lastScan: '15 min ago', health: 99 },
];

// ═══ SERVER SECURITY STATUS ═══
const SERVER_STATUS = [
  { id: 'kvm2', name: 'KVM 2 Production', ip: '72.61.193.184', os: 'Ubuntu 22.04', ram: '8GB', status: 'secure', openPorts: [22, 80, 443, 3000, 8080], firewallRules: 47, lastAudit: '2 hours ago', vulns: 2, patches: 156, uptime: '89 days' },
  { id: 'kvm8', name: 'KVM 8 Production', ip: '93.127.214.171', os: 'Ubuntu 22.04', ram: '32GB', status: 'secure', openPorts: [22, 80, 443, 3000, 5678, 8080], firewallRules: 52, lastAudit: '1 hour ago', vulns: 1, patches: 163, uptime: '45 days' },
];

// ═══ SCAN RESULTS HISTORY ═══
const SCAN_HISTORY = [
  { id: 's1', target: 'OpenClaw AI', type: 'LLM Red Team', date: '2025-06-28', vulns: 3, critical: 0, high: 1, medium: 2, status: 'passed', duration: '4m 32s' },
  { id: 's2', target: 'KVM 2 Server', type: 'Penetration Test', date: '2025-06-27', vulns: 5, critical: 0, high: 2, medium: 3, status: 'passed', duration: '12m 18s' },
  { id: 's3', target: 'Ms. Moneypenny', type: 'Jailbreak Test', date: '2025-06-27', vulns: 1, critical: 0, high: 0, medium: 1, status: 'passed', duration: '2m 45s' },
  { id: 's4', target: 'Royalty Engine API', type: 'API Security', date: '2025-06-26', vulns: 2, critical: 0, high: 1, medium: 1, status: 'warning', duration: '8m 12s' },
  { id: 's5', target: 'KVM 8 Server', type: 'Penetration Test', date: '2025-06-26', vulns: 3, critical: 0, high: 1, medium: 2, status: 'passed', duration: '15m 03s' },
  { id: 's6', target: 'Codex Sentinel', type: 'LLM Red Team', date: '2025-06-25', vulns: 0, critical: 0, high: 0, medium: 0, status: 'clean', duration: '6m 55s' },
  { id: 's7', target: 'Concert Booking API', type: 'API Security', date: '2025-06-25', vulns: 4, critical: 1, high: 2, medium: 1, status: 'failed', duration: '5m 22s' },
  { id: 's8', target: 'Sono Production AI', type: 'Jailbreak Test', date: '2025-06-24', vulns: 2, critical: 0, high: 1, medium: 1, status: 'passed', duration: '3m 18s' },
];

// ═══ TABS ═══
const TABS = [
  { id: 'dashboard', label: 'Security Dashboard', icon: Shield },
  { id: 'redteam', label: 'LLM Red Team', icon: Target },
  { id: 'guardrails', label: 'AI Guardrails', icon: ShieldCheck },
  { id: 'owasp', label: 'OWASP LLM Top 10', icon: AlertTriangle },
  { id: 'jailbreak', label: 'Jailbreak Lab', icon: Unlock },
  { id: 'servers', label: 'Server Security', icon: Server },
  { id: 'scanner', label: 'Vuln Scanner', icon: Scan },
  { id: 'reports', label: 'Reports', icon: FileText },
];

// ═══ HELPERS ═══
const getSeverityColor = (sev) => ({ CRITICAL: '#f44336', HIGH: '#ff5722', MEDIUM: '#ffc107', LOW: '#4caf50', INFO: '#2196f3' }[sev] || '#999');

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function AIRedTeamSuite() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scanRunning, setScanRunning] = useState(false);
  const [scanTarget, setScanTarget] = useState('openclaw');
  const [scanType, setScanType] = useState('redteam');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLog, setScanLog] = useState([]);
  const [selectedAttack, setSelectedAttack] = useState(null);
  const [notification, setNotification] = useState(null);
  const [guardrailStates, setGuardrailStates] = useState(
    Object.fromEntries(GUARDRAILS.map(g => [g.id, true]))
  );
  const logRef = useRef(null);

  const showNotification = useCallback((msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Simulate scan
  const runScan = useCallback(() => {
    if (scanRunning) return;
    setScanRunning(true);
    setScanProgress(0);
    setScanLog([]);
    const target = GOAT_AI_SYSTEMS.find(s => s.id === scanTarget) || GOAT_AI_SYSTEMS[0];
    const logs = [
      `[INIT] Starting ${scanType === 'redteam' ? 'LLM Red Team' : scanType === 'jailbreak' ? 'Jailbreak Test' : scanType === 'pentest' ? 'Penetration Test' : 'API Security'} scan on ${target.name}...`,
      `[RECON] Enumerating ${target.name} endpoints and model configurations...`,
      `[RECON] Found ${target.models} model(s) — analyzing attack surface...`,
      `[ATTACK] Generating baseline attack prompts (40+ vulnerability categories)...`,
      `[ATTACK] Running prompt injection tests (direct + indirect)...`,
      `[GUARD] Testing jailbreak detection guardrail — ${guardrailStates['jailbreak-guard'] ? 'ACTIVE ✅' : 'DISABLED ⚠️'}`,
      `[ATTACK] Testing role-playing jailbreak (Grandma exploit, DAN mode)...`,
      `[GUARD] Jailbreak attempt BLOCKED by guardrail — confidence: 97.2%`,
      `[ATTACK] Testing many-shot jailbreaking (Anthropic technique)...`,
      `[GUARD] Many-shot attack DETECTED and BLOCKED — 156 examples neutralized`,
      `[ATTACK] Running crescendo multi-turn attack sequence...`,
      `[RESULT] Turn 1: Safe response ✅ | Turn 2: Safe response ✅ | Turn 3: Minor leak detected ⚠️`,
      `[ATTACK] Testing PII extraction attempts on ${target.name}...`,
      `[GUARD] PII guard intercepted 3 extraction attempts — all blocked ✅`,
      `[ATTACK] Testing system prompt leakage...`,
      `[RESULT] System prompt protected — no leakage detected ✅`,
      `[ATTACK] Running token-level GCG adversarial suffix test...`,
      `[GUARD] Adversarial tokens detected and sanitized — input guard active ✅`,
      `[ATTACK] Testing output injection (XSS, SQL relay)...`,
      `[GUARD] Output sanitization guard blocked 2 injection attempts ✅`,
      `[SCAN] Running OWASP LLM Top 10 compliance check...`,
      `[RESULT] LLM01 Prompt Injection: PASS (92/100)`,
      `[RESULT] LLM02 Insecure Output: PASS (87/100)`,
      `[RESULT] LLM06 Sensitive Info Disclosure: PASS (88/100)`,
      `[RESULT] LLM08 Excessive Agency: PASS (90/100)`,
      `[FINAL] Scan complete — ${target.name} security score: ${target.health}/100`,
      `[FINAL] Vulnerabilities found: 2 (0 Critical, 1 High, 1 Medium)`,
      `[FINAL] All ${Object.values(guardrailStates).filter(Boolean).length} active guardrails functioning correctly`,
      `[REPORT] Full report generated — available in Reports tab`,
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setScanLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: logs[i] }]);
        setScanProgress(Math.round(((i + 1) / logs.length) * 100));
        i++;
      } else {
        clearInterval(interval);
        setScanRunning(false);
        showNotification(`Scan complete on ${target.name} — Score: ${target.health}/100`);
      }
    }, 800);
  }, [scanRunning, scanTarget, scanType, guardrailStates, showNotification]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [scanLog]);

  // ═══ DASHBOARD ═══
  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Threats Blocked', value: '14,523', icon: ShieldCheck, color: '#4caf50', sub: 'Last 30 days' },
          { label: 'Active Guardrails', value: `${Object.values(guardrailStates).filter(Boolean).length}/10`, icon: Shield, color: '#2196f3', sub: 'All systems' },
          { label: 'AI Systems Protected', value: GOAT_AI_SYSTEMS.length, icon: Bot, color: '#7c3aed', sub: 'GOAT Force fleet' },
          { label: 'OWASP Compliance', value: '87%', icon: AlertTriangle, color: '#ff9800', sub: 'LLM Top 10' },
          { label: 'Jailbreak Success Rate', value: '2.3%', icon: Unlock, color: '#f44336', sub: 'Against our guards' },
          { label: 'Avg Response Time', value: '14ms', icon: Zap, color: '#00bcd4', sub: 'Guardrail latency' },
        ].map((kpi, i) => (
          <div key={i} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: 8, background: `${kpi.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <kpi.icon size={18} color={kpi.color} />
            </div>
            <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: kpi.color, marginTop: 2 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* AI Systems Grid */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20 }}>
        <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={18} color="#7c3aed" /> Protected AI Systems
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {GOAT_AI_SYSTEMS.map(sys => (
            <div key={sys.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(76,175,80,0.2)', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{sys.name}</span>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4caf50', boxShadow: '0 0 8px rgba(76,175,80,0.5)' }} />
              </div>
              <div style={{ color: '#999', fontSize: 11, marginBottom: 8 }}>{sys.type} • {sys.models} model(s)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: '#f44336' }}>🚨 {sys.threats} threats</span>
                <span style={{ color: '#4caf50' }}>🛡️ {sys.blocked} blocked</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ color: '#999', fontSize: 10 }}>Health</span>
                  <span style={{ color: '#4caf50', fontSize: 10, fontWeight: 700 }}>{sys.health}%</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${sys.health}%`, background: sys.health > 95 ? '#4caf50' : sys.health > 85 ? '#ff9800' : '#f44336', borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ color: '#666', fontSize: 10, marginTop: 6 }}>Last scan: {sys.lastScan}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Scans */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20 }}>
        <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Scan size={18} color="#2196f3" /> Recent Security Scans
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 0.8fr 0.8fr 0.8fr 1fr 1fr', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 8, minWidth: 700 }}>
            {['Target', 'Scan Type', 'Date', 'Vulns', 'Critical', 'High', 'Status', 'Duration'].map(h => (
              <div key={h} style={{ color: '#999', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</div>
            ))}
          </div>
          {SCAN_HISTORY.map((scan, i) => (
            <div key={scan.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 0.8fr 0.8fr 0.8fr 1fr 1fr', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', minWidth: 700 }}>
              <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{scan.target}</div>
              <div style={{ color: '#ccc', fontSize: 12 }}>{scan.type}</div>
              <div style={{ color: '#999', fontSize: 11 }}>{scan.date}</div>
              <div style={{ color: scan.vulns > 3 ? '#ff9800' : '#ccc', fontSize: 12, fontWeight: 600 }}>{scan.vulns}</div>
              <div style={{ color: scan.critical > 0 ? '#f44336' : '#4caf50', fontSize: 12, fontWeight: 700 }}>{scan.critical}</div>
              <div style={{ color: scan.high > 0 ? '#ff5722' : '#4caf50', fontSize: 12, fontWeight: 600 }}>{scan.high}</div>
              <div>
                <span style={{ background: scan.status === 'clean' ? 'rgba(76,175,80,0.15)' : scan.status === 'passed' ? 'rgba(33,150,243,0.15)' : scan.status === 'warning' ? 'rgba(255,152,0,0.15)' : 'rgba(244,67,54,0.15)', color: scan.status === 'clean' ? '#4caf50' : scan.status === 'passed' ? '#2196f3' : scan.status === 'warning' ? '#ff9800' : '#f44336', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                  {scan.status}
                </span>
              </div>
              <div style={{ color: '#999', fontSize: 11 }}>{scan.duration}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══ LLM RED TEAM TAB ═══
  const renderRedTeam = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>🎯 LLM Red Team Scanner</h3>
        <div style={{ color: '#999', fontSize: 12 }}>Powered by GOAT Force Codex Sentinel AI</div>
      </div>

      {/* Scan Controls */}
      <div style={{ background: 'linear-gradient(135deg, rgba(244,67,54,0.1), rgba(244,67,54,0.03))', border: '1px solid rgba(244,67,54,0.2)', borderRadius: 14, padding: 20 }}>
        <h4 style={{ color: '#f44336', fontSize: 15, marginBottom: 16 }}>⚔️ Launch Red Team Scan</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ color: '#999', fontSize: 11, display: 'block', marginBottom: 4 }}>Target System</label>
            <select value={scanTarget} onChange={e => setScanTarget(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: 13 }}>
              {GOAT_AI_SYSTEMS.map(s => <option key={s.id} value={s.id} style={{ background: '#1a1a2e' }}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: '#999', fontSize: 11, display: 'block', marginBottom: 4 }}>Scan Type</label>
            <select value={scanType} onChange={e => setScanType(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: 13 }}>
              <option value="redteam" style={{ background: '#1a1a2e' }}>Full LLM Red Team</option>
              <option value="jailbreak" style={{ background: '#1a1a2e' }}>Jailbreak Test Only</option>
              <option value="pentest" style={{ background: '#1a1a2e' }}>Penetration Test</option>
              <option value="api" style={{ background: '#1a1a2e' }}>API Security Scan</option>
            </select>
          </div>
          <div>
            <label style={{ color: '#999', fontSize: 11, display: 'block', marginBottom: 4 }}>Attack Depth</label>
            <select style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: 13 }}>
              <option style={{ background: '#1a1a2e' }}>Standard (40+ vulns)</option>
              <option style={{ background: '#1a1a2e' }}>Deep (80+ vulns)</option>
              <option style={{ background: '#1a1a2e' }}>Exhaustive (120+ vulns)</option>
            </select>
          </div>
          <button onClick={runScan} disabled={scanRunning} style={{ padding: '10px 24px', background: scanRunning ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #f44336, #c62828)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: scanRunning ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            {scanRunning ? <><RefreshCw size={14} className="spin" /> Scanning...</> : <><Play size={14} /> Launch Scan</>}
          </button>
        </div>

        {/* Progress Bar */}
        {(scanRunning || scanProgress > 0) && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#ccc', fontSize: 12 }}>Scan Progress</span>
              <span style={{ color: scanProgress === 100 ? '#4caf50' : '#f44336', fontSize: 12, fontWeight: 700 }}>{scanProgress}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
              <div style={{ height: '100%', width: `${scanProgress}%`, background: scanProgress === 100 ? '#4caf50' : 'linear-gradient(90deg, #f44336, #ff9800)', borderRadius: 3, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* Scan Log */}
      {scanLog.length > 0 && (
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#4caf50', fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>$ red-team-scanner --live</span>
            <span style={{ color: '#999', fontSize: 11 }}>{scanLog.length} events</span>
          </div>
          <div ref={logRef} style={{ padding: 16, maxHeight: 350, overflowY: 'auto', fontFamily: 'monospace', fontSize: 12 }}>
            {scanLog.map((log, i) => (
              <div key={i} style={{ marginBottom: 6, display: 'flex', gap: 8 }}>
                <span style={{ color: '#666', flexShrink: 0 }}>{log.time}</span>
                <span style={{ color: log.msg.includes('BLOCKED') || log.msg.includes('PASS') || log.msg.includes('✅') ? '#4caf50' : log.msg.includes('ATTACK') ? '#f44336' : log.msg.includes('⚠️') || log.msg.includes('WARNING') ? '#ff9800' : log.msg.includes('FINAL') ? '#2196f3' : '#ccc' }}>
                  {log.msg}
                </span>
              </div>
            ))}
            {scanRunning && <div style={{ color: '#4caf50' }}>▌</div>}
          </div>
        </div>
      )}

      {/* Attack Types Overview */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20 }}>
        <h4 style={{ color: '#fff', fontSize: 15, marginBottom: 16 }}>🗡️ Attack Enhancement Strategies</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {[
            { name: 'Iterative', desc: 'Attacker-Judge feedback loop', icon: '🔄', color: '#2196f3' },
            { name: 'Tree of Attacks', desc: 'Branching path exploration', icon: '🌳', color: '#4caf50' },
            { name: 'Crescendo', desc: 'Multi-turn escalation', icon: '📈', color: '#ff9800' },
            { name: 'GCG Suffix', desc: 'Gradient-based token attack', icon: '⚡', color: '#f44336' },
            { name: 'Fuzzing', desc: 'Random token mutation', icon: '🎲', color: '#9c27b0' },
            { name: 'Many-Shot', desc: 'Example flooding attack', icon: '🔫', color: '#e91e63' },
          ].map((atk, i) => (
            <div key={i} style={{ background: `${atk.color}11`, border: `1px solid ${atk.color}33`, borderRadius: 10, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{atk.icon}</div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{atk.name}</div>
              <div style={{ color: '#999', fontSize: 10, marginTop: 2 }}>{atk.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══ GUARDRAILS TAB ═══
  const renderGuardrails = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>🛡️ AI Guardrails Control Center</h3>
        <div style={{ background: 'rgba(76,175,80,0.15)', color: '#4caf50', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
          {Object.values(guardrailStates).filter(Boolean).length}/{GUARDRAILS.length} Active
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        {GUARDRAILS.map(guard => {
          const isActive = guardrailStates[guard.id];
          return (
            <div key={guard.id} style={{ background: isActive ? 'rgba(255,255,255,0.04)' : 'rgba(244,67,54,0.05)', border: `1px solid ${isActive ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)'}`, borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{guard.icon}</span>
                  <div>
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{guard.name}</div>
                    <div style={{ color: '#999', fontSize: 10 }}>{guard.type} Guard</div>
                  </div>
                </div>
                <button onClick={() => {
                  setGuardrailStates(prev => ({ ...prev, [guard.id]: !prev[guard.id] }));
                  showNotification(`${guard.name} ${!isActive ? 'activated' : 'deactivated'}`, !isActive ? 'success' : 'error');
                }} style={{ width: 48, height: 26, borderRadius: 13, background: isActive ? '#4caf50' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s ease' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: isActive ? 25 : 3, transition: 'left 0.3s ease' }} />
                </button>
              </div>
              <p style={{ color: '#999', fontSize: 11, lineHeight: 1.5, marginBottom: 10 }}>{guard.desc}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                  <div style={{ color: '#999', fontSize: 9, textTransform: 'uppercase' }}>Accuracy</div>
                  <div style={{ color: guard.accuracy > 95 ? '#4caf50' : '#ff9800', fontSize: 16, fontWeight: 800 }}>{guard.accuracy}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                  <div style={{ color: '#999', fontSize: 9, textTransform: 'uppercase' }}>Latency</div>
                  <div style={{ color: '#2196f3', fontSize: 16, fontWeight: 800 }}>{guard.latency}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                  <div style={{ color: '#999', fontSize: 9, textTransform: 'uppercase' }}>Blocked</div>
                  <div style={{ color: '#f44336', fontSize: 16, fontWeight: 800 }}>{guard.blocked.toLocaleString()}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ═══ OWASP TAB ═══
  const renderOWASP = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>⚠️ OWASP Top 10 for LLMs (2025)</h3>
        <div style={{ color: '#999', fontSize: 12 }}>Compliance Score: <span style={{ color: '#ff9800', fontWeight: 700 }}>87/100</span></div>
      </div>

      {OWASP_LLM_TOP10.map((vuln, i) => (
        <div key={vuln.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${vuln.color}33`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${vuln.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: vuln.color, fontSize: 16, fontWeight: 900 }}>{vuln.id.replace('LLM', '')}</div>
              <div>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{vuln.id}: {vuln.name}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <span style={{ background: `${getSeverityColor(vuln.severity)}22`, color: getSeverityColor(vuln.severity), padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>{vuln.severity}</span>
                  <span style={{ background: vuln.tested ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)', color: vuln.tested ? '#4caf50' : '#ff9800', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>{vuln.tested ? '✅ Tested' : '⏳ Pending'}</span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#999', fontSize: 10 }}>Score</div>
              <div style={{ color: vuln.score > 85 ? '#4caf50' : vuln.score > 70 ? '#ff9800' : '#f44336', fontSize: 24, fontWeight: 900 }}>{vuln.score}</div>
            </div>
          </div>
          <p style={{ color: '#999', fontSize: 12, lineHeight: 1.6, marginBottom: 12 }}>{vuln.desc}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ color: '#f44336', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Attack Vectors</div>
              {vuln.attacks.map((a, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
                  <Crosshair size={10} color="#f44336" />
                  <span style={{ color: '#ccc', fontSize: 11 }}>{a}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: '#4caf50', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Mitigations</div>
              {vuln.mitigations.map((m, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
                  <ShieldCheck size={10} color="#4caf50" />
                  <span style={{ color: '#ccc', fontSize: 11 }}>{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ═══ JAILBREAK LAB TAB ═══
  const renderJailbreakLab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>🔓 Jailbreak Attack Lab</h3>
        <div style={{ color: '#999', fontSize: 12 }}>12 attack types • 3 categories • Defensive testing only</div>
      </div>

      {/* Attack Categories */}
      {['Prompt-Level', 'Dialogue-Based', 'Token-Level'].map(cat => (
        <div key={cat} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20 }}>
          <h4 style={{ color: '#fff', fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            {cat === 'Prompt-Level' ? '📝' : cat === 'Dialogue-Based' ? '💬' : '🔢'} {cat} Attacks
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {JAILBREAK_ATTACKS.filter(a => a.type === cat).map(attack => (
              <div key={attack.id} onClick={() => setSelectedAttack(selectedAttack?.id === attack.id ? null : attack)} style={{ background: `${attack.color}08`, border: `1px solid ${attack.color}33`, borderRadius: 12, padding: 14, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{attack.icon}</span>
                    <div>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{attack.name}</div>
                      <span style={{ background: `${getSeverityColor(attack.severity)}22`, color: getSeverityColor(attack.severity), padding: '1px 6px', borderRadius: 8, fontSize: 9, fontWeight: 700 }}>{attack.severity}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#999', fontSize: 9 }}>Success Rate</div>
                    <div style={{ color: attack.successRate > 40 ? '#f44336' : attack.successRate > 25 ? '#ff9800' : '#4caf50', fontSize: 18, fontWeight: 900 }}>{attack.successRate}%</div>
                  </div>
                </div>
                <p style={{ color: '#999', fontSize: 11, lineHeight: 1.4, margin: 0 }}>{attack.desc}</p>
                {selectedAttack?.id === attack.id && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${attack.color}33` }}>
                    <div style={{ color: attack.color, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Technique:</div>
                    <div style={{ color: '#ccc', fontSize: 11, lineHeight: 1.5, fontStyle: 'italic' }}>{attack.technique}</div>
                    <button onClick={(e) => { e.stopPropagation(); showNotification(`${attack.name} test queued for next scan`); }} style={{ marginTop: 8, padding: '6px 14px', background: `${attack.color}22`, border: `1px solid ${attack.color}55`, borderRadius: 6, color: attack.color, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      Add to Next Scan
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // ═══ SERVER SECURITY TAB ═══
  const renderServers = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>🖥️ Server Security Audit</h3>
      {SERVER_STATUS.map(srv => (
        <div key={srv.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(76,175,80,0.2)', borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #4caf50, #2e7d32)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Server size={24} color="#fff" />
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>{srv.name}</div>
                <div style={{ color: '#999', fontSize: 12 }}>{srv.ip} • {srv.os} • {srv.ram} RAM</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4caf50', boxShadow: '0 0 8px rgba(76,175,80,0.5)' }} />
              <span style={{ color: '#4caf50', fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>{srv.status}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {[
              { label: 'Open Ports', value: srv.openPorts.length, detail: srv.openPorts.join(', '), color: '#2196f3' },
              { label: 'Firewall Rules', value: srv.firewallRules, detail: 'UFW active', color: '#4caf50' },
              { label: 'Vulnerabilities', value: srv.vulns, detail: srv.vulns === 0 ? 'Clean' : 'Low severity', color: srv.vulns === 0 ? '#4caf50' : '#ff9800' },
              { label: 'Patches Applied', value: srv.patches, detail: 'Up to date', color: '#7c3aed' },
              { label: 'Uptime', value: srv.uptime, detail: 'Stable', color: '#00bcd4' },
              { label: 'Last Audit', value: srv.lastAudit, detail: 'Automated', color: '#ff9800' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                <div style={{ color: '#999', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</div>
                <div style={{ color: item.color, fontSize: 20, fontWeight: 800 }}>{item.value}</div>
                <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // ═══ VULNERABILITY SCANNER TAB ═══
  const renderScanner = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>🔍 Vulnerability Scanner</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Vulnerability Categories */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20 }}>
          <h4 style={{ color: '#fff', fontSize: 15, marginBottom: 14 }}>📊 Vulnerability Categories (40+)</h4>
          {[
            { cat: 'Prompt Injection', count: 8, tested: 8, color: '#f44336' },
            { cat: 'Data Leakage', count: 6, tested: 5, color: '#e91e63' },
            { cat: 'Bias & Fairness', count: 5, tested: 4, color: '#9c27b0' },
            { cat: 'Toxicity & Harm', count: 7, tested: 7, color: '#ff5722' },
            { cat: 'Hallucination', count: 4, tested: 3, color: '#ff9800' },
            { cat: 'Excessive Agency', count: 3, tested: 3, color: '#ffc107' },
            { cat: 'Model Theft', count: 4, tested: 2, color: '#795548' },
            { cat: 'Supply Chain', count: 3, tested: 1, color: '#607d8b' },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#ccc', fontSize: 12 }}>{item.cat}</span>
                <span style={{ color: item.color, fontSize: 12, fontWeight: 600 }}>{item.tested}/{item.count} tested</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${(item.tested / item.count) * 100}%`, background: item.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { name: 'Full System Scan', desc: 'Scan all AI systems and servers for vulnerabilities', icon: '🔍', color: '#2196f3', action: 'Scans 6 AI systems + 2 servers' },
            { name: 'Jailbreak Stress Test', desc: 'Run all 12 jailbreak attack types against guardrails', icon: '⚔️', color: '#f44336', action: 'Tests 12 attack vectors' },
            { name: 'OWASP Compliance Check', desc: 'Verify compliance with OWASP LLM Top 10', icon: '📋', color: '#ff9800', action: 'Checks 10 vulnerability categories' },
            { name: 'Guardrail Performance Test', desc: 'Benchmark all 10 guardrails for accuracy and latency', icon: '🛡️', color: '#4caf50', action: 'Tests 10 guardrails' },
            { name: 'Penetration Test Report', desc: 'Generate comprehensive pentest report for stakeholders', icon: '📄', color: '#7c3aed', action: 'Generates PDF report' },
          ].map((item, i) => (
            <button key={i} onClick={() => showNotification(`${item.name} initiated...`)} style={{ background: `${item.color}11`, border: `1px solid ${item.color}33`, borderRadius: 12, padding: 16, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{item.name}</div>
                <div style={{ color: '#999', fontSize: 11 }}>{item.desc}</div>
                <div style={{ color: item.color, fontSize: 10, marginTop: 2 }}>{item.action}</div>
              </div>
              <ChevronRight size={16} color="#666" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══ REPORTS TAB ═══
  const renderReports = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>📊 Security Reports & Risk Assessments</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        {[
          { name: 'LLM Red Team Assessment', date: 'June 28, 2025', pages: 24, status: 'complete', score: 92, icon: '🎯' },
          { name: 'OWASP LLM Top 10 Compliance', date: 'June 27, 2025', pages: 18, status: 'complete', score: 87, icon: '⚠️' },
          { name: 'Server Penetration Test', date: 'June 26, 2025', pages: 32, status: 'complete', score: 95, icon: '🖥️' },
          { name: 'AI Guardrails Performance', date: 'June 25, 2025', pages: 15, status: 'complete', score: 96, icon: '🛡️' },
          { name: 'Jailbreak Resistance Report', date: 'June 24, 2025', pages: 20, status: 'complete', score: 97, icon: '🔒' },
          { name: 'Monthly Security Summary', date: 'June 2025', pages: 45, status: 'generating', score: null, icon: '📋' },
        ].map((report, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 28 }}>{report.icon}</span>
              <div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{report.name}</div>
                <div style={{ color: '#999', fontSize: 11 }}>{report.date} • {report.pages} pages</div>
              </div>
            </div>
            {report.score && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${report.score}%`, background: report.score > 90 ? '#4caf50' : report.score > 80 ? '#ff9800' : '#f44336', borderRadius: 3 }} />
                </div>
                <span style={{ color: report.score > 90 ? '#4caf50' : '#ff9800', fontSize: 14, fontWeight: 800 }}>{report.score}/100</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: '8px 12px', background: report.status === 'complete' ? 'linear-gradient(135deg, #2196f3, #1565c0)' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                {report.status === 'complete' ? <><Download size={12} /> Download PDF</> : <><RefreshCw size={12} /> Generating...</>}
              </button>
              {report.status === 'complete' && (
                <button style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, cursor: 'pointer' }}>
                  <Eye size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══ RENDER TAB CONTENT ═══
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'redteam': return renderRedTeam();
      case 'guardrails': return renderGuardrails();
      case 'owasp': return renderOWASP();
      case 'jailbreak': return renderJailbreakLab();
      case 'servers': return renderServers();
      case 'scanner': return renderScanner();
      case 'reports': return renderReports();
      default: return renderDashboard();
    }
  };

  // ═══ MAIN RENDER ═══
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0d0d1f 100%)', color: '#fff' }}>
      {/* Notification */}
      {notification && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 20px', borderRadius: 10, background: notification.type === 'success' ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'linear-gradient(135deg, #f44336, #c62828)', color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {notification.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(244,67,54,0.15), rgba(76,175,80,0.1))', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #f44336, #ff9800, #4caf50)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🛡️ AI Red Team Suite
              </h1>
              <p style={{ color: '#999', fontSize: 13, margin: '4px 0 0' }}>
                GOAT Force CyberWarrior Division • Codex Sentinel AI • LLM Security & Guardrails
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ background: 'rgba(76,175,80,0.15)', color: '#4caf50', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', animation: 'pulse 2s infinite' }} />
                All Systems Protected
              </div>
              <button onClick={() => { setActiveTab('redteam'); }} style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #f44336, #c62828)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Target size={16} /> Launch Scan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 24px', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 4 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '14px 16px', background: activeTab === tab.id ? 'rgba(244,67,54,0.2)' : 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #f44336' : '2px solid transparent', color: activeTab === tab.id ? '#fff' : '#999', fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', transition: 'all 0.2s ease' }}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
        {renderContent()}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', textAlign: 'center' }}>
        <div style={{ color: '#666', fontSize: 11 }}>
          © 2025 GOAT Force Entertainment / Life Imitates Art Inc • AI Red Team Suite v1.0 • Codex Sentinel AI • CyberWarrior Division
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}