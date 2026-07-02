# 🚀 REAL MINING SETUP - COMPLETE GUIDE

## 📋 Overview

Your GOAT Royalty App now has **REAL CRYPTO MINING INTEGRATION** with NiceHash API! This guide will help you configure it to display live data from your actual mining operations.

## 🎯 What This Does

✅ **Live Mining Data**: Displays real-time hash rates, profits, and worker status  
✅ **Auto-Refresh**: Updates every 30 seconds automatically  
✅ **Smart Fallback**: Falls back to simulated data if API is unreachable  
✅ **Complete Dashboard**: Balance, workers, hash rates, payouts, profitability  
✅ **Connection Status**: Shows live API connection status  

## 🔧 Prerequisites

Before you start, you need:

1. **NiceHash Account** - Create at https://www.nicehash.com
2. **Mining Rig(s)** - Running NiceHash QuickMiner or similar software
3. **API Keys** - Get from your NiceHash account settings
4. **LTC Wallet Address** - For NiceHash payouts (you have one already!)

## 📝 Step-by-Step Configuration

### Step 1: Get Your NiceHash API Keys

1. Log in to https://www.nicehash.com
2. Go to **Settings** → **API Keys**
3. Click **Generate New API Key**
4. Enter a name (e.g., "GOAT Royalty App")
5. **IMPORTANT**: Copy and save these values:
   - **API Key** (starts with "3c" or similar)
   - **API Secret** (long hex string)
   - **Organization ID** (your NiceHash ID)
6. Set permissions to at minimum:
   - **Read** access for:
     - Wallet
     - Mining
     - Organization

### Step 2: Configure API Credentials

Edit this file:
```
/web-app/lib/mining/wallet-config.js
```

Find the `nicehash` section and update these values:

```javascript
nicehash: {
    enabled: true,
    apiUrl: 'https://api.nicehash.com/api/v2',
    apiKey: 'YOUR_NICEHASH_API_KEY_HERE',        // ← Paste your API Key here
    apiSecret: 'YOUR_NICEHASH_API_SECRET_HERE',  // ← Paste your API Secret here
    organizationId: 'YOUR_ORGANIZATION_ID_HERE', // ← Paste your Org ID here
    walletAddress: '324A37mfy4RBLJY9shXYUeoJw1eERHx12n',
},
```

**Your values should look like:**
```javascript
nicehash: {
    enabled: true,
    apiUrl: 'https://api.nicehash.com/api/v2',
    apiKey: '3c8a7f3d-9b4e-4c2d-8a1f-3e5d6c7b8a9e',
    apiSecret: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6',
    organizationId: '64a1b2c3-d4e5-f6g7-h8i9-j0k1l2m3n4o5',
    walletAddress: '324A37mfy4RBLJY9shXYUeoJw1eERHx12n',
},
```

### Step 3: Verify Your LTC Wallet Address

Your app already has this configured:
```
LTC Address: 324A37mfy4RBLJY9shXYUeoJw1eERHx12n
```

**Important**: This must be set in NiceHash as your payout wallet!

1. In NiceHash, go to **Wallet** → **Addresses**
2. Add this LTC address if not already present
3. Set it as your **primary payout address**

### Step 4: Start Mining (If Not Already)

If you don't have mining rigs running yet:

**Option A: NiceHash QuickMiner (Easiest - Windows)**
1. Download from https://www.nicehash.com/quickminer
2. Install and run
3. Connect your NiceHash account
4. Select "GPU mining" or "CPU mining"
5. Click **Start Mining**

**Option B: NiceHash Miner (Linux/Mac)**
1. Download from https://www.nicehash.com/miner
2. Extract and run
3. Connect your NiceHash account
4. Configure your mining devices
5. Start mining

**Option C: Use Your Existing Rigs**
1. Install NiceHash QuickMiner on your existing rigs
2. Connect to your NiceHash account
3. Configure stratum settings
4. Point to NiceHash pools

### Step 5: Restart Your App Server

After configuration:

```bash
# Navigate to your app directory
cd /workspace/nextjs-commerce

# Restart the server
npm start
```

Or if using PM2:
```bash
pm2 restart goat-royalty-app
```

### Step 6: Open the Mining Page

1. Open your browser
2. Navigate to: `http://localhost:3000/crypto-mining.html`
3. Look for the **Connection Status** indicator
4. **Green = Connected to NiceHash API** ✓
5. **Yellow = Using simulated data** (API not configured)

## 📊 What You'll See Once Connected

