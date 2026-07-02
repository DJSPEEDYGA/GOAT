# 🎯 Pool Mining Setup Guide
## REAL Crypto Mining - NO API Keys Required!

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Understanding the Dashboard](#understanding-the-dashboard)
6. [Connecting Your Mining Rigs](#connecting-your-mining-rigs)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Configuration](#advanced-configuration)

---

## 🎯 Overview

This guide will help you set up **REAL cryptocurrency mining** using the GOAT Royalty app's pool monitoring system. Unlike traditional mining platforms that require API keys and account registration, our system works directly with mining pools using only your **wallet address**.

### Supported Mining Pools:
- **F2Pool** - One of the largest mining pools globally
- **ViaBTC** - Professional mining service
- **Poolin** - Multi-currency mining pool
- **ZergPool** - Auto-switching profit pool

### Key Features:
✅ **NO API Keys Required** - Works with just your wallet address
✅ **Real-time Data** - Live hash rates, workers, and balances
✅ **Multi-Pool Support** - Monitor all your pools in one dashboard
✅ **Auto-Refresh** - Data updates every 30 seconds
✅ **Fallback System** - Graceful degradation if pools are down

---

## 📦 Prerequisites

### What You Need:
1. **GOAT Royalty App** - Installed and running
2. **Cryptocurrency Wallet** - For receiving mining rewards
3. **Mining Hardware** - GPU, ASIC, or mining rig (optional for testing)
4. **Mining Software** - NiceHash, CGMiner, BFGMiner, etc.

### Wallet Addresses:
- **Litecoin Wallet**: LTC address starting with 'L' or 'M' or '3'
- **Bitcoin Wallet**: BTC address or NiceHash username (starts with $)

### Example Wallets:
```
LTC Wallet: 324A37mfy4RBLJY9shXYUeoJw1eERHx12n
BTC Wallet: $lifeimitatesartinc
```

---

## 🚀 Quick Start

### Step 1: Install Required Dependencies

```bash
cd nextjs-commerce/api-server
npm install axios cheerio
```

### Step 2: Start the API Server

```bash
cd nextjs-commerce/api-server
node server.js
```

The server will start on `http://localhost:3000`

### Step 3: Access the Mining Dashboard

Open your browser and navigate to:
```
http://localhost:3000/crypto-mining.html
```

### Step 4: Configure Your Wallet

1. Scroll down to the **"REAL Pool Monitoring"** section
2. Enter your wallet addresses in the configuration form
3. Click **"Update Wallets"** button
4. The dashboard will automatically load your mining data

---

## ⚙️ Configuration

### Wallet Configuration

The pool monitoring system uses your wallet address to fetch mining data from pools.

**Default Configuration:**
```javascript
{
  ltc: '324A37mfy4RBLJY9shXYUeoJw1eERHx12n',
  btc: '$lifeimitatesartinc'
}
```

**To Update Wallets:**

1. **Via Dashboard UI:**
   - Go to the Pool Monitoring section
   - Enter your wallet addresses in the form
   - Click "Update Wallets"

2. **Via API:**
   ```bash
   curl -X POST http://localhost:3000/api/pool/wallets \
     -H "Content-Type: application/json" \
     -d '{
       "ltc": "your_ltc_wallet_address",
       "btc": "$your_btc_username_or_address"
     }'
   ```

3. **Via Configuration File:**
   Edit `src/routes/services/mining/pool-monitor-client.js`:
   ```javascript
   constructor(config = {}) {
       this.walletAddresses = config.walletAddresses || {
           ltc: 'your_ltc_wallet_address',
           btc: '$your_btc_username'
       };
   }
   ```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pool/dashboard` | GET | Complete dashboard data from all pools |
| `/api/pool/f2pool` | GET | F2Pool specific stats |
| `/api/pool/viabtc` | GET | ViaBTC specific stats |
| `/api/pool/poolin` | GET | Poolin specific stats |
| `/api/pool/zergpool` | GET | ZergPool specific stats |
| `/api/pool/wallets` | GET | Get current wallet addresses |
| `/api/pool/wallets` | POST | Update wallet addresses |
| `/api/pool/coins` | GET | Get supported coins |

### Query Parameters

All GET endpoints support these parameters:
- `coin` - Coin to monitor (ltc, btc, eth, doge) - Default: ltc
- `refresh` - Force refresh (true/false) - Default: false

**Example:**
```bash
curl "http://localhost:3000/api/pool/dashboard?coin=ltc&refresh=true"
```

---

## 📊 Understanding the Dashboard

### Data Source Indicator

Located at the top right of the pool monitoring section:

- **🟢 LIVE DATA** - Real data fetched from mining pools
- **🟡 SIMULATED DATA** - Fallback data when pools are unavailable

### Summary Cards

1. **Total Hash Rate**
   - Combined hash rate from all active pools
   - Displayed in MH/s, GH/s, or TH/s
   - Updates in real-time

2. **Active Workers**
   - Number of mining workers currently online
   - Across all pools

3. **Total Balance**
   - Accumulated mining rewards across all pools
   - Displayed in selected coin (LTC, BTC, etc.)

4. **Total Shares**
   - Total shares submitted to pools
   - Indicates mining activity

### Pool Cards

Each pool card shows:
- **Pool Name** - F2Pool, ViaBTC, Poolin, ZergPool
- **Status** - Online (green) or Offline (red)
- **Hash Rate** - Current mining speed
- **Workers** - Number of active workers
- **Balance** - Unpaid mining rewards
- **24h Shares** - Shares submitted in last 24 hours

### Charts

1. **Hash Rate History (24h)**
   - Line chart showing hash rate over time
   - Helps identify mining trends

2. **Pool Distribution**
   - Doughnut chart showing hash rate distribution
   - Visual representation of pool usage

---

## 🔌 Connecting Your Mining Rigs

### Option 1: NiceHash (Beginner Friendly)

1. **Download NiceHash Miner:**
   - Visit: https://www.nicehash.com
   - Download NiceHash Miner

2. **Configure NiceHash:**
   - Create NiceHash account
   - Get your wallet address
   - Start mining (NiceHash auto-switches pools)

3. **Monitor in GOAT App:**
   - Configure your NiceHash wallet in the dashboard
   - NiceHash automatically connects to multiple pools
   - View all your mining data in one place

### Option 2: Direct Pool Mining (Advanced)

#### Connecting to F2Pool

**Stratum URL:**
```
stratum+tcp://ltc.f2pool.com:8888
```

**Mining Command (CGMiner):**
```bash
cgminer -o stratum+tcp://ltc.f2pool.com:8888 -u YOUR_WALLET_ADDRESS -p x
```

**Mining Command (BFGMiner):**
```bash
bfgminer -o stratum+tcp://ltc.f2pool.com:8888 -u YOUR_WALLET_ADDRESS -p x
```

#### Connecting to ViaBTC

**Stratum URL:**
```
stratum+tcp://ltc.viabtc.com:3333
```

**Mining Command:**
```bash
cgminer -o stratum+tcp://ltc.viabtc.com:3333 -u YOUR_WALLET_ADDRESS -p x
```

#### Connecting to Poolin

**Stratum URL:**
```
stratum+tcp://ltc.poolin.com:443
```

**Mining Command:**
```bash
cgminer -o stratum+tcp://ltc.poolin.com:443 -u YOUR_WALLET_ADDRESS.WORKER_NAME -p x
```

#### Connecting to ZergPool

**Stratum URL:**
```
stratum+tcp://litecoin.mine.zergpool.com:3333
```

**Mining Command:**
```bash
cgminer -o stratum+tcp://litecoin.mine.zergpool.com:3333 -u YOUR_WALLET_ADDRESS -p c=LTC
```

### Mining Software Examples

**NiceHash:** (Easiest - auto-switching)
```
Download from nicehash.com, enter wallet, start mining
```

**CGMiner:** (Advanced)
```bash
cgminer -o POOL_URL -u WALLET_ADDRESS -p PASSWORD
```

**BFGMiner:** (Advanced - FPGA/ASIC)
```bash
bfgminer -o POOL_URL -u WALLET_ADDRESS -p PASSWORD
```

**CudoMiner:** (User-friendly)
```
Download from cudominer.com, configure wallet, start
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Dashboard Shows "Simulated Data"

**Problem:** All data is marked as simulated instead of live.

**Solutions:**
- Check your internet connection
- Verify wallet address is correct
- Pool APIs may be temporarily down
- Wait for next auto-refresh (30 seconds)

**Test API manually:**
```bash
curl http://localhost:3000/api/pool/dashboard?coin=ltc
```

#### 2. Pool Shows "Offline"

**Problem:** A pool card shows as offline with 0 hash rate.

**Solutions:**
- Check if you're actually mining to that pool
- Verify pool URL and wallet address
- Pool server may be temporarily down
- Try refreshing the dashboard

**View pool status directly:**
- F2Pool: https://f2pool.com/litecoin/YOUR_WALLET
- ViaBTC: Check ViaBTC website
- Poolin: Check Poolin website
- ZergPool: Check ZergPool website

#### 3. Hash Rate Shows 0

**Problem:** Hash rate displays as 0.00 MH/s.

**Solutions:**
- Ensure your mining rigs are actively mining
- Verify you're mining to the configured wallet address
- Check mining software logs for errors
- May take time for pool to update stats

#### 4. Balance Shows 0

**Problem:** Mining balance shows as 0.

**Solutions:**
- Mining rewards accumulate over time
- Check pool's minimum payout threshold
- Verify payout address configuration
- Some pools have payout delays

#### 5. API Server Won't Start

**Problem:** Server fails to start or shows errors.

**Solutions:**
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process on port 3000
kill -9 <PID>

# Install missing dependencies
cd nextjs-commerce/api-server
npm install

# Start server with debug output
DEBUG=* node server.js
```

#### 6. Wallet Address Not Accepted

**Problem:** Wallet address validation fails.

**Solutions:**
- Verify address format for the coin
- LTC addresses start with L, M, or 3
- BTC addresses can be various formats
- NiceHash usernames start with $

### Debug Mode

Enable verbose logging:

```javascript
// In pool-monitor-client.js
const poolMonitor = new PoolMonitorClient({
    debug: true,
    walletAddresses: {
        ltc: 'your_wallet'
    }
});
```

### Testing Individual Pools

Test each pool separately:

```bash
# Test F2Pool
curl http://localhost:3000/api/pool/f2pool?coin=ltc

# Test ViaBTC
curl http://localhost:3000/api/pool/viabtc?coin=ltc

# Test Poolin
curl http://localhost:3000/api/pool/poolin?coin=ltc

# Test ZergPool
curl http://localhost:3000/api/pool/zergpool?coin=ltc
```

---

## 🎛️ Advanced Configuration

### Custom Pool URLs

Edit pool URLs in `pool-monitor-client.js`:

```javascript
const poolUrls = {
    f2pool: {
        api: 'https://api.f2pool.com/{coin}/{wallet}',
        web: 'https://f2pool.com/{coin}/{wallet}'
    },
    // Add custom URLs here
};
```

### Cache Configuration

Adjust cache duration:

```javascript
const poolMonitor = new PoolMonitorClient({
    cacheDuration: 30000, // 30 seconds (default: 60000)
});
```

### Retry Configuration

Adjust retry attempts and timeout:

```javascript
const poolMonitor = new PoolMonitorClient({
    timeout: 15000, // 15 seconds (default: 10000)
    retryAttempts: 5, // 5 attempts (default: 3)
});
```

### Adding Custom Coins

Add support for additional coins:

```javascript
const coinMapping = {
    ltc: 'ltc',
    btc: 'btc',
    eth: 'eth',
    doge: 'doge',
    // Add new coins here
    rvn: 'rvn' // Example: Ravencoin
};
```

### Web Scraping Configuration

Configure web scraping behavior:

```javascript
const poolMonitor = new PoolMonitorClient({
    enableWebScraping: true, // Enable/disable (default: true)
    scrapeTimeout: 5000, // 5 seconds (default: 3000)
});
```

---

## 📈 Performance Tips

1. **Optimize Refresh Rate:**
   - Default: 30 seconds
   - Reduce for more frequent updates (may increase load)
   - Increase to reduce API calls

2. **Caching:**
   - Default cache: 60 seconds
   - Reduce for fresher data
   - Increase to reduce API calls

3. **Multiple Workers:**
   - Each mining rig counts as a worker
   - Monitor individual worker performance
   - Combine hash rates for total output

4. **Pool Selection:**
   - Choose pools with low latency
   - Consider pool fees
   - Check minimum payouts
   - Review pool reputation

---

## 🔒 Security Best Practices

1. **Never Share Private Keys**
   - Only share public wallet addresses
   - Keep private keys secure

2. **Use Official Pool URLs**
   - Only connect to official pool URLs
   - Verify pool website before mining

3. **Regular Payouts**
   - Don't let large balances accumulate
   - Withdraw regularly to your private wallet

4. **Monitor Activity**
   - Regularly check your dashboard
   - Verify mining rewards
   - Watch for unusual activity

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Test API endpoints manually
3. Check mining software logs
4. Verify pool status on their websites
5. Review server logs for errors

### Getting Help

- **Dashboard Issues:** Check browser console (F12)
- **API Issues:** Check server terminal output
- **Mining Issues:** Check mining software logs
- **Pool Issues:** Visit pool websites directly

---

## 🎉 Conclusion

You now have a complete pool mining monitoring system!
- Real-time data from multiple pools
- No API keys required
- Easy setup and configuration
- Comprehensive monitoring dashboard

**Start mining and watch your earnings grow!** 💰

---

**Last Updated:** 2025
**Version:** 1.0.0
**GOAT Royalty Pool Mining System**