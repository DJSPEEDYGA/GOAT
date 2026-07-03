/**
 * Codex Engine - Global Royalty Tracking System
 * Real-time monitoring across all platforms
 */

import React, { useState, useEffect } from 'react';
import { Globe, Activity, DollarSign, AlertTriangle, CheckCircle, Radio } from 'lucide-react';

const CodexEnginePanel = () => {
  const [scanning, setScanning] = useState(false);
  const [detections, setDetections] = useState([]);
  const [stats, setStats] = useState({
    platformsMonitored: 47,
    activeScans: 1247,
    revenueRecovered: 156780,
    issuesDetected: 23
  });

  const platforms = [
    { name: 'Spotify', status: 'active', revenue: 45230, color: 'green' },
    { name: 'Apple Music', status: 'active', revenue: 32100, color: 'green' },
    { name: 'YouTube', status: 'warning', revenue: 28450, color: 'yellow' },
    { name: 'TikTok', status: 'active', revenue: 19800, color: 'green' },
    { name: 'Amazon Music', status: 'active', revenue: 12400, color: 'green' },
    { name: 'Pandora', status: 'issue', revenue: 8900, color: 'red' }
  ];

  const startScan = () => {
    setScanning(true);
    
    setTimeout(() => {
      setDetections([
        {
          platform: 'YouTube',
          type: 'unauthorized',
          title: 'Hard in Da Paint',
          views: '2.4M',
          estimated: '$8,450',
          status: 'pending'
        },
        {
          platform: 'TikTok',
          type: 'viral',
          title: 'No Hands',
          uses: '847K',
          estimated: '$12,200',
          status: 'claiming'
        },
        {
          platform: 'Instagram',
          type: 'story',
          title: 'Grove St. Party',
          uses: '156K',
          estimated: '$3,400',
          status: 'claimed'
        }
      ]);
      setScanning(false);
    }, 3000);
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-black/50 backdrop-blur-md border border-blue-500/30 rounded-xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center animate-pulse">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Codex Engine</h3>
            <p className="text-gray-400 text-sm">Global Tracking System</p>
          </div>
        </div>
        
        <button
          onClick={startScan}
          disabled={scanning}
          className="bg-gradient-to-r from-red-500 via-yellow-500 to-red-500-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {scanning ? (
            <>
              <Radio className="w-5 h-5 animate-pulse" />
              Scanning...
            </>
          ) : (
            <>
              <Activity className="w-5 h-5" />
              Start Global Scan
            </>
          )}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-xs mb-1">Platforms</p>
          <p className="text-2xl font-bold text-white">{stats.platformsMonitored}</p>
        </div>
        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-xs mb-1">Active Scans</p>
          <p className="text-2xl font-bold text-white">{stats.activeScans.toLocaleString()}</p>
        </div>
        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-xs mb-1">Recovered</p>
          <p className="text-2xl font-bold text-green-400">${(stats.revenueRecovered / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-xs mb-1">Issues</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.issuesDetected}</p>
        </div>
      </div>

      {/* Platform Status */}
      <div className="mb-6">
        <h4 className="text-white font-bold mb-3">Platform Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {platforms.map((platform, index) => (
            <div key={index} className="bg-black/30 rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-semibold">{platform.name}</span>
                <div className={`w-2 h-2 rounded-full ${
                  platform.color === 'green' ? 'bg-green-400' :
                  platform.color === 'yellow' ? 'bg-yellow-400' :
                  'bg-red-400'
                } animate-pulse`}></div>
              </div>
              <p className="text-gray-400 text-xs">${platform.revenue.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detections */}
      {detections.length > 0 && (
        <div>
          <h4 className="text-white font-bold mb-3">Recent Detections</h4>
          <div className="space-y-3">
            {detections.map((detection, index) => (
              <div key={index} className="bg-black/30 rounded-xl p-4 border border-white/10 hover:border-blue-500/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-semibold">{detection.title}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        detection.status === 'claimed' ? 'bg-green-500/20 text-green-400' :
                        detection.status === 'claiming' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {detection.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{detection.platform}</span>
                      <span>•</span>
                      <span>{detection.type}</span>
                      <span>•</span>
                      <span>{detection.views || detection.uses}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{detection.estimated}</p>
                    <p className="text-gray-500 text-xs">estimated</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {detections.length === 0 && !scanning && (
        <div className="text-center py-8">
          <Globe className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400">Click "Start Global Scan" to monitor all platforms</p>
        </div>
      )}
    </div>
  );
};

export default CodexEnginePanel;