### Dashboard Displays:
- **BTC Balance**: Real-time wallet balance
- **Hash Rates**: Current mining speed by device
- **Workers**: Status of all mining rigs
- **Profits**: Daily profitability data
- **Payouts**: History of payments received
- **Temperature**: Worker temperatures
- **Power Usage**: Energy consumption data

### Auto-Refresh:
- Updates every **30 seconds** automatically
- Connection status indicator in top-right corner
- Smooth transitions when data updates

## 🔄 Testing Your Configuration

### Test 1: Check API Connection

Open browser console (F12) and look for:
```
✓ Real Mining Dashboard initialized
✓ API Connection: Connected
```

### Test 2: Verify Data Updates

1. Watch the hash rate values
2. Wait 30 seconds
3. Values should update automatically
4. Balance should reflect recent mining

### Test 3: Check Fallback Mode

If you see:
```
⚠ API Connection: Using simulated data
```

This means:
- API credentials not configured OR
- No internet connection OR
- NiceHash API is down

The app will work with simulated data until you fix the connection.

## 🛠️ Troubleshooting

### Problem: "Using simulated data" message

**Solutions:**
1. Check API credentials are correct in `wallet-config.js`
2. Verify you copied the entire API Secret (it's long!)
3. Check your internet connection
4. Verify NiceHash API is operational at https://status.nicehash.com
5. Try regenerating API keys in NiceHash

### Problem: No worker data showing

**Solutions:**
1. Make sure mining rigs are actually running
2. Check rigs are connected to your NiceHash account
3. Wait 5-10 minutes after starting mining for data to appear
4. Check NiceHash website directly to see if workers show there

### Problem: Hash rate is 0

**Solutions:**
1. Check mining software is running
2. Verify GPU/CPU is detected
3. Check for mining errors in NiceHash QuickMiner
4. Try different mining algorithm

### Problem: Balance showing 0

**Solutions:**
1. Balance updates periodically (not real-time)
2. Wait for first payout cycle (usually daily)
3. Verify payout address is correct
4. Minimum payout threshold applies (check NiceHash settings)

## 🚀 Advanced Configuration

### Change Refresh Interval

Edit `/web-app/js/real-mining-dashboard.js`:

```javascript
this.refreshInterval = 30000;  // 30 seconds = 30000ms
// Change to 60000 for 1 minute, 15000 for 15 seconds
```

### Customize Connection Timeouts

Edit `/src/routes/services/mining/nicehash-api-integration.js`:

```javascript
const TIMEOUT = 10000;  // 10 seconds
// Increase if API is slow
```

### Add Multiple Mining Accounts

Modify `nicehash-api-integration.js` to support multiple accounts:

```javascript
const config = {
    primary: {
        apiKey: '...',
        apiSecret: '...',
        organizationId: '...'
    },
    secondary: {
        apiKey: '...',
        apiSecret: '...',
        organizationId: '...'
    }
};
```

## 📱 Mobile Access

To view your mining data on mobile:

1. **Deploy to Server** (see deployment guide)
2. Access from mobile: `https://your-server.com/crypto-mining.html`
3. Mobile-optimized dashboard displays correctly

## 🔒 Security Best Practices

✅ **NEVER** share your API Secret publicly  
✅ **NEVER** commit API keys to Git repositories  
✅ **ALWAYS** use Read-only permissions when possible  
✅ **ROTATE** API keys regularly (every 90 days recommended)  
✅ **MONITOR** NiceHash account for unusual activity  
✅ **LIMIT** API access to specific IP addresses if possible  
✅ **USE** environment variables for production deployments  

## 📞 Getting Help

If you need assistance:

1. **NiceHash Documentation**: https://www.nicehash.com/support
2. **NiceHash API Docs**: https://www.nicehash.com/docs/api
3. **Community Forum**: https://www.nicehash.com/forum

## 🎉 You're All Set!

Once configured, your GOAT Royalty App will display:
- ✓ Real-time mining data from your NiceHash rigs
- ✓ Automatic data refresh every 30 seconds
- ✓ Complete mining dashboard with all metrics
- ✓ Connection status monitoring
- ✓ Fallback to simulated data if needed

**Happy Mining! 🚀💰**

---

## 📚 Additional Resources

- **NiceHash QuickMiner Guide**: https://www.nicehash.com/blog/quickminer-guide
- **Mining Profit Calculator**: https://www.nicehash.com/profitability-calculator
- **Mining Hardware Comparison**: https://www.nicehash.com/profitability-calculator

---

**Last Updated**: 2024-12-22
**System Version**: v2.1.0
**Integration**: NiceHash API v2.0