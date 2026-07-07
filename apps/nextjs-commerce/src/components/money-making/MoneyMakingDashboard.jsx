/**
 * Money Making Dashboard - Family Business Revenue Center
 * Complete dashboard for monitoring and managing all revenue streams
 */

import React, { useState, useEffect } from 'react';

const MoneyMakingDashboard = () => {
  const [currentProfit, setCurrentProfit] = useState(null);
  const [miningStats, setMiningStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // In production, these would be real API calls
      setCurrentProfit({
        revenue: 8500,
        expenses: 575,
        profit: 7925,
        margin: '93.2%',
        projectedAnnual: 95100
      });
      
      setMiningStats({
        unpaidBalance: 0.0085,
        totalEarned: 2.847,
        currentHashRate: 241.3,
        todayProfit: 0.018,
        rigs: 2
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <h1 className="text-3xl font-bold">💰 GOAT Money Making Dashboard</h1>
        <p className="text-blue-100 mt-2">Family Business Revenue Center</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-700">
        {['overview', 'mining', 'payments', 'revenue', 'profits'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium ${
              activeTab === tab 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && <OverviewTab currentProfit={currentProfit} miningStats={miningStats} />}
        {activeTab === 'mining' && <MiningTab miningStats={miningStats} />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'revenue' && <RevenueTab />}
        {activeTab === 'profits' && <ProfitsTab currentProfit={currentProfit} />}
      </div>
    </div>
  );
};

const OverviewTab = ({ currentProfit, miningStats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Revenue Cards */}
    <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-green-100">Total Revenue</h3>
      <p className="text-4xl font-bold mt-2">${currentProfit?.revenue.toLocaleString()}</p>
      <p className="text-green-200 mt-2">▲ 12.5% from last month</p>
    </div>

    <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-100">Net Profit</h3>
      <p className="text-4xl font-bold mt-2">${currentProfit?.profit.toLocaleString()}</p>
      <p className="text-blue-200 mt-2">Margin: {currentProfit?.margin}</p>
    </div>

    <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-purple-100">Mining Balance</h3>
      <p className="text-4xl font-bold mt-2">{miningStats?.unpaidBalance} BTC</p>
      <p className="text-purple-200 mt-2">≈ ${(miningStats?.unpaidBalance * 41700).toFixed(2)} USD</p>
    </div>

    {/* Quick Actions */}
    <div className="col-span-3 bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg text-center">
          <div className="text-2xl mb-2">💸</div>
          <div>Request Payout</div>
        </button>
        <button className="bg-green-600 hover:bg-green-700 p-4 rounded-lg text-center">
          <div className="text-2xl mb-2">📊</div>
          <div>View Reports</div>
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg text-center">
          <div className="text-2xl mb-2">👥</div>
          <div>Revenue Split</div>
        </button>
        <button className="bg-orange-600 hover:bg-orange-700 p-4 rounded-lg text-center">
          <div className="text-2xl mb-2">⚙️</div>
          <div>Settings</div>
        </button>
      </div>
    </div>
  </div>
);

const MiningTab = ({ miningStats }) => (
  <div className="space-y-6">
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">⛏️ Crypto Mining Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400">Unpaid Balance</p>
          <p className="text-2xl font-bold text-yellow-400">{miningStats?.unpaidBalance} BTC</p>
          <p className="text-sm text-gray-400 mt-1">≈ ${(miningStats?.unpaidBalance * 41700).toFixed(2)} USD</p>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400">Current Hashrate</p>
          <p className="text-2xl font-bold text-green-400">{miningStats?.currentHashRate} MH/s</p>
          <p className="text-sm text-gray-400 mt-1">{miningStats?.rigs}x RTX 3090</p>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400">Today's Profit</p>
          <p className="text-2xl font-bold text-blue-400">{miningStats?.todayProfit} BTC</p>
          <p className="text-sm text-gray-400 mt-1">≈ ${(miningStats?.todayProfit * 41700).toFixed(2)} USD</p>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">💵 Request Payout to LTC Wallet</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2">Wallet Address</label>
          <input 
            type="text" 
            defaultValue="324A37mfy4RBLJY9shXYUeoJw1eERHx12n"
            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-2">Amount (BTC)</label>
          <input 
            type="number" 
            step="0.001"
            placeholder="0.001"
            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white"
          />
        </div>
        <button className="w-full bg-green-600 hover:bg-green-700 p-4 rounded-lg font-semibold">
          💸 Cash Out to LTC Wallet
        </button>
        <p className="text-sm text-gray-400">Minimum payout: 0.001 BTC | Delivery: 30-60 minutes</p>
      </div>
    </div>
  </div>
);

const PaymentsTab = () => (
  <div className="bg-gray-800 p-6 rounded-lg">
    <h3 className="text-xl font-semibold mb-4">💳 Payment Methods</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gray-700 p-4 rounded">
        <h4 className="font-semibold text-blue-400">Credit Cards</h4>
        <p className="text-2xl font-bold mt-2">2.9%</p>
        <p className="text-sm text-gray-400">Processing Fee</p>
      </div>
      <div className="bg-gray-700 p-4 rounded">
        <h4 className="font-semibold text-yellow-400">Crypto</h4>
        <p className="text-2xl font-bold mt-2">1.0%</p>
        <p className="text-sm text-gray-400">Processing Fee</p>
      </div>
      <div className="bg-gray-700 p-4 rounded">
        <h4 className="font-semibold text-green-400">Bank Transfer</h4>
        <p className="text-2xl font-bold mt-2">0.5%</p>
        <p className="text-sm text-gray-400">Processing Fee</p>
      </div>
    </div>
  </div>
);

const RevenueTab = () => (
  <div className="bg-gray-800 p-6 rounded-lg">
    <h3 className="text-xl font-semibold mb-4">👥 Family Business Revenue Split</h3>
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="bg-blue-600 p-4 rounded text-center">
        <div className="text-3xl font-bold">40%</div>
        <div className="text-blue-200">DJ Speedy</div>
      </div>
      <div className="bg-green-600 p-4 rounded text-center">
        <div className="text-3xl font-bold">25%</div>
        <div className="text-green-200">Production Studio</div>
      </div>
      <div className="bg-purple-600 p-4 rounded text-center">
        <div className="text-3xl font-bold">20%</div>
        <div className="text-purple-200">Research Scholar</div>
      </div>
      <div className="bg-orange-600 p-4 rounded text-center">
        <div className="text-3xl font-bold">10%</div>
        <div className="text-orange-200">System Admin</div>
      </div>
      <div className="bg-red-600 p-4 rounded text-center">
        <div className="text-3xl font-bold">5%</div>
        <div className="text-red-200">Emergency Fund</div>
      </div>
    </div>
  </div>
);

const ProfitsTab = ({ currentProfit }) => (
  <div className="space-y-6">
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">📈 Profit Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400">Monthly Revenue</p>
          <p className="text-3xl font-bold text-green-400">${currentProfit?.revenue.toLocaleString()}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400">Monthly Profit</p>
          <p className="text-3xl font-bold text-blue-400">${currentProfit?.profit.toLocaleString()}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400">Profit Margin</p>
          <p className="text-3xl font-bold text-purple-400">{currentProfit?.margin}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400">Annual Projection</p>
          <p className="text-3xl font-bold text-yellow-400">${currentProfit?.projectedAnnual.toLocaleString()}</p>
        </div>
      </div>
    </div>
  </div>
);

export default MoneyMakingDashboard;
