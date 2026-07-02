/**
 * WALLET CONFIGURATION EXAMPLE
 * 
 * COPY THIS FILE TO: web-app/lib/mining/wallet-config.js
 * UPDATE THE VALUES BELOW WITH YOUR ACTUAL CREDENTIALS
 */

module.exports = {
    // ============================================================
    // WALLET ADDRESSES (Public - Safe to share)
    // ============================================================
    wallets: {
        bitcoin: {
            address: '$lifeimitatesartinc',
            cashApp: 'https://cash.app/launch/bitcoin/$lifeimitatesartinc/S035CDqqhR',
            note: 'Bitcoin Cash App payment link'
        },
        ethereum: {
            address: 'YOUR_ETH_ADDRESS_HERE',  // ⚠️ UPDATE THIS
            note: 'MetaMask or other ETH wallet address'
        },
        litecoin: {
            address: '324A37mfy4RBLJY9shXYUeoJw1eERHx12n',
            note: 'LTC wallet - FOR NICEHASH PAYOUTS - DO NOT CHANGE'
        },
    },

    // ============================================================
    // NICEHASH API CONFIGURATION
    // ⚠️ KEEP THESE VALUES SECRET - NEVER SHARE PUBLICLY
    // ============================================================
    nicehash: {
        enabled: true,  // Set to false to use simulated data only
        
        // NiceHash API URL (Don't change)
        apiUrl: 'https://api.nicehash.com/api/v2',
        
        // ⚠️ UPDATE THESE THREE VALUES:
        apiKey: 'YOUR_NICEHASH_API_KEY_HERE',          // ← PASTE YOUR API KEY
        apiSecret: 'YOUR_NICEHASH_API_SECRET_HERE',    // ← PASTE YOUR API SECRET (LONG HEX STRING)
        organizationId: 'YOUR_ORGANIZATION_ID_HERE',   // ← PASTE YOUR ORG ID
        
        // This is already configured - your NiceHash payout address
        walletAddress: '324A37mfy4RBLJY9shXYUeoJw1eERHx12n',
        
        // Mining settings
        mining: {
            algorithm: 'autodetect',  // auto, sha256, scrypt, x11, etc.
            gpuMining: true,
            cpuMining: false,
        },
        
        // API request settings
        timeout: 10000,  // 10 seconds
        retryAttempts: 3,
        retryDelay: 2000,  // 2 seconds
    },

    // ============================================================
    // OTHER CRYPTO WALLETS (Optional)
    // ============================================================
    crypto: {
        ripple: {
            address: 'YOUR_XRP_ADDRESS_HERE',
            note: 'XRP/Ripple wallet address'
        },
        monero: {
            address: 'YOUR_XMR_ADDRESS_HERE',
            note: 'XMR/Monero wallet address'
        },
        dogecoin: {
            address: 'YOUR_DOGE_ADDRESS_HERE',
            note: 'DOGE/Dogecoin wallet address'
        },
    },

    // ============================================================
    // PAYMENT PROCESSORS (Optional)
    // ============================================================
    payments: {
        paypal: {
            email: 'harveymiller@paypal.biz',
            enabled: true
        },
        stripe: {
            publicKey: 'YOUR_STRIPE_PUBLIC_KEY_HERE',
            secretKey: 'YOUR_STRIPE_SECRET_KEY_HERE',
            enabled: false
        },
        square: {
            applicationId: 'YOUR_SQUARE_APP_ID_HERE',
            accessToken: 'YOUR_SQUARE_ACCESS_TOKEN_HERE',
            enabled: false
        }
    },

    // ============================================================
    // MINING POOLS (Optional - if not using NiceHash)
    // ============================================================
    miningPools: {
        f2pool: {
            enabled: false,
            stratumUrl: 'stratum+tcp://btc.f2pool.com:3333',
            worker: 'YOUR_F2POOL_WORKER',
            password: 'YOUR_F2POOL_PASSWORD'
        },
        poolin: {
            enabled: false,
            stratumUrl: 'stratum+tcp://btc.poolin.com:443',
            worker: 'YOUR_POOLIN_WORKER',
            password: 'YOUR_POOLIN_PASSWORD'
        }
    }
};

// ============================================================
// VALIDATION HELPER (Run to check your configuration)
// ============================================================
function validateConfig(config) {
    const errors = [];
    const warnings = [];
    
    // Check NiceHash configuration
    if (config.nicehash.enabled) {
        if (config.nicehash.apiKey === 'YOUR_NICEHASH_API_KEY_HERE') {
            errors.push('❌ NiceHash API Key not configured');
        }
        if (config.nicehash.apiSecret === 'YOUR_NICEHASH_API_SECRET_HERE') {
            errors.push('❌ NiceHash API Secret not configured');
        }
        if (config.nicehash.organizationId === 'YOUR_ORGANIZATION_ID_HERE') {
            errors.push('❌ NiceHash Organization ID not configured');
        }
        
        if (errors.length === 0) {
            console.log('✅ NiceHash API credentials appear to be configured');
        }
    } else {
        warnings.push('⚠️  NiceHash API is disabled - using simulated data only');
    }
    
    // Check wallet addresses
    ['bitcoin', 'ethereum', 'litecoin'].forEach(coin => {
        if (config.wallets[coin] && config.wallets[coin].address.includes('YOUR_')) {
            warnings.push(`⚠️  ${coin.toUpperCase()} wallet address not configured`);
        }
    });
    
    // Display results
    console.log('\n=== CONFIGURATION VALIDATION ===\n');
    
    if (errors.length > 0) {
        console.log('ERRORS (Must Fix):');
        errors.forEach(err => console.log(err));
    }
    
    if (warnings.length > 0) {
        console.log('\nWARNINGS (Optional):');
        warnings.forEach(warn => console.log(warn));
    }
    
    if (errors.length === 0 && warnings.length === 0) {
        console.log('✅ All configuration values are properly set!');
    }
    
    console.log('\n================================\n');
    
    return { errors, warnings };
}

// Run validation if this file is executed directly
if (require.main === module) {
    const fs = require('fs');
    const path = require('path');
    
    try {
        // Read the actual wallet-config.js file
        const configPath = path.join(__dirname, 'web-app', 'lib', 'mining', 'wallet-config.js');
        const config = require(configPath);
        validateConfig(config);
    } catch (error) {
        console.log('Configuration file not found. Please copy this file to:');
        console.log('web-app/lib/mining/wallet-config.js');
    }
}

module.exports.validate = validateConfig;