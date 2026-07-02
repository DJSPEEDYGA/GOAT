/**
 * GOAT Royalty App - Ms Vanessa AI Assistant Component
 * Smart and loyal AI assistant powered by OpenAI GPT-4
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Crown, Music, DollarSign, Shield, TrendingUp } from 'lucide-react';

const MsVanessaAI = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm Ms Vanessa, your smart and loyal AI assistant for the GOAT Royalty App. I'm here to help you manage your music publishing, track royalties, and maximize your revenue. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { icon: Music, text: 'Track Royalties', action: 'track_royalties' },
    { icon: DollarSign, text: 'Revenue Analysis', action: 'revenue_analysis' },
    { icon: Shield, text: 'IP Protection', action: 'ip_protection' },
    { icon: TrendingUp, text: 'Performance Insights', action: 'performance_insights' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickAction = (action) => {
    const actionMessages = {
      track_royalties: "Can you show me my current royalty tracking data and earnings across all platforms?",
      revenue_analysis: "Please provide a comprehensive analysis of my revenue streams and suggest optimization strategies.",
      ip_protection: "What IP protection measures should I implement for my music catalog?",
      performance_insights: "Give me insights on my top performing tracks and audience engagement metrics."
    };

    setInputMessage(actionMessages[action]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // For development, simulate a response
      // In production, this would call your Ms Vanessa backend
      setTimeout(() => {
        const assistantResponse = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `I'm analyzing your request: "${userMessage.content}". Based on your GOAT Royalty App data, I can see you have promising revenue opportunities. Your catalog shows strong performance across streaming platforms. Would you like me to generate a detailed report or focus on a specific aspect of your royalty management?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantResponse]);
        setIsLoading(false);
      }, 1500);

      // Uncomment for production use with real backend:
      /*
      const response = await fetch('/api/ms-vanessa/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage })
      });

      const data = await response.json();
      
      const assistantResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantResponse]);
      setIsLoading(false);
      */
    } catch (error) {
      console.error('Error sending message to Ms Vanessa:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-purple-400 mr-2" />
            <h1 className="text-4xl font-bold text-white">Ms Vanessa AI Assistant</h1>
            <Sparkles className="w-8 h-8 text-purple-400 ml-2 animate-pulse" />
          </div>
          <p className="text-white/70 text-lg">Your smart and loyal AI companion for music royalty management</p>
        </div>

        {/* Chat Container */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-lg px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-600 to-pink-600 text-white'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500-500 to-green-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-3 justify-start">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="goat-gradient-card goat-gradient-card goat-card-hover/10 text-white border border-white/20 px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 border-t border-white/10">
            <p className="text-white/70 text-sm mb-3">Quick Actions:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className="flex flex-col items-center p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 border border-white/10"
                  >
                    <Icon className="w-5 h-5 text-purple-400 mb-1" />
                    <span className="text-white/80 text-xs">{action.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Area */}
          <div className="px-6 py-4 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Ms Vanessa about royalties, analytics, or anything else..."
                className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="p-3 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="goat-gradient-card goat-gradient-card goat-card-hover/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <Crown className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Smart Analytics</h3>
            <p className="text-white/70">Get intelligent insights about your royalty earnings and performance metrics</p>
          </div>
          
          <div className="goat-gradient-card goat-gradient-card goat-card-hover/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <Shield className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">IP Protection</h3>
            <p className="text-white/70">Advanced guidance on protecting your intellectual property and music rights</p>
          </div>
          
          <div className="goat-gradient-card goat-gradient-card goat-card-hover/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <TrendingUp className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Revenue Optimization</h3>
            <p className="text-white/70">Strategic advice to maximize your music revenue across all platforms</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MsVanessaAI;