/**
 * AI Code Generator - Write, Debug & Refactor Code
 * Multi-language support with syntax highlighting and execution
 */

import React, { useState, useRef } from 'react';
import {
  Code, Play, Copy, Check, Download, Trash2, Loader, Sparkles,
  Terminal, GitBranch, Bug, RefreshCw, FileCode, ChevronDown,
  Zap, BookOpen, Settings, Eye, Layers, Database, Globe
} from 'lucide-react';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', icon: '🟨', ext: '.js' },
  { id: 'typescript', name: 'TypeScript', icon: '🔷', ext: '.ts' },
  { id: 'python', name: 'Python', icon: '🐍', ext: '.py' },
  { id: 'react', name: 'React/JSX', icon: '⚛️', ext: '.jsx' },
  { id: 'nextjs', name: 'Next.js', icon: '▲', ext: '.js' },
  { id: 'html', name: 'HTML/CSS', icon: '🌐', ext: '.html' },
  { id: 'sql', name: 'SQL', icon: '🗄️', ext: '.sql' },
  { id: 'bash', name: 'Shell/Bash', icon: '💻', ext: '.sh' },
  { id: 'rust', name: 'Rust', icon: '🦀', ext: '.rs' },
  { id: 'go', name: 'Go', icon: '🔵', ext: '.go' },
  { id: 'solidity', name: 'Solidity', icon: '💎', ext: '.sol' },
  { id: 'swift', name: 'Swift', icon: '🍎', ext: '.swift' },
];

const CODE_ACTIONS = [
  { id: 'generate', name: 'Generate Code', icon: <Sparkles className="w-4 h-4" />, desc: 'Create new code from description' },
  { id: 'debug', name: 'Debug & Fix', icon: <Bug className="w-4 h-4" />, desc: 'Find and fix bugs in code' },
  { id: 'refactor', name: 'Refactor', icon: <RefreshCw className="w-4 h-4" />, desc: 'Improve code quality' },
  { id: 'explain', name: 'Explain Code', icon: <BookOpen className="w-4 h-4" />, desc: 'Get detailed explanation' },
  { id: 'optimize', name: 'Optimize', icon: <Zap className="w-4 h-4" />, desc: 'Performance optimization' },
  { id: 'test', name: 'Write Tests', icon: <Check className="w-4 h-4" />, desc: 'Generate unit tests' },
  { id: 'document', name: 'Document', icon: <FileCode className="w-4 h-4" />, desc: 'Add documentation' },
  { id: 'convert', name: 'Convert', icon: <Layers className="w-4 h-4" />, desc: 'Convert between languages' },
];

export default function AICodeGenerator() {
  const [prompt, setPrompt] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [action, setAction] = useState('generate');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [history, setHistory] = useState([]);
  const [explanation, setExplanation] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim() && !codeInput.trim()) return;
    setLoading(true);
    setCodeOutput('');
    setExplanation('');

    try {
      const response = await fetch('/api/ai-code-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          code: codeInput,
          language,
          action,
        })
      });

      const data = await response.json();
      if (data.code) {
        setCodeOutput(data.code);
        if (data.explanation) setExplanation(data.explanation);
        setHistory([{ prompt, code: data.code, language, action, timestamp: new Date() }, ...history.slice(0, 19)]);
      }
    } catch (error) {
      setCodeOutput(`// Error generating code: ${error.message}\n// Please check your API configuration and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const lang = LANGUAGES.find(l => l.id === language);
    const blob = new Blob([codeOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-code${lang?.ext || '.txt'}`;
    a.click();
  };

  const selectedLang = LANGUAGES.find(l => l.id === language);

  return (
    <div className="flex h-full bg-gray-950">
      {/* Left Panel - Input */}
      <div className="w-96 bg-gray-900/50 border-r border-gray-800 flex flex-col overflow-y-auto">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Code Generator</h2>
              <p className="text-xs text-gray-500">Write, debug & refactor code</p>
            </div>
          </div>

          {/* Action Selector */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block font-medium">Action</label>
            <div className="grid grid-cols-2 gap-1.5">
              {CODE_ACTIONS.map(a => (
                <button key={a.id}
                        onClick={() => setAction(a.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all ${
                          action === a.id
                            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-800'
                        }`}>
                  {a.icon}
                  <span>{a.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language Selector */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block font-medium">Language</label>
            <div className="grid grid-cols-3 gap-1.5">
              {LANGUAGES.map(lang => (
                <button key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={`flex items-center gap-1.5 p-2 rounded-lg text-xs transition-all ${
                          language === lang.id
                            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-800'
                        }`}>
                  <span>{lang.icon}</span>
                  <span className="truncate">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block font-medium">
              {action === 'generate' ? 'Describe what you want to build' : 'Describe what to do'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={action === 'generate' 
                ? 'Create a React component that...' 
                : 'Fix the bug in this code that...'}
              rows={3}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 resize-none"
            />
          </div>

          {/* Code Input (for debug/refactor/explain) */}
          {action !== 'generate' && (
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1 block font-medium">Paste Your Code</label>
              <textarea
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Paste your code here..."
                rows={8}
                className="w-full px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-xs text-green-400 placeholder-gray-600 focus:outline-none focus:border-green-500/50 resize-none font-mono"
              />
            </div>
          )}

          {/* Generate Button */}
          <button onClick={handleGenerate}
                  disabled={(!prompt.trim() && !codeInput.trim()) || loading}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
            {loading ? (
              <><Loader className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> {CODE_ACTIONS.find(a => a.id === action)?.name}</>
            )}
          </button>
        </div>
      </div>

      {/* Right Panel - Output */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Output Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedLang?.icon}</span>
            <span className="text-sm font-medium text-white">{selectedLang?.name}</span>
            <span className="text-xs text-gray-500">• {CODE_ACTIONS.find(a => a.id === action)?.name}</span>
          </div>
          {codeOutput && (
            <div className="flex items-center gap-2">
              <button onClick={() => copyCode(codeOutput)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-all">
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={downloadCode}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-all">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          )}
        </div>

        {/* Code Output */}
        <div className="flex-1 overflow-y-auto">
          {!codeOutput ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4 border border-green-500/20">
                <Code className="w-10 h-10 text-green-500/50" />
              </div>
              <h3 className="text-lg font-bold text-gray-400 mb-2">Ready to Code</h3>
              <p className="text-sm text-gray-600 max-w-sm">
                Describe what you want to build or paste code to debug, refactor, or optimize.
              </p>
            </div>
          ) : (
            <div className="p-4">
              {/* Code Block */}
              <div className="rounded-xl overflow-hidden border border-gray-700/50 mb-4">
                <div className="flex items-center justify-between bg-gray-900 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                    </div>
                    <span className="text-xs text-gray-500 font-mono ml-2">
                      generated{selectedLang?.ext}
                    </span>
                  </div>
                </div>
                <pre className="bg-gray-950 p-4 overflow-x-auto text-sm font-mono text-green-400 leading-relaxed whitespace-pre-wrap">
                  {codeOutput}
                </pre>
              </div>

              {/* Explanation */}
              {explanation && (
                <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-green-400" /> Explanation
                  </h4>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}