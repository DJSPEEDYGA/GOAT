'use client';

import { useState } from 'react';
import { 
  Music, 
  Gamepad2, 
  Cpu, 
  Palette, 
  Mic, 
  Brain,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error';
  category: string;
  features: string[];
  lastSync?: string;
}

const integrations: Integration[] = [
  {
    id: 'tiktok',
    name: 'TikTok (TikAPI)',
    description: 'Creator analytics, video tracking & hashtag search',
    icon: <Music className="h-6 w-6" />,
    status: 'connected',
    category: 'Social',
    features: ['Profile analytics', 'Video tracking', 'Hashtag search', 'Royalty insights'],
    lastSync: 'Just now'
  },
  {
    id: 'fashionforge',
    name: 'FashionForge Studio',
    description: 'Complete fashion & entertainment integration',
    icon: <Palette className="h-6 w-6" />,
    status: 'connected',
    category: 'Creative',
    features: ['Fashion design tools', 'Entertainment content', 'Brand integration'],
    lastSync: '2 hours ago'
  },
  {
    id: 'nvidia',
    name: 'NVIDIA DGX Cloud',
    description: 'AI-powered modules and cloud computing',
    icon: <Cpu className="h-6 w-6" />,
    status: 'connected',
    category: 'AI/ML',
    features: ['AI revenue prediction', 'Advanced analytics', 'Cloud processing'],
    lastSync: '1 hour ago'
  },
  {
    id: 'native-instruments',
    name: 'Native Instruments Hub',
    description: 'Professional music production tools',
    icon: <Music className="h-6 w-6" />,
    status: 'connected',
    category: 'Music',
    features: ['Sound libraries', 'Production tools', 'Audio processing'],
    lastSync: '30 minutes ago'
  },
  {
    id: 'logic-pro',
    name: 'Logic Pro Integration',
    description: 'Music production marketplace',
    icon: <Music className="h-6 w-6" />,
    status: 'connected',
    category: 'Music',
    features: ['DAW integration', 'Session management', 'Audio export'],
    lastSync: '45 minutes ago'
  },
  {
    id: 'gemini',
    name: 'Google Gemini AI Copilot',
    description: 'AI-powered assistance and automation',
    icon: <Brain className="h-6 w-6" />,
    status: 'connected',
    category: 'AI/ML',
    features: ['Smart suggestions', 'Automated reports', 'Data analysis'],
    lastSync: '5 minutes ago'
  },
  {
    id: 'epic-games',
    name: 'Epic Games Integration',
    description: 'Gaming and interactive content',
    icon: <Gamepad2 className="h-6 w-6" />,
    status: 'error',
    category: 'Gaming',
    features: ['Game royalties', 'In-game content', 'Digital assets']
  },
  {
    id: 'text-to-speech',
    name: 'ChatGPT-style Text-to-Speech',
    description: 'Advanced voice synthesis',
    icon: <Mic className="h-6 w-6" />,
    status: 'connected',
    category: 'Audio',
    features: ['Voice synthesis', 'Natural language processing', 'Multi-language support'],
    lastSync: '15 minutes ago'
  }
];

function getStatusIcon(status: Integration['status']) {
  switch (status) {
    case 'connected':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'disconnected':
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
}

function getStatusBadge(status: Integration['status']) {
  switch (status) {
    case 'connected':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'disconnected':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

const categoryColors: Record<string, string> = {
  'Social': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'Creative': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'AI/ML': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Music': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Gaming': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Audio': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
};

export function IntegrationsHub() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(integrations.map(i => i.category)))];
  
  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Integrations Hub
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Professional tools and platform integrations
            </p>
          </div>
          <button className="flex items-center space-x-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400">
            <Settings className="h-4 w-4" />
            <span>Configure</span>
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${selectedCategory === category
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration) => (
          <div
            key={integration.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {integration.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {integration.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[integration.category]}`}>
                      {integration.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(integration.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(integration.status)}`}>
                        {integration.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {integration.description}
            </p>

            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Features:
              </p>
              <div className="flex flex-wrap gap-1">
                {integration.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {integration.lastSync && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last sync: {integration.lastSync}
                </p>
              </div>
            )}

            <button className="mt-3 w-full flex items-center justify-center space-x-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400">
              <ExternalLink className="h-4 w-4" />
              <span>Manage</span>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400">
          Browse All Integrations →
        </button>
      </div>
    </div>
  );
}