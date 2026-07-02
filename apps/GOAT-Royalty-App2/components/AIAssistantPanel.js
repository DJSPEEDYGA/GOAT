/**
 * GOAT Royalty App — AI Assistant Panel
 * Universal AI assistant UI that adapts to context
 * 
 * Features:
 * - Auto-selects assistant based on current page
 * - Manual assistant switching
 * - Streaming chat responses
 * - Image upload (for vision-capable assistants)
 * - Context-aware suggestions
 * - Chat history management
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Sparkles, Bot, Send, Image as ImageIcon, X, ChevronDown, User, Settings, History, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/router';
import { ASSISTANTS, getAssistantForPage } from '../lib/ai-assistants';

export default function AIAssistantPanel({ isOpen, onClose, forceAssistantId = null }) {
  const router = useRouter();
  
  // Assistant state
  const [currentAssistant, setCurrentAssistant] = useState(null);
  const [showAssistantSwitcher, setShowAssistantSwitcher] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamingTextRef = useRef('');
  const abortControllerRef = useRef(null);
  const codeBlockCounterRef = useRef(0);
  
  // ─── Initialize Assistant Based on Page ────────────────────────────────────────
  useEffect(() => {
    if (forceAssistantId) {
      setCurrentAssistant(ASSISTANTS[forceAssistantId]);
    } else {
      const assistant = getAssistantForPage(router.pathname);
      setCurrentAssistant(assistant);
    }
  }, [router.pathname, forceAssistantId]);
  
  // ─── Load Chat History for Assistant ──────────────────────────────────────────
  useEffect(() => {
    if (!currentAssistant) return;
    
    const historyKey = `ai-assistant-${currentAssistant.id}-history`;
    const savedHistory = localStorage.getItem(historyKey);
    
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
  }, [currentAssistant]);
  
  // ─── Save Chat History ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentAssistant || messages.length === 0) return;
    
    const historyKey = `ai-assistant-${currentAssistant.id}-history`;
    localStorage.setItem(historyKey, JSON.stringify(messages));
  }, [messages, currentAssistant]);
  
  // ─── Sync Streaming Text Ref ───────────────────────────────────────────────────
  useEffect(() => {
    streamingTextRef.current = streamingText;
  }, [streamingText]);
  
  // ─── Auto-Scroll to Bottom ─────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);
  
  // ─── Focus Input on Open ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);
  
  // ─── Markdown Rendering with DOMPurify (XSS-safe) ───────────────────────────────
  const renderMarkdown = useCallback((text) => {
    if (!text) return '';
    
    codeBlockCounterRef.current = 0;
    
    const rawHtml = marked.parse(text, {
      breaks: true,
      gfm: true,
    });
    
    const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#|$)/i,
      ADD_ATTR: ['data-code-id'],
    });
    
    return sanitizedHtml;
  }, []);
  
  // ─── Send Message with Streaming Response ───────────────────────────────────────
  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || !currentAssistant) return;
    
    // Add user message
    const userMessage = { role: 'user', content: trimmedInput };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setStreamingText('');
    
    // Create AbortController for cleanup
    abortControllerRef.current = new AbortController();
    
    try {
      // Call Gemini streaming API
      const response = await fetch('/api/gemini-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              parts: [{ text: currentAssistant.personality }],
            },
            ...newMessages.map((msg) => ({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            })),
          ],
          model: currentAssistant.model,
          persona: currentAssistant.geminiPersona,
        }),
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            
            if (dataStr === '[DONE]') {
              break;
            }
            
            try {
              const data = JSON.parse(dataStr);
              
              if (data.type === 'text') {
                fullResponse += data.content;
                setStreamingText(fullResponse);
              } else if (data.type === 'done') {
                break;
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }
      
      // Add assistant message
      const assistantMessage = { role: 'assistant', content: fullResponse };
      setMessages([...newMessages, assistantMessage]);
      setStreamingText('');
      
    } catch (error) {
      console.error('Assistant API error:', error);
      
      if (error.name === 'AbortError') {
        const partialText = streamingTextRef.current;
        if (partialText) {
          const assistantMessage = { role: 'assistant', content: partialText + '\n\n*(Response interrupted)*' };
          setMessages([...newMessages, assistantMessage]);
        }
      } else {
        const errorMessage = {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        };
        setMessages([...newMessages, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };
  
  // ─── Clear Chat History ────────────────────────────────────────────────────────
  const clearHistory = () => {
    if (!currentAssistant) return;
    
    setMessages([]);
    localStorage.removeItem(`ai-assistant-${currentAssistant.id}-history`);
  };
  
  // ─── Handle Keyboard Input ─────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // ─── Suggested Prompt Handler ───────────────────────────────────────────────────
  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };
  
  // ─── Render Message ───────────────────────────────────────────────────────────
  const renderMessage = (msg) => {
    const isUser = msg.role === 'user';
    
    return (
      <div
        key={msg._id || Math.random()}
        className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{
              background: currentAssistant?.backgroundColor,
              color: currentAssistant?.color,
            }}
          >
            {currentAssistant?.avatar}
          </div>
        )}
        
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          ) : (
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
          )}
        </div>
        
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
        )}
      </div>
    );
  };
  
  if (!currentAssistant || !isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* ─── Header ───────────────────────────────────────────────────────────────── */}
        <div
          className="p-4 flex items-center justify-between"
          style={{
            background: currentAssistant.backgroundColor,
            color: currentAssistant.color,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">{currentAssistant.avatar}</div>
            <div>
              <h2 className="font-bold text-lg">{currentAssistant.displayName}</h2>
              <p className="text-xs opacity-80">{currentAssistant.tagline}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Assistant Switcher */}
            <button
              onClick={() => setShowAssistantSwitcher(!showAssistantSwitcher)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              title="Switch Assistant"
            >
              <Bot size={20} />
            </button>
            
            {/* Clear History */}
            <button
              onClick={clearHistory}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              title="Clear History"
            >
              <History size={20} />
            </button>
            
            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* ─── Assistant Switcher Dropdown ─────────────────────────────────────────── */}
        {showAssistantSwitcher && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Choose an assistant:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {Object.values(ASSISTANTS).map((assistant) => (
                <button
                  key={assistant.id}
                  onClick={() => {
                    setCurrentAssistant(assistant);
                    setShowAssistantSwitcher(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                    currentAssistant.id === assistant.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{assistant.avatar}</span>
                  <span className="text-sm font-medium truncate">{assistant.displayName}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* ─── Messages Area ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">{currentAssistant.avatar}</div>
              <h3 className="text-xl font-bold mb-2">Hi! I'm {currentAssistant.displayName}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{currentAssistant.tagline}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">{currentAssistant.role}</p>
              
              {/* Suggested Prompts */}
              {currentAssistant.suggestedPrompts && currentAssistant.suggestedPrompts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Try asking me:
                  </p>
                  {currentAssistant.suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestion(prompt)}
                      className="block w-full text-left px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {messages.map(renderMessage)}
          
          {isLoading && streamingText && (
            <div className="flex gap-3 mb-4 justify-start">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg animate-pulse"
                style={{
                  background: currentAssistant.backgroundColor,
                  color: currentAssistant.color,
                }}
              >
                {currentAssistant.avatar}
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 bg-gray-100 dark:bg-gray-800">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingText) }}
                />
                <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* ─── Input Area ─────────────────────────────────────────────────────────── */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${currentAssistant.displayName}...`}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}