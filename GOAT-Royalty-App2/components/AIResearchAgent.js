/**
 * AI Research Agent - Multi-source research with citations
 */

import React, { useState } from 'react';
import {
  Search, Globe, BookOpen, FileText, Loader, Sparkles, Copy,
  Check, Download, ExternalLink, Clock, BarChart3, TrendingUp,
  Layers, Database, Target, Zap, ChevronDown, Filter, Star
} from 'lucide-react';

const RESEARCH_TYPES = [
  { id: 'comprehensive', name: 'Comprehensive', icon: '🔍', desc: 'Full multi-source analysis' },
  { id: 'market', name: 'Market Research', icon: '📊', desc: 'Industry & market analysis' },
  { id: 'competitive', name: 'Competitive', icon: '⚔️', desc: 'Competitor analysis' },
  { id: 'trend', name: 'Trend Analysis', icon: '📈', desc: 'Emerging trends & patterns' },
  { id: 'legal', name: 'Legal Research', icon: '⚖️', desc: 'Laws, regulations, IP' },
  { id: 'technical', name: 'Technical', icon: '🔧', desc: 'Technology & engineering' },
  { id: 'financial', name: 'Financial', icon: '💰', desc: 'Revenue & financial analysis' },
  { id: 'audience', name: 'Audience', icon: '👥', desc: 'Demographics & behavior' },
];

const DEPTH_LEVELS = [
  { id: 'quick', name: 'Quick Scan', time: '~30s', sources: '3-5' },
  { id: 'standard', name: 'Standard', time: '~2min', sources: '8-12' },
  { id: 'deep', name: 'Deep Dive', time: '~5min', sources: '15-25' },
  { id: 'exhaustive', name: 'Exhaustive', time: '~10min', sources: '30+' },
];

export default function AIResearchAgent() {
  const [query, setQuery] = useState('');
  const [researchType, setResearchType] = useState('comprehensive');
  const [depth, setDepth] = useState('standard');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const handleResearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) { clearInterval(progressInterval); return 90; }
        const steps = ['Searching sources...', 'Analyzing data...', 'Cross-referencing...', 'Generating insights...', 'Compiling report...'];
        setCurrentStep(steps[Math.floor(prev / 20)] || 'Finalizing...');
        return prev + Math.random() * 15;
      });
    }, 800);

    try {
      const response = await fetch('/api/ai-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, researchType, depth })
      });
      const data = await response.json();
      clearInterval(progressInterval);
      setProgress(100);
      setCurrentStep('Complete!');
      
      if (data.report) {
        setResults(data);
      }
    } catch (error) {
      clearInterval(progressInterval);
      setResults({ report: `Research error: ${error.message}`, sources: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-gray-950">
      {/* Left Panel */}
      <div className="w-96 bg-gray-900/50 border-r border-gray-800 flex flex-col overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Research Agent</h2>
              <p className="text-xs text-gray-500">Deep research with citations</p>
            </div>
          </div>

          {/* Research Type */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block font-medium">Research Type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {RESEARCH_TYPES.map(rt => (
                <button key={rt.id} onClick={() => setResearchType(rt.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all ${
                          researchType === rt.id
                            ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400'
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-800'
                        }`}>
                  <span>{rt.icon}</span>
                  <div className="text-left">
                    <span className="block font-medium">{rt.name}</span>
                    <span className="block text-[9px] text-gray-500">{rt.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Query */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block font-medium">Research Query</label>
            <textarea value={query} onChange={(e) => setQuery(e.target.value)}
                      placeholder="What would you like to research?"
                      rows={4}
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 resize-none" />
          </div>

          {/* Depth */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block font-medium">Research Depth</label>
            <div className="grid grid-cols-2 gap-1.5">
              {DEPTH_LEVELS.map(d => (
                <button key={d.id} onClick={() => setDepth(d.id)}
                        className={`p-2 rounded-lg text-center transition-all ${
                          depth === d.id
                            ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400'
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-800'
                        }`}>
                  <span className="text-xs block font-medium">{d.name}</span>
                  <span className="text-[9px] block text-gray-500">{d.time} • {d.sources} sources</span>
                </button>
              ))}
            </div>
          </div>

          {/* Research Button */}
          <button onClick={handleResearch}
                  disabled={!query.trim() || loading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Researching...</> : <><Search className="w-4 h-4" /> Start Research</>}
          </button>

          {/* Progress */}
          {loading && (
            <div className="mt-4 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{currentStep}</span>
                <span className="text-xs text-orange-400 font-mono">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                     style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">{results ? 'Research Report' : 'No research yet'}</span>
          </div>
          {results && (
            <div className="flex items-center gap-2">
              <button onClick={() => { navigator.clipboard.writeText(results.report); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-all">
                {copied ? <Check className="w-3.5 h-3.5 text-orange-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={() => {
                        const blob = new Blob([results.report], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url;
                        a.download = `research-${Date.now()}.md`; a.click();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-all">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!results ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 border border-orange-500/20">
                <Search className="w-10 h-10 text-orange-500/50" />
              </div>
              <h3 className="text-lg font-bold text-gray-400 mb-2">Ready to Research</h3>
              <p className="text-sm text-gray-600 max-w-sm">
                Enter a research query and select the type and depth for comprehensive AI-powered analysis.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="whitespace-pre-wrap text-gray-200 leading-relaxed text-sm">{results.report}</div>
              {results.sources && results.sources.length > 0 && (
                <div className="mt-6 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-orange-400" /> Sources
                  </h4>
                  <div className="space-y-2">
                    {results.sources.map((source, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="text-orange-400">[{i + 1}]</span>
                        <span>{source}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}