const express = require('express');
const cors = require('cors');
const CryptoMiningService = require('./src/services/money-making/cryptoMiningService');
const ProfitTrackingService = require('./src/services/money-making/profitTrackingService');
const RevenueDistributionService = require('./src/services/money-making/revenueDistributionService');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const miningService = new CryptoMiningService();
const profitService = new ProfitTrackingService();
const revenueService = new RevenueDistributionService();

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>GOAT Money Making Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .card { background: rgba(255,255,255,0.95); padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; }
        .stat-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .button { background: #4CAF50; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>GOAT Money Making Dashboard</h1>
            <p>Family Business Revenue Center</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Revenue</h3>
                <div class="stat-value" id="revenue">Loading...</div>
                <p>This Month</p>
            </div>
            <div class="stat-card">
                <h3>Net Profit</h3>
                <div class="stat-value" id="profit">Loading...</div>
                <p>This Month</p>
            </div>
            <div class="stat-card">
                <h3>Mining Balance</h3>
                <div class="stat-value" id="mining">Loading...</div>
                <p>Unpaid BTC</p>
            </div>
        </div>
        
        <div class="card">
            <h3>Crypto Mining Status</h3>
            <div id="miningDetails">Loading...</div>
            <button class="button" onclick="requestPayout()">Cash Out to LTC Wallet</button>
        </div>
        
        <div class="card">
            <h3>Request Payout</h3>
            <input type="text" id="wallet" value="324A37mfy4RBLJY9shXYUeoJw1eERHx12n" placeholder="LTC Wallet" style="width: 100%; padding: 10px; margin-bottom: 10px;">
            <input type="number" id="amount" step="0.001" value="0.001" placeholder="Amount (BTC)" style="width: 100%; padding: 10px; margin-bottom: 10px;">
            <button class="button" onclick="processPayout()">Process Payout</button>
            <p id="payoutResult"></p>
        </div>
        
        <div class="card">
            <h3>💰 Quick Stats</h3>
            <p><strong>LTC Wallet:</strong> 324A37mfy4RBLJY9shXYUeoJw1eERHx12n</p>
            <p><strong>Minimum Payout:</strong> 0.001 BTC</p>
            <p><strong>Processing Time:</strong> 30-60 minutes</p>
            <p><strong>Network Fee:</strong> 0.0001 BTC</p>
        </div>
    </div>
    
    <script>
        async function loadDashboard() {
            try {
                const response = await fetch('/dashboard');
                const result = await response.json();
                if(result.success) {
                    const data = result.data;
                    document.getElementById('revenue').textContent = '$' + data.profits.revenue.toLocaleString();
                    document.getElementById('profit').textContent = '$' + data.profits.profit.toLocaleString();
                    document.getElementById('mining').textContent = data.mining.unpaidBalance + ' BTC';
                    const hashRate = data.mining.rigs.reduce((sum, r) => sum + r.hashRate, 0);
                    const dailyProfit = data.mining.profitability.currentDay;
                    const dailyUSD = (dailyProfit * 41700).toFixed(2);
                    document.getElementById('miningDetails').innerHTML = \`
                        <p><strong>Hash Rate:</strong> \${hashRate.toFixed(1)} MH/s</p>
                        <p><strong>Today's Profit:</strong> \${dailyProfit} BTC (~$\${dailyUSD})</p>
                        <p><strong>Rigs Online:</strong> \${data.mining.rigs.length}x RTX 3090</p>
                    \`;
                }
            } catch(error) {
                console.error('Error:', error);
                document.getElementById('miningDetails').innerHTML = '<p>Error loading data. Please refresh.</p>';
            }
        }
        
        async function processPayout() {
            const wallet = document.getElementById('wallet').value;
            const amount = parseFloat(document.getElementById('amount').value);
            try {
                const response = await fetch('/payout', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({wallet, amount})
                });
                const result = await response.json();
                if(result.success) {
                    document.getElementById('payoutResult').innerHTML = '<p style="color: green;">Success! TX: ' + result.data.txHash + '</p>';
                } else {
                    document.getElementById('payoutResult').innerHTML = '<p style="color: red;">Error: ' + result.error + '</p>';
                }
            } catch(error) {
                document.getElementById('payoutResult').innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
            }
        }
        
        async function requestPayout() {
            const wallet = document.getElementById('wallet').value;
            const amount = 0.0085; // Your current balance
            try {
                const response = await fetch('/payout', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({wallet, amount})
                });
                const result = await response.json();
                if(result.success) {
                    document.getElementById('payoutResult').innerHTML = '<p style="color: green;">Success! TX: ' + result.data.txHash + '</p>';
                } else {
                    document.getElementById('payoutResult').innerHTML = '<p style="color: red;">Error: ' + result.error + '</p>';
                }
            } catch(error) {
                document.getElementById('payoutResult').innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
            }
        }
        
        loadDashboard();
        setInterval(loadDashboard, 30000);
    </script>
</body>
</html>
  `);
});

app.get('/dashboard', async (req, res) => {
  try {
    const [miningStats, currentProfit] = await Promise.all([
      miningService.getMiningStats(),
      profitService.getCurrentProfit()
    ]);
    res.json({ success: true, data: { mining: miningStats, profits: currentProfit } });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/payout', async (req, res) => {
  try {
    const { amount, walletAddress } = req.body;
    const payout = await miningService.requestPayout(amount, walletAddress);
    res.json({ success: true, data: payout });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log('🚀 GOAT Money Making Dashboard running at http://localhost:' + PORT);
});
