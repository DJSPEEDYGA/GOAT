import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, Zap, Brain, TrendingUp } from 'lucide-react';

const SuperNinjaAI = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m SuperNinja AI, your intelligent assistant for royalty management. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const quickActions = [
    { icon: <TrendingUp className="w-4 h-4" />, label: 'Analyze Performance', color: 'bg-green-500/20 text-green-400' },
    { icon: <Brain className="w-4 h-4" />, label: 'Predict Earnings', color: 'bg-blue-500/20 text-blue-400' },
    { icon: <Zap className="w-4 h-4" />, label: 'Optimize Strategy', color: 'bg-purple-500/20 text-purple-400' },
    { icon: <MessageSquare className="w-4 h-4" />, label: 'Generate Report', color: 'bg-orange-500/20 text-orange-400' }
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, 
      { role: 'user', content: input },
      { role: 'assistant', content: 'I understand your request. Let me analyze that for you...' }
    ]);
    setInput('');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Sparkles className="w-5 h-5" />
            SuperNinja AI - Intelligent Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className={action.color}
              >
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">AI Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 h-[400px] overflow-y-auto">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything about your royalties..."
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                />
                <Button onClick={handleSend} className="bg-yellow-600 hover:bg-yellow-700">
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-green-400 font-medium mb-1">Revenue Opportunity</div>
                <div className="text-gray-300">Your track "Summer Vibes" could earn 15% more with playlist placement</div>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-blue-400 font-medium mb-1">Trending Alert</div>
                <div className="text-gray-300">"Midnight Dreams" is gaining traction in Europe</div>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="text-purple-400 font-medium mb-1">Contract Reminder</div>
                <div className="text-gray-300">Publishing agreement expires in 30 days</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Performance Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-400" />
                <span>Earnings Prediction</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span>Strategy Optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>Report Generation</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SuperNinjaAI;