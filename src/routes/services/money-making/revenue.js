/**
 * Revenue API Routes - Family Business Revenue Distribution
 */

const express = require('express');
const router = express.Router();
const RevenueDistributionService = require('../../../services/money-making/revenueDistributionService');

const revenueService = new RevenueDistributionService();

// Get revenue split configuration
router.get('/split', async (req, res) => {
  try {
    const split = revenueService.getRevenueSplit();
    res.json({ success: true, data: split });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Calculate revenue distribution
router.post('/calculate', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const distribution = revenueService.calculateRevenueDistribution(amount, currency);
    res.json({ success: true, data: distribution });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Process revenue distribution
router.post('/distribute', async (req, res) => {
  try {
    const { revenueSource, amount, metadata } = req.body;
    const result = await revenueService.processRevenueDistribution(revenueSource, amount, metadata);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get distribution history
router.get('/history', async (req, res) => {
  try {
    const history = await revenueService.getDistributionHistory(req.query.limit, req.query.member);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update revenue split
router.put('/split', async (req, res) => {
  try {
    const newSplit = req.body;
    const updatedSplit = revenueService.updateRevenueSplit(newSplit);
    res.json({ success: true, data: updatedSplit });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
