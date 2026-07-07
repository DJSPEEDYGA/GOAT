/**
 * GOAT Royalty - Stripe Payment Integration
 * Handles subscriptions, one-time payments, and marketplace transactions
 */

const Stripe = require('stripe');

class GoatStripe {
    constructor(secretKey) {
        this.stripe = Stripe(secretKey);
        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    }

    // ==================== SUBSCRIPTION PLANS ====================
    
    async createSubscriptionPlans() {
        const plans = {
            // GOAT Creator Tier - $29/month
            creator: await this.stripe.products.create({
                name: 'GOAT Creator',
                description: 'Essential tools for content creators',
                metadata: { tier: 'creator' }
            }).then(async (product) => {
                return this.stripe.prices.create({
                    product: product.id,
                    unit_amount: 2900, // $29.00
                    currency: 'usd',
                    recurring: { interval: 'month' },
                    metadata: { tier: 'creator' }
                });
            }),

            // GOAT Pro Tier - $79/month
            pro: await this.stripe.products.create({
                name: 'GOAT Pro',
                description: 'Advanced tools for professional creators',
                metadata: { tier: 'pro' }
            }).then(async (product) => {
                return this.stripe.prices.create({
                    product: product.id,
                    unit_amount: 7900, // $79.00
                    currency: 'usd',
                    recurring: { interval: 'month' },
                    metadata: { tier: 'pro' }
                });
            }),

            // GOAT Royalty Tier - $199/month
            royalty: await this.stripe.products.create({
                name: 'GOAT Royalty',
                description: 'Full suite for elite creators and brands',
                metadata: { tier: 'royalty' }
            }).then(async (product) => {
                return this.stripe.prices.create({
                    product: product.id,
                    unit_amount: 19900, // $199.00
                    currency: 'usd',
                    recurring: { interval: 'month' },
                    metadata: { tier: 'royalty' }
                });
            })
        };

        return plans;
    }

    // ==================== CUSTOMER MANAGEMENT ====================

    async createCustomer(userData) {
        const customer = await this.stripe.customers.create({
            email: userData.email,
            name: userData.name,
            metadata: {
                userId: userData.userId,
                tier: userData.tier || 'free'
            }
        });
        return customer;
    }

    async getCustomer(customerId) {
        return await this.stripe.customers.retrieve(customerId);
    }

    async updateCustomer(customerId, data) {
        return await this.stripe.customers.update(customerId, data);
    }

    // ==================== SUBSCRIPTION MANAGEMENT ====================

    async createSubscription(customerId, priceId, options = {}) {
        const subscription = await this.stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            metadata: options.metadata || {},
            trial_period_days: options.trialDays || 7 // 7-day free trial
        });

        return {
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
            status: subscription.status
        };
    }

    async cancelSubscription(subscriptionId, immediately = false) {
        if (immediately) {
            return await this.stripe.subscriptions.cancel(subscriptionId);
        }
        // Cancel at period end
        return await this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true
        });
    }

    async updateSubscription(subscriptionId, newPriceId) {
        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
        const itemId = subscription.items.data[0].id;

        return await this.stripe.subscriptions.update(subscriptionId, {
            items: [{ id: itemId, price: newPriceId }],
            proration_behavior: 'always_invoice'
        });
    }

    async getSubscriptionStatus(subscriptionId) {
        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
        return {
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            plan: subscription.items.data[0].price.metadata.tier
        };
    }

    // ==================== ONE-TIME PAYMENTS ====================

    async createPaymentIntent(amount, customerId, metadata = {}) {
        const paymentIntent = await this.stripe.payment_intents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            customer: customerId,
            metadata,
            automatic_payment_methods: { enabled: true }
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        };
    }

    async createCheckoutSession(lineItems, successUrl, cancelUrl, customerId = null) {
        const sessionParams = {
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
        };

        if (customerId) {
            sessionParams.customer = customerId;
        }

        return await this.stripe.checkout.sessions.create(sessionParams);
    }

    // ==================== MARKETPLACE (FOR MERCH STORE) ====================

    async createProduct(productData) {
        const product = await this.stripe.products.create({
            name: productData.name,
            description: productData.description,
            images: productData.images,
            metadata: {
                category: productData.category,
                sku: productData.sku
            }
        });

        // Create price for the product
        const price = await this.stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(productData.price * 100),
            currency: 'usd'
        });

        return { product, price };
    }

    async createOrder(orderData) {
        // Create payment intent for order total
        return await this.createPaymentIntent(
            orderData.total,
            orderData.customerId,
            {
                orderId: orderData.orderId,
                items: JSON.stringify(orderData.items)
            }
        );
    }

    // ==================== CONNECT (FOR BRAND DEALS PAYOUTS) ====================

    async createConnectedAccount(creatorData) {
        const account = await this.stripe.accounts.create({
            type: 'express',
            country: creatorData.country || 'US',
            email: creatorData.email,
            capabilities: {
                transfers: { requested: true },
                card_payments: { requested: true }
            },
            business_profile: {
                mcc: '5815', // Digital goods
                url: creatorData.website
            }
        });

        return account;
    }

    async createAccountLink(accountId, refreshUrl, returnUrl) {
        return await this.stripe.accountLinks.create({
            account: accountId,
            refresh_url: refreshUrl,
            return_url: returnUrl,
            type: 'account_onboarding'
        });
    }

    async transferToCreator(connectedAccountId, amount, metadata = {}) {
        const transfer = await this.stripe.transfers.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            destination: connectedAccountId,
            metadata
        });

        return transfer;
    }

    // ==================== WEBHOOK HANDLING ====================

    async handleWebhook(payload, signature) {
        const event = this.stripe.webhooks.constructEvent(
            payload,
            signature,
            this.webhookSecret
        );

        switch (event.type) {
            case 'payment_intent.succeeded':
                return await this.handlePaymentSuccess(event.data.object);

            case 'customer.subscription.created':
                return await this.handleSubscriptionCreated(event.data.object);

            case 'customer.subscription.updated':
                return await this.handleSubscriptionUpdated(event.data.object);

            case 'customer.subscription.deleted':
                return await this.handleSubscriptionDeleted(event.data.object);

            case 'invoice.payment_failed':
                return await this.handlePaymentFailed(event.data.object);

            case 'checkout.session.completed':
                return await this.handleCheckoutComplete(event.data.object);

            default:
                console.log(`Unhandled event type: ${event.type}`);
                return { received: true };
        }
    }

    async handlePaymentSuccess(paymentIntent) {
        // Update database with payment success
        console.log('Payment succeeded:', paymentIntent.id);
        // TODO: Emit event to update user's access
        return { success: true };
    }

    async handleSubscriptionCreated(subscription) {
        console.log('Subscription created:', subscription.id);
        // TODO: Update user tier in database
        return { success: true };
    }

    async handleSubscriptionUpdated(subscription) {
        console.log('Subscription updated:', subscription.id);
        // TODO: Update user tier in database
        return { success: true };
    }

    async handleSubscriptionDeleted(subscription) {
        console.log('Subscription deleted:', subscription.id);
        // TODO: Downgrade user to free tier
        return { success: true };
    }

    async handlePaymentFailed(invoice) {
        console.log('Payment failed:', invoice.id);
        // TODO: Send notification to user
        return { success: true };
    }

    async handleCheckoutComplete(session) {
        console.log('Checkout complete:', session.id);
        // TODO: Fulfill order
        return { success: true };
    }

    // ==================== BILLING PORTAL ====================

    async createBillingPortalSession(customerId, returnUrl) {
        return await this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl
        });
    }

    // ==================== INVOICES ====================

    async getInvoice(invoiceId) {
        return await this.stripe.invoices.retrieve(invoiceId);
    }

    async listCustomerInvoices(customerId, limit = 10) {
        return await this.stripe.invoices.list({
            customer: customerId,
            limit
        });
    }

    async sendInvoice(invoiceId) {
        return await this.stripe.invoices.sendInvoice(invoiceId);
    }
}

// Export for use in API routes
module.exports = GoatStripe;

// Usage example:
/*
const GoatStripe = require('./stripe-integration');
const stripe = new GoatStripe(process.env.STRIPE_SECRET_KEY);

// Create a subscription
const sub = await stripe.createSubscription(customerId, priceId);

// Handle webhook
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    stripe.handleWebhook(req.body, req.headers['stripe-signature'])
        .then(() => res.json({received: true}))
        .catch(err => res.status(400).send(err.message));
});
*/