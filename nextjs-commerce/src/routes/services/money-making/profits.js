/**
 * Profits API Routes - Financial Analytics and Reporting
 */

const express = require('express');
const router = express.Router();
const ProfitTrackingService = require('../../../services/money-making/profitTrackingService');
const StripeIntegrationService = require('../../../services/money-making/stripeIntegrationService');

const profitService = new ProfitTrackingService();
const stripeService = new StripeIntegrationService();

// Get current profit snapshot
router.get('/current', async (req, res) => {
  try {
    const profit = await profitService.getCurrentProfit();
    res.json({ success: true, data: profit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate profit report
router.get('/report', async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    const report = await profitService.generateProfitReport(startDate, endDate);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get profit by revenue stream
router.get('/by-stream', async (req, res) => {
  try {
    const byStream = await profitService.getProfitByRevenueStream();
    res.json({ success: true, data: byStream });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Stripe revenue report
router.get('/stripe-revenue', async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    const report = await stripeService.generateRevenueReport(startDate, endDate);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
