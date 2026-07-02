/**
 * Payment Processing & Revenue Distribution
 * Stripe integration, payouts, and financial management
 */

import React, { useState } from 'react';
import { DollarSign, CreditCard, TrendingUp, Users, Calendar, CheckCircle, Clock, AlertCircle, Download, Send } from 'lucide-react';

const PaymentProcessingHub = () => {
  const [selectedPayout, setSelectedPayout] = useState(null);

  const paymentStats = {
    totalProcessed: 2547890,
    pendingPayouts: 156780,
    completedPayouts: 2391110,
    nextPayoutDate: 'Dec 15, 2025'
  };

  const recentPayouts = [
    {
      id: 'PO-2025-001',
      date: 'Nov 30, 2025',
      amount: 45230,
      recipient: 'Harvey L. Miller Jr.',
      platform: 'Spotify',
      status: 'completed',
      method: 'Bank Transfer'
    },
    {
      id: 'PO-2025-002',
      date: 'Nov 30, 2025',
      amount: 32100,
      recipient: 'Juaquin J. Malphurs',
      platform: 'Apple Music',
      status: 'completed',
      method: 'Bank Transfer'
    },
    {
      id: 'PO-2025-003',
      date: 'Dec 5, 2025',
      amount: 28450,
      recipient: 'Harvey L. Miller Jr.',
      platform: 'YouTube',
      status: 'processing',
      method: 'PayPal'
    },
    {
      id: 'PO-2025-004',
      date: 'Dec 10, 2025',
      amount: 19800,
      recipient: 'Juaquin J. Malphurs',
      platform: 'TikTok',
      status: 'pending',
      method: 'Stripe'
    }
  ];

  const revenueDistribution = [
    { name: 'Harvey L. Miller Jr.', percentage: 50, amount: 1273945, color: 'bg-yellow-500' },
    { name: 'Juaquin J. Malphurs', percentage: 40, amount: 1019156, color: 'bg-red-500' },
    { name: 'Legal Reserve', percentage: 5, amount: 127395, color: 'bg-blue-500' },
    { name: 'Platform Fees', percentage: 5, amount: 127394, color: 'bg-gray-500' }
  ];

  const upcomingPayouts = [
    { date: 'Dec 15, 2025', amount: 67890, platform: 'Spotify', status: 'scheduled' },
    { date: 'Dec 20, 2025', amount: 45600, platform: 'Apple Music', status: 'scheduled' },
    { date: 'Dec 25, 2025', amount: 34200, platform: 'YouTube', status: 'scheduled' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 via-yellow-400 to-red-500-900/50 to-emerald-900/50 backdrop-blur-md border border-green-500/30 rounded-xl p-6">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-green-400" />
          Payment Processing & Revenue Distribution
        </h2>
        <p className="text-gray-400">Automated payouts and financial management</p>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 backdrop-blur-md border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-400" />
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Processed</p>
          <p className="text-3xl font-bold text-white">${(paymentStats.totalProcessed / 1000000).toFixed(2)}M</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 backdrop-blur-md border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Pending Payouts</p>
          <p className="text-3xl font-bold text-white">${(paymentStats.pendingPayouts / 1000).toFixed(0)}K</p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-md border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Completed</p>
          <p className="text-3xl font-bold text-white">${(paymentStats.completedPayouts / 1000000).toFixed(2)}M</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Next Payout</p>
          <p className="text-lg font-bold text-white">{paymentStats.nextPayoutDate}</p>
        </div>
      </div>

      {/* Revenue Distribution */}
      <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-400" />
          Revenue Distribution
        </h3>
        
        <div className="space-y-4">
          {revenueDistribution.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">{item.name}</span>
                <div className="text-right">
                  <span className="text-white font-bold">{item.percentage}%</span>
                  <span className="text-gray-400 text-sm ml-2">${item.amount.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div 
                  className={`${item.color} h-3 rounded-full transition-all`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Revenue Pool</p>
            <p className="text-2xl font-bold text-white">${paymentStats.totalProcessed.toLocaleString()}</p>
          </div>
          <button className="bg-gradient-to-r from-red-500 via-yellow-400 to-red-500-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
            <Send className="w-5 h-5" />
            Process Payouts
          </button>
        </div>
      </div>

      {/* Recent Payouts & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payouts */}
        <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-400" />
            Recent Payouts
          </h3>
          
          <div className="space-y-3">
            {recentPayouts.map((payout) => (
              <div
                key={payout.id}
                className="bg-black/30 rounded-xl p-4 hover:bg-black/50 transition-colors cursor-pointer"
                onClick={() => setSelectedPayout(payout)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold">{payout.recipient}</p>
                    <p className="text-gray-400 text-xs">{payout.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-lg">${payout.amount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                      payout.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      payout.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {payout.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{payout.platform}</span>
                  <span className="text-gray-500">{payout.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Payouts */}
        <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-400" />
            Upcoming Payouts
          </h3>
          
          <div className="space-y-3">
            {upcomingPayouts.map((payout, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold">{payout.platform}</p>
                    <p className="text-gray-400 text-xs">{payout.date}</p>
                  </div>
                  <p className="text-purple-400 font-bold text-lg">${payout.amount.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-xs font-semibold">SCHEDULED</span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
            <Download className="w-5 h-5" />
            Download Payout Schedule
          </button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Payment Methods</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-4 text-center">
            <CreditCard className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h4 className="text-white font-bold mb-1">Stripe</h4>
            <p className="text-gray-400 text-sm mb-3">Instant transfers</p>
            <div className="flex items-center justify-center gap-1 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Connected</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-4 text-center">
            <DollarSign className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <h4 className="text-white font-bold mb-1">Bank Transfer</h4>
            <p className="text-gray-400 text-sm mb-3">Direct deposit</p>
            <div className="flex items-center justify-center gap-1 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Connected</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-4 text-center">
            <Send className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h4 className="text-white font-bold mb-1">PayPal</h4>
            <p className="text-gray-400 text-sm mb-3">Fast payments</p>
            <div className="flex items-center justify-center gap-1 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessingHub;