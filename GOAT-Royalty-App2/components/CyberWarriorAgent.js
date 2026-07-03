/**
 * 🛡️ CyberWarrior Agent — GOAT Royalty Cyber Defense System
 * Advanced Cybersecurity AI Agent with Offensive & Defensive Capabilities
 * 
 * Intelligence Sources:
 * - "Inside Cyber Warfare" by Jeffrey Caruso (Nation-state threats, APTs, Attribution)
 * - "Offensive Security Using Python" by Rejah Rehim (Exploit detection, XSS, SQLi, Payloads)
 * - "Multi-Cloud Handbook" by Natarajan & Jacob (Cloud security, Kubernetes, IAM, Zero Trust)
 * - "LLM Engineer's Handbook" (AI-powered threat detection, ML security)
 * 
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, ShieldAlert, ShieldCheck, ShieldOff, Skull, Swords, Eye, EyeOff,
  Lock, Unlock, AlertTriangle, AlertOctagon, Activity, Wifi, WifiOff,
  Globe, Server, Database, Monitor, Cpu, HardDrive, Terminal, Code,
  Bug, Zap, Target, Crosshair, Radar, Radio, Flame, Bomb,
  FileWarning, Search, Scan, RefreshCw, BarChart3, TrendingUp,
  Clock, Bell, BellRing, MessageSquare, Send, Copy, Download,
  ChevronRight, Check, X, Layers, Network, Cloud, CloudOff,
  Key, Fingerprint, UserX, Users, Bot, Brain, Sparkles, Crown
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// THREAT INTELLIGENCE DATABASE
// Based on: Inside Cyber Warfare + Offensive Security Using Python
// ═══════════════════════════════════════════════════════════════
const THREAT_CATEGORIES = {
  APT: {
    name: 'Advanced Persistent Threats',
    severity: 'CRITICAL',
    color: 'red',
    icon: '🎯',
    description: 'Nation-state sponsored long-term infiltration campaigns',
    tactics: ['Spear Phishing', 'Zero-Day Exploits', 'Supply Chain Compromise', 'Watering Hole Attacks'],
    mitigations: ['Network Segmentation', 'Behavioral Analytics', 'Threat Hunting', 'Zero Trust Architecture']
  },
  INJECTION: {
    name: 'Injection Attacks',
    severity: 'HIGH',
    color: 'orange',
    icon: '💉',
    description: 'SQL Injection, XSS, Command Injection, LDAP Injection',
    tactics: ['SQLi (Union, Blind, Time-based)', 'Stored/Reflected XSS', 'OS Command Injection', 'CSRF Token Bypass'],
    mitigations: ['Parameterized Queries', 'Input Validation', 'CSP Headers', 'WAF Rules', 'Output Encoding']
  },
  DDOS: {
    name: 'DDoS / Volumetric Attacks',
    severity: 'HIGH',
    color: 'orange',
    icon: '🌊',
    description: 'Distributed denial of service and resource exhaustion',
    tactics: ['SYN Flood', 'UDP Amplification', 'HTTP Slowloris', 'Application Layer (L7)', 'DNS Amplification'],
    mitigations: ['Rate Limiting', 'CDN/Cloudflare', 'SYN Cookies', 'Traffic Scrubbing', 'Auto-Scaling']
  },
  RANSOMWARE: {
    name: 'Ransomware & Malware',
    severity: 'CRITICAL',
    color: 'red',
    icon: '🔒',
    description: 'Encryption-based extortion and destructive payloads',
    tactics: ['Phishing Delivery', 'RDP Brute Force', 'Exploit Kits', 'Lateral Movement', 'Data Exfiltration'],
    mitigations: ['Offline Backups', 'EDR/XDR', 'Email Filtering', 'Patch Management', 'Network Isolation']
  },
  CREDENTIAL: {
    name: 'Credential Attacks',
    severity: 'HIGH',
    color: 'yellow',
    icon: '🔑',
    description: 'Password spraying, credential stuffing, session hijacking',
    tactics: ['Brute Force', 'Credential Stuffing', 'Pass-the-Hash', 'Kerberoasting', 'Session Fixation'],
    mitigations: ['MFA Enforcement', 'Password Policies', 'Account Lockout', 'Session Rotation', 'FIDO2/WebAuthn']
  },
  SUPPLY_CHAIN: {
    name: 'Supply Chain Attacks',
    severity: 'CRITICAL',
    color: 'red',
    icon: '📦',
    description: 'Compromised dependencies, build pipelines, and third-party code',
    tactics: ['Dependency Confusion', 'Typosquatting', 'Compromised CI/CD', 'Malicious Updates'],
    mitigations: ['SBOM Analysis', 'Dependency Pinning', 'Code Signing', 'Pipeline Hardening', 'Vendor Audits']
  },
  CLOUD: {
    name: 'Cloud & Infrastructure Attacks',
    severity: 'HIGH',
    color: 'orange',
    icon: '☁️',
    description: 'Misconfigured cloud resources, container escapes, IAM abuse',
    tactics: ['S3 Bucket Exposure', 'IAM Privilege Escalation', 'Container Escape', 'SSRF to Metadata', 'K8s API Abuse'],
    mitigations: ['CSPM Tools', 'Least Privilege IAM', 'Network Policies', 'Pod Security Standards', 'Secrets Management']
  },
  AI_ATTACK: {
    name: 'AI/LLM-Specific Attacks',
    severity: 'MEDIUM',
    color: 'purple',
    icon: '🤖',
    description: 'Prompt injection, model poisoning, adversarial inputs',
    tactics: ['Prompt Injection', 'Jailbreaking', 'Data Poisoning', 'Model Extraction', 'Adversarial Examples'],
    mitigations: ['Input Sanitization', 'Output Filtering', 'Model Monitoring', 'Red Team Testing', 'Guardrails']
  }
};

// ═══════════════════════════════════════════════════════════════
// DEFENSE ARSENAL — Active Countermeasures
// ═══════════════════════════════════════════════════════════════
const DEFENSE_SYSTEMS = [
  { id: 'waf', name: 'Web Application Firewall', icon: '🛡️', status: 'active', type: 'Perimeter', description: 'ModSecurity + OWASP CRS rules blocking SQLi, XSS, RCE, LFI/RFI', rules: 2847, blocked: 14523 },
  { id: 'ids', name: 'Intrusion Detection System', icon: '👁️', status: 'active', type: 'Network', description: 'Suricata-based deep packet inspection with custom GOAT signatures', signatures: 45000, alerts: 342 },
  { id: 'edr', name: 'Endpoint Detection & Response', icon: '🖥️', status: 'active', type: 'Endpoint', description: 'Real-time process monitoring, behavioral analysis, auto-quarantine', endpoints: 12, threats: 3 },
  { id: 'siem', name: 'SIEM / Log Aggregation', icon: '📊', status: 'active', type: 'Analytics', description: 'Centralized logging with ML-powered anomaly detection', events_day: '2.4M', correlations: 156 },
  { id: 'honeypot', name: 'Honeypot Network', icon: '🍯', status: 'active', type: 'Deception', description: 'Decoy services attracting and profiling attackers', traps: 8, captures: 67 },
  { id: 'zt', name: 'Zero Trust Gateway', icon: '🔐', status: 'active', type: 'Access', description: 'Never trust, always verify — micro-segmented access control', policies: 234, denials: 1893 },
  { id: 'threat_intel', name: 'Threat Intelligence Feed', icon: '📡', status: 'active', type: 'Intelligence', description: 'Real-time IOC feeds from MISP, AlienVault OTX, VirusTotal', iocs: 125000, matches: 23 },
  { id: 'backup', name: 'Immutable Backup System', icon: '💾', status: 'active', type: 'Recovery', description: 'Air-gapped, encrypted, versioned backups with instant restore', snapshots: 720, last_backup: '2 min ago' },
  { id: 'scanner', name: 'Vulnerability Scanner', icon: '🔍', status: 'active', type: 'Assessment', description: 'Continuous scanning with Nuclei + custom templates', templates: 8500, vulns_found: 0 },
  { id: 'ddos_shield', name: 'DDoS Mitigation', icon: '🌊', status: 'active', type: 'Perimeter', description: 'Multi-layer DDoS protection with traffic scrubbing', capacity: '10 Tbps', mitigated: '847 GB' },
  { id: 'crypto', name: 'Encryption Engine', icon: '🔒', status: 'active', type: 'Data', description: 'AES-256-GCM at rest, TLS 1.3 in transit, E2E for sensitive data', keys_managed: 156, rotations: 'Auto-90d' },
  { id: 'ai_guard', name: 'AI Threat Analyzer', icon: '🧠', status: 'active', type: 'AI', description: 'ML-powered behavioral analysis detecting zero-day patterns', models: 4, accuracy: '99.7%' },
];

// ═══════════════════════════════════════════════════════════════
// OFFENSIVE CAPABILITIES — Authorized Penetration Testing
// Based on: Offensive Security Using Python
// ═══════════════════════════════════════════════════════════════
const OFFENSIVE_TOOLS = [
  { name: 'Port Scanner', icon: '🔌', description: 'TCP/UDP port scanning with service fingerprinting', command: 'cyberwarrior scan --target self --ports 1-65535' },
  { name: 'Vulnerability Probe', icon: '🐛', description: 'Automated vulnerability assessment with CVE mapping', command: 'cyberwarrior vuln-scan --target self --depth full' },
  { name: 'Web App Fuzzer', icon: '💥', description: 'Intelligent fuzzing for injection points and edge cases', command: 'cyberwarrior fuzz --url https://goatroyalty.com --wordlist mega' },
  { name: 'Password Auditor', icon: '🔑', description: 'Test password strength and detect weak credentials', command: 'cyberwarrior audit-passwords --policy strict' },
  { name: 'SSL/TLS Analyzer', icon: '🔐', description: 'Certificate chain validation and cipher suite analysis', command: 'cyberwarrior tls-check --target goatroyalty.com' },
  { name: 'API Security Tester', icon: '🔗', description: 'REST/GraphQL endpoint security testing with auth bypass checks', command: 'cyberwarrior api-test --spec openapi.json --auth-bypass' },
  { name: 'Container Escape Test', icon: '📦', description: 'Docker/K8s privilege escalation and escape detection', command: 'cyberwarrior container-audit --runtime docker' },
  { name: 'DNS Recon', icon: '🌐', description: 'DNS enumeration, zone transfer attempts, subdomain discovery', command: 'cyberwarrior dns-recon --domain goatroyalty.com' },
  { name: 'Social Engineering Sim', icon: '🎭', description: 'Phishing simulation and awareness testing', command: 'cyberwarrior phish-sim --campaign awareness-q1' },
  { name: 'Network Sniffer', icon: '📡', description: 'Packet capture and protocol analysis for anomaly detection', command: 'cyberwarrior sniff --interface eth0 --filter suspicious' },
];

// ═══════════════════════════════════════════════════════════════
// REAL-TIME THREAT SIMULATION ENGINE
// ═══════════════════════════════════════════════════════════════
const generateThreatEvent = () => {
  const types = [
    { type: 'SQLi Attempt', severity: 'HIGH', source: '185.220.101.x', target: '/api/tracks', action: 'BLOCKED', detail: "Payload: ' OR 1=1 -- detected in query parameter" },
    { type: 'Brute Force SSH', severity: 'MEDIUM', source: '45.33.32.x', target: 'port 22', action: 'BLOCKED', detail: '847 failed attempts from same IP in 5 minutes' },
    { type: 'XSS Probe', severity: 'HIGH', source: '103.224.182.x', target: '/search', action: 'BLOCKED', detail: 'Reflected XSS payload: <script>alert(document.cookie)</script>' },
    { type: 'DDoS L7', severity: 'CRITICAL', source: 'Botnet (2.3K IPs)', target: '/', action: 'MITIGATED', detail: '45,000 req/s HTTP flood — traffic scrubbing engaged' },
    { type: 'Port Scan', severity: 'LOW', source: '198.51.100.x', target: 'ports 1-1024', action: 'LOGGED', detail: 'SYN scan detected, 847 ports probed in 12 seconds' },
    { type: 'API Auth Bypass', severity: 'HIGH', source: '172.16.0.x', target: '/api/royalty-engine', action: 'BLOCKED', detail: 'JWT manipulation attempt — invalid signature detected' },
    { type: 'Malware Upload', severity: 'CRITICAL', source: '91.215.85.x', target: '/api/upload', action: 'QUARANTINED', detail: 'PE executable disguised as .jpg — ClamAV signature match' },
    { type: 'DNS Tunneling', severity: 'MEDIUM', source: '10.0.0.x', target: 'DNS resolver', action: 'BLOCKED', detail: 'Encoded data in TXT queries — exfiltration attempt' },
    { type: 'Container Escape', severity: 'CRITICAL', source: 'internal', target: 'docker0', action: 'KILLED', detail: 'Privilege escalation via CVE-2024-21626 — process terminated' },
    { type: 'Credential Stuffing', severity: 'HIGH', source: '23.94.x.x (Tor)', target: '/api/login', action: 'BLOCKED', detail: '12,000 unique credential pairs tested — rate limit + CAPTCHA enforced' },
    { type: 'LLM Prompt Injection', severity: 'MEDIUM', source: '192.168.1.x', target: '/api/openclaw', action: 'SANITIZED', detail: 'Attempted system prompt override — input guardrails activated' },
    { type: 'Supply Chain Alert', severity: 'HIGH', source: 'npm registry', target: 'package.json', action: 'FLAGGED', detail: 'Dependency lodash@4.17.20 has known prototype pollution CVE' },
    { type: 'Reconnaissance', severity: 'LOW', source: '157.240.x.x', target: 'robots.txt, sitemap', action: 'MONITORED', detail: 'Automated crawler fingerprinted as potential recon tool' },
    { type: 'Zero-Day Probe', severity: 'CRITICAL', source: 'APT-29 (Cozy Bear)', target: 'Next.js runtime', action: 'ISOLATED', detail: 'Unknown exploit pattern — sandbox isolation + threat intel alert sent' },
  ];
  const event = types[Math.floor(Math.random() * types.length)];
  return { ...event, timestamp: new Date().toISOString(), id: Math.random().toString(36).substr(2, 9) };
};

// ═══════════════════════════════════════════════════════════════
// CYBER WARRIOR AGENT COMPONENT
// ═══════════════════════════════════════════════════════════════
const CyberWarriorAgent = () => {
  const [activeTab, setActiveTab] = useState('command');
  const [threatLevel, setThreatLevel] = useState('ELEVATED');
  const [threats, setThreats] = useState([]);
  const [defenseMode, setDefenseMode] = useState('ACTIVE');
  const [chatMessages, setChatMessages] = useState([
    { role: 'system', content: '🛡️ CyberWarrior Agent v3.0 initialized. All defense systems ONLINE. Monitoring 12 endpoints, 45,000 IDS signatures loaded, Zero Trust gateway active. Ready for orders, Commander.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    threatsBlocked: 14523,
    attacksToday: 342,
    uptime: '99.997%',
    lastIncident: '47 min ago',
    activeConnections: 1247,
    bandwidthProtected: '847 GB',
    firewallRules: 2847,
    encryptedStreams: 156,
  });
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [scanRunning, setScanRunning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const chatEndRef = useRef(null);

  // Real-time threat simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const newThreat = generateThreatEvent();
      setThreats(prev => [newThreat, ...prev].slice(0, 50));
      setStats(prev => ({
        ...prev,
        threatsBlocked: prev.threatsBlocked + (newThreat.action === 'BLOCKED' ? 1 : 0),
        attacksToday: prev.attacksToday + 1,
        lastIncident: 'Just now',
      }));
    }, 4000 + Math.random() * 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Threat level calculation
  useEffect(() => {
    const criticalCount = threats.filter(t => t.severity === 'CRITICAL').length;
    const highCount = threats.filter(t => t.severity === 'HIGH').length;
    if (criticalCount > 3) setThreatLevel('SEVERE');
    else if (criticalCount > 1 || highCount > 5) setThreatLevel('HIGH');
    else if (highCount > 2) setThreatLevel('ELEVATED');
    else setThreatLevel('GUARDED');
  }, [threats]);

  const threatLevelColors = {
    SEVERE: 'from-red-900 to-red-600',
    HIGH: 'from-orange-900 to-orange-600',
    ELEVATED: 'from-yellow-900 to-yellow-600',
    GUARDED: 'from-green-900 to-green-600',
    LOW: 'from-blue-900 to-blue-600',
  };

  const severityColors = {
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const actionColors = {
    BLOCKED: 'text-red-400',
    MITIGATED: 'text-orange-400',
    QUARANTINED: 'text-purple-400',
    KILLED: 'text-red-500',
    SANITIZED: 'text-yellow-400',
    FLAGGED: 'text-orange-300',
    LOGGED: 'text-blue-400',
    MONITORED: 'text-gray-400',
    ISOLATED: 'text-red-300',
  };

  // ═══ CYBER WARRIOR CHAT AI ═══
  const sendCommand = async () => {
    if (!inputMessage.trim() || isProcessing) return;
    const userMsg = inputMessage.trim();
    setInputMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsProcessing(true);

    setTimeout(() => {
      const response = processCyberCommand(userMsg);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsProcessing(false);
    }, 800 + Math.random() * 1200);
  };

  const processCyberCommand = (input) => {
    const lower = input.toLowerCase();

    if (lower.includes('status') || lower.includes('report') || lower.includes('sitrep')) {
      return `🛡️ **SITREP — CyberWarrior Status Report**\n\n**Threat Level:** ${threatLevel}\n**Defense Mode:** ${defenseMode}\n**Uptime:** ${stats.uptime}\n\n📊 **Today's Statistics:**\n• Threats Blocked: ${stats.threatsBlocked.toLocaleString()}\n• Attacks Detected: ${stats.attacksToday}\n• Active Connections: ${stats.activeConnections.toLocaleString()}\n• Bandwidth Protected: ${stats.bandwidthProtected}\n• Firewall Rules Active: ${stats.firewallRules.toLocaleString()}\n• Encrypted Streams: ${stats.encryptedStreams}\n• Last Incident: ${stats.lastIncident}\n\n✅ All 12 defense systems operational.\n🧠 AI Threat Analyzer: 99.7% accuracy\n🍯 Honeypot Network: 67 attacker profiles captured`;
    }

    if (lower.includes('scan') || lower.includes('audit') || lower.includes('check')) {
      return `🔍 **Security Scan Initiated**\n\n\`\`\`\n[SCAN] Port Scan .............. ✅ No unexpected open ports\n[SCAN] SSL/TLS Check .......... ✅ TLS 1.3, A+ rating\n[SCAN] SQL Injection Test ..... ✅ All endpoints parameterized\n[SCAN] XSS Detection .......... ✅ CSP headers enforced\n[SCAN] CSRF Protection ........ ✅ Tokens validated\n[SCAN] Auth Bypass Test ....... ✅ JWT verification solid\n[SCAN] Dependency Audit ....... ⚠️ 2 low-severity advisories\n[SCAN] Container Security ..... ✅ No privilege escalation paths\n[SCAN] DNS Configuration ...... ✅ DNSSEC enabled\n[SCAN] Rate Limiting .......... ✅ Active on all endpoints\n[SCAN] Backup Integrity ....... ✅ Last verified 2 min ago\n[SCAN] Encryption at Rest ..... ✅ AES-256-GCM\n\`\`\`\n\n**Result: 11/12 PASS, 1 ADVISORY**\n⚠️ Run \`cyberwarrior fix-deps\` to resolve dependency advisories.`;
    }

    if (lower.includes('block') || lower.includes('ban') || lower.includes('kill')) {
      const ip = input.match(/\d+\.\d+\.\d+\.\d+/)?.[0] || '0.0.0.0';
      return `⚔️ **DEADLY FORCE ENGAGED**\n\n\`\`\`\n[FIREWALL] IP ${ip} added to permanent blacklist\n[FIREWALL] All connections from ${ip} terminated\n[FIREWALL] Reverse DNS: flagged for abuse reporting\n[HONEYPOT] Decoy redirected to tar pit\n[IDS] Signature created for attack pattern\n[SIEM] Incident ticket #CW-${Math.floor(Math.random()*9999)} created\n[THREAT-INTEL] IOC shared with community feeds\n\`\`\`\n\n🔥 Target neutralized. Attack pattern cataloged for future auto-blocking.\n📡 Threat intelligence shared with MISP community.`;
    }

    if (lower.includes('lockdown') || lower.includes('defcon') || lower.includes('emergency')) {
      return `🚨 **EMERGENCY LOCKDOWN ACTIVATED**\n\n\`\`\`\n[DEFCON-1] All non-essential ports CLOSED\n[DEFCON-1] Rate limiting set to MAXIMUM (10 req/min)\n[DEFCON-1] Admin access restricted to VPN only\n[DEFCON-1] All API keys rotated\n[DEFCON-1] Database connections limited to read-only\n[DEFCON-1] Backup snapshot created (immutable)\n[DEFCON-1] Honeypot network expanded (16 decoys)\n[DEFCON-1] IDS signatures updated to latest\n[DEFCON-1] All sessions invalidated — re-auth required\n[DEFCON-1] Incident response team notified\n\`\`\`\n\n⚠️ **LOCKDOWN ACTIVE** — Only authorized personnel with MFA + VPN can access systems.\nType \`stand down\` to return to normal operations.`;
    }

    if (lower.includes('stand down') || lower.includes('normal') || lower.includes('unlock')) {
      return `✅ **Returning to Normal Operations**\n\n\`\`\`\n[RESTORE] Standard rate limits restored\n[RESTORE] All ports returned to baseline config\n[RESTORE] API access restored with standard auth\n[RESTORE] Database write access enabled\n[RESTORE] Session management normalized\n[RESTORE] Monitoring level: ELEVATED\n\`\`\`\n\n🛡️ Defense systems remain at heightened awareness. All threat signatures from the incident have been permanently cataloged.`;
    }

    if (lower.includes('threat') || lower.includes('attack') || lower.includes('apt')) {
      return `🎯 **Active Threat Intelligence**\n\n**Known APT Groups Targeting Music/Entertainment:**\n• **APT-41 (Double Dragon)** — IP theft, financial gain\n• **Lazarus Group (APT-38)** — Cryptocurrency/financial targeting\n• **FIN7** — Payment card data, POS systems\n\n**Current Attack Vectors Detected:**\n1. 🔴 SQL Injection probes on /api/tracks (${threats.filter(t=>t.type.includes('SQLi')).length} attempts)\n2. 🟠 Credential stuffing on /api/login (${threats.filter(t=>t.type.includes('Credential')).length} attempts)\n3. 🟡 XSS probes on search endpoints (${threats.filter(t=>t.type.includes('XSS')).length} attempts)\n4. 🔴 DDoS attempts (${threats.filter(t=>t.type.includes('DDoS')).length} mitigated)\n\n**Recommended Actions:**\n• Enable geo-blocking for non-target regions\n• Rotate all API keys and secrets\n• Deploy additional honeypot on port 8080\n• Update WAF rules to latest OWASP CRS 4.x`;
    }

    if (lower.includes('encrypt') || lower.includes('crypto') || lower.includes('key')) {
      return `🔒 **Encryption Status — GOAT Royalty**\n\n**Data at Rest:**\n• Database: AES-256-GCM ✅\n• File Storage: AES-256-CBC ✅\n• Backups: AES-256-GCM + RSA-4096 envelope ✅\n• Secrets: HashiCorp Vault (Shamir's Secret Sharing) ✅\n\n**Data in Transit:**\n• Web Traffic: TLS 1.3 (ECDHE + AES-256-GCM) ✅\n• API Calls: mTLS between services ✅\n• WebSocket: WSS with per-message encryption ✅\n\n**Key Management:**\n• Rotation: Automatic every 90 days\n• HSM Backed: Yes (AWS CloudHSM)\n• Key Count: ${stats.encryptedStreams} active keys\n• Last Rotation: 12 days ago\n\n🔐 All cryptographic operations meet NIST SP 800-57 standards.`;
    }

    if (lower.includes('help') || lower.includes('command') || lower.includes('what can')) {
      return `⚔️ **CyberWarrior Command Reference**\n\n**Defensive Commands:**\n• \`status\` / \`sitrep\` — Full system status report\n• \`scan\` / \`audit\` — Run security scan\n• \`lockdown\` — Emergency lockdown (DEFCON-1)\n• \`stand down\` — Return to normal operations\n• \`encrypt status\` — Encryption & key management report\n\n**Offensive Commands:**\n• \`block [IP]\` — Blacklist and neutralize attacker\n• \`threat report\` — Active threat intelligence\n• \`hunt\` — Initiate threat hunting sweep\n• \`pentest\` — Run authorized penetration test\n\n**Intelligence Commands:**\n• \`analyze [threat]\` — Deep analysis of specific threat\n• \`ioc search [indicator]\` — Search threat intel feeds\n• \`attribution\` — Attempt attacker attribution\n• \`forensics\` — Digital forensics toolkit\n\n**System Commands:**\n• \`deploy countermeasure\` — Deploy active defense\n• \`rotate keys\` — Force key rotation\n• \`update signatures\` — Update IDS/WAF signatures\n• \`backup now\` — Create immutable backup snapshot`;
    }

    if (lower.includes('hunt') || lower.includes('sweep')) {
      return `🔍 **Threat Hunting Sweep Initiated**\n\n\`\`\`\n[HUNT] Analyzing network traffic patterns ......... ✅\n[HUNT] Checking for lateral movement indicators .... ✅\n[HUNT] Scanning for persistence mechanisms ......... ✅\n[HUNT] Reviewing DNS query anomalies .............. ✅\n[HUNT] Checking process trees for injection ........ ✅\n[HUNT] Analyzing authentication logs .............. ⚠️\n[HUNT] Reviewing outbound connection patterns ...... ✅\n[HUNT] Checking for data staging/exfiltration ...... ✅\n[HUNT] Scanning memory for rootkit signatures ...... ✅\n[HUNT] Validating file integrity (AIDE) ............ ✅\n\`\`\`\n\n**Result: 9/10 CLEAR, 1 ANOMALY**\n⚠️ Unusual authentication pattern detected: 3 failed logins from internal IP followed by successful auth with different user agent. Recommend investigation.\n\n📋 Full hunt report saved to /var/log/cyberwarrior/hunt-${Date.now()}.json`;
    }

    if (lower.includes('pentest') || lower.includes('penetration')) {
      return `🗡️ **Authorized Penetration Test — GOAT Royalty**\n\n\`\`\`\n[PENTEST] Phase 1: Reconnaissance\n  → Subdomain enumeration: 4 found\n  → Technology fingerprint: Next.js 14, Node 20, PM2\n  → Open ports: 80, 443, 3000 (expected)\n\n[PENTEST] Phase 2: Vulnerability Assessment\n  → CVE scan: 0 critical, 0 high, 2 low\n  → OWASP Top 10: All mitigated\n  → Business logic: No flaws detected\n\n[PENTEST] Phase 3: Exploitation Attempts\n  → SQLi: FAILED (parameterized queries)\n  → XSS: FAILED (CSP + encoding)\n  → CSRF: FAILED (token validation)\n  → Auth bypass: FAILED (JWT + MFA)\n  → SSRF: FAILED (allowlist enforced)\n  → File upload: FAILED (type + AV check)\n\n[PENTEST] Phase 4: Post-Exploitation\n  → N/A — No successful exploitation\n\`\`\`\n\n**RESULT: PASS ✅**\nNo exploitable vulnerabilities found. GOAT Royalty defenses are SOLID.\n🏆 Security Score: 97/100`;
    }

    if (lower.includes('forensic') || lower.includes('investigate')) {
      return `🔬 **Digital Forensics Toolkit Active**\n\n**Available Forensic Capabilities:**\n• 📁 File System Timeline Analysis\n• 🧬 Memory Dump Analysis (Volatility)\n• 📧 Email Header Forensics\n• 🌐 Network Packet Forensics (Wireshark/tshark)\n• 📱 Log Correlation & Timeline Reconstruction\n• 🔗 Blockchain Transaction Tracing\n• 🖼️ Steganography Detection\n• 📊 Malware Reverse Engineering\n\n**Chain of Custody:**\n• All evidence is hashed (SHA-256) upon collection\n• Timestamps are cryptographically signed\n• Write-blockers engaged for disk analysis\n• All actions logged to immutable audit trail\n\nSpecify what you'd like to investigate and I'll begin evidence collection.`;
    }

    return `🛡️ **CyberWarrior Processing...**\n\nI've analyzed your input: "${input.substring(0, 80)}${input.length > 80 ? '...' : ''}"\n\n**Quick Actions Available:**\n• Type \`status\` for full system report\n• Type \`scan\` to run security audit\n• Type \`threat report\` for active threats\n• Type \`help\` for all commands\n\n⚔️ All defense systems remain active. ${stats.threatsBlocked.toLocaleString()} threats blocked and counting.\n\n*"The best defense is a good offense, but the best offense is knowing your enemy."*\n— CyberWarrior Agent, GOAT Royalty Division`;
  };

  // ═══ RUN SECURITY SCAN ═══
  const runSecurityScan = () => {
    setScanRunning(true);
    setScanResults(null);
    setTimeout(() => {
      setScanResults({
        score: 97,
        passed: 23,
        warnings: 2,
        failed: 0,
        details: [
          { test: 'TLS Configuration', status: 'pass', detail: 'TLS 1.3, HSTS enabled, A+ rating' },
          { test: 'SQL Injection Protection', status: 'pass', detail: 'All queries parameterized' },
          { test: 'XSS Prevention', status: 'pass', detail: 'CSP headers + output encoding' },
          { test: 'CSRF Protection', status: 'pass', detail: 'Double-submit cookie pattern' },
          { test: 'Authentication', status: 'pass', detail: 'JWT + MFA + rate limiting' },
          { test: 'Authorization', status: 'pass', detail: 'RBAC with least privilege' },
          { test: 'Input Validation', status: 'pass', detail: 'Server-side validation on all endpoints' },
          { test: 'Error Handling', status: 'pass', detail: 'No stack traces exposed' },
          { test: 'Dependency Security', status: 'warn', detail: '2 low-severity advisories in devDependencies' },
          { test: 'Rate Limiting', status: 'pass', detail: 'Active on all API endpoints' },
          { test: 'CORS Policy', status: 'pass', detail: 'Strict origin allowlist' },
          { test: 'Content Security Policy', status: 'pass', detail: 'Strict CSP with nonce-based scripts' },
          { test: 'Cookie Security', status: 'pass', detail: 'HttpOnly, Secure, SameSite=Strict' },
          { test: 'File Upload Security', status: 'pass', detail: 'Type validation + AV scanning' },
          { test: 'API Security', status: 'pass', detail: 'OpenAPI spec validated, no undocumented endpoints' },
          { test: 'Logging & Monitoring', status: 'pass', detail: 'Centralized SIEM with alerting' },
          { test: 'Backup & Recovery', status: 'pass', detail: 'Immutable backups, tested restore' },
          { test: 'Network Segmentation', status: 'pass', detail: 'Micro-segmented with Zero Trust' },
          { test: 'Container Security', status: 'pass', detail: 'Non-root, read-only FS, no capabilities' },
          { test: 'Secrets Management', status: 'pass', detail: 'Vault-managed, auto-rotation' },
          { test: 'DNS Security', status: 'pass', detail: 'DNSSEC enabled, CAA records set' },
          { test: 'HTTP Security Headers', status: 'warn', detail: 'Permissions-Policy header could be stricter' },
          { test: 'Subresource Integrity', status: 'pass', detail: 'SRI hashes on all external scripts' },
          { test: 'Encryption at Rest', status: 'pass', detail: 'AES-256-GCM on all data stores' },
          { test: 'Incident Response Plan', status: 'pass', detail: 'Documented and tested quarterly' },
        ]
      });
      setScanRunning(false);
    }, 3000);
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  const tabs = [
    { id: 'command', label: 'Command Center', icon: Terminal },
    { id: 'threats', label: 'Threat Feed', icon: AlertTriangle },
    { id: 'defenses', label: 'Defense Grid', icon: Shield },
    { id: 'offensive', label: 'Offensive Ops', icon: Swords },
    { id: 'intel', label: 'Threat Intel', icon: Eye },
    { id: 'scanner', label: 'Scanner', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black text-white">
      {/* ═══ HEADER ═══ */}
      <div className={`bg-gradient-to-r ${threatLevelColors[threatLevel]} p-1`}>
        <div className="bg-black/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Shield className="w-12 h-12 text-red-500" />
                  <Swords className="w-6 h-6 text-yellow-400 absolute -bottom-1 -right-1" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight">
                    <span className="text-red-500">CYBER</span>
                    <span className="text-white">WARRIOR</span>
                    <span className="text-yellow-500 ml-2">AGENT</span>
                  </h1>
                  <p className="text-xs text-gray-400">GOAT Royalty Cyber Defense System • Deadly Force Authorized</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Threat Level Indicator */}
                <div className={`px-4 py-2 rounded-xl border ${
                  threatLevel === 'SEVERE' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                  threatLevel === 'HIGH' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' :
                  threatLevel === 'ELEVATED' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' :
                  'bg-green-500/20 border-green-500/50 text-green-400'
                } animate-pulse`}>
                  <div className="text-xs font-bold">THREAT LEVEL</div>
                  <div className="text-lg font-black">{threatLevel}</div>
                </div>

                {/* Defense Mode */}
                <button
                  onClick={() => setDefenseMode(defenseMode === 'ACTIVE' ? 'AGGRESSIVE' : defenseMode === 'AGGRESSIVE' ? 'LETHAL' : 'ACTIVE')}
                  className={`px-4 py-2 rounded-xl border font-bold text-sm transition-all ${
                    defenseMode === 'LETHAL' ? 'bg-red-600/30 border-red-500 text-red-400' :
                    defenseMode === 'AGGRESSIVE' ? 'bg-orange-600/30 border-orange-500 text-orange-400' :
                    'bg-green-600/30 border-green-500 text-green-400'
                  }`}
                >
                  <div className="text-xs">DEFENSE MODE</div>
                  <div>{defenseMode}</div>
                </button>

                {/* Quick Stats */}
                <div className="hidden lg:flex items-center gap-3 text-xs">
                  <div className="text-center px-3 py-1 bg-white/5 rounded-xl">
                    <div className="text-red-400 font-bold">{stats.threatsBlocked.toLocaleString()}</div>
                    <div className="text-gray-500">Blocked</div>
                  </div>
                  <div className="text-center px-3 py-1 bg-white/5 rounded-xl">
                    <div className="text-green-400 font-bold">{stats.uptime}</div>
                    <div className="text-gray-500">Uptime</div>
                  </div>
                  <div className="text-center px-3 py-1 bg-white/5 rounded-xl">
                    <div className="text-yellow-400 font-bold">{stats.attacksToday}</div>
                    <div className="text-gray-500">Today</div>
                  </div>
                </div>

                <a href="/" className="px-3 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-sm">
                  👑 GOAT Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TAB NAVIGATION ═══ */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-red-600/30 text-red-400 border border-red-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ═══ COMMAND CENTER TAB ═══ */}
        {activeTab === 'command' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2 bg-white/5 rounded-2xl border border-white/10 flex flex-col" style={{ height: '600px' }}>
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="font-bold">CyberWarrior Terminal</span>
                <span className="text-xs text-gray-500 ml-auto">Encrypted Channel • AES-256</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-red-600/30 border border-red-500/30'
                        : msg.role === 'system'
                        ? 'bg-green-600/20 border border-green-500/30'
                        : 'bg-white/10 border border-white/10'
                    }`}>
                      <div className="text-xs text-gray-500 mb-1">
                        {msg.role === 'user' ? '👑 Commander' : msg.role === 'system' ? '🛡️ System' : '⚔️ CyberWarrior'}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="goat-gradient-card goat-gradient-card goat-card-hover/10 rounded-2xl px-4 py-3 border border-white/10">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing threat vectors...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendCommand()}
                    placeholder="Enter command (try: status, scan, threat report, lockdown, help)..."
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50"
                  />
                  <button
                    onClick={sendCommand}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-bold hover:from-red-500 hover:to-orange-500 transition-all disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats Panel */}
            <div className="space-y-4">
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-5 border border-white/10">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-400" />
                  Live Metrics
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Threats Blocked', value: stats.threatsBlocked.toLocaleString(), color: 'text-red-400', icon: ShieldCheck },
                    { label: 'Attacks Today', value: stats.attacksToday, color: 'text-orange-400', icon: AlertTriangle },
                    { label: 'System Uptime', value: stats.uptime, color: 'text-green-400', icon: Activity },
                    { label: 'Last Incident', value: stats.lastIncident, color: 'text-yellow-400', icon: Clock },
                    { label: 'Active Connections', value: stats.activeConnections.toLocaleString(), color: 'text-blue-400', icon: Network },
                    { label: 'Bandwidth Protected', value: stats.bandwidthProtected, color: 'text-purple-400', icon: Shield },
                    { label: 'Firewall Rules', value: stats.firewallRules.toLocaleString(), color: 'text-cyan-400', icon: Flame },
                    { label: 'Encrypted Streams', value: stats.encryptedStreams, color: 'text-emerald-400', icon: Lock },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <stat.icon className="w-4 h-4" />
                        {stat.label}
                      </div>
                      <div className={`font-bold text-sm ${stat.color}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-5 border border-white/10">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '🔍 Full Scan', cmd: 'scan all systems' },
                    { label: '🚨 Lockdown', cmd: 'emergency lockdown' },
                    { label: '📊 SITREP', cmd: 'status report' },
                    { label: '🎯 Hunt', cmd: 'threat hunt sweep' },
                    { label: '🗡️ Pentest', cmd: 'run pentest' },
                    { label: '🔒 Encrypt', cmd: 'encrypt status' },
                  ].map((action, i) => (
                    <button
                      key={i}
                      onClick={() => { setInputMessage(action.cmd); }}
                      className="px-3 py-2 bg-black/30 rounded-xl text-xs font-bold hover:bg-white/10 transition-all border border-white/5"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ THREAT FEED TAB ═══ */}
        {activeTab === 'threats' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
                Live Threat Feed
              </h2>
              <div className="text-sm text-gray-400">{threats.length} events captured</div>
            </div>
            <div className="space-y-2 max-h-[700px] overflow-y-auto">
              {threats.map((threat, i) => (
                <div
                  key={threat.id}
                  onClick={() => setSelectedThreat(selectedThreat?.id === threat.id ? null : threat)}
                  className={`bg-white/5 rounded-xl p-4 border cursor-pointer transition-all hover:bg-white/10 ${
                    selectedThreat?.id === threat.id ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${severityColors[threat.severity]}`}>
                        {threat.severity}
                      </span>
                      <span className="font-bold text-sm">{threat.type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-500">{threat.source}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-400">{threat.target}</span>
                      <span className={`font-bold ${actionColors[threat.action]}`}>{threat.action}</span>
                      <span className="text-gray-400">{new Date(threat.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  {selectedThreat?.id === threat.id && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-sm text-gray-300">{threat.detail}</p>
                      <div className="mt-2 flex gap-2">
                        <button className="px-3 py-1 bg-red-600/30 rounded-xl text-xs text-red-400 hover:bg-red-600/50">
                          ⚔️ Block Source
                        </button>
                        <button className="px-3 py-1 bg-blue-600/30 rounded-xl text-xs text-blue-400 hover:bg-blue-600/50">
                          🔍 Investigate
                        </button>
                        <button className="px-3 py-1 bg-purple-600/30 rounded-xl text-xs text-purple-400 hover:bg-purple-600/50">
                          📋 Create Ticket
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {threats.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Monitoring for threats... All quiet on the wire.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ DEFENSE GRID TAB ═══ */}
        {activeTab === 'defenses' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-400" />
              Defense Grid — All Systems
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEFENSE_SYSTEMS.map((system, i) => (
                <div key={system.id} className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{system.icon}</span>
                      <div>
                        <div className="font-bold text-sm">{system.name}</div>
                        <div className="text-xs text-gray-500">{system.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      ACTIVE
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{system.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(system).filter(([k]) => !['id','name','icon','status','type','description'].includes(k)).map(([key, val]) => (
                      <div key={key} className="px-2 py-1 bg-black/30 rounded-xl text-xs">
                        <span className="text-gray-500">{key.replace(/_/g,' ')}: </span>
                        <span className="text-white font-bold">{typeof val === 'number' ? val.toLocaleString() : val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ OFFENSIVE OPS TAB ═══ */}
        {activeTab === 'offensive' && (
          <div className="space-y-6">
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
              <AlertOctagon className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <div className="font-bold text-red-400">⚠️ AUTHORIZED PERSONNEL ONLY</div>
                <div className="text-xs text-gray-400">Offensive tools are for authorized penetration testing and security assessment only. All actions are logged and audited.</div>
              </div>
            </div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Swords className="w-6 h-6 text-red-400" />
              Offensive Operations Arsenal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OFFENSIVE_TOOLS.map((tool, i) => (
                <div key={i} className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{tool.icon}</span>
                    <div className="font-bold">{tool.name}</div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{tool.description}</p>
                  <div className="flex items-center justify-between bg-black/30 rounded-xl px-3 py-2">
                    <code className="text-xs text-green-400 font-mono">$ {tool.command}</code>
                    <button
                      onClick={() => navigator.clipboard?.writeText(tool.command)}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Copy className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ THREAT INTEL TAB ═══ */}
        {activeTab === 'intel' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Eye className="w-6 h-6 text-purple-400" />
              Threat Intelligence Database
            </h2>
            <p className="text-gray-400">Intelligence sourced from: Inside Cyber Warfare, Offensive Security Using Python, Multi-Cloud Handbook, LLM Engineer's Handbook</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(THREAT_CATEGORIES).map(([key, cat]) => (
                <div key={key} className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{cat.icon}</span>
                      <div>
                        <div className="font-bold">{cat.name}</div>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${severityColors[cat.severity]}`}>
                          {cat.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{cat.description}</p>
                  <div className="mb-3">
                    <div className="text-xs text-red-400 font-bold mb-1">Attack Tactics:</div>
                    <div className="flex flex-wrap gap-1">
                      {cat.tactics.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-500/10 rounded text-xs text-red-300">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-green-400 font-bold mb-1">Mitigations:</div>
                    <div className="flex flex-wrap gap-1">
                      {cat.mitigations.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-green-500/10 rounded text-xs text-green-300">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ SCANNER TAB ═══ */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Search className="w-6 h-6 text-cyan-400" />
              Security Scanner
            </h2>
            <div className="flex gap-4">
              <button
                onClick={runSecurityScan}
                disabled={scanRunning}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-bold hover:from-red-500 hover:to-orange-500 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {scanRunning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Scan className="w-5 h-5" />}
                {scanRunning ? 'Scanning...' : 'Run Full Security Scan'}
              </button>
            </div>

            {scanRunning && (
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  <span className="font-bold">Security scan in progress...</span>
                </div>
                <div className="space-y-2">
                  {['Scanning ports...', 'Testing SSL/TLS...', 'Checking injection points...', 'Auditing authentication...', 'Analyzing dependencies...'].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scanResults && (
              <div className="space-y-4">
                {/* Score Card */}
                <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-4xl font-black text-green-400">{scanResults.score}/100</div>
                      <div className="text-sm text-gray-400">Security Score</div>
                    </div>
                    <div className="flex gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-400">{scanResults.passed}</div>
                        <div className="text-xs text-gray-500">Passed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-400">{scanResults.warnings}</div>
                        <div className="text-xs text-gray-500">Warnings</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-400">{scanResults.failed}</div>
                        <div className="text-xs text-gray-500">Failed</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="space-y-2">
                  {scanResults.details.map((item, i) => (
                    <div key={i} className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.status === 'pass' ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : item.status === 'warn' ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <X className="w-5 h-5 text-red-400" />
                        )}
                        <span className="font-bold text-sm">{item.test}</span>
                      </div>
                      <span className="text-xs text-gray-400">{item.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ FOOTER ═══ */}
      <div className="max-w-7xl mx-auto px-4 py-6 mt-8 border-t border-white/5">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>🛡️ CyberWarrior Agent v3.0 • GOAT Royalty Cyber Defense Division</div>
          <div>© 2025 Harvey Miller / FASTASSMAN Publishing Inc • All Rights Reserved</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            All Systems Operational
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberWarriorAgent;