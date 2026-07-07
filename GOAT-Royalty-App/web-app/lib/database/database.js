/**
 * SUPER GOAT ROYALTIES - Database Module
 * SQLite database for persistent data storage
 * Ensures data survives server restarts
 */

const path = require('path');
const fs = require('fs');

// Database path
const DB_PATH = process.env.GOAT_DB_PATH || path.join(__dirname, '../../data/goat-royalties.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Try to load sqlite3, fall back to in-memory storage if not available
let sqlite3;
let db;
let dbAvailable = false;

try {
    sqlite3 = require('sqlite3').verbose();
    db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('❌ Database connection failed:', err.message);
            console.log('📦 Using in-memory storage instead');
        } else {
            console.log('✅ Database connected:', DB_PATH);
            dbAvailable = true;
            initializeTables();
        }
    });
} catch (e) {
    console.log('📦 SQLite not available, using in-memory storage');
    console.log('💡 To enable persistence, install a compatible sqlite3 package');
}

// In-memory fallback storage
const memoryStorage = {
    revenue: [],
    mining: [],
    nfts: [],
    agents: [],
    settings: {}
};

/**
 * Initialize database tables
 */
function initializeTables() {
    db.serialize(() => {
        // Revenue tracking table
        db.run(`CREATE TABLE IF NOT EXISTS revenue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform TEXT NOT NULL,
            amount REAL NOT NULL,
            streams INTEGER DEFAULT 0,
            downloads INTEGER DEFAULT 0,
            growth REAL DEFAULT 0,
            currency TEXT DEFAULT 'USD',
            metadata TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Mining statistics table
        db.run(`CREATE TABLE IF NOT EXISTS mining_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            miner_id TEXT NOT NULL,
            coin TEXT NOT NULL,
            hashrate REAL DEFAULT 0,
            earnings REAL DEFAULT 0,
            accepted_shares INTEGER DEFAULT 0,
            rejected_shares INTEGER DEFAULT 0,
            status TEXT DEFAULT 'idle',
            started_at DATETIME,
            stopped_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Mining earnings history
        db.run(`CREATE TABLE IF NOT EXISTS mining_earnings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            miner_id TEXT NOT NULL,
            coin TEXT NOT NULL,
            amount REAL NOT NULL,
            usd_value REAL DEFAULT 0,
            tx_hash TEXT,
            wallet_address TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // NFT portfolio table
        db.run(`CREATE TABLE IF NOT EXISTS nft_portfolio (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            value REAL NOT NULL,
            chain TEXT NOT NULL,
            contract_address TEXT,
            token_id TEXT,
            metadata TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // NFT sales history
        db.run(`CREATE TABLE IF NOT EXISTS nft_sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nft_id INTEGER NOT NULL,
            sale_price REAL NOT NULL,
            buyer_address TEXT,
            tx_hash TEXT,
            sold_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (nft_id) REFERENCES nft_portfolio(id)
        )`);

        // Collaboration projects
        db.run(`CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'active',
            settings TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Collaboration members
        db.run(`CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            role TEXT DEFAULT 'member',
            avatar TEXT,
            status TEXT DEFAULT 'offline',
            last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Project members junction
        db.run(`CREATE TABLE IF NOT EXISTS project_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            role TEXT DEFAULT 'collaborator',
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (member_id) REFERENCES members(id)
        )`);

        // Smart contracts
        db.run(`CREATE TABLE IF NOT EXISTS contracts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT DEFAULT 'standard',
            chain TEXT DEFAULT 'ethereum',
            contract_address TEXT,
            status TEXT DEFAULT 'draft',
            parties TEXT,
            terms TEXT,
            royalty_splits TEXT,
            deployed_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Contract transactions
        db.run(`CREATE TABLE IF NOT EXISTS contract_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contract_id INTEGER NOT NULL,
            tx_hash TEXT NOT NULL,
            type TEXT,
            data TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contract_id) REFERENCES contracts(id)
        )`);

        // AI Mastering jobs
        db.run(`CREATE TABLE IF NOT EXISTS mastering_jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            track_name TEXT NOT NULL,
            source_file TEXT,
            output_file TEXT,
            settings TEXT,
            quality_score REAL DEFAULT 0,
            issues TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME
        )`);

        // Market analysis data
        db.run(`CREATE TABLE IF NOT EXISTS market_trends (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            genre TEXT NOT NULL,
            growth REAL DEFAULT 0,
            streams TEXT,
            audience TEXT,
            metadata TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // AI Agent decisions
        db.run(`CREATE TABLE IF NOT EXISTS agent_decisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_id TEXT NOT NULL,
            task TEXT,
            result TEXT,
            success INTEGER DEFAULT 1,
            error TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // User settings
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create indexes for better query performance
        db.run(`CREATE INDEX IF NOT EXISTS idx_revenue_platform ON revenue(platform)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_revenue_created ON revenue(created_at)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_mining_stats_miner ON mining_stats(miner_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_mining_earnings_coin ON mining_earnings(coin)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_nft_portfolio_chain ON nft_portfolio(chain)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_agent_decisions_agent ON agent_decisions(agent_id)`);

        console.log('✅ Database tables initialized');
    });
}

/**
 * Promisified database operations
 */
const dbAsync = {
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    },

    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

/**
 * Revenue Database Operations
 */
const RevenueDB = {
    async add(platform, amount, metadata = {}) {
        const sql = `INSERT INTO revenue (platform, amount, streams, downloads, growth, metadata)
                     VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [
            platform,
            amount,
            metadata.streams || 0,
            metadata.downloads || 0,
            metadata.growth || 0,
            JSON.stringify(metadata)
        ];
        return dbAsync.run(sql, params);
    },

    async getByPlatform(platform) {
        return dbAsync.all(
            `SELECT * FROM revenue WHERE platform = ? ORDER BY created_at DESC`,
            [platform]
        );
    },

    async getTotal(platform = null) {
        let sql = `SELECT SUM(amount) as total FROM revenue`;
        let params = [];
        if (platform) {
            sql += ` WHERE platform = ?`;
            params.push(platform);
        }
        const row = await dbAsync.get(sql, params);
        return row?.total || 0;
    },

    async getByDateRange(startDate, endDate, platform = null) {
        let sql = `SELECT * FROM revenue WHERE created_at BETWEEN ? AND ?`;
        let params = [startDate, endDate];
        if (platform) {
            sql += ` AND platform = ?`;
            params.push(platform);
        }
        sql += ` ORDER BY created_at DESC`;
        return dbAsync.all(sql, params);
    },

    async getPlatformStats() {
        return dbAsync.all(`
            SELECT 
                platform,
                SUM(amount) as total_revenue,
                SUM(streams) as total_streams,
                AVG(growth) as avg_growth,
                COUNT(*) as entry_count
            FROM revenue
            GROUP BY platform
            ORDER BY total_revenue DESC
        `);
    },

    async getRecent(limit = 10) {
        return dbAsync.all(
            `SELECT * FROM revenue ORDER BY created_at DESC LIMIT ?`,
            [limit]
        );
    }
};

/**
 * Mining Database Operations
 */
const MiningDB = {
    async createMiner(minerId, coin, config = {}) {
        const sql = `INSERT INTO mining_stats (miner_id, coin, status, started_at)
                     VALUES (?, ?, 'idle', ?)`;
        return dbAsync.run(sql, [minerId, coin, new Date().toISOString()]);
    },

    async updateMiner(minerId, updates) {
        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(updates)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        values.push(minerId);
        const sql = `UPDATE mining_stats SET ${fields.join(', ')} WHERE miner_id = ?`;
        return dbAsync.run(sql, values);
    },

    async addEarning(minerId, coin, amount, usdValue, walletAddress = null, txHash = null) {
        const sql = `INSERT INTO mining_earnings (miner_id, coin, amount, usd_value, wallet_address, tx_hash)
                     VALUES (?, ?, ?, ?, ?, ?)`;
        return dbAsync.run(sql, [minerId, coin, amount, usdValue, walletAddress, txHash]);
    },

    async getMinerStats(minerId) {
        return dbAsync.get(
            `SELECT * FROM mining_stats WHERE miner_id = ?`,
            [minerId]
        );
    },

    async getAllMiners() {
        return dbAsync.all(`SELECT * FROM mining_stats ORDER BY created_at DESC`);
    },

    async getEarnings(coin = null, limit = 100) {
        let sql = `SELECT * FROM mining_earnings`;
        let params = [];
        if (coin) {
            sql += ` WHERE coin = ?`;
            params.push(coin);
        }
        sql += ` ORDER BY timestamp DESC LIMIT ?`;
        params.push(limit);
        return dbAsync.all(sql, params);
    },

    async getTotalEarnings(coin = null) {
        let sql = `SELECT coin, SUM(amount) as total_amount, SUM(usd_value) as total_usd FROM mining_earnings`;
        let params = [];
        if (coin) {
            sql += ` WHERE coin = ?`;
            params.push(coin);
        }
        sql += ` GROUP BY coin`;
        return dbAsync.all(sql, params);
    }
};

/**
 * NFT Database Operations
 */
const NFTDB = {
    async addItem(item) {
        const sql = `INSERT INTO nft_portfolio (name, description, value, chain, contract_address, token_id, metadata)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            item.name,
            item.description,
            item.value,
            item.chain,
            item.contractAddress,
            item.tokenId,
            JSON.stringify(item.metadata || {})
        ];
        return dbAsync.run(sql, params);
    },

    async recordSale(nftId, salePrice, buyerAddress, txHash) {
        // Update NFT value
        await dbAsync.run(
            `UPDATE nft_portfolio SET value = ?, updated_at = ? WHERE id = ?`,
            [salePrice, new Date().toISOString(), nftId]
        );
        // Record sale
        const sql = `INSERT INTO nft_sales (nft_id, sale_price, buyer_address, tx_hash)
                     VALUES (?, ?, ?, ?)`;
        return dbAsync.run(sql, [nftId, salePrice, buyerAddress, txHash]);
    },

    async getAll() {
        return dbAsync.all(`SELECT * FROM nft_portfolio ORDER BY value DESC`);
    },

    async getByChain(chain) {
        return dbAsync.all(
            `SELECT * FROM nft_portfolio WHERE chain = ? ORDER BY value DESC`,
            [chain]
        );
    },

    async getSalesHistory(limit = 50) {
        return dbAsync.all(`
            SELECT s.*, p.name as nft_name 
            FROM nft_sales s 
            JOIN nft_portfolio p ON s.nft_id = p.id 
            ORDER BY s.sold_at DESC 
            LIMIT ?
        `, [limit]);
    },

    async getTotalValue() {
        const row = await dbAsync.get(`SELECT SUM(value) as total FROM nft_portfolio`);
        return row?.total || 0;
    }
};

/**
 * Agent Database Operations
 */
const AgentDB = {
    async recordDecision(agentId, task, result, success, error = null) {
        const sql = `INSERT INTO agent_decisions (agent_id, task, result, success, error)
                     VALUES (?, ?, ?, ?, ?)`;
        return dbAsync.run(sql, [
            agentId,
            task,
            typeof result === 'string' ? result : JSON.stringify(result),
            success ? 1 : 0,
            error
        ]);
    },

    async getHistory(agentId = null, limit = 100) {
        let sql = `SELECT * FROM agent_decisions`;
        let params = [];
        if (agentId) {
            sql += ` WHERE agent_id = ?`;
            params.push(agentId);
        }
        sql += ` ORDER BY created_at DESC LIMIT ?`;
        params.push(limit);
        return dbAsync.all(sql, params);
    },

    async getSuccessRate(agentId = null) {
        let sql = `SELECT 
                    COUNT(*) as total,
                    SUM(success) as successful,
                    (SUM(success) * 100.0 / COUNT(*)) as success_rate
                   FROM agent_decisions`;
        let params = [];
        if (agentId) {
            sql += ` WHERE agent_id = ?`;
            params.push(agentId);
        }
        return dbAsync.get(sql, params);
    }
};

/**
 * Settings Database Operations
 */
const SettingsDB = {
    async get(key, defaultValue = null) {
        const row = await dbAsync.get(`SELECT value FROM settings WHERE key = ?`, [key]);
        return row?.value || defaultValue;
    },

    async set(key, value) {
        const sql = `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`;
        return dbAsync.run(sql, [key, JSON.stringify(value), new Date().toISOString()]);
    },

    async getAll() {
        const rows = await dbAsync.all(`SELECT key, value FROM settings`);
        const settings = {};
        for (const row of rows) {
            try {
                settings[row.key] = JSON.parse(row.value);
            } catch {
                settings[row.key] = row.value;
            }
        }
        return settings;
    }
};

/**
 * Database backup
 */
async function backupDatabase(backupPath) {
    return new Promise((resolve, reject) => {
        db.backup(backupPath)
            .then(() => {
                console.log(`✅ Database backed up to: ${backupPath}`);
                resolve(true);
            })
            .catch(reject);
    });
}

/**
 * Close database connection
 */
function closeDatabase() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) reject(err);
            else {
                console.log('✅ Database connection closed');
                resolve();
            }
        });
    });
}

module.exports = {
    db,
    dbAsync,
    RevenueDB,
    MiningDB,
    NFTDB,
    AgentDB,
    SettingsDB,
    backupDatabase,
    closeDatabase
};