/**
 * SUPER GOAT ROYALTIES - Wallet Configuration
 * Configure your cryptocurrency wallet addresses for mining payouts
 * 
 * IMPORTANT: Edit this file to add your own wallet addresses
 */

const walletConfig = {
    // Your wallet addresses for mining payouts
    wallets: {
        bitcoin: {
            address: '', // Add your Bitcoin address here
            cashApp: '$lifeimitatesartinc',
            note: 'Cash App Bitcoin wallet - update with actual BTC address'
        },
        ethereum: {
            address: '', // Add your Ethereum address here
            note: 'MetaMask or other ETH wallet'
        },
        ripple: {
            address: '', // Add your XRP wallet address (r-address)
            destinationTag: '', // Optional destination tag for exchanges
            note: 'XRP Ledger wallet - supports r-addresses (e.g., rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn)'
        },
        monero: {
            address: '', // Add your Monero address here
            note: 'XMR wallet for privacy coins'
        },
        litecoin: {
            address: '', // Add your Litecoin address here
            note: 'LTC wallet'
        },
        dogecoin: {
            address: '', // Add your Dogecoin address here
            note: 'DOGE wallet'
        }
    },
    
    // Mining pool payout settings
    payoutSettings: {
        minimumPayout: {
            btc: 0.001,   // 0.001 BTC minimum
            eth: 0.01,    // 0.01 ETH minimum
            xrp: 20,      // 20 XRP minimum (XRP has low fees)
            xmr: 0.1,     // 0.1 XMR minimum
            ltc: 0.1,     // 0.1 LTC minimum
            doge: 100     // 100 DOGE minimum
        },
        payoutFrequency: 'daily', // daily, weekly, threshold
        autoWithdraw: false
    },
    
    // Default wallet for each coin
    getDefaultWallet(coin) {
        const coinLower = coin.toLowerCase();
        const wallet = this.wallets[coinLower];
        return wallet?.address || null;
    },
    
    // Check if wallet is configured for a coin
    isWalletConfigured(coin) {
        const wallet = this.wallets[coin.toLowerCase()];
        return wallet && wallet.address && wallet.address.length > 0;
    },
    
    // Get all configured wallets
    getConfiguredWallets() {
        return Object.entries(this.wallets)
            .filter(([_, data]) => data.address && data.address.length > 0)
            .map(([coin, data]) => ({ coin, address: data.address }));
    }
};

module.exports = walletConfig;