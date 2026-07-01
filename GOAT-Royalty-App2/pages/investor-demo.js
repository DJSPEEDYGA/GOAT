/**
 * Investor Demo Page
 * Complete showcase of all GOAT Force capabilities
 */

import React, { useState } from 'react';
import GeminiAIPanel from '../components/GeminiAIPanel';
import CodexEnginePanel from '../components/CodexEnginePanel';
import SuperNinjaPanel from '../components/SuperNinjaPanel';
import InvestorAnalyticsDashboard from '../components/InvestorAnalyticsDashboard';
import RealDataDashboard from '../components/RealDataDashboard';
import { Crown, Zap, Globe, Shield, TrendingUp, Users } from 'lucide-react';

export default function InvestorDemo() {
  const [activeView, setActiveView] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
      {/* Navigation */}
      <nav className="bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-10 h-10 text-yellow-500" />
              <div>
                <h1 className="text-2xl font-black text-white">GOAT FORCE</h1>
                <p className="text-gray-400 text-xs">Investor Demonstration</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeView === 'overview'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeView === 'analytics'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveView('ai')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeView === 'ai'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                AI Features
              </button>
              <button
                onClick={() => setActiveView('catalog')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeView === 'catalog'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Real Data
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-6xl font-black text-white mb-4">
                The Future of Music Royalty Management
              </h1>
              <p className="text-2xl text-gray-400 mb-8">
                AI-Powered • Global Coverage • Real-Time Tracking
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
                  <Zap className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-white font-bold text-xl mb-2">AI-First</h3>
                  <p className="text-gray-400 text-sm">Gemini AI, Codex Engine, Super Ninja automation</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-md border border-blue-500/30 rounded-xl p-6">
                  <Globe className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-white font-bold text-xl mb-2">Global</h3>
                  <p className="text-gray-400 text-sm">47 platforms, 150+ countries, real-time monitoring</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 backdrop-blur-md border border-green-500/30 rounded-xl p-6">
                  <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h3 className="text-white font-bold text-xl mb-2">Growing</h3>
                  <p className="text-gray-400 text-sm">156% MoM growth, $2.5M+ revenue tracked</p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
                <p className="text-5xl font-black text-white mb-2">$2.5M+</p>
                <p className="text-gray-400">Revenue Tracked</p>
              </div>
              <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
                <p className="text-5xl font-black text-white mb-2">1,247</p>
                <p className="text-gray-400">Active Artists</p>
              </div>
              <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
                <p className="text-5xl font-black text-white mb-2">47</p>
                <p className="text-gray-400">Platforms</p>
              </div>
              <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
                <p className="text-5xl font-black text-white mb-2">94%</p>
                <p className="text-gray-400">AI Accuracy</p>
              </div>
            </div>

            {/* Problem & Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-red-900/20 backdrop-blur-md border border-red-500/30 rounded-xl p-8">
                <h2 className="text-3xl font-bold text-white mb-4">The Problem</h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Artists lose 30-40% of royalties to inefficiency and fraud</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Manual tracking is time-consuming and error-prone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>No unified platform for global royalty management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Copyright infringement goes undetected</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-900/20 backdrop-blur-md border border-green-500/30 rounded-xl p-8">
                <h2 className="text-3xl font-bold text-white mb-4">Our Solution</h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>AI-powered automated tracking across all platforms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Real-time copyright detection and enforcement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>One platform for all revenue streams globally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Blockchain-verified IP protection</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Team */}
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">Leadership Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Crown className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Harvey L. Miller Jr.</h3>
                  <p className="text-yellow-500 font-semibold mb-2">CEO - GOAT Force</p>
                  <p className="text-gray-400 text-sm">President - BrickSquad | The Gangsta Nerd | Minister of Music</p>
                </div>

                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Shield className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Juaquin James Malphurs</h3>
                  <p className="text-red-500 font-semibold mb-2">President - GOAT Force</p>
                  <p className="text-gray-400 text-sm">CEO - BrickSquad | Waka Flocka Flame | The Royalty Enforcer</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'analytics' && <InvestorAnalyticsDashboard />}

        {activeView === 'ai' && (
          <div className="space-y-8">
            <GeminiAIPanel />
            <CodexEnginePanel />
            <SuperNinjaPanel />
          </div>
        )}

        {activeView === 'catalog' && <RealDataDashboard />}
      </div>
    </div>
  );
}