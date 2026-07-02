/**
 * SUPER GOAT ROYALTIES - Bill Payment Module
 * Decentralized bill payment with crypto and messaging integration
 * Inspired by Liberdus with AI-powered enhancements
 */

// Supported bill categories
const BILL_CATEGORIES = {
    UTILITIES: {
        name: 'Utilities',
        icon: '💡',
        subcategories: ['Electricity', 'Gas', 'Water', 'Internet', 'Phone', 'Cable TV']
    },
    HOUSING: {
        name: 'Housing',
        icon: '🏠',
        subcategories: ['Rent', 'Mortgage', 'HOA Fees', 'Property Tax', 'Insurance']
    },
    TRANSPORTATION: {
        name: 'Transportation',
        icon: '🚗',
        subcategories: ['Car Payment', 'Insurance', 'Fuel', 'Parking', 'Public Transit', 'Tolls']
    },
    HEALTHCARE: {
        name: 'Healthcare',
        icon: '🏥',
        subcategories: ['Insurance', 'Doctor Visit', 'Prescription', 'Hospital', 'Dental', 'Vision']
    },
    EDUCATION: {
        name: 'Education',
        icon: '🎓',
        subcategories: ['Tuition', 'Books', 'Student Loan', 'Online Courses', 'Supplies']
    },
    ENTERTAINMENT: {
        name: 'Entertainment',
        icon: '🎬',
        subcategories: ['Streaming Services', 'Gaming', 'Events', 'Subscriptions']
    },
    GOVERNMENT: {
        name: 'Government',
        icon: '🏛️',
        subcategories: ['Taxes', 'Fines', 'Licenses', 'Permits', 'Court Fees']
    },
    CHARITY: {
        name: 'Charity',
        icon: '❤️',
        subcategories: ['Donations', 'Fundraising', 'Non-profit']
    }
};

// Supported payment methods
const PAYMENT_METHODS = {
    CRYPTO_DIRECT: {
        name: 'Direct Crypto Payment',
        description: 'Pay directly with cryptocurrency',
        supportedCoins: ['BTC', 'ETH', 'USDC', 'USDT', 'XRP', 'SOL', 'MATIC', 'BNB']
    },
    CRYPTO_TO_FIAT: {
        name: 'Crypto to Fiat Conversion',
        description: 'Convert crypto to fiat and pay bills',
        supportedCoins: ['BTC', 'ETH', 'USDC', 'USDT', 'XRP', 'SOL', 'MATIC', 'BNB']
    },
    STABLECOIN: {
        name: 'Stablecoin Payment',
        description: 'Pay with USDC/USDT for stable value',
        supportedCoins: ['USDC', 'USDT', 'DAI', 'BUSD']
    },
    OFF_RAMP: {
        name: 'Bank Transfer (Off-Ramp)',
        description: 'Convert crypto to bank transfer',
        supportedCoins: ['BTC', 'ETH', 'USDC', 'USDT', 'XRP']
    }
};

// Payment providers integration
const PAYMENT_PROVIDERS = {
    BRIDGE: {
        name: 'Bridge',
        type: 'off-ramp',
        supportedCountries: ['US', 'EU', 'UK', 'CA'],
        fees: { percentage: 0.5, minimum: 1, maximum: 50 }
    },
    MOONPAY: {
        name: 'MoonPay',
        type: 'off-ramp',
        supportedCountries: ['US', 'EU', 'UK', 'CA', 'AU'],
        fees: { percentage: 1, minimum: 3.99, maximum: null }
    },
    TRANSAK: {
        name: 'Transak',
        type: 'off-ramp',
        supportedCountries: ['US', 'EU', 'UK', 'CA', 'AU', 'IN'],
        fees: { percentage: 0.99, minimum: 2.5, maximum: 30 }
    },
    BITPAY: {
        name: 'BitPay',
        type: 'direct',
        supportedCountries: ['US', 'EU', 'CA'],
        fees: { percentage: 1, minimum: 0, maximum: null }
    },
    COINBASE_COMMERCE: {
        name: 'Coinbase Commerce',
        type: 'direct',
        supportedCountries: ['GLOBAL'],
        fees: { percentage: 1, minimum: 0, maximum: null }
    }
};

