/**
 * Simple Money Making Dashboard - No Auth Required
 */

const express = require('express');
const router = express.Router();
const CryptoMiningService = require('../services/money-making/cryptoMiningService');
const ProfitTrackingService = require('../services/money-making/profitTrackingService');
const RevenueDistributionService = require('../services/money-making/revenueDistributionService');

const miningService = new CryptoMiningService();
const profitService = new ProfitTrackingService();
const revenueService = new RevenueDistributionService();

// Get complete money making dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [miningStats, currentProfit, revenueSplit] = await Promise.all([
      miningService.getMiningStats(),
      profitService.getCurrentProfit(),
      Promise.resolve(revenueService.getRevenueSplit())
    ]);
    
    res.json({
      success: true,
      data: {
        mining: miningStats,
        profits: currentProfit,
        revenueSplit: revenueSplit,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Request crypto payout
router.post('/payout', async (req, res) => {
  try {
    const { amount, walletAddress } = req.body;
    const payout = await miningService.requestPayout(amount, walletAddress);
    res.json({ success: true, data: payout });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
