/**
 * POOL MONITORING API ROUTES
 * 
 * Express API routes for pool mining monitoring.
 * No API keys or account registration required.
 */

const express = require('express');
const router = express.Router();
const PoolMonitorClient = require('./services/mining/pool-monitor-client');

// Initialize pool monitor client
const poolMonitor = new PoolMonitorClient({
    walletAddresses: {
        ltc: '324A37mfy4RBLJY9shXYUeoJw1eERHx12n',
        btc: '$lifeimitatesartinc'
    }
});

/**
 * GET /api/pool/dashboard
 * Get complete dashboard data from all pools
 */
router.get('/dashboard', async (req, res) => {
    try {
        const { coin = 'ltc' } = req.query;
        
        const dashboardData = await poolMonitor.getDashboardData(coin);
        
        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Pool dashboard error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            data: poolMonitor.getFallbackStats('PoolMonitor', req.query.coin || 'ltc')
        });
    }
});

/**
 * GET /api/pool/f2pool
 * Get F2Pool stats
 */
router.get('/f2pool', async (req, res) => {
    try {
        const { coin = 'ltc' } = req.query;
        
        const stats = await poolMonitor.getF2PoolStats(coin);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('F2Pool error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            data: poolMonitor.getFallbackStats('F2Pool', req.query.coin || 'ltc')
        });
    }
});

/**
 * GET /api/pool/viabtc
 * Get ViaBTC stats
 */
router.get('/viabtc', async (req, res) => {
    try {
        const { coin = 'ltc' } = req.query;
        
        const stats = await poolMonitor.getViaBTCStats(coin);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('ViaBTC error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            data: poolMonitor.getFallbackStats('ViaBTC', req.query.coin || 'ltc')
        });
    }
});

/**
 * GET /api/pool/poolin
 * Get Poolin stats
 */
router.get('/poolin', async (req, res) => {
    try {
        const { coin = 'ltc' } = req.query;
        
        const stats = await poolMonitor.getPoolinStats(coin);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Poolin error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            data: poolMonitor.getFallbackStats('Poolin', req.query.coin || 'ltc')
        });
    }
});

/**
 * GET /api/pool/zergpool
 * Get ZergPool stats
 */
router.get('/zergpool', async (req, res) => {
    try {
        const { coin = 'ltc' } = req.query;
        
        const stats = await poolMonitor.getZergPoolStats(coin);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('ZergPool error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            data: poolMonitor.getFallbackStats('ZergPool', req.query.coin || 'ltc')
        });
    }
});

/**
 * GET /api/pool/all
 * Get stats from all pools
 */
router.get('/all', async (req, res) => {
    try {
        const { coin = 'ltc' } = req.query;
        
        const allStats = await poolMonitor.getAllPoolsStats(coin);
        
        res.json({
            success: true,
            data: allStats
        });
    } catch (error) {
        console.error('All pools error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            data: poolMonitor.getFallbackStats('PoolMonitor', req.query.coin || 'ltc')
        });
    }
});

/**
 * POST /api/pool/wallets
 * Update wallet addresses
 */
router.post('/wallets', async (req, res) => {
    try {
        const { ltc, btc, eth, etc, zec, bch, xmr, doge } = req.body;
        
        const addresses = {};
        if (ltc) addresses.ltc = ltc;
        if (btc) addresses.btc = btc;
        if (eth) addresses.eth = eth;
        if (etc) addresses.etc = etc;
        if (zec) addresses.zec = zec;
        if (bch) addresses.bch = bch;
        if (xmr) addresses.xmr = xmr;
        if (doge) addresses.doge = doge;
        
        poolMonitor.setWalletAddresses(addresses);
        
        res.json({
            success: true,
            message: 'Wallet addresses updated',
            data: poolMonitor.walletAddresses
        });
    } catch (error) {
        console.error('Update wallets error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/pool/wallets
 * Get current wallet addresses
 */
router.get('/wallets', (req, res) => {
    res.json({
        success: true,
        data: poolMonitor.walletAddresses
    });
});

/**
 * GET /api/pool/coins
 * Get supported coins
 */
router.get('/coins', (req, res) => {
    const supportedCoins = [
        { code: 'btc', name: 'Bitcoin', symbol: '₿', pools: ['f2pool', 'viabtc', 'poolin'] },
        { code: 'ltc', name: 'Litecoin', symbol: 'Ł', pools: ['f2pool', 'viabtc', 'poolin', 'zergpool'] },
        { code: 'eth', name: 'Ethereum', symbol: 'Ξ', pools: ['f2pool', 'viabtc', 'poolin'] },
        { code: 'etc', name: 'Ethereum Classic', symbol: 'Ξ', pools: ['f2pool'] },
        { code: 'zec', name: 'Zcash', symbol: 'ZEC', pools: ['f2pool'] },
        { code: 'bch', name: 'Bitcoin Cash', symbol: 'BCH', pools: ['f2pool', 'viabtc'] },
    ];
    
    res.json({
        success: true,
        data: supportedCoins
    });
});

module.exports = router;