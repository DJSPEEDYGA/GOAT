/**
 * Payments API Routes - Unified Payment Processing
 */

const express = require('express');
const router = express.Router();
const PaymentGatewayService = require('../../../services/money-making/paymentGatewayService');

const paymentService = new PaymentGatewayService();

// Get available payment methods
router.get('/methods', async (req, res) => {
  try {
    const methods = await paymentService.getPaymentMethods();
    res.json({ success: true, data: methods });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process payment
router.post('/process', async (req, res) => {
  try {
    const { paymentMethod, amount, currency, customerDetails } = req.body;
    const result = await paymentService.processPayment(paymentMethod, amount, currency, customerDetails);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Process refund
router.post('/refund', async (req, res) => {
  try {
    const { transactionId, amount } = req.body;
    const refund = await paymentService.refundPayment(transactionId, amount);
    res.json({ success: true, data: refund });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
