/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║              GOAT ROYALTY APP - UNIFIED SERVER CONFIGURATION                ║
 * ║                     Multi-Server Architecture Support                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════
// SERVER INFRASTRUCTURE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const SERVERS = {
    // VPS #1 - Production Server (KVM 2)
    production: {
        name: 'srv1148455.hstgr.cloud',
        host: '72.61.193.184',
        role: 'production',
        specs: {
            type: 'KVM 2',
            cpu: '2 vCPU',
            ram: '8 GB',
            storage: '50 GB SSD'
        },
        services: ['web', 'api', 'ssl'],
        ports: {
            http: 80,
            https: 443,
            app: 3000
        }
    },
    
    // VPS #2 - Database Server (KVM 8)
    database: {
        name: 'srv832760.hstgr.cloud',
        host: '93.127.214.171',
        role: 'database',
        specs: {
            type: 'KVM 8',
            cpu: '8 vCPU',
            ram: '32 GB',
            storage: '200 GB SSD'
        },
        services: ['postgresql', 'redis', 'backup'],
        ports: {
            postgresql: 5432,
            redis: 6379
        }
    },
    
    // Jetson AGX Orin 64GB - AI Engine
    jetson: {
        name: 'jetson-local',
        host: '192.168.1.100', // Update with actual local IP
        role: 'ai-engine',
        specs: {
            type: 'Jetson AGX Orin 64GB',
            cpu: '12-core ARM Cortex-A78AE',
            gpu: '2048 CUDA cores, 64 Tensor cores',
            ram: '64 GB unified',
            storage: '64 GB eMMC + NVMe'
        },
        services: ['ollama', 'ai-inference', 'voice'],
        ports: {
            app: 3000,
            ollama: 11434
        }
    },
    
    // Local Development (2x RTX 3090)
    development: {
        name: 'local-dev',
        host: 'localhost',
        role: 'development',
        specs: {
            type: 'Desktop Workstation',
            cpu: 'High-end desktop CPU',
            gpu: '2x RTX 3090 (48GB VRAM)',
            ram: '128 GB DDR4',
            storage: '2TB NVMe + 8TB HDD'
        },
        services: ['development', 'training', 'rendering'],
        ports: {
            app: 3000,
            dev: 5173
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CURRENT SERVER DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectCurrentServer() {
    const hostname = os.hostname();
    const platform = os.platform();
    
    // Check for Jetson
    if (fs.existsSync('/etc/nv_tegra_release')) {
        return 'jetson';
    }
    
    // Check environment variable
    const serverRole = process.env.SERVER_ROLE;
    if (serverRole && SERVERS[serverRole]) {
        return serverRole;
    }
    
    // Check hostname patterns
    if (hostname.includes('srv1148455') || hostname.includes('hstgr.cloud')) {
        return 'production';
    }
    
    if (hostname.includes('srv832760')) {
        return 'database';
    }
    
    // Default to development
    return 'development';
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

function getServerConfig(role = null) {
    const currentRole = role || detectCurrentServer();
    const server = SERVERS[currentRole];
    
    return {
        // Server Identity
        role: currentRole,
        name: server.name,
        host: server.host,
        
        // Services Configuration
        services: server.services,
        ports: server.ports,
        
        // Database Configuration
        database: {
            host: process.env.DATABASE_URL ? 'remote' : 'localhost',
            url: process.env.DATABASE_URL || `postgresql://goat_admin:goat_secure_2024@${SERVERS.database.host}:5432/goat_db`,
            name: 'goat_db',
            user: 'goat_admin'
        },
        
        // Redis Configuration
        redis: {
            host: process.env.REDIS_URL ? 'remote' : SERVERS.database.host,
            port: 6379,
            url: process.env.REDIS_URL || `redis://${SERVERS.database.host}:6379`
        },
        
        // AI Configuration
        ai: {
            provider: currentRole === 'jetson' ? 'ollama' : 'remote',
            model: 'qwen2.5:32b-instruct-q4',
            endpoint: currentRole === 'jetson' 
                ? 'http://localhost:11434' 
                : `http://${SERVERS.jetson.host}:11434`
        },
        
        // Data Paths
        data: {
            dir: process.env.DATA_DIR || '/opt/goat-app/data',
            catalog: '/opt/goat-app/data/waka_catalog.json',
            network: '/opt/goat-app/data/network_profiles.json',
            sync: '/opt/goat-app/data/sync_opportunities.json',
            config: '/opt/goat-app/data/goat-config.json'
        },
        
        // Feature Flags based on server role
        features: {
            // Production: Full web interface, API
            webInterface: ['production', 'jetson', 'development'].includes(currentRole),
            apiGateway: ['production'].includes(currentRole),
            
            // Database: PostgreSQL, Redis
            database: ['database'].includes(currentRole),
            cache: ['database'].includes(currentRole),
            
            // AI Engine: Ollama, Voice
            aiInference: ['jetson', 'development'].includes(currentRole),
            voiceProcessing: ['jetson', 'development'].includes(currentRole),
            
            // Development: Training, Debugging
            training: ['development'].includes(currentRole),
            debugging: ['development'].includes(currentRole),
            
            // Backup
            backup: ['database'].includes(currentRole)
        },
        
        // Performance Settings
        performance: {
            maxConnections: currentRole === 'production' ? 1000 : 100,
            cacheSize: currentRole === 'database' ? '2GB' : '256MB',
            aiThreads: currentRole === 'jetson' ? 12 : 4
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA SYNC MANAGER
// ═══════════════════════════════════════════════════════════════════════════════

class DataSyncManager {
    constructor(config) {
        this.config = config;
        this.lastSync = null;
        this.syncInterval = 3600000; // 1 hour
    }
    
    async syncFromGitHub() {
        console.log('🔄 Syncing data from GitHub...');
        
        try {
            const { execSync } = require('child_process');
            
            // Pull latest data from GitHub
            execSync('git pull origin main', { 
                cwd: '/opt/goat-app',
                stdio: 'inherit'
            });
            
            this.lastSync = new Date();
            console.log('✅ Data sync complete!');
            
            return true;
        } catch (error) {
            console.error('❌ Sync failed:', error.message);
            return false;
        }
    }
    
    async pushToGitHub() {
        console.log('📤 Pushing local changes to GitHub...');
        
        try {
            const { execSync } = require('child_process');
            
            execSync('git add data/', { cwd: '/opt/goat-app' });
            execSync(`git commit -m "🔄 Data update ${new Date().toISOString()}"`, { 
                cwd: '/opt/goat-app',
                stdio: 'inherit'
            });
            execSync('git push origin main', { 
                cwd: '/opt/goat-app',
                stdio: 'inherit'
            });
            
            console.log('✅ Push complete!');
            return true;
        } catch (error) {
            console.error('❌ Push failed:', error.message);
            return false;
        }
    }
    
    getSyncStatus() {
        return {
            lastSync: this.lastSync,
            nextSync: this.lastSync ? new Date(this.lastSync.getTime() + this.syncInterval) : null,
            status: this.lastSync ? 'synced' : 'pending'
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    SERVERS,
    detectCurrentServer,
    getServerConfig,
    DataSyncManager
};