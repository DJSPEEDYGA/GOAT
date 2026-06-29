import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Youtube, Music, CreditCard, Globe, Link2, RefreshCw,
  CheckCircle, AlertCircle, Clock, ExternalLink, Settings,
  Activity, TrendingUp, DollarSign, Users, Play, Pause,
  Shield, Zap, Database, Eye, EyeOff, Copy, Trash2, Plus
} from 'lucide-react';

// ============================================================
// GOAT DATA PROVIDER INTEGRATION HUB
// YouTube, Spotify, Stripe, Blockchain Royalty Tracking
// Unified Automation Platform
// ============================================================

// Data Providers Configuration
const DATA_PROVIDERS = {
  YOUTUBE: {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: '#FF0000',
    description: 'Video streaming, monetization, analytics',
    features: ['Content ID', 'Analytics', 'Monetization', 'Live Streaming'],
    endpoints: ['videos', 'analytics', 'comments', 'playlists', 'earnings'],
    authType: 'OAuth 2.0'
  },
  SPOTIFY: {
    id: 'spotify',
    name: 'Spotify',
    icon: Music,
    color: '#1DB954',
    description: 'Music streaming, playlists, artist analytics',
    features: ['Artist Dashboard', 'Playlists', 'Streaming Data', 'Royalty Reports'],
    endpoints: ['tracks', 'albums', 'artists', 'playlists', 'analytics'],
    authType: 'OAuth 2.0'
  },
  STRIPE: {
    id: 'stripe',
    name: 'Stripe',
    icon: CreditCard,
    color: '#635BFF',
    description: 'Payment processing, subscriptions, payouts',
    features: ['Payments', 'Subscriptions', 'Connect', 'Invoicing'],
    endpoints: ['charges', 'customers', 'subscriptions', 'payouts', 'balance'],
    authType: 'API Key'
  },
  APPLE_MUSIC: {
    id: 'apple_music',
    name: 'Apple Music',
    icon: Music,
    color: '#FA243C',
    description: 'Apple Music streaming and analytics',
    features: ['Artist Analytics', 'Play Counts', 'Playlists', 'Radio'],
    endpoints: ['songs', 'albums', 'artists', 'playlists', 'analytics'],
    authType: 'Developer Token'
  },
  ASCAP: {
    id: 'ascap',
    name: 'ASCAP',
    icon: Shield,
    color: '#00A0DC',
    description: 'Performance rights organization',
    features: ['Royalty Collection', 'Member Portal', 'Catalog', 'Licensing'],
    endpoints: ['works', 'royalties', 'members', 'licenses'],
    authType: 'API Key'
  },
  BMI: {
    id: 'bmi',
    name: 'BMI',
    icon: Shield,
    color: '#FF6600',
    description: 'Broadcast Music, Inc.',
    features: ['Royalty Tracking', 'Catalog', 'Affiliations'],
    endpoints: ['works', 'royalties', 'affiliates'],
    authType: 'OAuth 2.0'
  }
};

// Integration Status
const INTEGRATION_STATUS = {
  CONNECTED: 'connected',
  PENDING: 'pending',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
};

// Automation Rules
const AUTOMATION_RULES = {
  ROYALTY_SYNC: {
    id: 'royalty_sync',
    name: 'Automatic Royalty Sync',
    description: 'Sync royalty data from all connected platforms',
    triggers: ['daily', 'weekly', 'monthly'],
    actions: ['fetch_royalties', 'update_ledger', 'notify_changes']
  },
  EARNINGS_AGGREGATION: {
    id: 'earnings_aggregation',
    name: 'Earnings Aggregation',
    description: 'Aggregate earnings across all platforms',
    triggers: ['daily', 'weekly'],
    actions: ['calculate_total', 'generate_report', 'blockchain_record']
  },
  CONTENT_MATCH: {
    id: 'content_match',
    name: 'Content ID Matching',
    description: 'Match content across platforms using fingerprinting',
    triggers: ['on_upload', 'weekly'],
    actions: ['fingerprint', 'match', 'claim']
  },
  PAYMENT_PROCESSING: {
    id: 'payment_processing',
    name: 'Payment Processing',
    description: 'Process royalty payments via Stripe',
    triggers: ['monthly', 'threshold'],
    actions: ['calculate_splits', 'process_payments', 'record_blockchain']
  }
};

