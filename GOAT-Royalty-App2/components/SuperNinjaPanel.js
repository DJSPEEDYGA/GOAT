/**
 * Super Ninja AI - Automated Copyright Detection
 * Real-time monitoring and enforcement
 */

import React, { useState } from 'react';
import { Zap, Shield, Target, AlertTriangle, TrendingUp, Eye } from 'lucide-react';

const SuperNinjaPanel = () => {
  const [monitoring, setMonitoring] = useState(true);
  const [threats, setThreats] = useState([
    {
      severity: 'high',
      platform: 'YouTube',
      type: 'Unauthorized Upload',
      track: 'Hard in Da Paint',
      channel: 'MusicVault2024',
      views: '1.2M',
      revenue: '$4,200',
      action: 'Takedown Initiated'
    },
    {
      severity: 'medium',
      platform: 'SoundCloud',
      type: 'Remix Without License',
      track: 'No Hands',
      channel: 'DJ_Remix_King',
      plays: '450K',
      revenue: '$1,800',
      action: 'Claim Filed'
    },
    {
      severity: 'low',
      platform: 'TikTok',
      type: 'Unauthorized Sample',
      track: 'Grove St. Party',
      channel: '@viral_sounds',
      uses: '89K',
      revenue: '$890',
      action: 'Monitoring'
    }
  ]);

  const stats = {
    threatsDetected: 847,
    revenueProtected: 245600,
    takedownsIssued: 156,
    claimsSuccessful: 142
  };

  return (
    <div className="bg-gradient-to-br from-yellow-900/30 to-black/50 backdrop-blur-md border border-yellow-500/30 rounded-xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Super Ninja AI</h3>
            <p className="text-gray-400 text-sm">Copyright Protection</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            monitoring ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-500/20 border border-gray-500/50'
          }`}>
            <div className={`w-2 h-2 rounded-full ${monitoring ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-white text-sm font-semibold">
              {monitoring ? 'ACTIVE' : 'PAUSED'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/30 rounded-xl p-4 border border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-gray-400 text-xs">Threats</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.threatsDetected}</p>
        </div>
        <div className="bg-black/30 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <p className="text-gray-400 text-xs">Protected</p>
          </div>
          <p className="text-2xl font-bold text-green-400">${(stats.revenueProtected / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-black/30 rounded-xl p-4 border border-yellow-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-yellow-400" />
            <p className="text-gray-400 text-xs">Takedowns</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.takedownsIssued}</p>
        </div>
        <div className="bg-black/30 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <p className="text-gray-400 text-xs">Success Rate</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">91%</p>
        </div>
      </div>

      {/* Active Threats */}
      <div>
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          <Eye className="w-5 h-5 text-yellow-400" />
          Active Threats
        </h4>
        <div className="space-y-3">
          {threats.map((threat, index) => (
            <div 
              key={index} 
              className={`bg-black/30 rounded-lg p-4 border ${
                threat.severity === 'high' ? 'border-red-500/50' :
                threat.severity === 'medium' ? 'border-yellow-500/50' :
                'border-blue-500/50'
              } hover:scale-[1.01] transition-transform`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      threat.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                      threat.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {threat.severity.toUpperCase()}
                    </span>
                    <span className="text-white font-semibold">{threat.track}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
                    <span>{threat.platform}</span>
                    <span>•</span>
                    <span>{threat.type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">Channel: {threat.channel}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-300">{threat.views || threat.plays || threat.uses}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-bold text-lg">{threat.revenue}</p>
                  <p className="text-gray-500 text-xs mb-2">lost revenue</p>
                  <button className={`px-3 py-1 rounded text-xs font-bold ${
                    threat.severity === 'high' ? 'bg-red-600 hover:bg-red-700' :
                    threat.severity === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  } text-white transition-colors`}>
                    {threat.action}
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    threat.severity === 'high' ? 'bg-red-500' :
                    threat.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: threat.severity === 'high' ? '75%' : threat.severity === 'medium' ? '50%' : '25%' }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Summary */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Last scan: <span className="text-white">2 minutes ago</span>
          </div>
          <button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all">
            <Zap className="w-4 h-4" />
            Force Scan Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperNinjaPanel;