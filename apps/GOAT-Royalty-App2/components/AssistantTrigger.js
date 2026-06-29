/**
 * GOAT Royalty App — Assistant Trigger Button
 * Floating button to open AI assistant panel on any page
 * 
 * Features:
- Floating FAB (Floating Action Button) design
- Shows current assistant avatar
- Badge for unread suggestions
- Animated pulse effect
- Position options (bottom-right, bottom-left)
 */

import React from 'react';
import { Bot } from 'lucide-react';
import { useAssistant } from './AssistantProvider';

export default function AssistantTrigger({ position = 'bottom-right' }) {
  const { openAssistant, currentAssistant, isOpen } = useAssistant();
  
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };
  
  return (
    <button
      onClick={openAssistant}
      className={`fixed ${positionClasses[position]} z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
        isOpen ? 'scale-90 opacity-70' : ''
      }`}
    >
      {/* Current Assistant Avatar */}
      <span className="text-2xl">{currentAssistant?.avatar}</span>
      
      {/* Bot Icon (subtle background) */}
      <Bot size={16} className="opacity-50" />
      
      {/* Assistant Name */}
      <span className="font-semibold text-sm hidden sm:inline-block">
        {currentAssistant?.displayName || 'AI Assistant'}
      </span>
      
      {/* Pulse Animation */}
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
    </button>
  );
}