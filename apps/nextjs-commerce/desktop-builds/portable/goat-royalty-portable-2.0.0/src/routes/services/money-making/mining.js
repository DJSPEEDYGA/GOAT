/**
 * Mining API Routes - Crypto Mining Operations
 */

const express = require('express');
const router = express.Router();
const CryptoMiningService = require('../../services/money-making/cryptoMiningService');

const miningService = new CryptoMiningService();

// Get mining statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await miningService.getMiningStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Request payout
router.post('/payout', async (req, res) => {
  try {
    const { amount, walletAddress } = req.body;
    const payout = await miningService.requestPayout(amount, walletAddress);
    res.json({ success: true, data: payout });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get payout history
router.get('/payout-history', async (req, res) => {
  try {
    const history = await miningService.getPayoutHistory(req.query.limit);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get profit report
router.get('/profit-report', async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    const report = await miningService.generateProfitReport(startDate, endDate);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