// Bill storage
const bills = new Map();
const paymentHistory = [];
const scheduledPayments = [];
const recurringPayments = [];

/**
 * Bill Payment Engine
 * Handles all bill payment operations with crypto integration
 */
class BillPaymentEngine {
    constructor() {
        this.categories = BILL_CATEGORIES;
        this.methods = PAYMENT_METHODS;
        this.providers = PAYMENT_PROVIDERS;
    }

    /**
     * Create a new bill
     */
    createBill(options) {
        const {
            userId,
            name,
            category,
            subcategory,
            amount,
            currency = 'USD',
            dueDate,
            payeeName,
            payeeAccount,
            payeeAddress,
            recurring = false,
            recurringFrequency = null,
            notes = '',
            attachments = []
        } = options;

        const bill = {
            id: `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            name,
            category,
            subcategory,
            amount: parseFloat(amount),
            currency,
            dueDate: new Date(dueDate).getTime(),
            payee: {
                name: payeeName,
                account: payeeAccount,
                address: payeeAddress
            },
            status: 'pending',
            recurring,
            recurringFrequency,
            notes,
            attachments,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            paymentAttempts: [],
            reminders: this.generateReminders(dueDate)
        };

        bills.set(bill.id, bill);

        // If recurring, set up recurring payment
        if (recurring && recurringFrequency) {
            this.setupRecurringPayment(bill);
        }

        return {
            success: true,
            bill
        };
    }

    /**
     * Pay a bill with crypto
     */
    async payBill(billId, paymentOptions) {
        const {
            fromWallet,
            coin,
            amount,
            paymentMethod = 'CRYPTO_DIRECT',
            provider = null,
            memo = '',
            includeMessage = false,
            message = ''
        } = paymentOptions;

        const bill = bills.get(billId);
        
        if (!bill) {
            return { success: false, error: 'Bill not found' };
        }

        if (bill.status === 'paid') {
            return { success: false, error: 'Bill already paid' };
        }

        // Calculate fees
        const feeCalculation = this.calculateFees(amount, coin, paymentMethod, provider);
        
        // Create payment record
        const payment = {
            id: `PAY-${Date.now()}`,
            billId,
            amount,
            coin,
            paymentMethod,
            provider,
            fees: feeCalculation,
            totalDebit: parseFloat(amount) + feeCalculation.totalFee,
            fromWallet,
            memo,
            status: 'processing',
            createdAt: Date.now(),
            estimatedCompletion: this.estimateCompletionTime(paymentMethod, provider),
            txHash: null
        };

        // Add message if included
        if (includeMessage && message) {
            payment.message = {
                content: message,
                encrypted: true,
                recipient: bill.payee.name
            };
        }

        bill.paymentAttempts.push(payment);
        bill.updatedAt = Date.now();

        // Simulate payment processing
        const result = await this.processPayment(payment);

        if (result.success) {
            bill.status = 'paid';
            bill.paidAt = Date.now();
            bill.paymentTx = result.txHash;
            payment.status = 'completed';
            payment.txHash = result.txHash;
            payment.completedAt = Date.now();
            
            paymentHistory.push(payment);
        } else {
            payment.status = 'failed';
            payment.error = result.error;
        }

        return {
            success: result.success,
            payment,
            bill,
            receipt: result.success ? this.generateReceipt(bill, payment) : null
        };
    }

    /**
     * Schedule a payment for later
     */
    schedulePayment(billId, options) {
        const {
            scheduledDate,
            coin,
            amount,
            paymentMethod,
            provider
        } = options;

        const bill = bills.get(billId);
        
        if (!bill) {
            return { success: false, error: 'Bill not found' };
        }

        const scheduled = {
            id: `SCHED-${Date.now()}`,
            billId,
            scheduledDate: new Date(scheduledDate).getTime(),
            coin,
            amount,
            paymentMethod,
            provider,
            status: 'scheduled',
            createdAt: Date.now()
        };

        scheduledPayments.push(scheduled);
        bill.scheduledPayment = scheduled.id;

        return {
            success: true,
            scheduled,
            message: `Payment scheduled for ${new Date(scheduledDate).toLocaleDateString()}`
        };
    }

    /**
     * Set up recurring payment
     */
    setupRecurringPayment(bill) {
        const recurring = {
            id: `RECUR-${Date.now()}`,
            billId: bill.id,
            frequency: bill.recurringFrequency,
            nextPaymentDate: bill.dueDate,
            status: 'active',
            createdAt: Date.now(),
            executionHistory: []
        };

        recurringPayments.push(recurring);
        bill.recurringPaymentId = recurring.id;

        return recurring;
    }

    /**
     * Get bills for a user
     */
    getBills(userId, options = {}) {
        const {
            status = null,
            category = null,
            upcoming = false,
            limit = 50,
            offset = 0
        } = options;

        let userBills = Array.from(bills.values()).filter(b => b.userId === userId);

        // Apply filters
        if (status) {
            userBills = userBills.filter(b => b.status === status);
        }

        if (category) {
            userBills = userBills.filter(b => b.category === category);
        }

        if (upcoming) {
            const now = Date.now();
            userBills = userBills.filter(b => b.dueDate > now && b.status === 'pending');
            userBills.sort((a, b) => a.dueDate - b.dueDate);
        }

        const total = userBills.length;
        userBills = userBills.slice(offset, offset + limit);

        return {
            success: true,
            bills: userBills,
            total,
            summary: this.generateBillSummary(userBills)
        };
    }

    /**
     * Get payment history
     */
    getPaymentHistory(userId, options = {}) {
        const {
            startDate = null,
            endDate = null,
            limit = 50
        } = options;

        let history = paymentHistory.filter(p => {
            const bill = bills.get(p.billId);
            return bill && bill.userId === userId;
        });

        if (startDate) {
            history = history.filter(p => p.createdAt >= new Date(startDate).getTime());
        }

        if (endDate) {
            history = history.filter(p => p.createdAt <= new Date(endDate).getTime());
        }

        return {
            success: true,
            payments: history.slice(-limit),
            total: history.length
        };
    }

    /**
     * AI-Powered Bill Analysis
     * GOAT Enhancement: Smart insights and recommendations
     */
    analyzeBills(userId) {
        const userBills = Array.from(bills.values()).filter(b => b.userId === userId);
        
        const analysis = {
            totalUpcoming: 0,
            totalOverdue: 0,
            totalPaidThisMonth: 0,
            categoryBreakdown: {},
            monthlyAverage: 0,
            predictions: [],
            recommendations: [],
            savingsOpportunities: []
        };

        const now = Date.now();
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();

        userBills.forEach(bill => {
            // Category breakdown
            if (!analysis.categoryBreakdown[bill.category]) {
                analysis.categoryBreakdown[bill.category] = {
                    count: 0,
                    total: 0,
                    icon: BILL_CATEGORIES[bill.category]?.icon || '📄'
                };
            }
            analysis.categoryBreakdown[bill.category].count++;
            analysis.categoryBreakdown[bill.category].total += bill.amount;

            // Status analysis
            if (bill.status === 'pending') {
                if (bill.dueDate < now) {
                    analysis.totalOverdue += bill.amount;
                } else {
                    analysis.totalUpcoming += bill.amount;
                }
            } else if (bill.status === 'paid') {
                const paidDate = new Date(bill.paidAt);
                if (paidDate.getMonth() === thisMonth && paidDate.getFullYear() === thisYear) {
                    analysis.totalPaidThisMonth += bill.amount;
                }
            }
        });

        // Calculate monthly average
        analysis.monthlyAverage = this.calculateMonthlyAverage(userBills);

        // Generate predictions
        analysis.predictions = this.generatePredictions(userBills);

        // Generate recommendations
        analysis.recommendations = this.generateRecommendations(analysis);

        // Find savings opportunities
        analysis.savingsOpportunities = this.findSavingsOpportunities(userBills);

        return {
            success: true,
            analysis,
            insights: this.generateInsights(analysis)
        };
    }

    /**
     * Smart Payment Optimization
     * GOAT Enhancement: AI suggests optimal payment timing and method
     */
    optimizePayments(userId) {
        const userBills = Array.from(bills.values()).filter(
            b => b.userId === userId && b.status === 'pending'
        );

        const optimizations = [];

        userBills.forEach(bill => {
            const optimization = {
                billId: bill.id,
                billName: bill.name,
                currentDueDate: bill.dueDate,
                suggestedPaymentDate: null,
                suggestedMethod: null,
                estimatedSavings: 0,
                reasoning: []
            };

            // Suggest optimal payment date (before due date to avoid late fees)
            const daysUntilDue = Math.floor((bill.dueDate - Date.now()) / (1000 * 60 * 60 * 24));
            
            if (daysUntilDue > 7) {
                optimization.suggestedPaymentDate = bill.dueDate - (3 * 24 * 60 * 60 * 1000); // 3 days before
                optimization.reasoning.push('Payment 3 days before due date to avoid any processing delays');
            } else if (daysUntilDue > 0) {
                optimization.suggestedPaymentDate = Date.now(); // Pay now
                optimization.reasoning.push('Payment due soon - recommend immediate payment');
            } else {
                optimization.suggestedPaymentDate = Date.now();
                optimization.reasoning.push('⚠️ Payment overdue - pay immediately to minimize late fees');
            }

            // Suggest optimal payment method
            optimization.suggestedMethod = this.suggestPaymentMethod(bill);
            optimization.reasoning.push(optimization.suggestedMethod.reasoning);

            // Calculate estimated savings
            if (daysUntilDue < 0) {
                optimization.estimatedSavings = bill.amount * 0.05; // 5% late fee avoidance
            }

            optimizations.push(optimization);
        });

        // Sort by urgency
        optimizations.sort((a, b) => a.currentDueDate - b.currentDueDate);

        return {
            success: true,
            optimizations,
            totalPotentialSavings: optimizations.reduce((sum, o) => sum + o.estimatedSavings, 0)
        };
    }

    /**
     * Group Bill Splitting
     * GOAT Enhancement: Split bills with friends/roommates
     */
    createBillSplit(billId, options) {
        const {
            splitWith = [],
            splitType = 'equal', // equal, percentage, custom
            customAmounts = {},
            message = ''
        } = options;

        const bill = bills.get(billId);
        
        if (!bill) {
            return { success: false, error: 'Bill not found' };
        }

        const split = {
            id: `SPLIT-${Date.now()}`,
            billId,
            totalAmount: bill.amount,
            splitType,
            organizer: bill.userId,
            participants: [],
            status: 'pending',
            createdAt: Date.now()
        };

        // Calculate splits
        if (splitType === 'equal') {
            const share = bill.amount / (splitWith.length + 1);
            split.participants.push({
                address: bill.userId,
                share,
                status: 'paid', // Organizer already responsible
                paidAt: Date.now()
            });
            
            splitWith.forEach(address => {
                split.participants.push({
                    address,
                    share,
                    status: 'pending',
                    paidAt: null
                });
            });
        } else if (splitType === 'percentage') {
            // Custom percentage splits
            Object.entries(customAmounts).forEach(([address, percentage]) => {
                split.participants.push({
                    address,
                    share: bill.amount * (percentage / 100),
                    percentage,
                    status: 'pending',
                    paidAt: null
                });
            });
        } else if (splitType === 'custom') {
            // Custom amount splits
            Object.entries(customAmounts).forEach(([address, amount]) => {
                split.participants.push({
                    address,
                    share: amount,
                    status: 'pending',
                    paidAt: null
                });
            });
        }

        return {
            success: true,
            split,
            paymentRequests: this.generatePaymentRequests(split, message)
        };
    }

    /**
     * Get supported categories
     */
    getCategories() {
        return Object.entries(BILL_CATEGORIES).map(([key, cat]) => ({
            id: key,
            ...cat
        }));
    }

    // Alias for getCategories
    getSupportedCategories() {
        return this.getCategories();
    }

    /**
     * Get supported payment methods
     */
    getPaymentMethods() {
        return Object.entries(PAYMENT_METHODS).map(([key, method]) => ({
            id: key,
            ...method
        }));
    }

    /**
     * Get supported providers
     */
    getProviders() {
        return Object.entries(PAYMENT_PROVIDERS).map(([key, provider]) => ({
            id: key,
            ...provider
        }));
    }

    // Helper methods
    generateReminders(dueDate) {
        const reminders = [];
        const due = new Date(dueDate).getTime();
        
        reminders.push({
            time: due - (7 * 24 * 60 * 60 * 1000), // 1 week before
            type: 'advance_notice',
            sent: false
        });
        
        reminders.push({
            time: due - (3 * 24 * 60 * 60 * 1000), // 3 days before
            type: 'upcoming',
            sent: false
        });
        
        reminders.push({
            time: due - (24 * 60 * 60 * 1000), // 1 day before
            type: 'urgent',
            sent: false
        });
        
        reminders.push({
            time: due, // On due date
            type: 'due_today',
            sent: false
        });

        return reminders;
    }

    calculateFees(amount, coin, paymentMethod, provider) {
        const fees = {
            networkFee: 0,
            providerFee: 0,
            conversionFee: 0,
            totalFee: 0
        };

        // Network fee estimation
        const networkFees = {
            BTC: 2.50,
            ETH: 1.50,
            USDC: 0.10,
            USDT: 0.10,
            XRP: 0.00001,
            SOL: 0.00025,
            MATIC: 0.001,
            BNB: 0.0001
        };
        fees.networkFee = networkFees[coin] || 0.50;

        // Provider fee
        if (provider && PAYMENT_PROVIDERS[provider]) {
            const prov = PAYMENT_PROVIDERS[provider];
            const provFee = parseFloat(amount) * (prov.fees.percentage / 100);
            fees.providerFee = Math.max(provFee, prov.fees.minimum);
            if (prov.fees.maximum) {
                fees.providerFee = Math.min(fees.providerFee, prov.fees.maximum);
            }
        }

        // Conversion fee for crypto to fiat
        if (paymentMethod === 'CRYPTO_TO_FIAT' || paymentMethod === 'OFF_RAMP') {
            fees.conversionFee = parseFloat(amount) * 0.005; // 0.5%
        }

        fees.totalFee = fees.networkFee + fees.providerFee + fees.conversionFee;

        return fees;
    }

    estimateCompletionTime(paymentMethod, provider) {
        const times = {
            CRYPTO_DIRECT: '5-15 minutes',
            CRYPTO_TO_FIAT: '1-3 business days',
            STABLECOIN: '5-15 minutes',
            OFF_RAMP: '1-5 business days'
        };
        return times[paymentMethod] || '5-15 minutes';
    }

    async processPayment(payment) {
        // Simulate payment processing
        // In production, this would integrate with actual payment rails
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const success = Math.random() > 0.1; // 90% success rate simulation
        
        if (success) {
            return {
                success: true,
                txHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
            };
        } else {
            return {
                success: false,
                error: 'Payment processing failed - please try again'
            };
        }
    }

    generateReceipt(bill, payment) {
        return {
            receiptId: `RCP-${Date.now()}`,
            billId: bill.id,
            paymentId: payment.id,
            amount: payment.amount,
            coin: payment.coin,
            fees: payment.fees,
            totalDebit: payment.totalDebit,
            payee: bill.payee.name,
            paidAt: payment.completedAt,
            txHash: payment.txHash,
            status: 'completed'
        };
    }

    calculateMonthlyAverage(bills) {
        const monthlyTotals = {};
        
        bills.forEach(bill => {
            const month = new Date(bill.dueDate).getMonth();
            const year = new Date(bill.dueDate).getFullYear();
            const key = `${year}-${month}`;
            
            if (!monthlyTotals[key]) {
                monthlyTotals[key] = 0;
            }
            monthlyTotals[key] += bill.amount;
        });

        const values = Object.values(monthlyTotals);
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }

    generatePredictions(bills) {
        const predictions = [];
        const recurring = bills.filter(b => b.recurring);
        
        recurring.forEach(bill => {
            const nextDue = new Date(bill.dueDate);
            nextDue.setMonth(nextDue.getMonth() + 1);
            
            predictions.push({
                billName: bill.name,
                amount: bill.amount,
                expectedDate: nextDue.getTime(),
                confidence: 0.95
            });
        });

        return predictions;
    }

    generateRecommendations(analysis) {
        const recommendations = [];

        if (analysis.totalOverdue > 0) {
            recommendations.push({
                type: 'urgent',
                message: `You have $${analysis.totalOverdue.toFixed(2)} in overdue bills. Pay immediately to avoid late fees.`,
                action: 'pay_overdue'
            });
        }

        if (analysis.monthlyAverage > 1000) {
            recommendations.push({
                type: 'info',
                message: 'Consider setting up automatic payments for recurring bills to avoid missing due dates.',
                action: 'setup_autopay'
            });
        }

        Object.entries(analysis.categoryBreakdown).forEach(([category, data]) => {
            if (data.total > analysis.monthlyAverage * 0.5) {
                recommendations.push({
                    type: 'budget',
                    message: `Your ${BILL_CATEGORIES[category]?.name} expenses are high. Consider reviewing your ${category.toLowerCase()} bills.`,
                    action: 'review_category',
                    category
                });
            }
        });

        return recommendations;
    }

    findSavingsOpportunities(bills) {
        const opportunities = [];

        // Look for duplicate services
        const services = {};
        bills.forEach(bill => {
            const key = bill.subcategory?.toLowerCase();
            if (key) {
                if (!services[key]) {
                    services[key] = [];
                }
                services[key].push(bill);
            }
        });

        Object.entries(services).forEach(([service, serviceBills]) => {
            if (serviceBills.length > 1) {
                opportunities.push({
                    type: 'duplicate',
                    message: `You have multiple ${service} bills. Consider consolidating for savings.`,
                    potentialSavings: Math.min(...serviceBills.map(b => b.amount)) * 0.2
                });
            }
        });

        return opportunities;
    }

    generateInsights(analysis) {
        const insights = [];

        if (analysis.totalPaidThisMonth > 0) {
            insights.push(`💰 You've paid $${analysis.totalPaidThisMonth.toFixed(2)} in bills this month.`);
        }

        if (analysis.monthlyAverage > 0) {
            insights.push(`📊 Your average monthly bill expenses are $${analysis.monthlyAverage.toFixed(2)}.`);
        }

        if (analysis.totalUpcoming > 0) {
            insights.push(`📅 You have $${analysis.totalUpcoming.toFixed(2)} in upcoming bills.`);
        }

        return insights;
    }

    suggestPaymentMethod(bill) {
        const amount = bill.amount;
        const category = bill.category;

        // High-value payments should use stablecoins for stability
        if (amount > 1000) {
            return {
                method: 'STABLECOIN',
                coin: 'USDC',
                reasoning: 'Stablecoins recommended for high-value payments to avoid volatility'
            };
        }

        // Recurring bills benefit from consistent payment methods
        if (bill.recurring) {
            return {
                method: 'STABLECOIN',
                coin: 'USDC',
                reasoning: 'Stablecoins ideal for recurring payments for consistent amounts'
            };
        }

        // Default recommendation
        return {
            method: 'CRYPTO_DIRECT',
            coin: 'ETH',
            reasoning: 'Direct crypto payment for fastest processing'
        };
    }

    generatePaymentRequests(split, message) {
        return split.participants
            .filter(p => p.status === 'pending')
            .map(p => ({
                to: p.address,
                amount: p.share,
                currency: 'USDC',
                message: message || `Bill split request for ${split.billId}`,
                splitId: split.id
            }));
    }
}

// Export singleton instance
const billPaymentEngine = new BillPaymentEngine();

module.exports = {
    BillPaymentEngine,
    billPaymentEngine,
    BILL_CATEGORIES,
    PAYMENT_METHODS,
    PAYMENT_PROVIDERS
};