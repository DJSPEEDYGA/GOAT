/**
 * Gemini AI LLM - Full-Featured Chat Interface
 * Complete AI chat with streaming, multi-modal, conversation management
 * Built for the GOAT Royalty App ecosystem
 * 
 * Security fixes applied per Copilot code review:
 * - XSS: Uses marked + DOMPurify instead of regex HTML
 * - No dangerouslySetInnerHTML with unsanitized content
 * - No global inline onclick handlers
 * - Proper AbortController cleanup
 * - Stale state fix using refs
 * - localStorage cleanup on empty conversations
 * - Removed unused imports
 */

import { useState, useRef, useEffect } from 'react';
import {
  Send, Sparkles, Loader, Copy, Check, Trash2, Bot, User,
  Settings, Download, Plus, MessageSquare, Image, X, Moon, Sun,
  ChevronLeft, ChevronRight, Zap, Brain, Menu,
  Maximize2, Minimize2, Code,
  TrendingUp, Music, Shield, Terminal
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// ============ Secure Markdown Renderer ============
// Configure marked for safe rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Custom renderer to add classes and handle code blocks with copy buttons
const renderer = new marked.Renderer();

// Track code block index for unique IDs
let codeBlockCounter = 0;

renderer.code = function (code, language) {
  const lang = language || 'text';
  const id = `code-block-${++codeBlockCounter}`;
  const escaped = escapeHtml(typeof code === 'object' ? code.text || '' : code);
  return `<div class="code-block" id="${id}"><div class="code-header"><span>${escapeHtml(lang)}</span><button class="copy-btn" data-code-id="${id}">📋 Copy</button></div><pre><code class="language-${escapeHtml(lang)}">${escaped}</code></pre></div>`;
};

marked.setOptions({ renderer });

function renderMarkdown(text) {
  if (!text) return '';

  // Reset counter for each render
  codeBlockCounter = 0;

  // Use marked to generate HTML safely
  const rawHtml = marked.parse(text);

  // Sanitize the HTML and restrict URL protocols
  const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#|$)/i,
    ADD_ATTR: ['data-code-id'],
  });

  return sanitizedHtml;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============ Constants ============
const QUICK_PROMPTS = [
  { icon: TrendingUp, title: 'Royalty Analysis', desc: 'Analyze my streaming royalties', prompt: 'Analyze my current royalty earnings across all platforms and suggest optimization strategies.' },
  { icon: Music, title: 'Music Production', desc: 'Get production tips', prompt: 'Give me advanced music production tips for creating hit tracks in 2025.' },
  { icon: Shield, title: 'IP Protection', desc: 'Protect your catalog', prompt: 'How can I better protect my music catalog intellectual property and detect unauthorized usage?' },
  { icon: Code, title: 'Code Assistant', desc: 'Help with development', prompt: 'Help me write a Next.js API route that integrates with the Spotify API to fetch my streaming analytics.' },
  { icon: Brain, title: 'AI Strategy', desc: 'Leverage AI for music', prompt: 'What are the best ways to leverage AI tools for music production, marketing, and royalty optimization in 2025?' },
  { icon: Terminal, title: 'Platform Help', desc: 'GOAT App features', prompt: 'Explain all the features available in the GOAT Royalty App and how to use them effectively.' },
];

const DEFAULT_SYSTEM_PROMPT = `You are the Super GOAT Royalty AI — an elite AI assistant built into the GOAT Royalty App. You are an expert in music production, royalties, publishing, copyright, analytics, and software development. Always provide detailed, actionable responses with proper markdown formatting.`;

