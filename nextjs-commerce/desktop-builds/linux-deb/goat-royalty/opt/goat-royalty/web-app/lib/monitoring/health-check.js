/**
 * SUPER GOAT ROYALTIES - Health Check & Monitoring Module
 * Comprehensive system health monitoring and diagnostics
 */

const os = require('os');
const { exec } = require('child_process');
const { dbAsync } = require('../database/database');

class HealthMonitor {
    constructor() {
        this.startTime = Date.now();
        this.lastCheck = null;
        this.healthHistory = [];
        this.maxHistorySize = 100;
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
            gpu
        ] = await Promise.all([
            this.checkDatabase(),
            this.checkNvidiaAPI(),
            this.checkMining(),
            this.checkRAG(),
            this.checkAgents(),
            this.checkGPU()
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
                gpu
            },
            endpoints: {
                api: 70,
                websocket: true,
                static: true
            }
        };

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
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: this.getUptime().formatted
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