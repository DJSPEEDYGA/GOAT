/**
 * Crypto Mining API Server
 * Serves real-time mining data from NiceHash to the dashboard
 * 
 * Usage: node mining-api-server.js
 */

const express = require('express');
const cors = require('cors');
const nicehashService = require('./lib/mining/nicehash-service');
const walletConfig = require('./lib/mining/wallet-config');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Crypto Mining API is running',
        timestamp: new Date().toISOString()
    });
});

// Get mining statistics
app.get('/api/mining/stats', async (req, res) => {
    try {
        const stats = await nicehashService.getMiningStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching mining stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch mining statistics'
        });
    }
});

// Get wallet balance
app.get('/api/wallet/balance', async (req, res) => {
    try {
        const wallet = walletConfig;
        const stats = await nicehashService.getMiningStats();
        
        res.json({
            success: true,
            data: {
                walletAddress: wallet.wallets.litecoin.address,
                unpaidBalance: stats.unpaidBalance,
                pendingPayouts: stats.pendingPayouts,
                totalEarned: stats.totalEarned,
                ltcPrice: stats.ltcPrice,
                usdValue: stats.totalEarned * stats.ltcPrice
            }
        });
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch wallet balance'
        });
    }
});

// Get GPU statistics
app.get('/api/mining/gpus', async (req, res) => {
    try {
        const stats = await nicehashService.getMiningStats();
        res.json({
            success: true,
            data: stats.gpuStats
        });
    } catch (error) {
        console.error('Error fetching GPU stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch GPU statistics'
        });
    }
});

// Get payout history
app.get('/api/mining/payouts', async (req, res) => {
    try {
        const payouts = await nicehashService.getPayoutHistory();
        res.json({
            success: true,
            data: payouts
        });
    } catch (error) {
        console.error('Error fetching payout history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payout history'
        });
    }
});

// Request a payout
app.post('/api/mining/payout', async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount) {
            return res.status(400).json({
                success: false,
                error: 'Amount is required'
            });
        }

        const stats = await nicehashService.getMiningStats();
        const minimumPayout = 0.01; // LTC

        if (stats.unpaidBalance < minimumPayout) {
            return res.status(400).json({
                success: false,
                error: `Insufficient balance. Minimum payout is ${minimumPayout} LTC. Current balance: ${stats.unpaidBalance.toFixed(4)} LTC`
            });
        }

        const result = await nicehashService.requestPayout(amount);
        res.json(result);
    } catch (error) {
        console.error('Error requesting payout:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to request payout'
        });
    }
});

// Auto-withdraw
app.post('/api/mining/auto-withdraw', async (req, res) => {
    try {
        const stats = await nicehashService.getMiningStats();
        const minimumPayout = 0.01; // LTC

        if (stats.unpaidBalance < minimumPayout) {
            return res.status(400).json({
                success: false,
                error: `Insufficient balance for auto-withdraw. Minimum balance: ${minimumPayout} LTC`
            });
        }

        const result = await nicehashService.requestPayout(stats.unpaidBalance);
        res.json({
            success: true,
            message: 'Auto-withdraw activated! Funds will be sent to your wallet within 24 hours.',
            data: result
        });
    } catch (error) {
        console.error('Error with auto-withdraw:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to activate auto-withdraw'
        });
    }
});

// Get profitability data (for charts)
app.get('/api/mining/profitability', async (req, res) => {
    try {
        const data = await nicehashService.getMiningProfitability();
        res.json({
            success: true,
            data: data || nicehashService.getSimulatedStats()
        });
    } catch (error) {
        console.error('Error fetching profitability:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profitability data'
        });
    }
});

// Get wallet configuration
app.get('/api/wallet/config', (req, res) => {
    res.json({
        success: true,
        data: {
            ltcWallet: walletConfig.wallets.litecoin.address,
            walletAddress: walletConfig.wallets.litecoin.address,
            payoutSettings: walletConfig.payoutSettings
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 Crypto Mining API Server Started');
    console.log('='.repeat(60));
    console.log(`📡 Server running at: http://localhost:${PORT}`);
    console.log(`📊 Dashboard available at: http://localhost:${PORT}/crypto-mining.html`);
    console.log(`💰 LTC Wallet: ${walletConfig.wallets.litecoin.address}`);
    console.log('='.repeat(60));
    console.log('\n📝 API Endpoints:');
    console.log(`   GET  /api/health             - Health check`);
    console.log(`   GET  /api/mining/stats       - Mining statistics`);
    console.log(`   GET  /api/wallet/balance     - Wallet balance`);
    console.log(`   GET  /api/mining/gpus        - GPU statistics`);
    console.log(`   GET  /api/mining/payouts     - Payout history`);
    console.log(`   POST /api/mining/payout      - Request payout`);
    console.log(`   POST /api/mining/auto-withdraw - Auto withdraw`);
    console.log(`   GET  /api/mining/profitability - Profitability data`);
    console.log(`   GET  /api/wallet/config      - Wallet configuration`);
    console.log('='.repeat(60));
});

module.exports = app;