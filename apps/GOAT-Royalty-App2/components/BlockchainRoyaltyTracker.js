/**
 * GOAT Royalty App — Blockchain Royalty Tracker
 * Smart contract-based royalty tracking and distribution
 * 
 * Features: Smart contracts, real-time tracking, crypto payments,
 * transparent splits, immutable records, mining dashboard
 */

import React, { useState, useEffect } from 'react';
import {
  Shield, Link2, Coins, TrendingUp, Clock, Users,
  FileText, CheckCircle, AlertTriangle, Copy, ExternalLink,
  Zap, Lock, Eye, Activity, DollarSign, ArrowUpRight,
  ArrowDownRight, Wallet, PieChart, BarChart3, Cpu,
  ChevronDown, ChevronUp, RefreshCw, Search, Filter
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// SMART CONTRACT CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════

const SMART_CONTRACTS = {
  royaltyDistribution: {
    name: 'GOAT Royalty Distribution',
    address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    network: 'Polygon',
    version: '2.1.0',
    status: 'active',
    totalDistributed: 847293.42,
    transactions: 15847,
    gasEfficiency: '98.7%',
    features: ['Auto-split payments', 'Multi-token support', 'Gasless meta-txns', 'Time-locked releases'],
  },
  catalogRegistry: {
    name: 'GOAT Catalog Registry',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    network: 'Polygon',
    version: '1.5.0',
    status: 'active',
    totalRegistered: 2847,
    ipfsStored: 2341,
    features: ['ISRC on-chain', 'IPFS metadata', 'Ownership proof', 'Transfer history'],
  },
  licensingEngine: {
    name: 'GOAT Licensing Engine',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    network: 'Polygon',
    version: '1.2.0',
    status: 'active',
    activeLicenses: 342,
    totalRevenue: 125840.00,
    features: ['Sync licensing', 'Mechanical licenses', 'Auto-renewal', 'Usage tracking'],
  },
};

const SOLIDITY_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title GOATRoyaltyDistribution
 * @dev Transparent royalty distribution for music rights holders
 * @author GOAT Force Engineering — Harvey L. Miller Jr.
 */
contract GOATRoyaltyDistribution is Ownable, ReentrancyGuard {
    
    struct RoyaltySplit {
        address payable recipient;
        uint256 sharePercentage; // basis points (10000 = 100%)
        string role; // "artist", "producer", "writer", "publisher"
        bool active;
    }
    
    struct Track {
        string isrc;
        string title;
        string artist;
        string ipfsHash;
        uint256 totalEarnings;
        uint256 registeredAt;
        bool active;
    }
    
    mapping(string => Track) public tracks; // ISRC => Track
    mapping(string => RoyaltySplit[]) public splits; // ISRC => splits
    mapping(address => uint256) public pendingWithdrawals;
    
    uint256 public totalDistributed;
    uint256 public totalTracks;
    
    event TrackRegistered(string isrc, string title, address indexed owner);
    event RoyaltyDistributed(string isrc, uint256 amount, uint256 timestamp);
    event SplitUpdated(string isrc, address recipient, uint256 share);
    event Withdrawal(address indexed recipient, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    function registerTrack(
        string memory _isrc,
        string memory _title,
        string memory _artist,
        string memory _ipfsHash
    ) external onlyOwner {
        require(bytes(tracks[_isrc].isrc).length == 0, "Track exists");
        
        tracks[_isrc] = Track({
            isrc: _isrc,
            title: _title,
            artist: _artist,
            ipfsHash: _ipfsHash,
            totalEarnings: 0,
            registeredAt: block.timestamp,
            active: true
        });
        
        totalTracks++;
        emit TrackRegistered(_isrc, _title, msg.sender);
    }
    
    function setSplits(
        string memory _isrc,
        address payable[] memory _recipients,
        uint256[] memory _shares,
        string[] memory _roles
    ) external onlyOwner {
        require(_recipients.length == _shares.length, "Length mismatch");
        
        uint256 totalShares;
        delete splits[_isrc];
        
        for (uint i = 0; i < _recipients.length; i++) {
            totalShares += _shares[i];
            splits[_isrc].push(RoyaltySplit({
                recipient: _recipients[i],
                sharePercentage: _shares[i],
                role: _roles[i],
                active: true
            }));
            emit SplitUpdated(_isrc, _recipients[i], _shares[i]);
        }
        
        require(totalShares == 10000, "Splits must equal 100%");
    }
    
    function distributeRoyalties(string memory _isrc) 
        external payable nonReentrant 
    {
        require(msg.value > 0, "No payment");
        require(tracks[_isrc].active, "Track inactive");
        
        RoyaltySplit[] storage trackSplits = splits[_isrc];
        require(trackSplits.length > 0, "No splits configured");
        
        for (uint i = 0; i < trackSplits.length; i++) {
            if (trackSplits[i].active) {
                uint256 payment = (msg.value * trackSplits[i].sharePercentage) / 10000;
                pendingWithdrawals[trackSplits[i].recipient] += payment;
            }
        }
        
        tracks[_isrc].totalEarnings += msg.value;
        totalDistributed += msg.value;
        
        emit RoyaltyDistributed(_isrc, msg.value, block.timestamp);
    }
    
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        
        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        
        emit Withdrawal(msg.sender, amount);
    }
}`;

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════

const RECENT_TRANSACTIONS = [
  { id: 'tx1', type: 'distribution', amount: 1245.00, token: 'USDC', from: 'Spotify Royalties', to: 'GOAT Contract', hash: '0x8f2d...4e7a', time: '5 min ago', status: 'confirmed' },
  { id: 'tx2', type: 'withdrawal', amount: 847.50, token: 'USDC', from: 'GOAT Contract', to: 'Harvey Miller', hash: '0x3b1c...9d2f', time: '2 hrs ago', status: 'confirmed' },
  { id: 'tx3', type: 'registration', amount: 0, token: '-', from: 'Harvey Miller', to: 'Catalog Registry', hash: '0x7e4a...1c8b', time: '6 hrs ago', status: 'confirmed' },
  { id: 'tx4', type: 'distribution', amount: 2340.00, token: 'USDC', from: 'Apple Music', to: 'GOAT Contract', hash: '0x1f9a...5e3d', time: '1 day ago', status: 'confirmed' },
  { id: 'tx5', type: 'license', amount: 5000.00, token: 'USDC', from: 'Sync License', to: 'GOAT Contract', hash: '0x9c2e...7b4f', time: '2 days ago', status: 'confirmed' },
];

const WALLET_STATS = {
  totalBalance: 24847.32,
  pendingRoyalties: 3420.18,
  monthlyRevenue: 8934.50,
  monthlyChange: 12.4,
  weeklyTransactions: 47,
  gasSpent: 12.84,
};

const MINING_STATS = {
  hashRate: '142.5 MH/s',
  dailyReward: 0.0234,
  totalMined: 1.847,
  powerUsage: '320W',
  temperature: '67°C',
  uptime: '99.7%',
  pool: 'GOAT Mining Pool',
  workers: 3,
  algorithm: 'Ethash',
  difficulty: '12.4T',
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function BlockchainRoyaltyTracker() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showContract, setShowContract] = useState(false);
  const [selectedContract, setSelectedContract] = useState('royaltyDistribution');
  const [walletConnected, setWalletConnected] = useState(false);
  const [showMining, setShowMining] = useState(false);

  const connectWallet = () => {
    setWalletConnected(true);
  };

  // ═══════════════════════════════════════════════════════════════
  // STAT CARD
  // ═══════════════════════════════════════════════════════════════
  const StatCard = ({ icon: Icon, label, value, change, color = '#6366f1' }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-xl" style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // TRANSACTION ROW
  // ═══════════════════════════════════════════════════════════════
  const TransactionRow = ({ tx }) => {
    const typeColors = {
      distribution: '#10b981',
      withdrawal: '#6366f1',
      registration: '#f59e0b',
      license: '#ec4899',
    };

    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: `${typeColors[tx.type]}15` }}>
            {tx.type === 'distribution' && <ArrowDownRight size={16} style={{ color: typeColors[tx.type] }} />}
            {tx.type === 'withdrawal' && <ArrowUpRight size={16} style={{ color: typeColors[tx.type] }} />}
            {tx.type === 'registration' && <FileText size={16} style={{ color: typeColors[tx.type] }} />}
            {tx.type === 'license' && <Shield size={16} style={{ color: typeColors[tx.type] }} />}
          </div>
          <div>
            <p className="text-sm font-semibold capitalize">{tx.type}</p>
            <p className="text-xs text-gray-500">{tx.from} → {tx.to}</p>
          </div>
        </div>
        <div className="text-right">
          {tx.amount > 0 && (
            <p className={`text-sm font-bold ${tx.type === 'withdrawal' ? 'text-green-500' : ''}`}>
              {tx.type === 'withdrawal' ? '+' : ''}{tx.amount.toLocaleString()} {tx.token}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{tx.time}</span>
            <span className="font-mono">{tx.hash}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Link2 size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight">Blockchain Royalty Tracker</h1>
                <p className="text-gray-300 mt-1">Transparent, immutable royalty distribution on Polygon</p>
              </div>
            </div>
            <button
              onClick={connectWallet}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                walletConnected
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              <Wallet size={18} />
              {walletConnected ? '0x7a25...488D Connected' : 'Connect Wallet'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <StatCard icon={DollarSign} label="Total Balance" value={`$${WALLET_STATS.totalBalance.toLocaleString()}`} change={WALLET_STATS.monthlyChange} color="#10b981" />
            <StatCard icon={Clock} label="Pending Royalties" value={`$${WALLET_STATS.pendingRoyalties.toLocaleString()}`} color="#f59e0b" />
            <StatCard icon={TrendingUp} label="Monthly Revenue" value={`$${WALLET_STATS.monthlyRevenue.toLocaleString()}`} change={WALLET_STATS.monthlyChange} color="#6366f1" />
            <StatCard icon={Activity} label="Weekly Transactions" value={WALLET_STATS.weeklyTransactions} color="#ec4899" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: <PieChart size={16} /> },
            { id: 'contracts', label: 'Smart Contracts', icon: <FileText size={16} /> },
            { id: 'transactions', label: 'Transactions', icon: <Activity size={16} /> },
            { id: 'mining', label: 'Mining Dashboard', icon: <Cpu size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Smart Contract Cards */}
            <h2 className="text-xl font-bold">Active Smart Contracts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(SMART_CONTRACTS).map(([key, contract]) => (
                <div key={key} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">{contract.name}</h3>
                    <span className="flex items-center gap-1 text-green-500 text-xs font-semibold">
                      <CheckCircle size={12} /> {contract.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Network</span>
                      <span className="font-mono text-xs">{contract.network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Version</span>
                      <span>{contract.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Address</span>
                      <span className="font-mono text-xs">{contract.address.slice(0, 10)}...{contract.address.slice(-4)}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap gap-1">
                      {contract.features.map((f, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Transactions */}
            <h2 className="text-xl font-bold mt-8">Recent Transactions</h2>
            <div className="space-y-3">
              {RECENT_TRANSACTIONS.slice(0, 5).map(tx => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          </div>
        )}

        {/* Smart Contracts Tab */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Smart Contract Source Code</h2>
              <button
                onClick={() => setShowContract(!showContract)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Eye size={14} /> {showContract ? 'Hide' : 'View'} Solidity Code
              </button>
            </div>

            {showContract && (
              <div className="bg-gray-900 rounded-2xl p-6 overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-green-400 text-sm font-mono">GOATRoyaltyDistribution.sol</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(SOLIDITY_CONTRACT)}
                    className="flex items-center gap-1 text-gray-400 hover:text-white text-xs"
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
                <pre className="text-sm text-gray-300 font-mono whitespace-pre overflow-x-auto leading-relaxed">
                  {SOLIDITY_CONTRACT}
                </pre>
              </div>
            )}

            {/* Contract Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(SMART_CONTRACTS).map(([key, contract]) => (
                <div key={key} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-bold text-lg mb-4">{contract.name}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Contract Address</span>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {contract.address}
                        </code>
                        <button onClick={() => navigator.clipboard.writeText(contract.address)}>
                          <Copy size={12} className="text-gray-400 hover:text-blue-500" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Distributed</span>
                      <span className="font-bold">${contract.totalDistributed?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Transactions</span>
                      <span>{contract.transactions?.toLocaleString() || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">All Transactions</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by hash..."
                    className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm">
                  <Filter size={14} /> Filter
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {RECENT_TRANSACTIONS.map(tx => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          </div>
        )}

        {/* Mining Dashboard Tab */}
        {activeTab === 'mining' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">⛏️ Crypto Mining Dashboard</h2>
              <span className="flex items-center gap-2 text-green-500 text-sm font-semibold">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Mining Active
              </span>
            </div>

            {/* Mining Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-yellow-500" />
                  <span className="text-xs text-gray-500">Hash Rate</span>
                </div>
                <p className="text-2xl font-black">{MINING_STATS.hashRate}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Coins size={16} className="text-green-500" />
                  <span className="text-xs text-gray-500">Daily Reward</span>
                </div>
                <p className="text-2xl font-black">{MINING_STATS.dailyReward} ETH</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={16} className="text-blue-500" />
                  <span className="text-xs text-gray-500">Total Mined</span>
                </div>
                <p className="text-2xl font-black">{MINING_STATS.totalMined} ETH</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className="text-red-500" />
                  <span className="text-xs text-gray-500">Uptime</span>
                </div>
                <p className="text-2xl font-black">{MINING_STATS.uptime}</p>
              </div>
            </div>

            {/* Mining Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-bold text-lg mb-4">Mining Configuration</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Algorithm</span><span className="font-mono">{MINING_STATS.algorithm}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Pool</span><span>{MINING_STATS.pool}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Workers</span><span>{MINING_STATS.workers}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Difficulty</span><span className="font-mono">{MINING_STATS.difficulty}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Power Usage</span><span>{MINING_STATS.powerUsage}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Temperature</span><span>{MINING_STATS.temperature}</span></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-bold text-lg mb-4">Worker Status</h3>
                <div className="space-y-3">
                  {['GPU-Rig-01', 'GPU-Rig-02', 'CPU-Worker-01'].map((worker, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-semibold">{worker}</span>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>{(47.5 + idx * 15).toFixed(1)} MH/s</p>
                        <p>{63 + idx * 4}°C</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}