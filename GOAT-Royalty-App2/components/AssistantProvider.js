/**
 * GOAT Royalty App — Assistant Provider Context
 * Global state management for AI assistants
 * 
 * Features:
 * - Global assistant panel open/close state
 * - Current assistant tracking
 * - Assistant switching across pages
 * - Cross-page assistant persistence
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ASSISTANTS, getAssistantForPage } from '../lib/ai-assistants';

const AssistantContext = createContext(null);

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within AssistantProvider');
  }
  return context;
}

export function AssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAssistant, setCurrentAssistant] = useState(ASSISTANTS.goCommander);
  const [forceAssistantId, setForceAssistantId] = useState(null);
  
  // Open assistant panel
  const openAssistant = useCallback((assistantId = null) => {
    if (assistantId) {
      setForceAssistantId(assistantId);
      setCurrentAssistant(ASSISTANTS[assistantId] || ASSISTANTS.goCommander);
    } else {
      setForceAssistantId(null);
    }
    setIsOpen(true);
  }, []);
  
  // Close assistant panel
  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);
  
  // Toggle assistant panel
  const toggleAssistant = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);
  
  // Switch to specific assistant
  const switchAssistant = useCallback((assistantId) => {
    const assistant = ASSISTANTS[assistantId];
    if (assistant) {
      setCurrentAssistant(assistant);
      setForceAssistantId(assistantId);
    }
  }, []);
  
  // Auto-select assistant based on page (called from pages)
  const autoSelectAssistant = useCallback((pathname) => {
    const assistant = getAssistantForPage(pathname);
    if (assistant) {
      setCurrentAssistant(assistant);
      setForceAssistantId(null);
    }
  }, []);
  
  const value = {
    isOpen,
    currentAssistant,
    forceAssistantId,
    openAssistant,
    closeAssistant,
    toggleAssistant,
    switchAssistant,
    autoSelectAssistant,
  };
  
  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
}