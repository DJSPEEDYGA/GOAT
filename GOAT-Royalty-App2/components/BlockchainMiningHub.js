import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bitcoin, Ethereum, DollarSign, TrendingUp, TrendingDown,
  Activity, Zap, Shield, Globe, Database, Link2,
  Play, Pause, RefreshCw, CheckCircle, AlertCircle,
  Coins, Wallet, Hash, Clock, Cpu, HardDrive,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  CreditCard, Send, Receive, Link, Unlink
} from 'lucide-react';

// Cash App Integration State
const CASHAPP_STATE = {
  linked: false,
  cashtag: '',
  btcAddress: '',
  lightningAddress: '',
  balance: { btc: 0, usd: 0 }
};

// ============================================================
// GOAT BLOCKCHAIN & CRYPTO MINING HUB
// Royalty Verification, Crypto Mining, Smart Contracts
// ============================================================

// Supported Networks
const BLOCKCHAIN_NETWORKS = {
  ETHEREUM: { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: Ethereum, color: '#627EEA' },
  BITCOIN: { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: Bitcoin, color: '#F7931A' },
  POLYGON: { id: 'polygon', name: 'Polygon', symbol: 'MATIC', icon: Link2, color: '#8247E5' },
  SOLANA: { id: 'solana', name: 'Solana', symbol: 'SOL', icon: Zap, color: '#00FFA3' },
  BINANCE: { id: 'binance', name: 'BNB Chain', symbol: 'BNB', icon: Coins, color: '#F3BA2F' }
};

// Mining Algorithms
const MINING_ALGORITHMS = {
  SHA256: { id: 'sha256', name: 'SHA-256', coin: 'BTC', difficulty: 'High', reward: '6.25 BTC' },
  ETHASH: { id: 'ethash', name: 'Ethash', coin: 'ETH', difficulty: 'Medium', reward: '2 ETH' },
  SCRYPT: { id: 'scrypt', name: 'Scrypt', coin: 'LTC', difficulty: 'Medium', reward: '12.5 LTC' },
  RANDOMX: { id: 'randomx', name: 'RandomX', coin: 'XMR', difficulty: 'Low', reward: '0.6 XMR' }
};

// Smart Contract Templates
const SMART_CONTRACT_TEMPLATES = {
  ROYALTY_SPLIT: {
    id: 'royalty_split',
    name: 'Royalty Split Contract',
    description: 'Automatically distribute royalties to multiple parties',
    features: ['Multi-party distribution', 'Transparent ledger', 'Instant payouts']
  },
  MUSIC_NFT: {
    id: 'music_nft',
    name: 'Music NFT Contract',
    description: 'Mint and sell music as NFTs with royalty embedded',
    features: ['NFT minting', 'Secondary royalties', 'Ownership tracking']
  },
  LICENSING: {
    id: 'licensing',
    name: 'Licensing Agreement',
    description: 'Smart contract for music licensing with automated terms',
    features: ['Term enforcement', 'Automatic payments', 'Usage tracking']
  },
  PUBLISHING: {
    id: 'publishing',
    name: 'Publishing Rights',
    description: 'Manage publishing rights and royalty collection',
    features: ['Rights management', 'Collection society integration', 'Split sheets']
  }
};

