/**
 * SUPER GOAT ROYALTIES - Health Check & Monitoring Module
 * Comprehensive system health monitoring and diagnostics
 */

const os = require('os');
const { exec } = require('child_process');
const path = require('path');
const { dbAsync } = require('../database/database');

function parseSizeToGB(sizeStr) {
  if (!sizeStr) return 0;
  const num = parseFloat(sizeStr.replace(/[^0-9.]/g, ''));
  const unit = (sizeStr.match(/[A-Za-z]+/) || [''])[0].toUpperCase();
  if (unit[0] === 'T') return num * 1024;
  if (unit[0] === 'G') return num;
  if (unit[0] === 'M') return num / 1024;
  if (unit[0] === 'K') return num / (1024 * 1024);
  return num / (1024 * 1024 * 1024); // assume bytes
}

class HealthMonitor {
    constructor() {
        this.startTime = Date.now();
        this.lastCheck = null;
        this.healthHistory = [];
        this.maxHistorySize = 100;
        this.sensitiveContacts = []; // FBI, law enforcement, intel briefings, agency contacts
        this.loadSensitiveContacts();
    }

    loadSensitiveContacts() {
        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(__dirname, '../../data/sensitive-contacts.json');
            if (fs.existsSync(logPath)) {
                this.sensitiveContacts = JSON.parse(fs.readFileSync(logPath, 'utf8'));
            }
        } catch (e) { /* silent - dev or no file */ }
    }

    saveSensitiveContacts() {
        try {
            const fs = require('fs');
            const path = require('path');
            const dataDir = path.join(__dirname, '../../data');
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
            const logPath = path.join(dataDir, 'sensitive-contacts.json');
            fs.writeFileSync(logPath, JSON.stringify(this.sensitiveContacts.slice(0, 50), null, 2));
        } catch (e) { /* non-fatal */ }
    }

    /**
     * Record a sensitive external contact (FBI, DOJ, intel agencies, legal, etc.)
     * Call this after any off-line briefing or high-sensitivity conversation.
     */
    recordSensitiveContact(source = 'Unknown Agency', details = 'Off-line contact', timestamp = new Date().toISOString()) {
        const entry = {
            timestamp,
            source,
            details,
            recordedBy: 'HealthMonitor',
            context: 'post-contact security review'
        };
        this.sensitiveContacts.unshift(entry);
        if (this.sensitiveContacts.length > 50) this.sensitiveContacts.pop();
        this.saveSensitiveContacts();
        return entry;
    }

    /**
     * Generate a full Evidence Log for the user's hard drives.
     * This is the "evidence log so they don't take my hard drives" feature.
     * It documents drive inventory + key assets with hashes for chain-of-custody.
     * Automatically references the most recent sensitive (FBI) contact.
     */
    async generateEvidenceLog(targetDrives = []) {
        const { EvidenceLog } = require('./evidence-log');
        const evLog = new EvidenceLog();

        // Pull in the FBI / agency contact we just recorded
        if (this.sensitiveContacts && this.sensitiveContacts.length > 0) {
            evLog.addReferencedContact(this.sensitiveContacts[0]);
            evLog.recordPostFBIContext();
        }

        // Auto-add known external drives (the ones we saw mounted: WFHD, AGENT*, etc.)
        const defaultTargets = targetDrives.length > 0 ? targetDrives : [
            '/Volumes/WFHD',
            '/Volumes/The C Room',
            '/Volumes/AGENT1',
            '/Volumes/AGENT2',
            '/Volumes/AGENT3'
        ];
        evLog.addCurrentSystemDrives(defaultTargets);

        // Add some high-value known assets from the GOAT project as starter evidence items
        // (user can add more with evLog.addEvidenceItem(...) or by giving us the data)
        const importantPaths = [
            { path: path.join(__dirname, '../../../data/processed/unified-catalog.json'), desc: 'Unified royalty catalog (ASCAP/MLC/works)' },
            { path: path.join(__dirname, '../../../GOAT-Royalty-App/data/raw/MASTER DOC.txt'), desc: 'Master federal evidence & insurance claim document' },
        ];
        const fs = require('fs');
        importantPaths.forEach(p => {
            if (fs.existsSync(p.path)) {
                evLog.addFileWithHash(p.path, p.desc);
            }
        });

        // Add a general note about the purpose
        evLog.addNote('Generated to create a verifiable digital manifest of drive contents. Intended to allow authorities to receive copies/logs instead of seizing original physical media.');

        const written = await evLog.writeLogFiles('post-fbi-evidence-preservation');

        // Also record the generation as another sensitive event
        this.recordSensitiveContact(
            'Evidence Log Generation',
            `Evidence log created for drives: ${defaultTargets.join(', ')}. Files: ${written.json}, ${written.html}. Integrity: ${written.integrityHash}`,
            new Date().toISOString()
        );

        return {
            ...written,
            report: evLog.generateReport(),
            message: 'Evidence log generated. Provide the .json + .html to legal counsel or authorities as needed. Original drives remain in your possession with documented chain of custody.'
        };
    }

    /**
     * Get system uptime
     */
    getUptime() {
        const uptime = Date.now() - this.startTime;
        const hours = Math.floor(uptime / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);
        return {
            milliseconds: uptime,
            formatted: `${hours}h ${minutes}m ${seconds}s`
        };
    }

    /**
     * Get system memory usage
     */
    getMemoryUsage() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const processMem = process.memoryUsage();

        return {
            system: {
                total: Math.round(totalMem / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
                used: Math.round(usedMem / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
                free: Math.round(freeMem / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
                usagePercent: Math.round((usedMem / totalMem) * 100)
            },
            process: {
                rss: Math.round(processMem.rss / 1024 / 1024) + ' MB',
                heapTotal: Math.round(processMem.heapTotal / 1024 / 1024) + ' MB',
                heapUsed: Math.round(processMem.heapUsed / 1024 / 1024) + ' MB',
                external: Math.round(processMem.external / 1024 / 1024) + ' MB',
                usagePercent: Math.round((processMem.heapUsed / processMem.heapTotal) * 100)
            }
        };
    }

    /**
     * Get CPU information
     */
    getCPUInfo() {
        const cpus = os.cpus();
        const loadAvg = os.loadavg();

        return {
            model: cpus[0]?.model || 'Unknown',
            cores: cpus.length,
            speed: cpus[0]?.speed ? `${cpus[0].speed / 1000} GHz` : 'Unknown',
            loadAverage: {
                '1min': loadAvg[0].toFixed(2),
                '5min': loadAvg[1].toFixed(2),
                '15min': loadAvg[2].toFixed(2)
            }
        };
    }

    /**
     * Check GPU status (NVIDIA)
     */
    async checkGPU() {
        return new Promise((resolve) => {
            exec('nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free,utilization.gpu,temperature.gpu --format=json,noheader', 
                (error, stdout, stderr) => {
                    if (error) {
                        resolve({ available: false, error: 'NVIDIA GPU not detected or nvidia-smi not available' });
                        return;
                    }

                    try {
                        const lines = stdout.trim().split('\n');
                        const gpus = lines.map((line, index) => {
                            const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));
                            return {
                                id: index,
                                name: parts[0] || 'Unknown',
                                memoryTotal: parts[1] || 'Unknown',
                                memoryUsed: parts[2] || 'Unknown',
                                memoryFree: parts[3] || 'Unknown',
                                utilization: parts[4] || 'Unknown',
                                temperature: parts[5] || 'Unknown'
                            };
                        });

                        resolve({
                            available: true,
                            count: gpus.length,
                            gpus
                        });
                    } catch (parseError) {
                        resolve({ available: false, error: 'Failed to parse GPU info' });
                    }
                }
            );
        });
    }

    /**
     * Check drive / external storage status ("drives are up now")
     * Detects mounted volumes (especially external 8TB/10TB/AI storage)
     * and known candidate paths from env + common install locations.
     */
    async checkDrives() {
        return new Promise((resolve) => {
            const platform = process.platform;
            let command;

            if (platform === 'win32') {
                command = 'wmic logicaldisk get size,freespace,caption,volumename,description /format:csv';
            } else {
                // macOS + Linux — df is portable enough
                command = 'df -h 2>/dev/null || df -k';
            }

            exec(command, (error, stdout) => {
                const drives = [];
                let primaryUp = false;
                let primaryMount = null;
                let message = 'Local storage only';

                if (error && !stdout) {
                    resolve({
                        status: 'unknown',
                        message: 'Drive enumeration failed',
                        drives: [],
                        primaryMount: null,
                        count: 0
                    });
                    return;
                }

                try {
                    if (platform === 'win32') {
                        const lines = (stdout || '').trim().split(/\r?\n/).slice(1);
                        for (const line of lines) {
                            if (!line.trim()) continue;
                            const parts = line.split(',').map(s => s.trim());
                            // Typical wmic csv order varies slightly; pick by patterns
                            const caption = parts.find(p => /^[A-Z]:\\?$/.test(p)) || parts[0] || '';
                            const sizeStr = parts.find(p => /^\d{7,}$/.test(p)) || '0';
                            const freeStr = parts.find((p, i) => /^\d{7,}$/.test(p) && i > 1) || '0';
                            const sizeGB = (parseInt(sizeStr, 10) / 1e9).toFixed(1);
                            const freeGB = (parseInt(freeStr, 10) / 1e9).toFixed(1);
                            if (caption) {
                                drives.push({
                                    mount: caption.replace(/\\$/, ''),
                                    size: sizeGB + ' GB',
                                    free: freeGB + ' GB',
                                    name: parts[parts.length - 1] || ''
                                });
                            }
                        }
                    } else {
                        // macOS / Linux df -h parsing (robust for mac inode columns)
                        const lines = (stdout || '').trim().split(/\r?\n/);
                        for (let i = 1; i < lines.length; i++) {
                            const cols = lines[i].trim().split(/\s+/);
                            if (cols.length < 6) continue;
                            const fs = cols[0];
                            const size = cols[1];
                            const used = cols[2];
                            const avail = cols[3];
                            const cap = cols[4];

                            // Find the actual mount point: last token that starts with /
                            let mountIdx = cols.findIndex((c, idx) => c.startsWith('/') && idx >= 5);
                            const mount = mountIdx >= 0 ? cols.slice(mountIdx).join(' ') : cols[cols.length - 1];

                            // Filter virtual / internal small filesystems
                            if (/^(tmpfs|overlay|devfs|map |com\.apple|Security|autofs|proc|sysfs)/i.test(fs)) continue;
                            if (/^\/dev\/loop|^\/dev\/ram/i.test(fs)) continue;

                            const sizeGB = parseSizeToGB(size);

                            const isSystemVol = /\/System\/Volumes\//.test(mount) || /\/System\/Data\//.test(mount);
                            const isExternalLikely = (
                                (/^\/Volumes\//.test(mount) && !isSystemVol) ||
                                /^\/mnt\//.test(mount) ||
                                /^\/media\//.test(mount) ||
                                /ai-storage|GOAT|10TB|8TB|external/i.test(mount + ' ' + fs)
                            );

                            if (sizeGB > 50 || isExternalLikely) {
                                drives.push({
                                    filesystem: fs,
                                    size,
                                    used,
                                    avail,
                                    capacity: cap,
                                    mount,
                                    external: !!isExternalLikely
                                });
                            }
                        }
                    }

                    // Primary storage candidate detection ("drives are up")
                    const fsMod = require('fs');
                    const pathMod = require('path');
                    const home = os.homedir();

                    const candidates = [
                        process.env.GOAT_DATA_PATH,
                        process.env.AI_STORAGE,
                        process.env.STORAGE,
                        '/mnt/ai-storage',
                        '/mnt/storage',
                        pathMod.join(home, 'GOAT-Royalty'),
                        pathMod.join(home, '10TB'),
                        pathMod.join(home, 'GOAT10TB'),
                    ].filter(Boolean);

                    if (platform === 'darwin') {
                        try {
                            const vols = fsMod.readdirSync('/Volumes');
                            for (const v of vols) {
                                if (v && v !== '.' && v !== '..') candidates.push('/Volumes/' + v);
                            }
                        } catch (e) { /* no /Volumes or permission */ }
                    }

                    for (const cand of candidates) {
                        try {
                            if (fsMod.existsSync(cand)) {
                                // Consider it "up" if the path exists (mounted volume or dir on big drive)
                                // Prefer ones that look external
                                const lower = cand.toLowerCase();
                                const looksPrimary = /ai-storage|10tb|8tb|goat|volumes\/(?!macintosh|system)/i.test(lower) || drives.some(d => d.mount && cand.startsWith(d.mount) && d.external);
                                if (looksPrimary || !primaryUp) {
                                    primaryUp = true;
                                    primaryMount = cand;
                                    if (looksPrimary) break;
                                }
                            }
                        } catch (e) { /* stat fail, skip */ }
                    }

                    if (primaryUp) {
                        message = '✅ Drives are up now — external storage ready for models, samples & projects';
                    } else if (drives.length > 0) {
                        message = 'Local drives detected (mount external 8/10TB drive for full AI + sample library)';
                    } else {
                        message = 'No drive information available';
                    }
                } catch (parseErr) {
                    // non-fatal
                }

                const status = primaryUp ? 'up' : (drives.length > 0 ? 'local' : 'unknown');

                resolve({
                    status,
                    message,
                    primaryMount: primaryMount || null,
                    count: drives.length,
                    drives: drives.slice(0, 6),
                    timestamp: new Date().toISOString()
                });
            });
        });
    }

    /**
     * Security posture check for the running system ("sec security check the system").
     * Inspects loaded protections, auth configuration, environment hardening,
     * and runtime settings without performing destructive or external scans.
     */
    async checkSecurity() {
        return new Promise((resolve) => {
            const secReport = {
                status: 'unknown',
                score: 50,
                message: 'Security posture not yet evaluated',
                protections: {},
                auth: {},
                environment: {},
                runtime: {},
                advancedTools: 'unavailable',
                timestamp: new Date().toISOString()
            };

            const fs = require('fs');
            const path = require('path');
            const os = require('os');

            // 1. Attempt to load the security middleware suite (the heart of app security)
            const middlewarePath = path.join(__dirname, '../middleware/security.js');
            secReport.middlewareSourcePresent = fs.existsSync(middlewarePath);

            try {
                const security = require('../middleware/security');
                secReport.protectionsLoaded = true;
                secReport.protections = {
                    rateLimiting: !!(security.globalLimiter && security.aiLimiter && security.authLimiter),
                    inputValidation: typeof security.validate === 'function' && !!security.schemas,
                    apiKeyAuth: typeof security.apiKeyAuth === 'function',
                    jwtAuth: typeof security.jwtAuth === 'function',
                    securityHeaders: typeof security.securityHeaders === 'function',
                    errorSanitization: typeof security.sanitizeError === 'function',
                    requestEnhancer: typeof security.requestEnhancer === 'function'
                };
            } catch (e) {
                secReport.protectionsLoaded = false;
                secReport.protectionsError = e.message;
                secReport.protections = { rateLimiting: false, inputValidation: false };
            }

            // 2. Auth / secret configuration (never log the actual secrets)
            secReport.auth = {
                jwtConfigured: !!process.env.JWT_SECRET,
                apiKeyConfigured: !!process.env.GOAT_API_KEY,
                jwtUsingFallback: !process.env.JWT_SECRET, // user-auth.js falls back to random
                masterKeyPresent: !!process.env.GOAT_API_KEY
            };

            // 3. Environment hardening
            const nodeEnv = process.env.NODE_ENV || 'development';
            secReport.environment = {
                nodeEnv,
                production: nodeEnv === 'production',
                development: nodeEnv === 'development' || !process.env.NODE_ENV,
                hasNvidiaKey: !!process.env.NVIDIA_API_KEY,
                hasGoogleKey: !!process.env.GOOGLE_AI_STUDIO_KEY
            };

            // 4. Runtime security checks (safe, read-only)
            try {
                const dbPath = process.env.GOAT_DB_PATH ||
                    path.join(__dirname, '../../data/goat-royalties.db');

                if (fs.existsSync(dbPath)) {
                    const stats = fs.statSync(dbPath);
                    // On Unix, check if world-readable (bad for a secrets DB)
                    const mode = stats.mode;
                    secReport.runtime.dbExists = true;
                    secReport.runtime.dbWorldReadable = (mode & 0o004) !== 0;
                    secReport.runtime.dbSize = (stats.size / 1024).toFixed(1) + ' KB';
                } else {
                    secReport.runtime.dbExists = false;
                }

                // Check for obvious credential files in cwd or home that shouldn't be world-readable
                const suspicious = [];
                const home = os.homedir();
                const checkPaths = [
                    path.join(process.cwd(), '.env'),
                    path.join(process.cwd(), 'google-drive-credentials.json'),
                    path.join(home, '.goat-royalties', 'keys'),
                ];
                for (const p of checkPaths) {
                    try {
                        if (fs.existsSync(p)) {
                            const s = fs.statSync(p);
                            if ((s.mode & 0o004) !== 0) suspicious.push(path.basename(p));
                        }
                    } catch {}
                }
                secReport.runtime.suspiciousFiles = suspicious;
                secReport.runtime.safe = suspicious.length === 0 && !secReport.runtime.dbWorldReadable;
            } catch (rtErr) {
                secReport.runtime.error = rtErr.message;
            }

            // 5. Advanced / pentest tooling availability (the cybersecurity/ module is simulated but present)
            try {
                // Try the main project location first, then relative fallbacks
                const candidates = [
                    path.resolve(__dirname, '../../../../src/services/cybersecurity/penetrationTestingService.js'),
                    path.resolve(__dirname, '../../../src/services/cybersecurity/penetrationTestingService.js'),
                    path.resolve(process.cwd(), 'src/services/cybersecurity/penetrationTestingService.js')
                ];
                let loaded = false;
                for (const c of candidates) {
                    if (fs.existsSync(c)) {
                        secReport.advancedTools = 'available (simulated)';
                        secReport.advancedToolsPath = c;
                        loaded = true;
                        break;
                    }
                }
                if (!loaded) {
                    secReport.advancedTools = 'codebase present (simulated pentest framework)';
                }
            } catch (e) {
                secReport.advancedTools = 'unavailable';
            }

            // 6. Intel / Agency contacts (FBI, law enforcement, sensitive briefings)
            secReport.intelContacts = this.sensitiveContacts || [];
            secReport.recentAgencyContact = this.sensitiveContacts.length > 0 ? this.sensitiveContacts[0] : null;

            // 7. Compute overall posture score + status
            let issues = 0;
            let score = 85;

            if (!secReport.protectionsLoaded) { issues += 2; score -= 25; }
            if (!secReport.protections.rateLimiting) { issues += 1; score -= 10; }
            if (!secReport.protections.inputValidation) { issues += 1; score -= 8; }
            if (!secReport.auth.jwtConfigured) { issues += 1; score -= 12; } // fallback random is ok in dev but not great
            if (!secReport.environment.production && process.env.NODE_ENV === 'production') { /* ok */ }
            if (secReport.runtime.dbWorldReadable) { issues += 2; score -= 15; }
            if (secReport.runtime.suspiciousFiles && secReport.runtime.suspiciousFiles.length > 0) { issues += 1; score -= 10; }
            if (!secReport.protections.securityHeaders) { issues += 1; score -= 5; }

            // Post sensitive contact: recommend extra caution (slightly lower base unless hardened)
            if (secReport.recentAgencyContact) {
                score = Math.max(25, score - 8); // elevated scrutiny after agency contact
                issues += 1;
            }

            secReport.score = Math.max(25, Math.min(100, score));
            secReport.issues = issues;

            if (secReport.score >= 90) {
                secReport.status = 'hardened';
                secReport.message = '✅ System security posture hardened — strong protections active';
            } else if (secReport.score >= 70) {
                secReport.status = 'secure';
                secReport.message = '🔒 System security posture secure — core protections in place';
            } else if (secReport.score >= 50) {
                secReport.status = 'warning';
                secReport.message = '⚠️ System security posture needs attention — review auth and runtime settings';
            } else {
                secReport.status = 'exposed';
                secReport.message = '🚨 System security posture weak — immediate review recommended';
            }

            // Post-FBI / agency contact context
            if (secReport.recentAgencyContact) {
                const src = secReport.recentAgencyContact.source || 'external agency';
                secReport.message = `📞 Post-contact review: ${src} — ${secReport.message}`;
                secReport.recommendedActions = [
                    'Rotate any discussed credentials or API keys immediately',
                    'Review audit_log for the last 48h',
                    'Run full simulated penetration assessment',
                    'Verify all external drives and model storage integrity',
                    'Consider enabling stricter rate limits and JWT enforcement'
                ];
            }

            // Bonus: surface a clean top-level summary line
            secReport.summary = `${secReport.status.toUpperCase()} (${secReport.score}/100) — ${secReport.message.replace(/^.*?— /, '')}`;

            resolve(secReport);
        });
    }

    /**
     * Check database health
     */
    async checkDatabase() {
        try {
            const result = await dbAsync.get('SELECT 1 as test');
            const tables = await dbAsync.all(
                `SELECT name FROM sqlite_master WHERE type='table'`
            );

            // Get database file size
            const fs = require('fs');
            const path = require('path');
            const dbPath = process.env.GOAT_DB_PATH || path.join(__dirname, '../../data/goat-royalties.db');
            let dbSize = 'Unknown';
            try {
                const stats = fs.statSync(dbPath);
                dbSize = (stats.size / 1024 / 1024).toFixed(2) + ' MB';
            } catch {}

            return {
                status: 'healthy',
                connected: true,
                tables: tables.map(t => t.name),
                size: dbSize
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                connected: false,
                error: error.message
            };
        }
    }

    /**
     * Check NVIDIA API health
     */
    async checkNvidiaAPI() {
        const nvidiaClient = require('../nvidia/nvidia-nim-client');
        
        try {
            const isConfigured = !!process.env.NVIDIA_API_KEY;
            const isDemo = nvidiaClient.demoMode;

            return {
                configured: isConfigured,
                demoMode: isDemo,
                status: isDemo ? 'demo' : (isConfigured ? 'ready' : 'not_configured'),
                models: Object.keys(nvidiaClient.models || {})
            };
        } catch (error) {
            return {
                configured: false,
                status: 'error',
                error: error.message
            };
        }
    }

    /**
     * Check mining system health
     */
    async checkMining() {
        try {
            const mining = require('../mining/crypto-mining');
            const stats = mining.getStats();

            return {
                status: 'operational',
                activeMiners: stats.activeMiners,
                totalHashrate: stats.totalHashrate,
                totalEarnings: stats.totalEarnings,
                supportedCoins: ['BTC', 'ETH', 'XMR', 'LTC', 'DOGE'],
                walletStatus: stats.walletStatus
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message
            };
        }
    }

    /**
     * Check RAG system health
     */
    async checkRAG() {
        try {
            const rag = require('../rag/rag-system');
            const stats = rag.getStats();

            return {
                status: 'operational',
                totalChunks: stats.totalChunks,
                totalDocuments: stats.totalDocuments,
                cacheSize: stats.cacheSize
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message
            };
        }
    }

    /**
     * Check agent system health
     */
    async checkAgents() {
        try {
            const agentManager = require('../agents/autonomous-agent-manager');
            const status = agentManager.getAgentStatus();
            const metrics = agentManager.getMetrics();

            return {
                status: 'operational',
                agents: status,
                metrics: {
                    totalDecisions: metrics.totalDecisions,
                    successRate: metrics.successRate,
                    queuedTasks: metrics.queuedTasks,
                    autonomousMode: metrics.autonomousMode
                }
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message
            };
        }
    }

    /**
     * Run full health check
     */
    async getFullHealth() {
        const timestamp = new Date().toISOString();
        
        const [
            database,
            nvidia,
            mining,
            rag,
            agents,
            gpu,
            drives,
            security
        ] = await Promise.all([
            this.checkDatabase(),
            this.checkNvidiaAPI(),
            this.checkMining(),
            this.checkRAG(),
            this.checkAgents(),
            this.checkGPU(),
            this.checkDrives(),
            this.checkSecurity()
        ]);

        const health = {
            status: 'healthy',
            timestamp,
            uptime: this.getUptime(),
            version: require('../../package.json').version || '2.0.0',
            environment: process.env.NODE_ENV || 'development',
            system: {
                platform: os.platform(),
                arch: os.arch(),
                hostname: os.hostname(),
                cpu: this.getCPUInfo(),
                memory: this.getMemoryUsage()
            },
            services: {
                database,
                nvidia,
                mining,
                rag,
                agents,
                gpu,
                drives,
                security
            },
            endpoints: {
                api: 70,
                websocket: true,
                static: true
            },
            drives: {
                status: drives?.status || 'unknown',
                message: drives?.message || 'Drive status unavailable',
                primaryMount: drives?.primaryMount || null,
                count: drives?.count || 0
            },
            security: {
                status: security?.status || 'unknown',
                score: security?.score || 0,
                message: security?.message || 'Security status unavailable',
                protections: security?.protections || {},
                auth: security?.auth || {},
                summary: security?.summary || ''
            }
        };

        // Convenience top-level message for UIs / dashboards
        if (drives?.status === 'up') {
            health.drivesMessage = '✅ Drives are up now';
            health.drivesReady = true;
        } else if (drives?.status === 'local') {
            health.drivesMessage = 'Local storage active (external drive recommended for full library)';
            health.drivesReady = false;
        } else {
            health.drivesMessage = drives?.message || 'Drives status unknown';
            health.drivesReady = false;
        }

        // Security convenience fields
        health.securityMessage = security?.message || 'Security status unknown';
        health.securityScore = security?.score || 0;
        health.securityStatus = security?.status || 'unknown';
        if (security?.status === 'hardened') {
            health.securityReady = true;
        } else {
            health.securityReady = security?.status === 'secure';
        }

        // Intel / Agency contact fields (FBI, law enforcement, sensitive briefings)
        health.intelContacts = security?.intelContacts || [];
        health.recentAgencyContact = security?.recentAgencyContact || null;
        if (security?.recentAgencyContact) {
            health.securityMessage = `📞 Recent agency contact (${security.recentAgencyContact.source}) — ${health.securityMessage}`;
            health.securityScore = Math.max(0, (health.securityScore || 0) - 5); // post-contact adjustment
        }

        // Determine overall status
        const services = Object.values(health.services);
        const hasError = services.some(s => s.status === 'error' || s.status === 'unhealthy');
        const hasWarning = services.some(s => s.status === 'demo' || s.status === 'not_configured');
        
        if (hasError) {
            health.status = 'degraded';
        } else if (hasWarning) {
            health.status = 'warning';
        }

        // Store in history
        this.healthHistory.push({ timestamp, status: health.status });
        if (this.healthHistory.length > this.maxHistorySize) {
            this.healthHistory.shift();
        }

        this.lastCheck = health;
        return health;
    }

    /**
     * Get quick status (for monitoring)
     */
    async getQuickStatus() {
        // Light drive hint without full enumeration
        let drivesHint = 'unknown';
        try {
            // Reuse last full result if recent, else quick probe
            if (this.lastCheck && this.lastCheck.drives) {
                drivesHint = this.lastCheck.drives.status;
            } else {
                const os = require('os');
                const fs = require('fs');
                const home = os.homedir();
                const quickCands = ['/mnt/ai-storage', process.env.GOAT_DATA_PATH, home + '/GOAT-Royalty'].filter(Boolean);
                if (process.platform === 'darwin') quickCands.push('/Volumes');
                drivesHint = quickCands.some(c => { try { return fs.existsSync(c); } catch { return false; } }) ? 'up' : 'local';
            }
        } catch (e) { drivesHint = 'local'; }

        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: this.getUptime().formatted,
            drives: drivesHint,
            drivesMessage: drivesHint === 'up' ? 'Drives are up now' : 'Local / external drive check recommended',
            security: this.lastCheck?.security?.status || 'unknown',
            securityMessage: this.lastCheck?.security?.message || 'Run full health for security posture',
            recentAgencyContact: this.lastCheck?.recentAgencyContact || null
        };
    }

    /**
     * Get health history
     */
    getHealthHistory() {
        return this.healthHistory;
    }

    /**
     * Get system metrics for Prometheus/Grafana
     */
    getPrometheusMetrics() {
        const mem = this.getMemoryUsage();
        const cpu = this.getCPUInfo();

        return `
# HELP goat_app_uptime_seconds Application uptime in seconds
# TYPE goat_app_uptime_seconds gauge
goat_app_uptime_seconds ${Math.floor((Date.now() - this.startTime) / 1000)}

# HELP goat_app_memory_usage_percent Process memory usage percentage
# TYPE goat_app_memory_usage_percent gauge
goat_app_memory_usage_percent ${mem.process.usagePercent}

# HELP goat_app_system_memory_usage_percent System memory usage percentage
# TYPE goat_app_system_memory_usage_percent gauge
goat_app_system_memory_usage_percent ${mem.system.usagePercent}

# HELP goat_app_cpu_load_1m CPU load average 1 minute
# TYPE goat_app_cpu_load_1m gauge
goat_app_cpu_load_1m ${cpu.loadAverage['1min']}

# HELP goat_app_cpu_load_5m CPU load average 5 minutes
# TYPE goat_app_cpu_load_5m gauge
goat_app_cpu_load_5m ${cpu.loadAverage['5min']}

# HELP goat_app_cpu_cores Number of CPU cores
# TYPE goat_app_cpu_cores gauge
goat_app_cpu_cores ${cpu.cores}
`.trim();
    }
}

module.exports = new HealthMonitor();