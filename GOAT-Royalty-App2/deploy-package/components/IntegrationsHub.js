// Integrations Hub Component for GOAT Royalty App
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, ExternalLink, Play, Cpu, Code, 
  Video, Mic, Gamepad2, Sparkles, CheckCircle,
  ArrowRight, FileVideo, Zap, Settings
} from 'lucide-react';

const IntegrationsHub = () => {
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  const integrations = [
    {
      id: 'nvidia-workbench',
      name: 'NVIDIA AI Workbench',
      icon: <Cpu className="w-8 h-8" />,
      category: 'AI Development',
      size: '116 MB',
      status: 'ready',
      color: 'green',
      description: 'Local AI development environment for creating and testing AI models',
      features: [
        'Develop custom AI models locally',
        'Test before cloud deployment',
        'RTX-accelerated training',
        'Seamless cloud scaling'
      ],
      path: 'integrations/nvidia-workbench/NVIDIA-AI-Workbench-Setup.exe',
      docs: 'https://docs.nvidia.com/ai-workbench/'
    },
    {
      id: 'ai-copilot',
      name: 'AI Copilot (Gemini)',
      icon: <Code className="w-8 h-8" />,
      category: 'Development',
      size: '13 KB',
      status: 'ready',
      color: 'blue',
      description: 'Google Gemini-powered coding assistant with intelligent suggestions',
      features: [
        'Real-time code suggestions',
        'Bug detection and fixes',
        'Code optimization',
        'Auto-documentation'
      ],
      path: 'integrations/copilot/',
      docs: 'https://ai.google.dev/docs'
    },
    {
      id: 'animation-maker',
      name: 'DP Animation Maker 3',
      icon: <Video className="w-8 h-8" />,
      category: 'Content Creation',
      size: '28 MB',
      status: 'ready',
      color: 'purple',
      description: 'Professional animation software for creating engaging visual content',
      features: [
        'Animated promotional videos',
        'Social media content',
        'Data visualizations',
        'Marketing materials'
      ],
      path: 'integrations/animation-maker/DP.Animation.Maker.3.rar',
      docs: '#'
    },
    {
      id: 'wavelink',
      name: 'Elgato Wave Link',
      icon: <Mic className="w-8 h-8" />,
      category: 'Audio Production',
      size: '136 MB',
      status: 'ready',
      color: 'orange',
      description: 'Professional audio mixing and routing for content creation',
      features: [
        'Multi-source audio mixing',
        'VST plugin support',
        'Scene management',
        'Low-latency processing'
      ],
      path: 'integrations/streaming-tools/WaveLink_2.0.6.3780_x64.msi',
      docs: 'https://www.elgato.com/wavelink'
    },
    {
      id: 'stream-deck',
      name: 'Elgato Stream Deck',
      icon: <Gamepad2 className="w-8 h-8" />,
      category: 'Workflow Automation',
      size: '250 MB',
      status: 'ready',
      color: 'cyan',
      description: 'Customizable control center for streamlined workflows',
      features: [
        'One-touch app control',
        'Workflow automation',
        'Custom button actions',
        '100+ app integrations'
      ],
      path: 'integrations/streaming-tools/Stream_Deck_7.0.3.22071.msi',
      docs: 'https://www.elgato.com/stream-deck'
    },
    {
      id: 'demo-video',
      name: 'Grok AI Demo Video',
      icon: <FileVideo className="w-8 h-8" />,
      category: 'Marketing',
      size: '5.3 MB',
      status: 'ready',
      color: 'pink',
      description: 'Professional demo video for presentations and marketing',
      features: [
        'Landing page hero',
        'Feature demonstrations',
        'Social media content',
        'Investor presentations'
      ],
      path: 'public/videos/grok-video-abf0508c-a9fb-4dc5-b983-6f19a59c4a6b.mp4',
      docs: '#'
    }
  ];

  const workflows = [
    {
      name: 'AI Model Development',
      steps: ['NVIDIA AI Workbench', 'AI Copilot', 'GOAT App Testing', 'DGX Cloud Deploy'],
      icon: <Cpu className="w-5 h-5" />,
      color: 'green'
    },
    {
      name: 'Content Creation',
      steps: ['DP Animation Maker', 'Wave Link Audio', 'Stream Deck Control', 'Publish'],
      icon: <Video className="w-5 h-5" />,
      color: 'purple'
    },
    {
      name: 'Live Streaming',
      steps: ['Wave Link Mix', 'Stream Deck Scenes', 'GOAT App Display', 'Broadcast'],
      icon: <Mic className="w-5 h-5" />,
      color: 'orange'
    },
    {
      name: 'Professional Presentations',
      steps: ['Animation Maker', 'GOAT App Data', 'Wave Link Audio', 'Stream Deck Control'],
      icon: <Sparkles className="w-5 h-5" />,
      color: 'cyan'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'from-green-500/10 to-green-600/10 border-green-500/20 text-green-400',
      blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/20 text-blue-400',
      purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/20 text-purple-400',
      orange: 'from-orange-500/10 to-orange-600/10 border-orange-500/20 text-orange-400',
      cyan: 'from-cyan-500/10 to-cyan-600/10 border-cyan-500/20 text-cyan-400',
      pink: 'from-pink-500/10 to-pink-600/10 border-pink-500/20 text-pink-400'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Integrations Hub</h1>
              <p className="text-gray-400">Professional tools to supercharge your workflow</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Total Tools</div>
                  <div className="text-3xl font-bold text-white">6</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Categories</div>
                  <div className="text-3xl font-bold text-white">5</div>
                </div>
                <Settings className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Workflows</div>
                  <div className="text-3xl font-bold text-white">4</div>
                </div>
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  <div className="text-3xl font-bold text-white">Ready</div>
                </div>
                <Zap className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integrations Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Available Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <Card 
                key={integration.id}
                className={`bg-gradient-to-br ${getColorClasses(integration.color)} border cursor-pointer hover:scale-105 transition-transform`}
                onClick={() => setSelectedIntegration(integration)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 bg-${integration.color}-600 rounded-lg flex items-center justify-center`}>
                      {integration.icon}
                    </div>
                    <span className={`px-3 py-1 bg-${integration.color}-500/20 text-${integration.color}-400 rounded text-xs`}>
                      {integration.status}
                    </span>
                  </div>
                  <CardTitle className="mt-4">{integration.name}</CardTitle>
                  <div className="text-sm text-gray-400">{integration.category}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">{integration.description}</p>
                  <div className="space-y-2 mb-4">
                    {integration.features.slice(0, 2).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Size: {integration.size}</span>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Install
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recommended Workflows */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recommended Workflows</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflows.map((workflow, idx) => (
              <Card key={idx} className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-${workflow.color}-600 rounded-lg flex items-center justify-center`}>
                      {workflow.icon}
                    </div>
                    <CardTitle>{workflow.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workflow.steps.map((step, stepIdx) => (
                      <div key={stepIdx} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-semibold">
                          {stepIdx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{step}</div>
                        </div>
                        {stepIdx < workflow.steps.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                    <Play className="w-4 h-4 mr-2" />
                    Start Workflow
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Demo Video Section */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileVideo className="w-5 h-5 text-pink-400" />
              Demo Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <video 
                src="/videos/grok-video-abf0508c-a9fb-4dc5-b983-6f19a59c4a6b.mp4"
                controls
                className="w-full h-full object-cover"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="mt-4 flex gap-3">
              <Button className="flex-1 bg-pink-600 hover:bg-pink-700">
                <Play className="w-4 h-4 mr-2" />
                Play Demo
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documentation Link */}
        <Card className="mt-6 bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-blue-400 mb-1">Complete Integration Guide</div>
                <div className="text-sm text-gray-400">
                  Detailed documentation for all integrations, workflows, and best practices
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Detail Modal (if needed) */}
      {selectedIntegration && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedIntegration(null)}
        >
          <Card 
            className="max-w-2xl w-full bg-gray-800 border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-${selectedIntegration.color}-600 rounded-lg flex items-center justify-center`}>
                    {selectedIntegration.icon}
                  </div>
                  <div>
                    <CardTitle>{selectedIntegration.name}</CardTitle>
                    <div className="text-sm text-gray-400">{selectedIntegration.category}</div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedIntegration(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6">{selectedIntegration.description}</p>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Features</h3>
                <div className="space-y-2">
                  {selectedIntegration.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <Download className="w-4 h-4 mr-2" />
                  Install Now
                </Button>
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default IntegrationsHub;