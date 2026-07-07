const walletConfig = {
    wallets: {
        bitcoin: {
            address: '$lifeimitatesartinc',
            cashApp: 'https://cash.app/launch/bitcoin/$lifeimitatesartinc/S035CDqqhR',
            note: 'Cash App Bitcoin payment link'
        },
        ethereum: {
            address: 'YOUR_ETH_ADDRESS',  // UPDATE THIS
            note: 'MetaMask or other ETH wallet'
        },
        paypal: {
            address: 'https://www.paypal.biz/harveymiller',
            note: 'PayPal payment link'
        },
        litecoin: {
            address: '324A37mfy4RBLJY9shXYUeoJw1eERHx12n',
            note: 'LTC wallet - FOR NICEHASH PAYOUTS'
        },
    },
    nicehash: {
        enabled: true,
        apiUrl: 'https://api.nicehash.com/api/v2',
        apiKey: 'YOUR_NICEHASH_API_KEY',
        apiSecret: 'YOUR_NICEHASH_API_SECRET',
        organizationId: 'YOUR_ORGANIZATION_ID',
        walletAddress: '324A37mfy4RBLJY9shXYUeoJw1eERHx12n',
    },
    payoutSettings: {
        minimumPayout: { btc: 0.001, eth: 0.01, ltc: 0.1 },
        payoutFrequency: 'daily',
        autoWithdraw: false
    },
};
module.exports = walletConfig;
