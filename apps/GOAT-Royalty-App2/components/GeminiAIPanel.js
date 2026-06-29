/**
 * Gemini AI Integration Panel
 * Real-time AI-powered royalty analysis and insights
 */

import React, { useState } from 'react';
import { Brain, Sparkles, TrendingUp, AlertCircle, CheckCircle, Zap } from 'lucide-react';

const GeminiAIPanel = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState([]);

  const runAIAnalysis = () => {
    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setInsights([
        {
          type: 'opportunity',
          icon: TrendingUp,
          title: 'Revenue Optimization Detected',
          message: 'AI identified $12,450 in unclaimed royalties from YouTube Content ID matches',
          confidence: 94,
          action: 'Claim Now'
        },
        {
          type: 'alert',
          icon: AlertCircle,
          title: 'Potential Copyright Issue',
          message: '3 unauthorized uses detected on TikTok. Estimated loss: $3,200/month',
          confidence: 87,
          action: 'Take Action'
        },
        {
          type: 'success',
          icon: CheckCircle,
          title: 'Streaming Growth Trend',
          message: 'Spotify streams up 156% this quarter. Projected annual increase: $45K',
          confidence: 91,
          action: 'View Details'
        },
        {
          type: 'insight',
          icon: Sparkles,
          title: 'Market Opportunity',
          message: 'Your catalog matches 847 sync licensing opportunities worth $2.3M',
          confidence: 89,
          action: 'Explore'
        }
      ]);
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-black/50 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Gemini AI Analysis</h3>
            <p className="text-gray-400 text-sm">Powered by Google AI</p>
          </div>
        </div>
        
        <button
          onClick={runAIAnalysis}
          disabled={analyzing}
          className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Run AI Analysis
            </>
          )}
        </button>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            const colors = {
              opportunity: 'from-green-500/20 to-green-600/10 border-green-500/30',
              alert: 'from-red-500/20 to-red-600/10 border-red-500/30',
              success: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
              insight: 'from-purple-500/20 to-purple-600/10 border-purple-500/30'
            };
            
            return (
              <div
                key={index}
                className={`bg-gradient-to-r ${colors[insight.type]} border backdrop-blur-sm rounded-lg p-4 hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-bold">{insight.title}</h4>
                      <span className="text-xs text-gray-400">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{insight.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1 bg-white/10 rounded-full h-2 mr-4">
                        <div
                          className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-500 to-pink-500 h-2 rounded-full transition-all"
                          style={{ width: `${insight.confidence}%` }}
                        ></div>
                      </div>
                      <button className="goat-gradient-card goat-gradient-card goat-card-hover/10 hover:bg-white/20 text-white px-4 py-1 rounded text-sm font-semibold transition-colors">
                        {insight.action}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {insights.length === 0 && !analyzing && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 mb-4">Click "Run AI Analysis" to get intelligent insights</p>
          <p className="text-gray-500 text-sm">AI will analyze your catalog for revenue opportunities, copyright issues, and growth trends</p>
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">$2.3M</p>
          <p className="text-gray-400 text-xs">Opportunities Found</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">847</p>
          <p className="text-gray-400 text-xs">Sync Matches</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">94%</p>
          <p className="text-gray-400 text-xs">Accuracy Rate</p>
        </div>
      </div>
    </div>
  );
};

export default GeminiAIPanel;