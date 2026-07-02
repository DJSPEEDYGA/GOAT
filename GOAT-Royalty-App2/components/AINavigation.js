import React from 'react';
import Link from 'next/link';
import { Brain, Rocket } from 'lucide-react';

/**
 * AI Navigation Component
 * Adds AI Command Center access to the app
 */

export default function AINavigation() {
  return (
    <Link href="/ai-command-center">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-lg p-4 hover:shadow-xl transition-all cursor-pointer">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <Brain className="h-8 w-8 animate-pulse" />
            <Rocket className="h-8 w-8 animate-bounce" />
          </div>
          <div>
            <h3 className="font-bold text-lg">🤖 AI Command Center</h3>
            <p className="text-sm text-purple-100">
              215+ NVIDIA LLMs • GOAT Force LLM • Autonomous Agents
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}