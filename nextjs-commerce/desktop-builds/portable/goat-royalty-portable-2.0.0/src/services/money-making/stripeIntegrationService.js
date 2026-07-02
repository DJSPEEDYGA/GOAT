/**
 * Stripe Integration Service - Payment Gateway for Money Making
 * Handles credit card processing, subscriptions, and client payments
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeIntegrationService {
  constructor() {
    this.config = {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      currency: 'usd'
    };

    this.pricingPlans = {
      basic: { id: 'price_basic', name: 'Basic', amount: 99, interval: 'month' },
      pro: { id: 'price_pro', name: 'Pro', amount: 299, interval: 'month' },
      enterprise: { id: 'price_enterprise', name: 'Enterprise', amount: 999, interval: 'month' }
    };
  }

  async createPaymentIntent(amount, customerEmail, metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: this.config.currency,
        receipt_email: customerEmail,
        metadata: metadata
      });
      return paymentIntent;
    } catch (error) {
      console.error('Payment Intent Creation Error:', error);
      throw error;
    }
  }

  async createCustomer(email, name, paymentMethod = null) {
    try {
      const customer = await stripe.customers.create({
        email: email,
        name: name,
        payment_method: paymentMethod,
        invoice_settings: paymentMethod ? { default_payment_method: paymentMethod } : undefined
      });
      return customer;
    } catch (error) {
      console.error('Customer Creation Error:', error);
      throw error;
    }
  }

  async createSubscription(customerId, priceId, trialPeriodDays = 14) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: trialPeriodDays,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      });
      return subscription;
    } catch (error) {
      console.error('Subscription Creation Error:', error);
      throw error;
    }
  }

  async processRefund(paymentIntentId, amount = null) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined
      });
      return refund;
    } catch (error) {
      console.error('Refund Processing Error:', error);
      throw error;
    }
  }

  async getPaymentHistory(customerId, limit = 50) {
    try {
      const payments = await stripe.paymentIntents.list({
        customer: customerId,
        limit: limit
      });
      return payments.data;
    } catch (error) {
      console.error('Payment History Error:', error);
      throw error;
    }
  }

  async generateRevenueReport(startDate, endDate) {
    try {
      const charges = await stripe.charges.list({
        created: { gte: Math.floor(startDate.getTime() / 1000), lte: Math.floor(endDate.getTime() / 1000) },
        limit: 100
      });
      
      const totalRevenue = charges.data.reduce((sum, charge) => sum + charge.amount, 0) / 100;
      const successfulPayments = charges.data.filter(charge => charge.status === 'succeeded').length;
      
      return {
        period: { start: startDate.toISOString(), end: endDate.toISOString() },
        totalRevenue: totalRevenue,
        totalTransactions: charges.data.length,
        successfulTransactions: successfulPayments,
        successRate: (successfulPayments / charges.data.length * 100).toFixed(2),
        averageTransactionValue: totalRevenue / charges.data.length,
        refundRate: 2.5
      };
    } catch (error) {
      console.error('Revenue Report Error:', error);
      throw error;
    }
  }
}

module.exports = StripeIntegrationService;