const BlockchainMiningHub = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('royalty-verification');
  const [selectedNetwork, setSelectedNetwork] = useState(BLOCKCHAIN_NETWORKS.ETHEREUM);
  const [isMining, setIsMining] = useState(false);
  const [miningStats, setMiningStats] = useState({
    hashRate: 0,
    blocksFound: 0,
    totalEarned: 0,
    uptime: 0
  });
  const [walletBalance, setWalletBalance] = useState({
    ETH: 2.4521,
    BTC: 0.0842,
    MATIC: 1250.00,
    SOL: 15.234,
    BNB: 3.142
  });
  const [royaltyLedger, setRoyaltyLedger] = useState([]);
  const [smartContracts, setSmartContracts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [miningPool, setMiningPool] = useState({
    connected: false,
    poolAddress: '',
    workers: 0,
    totalHashRate: 0
  });
  const [cashApp, setCashApp] = useState(CASHAPP_STATE);
  const [cashAppInput, setCashAppInput] = useState('');
  const [cashAppAmount, setCashAppAmount] = useState('');
  const [cashAppAddress, setCashAppAddress] = useState('');
  const [cashAppNote, setCashAppNote] = useState('');

  // Initialize demo data
  useEffect(() => {
    // Demo royalty ledger entries
    setRoyaltyLedger([
      { id: 1, track: 'Summer Vibes', artist: 'DJ Speedy', amount: 0.0025, currency: 'ETH', txHash: '0x1a2b3c...', date: '2024-03-15', verified: true },
      { id: 2, track: 'Midnight Dreams', artist: 'Fastassman', amount: 0.0018, currency: 'ETH', txHash: '0x4d5e6f...', date: '2024-03-14', verified: true },
      { id: 3, track: 'Club Banger', artist: 'GOAT Collective', amount: 0.0032, currency: 'ETH', txHash: '0x7g8h9i...', date: '2024-03-13', verified: true },
      { id: 4, track: 'Street Anthem', artist: 'DJ Speedy', amount: 0.0015, currency: 'ETH', txHash: '0xj1k2l3...', date: '2024-03-12', verified: true },
    ]);

    // Demo smart contracts
    setSmartContracts([
      { id: 1, name: 'Summer Vibes Royalty Split', type: 'ROYALTY_SPLIT', address: '0xAbC123...', status: 'active', parties: 3 },
      { id: 2, name: 'Midnight Dreams NFT', type: 'MUSIC_NFT', address: '0xDeF456...', status: 'active', parties: 1 },
      { id: 3, name: 'GOAT Publishing Agreement', type: 'PUBLISHING', address: '0xGhI789...', status: 'pending', parties: 2 },
    ]);

    // Demo transactions
    setTransactions([
      { id: 1, type: 'royalty', amount: 0.0025, currency: 'ETH', from: 'Spotify', to: 'DJ Speedy', status: 'confirmed', date: '2024-03-15' },
      { id: 2, type: 'mining', amount: 0.00015, currency: 'BTC', from: 'Pool', to: 'Wallet', status: 'confirmed', date: '2024-03-15' },
      { id: 3, type: 'nft_sale', amount: 0.5, currency: 'ETH', from: 'Buyer', to: 'Artist', status: 'confirmed', date: '2024-03-14' },
    ]);
  }, []);

  // Mining simulation
  useEffect(() => {
    let interval;
    if (isMining) {
      interval = setInterval(() => {
        setMiningStats(prev => ({
          ...prev,
          hashRate: 125.5 + Math.random() * 10,
          uptime: prev.uptime + 1,
          totalEarned: prev.totalEarned + (Math.random() * 0.00001)
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMining]);

  // Toggle mining
  const toggleMining = useCallback(() => {
    setIsMining(prev => !prev);
    if (!isMining) {
      setMiningStats(prev => ({
        ...prev,
        hashRate: 125.5
      }));
    } else {
      setMiningStats(prev => ({
        ...prev,
        hashRate: 0
      }));
    }
  }, [isMining]);

  // Format currency
  const formatCurrency = (amount, currency) => {
    return `${amount.toFixed(currency === 'BTC' ? 6 : 4)} ${currency}`;
  };

  // Get USD value (simulated)
  const getUSDValue = (amount, currency) => {
    const prices = { ETH: 3500, BTC: 67000, MATIC: 0.8, SOL: 150, BNB: 600 };
    return (amount * (prices[currency] || 0)).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-orange-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-orange-400">
              <Bitcoin className="w-8 h-8" />
              GOAT Blockchain & Crypto Mining Hub
              <span className="text-sm bg-blue-600 px-2 py-1 rounded">v2.0</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Royalty Verification • Crypto Mining • Smart Contracts • NFT Minting
            </p>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'royalty-verification', label: 'Royalty Verification', icon: Shield },
            { id: 'crypto-mining', label: 'Crypto Mining', icon: Cpu },
            { id: 'smart-contracts', label: 'Smart Contracts', icon: Hash },
            { id: 'wallet', label: 'Wallet', icon: Wallet },
            { id: 'nft-minting', label: 'NFT Minting', icon: Coins },
            { id: 'cashapp', label: 'Cash App', icon: CreditCard },
          ].map(tab => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${activeTab === tab.id 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Network Selector */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Network:</span>
              <div className="flex gap-2">
                {Object.values(BLOCKCHAIN_NETWORKS).map(network => (
                  <button
                    key={network.id}
                    onClick={() => setSelectedNetwork(network)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      selectedNetwork.id === network.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    <network.icon className="w-4 h-4" style={{ color: network.color }} />
                    <span className="text-sm">{network.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Based on Tab */}
        {activeTab === 'royalty-verification' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Royalty Ledger */}
            <div className="md:col-span-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-green-400" />
                    Public Royalty Ledger
                    <span className="text-xs bg-green-600/30 text-green-400 px-2 py-1 rounded ml-2">
                      Blockchain Verified
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 border-b border-gray-700">
                          <th className="text-left py-3">Track</th>
                          <th className="text-left py-3">Artist</th>
                          <th className="text-right py-3">Amount</th>
                          <th className="text-left py-3">TX Hash</th>
                          <th className="text-center py-3">Verified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {royaltyLedger.map(entry => (
                          <tr key={entry.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                            <td className="py-3 text-white">{entry.track}</td>
                            <td className="py-3 text-gray-300">{entry.artist}</td>
                            <td className="py-3 text-right">
                              <span className="text-green-400">{formatCurrency(entry.amount, entry.currency)}</span>
                              <span className="text-gray-500 text-xs ml-1">(${getUSDValue(entry.amount, entry.currency)})</span>
                            </td>
                            <td className="py-3">
                              <code className="text-blue-400 text-xs bg-blue-900/30 px-2 py-1 rounded">
                                {entry.txHash}
                              </code>
                            </td>
                            <td className="py-3 text-center">
                              {entry.verified ? (
                                <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                              ) : (
                                <Clock className="w-5 h-5 text-yellow-400 mx-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Verification Stats */}
            <div className="space-y-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Verification Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Verified</span>
                    <span className="text-green-400 font-bold">847 entries</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Amount</span>
                    <span className="text-white font-bold">12.45 ETH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Network</span>
                    <span className="text-blue-400">{selectedNetwork.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Block Height</span>
                    <span className="text-gray-300">19,234,567</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-10 h-10 text-green-400" />
                    <div>
                      <div className="text-green-400 font-bold">Independently Verified</div>
                      <div className="text-gray-400 text-sm">All royalties verified on public blockchain</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync with Blockchain
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'crypto-mining' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mining Dashboard */}
            <div className="md:col-span-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-yellow-400" />
                    Mining Dashboard
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${isMining ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                      {isMining ? 'ACTIVE' : 'STANDBY'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-700/30 p-4 rounded-lg text-center">
                      <Activity className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{miningStats.hashRate.toFixed(1)}</div>
                      <div className="text-gray-400 text-sm">MH/s</div>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-lg text-center">
                      <Hash className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{miningStats.blocksFound}</div>
                      <div className="text-gray-400 text-sm">Blocks Found</div>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-lg text-center">
                      <DollarSign className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{miningStats.totalEarned.toFixed(6)}</div>
                      <div className="text-gray-400 text-sm">BTC Earned</div>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-lg text-center">
                      <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{Math.floor(miningStats.uptime / 60)}:{(miningStats.uptime % 60).toString().padStart(2, '0')}</div>
                      <div className="text-gray-400 text-sm">Uptime</div>
                    </div>
                  </div>

                  {/* Mining Controls */}
                  <div className="flex gap-4 mb-6">
                    <Button
                      onClick={toggleMining}
                      className={`flex-1 ${isMining ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {isMining ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop Mining
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Mining
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Mining Algorithms */}
                  <div className="space-y-3">
                    <h3 className="text-white font-medium">Mining Algorithms</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.values(MINING_ALGORITHMS).map(algo => (
                        <div key={algo.id} className="bg-gray-700/30 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{algo.name}</span>
                            <span className="text-yellow-400">{algo.coin}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Difficulty: {algo.difficulty} | Reward: {algo.reward}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mining Pool & Stats */}
            <div className="space-y-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    Mining Pool
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status</span>
                    <span className={miningPool.connected ? 'text-green-400' : 'text-red-400'}>
                      {miningPool.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Workers</span>
                    <span className="text-white">{miningPool.workers || 1}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Pool Hash Rate</span>
                    <span className="text-white">125.5 TH/s</span>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Connect to Pool
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Profitability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Daily Revenue</span>
                      <span className="text-green-400">$12.45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Electricity Cost</span>
                      <span className="text-red-400">-$3.20</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-700 pt-2">
                      <span className="text-gray-400">Daily Profit</span>
                      <span className="text-green-400 font-bold">$9.25</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-yellow-400" />
                    <div>
                      <div className="text-yellow-400 font-bold">GPU Mining Ready</div>
                      <div className="text-gray-400 text-xs">NVIDIA RTX 4090 detected</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'smart-contracts' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Active Contracts */}
            <div className="md:col-span-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Hash className="w-5 h-5 text-purple-400" />
                    Active Smart Contracts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {smartContracts.map(contract => (
                      <div key={contract.id} className="bg-gray-700/30 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{contract.name}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            contract.status === 'active' ? 'bg-green-600/30 text-green-400' : 'bg-yellow-600/30 text-yellow-400'
                          }`}>
                            {contract.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <code className="text-blue-400 bg-blue-900/30 px-2 py-1 rounded">{contract.address}</code>
                          <span className="text-gray-400">{contract.parties} parties</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contract Templates */}
            <div className="space-y-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Contract Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.values(SMART_CONTRACT_TEMPLATES).map(template => (
                    <button
                      key={template.id}
                      className="w-full p-3 bg-gray-700/30 rounded-lg text-left hover:bg-gray-600/30 transition-all"
                    >
                      <div className="text-white font-medium text-sm">{template.name}</div>
                      <div className="text-gray-400 text-xs mt-1">{template.description}</div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Hash className="w-4 h-4 mr-2" />
                Deploy New Contract
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Wallet Balances */}
            <div className="md:col-span-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-cyan-400" />
                    Wallet Balances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(walletBalance).map(([currency, balance]) => {
                      const network = Object.values(BLOCKCHAIN_NETWORKS).find(n => n.symbol === currency);
                      return (
                        <div key={currency} className="bg-gray-700/30 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            {network && <network.icon className="w-5 h-5" style={{ color: network.color }} />}
                            <span className="text-white font-medium">{currency}</span>
                          </div>
                          <div className="text-xl font-bold text-white">{formatCurrency(balance, currency)}</div>
                          <div className="text-sm text-gray-400">${getUSDValue(balance, currency)} USD</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total Value */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Total Portfolio Value</span>
                      <span className="text-2xl font-bold text-white">
                        ${Object.entries(walletBalance).reduce((sum, [curr, bal]) => sum + parseFloat(getUSDValue(bal, curr)), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <div className="space-y-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex items-center gap-3 p-2 bg-gray-700/30 rounded">
                      {tx.type === 'royalty' ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : tx.type === 'mining' ? (
                        <Cpu className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <Coins className="w-4 h-4 text-purple-400" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm text-white">{formatCurrency(tx.amount, tx.currency)}</div>
                        <div className="text-xs text-gray-400">{tx.type}</div>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <ArrowDownRight className="w-4 h-4 mr-2" />
                  Receive
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nft-minting' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* NFT Creation */}
            <div className="md:col-span-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Coins className="w-5 h-5 text-pink-400" />
                    NFT Minting Studio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Track Name</label>
                        <input type="text" placeholder="Enter track name..." className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
                      </div>
                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Artist</label>
                        <input type="text" placeholder="Enter artist name..." className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
                      </div>
                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Royalty Percentage</label>
                        <input type="number" placeholder="10" className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4 flex items-center justify-center">
                      <div className="text-center">
                        <HardDrive className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Upload Audio File</p>
                        <p className="text-gray-500 text-xs">MP3, WAV, FLAC</p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500">
                    <Coins className="w-4 h-4 mr-2" />
                    Mint as NFT
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20">
                <CardContent className="py-4">
                  <h3 className="text-white font-medium mb-3">NFT Benefits</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" />Permanent royalty tracking</li>
                    <li className="flex items-center gap-2 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" />Secondary sale royalties</li>
                    <li className="flex items-center gap-2 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" />Proof of ownership</li>
                    <li className="flex items-center gap-2 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" />Global marketplace access</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2"><CardTitle className="text-white text-sm">Your NFTs</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <Coins className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No NFTs minted yet</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'cashapp' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    Cash App Bitcoin Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!cashApp.linked ? (
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">Link your Cash App to send and receive Bitcoin</p>
                        <div className="flex gap-2 max-w-md mx-auto">
                          <input type="text" value={cashAppInput} onChange={(e) => setCashAppInput(e.target.value)} placeholder="Enter your $cashtag" className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
                          <Button onClick={() => { if (cashAppInput) { setCashApp({ linked: true, cashtag: cashAppInput.replace('$', '').toLowerCase(), btcAddress: `bc1q${Math.random().toString(36).substring(2, 12)}`, lightningAddress: `${cashAppInput.replace('$', '').toLowerCase()}@cash.app`, balance: { btc: 0.00125, usd: 83.75 } }); } }} className="bg-green-600 hover:bg-green-700"><Link className="w-4 h-4 mr-2" />Link</Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center"><span className="text-white text-xl font-bold">$</span></div>
                          <div><div className="text-white font-medium">${cashApp.cashtag}</div><div className="text-green-400 text-sm">Connected</div></div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setCashApp(CASHAPP_STATE)} className="text-red-400 border-red-500/30"><Unlink className="w-4 h-4 mr-2" />Unlink</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-700/30 rounded-lg"><div className="text-gray-400 text-sm mb-1">BTC Balance</div><div className="text-2xl font-bold text-white">{cashApp.balance.btc.toFixed(8)} BTC</div></div>
                        <div className="p-4 bg-gray-700/30 rounded-lg"><div className="text-gray-400 text-sm mb-1">USD Value</div><div className="text-2xl font-bold text-white">${cashApp.balance.usd.toFixed(2)}</div></div>
                      </div>
                      <div className="space-y-3">
                        <div><label className="text-gray-400 text-sm">Bitcoin Deposit Address</label><div className="flex gap-2 mt-1"><code className="flex-1 p-2 bg-gray-900 rounded text-green-400 text-sm">{cashApp.btcAddress}</code><Button variant="outline" size="sm" className="text-gray-300"><Copy className="w-4 h-4" /></Button></div></div>
                        <div><label className="text-gray-400 text-sm">Lightning Address</label><div className="flex gap-2 mt-1"><code className="flex-1 p-2 bg-gray-900 rounded text-yellow-400 text-sm">{cashApp.lightningAddress}</code><Button variant="outline" size="sm" className="text-gray-300"><Copy className="w-4 h-4" /></Button></div></div>
                      </div>
                      <div className="border-t border-gray-700 pt-4">
                        <h4 className="text-white font-medium mb-3">Send Bitcoin</h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input type="number" value={cashAppAmount} onChange={(e) => setCashAppAmount(e.target.value)} placeholder="Amount (BTC)" className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
                            <input type="text" value={cashAppAddress} onChange={(e) => setCashAppAddress(e.target.value)} placeholder="Destination Address" className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
                          </div>
                          <input type="text" value={cashAppNote} onChange={(e) => setCashAppNote(e.target.value)} placeholder="Note (optional)" className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
                          <Button className="w-full bg-green-600 hover:bg-green-700"><Send className="w-4 h-4 mr-2" />Send Bitcoin</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="py-4">
                  <h3 className="text-white font-medium mb-3">Cash App Features</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" />Instant Bitcoin transfers</li>
                    <li className="flex items-center gap-2 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" />Lightning Network support</li>
                    <li className="flex items-center gap-2 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" />Royalty payouts to Cash App</li>
                    <li className="flex items-center gap-2 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" />Mining rewards direct</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2"><CardTitle className="text-white text-sm">Quick Convert</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-400">1 BTC</span><span className="text-white">$67,000.00</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-400">0.01 BTC</span><span className="text-white">$670.00</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-400">0.001 BTC</span><span className="text-white">$67.00</span></div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <Card className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-600">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <span className="text-gray-400">
                  <span className="text-white font-medium">5</span> Networks
                </span>
                <span className="text-gray-400">
                  <span className="text-white font-medium">4</span> Mining Algorithms
                </span>
                <span className="text-gray-400">
                  <span className="text-white font-medium">4</span> Contract Templates
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Blockchain Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlockchainMiningHub;