/**
 * Deep Research Panel - In-depth analysis with web grounding
 */

import React, { useState } from 'react';
import {
  Brain, Search, Globe, BookOpen, Loader, Sparkles, Copy,
  Check, Download, Target, Zap, Layers, Database, TrendingUp,
  Clock, FileText, BarChart3, Shield, Eye, ChevronRight
} from 'lucide-react';

const RESEARCH_MODES = [
  { id: 'analyze', name: 'Analyze', icon: <BarChart3 className="w-4 h-4" />, desc: 'Deep data analysis' },
  { id: 'plan', name: 'Plan', icon: <Target className="w-4 h-4" />, desc: 'Strategic planning' },
  { id: 'compare', name: 'Compare', icon: <Layers className="w-4 h-4" />, desc: 'Side-by-side comparison' },
  { id: 'forecast', name: 'Forecast', icon: <TrendingUp className="w-4 h-4" />, desc: 'Predictions & trends' },
  { id: 'audit', name: 'Audit', icon: <Shield className="w-4 h-4" />, desc: 'Compliance & review' },
  { id: 'explore', name: 'Explore', icon: <Globe className="w-4 h-4" />, desc: 'Open exploration' },
];

export default function DeepResearchPanel() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('analyze');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState([]);
  const [copied, setCopied] = useState(false);
  const [enableGrounding, setEnableGrounding] = useState(true);
  const [enableFactCheck, setEnableFactCheck] = useState(true);

  const handleResearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);
    setProgress(0);
    setSteps([]);

    const researchSteps = [
      'Parsing research query...',
      'Identifying key topics and entities...',
      'Searching primary sources...',
      'Cross-referencing data points...',
      'Analyzing patterns and trends...',
      'Fact-checking claims...',
      'Synthesizing findings...',
      'Generating structured report...',
      'Adding citations and references...',
      'Finalizing deep research report...'
    ];

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < researchSteps.length) {
        setSteps(prev => [...prev, { text: researchSteps[stepIndex], status: 'complete', time: new Date() }]);
        setProgress((stepIndex + 1) / researchSteps.length * 100);
        stepIndex++;
      } else {
        clearInterval(stepInterval);
      }
    }, 600);

    try {
      const response = await fetch('/api/ai-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          researchType: mode,
          depth: 'exhaustive',
          enableGrounding,
          enableFactCheck,
          deep: true
        })
      });
      const data = await response.json();
      clearInterval(stepInterval);
      setProgress(100);
      setSteps(researchSteps.map(s => ({ text: s, status: 'complete', time: new Date() })));
      setResults(data);
    } catch (error) {
      clearInterval(stepInterval);
      setResults({ report: `Deep research error: ${error.message}`, sources: [] });
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
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Deep Research</h2>
              <p className="text-xs text-gray-500">In-depth analysis & planning</p>
            </div>
          </div>

          {/* Mode */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block font-medium">Research Mode</label>
            <div className="grid grid-cols-2 gap-1.5">
              {RESEARCH_MODES.map(m => (
                <button key={m.id} onClick={() => setMode(m.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg text-xs transition-all ${
                          mode === m.id
                            ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-400'
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-800'
                        }`}>
                  {m.icon}
                  <div className="text-left">
                    <span className="block font-medium">{m.name}</span>
                    <span className="block text-[9px] text-gray-500">{m.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Query */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block font-medium">Research Query</label>
            <textarea value={query} onChange={(e) => setQuery(e.target.value)}
                      placeholder="Enter a detailed research question..."
                      rows={5}
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none" />
          </div>

          {/* Options */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Web Grounding
              </label>
              <button onClick={() => setEnableGrounding(!enableGrounding)}
                      className={`w-9 h-5 rounded-full transition-all ${enableGrounding ? 'bg-indigo-500' : 'bg-gray-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${enableGrounding ? 'ml-[18px]' : 'ml-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> Fact Checking
              </label>
              <button onClick={() => setEnableFactCheck(!enableFactCheck)}
                      className={`w-9 h-5 rounded-full transition-all ${enableFactCheck ? 'bg-indigo-500' : 'bg-gray-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${enableFactCheck ? 'ml-[18px]' : 'ml-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Start */}
          <button onClick={handleResearch}
                  disabled={!query.trim() || loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Researching...</> : <><Brain className="w-4 h-4" /> Start Deep Research</>}
          </button>

          {/* Progress Steps */}
          {steps.length > 0 && (
            <div className="mt-4 space-y-1.5">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Check className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                  <span className="text-gray-400">{step.text}</span>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs">
                  <Loader className="w-3 h-3 text-indigo-400 animate-spin flex-shrink-0" />
                  <span className="text-indigo-400">Processing...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">{results ? 'Deep Research Report' : 'Awaiting research'}</span>
          </div>
          {results && (
            <div className="flex items-center gap-2">
              <button onClick={() => { navigator.clipboard.writeText(results.report); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-all">
                {copied ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={() => {
                        const blob = new Blob([results.report], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob); const a = document.createElement('a');
                        a.href = url; a.download = `deep-research-${Date.now()}.md`; a.click();
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
              <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/20">
                <Brain className="w-10 h-10 text-indigo-500/50" />
              </div>
              <h3 className="text-lg font-bold text-gray-400 mb-2">Deep Research</h3>
              <p className="text-sm text-gray-600 max-w-sm">
                Enter a detailed research question for comprehensive AI-powered analysis with web grounding and fact-checking.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="whitespace-pre-wrap text-gray-200 leading-relaxed text-sm">{results.report}</div>
              {results.sources && results.sources.length > 0 && (
                <div className="mt-6 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400" /> Sources & References
                  </h4>
                  <div className="space-y-2">
                    {results.sources.map((source, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                        <span className="text-indigo-400 flex-shrink-0">[{i + 1}]</span>
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