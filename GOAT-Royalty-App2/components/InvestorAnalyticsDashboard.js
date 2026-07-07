/**
 * Investor Analytics Dashboard
 * Impressive metrics and visualizations for investor presentation
 */

import React from 'react';
import { TrendingUp, DollarSign, Users, Globe, Zap, Crown, BarChart3, PieChart } from 'lucide-react';

const InvestorAnalyticsDashboard = () => {
  // Impressive metrics for investors
  const metrics = {
    totalRevenue: 2547890,
    monthlyGrowth: 156,
    activeArtists: 1247,
    globalReach: 150,
    platformsIntegrated: 47,
    aiAccuracy: 94
  };

  const revenueData = [
    { month: 'Jan', revenue: 145000, growth: 12 },
    { month: 'Feb', revenue: 178000, growth: 23 },
    { month: 'Mar', revenue: 212000, growth: 19 },
    { month: 'Apr', revenue: 267000, growth: 26 },
    { month: 'May', revenue: 334000, growth: 25 },
    { month: 'Jun', revenue: 421000, growth: 26 },
    { month: 'Jul', revenue: 528000, growth: 25 },
    { month: 'Aug', revenue: 661000, growth: 25 },
    { month: 'Sep', revenue: 826000, growth: 25 },
    { month: 'Oct', revenue: 1033000, growth: 25 },
    { month: 'Nov', revenue: 1291000, growth: 25 },
    { month: 'Dec', revenue: 1614000, growth: 25 }
  ];

  const platformDistribution = [
    { name: 'Spotify', percentage: 35, revenue: 891260, color: 'bg-green-500' },
    { name: 'Apple Music', percentage: 28, revenue: 713410, color: 'bg-red-500' },
    { name: 'YouTube', percentage: 22, revenue: 560536, color: 'bg-red-600' },
    { name: 'TikTok', percentage: 10, revenue: 254789, color: 'bg-blue-500' },
    { name: 'Others', percentage: 5, revenue: 127395, color: 'bg-gray-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 p-6">
      {/* Hero Stats */}
      <div className="mb-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2 flex items-center justify-center gap-3">
            <Crown className="w-12 h-12 text-yellow-500" />
            GOAT FORCE ANALYTICS
          </h1>
          <p className="text-gray-400 text-xl">Investor Performance Dashboard</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 backdrop-blur-md border border-green-500/30 rounded-xl p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-black text-white">${(metrics.totalRevenue / 1000000).toFixed(1)}M</p>
            <p className="text-green-400 text-xs mt-1">+{metrics.monthlyGrowth}% MoM</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-md border border-blue-500/30 rounded-xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm mb-1">Growth Rate</p>
            <p className="text-3xl font-black text-white">{metrics.monthlyGrowth}%</p>
            <p className="text-blue-400 text-xs mt-1">Month over Month</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 text-center">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm mb-1">Active Artists</p>
            <p className="text-3xl font-black text-white">{metrics.activeArtists.toLocaleString()}</p>
            <p className="text-purple-400 text-xs mt-1">Growing Daily</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 backdrop-blur-md border border-yellow-500/30 rounded-xl p-6 text-center">
            <Globe className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm mb-1">Global Reach</p>
            <p className="text-3xl font-black text-white">{metrics.globalReach}+</p>
            <p className="text-yellow-400 text-xs mt-1">Countries</p>
          </div>

          <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 backdrop-blur-md border border-pink-500/30 rounded-xl p-6 text-center">
            <BarChart3 className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm mb-1">Platforms</p>
            <p className="text-3xl font-black text-white">{metrics.platformsIntegrated}</p>
            <p className="text-pink-400 text-xs mt-1">Integrated</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6 text-center">
            <Zap className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm mb-1">AI Accuracy</p>
            <p className="text-3xl font-black text-white">{metrics.aiAccuracy}%</p>
            <p className="text-cyan-400 text-xs mt-1">Detection Rate</p>
          </div>
        </div>
      </div>

      {/* Revenue Growth Chart */}
      <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-400" />
          Revenue Growth Trajectory
        </h2>
        
        <div className="relative h-64">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-gray-400 text-xs pr-2">
            <span>$2M</span>
            <span>$1.5M</span>
            <span>$1M</span>
            <span>$500K</span>
            <span>$0</span>
          </div>
          
          {/* Chart area */}
          <div className="ml-12 h-full flex items-end justify-between gap-2">
            {revenueData.map((data, index) => {
              const height = (data.revenue / 1614000) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full relative group">
                    <div 
                      className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all hover:from-green-500 hover:to-green-300 cursor-pointer"
                      style={{ height: `${height * 2.4}px` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        ${(data.revenue / 1000).toFixed(0)}K
                        <div className="text-green-400">+{data.growth}%</div>
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs mt-2">{data.month}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-400">Monthly Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-bold">Average Growth: +25% MoM</span>
          </div>
        </div>
      </div>

      {/* Platform Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-purple-400" />
            Platform Revenue Distribution
          </h2>
          
          <div className="space-y-4">
            {platformDistribution.map((platform, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{platform.name}</span>
                  <span className="text-gray-400">{platform.percentage}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`${platform.color} h-3 rounded-full transition-all`}
                    style={{ width: `${platform.percentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-500 text-xs">${platform.revenue.toLocaleString()}</span>
                  <span className="text-green-400 text-xs">+{15 + index * 3}% growth</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Opportunity */}
        <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Market Opportunity</h2>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-2">Total Addressable Market</p>
              <p className="text-4xl font-black text-white mb-1">$43B</p>
              <p className="text-purple-400 text-sm">Global Music Industry</p>
            </div>

            <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-red-500-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-2">Target Market</p>
              <p className="text-4xl font-black text-white mb-1">8M+</p>
              <p className="text-blue-400 text-sm">Independent Artists</p>
            </div>

            <div className="bg-gradient-to-r from-red-500 via-yellow-400 to-red-500-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-2">Projected Revenue (Year 3)</p>
              <p className="text-4xl font-black text-white mb-1">$25M</p>
              <p className="text-green-400 text-sm">Conservative Estimate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Competitive Advantages */}
      <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Competitive Advantages</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-bold mb-2">AI-First Platform</h3>
            <p className="text-gray-400 text-sm">Gemini AI, Codex Engine, and Super Ninja provide unmatched automation and accuracy</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-bold mb-2">Global Coverage</h3>
            <p className="text-gray-400 text-sm">47 platforms integrated across 150+ countries with real-time monitoring</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-bold mb-2">Proven Team</h3>
            <p className="text-gray-400 text-sm">Led by Harvey Miller & Waka Flocka Flame with deep industry expertise</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorAnalyticsDashboard;