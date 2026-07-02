/**
 * 📄 Ingeta conChord Integration - GOAT Royalty App
 * Music Contracts, Rights & Royalty Management
 */

import React, { useState } from 'react';
import {
  FileText, Shield, DollarSign, Users, Calendar,
  TrendingUp, CheckCircle, AlertTriangle, Settings,
  Download, Upload, Search, Filter, Eye, Edit,
  BookOpen, Crown, Zap, Lock, Unlock, Globe, Building2
} from 'lucide-react';

const ConChordIntegration = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedContract, setSelectedContract] = useState(null);

  // Dashboard Stats
  const dashboardStats = {
    totalContracts: 247,
    activeContracts: 189,
    pendingApprovals: 12,
    totalRights: 1563,
    royaltyStatements: 89,
    thisMonthRoyalties: '$423,450'
  };

  // Contract Types
  const contractTypes = [
    { name: 'Artist Contracts', count: 45, icon: Users },
    { name: 'Label Agreements', count: 23, icon: Building2 },
    { name: 'Licensing Deals', count: 67, icon: FileText },
    { name: 'Sync Licenses', count: 34, icon: Zap },
    { name: 'Mechanical Licenses', count: 78, icon: BookOpen }
  ];

  // Recent Contracts
  const recentContracts = [
    {
      id: 'CON-2025-001',
      type: 'Artist Contract',
      party: 'Waka Flocka Flame',
      status: 'active',
      date: '2025-01-15',
      royaltyRate: '15%',
      territory: 'Worldwide',
      term: '5 Years'
    },
    {
      id: 'CON-2025-002',
      type: 'Sync License',
      party: 'Netflix Productions',
      status: 'pending',
      date: '2025-02-20',
      royaltyRate: '12%',
      territory: 'USA',
      term: 'Perpetual'
    },
    {
      id: 'CON-2025-003',
      type: 'Label Agreement',
      party: 'Universal Music Group',
      status: 'active',
      date: '2025-01-28',
      royaltyRate: '18%',
      territory: 'Global',
      term: '7 Years'
    }
  ];

  // Rights Overview
  const rightsOverview = [
    { category: 'Mechanical Rights', count: 523, revenue: '$156,780' },
    { category: 'Performance Rights', count: 412, revenue: '$203,450' },
    { category: 'Sync Rights', count: 189, revenue: '$45,230' },
    { category: 'Print Rights', count: 89, revenue: '$12,340' },
    { category: 'Digital Rights', count: 350, revenue: '$5,650' }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="goat-gradient-card goat-card-hover p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Contracts</p>
              <p className="text-3xl font-bold text-white mt-2">{dashboardStats.totalContracts}</p>
            </div>
            <FileText className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="goat-gradient-card goat-card-hover p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Contracts</p>
              <p className="text-3xl font-bold text-white mt-2">{dashboardStats.activeContracts}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="goat-gradient-card goat-card-hover p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">This Month Royalties</p>
              <p className="text-3xl font-bold text-white mt-2">{dashboardStats.thisMonthRoyalties}</p>
            </div>
            <DollarSign className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Contract Types */}
      <div className="goat-gradient-card p-6 rounded-xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-500" />
          Contract Categories
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {contractTypes.map((type, index) => (
            <div key={index} className="bg-background p-4 rounded-lg border border-gray-700 hover:border-red-500 transition-all cursor-pointer">
              <type.icon className="w-8 h-8 text-yellow-500 mb-2" />
              <p className="text-white font-semibold">{type.count}</p>
              <p className="text-gray-400 text-sm">{type.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Contracts */}
      <div className="goat-gradient-card p-6 rounded-xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-red-500" />
          Recent Contracts
        </h3>
        <div className="space-y-3">
          {recentContracts.map((contract) => (
            <div key={contract.id} className="bg-background p-4 rounded-lg border border-gray-700 hover:border-yellow-500 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{contract.party}</p>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      contract.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      contract.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {contract.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{contract.type} • {contract.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-500 font-semibold">{contract.royaltyRate}</p>
                  <p className="text-gray-400 text-sm">{contract.territory}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContracts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Contract Repository</h3>
        <button className="goat-btn-primary goat-button-text flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Create New Contract
        </button>
      </div>

      <div className="goat-gradient-card p-6 rounded-xl">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contracts..."
              className="w-full bg-background border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-red-500 focus:outline-none"
            />
          </div>
          <button className="goat-btn-gold goat-button-text flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="space-y-3">
          {recentContracts.map((contract) => (
            <div key={contract.id} className="bg-background p-4 rounded-lg border border-gray-700 hover:border-red-500 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{contract.party}</p>
                    <p className="text-gray-400 text-sm">{contract.type} • {contract.territory}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-yellow-500 font-semibold">{contract.royaltyRate}</p>
                    <p className="text-gray-400 text-sm">{contract.term}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRights = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Rights Management</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rightsOverview.map((right, index) => (
          <div key={index} className="goat-gradient-card goat-card-hover p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-semibold text-lg">{right.category}</p>
                <p className="text-gray-400 text-sm">{right.count} rights managed</p>
              </div>
              <Shield className="w-10 h-10 text-red-500" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-yellow-500 font-bold text-xl">{right.revenue}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rights Ownership */}
      <div className="goat-gradient-card p-6 rounded-xl">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          Rights Ownership Overview
        </h4>
        <div className="space-y-3">
          <div className="bg-background p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">GOAT Force Publishing</p>
                <p className="text-gray-400 text-sm">Owned Rights: 342</p>
              </div>
              <p className="text-green-500 font-semibold">$234,560</p>
            </div>
          </div>
          <div className="bg-background p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">Harvey Miller Catalog</p>
                <p className="text-gray-400 text-sm">Owned Rights: 189</p>
              </div>
              <p className="text-green-500 font-semibold">$156,780</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRoyalties = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Royalty Tracking & Statements</h3>
        <button className="goat-btn-primary goat-button-text flex items-center gap-2">
          <Download className="w-4 h-4" />
          Generate Statement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="goat-gradient-card p-6 rounded-xl">
          <div className="flex items-center gap-3">
            <Calendar className="w-10 h-10 text-red-500" />
            <div>
              <p className="text-gray-400 text-sm">Statements Generated</p>
              <p className="text-2xl font-bold text-white">{dashboardStats.royaltyStatements}</p>
            </div>
          </div>
        </div>

        <div className="goat-gradient-card p-6 rounded-xl">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-green-500" />
            <div>
              <p className="text-gray-400 text-sm">Pending Payouts</p>
              <p className="text-2xl font-bold text-white">$87,340</p>
            </div>
          </div>
        </div>

        <div className="goat-gradient-card p-6 rounded-xl">
          <div className="flex items-center gap-3">
            <Users className="w-10 h-10 text-yellow-500" />
            <div>
              <p className="text-gray-400 text-sm">Rights Holders</p>
              <p className="text-2xl font-bold text-white">156</p>
            </div>
          </div>
        </div>
      </div>

      {/* DSP Revenue Mapping */}
      <div className="goat-gradient-card p-6 rounded-xl">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-red-500" />
          DSP Revenue Mapping
        </h4>
        <div className="space-y-3">
          <div className="bg-background p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-green-600 flex items-center justify-center text-white font-bold">S</div>
                <div>
                  <p className="text-white font-semibold">Spotify</p>
                  <p className="text-gray-400 text-sm">2.3M plays • $45,230</p>
                </div>
              </div>
              <span className="text-green-500 text-sm">+12%</span>
            </div>
          </div>
          <div className="bg-background p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-white font-bold">A</div>
                <div>
                  <p className="text-white font-semibold">Apple Music</p>
                  <p className="text-gray-400 text-sm">1.8M plays • $38,920</p>
                </div>
              </div>
              <span className="text-green-500 text-sm">+8%</span>
            </div>
          </div>
          <div className="bg-background p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-red-500 flex items-center justify-center text-white font-bold">Y</div>
                <div>
                  <p className="text-white font-semibold">YouTube Music</p>
                  <p className="text-gray-400 text-sm">1.2M plays • $21,450</p>
                </div>
              </div>
              <span className="text-green-500 text-sm">+15%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="goat-gradient-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="goat-gradient-header p-6 rounded-xl mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="goat-title text-3xl font-black text-white">
                Ingeta conChord Integration
              </h1>
              <p className="text-gray-400 mt-1">
                Music Contracts, Rights & Royalty Management
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Crown },
            { id: 'contracts', label: 'Contracts', icon: FileText },
            { id: 'rights', label: 'Rights', icon: Shield },
            { id: 'royalties', label: 'Royalties', icon: DollarSign }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-black'
                  : 'bg-background text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'contracts' && renderContracts()}
        {activeTab === 'rights' && renderRights()}
        {activeTab === 'royalties' && renderRoyalties()}

        {/* Integration Info */}
        <div className="goat-gradient-card p-6 rounded-xl mt-8">
          <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            conChord Integration Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-white font-semibold">Contract Repository</p>
                <p className="text-gray-400 text-sm">247 contracts indexed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-white font-semibold">Royalty Calculation</p>
                <p className="text-gray-400 text-sm">Automated processing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-white font-semibold">DocuSign Integration</p>
                <p className="text-gray-400 text-sm">E-signature ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConChordIntegration;