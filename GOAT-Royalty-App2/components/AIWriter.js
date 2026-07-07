/**
 * AI Writer - Professional Content Creation
 * Templates, tone control, SEO optimization, multi-format output
 */

import React, { useState } from 'react';
import {
  PenTool, Copy, Check, Download, Loader, Sparkles, FileText,
  BookOpen, Mail, Megaphone, Globe, Hash, Type, BarChart3,
  RefreshCw, ChevronDown, Zap, Target, Star, Eye, Layers
} from 'lucide-react';

const CONTENT_TYPES = [
  { id: 'press-release', name: 'Press Release', icon: '📰', desc: 'Official announcements' },
  { id: 'blog-post', name: 'Blog Post', icon: '📝', desc: 'Long-form articles' },
  { id: 'social-media', name: 'Social Media', icon: '📱', desc: 'Posts & captions' },
  { id: 'email', name: 'Email', icon: '📧', desc: 'Professional emails' },
  { id: 'marketing', name: 'Marketing Copy', icon: '📢', desc: 'Ad copy & landing pages' },
  { id: 'bio', name: 'Artist Bio', icon: '🎤', desc: 'Professional bios' },
  { id: 'pitch-deck', name: 'Pitch Deck', icon: '📊', desc: 'Investor presentations' },
  { id: 'contract', name: 'Legal/Contract', icon: '📋', desc: 'Legal documents' },
  { id: 'newsletter', name: 'Newsletter', icon: '📬', desc: 'Email newsletters' },
  { id: 'lyrics', name: 'Song Lyrics', icon: '🎵', desc: 'Music lyrics' },
  { id: 'script', name: 'Video Script', icon: '🎬', desc: 'Video & podcast scripts' },
  { id: 'seo', name: 'SEO Content', icon: '🔍', desc: 'Search-optimized content' },
];

const TONES = [
  { id: 'professional', name: 'Professional', emoji: '👔' },
  { id: 'casual', name: 'Casual', emoji: '😎' },
  { id: 'formal', name: 'Formal', emoji: '🎩' },
  { id: 'creative', name: 'Creative', emoji: '🎨' },
  { id: 'persuasive', name: 'Persuasive', emoji: '💪' },
  { id: 'informative', name: 'Informative', emoji: '📚' },
  { id: 'urgent', name: 'Urgent', emoji: '🔥' },
  { id: 'friendly', name: 'Friendly', emoji: '🤝' },
];

const LENGTHS = [
  { id: 'short', name: 'Short', desc: '~200 words' },
  { id: 'medium', name: 'Medium', desc: '~500 words' },
  { id: 'long', name: 'Long', desc: '~1000 words' },
  { id: 'detailed', name: 'Detailed', desc: '~2000+ words' },
];

export default function AIWriter() {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('blog-post');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [keywords, setKeywords] = useState('');
  const [audience, setAudience] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setOutput('');

    try {
      const response = await fetch('/api/ai-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, contentType, tone, length, keywords, audience })
      });
      const data = await response.json();
      if (data.content) {
        setOutput(data.content);
        setWordCount(data.content.split(/\s+/).length);
      }
    } catch (error) {
      setOutput(`Error generating content: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadContent = () => {
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contentType}-${Date.now()}.md`;
    a.click();
  };

  return (
    <div className="flex h-full bg-gray-950">
      {/* Left Panel */}
      <div className="w-96 bg-gray-900/50 border-r border-gray-800 flex flex-col overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Writer</h2>
              <p className="text-xs text-gray-500">Professional content creation</p>
            </div>
          </div>

          {/* Content Type */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block font-medium">Content Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {CONTENT_TYPES.map(ct => (
                <button key={ct.id} onClick={() => setContentType(ct.id)}
                        className={`p-2 rounded-lg text-center transition-all ${
                          contentType === ct.id
                            ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-800'
                        }`}>
                  <span className="text-base block">{ct.icon}</span>
                  <span className="text-[8px] block mt-0.5 truncate">{ct.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block font-medium">Topic / Subject</label>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)}
                      placeholder="What should the content be about?"
                      rows={3}
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none" />
          </div>

          {/* Tone */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block font-medium">Tone</label>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                          tone === t.id
                            ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-800'
                        }`}>
                  <span>{t.emoji}</span> {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block font-medium">Length</label>
            <div className="flex gap-1.5">
              {LENGTHS.map(l => (
                <button key={l.id} onClick={() => setLength(l.id)}
                        className={`flex-1 py-2 rounded-lg text-center transition-all ${
                          length === l.id
                            ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-800'
                        }`}>
                  <span className="text-xs block font-medium">{l.name}</span>
                  <span className="text-[9px] block text-gray-500">{l.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced */}
          <button onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 mb-3 transition-colors">
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            Advanced Options
          </button>

          {showAdvanced && (
            <div className="space-y-3 mb-4 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Keywords (comma-separated)</label>
                <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)}
                       placeholder="royalties, streaming, music industry"
                       className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Target Audience</label>
                <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)}
                       placeholder="Music industry professionals, artists"
                       className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50" />
              </div>
            </div>
          )}

          {/* Generate */}
          <button onClick={handleGenerate}
                  disabled={!topic.trim() || loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Writing...</> : <><PenTool className="w-4 h-4" /> Generate Content</>}
          </button>
        </div>
      </div>

      {/* Right Panel - Output */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">
              {output ? `${wordCount} words` : 'No content yet'}
            </span>
          </div>
          {output && (
            <div className="flex items-center gap-2">
              <button onClick={copyContent} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-all">
                {copied ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={downloadContent} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-all">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!output ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                <PenTool className="w-10 h-10 text-blue-500/50" />
              </div>
              <h3 className="text-lg font-bold text-gray-400 mb-2">Ready to Write</h3>
              <p className="text-sm text-gray-600 max-w-sm">
                Choose a content type, enter your topic, and let AI create professional content for you.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-200 leading-relaxed text-sm">{output}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}