const DataProviderIntegrationHub = () => {
  // State Management
  const [integrations, setIntegrations] = useState({});
  const [activeProvider, setActiveProvider] = useState(null);
  const [syncStatus, setSyncStatus] = useState({});
  const [automationRules, setAutomationRules] = useState([]);
  const [recentSyncs, setRecentSyncs] = useState([]);
  const [apiCalls, setApiCalls] = useState([]);
  const [earnings, setEarnings] = useState({});
  const [loading, setLoading] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState({});

  // Initialize demo data
  useEffect(() => {
    // Integration status
    setIntegrations({
      youtube: { status: INTEGRATION_STATUS.CONNECTED, lastSync: '2024-03-15 14:32:00', accountName: 'DJ Speedy Official' },
      spotify: { status: INTEGRATION_STATUS.CONNECTED, lastSync: '2024-03-15 14:30:00', accountName: 'GOAT Records' },
      stripe: { status: INTEGRATION_STATUS.CONNECTED, lastSync: '2024-03-15 14:28:00', accountName: 'GOAT Royalty Inc.' },
      apple_music: { status: INTEGRATION_STATUS.PENDING, lastSync: null, accountName: null },
      ascap: { status: INTEGRATION_STATUS.CONNECTED, lastSync: '2024-03-15 12:00:00', accountName: 'FASTASSMAN PUBLISHING' },
      bmi: { status: INTEGRATION_STATUS.DISCONNECTED, lastSync: null, accountName: null },
    });

    // Sync status
    setSyncStatus({
      youtube: { progress: 100, items: 156, errors: 0 },
      spotify: { progress: 100, items: 342, errors: 0 },
      stripe: { progress: 100, items: 89, errors: 0 },
      ascap: { progress: 100, items: 847, errors: 2 },
    });

    // Automation rules
    setAutomationRules([
      { ...AUTOMATION_RULES.ROYALTY_SYNC, enabled: true, lastRun: '2024-03-15 00:00:00' },
      { ...AUTOMATION_RULES.EARNINGS_AGGREGATION, enabled: true, lastRun: '2024-03-14 23:55:00' },
      { ...AUTOMATION_RULES.CONTENT_MATCH, enabled: false, lastRun: null },
      { ...AUTOMATION_RULES.PAYMENT_PROCESSING, enabled: true, lastRun: '2024-03-01 00:00:00' },
    ]);

    // Recent syncs
    setRecentSyncs([
      { provider: 'youtube', type: 'analytics', status: 'success', time: '14:32', items: 156 },
      { provider: 'spotify', type: 'streaming', status: 'success', time: '14:30', items: 342 },
      { provider: 'stripe', type: 'payouts', status: 'success', time: '14:28', items: 89 },
      { provider: 'ascap', type: 'royalties', status: 'warning', time: '12:00', items: 847 },
    ]);

    // API calls today
    setApiCalls([
      { provider: 'youtube', endpoint: '/analytics', calls: 245, limit: 10000 },
      { provider: 'spotify', endpoint: '/v1/tracks', calls: 189, limit: 5000 },
      { provider: 'stripe', endpoint: '/v1/charges', calls: 56, limit: 1000 },
      { provider: 'ascap', endpoint: '/works', calls: 324, limit: 5000 },
    ]);

    // Earnings summary
    setEarnings({
      youtube: { amount: 12500.00, currency: 'USD', period: 'March 2024', change: 12.5 },
      spotify: { amount: 8750.00, currency: 'USD', period: 'March 2024', change: 8.3 },
      apple_music: { amount: 3200.00, currency: 'USD', period: 'March 2024', change: -2.1 },
      stripe: { amount: 45000.00, currency: 'USD', period: 'March 2024', change: 25.0 },
      ascap: { amount: 6500.00, currency: 'USD', period: 'Q1 2024', change: 5.0 },
    });
  }, []);

  // Sync provider
  const syncProvider = useCallback(async (providerId) => {
    setLoading(true);
    // Simulate sync
    setTimeout(() => {
      setRecentSyncs(prev => [
        { provider: providerId, type: 'full', status: 'success', time: new Date().toLocaleTimeString(), items: Math.floor(Math.random() * 100) + 50 },
        ...prev.slice(0, 9)
      ]);
      setLoading(false);
    }, 2000);
  }, []);

  // Toggle automation rule
  const toggleAutomationRule = useCallback((ruleId) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  }, []);

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case INTEGRATION_STATUS.CONNECTED: return 'text-green-400';
      case INTEGRATION_STATUS.PENDING: return 'text-yellow-400';
      case INTEGRATION_STATUS.DISCONNECTED: return 'text-gray-400';
      case INTEGRATION_STATUS.ERROR: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case INTEGRATION_STATUS.CONNECTED: return <CheckCircle className="w-4 h-4" />;
      case INTEGRATION_STATUS.PENDING: return <Clock className="w-4 h-4" />;
      case INTEGRATION_STATUS.DISCONNECTED: return <AlertCircle className="w-4 h-4" />;
      case INTEGRATION_STATUS.ERROR: return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-blue-400">
              <Globe className="w-8 h-8" />
              GOAT Data Provider Integration Hub
              <span className="text-sm bg-green-600 px-2 py-1 rounded">Unified API</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              YouTube • Spotify • Stripe • Apple Music • ASCAP • BMI • Blockchain Royalty Tracking
            </p>
          </CardContent>
        </Card>

        {/* Earnings Overview */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              Earnings Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(earnings).map(([providerId, data]) => {
                const provider = DATA_PROVIDERS[providerId.toUpperCase()];
                return (
                  <div key={providerId} className="bg-gray-700/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {provider && <provider.icon className="w-4 h-4" style={{ color: provider.color }} />}
                      <span className="text-gray-400 text-sm capitalize">{providerId.replace('_', ' ')}</span>
                    </div>
                    <div className="text-xl font-bold text-white">{formatCurrency(data.amount)}</div>
                    <div className={`text-xs flex items-center gap-1 ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {data.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                      {Math.abs(data.change)}%
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-400">Total Monthly Earnings</span>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(Object.values(earnings).reduce((sum, e) => sum + e.amount, 0))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-400">Blockchain Verified</span>
                  <div className="flex items-center gap-2 text-green-400">
                    <Shield className="w-4 h-4" />
                    <span>✓ Recorded on Ethereum</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Connected Providers */}
          <div className="md:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-blue-400" />
                  Connected Providers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(DATA_PROVIDERS).map(([key, provider]) => {
                    const integration = integrations[provider.id] || { status: INTEGRATION_STATUS.DISCONNECTED };
                    return (
                      <div 
                        key={provider.id}
                        className={`p-4 rounded-lg bg-gray-700/30 border ${
                          activeProvider === provider.id ? 'border-blue-500' : 'border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <provider.icon className="w-6 h-6" style={{ color: provider.color }} />
                            <div>
                              <div className="text-white font-medium">{provider.name}</div>
                              <div className="text-gray-400 text-sm">{provider.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`flex items-center gap-1 text-sm ${getStatusColor(integration.status)}`}>
                              {getStatusIcon(integration.status)}
                              {integration.status}
                            </span>
                            {integration.status === INTEGRATION_STATUS.CONNECTED && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => syncProvider(provider.id)}
                                disabled={loading}
                              >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                              </Button>
                            )}
                            {integration.status === INTEGRATION_STATUS.DISCONNECTED && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Connect
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {integration.accountName && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-400">Account: <span className="text-white">{integration.accountName}</span></span>
                              <span className="text-gray-400">Last Sync: <span className="text-white">{integration.lastSync || 'Never'}</span></span>
                            </div>
                            {syncStatus[provider.id] && (
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                <span className="text-gray-500">{syncStatus[provider.id].items} items synced</span>
                                {syncStatus[provider.id].errors > 0 && (
                                  <span className="text-red-400">{syncStatus[provider.id].errors} errors</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Automation Rules */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Automation Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {automationRules.map(rule => (
                  <div key={rule.id} className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm">{rule.name}</span>
                      <button
                        onClick={() => toggleAutomationRule(rule.id)}
                        className={`w-10 h-5 rounded-full transition-all ${
                          rule.enabled ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                          rule.enabled ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    <p className="text-gray-400 text-xs">{rule.description}</p>
                    {rule.lastRun && (
                      <p className="text-gray-500 text-xs mt-1">Last run: {rule.lastRun}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Syncs */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Recent Syncs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentSyncs.slice(0, 5).map((sync, idx) => {
                    const provider = DATA_PROVIDERS[sync.provider.toUpperCase()];
                    return (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-700/30 rounded">
                        {provider && <provider.icon className="w-4 h-4" style={{ color: provider.color }} />}
                        <div className="flex-1">
                          <div className="text-xs text-white capitalize">{sync.type}</div>
                          <div className="text-xs text-gray-500">{sync.items} items • {sync.time}</div>
                        </div>
                        {sync.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* API Usage */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  API Usage Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {apiCalls.map((api, idx) => {
                    const provider = DATA_PROVIDERS[api.provider.toUpperCase()];
                    const usage = (api.calls / api.limit) * 100;
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400 capitalize">{api.provider}</span>
                          <span className="text-gray-300">{api.calls} / {api.limit}</span>
                        </div>
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${usage > 80 ? 'bg-red-500' : usage > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(usage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Blockchain Royalty Tracking */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Blockchain Royalty Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="text-purple-400 text-sm mb-2">Smart Contracts Active</div>
                <div className="text-3xl font-bold text-white">12</div>
                <div className="text-gray-400 text-sm">Managing 847 works</div>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="text-purple-400 text-sm mb-2">Total Royalties Recorded</div>
                <div className="text-3xl font-bold text-white">{formatCurrency(125000)}</div>
                <div className="text-gray-400 text-sm">On Ethereum mainnet</div>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="text-purple-400 text-sm mb-2">Verification Status</div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-bold">All Verified</span>
                </div>
                <div className="text-gray-400 text-sm">Last verified 2 min ago</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync to Blockchain
              </Button>
              <Button variant="outline" className="text-gray-300">
                <Eye className="w-4 h-4 mr-2" />
                View on Etherscan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <span className="text-gray-400">
                  <span className="text-white font-medium">{Object.values(integrations).filter(i => i.status === 'connected').length}</span> Connected
                </span>
                <span className="text-gray-400">
                  <span className="text-white font-medium">{automationRules.filter(r => r.enabled).length}</span> Automations Active
                </span>
                <span className="text-gray-400">
                  <span className="text-white font-medium">{recentSyncs.length}</span> Syncs Today
                </span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <Activity className="w-4 h-4" />
                <span>All Systems Operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataProviderIntegrationHub;