/**
 * DJ SPEEDY'S BANKING & FINANCE SYSTEM
 * Digital Wallet, Crypto & Payment Processing
 * Created by SuperNinja - NinjaTech AI
 */

const { EventEmitter } = require('events');

class FinanceCore extends EventEmitter {
  constructor() {
    super();
    this.accounts = new Map();
    this.transactions = new Map();
    this.cryptoWallets = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize Finance Core
   */
  async initialize() {
    console.log('💰 DJ Speedy Finance System initializing...');
    
    // Load exchange rates
    await this.loadExchangeRates();
    
    // Load cryptocurrency data
    await this.loadCryptoData();
    
    this.isInitialized = true;
    console.log('✅ Finance System ready for transactions!');
  }

  /**
   * Create account
   */
  async createAccount(userData) {
    const account = {
      id: this.generateAccountId(),
      userId: userData.userId,
      type: userData.type || 'personal', // personal, business, artist
      createdAt: Date.now(),
      status: 'active',
      
      // Balance information
      balances: {
        USD: 0,
        EUR: 0,
        GBP: 0
      },
      
      // Account limits
      limits: {
        dailyWithdrawal: 10000,
        dailyTransfer: 50000,
        monthlyTransfer: 200000
      },
      
      // Security settings
      security: {
        twoFactorEnabled: false,
        biometricEnabled: false,
        transactionNotifications: true,
        securityQuestions: []
      },
      
      // Account preferences
      preferences: {
        defaultCurrency: 'USD',
        autoConvert: false,
        roundUpSavings: false
      },
      
      // Statistics
      stats: {
        totalTransactions: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalTransfers: 0
      }
    };
    
    this.accounts.set(account.id, account);
    this.emit('account-created', account);
    
    console.log(`💰 Account created: ${account.id}`);
    
    return account;
  }

  /**
   * Create crypto wallet
   */
  async createCryptoWallet(accountId, cryptoType) {
    const wallet = {
      id: this.generateWalletId(),
      accountId: accountId,
      cryptoType: cryptoType, // BTC, ETH, SOL, etc.
      address: this.generateCryptoAddress(cryptoType),
      publicKey: this.generatePublicKey(),
      balance: 0,
      createdAt: Date.now(),
      status: 'active'
    };
    
    this.cryptoWallets.set(wallet.id, wallet);
    this.emit('crypto-wallet-created', wallet);
    
    console.log(`₿ Crypto wallet created: ${wallet.cryptoType}`);
    
    return wallet;
  }

  /**
   * Deposit funds
   */
  async deposit(accountId, amount, currency = 'USD', metadata = {}) {
    const account = this.accounts.get(accountId);
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    if (amount <= 0) {
      throw new Error('Invalid amount');
    }
    
    // Update balance
    account.balances[currency] = (account.balances[currency] || 0) + amount;
    
    // Create transaction record
    const transaction = {
      id: this.generateTransactionId(),
      accountId: accountId,
      type: 'deposit',
      amount: amount,
      currency: currency,
      balanceAfter: account.balances[currency],
      timestamp: Date.now(),
      status: 'completed',
      metadata: metadata
    };
    
    this.transactions.set(transaction.id, transaction);
    account.stats.totalTransactions++;
    account.stats.totalDeposits += amount;
    
    this.emit('deposit-completed', transaction);
    
    console.log(`💵 Deposit: ${amount} ${currency} to ${accountId}`);
    
    return transaction;
  }

  /**
   * Withdraw funds
   */
  async withdraw(accountId, amount, currency = 'USD', metadata = {}) {
    const account = this.accounts.get(accountId);
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    if (amount <= 0) {
      throw new Error('Invalid amount');
    }
    
    if ((account.balances[currency] || 0) < amount) {
      throw new Error('Insufficient funds');
    }
    
    // Update balance
    account.balances[currency] -= amount;
    
    // Create transaction record
    const transaction = {
      id: this.generateTransactionId(),
      accountId: accountId,
      type: 'withdrawal',
      amount: amount,
      currency: currency,
      balanceAfter: account.balances[currency],
      timestamp: Date.now(),
      status: 'completed',
      metadata: metadata
    };
    
    this.transactions.set(transaction.id, transaction);
    account.stats.totalTransactions++;
    account.stats.totalWithdrawals += amount;
    
    this.emit('withdrawal-completed', transaction);
    
    console.log(`💸 Withdrawal: ${amount} ${currency} from ${accountId}`);
    
    return transaction;
  }

  /**
   * Transfer funds
   */
  async transfer(fromAccountId, toAccountId, amount, currency = 'USD', metadata = {}) {
    const fromAccount = this.accounts.get(fromAccountId);
    const toAccount = this.accounts.get(toAccountId);
    
    if (!fromAccount || !toAccount) {
      throw new Error('Account not found');
    }
    
    if (amount <= 0) {
      throw new Error('Invalid amount');
    }
    
    if ((fromAccount.balances[currency] || 0) < amount) {
      throw new Error('Insufficient funds');
    }
    
    // Calculate fee (1% for transfers)
    const fee = amount * 0.01;
    const totalAmount = amount + fee;
    
    // Update balances
    fromAccount.balances[currency] -= totalAmount;
    toAccount.balances[currency] = (toAccount.balances[currency] || 0) + amount;
    
    // Create transaction records
    const fromTransaction = {
      id: this.generateTransactionId(),
      accountId: fromAccountId,
      type: 'transfer-out',
      amount: totalAmount,
      currency: currency,
      fee: fee,
      recipient: toAccountId,
      balanceAfter: fromAccount.balances[currency],
      timestamp: Date.now(),
      status: 'completed',
      metadata: metadata
    };
    
    const toTransaction = {
      id: this.generateTransactionId(),
      accountId: toAccountId,
      type: 'transfer-in',
      amount: amount,
      currency: currency,
      sender: fromAccountId,
      balanceAfter: toAccount.balances[currency],
      timestamp: Date.now(),
      status: 'completed',
      metadata: metadata
    };
    
    this.transactions.set(fromTransaction.id, fromTransaction);
    this.transactions.set(toTransaction.id, toTransaction);
    
    fromAccount.stats.totalTransactions++;
    toAccount.stats.totalTransactions++;
    fromAccount.stats.totalTransfers += totalAmount;
    
    this.emit('transfer-completed', { from: fromTransaction, to: toTransaction });
    
    console.log(`💳 Transfer: ${amount} ${currency} from ${fromAccountId} to ${toAccountId}`);
    
    return { from: fromTransaction, to: toTransaction };
  }

  /**
   * Convert currency
   */
  async convertCurrency(accountId, fromCurrency, toCurrency, amount) {
    const account = this.accounts.get(accountId);
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    if ((account.balances[fromCurrency] || 0) < amount) {
      throw new Error('Insufficient funds');
    }
    
    // Get exchange rate
    const exchangeRate = this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amount * exchangeRate;
    
    // Calculate fee (0.5% for currency conversion)
    const fee = convertedAmount * 0.005;
    const finalAmount = convertedAmount - fee;
    
    // Update balances
    account.balances[fromCurrency] -= amount;
    account.balances[toCurrency] = (account.balances[toCurrency] || 0) + finalAmount;
    
    // Create transaction record
    const transaction = {
      id: this.generateTransactionId(),
      accountId: accountId,
      type: 'currency-conversion',
      amount: amount,
      fromCurrency: fromCurrency,
      toCurrency: toCurrency,
      exchangeRate: exchangeRate,
      convertedAmount: convertedAmount,
      fee: fee,
      finalAmount: finalAmount,
      timestamp: Date.now(),
      status: 'completed'
    };
    
    this.transactions.set(transaction.id, transaction);
    account.stats.totalTransactions++;
    
    this.emit('currency-converted', transaction);
    
    console.log(`💱 Converted: ${amount} ${fromCurrency} to ${finalAmount.toFixed(2)} ${toCurrency}`);
    
    return transaction;
  }

  /**
   * Buy cryptocurrency
   */
  async buyCrypto(accountId, cryptoType, amount, currency = 'USD') {
    const account = this.accounts.get(accountId);
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    if ((account.balances[currency] || 0) < amount) {
      throw new Error('Insufficient funds');
    }
    
    // Get crypto price
    const cryptoPrice = this.getCryptoPrice(cryptoType, currency);
    const cryptoAmount = amount / cryptoPrice;
    
    // Calculate fee (1.5% for crypto purchases)
    const fee = amount * 0.015;
    const totalAmount = amount + fee;
    
    // Deduct from account
    account.balances[currency] -= totalAmount;
    
    // Find or create crypto wallet
    let wallet = this.findCryptoWallet(accountId, cryptoType);
    if (!wallet) {
      wallet = await this.createCryptoWallet(accountId, cryptoType);
    }
    
    // Add to wallet
    wallet.balance += cryptoAmount;
    
    // Create transaction record
    const transaction = {
      id: this.generateTransactionId(),
      accountId: accountId,
      type: 'crypto-purchase',
      amount: totalAmount,
      currency: currency,
      cryptoType: cryptoType,
      cryptoAmount: cryptoAmount,
      cryptoPrice: cryptoPrice,
      fee: fee,
      walletId: wallet.id,
      timestamp: Date.now(),
      status: 'completed'
    };
    
    this.transactions.set(transaction.id, transaction);
    account.stats.totalTransactions++;
    
    this.emit('crypto-purchased', transaction);
    
    console.log(`₿ Bought ${cryptoAmount.toFixed(8)} ${cryptoType} for ${amount} ${currency}`);
    
    return transaction;
  }

  /**
   * Sell cryptocurrency
   */
  async sellCrypto(walletId, cryptoAmount, currency = 'USD') {
    const wallet = this.cryptoWallets.get(walletId);
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    if (wallet.balance < cryptoAmount) {
      throw new Error('Insufficient crypto balance');
    }
    
    const account = this.accounts.get(wallet.accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    
    // Get crypto price
    const cryptoPrice = this.getCryptoPrice(wallet.cryptoType, currency);
    const amount = cryptoAmount * cryptoPrice;
    
    // Calculate fee (1.5% for crypto sales)
    const fee = amount * 0.015;
    const finalAmount = amount - fee;
    
    // Update wallet
    wallet.balance -= cryptoAmount;
    
    // Add to account
    account.balances[currency] = (account.balances[currency] || 0) + finalAmount;
    
    // Create transaction record
    const transaction = {
      id: this.generateTransactionId(),
      accountId: account.id,
      walletId: walletId,
      type: 'crypto-sale',
      cryptoType: wallet.cryptoType,
      cryptoAmount: cryptoAmount,
      cryptoPrice: cryptoPrice,
      amount: amount,
      currency: currency,
      fee: fee,
      finalAmount: finalAmount,
      timestamp: Date.now(),
      status: 'completed'
    };
    
    this.transactions.set(transaction.id, transaction);
    account.stats.totalTransactions++;
    
    this.emit('crypto-sold', transaction);
    
    console.log(`₿ Sold ${cryptoAmount} ${wallet.cryptoType} for ${finalAmount.toFixed(2)} ${currency}`);
    
    return transaction;
  }

  /**
   * Get account balance
   */
  getAccountBalance(accountId) {
    const account = this.accounts.get(accountId);
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    return {
      accountId: accountId,
      balances: account.balances,
      totalUSD: this.calculateTotalUSD(account),
      cryptoWallets: this.getCryptoWallets(accountId)
    };
  }

  /**
   * Calculate total balance in USD
   */
  calculateTotalUSD(account) {
    let totalUSD = account.balances.USD || 0;
    
    // Convert other currencies to USD
    for (const [currency, balance] of Object.entries(account.balances)) {
      if (currency !== 'USD' && balance > 0) {
        const exchangeRate = this.getExchangeRate(currency, 'USD');
        totalUSD += balance * exchangeRate;
      }
    }
    
    // Add crypto balances
    const wallets = this.getCryptoWallets(account.id);
    for (const wallet of wallets) {
      if (wallet.balance > 0) {
        const cryptoPrice = this.getCryptoPrice(wallet.cryptoType, 'USD');
        totalUSD += wallet.balance * cryptoPrice;
      }
    }
    
    return totalUSD;
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(accountId, limit = 50) {
    const transactions = [];
    
    for (const [transactionId, transaction] of this.transactions) {
      if (transaction.accountId === accountId) {
        transactions.push(transaction);
      }
    }
    
    return transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get crypto wallets
   */
  getCryptoWallets(accountId) {
    const wallets = [];
    
    for (const [walletId, wallet] of this.cryptoWallets) {
      if (wallet.accountId === accountId) {
        wallets.push(wallet);
      }
    }
    
    return wallets;
  }

  /**
   * Find crypto wallet
   */
  findCryptoWallet(accountId, cryptoType) {
    for (const [walletId, wallet] of this.cryptoWallets) {
      if (wallet.accountId === accountId && wallet.cryptoType === cryptoType) {
        return wallet;
      }
    }
    return null;
  }

  /**
   * Get exchange rate
   */
  getExchangeRate(fromCurrency, toCurrency) {
    // Simulated exchange rates (in production, use real API)
    const rates = {
      'USD-EUR': 0.92,
      'USD-GBP': 0.79,
      'EUR-USD': 1.09,
      'GBP-USD': 1.27,
      'EUR-GBP': 0.86,
      'GBP-EUR': 1.16
    };
    
    const key = `${fromCurrency}-${toCurrency}`;
    return rates[key] || 1;
  }

  /**
   * Get crypto price
   */
  getCryptoPrice(cryptoType, currency = 'USD') {
    // Simulated crypto prices (in production, use real API)
    const prices = {
      'BTC-USD': 67000,
      'ETH-USD': 3500,
      'SOL-USD': 145,
      'BTC-EUR': 61640,
      'ETH-EUR': 3220,
      'SOL-EUR': 133
    };
    
    const key = `${cryptoType}-${currency}`;
    return prices[key] || 1;
  }

  /**
   * Load exchange rates
   */
  async loadExchangeRates() {
    console.log('📊 Loading exchange rates...');
    // In production, fetch from real API
  }

  /**
   * Load crypto data
   */
  async loadCryptoData() {
    console.log('₿ Loading cryptocurrency data...');
    // In production, fetch from real API
  }

  /**
   * Generate unique IDs
   */
  generateAccountId() {
    return `acct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateWalletId() {
    return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateTransactionId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateCryptoAddress(cryptoType) {
    return `${cryptoType.toLowerCase()}_${Math.random().toString(36).substr(2, 40)}`;
  }

  generatePublicKey() {
    return `pub_${Math.random().toString(36).substr(2, 64)}`;
  }
}

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FinanceCore;
}