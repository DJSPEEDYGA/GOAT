/**
 * SUPER GOAT ROYALTIES - Enhanced Routes
 * Health monitoring, user authentication, and database persistence routes
 */

const express = require('express');
const router = express.Router();
const healthMonitor = require('../monitoring/health-check');
const userAuth = require('../database/user-auth');
const { RevenueDB, MiningDB, NFTDB, AgentDB, SettingsDB } = require('../database/database');

// ==================== HEALTH CHECK ROUTES ====================

/**
 * @route GET /api/health
 * @desc Full health check with all services
 */
router.get('/api/health', async (req, res) => {
    try {
        const health = await healthMonitor.getFullHealth();
        const statusCode = health.status === 'healthy' ? 200 : 
                          health.status === 'warning' ? 200 : 
                          health.status === 'degraded' ? 503 : 500;
        res.status(statusCode).json(health);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/health/quick
 * @desc Quick health status for load balancers
 */
router.get('/api/health/quick', async (req, res) => {
    const status = await healthMonitor.getQuickStatus();
    res.json(status);
});

/**
 * @route GET /api/health/metrics
 * @desc Prometheus-compatible metrics
 */
router.get('/api/health/metrics', (req, res) => {
    const metrics = healthMonitor.getPrometheusMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
});

/**
 * @route GET /api/health/history
 * @desc Health check history
 */
router.get('/api/health/history', (req, res) => {
    const history = healthMonitor.getHealthHistory();
    res.json({ history });
});

// ==================== USER AUTHENTICATION ROUTES ====================

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
router.post('/api/auth/register', async (req, res) => {
    try {
        const { email, username, password, displayName } = req.body;
        
        if (!email || !username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email, username, and password are required' 
            });
        }

        if (password.length < 8) {
            return res.status(400).json({ 
                success: false, 
                error: 'Password must be at least 8 characters' 
            });
        }

        const result = await userAuth.register(email, username, password, displayName);
        
        if (result.success) {
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                userId: result.userId
                // verificationToken would be sent via email in production
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route POST /api/auth/login
 * @desc Login user
 */
router.post('/api/auth/login', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const emailOrUsername = email || username;
        
        if (!emailOrUsername || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email/username and password are required' 
            });
        }

        const userAgent = req.headers['user-agent'] || '';
        const ipAddress = req.ip || req.connection.remoteAddress;

        const result = await userAuth.login(emailOrUsername, password, userAgent, ipAddress);
        
        if (result.success) {
            res.json({
                success: true,
                token: result.token,
                user: result.user
            });
        } else {
            res.status(401).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 */
router.get('/api/auth/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = userAuth.verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const user = await userAuth.getUser(decoded.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 */
router.put('/api/auth/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = userAuth.verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const result = await userAuth.updateProfile(decoded.userId, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/auth/change-password
 * @desc Change password
 */
router.post('/api/auth/change-password', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = userAuth.verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const { currentPassword, newPassword } = req.body;
        const result = await userAuth.changePassword(decoded.userId, currentPassword, newPassword);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/auth/api-key
 * @desc Generate API key
 */
router.post('/api/auth/api-key', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = userAuth.verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const { name, permissions } = req.body;
        const result = await userAuth.generateApiKey(decoded.userId, name, permissions);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== DATABASE PERSISTENCE ROUTES ====================

/**
 * @route GET /api/db/revenue
 * @desc Get all revenue records
 */
router.get('/api/db/revenue', async (req, res) => {
    try {
        const { platform, limit = 100 } = req.query;
        let records;
        if (platform) {
            records = await RevenueDB.getByPlatform(platform);
        } else {
            records = await RevenueDB.getRecent(parseInt(limit));
        }
        res.json({ records, total: records.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/db/revenue/stats
 * @desc Get revenue statistics
 */
router.get('/api/db/revenue/stats', async (req, res) => {
    try {
        const platformStats = await RevenueDB.getPlatformStats();
        const total = await RevenueDB.getTotal();
        res.json({ platformStats, totalRevenue: total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/db/revenue
 * @desc Add revenue record
 */
router.post('/api/db/revenue', async (req, res) => {
    try {
        const { platform, amount, streams, downloads, growth } = req.body;
        const result = await RevenueDB.add(platform, amount, { streams, downloads, growth });
        res.status(201).json({ success: true, id: result.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/db/mining
 * @desc Get all mining records
 */
router.get('/api/db/mining', async (req, res) => {
    try {
        const miners = await MiningDB.getAllMiners();
        const earnings = await MiningDB.getTotalEarnings();
        res.json({ miners, totalEarnings: earnings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/db/mining/earnings
 * @desc Get mining earnings history
 */
router.get('/api/db/mining/earnings', async (req, res) => {
    try {
        const { coin, limit = 100 } = req.query;
        const earnings = await MiningDB.getEarnings(coin, parseInt(limit));
        res.json({ earnings, total: earnings.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/db/nft
 * @desc Get NFT portfolio
 */
router.get('/api/db/nft', async (req, res) => {
    try {
        const { chain } = req.query;
        let nfts;
        if (chain) {
            nfts = await NFTDB.getByChain(chain);
        } else {
            nfts = await NFTDB.getAll();
        }
        const totalValue = await NFTDB.getTotalValue();
        res.json({ nfts, totalValue, count: nfts.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/db/nft/sales
 * @desc Get NFT sales history
 */
router.get('/api/db/nft/sales', async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const sales = await NFTDB.getSalesHistory(parseInt(limit));
        res.json({ sales, total: sales.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/db/nft
 * @desc Add NFT to portfolio
 */
router.post('/api/db/nft', async (req, res) => {
    try {
        const result = await NFTDB.addItem(req.body);
        res.status(201).json({ success: true, id: result.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/db/agents/history
 * @desc Get agent decision history
 */
router.get('/api/db/agents/history', async (req, res) => {
    try {
        const { agentId, limit = 100 } = req.query;
        const history = await AgentDB.getHistory(agentId, parseInt(limit));
        res.json({ history, total: history.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/db/agents/success-rate
 * @desc Get agent success rate
 */
router.get('/api/db/agents/success-rate', async (req, res) => {
    try {
        const { agentId } = req.query;
        const stats = await AgentDB.getSuccessRate(agentId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/db/settings
 * @desc Get all settings
 */
router.get('/api/db/settings', async (req, res) => {
    try {
        const settings = await SettingsDB.getAll();
        res.json({ settings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route PUT /api/db/settings/:key
 * @desc Update setting
 */
router.put('/api/db/settings/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        await SettingsDB.set(key, value);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;