// ============ Main Component ============
export default function GeminiLLM() {
  // State
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [model, setModel] = useState('gemini-2.0-flash');
  const [models, setModels] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [images, setImages] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  // Settings
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [temperature, setTemperature] = useState(1.0);
  const [topP, setTopP] = useState(0.95);
  const [topK, setTopK] = useState(40);
  const [maxTokens, setMaxTokens] = useState(8192);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const chatAreaRef = useRef(null);
  // Use ref to track streaming text for AbortError handler (avoids stale closure)
  const streamingTextRef = useRef('');

  // Keep ref in sync with state
  useEffect(() => {
    streamingTextRef.current = streamingText;
  }, [streamingText]);

  // ============ Effects ============
  useEffect(() => {
    fetchModels();
    // Load conversations from localStorage
    const saved = localStorage.getItem('goat-gemini-conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
      } catch (e) { /* ignore corrupt data */ }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  useEffect(() => {
    // Save conversations to localStorage, or remove key if empty
    if (conversations.length > 0) {
      localStorage.setItem('goat-gemini-conversations', JSON.stringify(conversations));
    } else {
      localStorage.removeItem('goat-gemini-conversations');
    }
  }, [conversations]);

  // ============ Code Copy Handler (React event delegation) ============
  useEffect(() => {
    const handleCopyClick = (e) => {
      const btn = e.target.closest('.copy-btn[data-code-id]');
      if (!btn) return;
      const blockId = btn.getAttribute('data-code-id');
      const block = document.getElementById(blockId);
      if (!block) return;
      const code = block.querySelector('code');
      if (!code) return;
      navigator.clipboard.writeText(code.textContent).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = orig; }, 2000);
      });
    };

    document.addEventListener('click', handleCopyClick);
    return () => document.removeEventListener('click', handleCopyClick);
  }, []);

  // ============ Functions ============
  const fetchModels = async () => {
    try {
      const res = await fetch('/api/gemini-llm/models');
      const data = await res.json();
      setModels(data.models || []);
    } catch (e) {
      setModels([
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
        { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
        { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash Preview' },
        { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro Preview' },
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewChat = () => {
    const id = Date.now().toString();
    const newConv = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      model,
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(id);
    setMessages([]);
    setStreamingText('');
    inputRef.current?.focus();
  };

  const selectConversation = (conv) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages || []);
    setStreamingText('');
  };

  const deleteConversation = (e, convId) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConvId === convId) {
      setActiveConvId(null);
      setMessages([]);
    }
  };

  const updateConversation = (convId, newMessages, title) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === convId) {
          return { ...c, messages: newMessages, title: title || c.title };
        }
        return c;
      })
    );
  };

  const generateTitle = (text) => {
    const words = text.split(' ').slice(0, 6).join(' ');
    return words.length > 40 ? words.substring(0, 40) + '...' : words;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image must be under 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result.split(',')[1];
        setImages(prev => [...prev, {
          data: base64,
          mimeType: file.type,
          name: file.name,
          preview: ev.target.result,
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const copyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const exportChat = () => {
    if (!messages.length) return;
    const conv = conversations.find(c => c.id === activeConvId);
    const exportData = {
      title: conv?.title || 'Gemini AI Chat',
      model,
      exportedAt: new Date().toISOString(),
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goat-ai-chat-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============ Send Message ============
  const sendMessage = async (overrideText) => {
    const text = overrideText || input.trim();
    if ((!text && images.length === 0) || isStreaming) return;

    // Create conversation if needed
    let convId = activeConvId;
    if (!convId) {
      convId = Date.now().toString();
      const newConv = {
        id: convId,
        title: generateTitle(text),
        messages: [],
        createdAt: new Date().toISOString(),
        model,
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(convId);
    }

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      images: images.map(img => ({ preview: img.preview, name: img.name })),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);
    setStreamingText('');
    streamingTextRef.current = '';

    // Update title for first message
    if (messages.length === 0) {
      updateConversation(convId, newMessages, generateTitle(text));
    }

    const currentImages = [...images];
    setImages([]);

    try {
      abortControllerRef.current = new AbortController();

      const apiMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini-llm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          model,
          systemPrompt,
          temperature,
          topP,
          topK,
          maxOutputTokens: maxTokens,
          stream: true,
          images: currentImages.map(img => ({
            data: img.data,
            mimeType: img.mimeType,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;
            try {
              const data = JSON.parse(jsonStr);
              if (data.type === 'chunk' && data.text) {
                fullText += data.text;
                setStreamingText(fullText);
                streamingTextRef.current = fullText;
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (e) {
              if (e.message !== 'Unexpected end of JSON input') {
                if (e.message.includes('API Error') || e.message.includes('Error')) {
                  throw e;
                }
              }
            }
          }
        }
      }

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullText,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      setStreamingText('');
      streamingTextRef.current = '';
      updateConversation(convId, finalMessages);

    } catch (error) {
      if (error.name === 'AbortError') {
        // User stopped generation — use ref to get current streaming text (not stale state)
        const currentText = streamingTextRef.current;
        if (currentText) {
          const partialMsg = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: currentText + '\n\n*[Generation stopped]*',
            timestamp: new Date().toISOString(),
          };
          const finalMessages = [...newMessages, partialMsg];
          setMessages(finalMessages);
          setStreamingText('');
          streamingTextRef.current = '';
          updateConversation(convId, finalMessages);
        }
      } else {
        const errorMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `❌ **Error:** ${error.message}\n\nPlease check your API key and try again.`,
          timestamp: new Date().toISOString(),
        };
        const finalMessages = [...newMessages, errorMsg];
        setMessages(finalMessages);
        setStreamingText('');
        streamingTextRef.current = '';
        updateConversation(convId, finalMessages);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickAction = (prompt) => {
    setInput(prompt);
    sendMessage(prompt);
  };

  // ============ Render ============
  const activeConv = conversations.find(c => c.id === activeConvId);
  const showWelcome = !activeConvId || messages.length === 0;

  return (
    <div className={`gemini-llm-container ${darkMode ? 'dark' : 'light'} ${fullscreen ? 'fullscreen' : ''}`}>
      <style jsx global>{`
        .gemini-llm-container {
          --g-bg: #0a0a12;
          --g-bg2: #12121e;
          --g-bg3: #1a1a2e;
          --g-bg4: #222240;
          --g-text: #e8e8f0;
          --g-text2: #a0a0b8;
          --g-text3: #6b6b80;
          --g-accent: #6c63ff;
          --g-accent2: #4ecdc4;
          --g-border: #2a2a45;
          --g-hover: #252545;
          --g-code-bg: #0d1117;
          --g-user-bg: #1e3a5f;
          --g-ai-bg: #16162a;
          --g-gradient: linear-gradient(135deg, #6c63ff 0%, #4ecdc4 100%);
          --g-glow: rgba(108, 99, 255, 0.3);
          --g-radius: 12px;
          --g-sidebar: 300px;
          display: flex;
          height: 100vh;
          width: 100%;
          background: var(--g-bg);
          color: var(--g-text);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .gemini-llm-container.light {
          --g-bg: #f5f5fa;
          --g-bg2: #ffffff;
          --g-bg3: #eeeef5;
          --g-bg4: #e0e0ea;
          --g-text: #1a1a2e;
          --g-text2: #555570;
          --g-text3: #8888a0;
          --g-border: #d8d8e5;
          --g-hover: #eeeef5;
          --g-code-bg: #f6f8fa;
          --g-user-bg: #e8e5ff;
          --g-ai-bg: #ffffff;
          --g-glow: rgba(108, 99, 255, 0.15);
        }
        .gemini-llm-container.fullscreen {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 9999;
        }

        /* Sidebar */
        .g-sidebar {
          width: var(--g-sidebar);
          min-width: var(--g-sidebar);
          background: var(--g-bg);
          border-right: 1px solid var(--g-border);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .g-sidebar.closed { width: 0; min-width: 0; border: none; }
        .g-sidebar-header { padding: 20px; border-bottom: 1px solid var(--g-border); }
        .g-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .g-logo-icon {
          width: 42px; height: 42px;
          background: var(--g-gradient);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; color: white;
          box-shadow: 0 4px 15px var(--g-glow);
        }
        .g-logo-text h2 {
          font-size: 17px; font-weight: 700;
          background: var(--g-gradient);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .g-logo-text span { font-size: 11px; color: var(--g-text3); }
        .g-new-chat {
          width: 100%; padding: 12px;
          background: var(--g-gradient);
          color: white; border: none; border-radius: 10px;
          font-size: 14px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px var(--g-glow);
        }
        .g-new-chat:hover { transform: translateY(-2px); box-shadow: 0 6px 20px var(--g-glow); }

        /* Conversation List */
        .g-conv-list { flex: 1; overflow-y: auto; padding: 10px; }
        .g-conv-list::-webkit-scrollbar { width: 4px; }
        .g-conv-list::-webkit-scrollbar-thumb { background: var(--g-border); border-radius: 4px; }
        .g-conv-item {
          padding: 11px 14px; border-radius: 8px; cursor: pointer;
          transition: all 0.2s ease; margin-bottom: 3px;
          display: flex; align-items: center; gap: 10px;
        }
        .g-conv-item:hover { background: var(--g-hover); }
        .g-conv-item.active { background: var(--g-hover); border-left: 3px solid var(--g-accent); }
        .g-conv-item .title { font-size: 13px; font-weight: 500; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .g-conv-item .del-btn {
          opacity: 0; background: none; border: none; color: var(--g-text3);
          cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s;
          display: flex; align-items: center;
        }
        .g-conv-item:hover .del-btn { opacity: 1; }
        .g-conv-item .del-btn:hover { color: #ff6b6b; background: rgba(255,107,107,0.1); }

        /* Sidebar Footer */
        .g-sidebar-footer { padding: 14px; border-top: 1px solid var(--g-border); display: flex; flex-direction: column; gap: 4px; }
        .g-sidebar-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; background: none; border: none;
          color: var(--g-text2); font-size: 13px; cursor: pointer;
          border-radius: 8px; transition: all 0.2s; width: 100%; text-align: left;
        }
        .g-sidebar-btn:hover { background: var(--g-hover); color: var(--g-text); }

        /* Main Area */
        .g-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .g-header {
          height: 60px; padding: 0 20px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid var(--g-border);
          background: var(--g-bg2);
        }
        .g-header-left { display: flex; align-items: center; gap: 12px; }
        .g-header-right { display: flex; align-items: center; gap: 6px; }
        .g-icon-btn {
          background: none; border: none; color: var(--g-text2);
          cursor: pointer; padding: 8px; border-radius: 8px;
          transition: all 0.2s; display: flex; align-items: center;
        }
        .g-icon-btn:hover { background: var(--g-hover); color: var(--g-text); }
        .g-model-select {
          background: var(--g-bg3); color: var(--g-text);
          border: 1px solid var(--g-border); padding: 8px 12px;
          border-radius: 8px; font-size: 13px; cursor: pointer; outline: none;
          max-width: 240px;
        }
        .g-model-select:hover { border-color: var(--g-accent); }

        /* Chat Area */
        .g-chat { flex: 1; overflow-y: auto; padding: 24px; background: var(--g-bg); scroll-behavior: smooth; }
        .g-chat::-webkit-scrollbar { width: 6px; }
        .g-chat::-webkit-scrollbar-thumb { background: var(--g-border); border-radius: 6px; }

        /* Welcome */
        .g-welcome {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; height: 100%; text-align: center; padding: 40px;
          animation: gFadeIn 0.6s ease;
        }
        @keyframes gFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .g-welcome-icon {
          width: 80px; height: 80px;
          background: var(--g-gradient); border-radius: 24px;
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; margin-bottom: 24px;
          box-shadow: 0 8px 32px var(--g-glow);
          animation: gFloat 3s ease-in-out infinite;
        }
        .g-welcome h2 {
          font-size: 28px; font-weight: 700; margin-bottom: 10px;
          background: var(--g-gradient);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .g-welcome p { color: var(--g-text2); font-size: 15px; max-width: 520px; margin-bottom: 32px; line-height: 1.6; }
        .g-quick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-width: 720px; width: 100%; }
        @media (max-width: 768px) { .g-quick-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .g-quick-grid { grid-template-columns: 1fr; } }
        .g-quick-card {
          padding: 16px; background: var(--g-bg2);
          border: 1px solid var(--g-border); border-radius: 12px;
          cursor: pointer; transition: all 0.3s; text-align: left;
        }
        .g-quick-card:hover { border-color: var(--g-accent); transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .g-quick-card .qc-icon { margin-bottom: 8px; color: var(--g-accent); }
        .g-quick-card .qc-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
        .g-quick-card .qc-desc { font-size: 11px; color: var(--g-text3); }

        /* Messages */
        .g-message {
          display: flex; gap: 14px; margin-bottom: 24px;
          max-width: 860px; margin-left: auto; margin-right: auto;
          animation: gFadeIn 0.3s ease;
        }
        .g-avatar {
          width: 34px; height: 34px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0; margin-top: 2px;
        }
        .g-message.user .g-avatar { background: var(--g-gradient); color: white; }
        .g-message.assistant .g-avatar { background: var(--g-bg3); border: 1px solid var(--g-border); color: var(--g-accent); }
        .g-msg-content { flex: 1; min-width: 0; }
        .g-msg-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .g-msg-sender { font-size: 13px; font-weight: 600; }
        .g-msg-time { font-size: 11px; color: var(--g-text3); }
        .g-msg-actions { margin-left: auto; display: flex; gap: 4px; opacity: 0; transition: all 0.2s; }
        .g-message:hover .g-msg-actions { opacity: 1; }
        .g-msg-body {
          padding: 16px 20px; border-radius: 12px;
          font-size: 14px; line-height: 1.7; word-wrap: break-word;
        }
        .g-message.user .g-msg-body { background: var(--g-user-bg); border: 1px solid rgba(108,99,255,0.2); }
        .g-message.assistant .g-msg-body { background: var(--g-ai-bg); border: 1px solid var(--g-border); }

        /* Message body content styles */
        .g-msg-body h1, .g-msg-body h2, .g-msg-body h3 { margin: 14px 0 8px; font-weight: 600; }
        .g-msg-body h1 { font-size: 1.3em; }
        .g-msg-body h2 { font-size: 1.15em; }
        .g-msg-body h3 { font-size: 1.05em; }
        .g-msg-body p { margin-bottom: 10px; }
        .g-msg-body p:last-child { margin-bottom: 0; }
        .g-msg-body ul, .g-msg-body ol { margin: 8px 0; padding-left: 22px; }
        .g-msg-body li { margin-bottom: 4px; }
        .g-msg-body a { color: var(--g-accent); text-decoration: none; }
        .g-msg-body a:hover { text-decoration: underline; }
        .g-msg-body strong { font-weight: 600; }
        .g-msg-body blockquote {
          border-left: 3px solid var(--g-accent); padding: 8px 16px;
          margin: 10px 0; background: rgba(108,99,255,0.05);
          border-radius: 0 8px 8px 0;
        }
        .g-msg-body hr { border: none; border-top: 1px solid var(--g-border); margin: 16px 0; }
        .g-msg-body table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
        .g-msg-body th, .g-msg-body td { padding: 8px 12px; border: 1px solid var(--g-border); text-align: left; }
        .g-msg-body th { background: var(--g-bg3); font-weight: 600; }

        /* Code blocks */
        .code-block { margin: 12px 0; border-radius: 10px; overflow: hidden; border: 1px solid var(--g-border); }
        .code-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 14px; background: var(--g-bg3);
          font-size: 12px; color: var(--g-text3);
        }
        .copy-btn {
          background: none; border: none; color: var(--g-text3);
          cursor: pointer; font-size: 12px; padding: 3px 8px;
          border-radius: 4px; transition: all 0.2s;
        }
        .copy-btn:hover { background: var(--g-hover); color: var(--g-text); }
        .code-block pre {
          margin: 0; padding: 14px; background: var(--g-code-bg);
          overflow-x: auto;
        }
        .code-block pre code {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 13px; line-height: 1.5; color: var(--g-text);
        }
        .inline-code {
          font-family: 'JetBrains Mono', monospace; font-size: 12px;
          background: var(--g-code-bg); padding: 2px 6px;
          border-radius: 4px; color: var(--g-accent);
          border: 1px solid var(--g-border);
        }

        /* User images */
        .g-msg-images { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
        .g-msg-images img {
          max-width: 180px; max-height: 180px; border-radius: 8px;
          border: 1px solid var(--g-border); object-fit: cover;
        }

        /* Typing indicator */
        .g-typing { display: flex; gap: 5px; padding: 8px 0; }
        .g-typing span {
          width: 8px; height: 8px; background: var(--g-accent);
          border-radius: 50%; animation: gTyping 1.4s infinite;
        }
        .g-typing span:nth-child(2) { animation-delay: 0.2s; }
        .g-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes gTyping { 0%,60%,100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-8px); opacity: 1; } }

        /* Input Area */
        .g-input-area { padding: 14px 24px 22px; background: var(--g-bg2); border-top: 1px solid var(--g-border); }
        .g-input-container { max-width: 860px; margin: 0 auto; }
        .g-image-previews { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
        .g-img-preview { position: relative; }
        .g-img-preview img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; border: 1px solid var(--g-border); }
        .g-img-remove {
          position: absolute; top: -6px; right: -6px;
          width: 20px; height: 20px; background: #ff6b6b; color: white;
          border: none; border-radius: 50%; font-size: 11px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .g-input-wrap {
          display: flex; align-items: flex-end; gap: 10px;
          background: var(--g-bg); border: 2px solid var(--g-border);
          border-radius: 14px; padding: 8px 12px; transition: all 0.3s;
        }
        .g-input-wrap:focus-within { border-color: var(--g-accent); box-shadow: 0 0 0 4px var(--g-glow); }
        .g-input-wrap textarea {
          flex: 1; background: none; border: none; color: var(--g-text);
          font-size: 14px; font-family: inherit; line-height: 1.5;
          resize: none; outline: none; max-height: 180px; min-height: 24px; padding: 4px 0;
        }
        .g-input-wrap textarea::placeholder { color: var(--g-text3); }
        .g-send-btn {
          background: var(--g-gradient); color: white; border: none;
          width: 38px; height: 38px; border-radius: 10px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.3s; flex-shrink: 0;
        }
        .g-send-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 4px 12px var(--g-glow); }
        .g-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .g-stop-btn {
          background: #ff6b6b; color: white; border: none;
          padding: 8px 18px; border-radius: 8px; font-size: 13px;
          font-weight: 600; cursor: pointer; display: flex;
          align-items: center; gap: 6px; margin: 0 auto 8px;
          transition: all 0.2s;
        }
        .g-stop-btn:hover { background: #ff5252; }
        .g-input-footer { text-align: center; margin-top: 8px; font-size: 11px; color: var(--g-text3); }

        /* Settings Modal */
        .g-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 10000; animation: gFadeIn 0.2s ease;
        }
        .g-modal {
          background: var(--g-bg2); border: 1px solid var(--g-border);
          border-radius: 16px; width: 90%; max-width: 500px;
          max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .g-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px; border-bottom: 1px solid var(--g-border);
        }
        .g-modal-header h3 { font-size: 17px; font-weight: 600; }
        .g-modal-body { padding: 24px; }
        .g-setting { margin-bottom: 18px; }
        .g-setting label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--g-text2); }
        .g-setting textarea, .g-setting input[type="text"] {
          width: 100%; background: var(--g-bg3); color: var(--g-text);
          border: 1px solid var(--g-border); padding: 10px 14px;
          border-radius: 8px; font-size: 13px; font-family: inherit;
          outline: none; transition: all 0.2s;
        }
        .g-setting textarea { min-height: 80px; resize: vertical; }
        .g-setting textarea:focus, .g-setting input:focus { border-color: var(--g-accent); box-shadow: 0 0 0 3px var(--g-glow); }
        .g-range-row { display: flex; align-items: center; gap: 12px; }
        .g-range-row input[type="range"] {
          flex: 1; -webkit-appearance: none; height: 4px;
          background: var(--g-border); border-radius: 4px; outline: none;
        }
        .g-range-row input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px;
          background: var(--g-accent); border-radius: 50%; cursor: pointer;
        }
        .g-range-val { font-size: 13px; font-weight: 600; color: var(--g-accent); min-width: 45px; text-align: right; }
        .g-modal-footer {
          padding: 16px 24px; border-top: 1px solid var(--g-border);
          display: flex; justify-content: flex-end; gap: 8px;
        }
        .g-btn {
          padding: 10px 20px; border-radius: 8px; font-size: 13px;
          font-weight: 600; cursor: pointer; transition: all 0.2s; border: none;
        }
        .g-btn-primary { background: var(--g-gradient); color: white; }
        .g-btn-primary:hover { box-shadow: 0 4px 12px var(--g-glow); }
        .g-btn-secondary { background: var(--g-bg3); color: var(--g-text); border: 1px solid var(--g-border); }
        .g-btn-secondary:hover { background: var(--g-hover); }

        /* Responsive */
        @media (max-width: 768px) {
          .g-sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 200; box-shadow: 0 0 30px rgba(0,0,0,0.5); }
          .g-sidebar.closed { transform: translateX(-100%); }
          .g-welcome h2 { font-size: 22px; }
          .g-quick-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* Sidebar */}
      <div className={`g-sidebar ${sidebarOpen ? '' : 'closed'}`}>
        <div className="g-sidebar-header">
          <div className="g-logo">
            <div className="g-logo-icon"><Sparkles size={20} /></div>
            <div className="g-logo-text">
              <h2>Gemini AI LLM</h2>
              <span>GOAT Royalty Engine</span>
            </div>
          </div>
          <button className="g-new-chat" onClick={createNewChat}>
            <Plus size={16} /> New Chat
          </button>
        </div>

        <div className="g-conv-list">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`g-conv-item ${conv.id === activeConvId ? 'active' : ''}`}
              onClick={() => selectConversation(conv)}
            >
              <MessageSquare size={15} style={{ opacity: 0.5, flexShrink: 0 }} />
              <span className="title">{conv.title}</span>
              <button className="del-btn" onClick={(e) => deleteConversation(e, conv.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--g-text3)', fontSize: '13px' }}>
              No conversations yet.<br />Start a new chat!
            </div>
          )}
        </div>

        <div className="g-sidebar-footer">
          <button className="g-sidebar-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="g-sidebar-btn" onClick={exportChat}>
            <Download size={16} /> Export Chat
          </button>
          <button className="g-sidebar-btn" onClick={() => setSettingsOpen(true)}>
            <Settings size={16} /> Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="g-main">
        {/* Header */}
        <div className="g-header">
          <div className="g-header-left">
            <button className="g-icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={20} />
            </button>
            <select
              className="g-model-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="g-header-right">
            <button className="g-icon-btn" onClick={() => setSettingsOpen(true)} title="Settings">
              <Settings size={18} />
            </button>
            <button className="g-icon-btn" onClick={() => setFullscreen(!fullscreen)} title="Fullscreen">
              {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="g-chat" ref={chatAreaRef}>
          {showWelcome ? (
            <div className="g-welcome">
              <div className="g-welcome-icon">
                <Sparkles size={36} color="white" />
              </div>
              <h2>Super GOAT Gemini AI</h2>
              <p>
                Powered by Google&apos;s most capable AI models. Your intelligent assistant for music production,
                royalty management, IP protection, and everything GOAT Royalty.
              </p>
              <div className="g-quick-grid">
                {QUICK_PROMPTS.map((qp, i) => (
                  <div key={i} className="g-quick-card" onClick={() => quickAction(qp.prompt)}>
                    <div className="qc-icon"><qp.icon size={22} /></div>
                    <div className="qc-title">{qp.title}</div>
                    <div className="qc-desc">{qp.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`g-message ${msg.role}`}>
                  <div className="g-avatar">
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className="g-msg-content">
                    <div className="g-msg-header">
                      <span className="g-msg-sender">{msg.role === 'user' ? 'You' : 'Gemini AI'}</span>
                      <span className="g-msg-time">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                      </span>
                      <div className="g-msg-actions">
                        <button
                          className="g-icon-btn"
                          onClick={() => copyMessage(msg.content, msg.id)}
                          title="Copy"
                        >
                          {copiedId === msg.id ? <Check size={14} color="#4ecdc4" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    {msg.images && msg.images.length > 0 && (
                      <div className="g-msg-images">
                        {msg.images.map((img, i) => (
                          <img key={i} src={img.preview} alt={img.name || 'uploaded'} />
                        ))}
                      </div>
                    )}
                    <div
                      className="g-msg-body"
                      dangerouslySetInnerHTML={{
                        __html: msg.role === 'assistant'
                          ? renderMarkdown(msg.content)
                          : DOMPurify.sanitize(escapeHtml(msg.content).replace(/\n/g, '<br/>'))
                      }}
                    />
                  </div>
                </div>
              ))}

              {/* Streaming message */}
              {isStreaming && (
                <div className="g-message assistant">
                  <div className="g-avatar"><Bot size={16} /></div>
                  <div className="g-msg-content">
                    <div className="g-msg-header">
                      <span className="g-msg-sender">Gemini AI</span>
                      <span className="g-msg-time">typing...</span>
                    </div>
                    <div className="g-msg-body">
                      {streamingText ? (
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingText) }} />
                      ) : (
                        <div className="g-typing">
                          <span></span><span></span><span></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Stop Button */}
        {isStreaming && (
          <div style={{ textAlign: 'center', padding: '4px 0' }}>
            <button className="g-stop-btn" onClick={stopGeneration}>
              ⏹ Stop Generating
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="g-input-area">
          <div className="g-input-container">
            {images.length > 0 && (
              <div className="g-image-previews">
                {images.map((img, i) => (
                  <div key={i} className="g-img-preview">
                    <img src={img.preview} alt={img.name} />
                    <button className="g-img-remove" onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="g-input-wrap">
              <button className="g-icon-btn" onClick={() => fileInputRef.current?.click()} title="Upload Image">
                <Image size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Gemini AI..."
                rows={1}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
                }}
              />
              <button
                className="g-send-btn"
                onClick={() => sendMessage()}
                disabled={(!input.trim() && images.length === 0) || isStreaming}
              >
                <Send size={17} />
              </button>
            </div>
            <div className="g-input-footer">
              Gemini AI may produce inaccurate information. Verify important facts.
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="g-modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="g-modal" onClick={(e) => e.stopPropagation()}>
            <div className="g-modal-header">
              <h3>⚙️ AI Settings</h3>
              <button className="g-icon-btn" onClick={() => setSettingsOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="g-modal-body">
              <div className="g-setting">
                <label>System Prompt</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Define the AI's personality and expertise..."
                />
              </div>
              <div className="g-setting">
                <label>Temperature ({temperature})</label>
                <div className="g-range-row">
                  <input type="range" min="0" max="2" step="0.1" value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))} />
                  <span className="g-range-val">{temperature}</span>
                </div>
              </div>
              <div className="g-setting">
                <label>Top P ({topP})</label>
                <div className="g-range-row">
                  <input type="range" min="0" max="1" step="0.05" value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))} />
                  <span className="g-range-val">{topP}</span>
                </div>
              </div>
              <div className="g-setting">
                <label>Top K ({topK})</label>
                <div className="g-range-row">
                  <input type="range" min="1" max="100" step="1" value={topK}
                    onChange={(e) => setTopK(parseInt(e.target.value))} />
                  <span className="g-range-val">{topK}</span>
                </div>
              </div>
              <div className="g-setting">
                <label>Max Output Tokens ({maxTokens})</label>
                <div className="g-range-row">
                  <input type="range" min="256" max="65536" step="256" value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))} />
                  <span className="g-range-val">{maxTokens}</span>
                </div>
              </div>
            </div>
            <div className="g-modal-footer">
              <button className="g-btn g-btn-secondary" onClick={() => {
                setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
                setTemperature(1.0); setTopP(0.95); setTopK(40); setMaxTokens(8192);
              }}>Reset Defaults</button>
              <button className="g-btn g-btn-primary" onClick={() => setSettingsOpen(false)}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}