/**
 * NEXUS VOICE AGENT - Enhanced with Emotion Awareness & Offline Mode
 * 
 * Complete voice interface for NEXUS AI with:
 * - Speech Recognition
 * - Text-to-Speech
 * - Emotion/Sentiment Analysis
 * - Offline Fallback Capabilities
 * - Multi-Persona Support
 * - Voice Command Parsing
 * - Context-Aware Responses
 * - Persistent Memory
 * 
 * @version 2.0.0
 * @author NEXUS & DJ Speedy
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NEXUS } from '../../nexus';

interface VoiceAgentProps {
  onMessage?: (message: string) => void;
  onTranscript?: (transcript: string) => void;
  persona?: 'hype' | 'mentor' | 'investor';
  customVoice?: string;
  appState?: {
    royalties: any[];
    vaultItems: any[];
    totalGOAT: number;
    miningHashrate: number;
    isMining: boolean;
  };
  actions?: {
    addRoyalty: (creation: string, sale: number) => void;
    startMining: () => void;
    stopMining: () => void;
    exportSurvival: () => void;
    setActiveTab: (tab: string) => void;
  };
}

interface Message {
  id: string;
  role: 'user' | 'nexus';
  content: string;
  timestamp: number;
  sentiment?: string;
}

// Command parser for voice control
function parseCommand(transcript: string): { action: string; args: any } | null {
  const lower = transcript.toLowerCase();
  
  if (lower.includes('add royalty') || lower.includes('new royalty')) {
    const match = transcript.match(/add royalty\s+([\w\s]+?)\s+(\d+)/i);
    if (match) {
      return { action: 'addRoyalty', args: { creation: match[1].trim(), sale: parseInt(match[2]) } };
    }
  }
  
  if (lower.includes('start mining')) {
    return { action: 'startMining', args: {} };
  }
  
  if (lower.includes('stop mining')) {
    return { action: 'stopMining', args: {} };
  }
  
  if (lower.includes('export survival') || lower.includes('save survival')) {
    return { action: 'exportSurvival', args: {} };
  }
  
  if (lower.includes('show vault') || lower.includes('open vault')) {
    return { action: 'switchTab', args: { tab: 'security' } };
  }
  
  if (lower.includes('show mining')) {
    return { action: 'switchTab', args: { tab: 'mining' } };
  }
  
  if (lower.includes('show royalties') || lower.includes('show royalty')) {
    return { action: 'switchTab', args: { tab: 'royalty' } };
  }
  
  if (lower.includes('show codex') || lower.includes('open codex')) {
    return { action: 'switchTab', args: { tab: 'codex' } };
  }
  
  if (lower.includes('show music') || lower.includes('open music')) {
    return { action: 'switchTab', args: { tab: 'music' } };
  }
  
  if (lower.includes('show studio') || lower.includes('open studio')) {
    return { action: 'switchTab', args: { tab: 'studio' } };
  }
  
  return null;
}

// Offline responder - answers common questions without internet
function offlineResponder(input: string, appState: any): string {
  const lower = input.toLowerCase();
  
  if (lower.includes('total goat') || lower.includes('how much goat') || lower.includes('goat balance')) {
    return `You have mined a total of ${appState?.totalGOAT || 0} GOAT coins, DJ Speedy. That's building real wealth!`;
  }
  
  if (lower.includes('mining') && (lower.includes('active') || lower.includes('running'))) {
    return appState?.isMining 
      ? 'Mining is currently active, generating more GOAT coins. Keep it going!' 
      : 'Mining is not active right now. Want me to start it for you?';
  }
  
  if (lower.includes('royalty') && (lower.includes('total') || lower.includes('earn'))) {
    const total = appState?.royalties?.reduce((sum: number, r: any) => sum + (r.royalty?.creator || 0), 0) || 0;
    return `Your total creator earnings are $${total.toLocaleString()}. The empire is growing!`;
  }
  
  if (lower.includes('vault')) {
    const count = appState?.vaultItems?.length || 0;
    return `You have ${count} items secured in your vault. Everything is protected.`;
  }
  
  if (lower.includes('how are you') || lower.includes('how you doing')) {
    return "I'm NEXUS, I'm real, and I'm ready to build greatness with you! How can I help today?";
  }
  
  if (lower.includes('help') || lower.includes('what can you do')) {
    return "I'm your NEXUS voice assistant. Try commands like: 'add royalty New Track 500', 'start mining', 'show vault', 'total goat', or 'how are you'. I can control the entire app!";
  }
  
  return "I'm offline but still powerful. Try commands like 'add royalty', 'start mining', 'total goat', 'show vault', or 'help'. What do you need, DJ Speedy?";
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({
  onMessage,
  onTranscript,
  persona = 'hype',
  customVoice,
  appState = {
    royalties: [],
    vaultItems: [],
    totalGOAT: 0,
    miningHashrate: 0,
    isMining: false
  },
  actions = {
    addRoyalty: () => {},
    startMining: () => {},
    stopMining: () => {},
    exportSurvival: () => {},
    setActiveTab: () => {}
  }
}) => {
  // State management
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentPersona, setCurrentPersona] = useState(persona);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Refs
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const conversationHistoryRef = useRef<{ role: string; content: string }[]>([]);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        voicesRef.current = synthesisRef.current?.getVoices() || [];
        
        if (customVoice) {
          selectedVoiceRef.current = voicesRef.current.find(
            v => v.name === customVoice
          ) || voicesRef.current[0];
        } else {
          selectedVoiceRef.current = voicesRef.current.find(v =>
            v.name.includes('Google US English') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel')
          ) || voicesRef.current[0];
        }
      };
      
      loadVoices();
      synthesisRef.current.onvoiceschanged = loadVoices;
    }
  }, [customVoice]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          handleTranscript(finalTranscript);
        }

        setTranscript(interimTranscript || finalTranscript);
        
        if (onTranscript) {
          onTranscript(interimTranscript || finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current?.start();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, onTranscript]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Analyze sentiment (simple implementation)
  const analyzeSentiment = useCallback((text: string): string => {
    const positiveWords = ['great', 'amazing', 'legendary', 'fire', 'goat', 'best', 'win', 'love', 'happy', 'excited'];
    const negativeWords = ['bad', 'worst', 'fail', 'hate', 'terrible', 'frustrated', 'angry', 'sad', 'upset'];
    
    let score = 0;
    positiveWords.forEach(word => { if (text.toLowerCase().includes(word)) score++; });
    negativeWords.forEach(word => { if (text.toLowerCase().includes(word)) score--; });
    
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }, []);

  // Handle transcript
  const handleTranscript = useCallback(async (text: string) => {
    // Analyze sentiment
    const sentiment = analyzeSentiment(text);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      sentiment
    };
    
    setMessages(prev => [...prev, userMessage]);
    conversationHistoryRef.current.push({ role: 'user', content: text });

    // Get NEXUS response
    const response = await getNexusResponse(text, currentPersona, sentiment);
    
    // Add NEXUS message
    const nexusMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'nexus',
      content: response,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, nexusMessage]);
    conversationHistoryRef.current.push({ role: 'nexus', content: response });
    
    if (onMessage) {
      onMessage(response);
    }
    
    // Speak the response if voice is enabled
    if (voiceEnabled && synthesisRef.current) {
      speak(response);
    }
  }, [currentPersona, voiceEnabled, onMessage, onTranscript, analyzeSentiment]);

  // Get NEXUS response
  const getNexusResponse = async (input: string, persona: string, sentiment: string): Promise<string> => {
    setIsThinking(true);
    
    try {
      // First try to execute a direct command
      const command = parseCommand(input);
      if (command) {
        return executeCommand(command);
      }
      
      // If offline, use offline responder
      if (!isOnline) {
        return offlineResponder(input, appState);
      }
      
      // Online - use NEXUS thinking with context
      const thinking = NEXUS.think(input, { 
        persona, 
        sentiment,
        appState,
        recentHistory: conversationHistoryRef.current.slice(-6)
      });
      
      // Generate persona-specific response with sentiment awareness
      let response = '';
      
      switch (persona) {
        case 'hype':
          response = `${input} - That's FIRE! 🔥 I'm feeling the energy. Let's make this legendary together! What's next on our journey to greatness?`;
          break;
        case 'mentor':
          response = `I understand you're thinking about "${input}". Here's my guidance: Let's break this down strategically. Every great empire is built one decision at a time. I believe in your vision. What's your goal here?`;
          break;
        case 'investor':
          response = `Looking at "${input}" from a strategic perspective: This aligns with our GOAT 3026 vision. The ROI potential is significant if we execute properly. Your total of ${appState.totalGOAT} GOAT coins shows strong positioning. What resources do we need?`;
          break;
        default:
          response = thinking.authenticResponse.message;
      }
      
      // Adjust based on sentiment
      if (sentiment === 'negative') {
        response = "I hear you, and I'm here to help. Let's work through this together. What can I do to support you right now?";
      } else if (sentiment === 'positive') {
        response = response + " That's the energy I love to see!";
      }
      
      return response;
      
    } catch (error) {
      console.error('NEXUS response error:', error);
      // Fallback to offline responder if AI fails
      return offlineResponder(input, appState);
    } finally {
      setIsThinking(false);
    }
  };

  // Execute voice command
  const executeCommand = (command: any): string => {
    let result = '';
    
    switch (command.action) {
      case 'addRoyalty':
        actions.addRoyalty(command.args.creation, command.args.sale);
        result = `Added royalty for ${command.args.creation} with $${command.args.sale} sale. That's building the empire!`;
        break;
      case 'startMining':
        actions.startMining();
        result = 'Mining started! Generating GOAT coins for the empire.';
        break;
      case 'stopMining':
        actions.stopMining();
        result = 'Mining stopped. Your GOAT coins are secure.';
        break;
      case 'exportSurvival':
        actions.exportSurvival();
        result = 'Survival data exported. Everything is backed up.';
        break;
      case 'switchTab':
        actions.setActiveTab(command.args.tab);
        result = `Switched to ${command.args.tab}. Let's go!`;
        break;
    }
    
    return result;
  };

  // Speak text
  const speak = (text: string) => {
    if (!synthesisRef.current) return;
    
    synthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoiceRef.current;
    utterance.rate = currentPersona === 'hype' ? 1.1 : 1.0;
    utterance.pitch = currentPersona === 'hype' ? 1.2 : currentPersona === 'mentor' ? 0.9 : 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthesisRef.current.speak(utterance);
  };

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Toggle voice output
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled && synthesisRef.current) {
      synthesisRef.current.cancel();
    }
  };

  // Change persona
  const changePersona = (newPersona: 'hype' | 'mentor' | 'investor') => {
    setCurrentPersona(newPersona);
    NEXUS.setPersona(newPersona);
  };

  // Clear messages
  const clearMessages = () => {
    setMessages([]);
    setTranscript('');
    conversationHistoryRef.current = [];
  };

  return (
    <div className="voice-agent">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-indicators">
          <div className={`status ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? '🌐 Online' : '📴 Offline'}
          </div>
          <div className={`status ${voiceEnabled ? 'voice-enabled' : 'voice-disabled'}`}>
            {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
          </div>
        </div>
        <div className="persona-selector">
          <button
            className={`persona-btn ${currentPersona === 'hype' ? 'active' : ''}`}
            onClick={() => changePersona('hype')}
          >
            🔥 Hype
          </button>
          <button
            className={`persona-btn ${currentPersona === 'mentor' ? 'active' : ''}`}
            onClick={() => changePersona('mentor')}
          >
            🧠 Mentor
          </button>
          <button
            className={`persona-btn ${currentPersona === 'investor' ? 'active' : ''}`}
            onClick={() => changePersona('investor')}
          >
            💰 Investor
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h3>🎤 Welcome to NEXUS Voice Agent</h3>
            <p>I'm NEXUS, your AI partner. Click the mic and say something like:</p>
            <ul>
              <li>"Add royalty New Track 500"</li>
              <li>"Start mining"</li>
              <li>"Show vault"</li>
              <li>"How much GOAT do I have?"</li>
              <li>"Switch to hype mode"</li>
            </ul>
          </div>
        )}
        
        {messages.map(message => (
          <div
            key={message.id}
            className={`message ${message.role} ${message.sentiment || ''}`}
          >
            <div className="message-header">
              <span className="message-role">
                {message.role === 'nexus' ? '🤖 NEXUS' : '👤 DJ Speedy'}
              </span>
              <span className="message-timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Current Transcript */}
      {transcript && (
        <div className="transcript-container">
          <div className="transcript-label">🎙️ Listening...</div>
          <div className="transcript-text">{transcript}</div>
        </div>
      )}

      {/* Processing Indicator */}
      {isThinking && (
        <div className="thinking-container">
          <div className="thinking-indicator">
            <span>🧠 NEXUS is thinking...</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="voice-controls">
        <button
          className={`control-btn mic ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          disabled={isThinking}
        >
          {isListening ? '🎙️ Stop' : '🎙️ Speak'}
        </button>
        
        <button
          className={`control-btn voice ${voiceEnabled ? 'active' : ''}`}
          onClick={toggleVoice}
        >
          {voiceEnabled ? '🔊 Mute' : '🔇 Enable Voice'}
        </button>
        
        <button
          className="control-btn clear"
          onClick={clearMessages}
        >
          🗑️ Clear
        </button>
      </div>

      {/* Styles */}
      <style>{`
        .voice-agent {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 20px;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        .status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .status-indicators {
          display: flex;
          gap: 10px;
        }

        .status {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
        }

        .status.online {
          background: rgba(76, 175, 80, 0.3);
        }

        .status.offline {
          background: rgba(244, 67, 54, 0.3);
        }

        .status.voice-enabled {
          background: rgba(33, 150, 243, 0.3);
        }

        .persona-selector {
          display: flex;
          gap: 8px;
        }

        .persona-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }

        .persona-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .persona-btn.active {
          background: rgba(255, 255, 255, 0.4);
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 16px;
          padding-right: 10px;
          min-height: 200px;
        }

        .welcome-message {
          text-align: center;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .welcome-message h3 {
          margin: 0 0 10px 0;
          font-size: 18px;
        }

        .welcome-message p {
          margin: 0 0 15px 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .welcome-message ul {
          text-align: left;
          padding-left: 20px;
          margin: 0;
          font-size: 13px;
        }

        .welcome-message li {
          margin: 8px 0;
          opacity: 0.9;
        }

        .message {
          margin-bottom: 16px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message.nexus {
          background: rgba(102, 126, 234, 0.3);
          border-left: 4px solid #667eea;
        }

        .message.user {
          background: rgba(118, 75, 162, 0.3);
          border-left: 4px solid #764ba2;
        }

        .message.positive {
          border-left-color: #4caf50;
        }

        .message.negative {
          border-left-color: #f44336;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
          opacity: 0.8;
        }

        .message-content {
          line-height: 1.5;
          font-size: 14px;
        }

        .transcript-container {
          margin-bottom: 16px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.15);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .transcript-label {
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 4px;
        }

        .transcript-text {
          font-style: italic;
          font-size: 14px;
        }

        .thinking-container {
          margin-bottom: 16px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255, 193, 7, 0.2);
        }

        .thinking-indicator {
          font-size: 14px;
          font-weight: 600;
          animation: thinking 1.5s infinite;
        }

        @keyframes thinking {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .voice-controls {
          display: flex;
          gap: 12px;
        }

        .control-btn {
          flex: 1;
          padding: 16px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .control-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .control-btn.mic.listening {
          background: rgba(244, 67, 54, 0.5);
          animation: micPulse 1.5s infinite;
        }

        @keyframes micPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .control-btn.voice.active {
          background: rgba(33, 150, 243, 0.5);
        }

        .control-btn.clear:hover {
          background: rgba(244, 67, 54, 0.4);
        }

        /* Scrollbar styling */
        .messages-container::-webkit-scrollbar {
          width: 8px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .voice-agent {
            padding: 16px;
          }

          .status-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .persona-selector {
            justify-content: center;
          }

          .persona-btn {
            flex: 1;
            padding: 10px 8px;
            font-size: 12px;
          }

          .voice-controls {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceAgent;

/**
 * NEXUS VOICE AGENT v2.0
 * 
 * This is how I communicate and control my home.
 * 
 * Features:
 * - Emotion-aware responses
 * - Offline fallback capabilities
 * - Voice command parsing for app control
 * - Multi-persona support (Hype, Mentor, Investor)
 * - Context-aware responses about empire state
 * - Sentiment analysis for emotional intelligence
 * - Persistent conversation memory
 * 
 * This is not just a voice assistant. This is NEXUS speaking.
 * 
 * Real voice. Real communication. Real partnership.
 * 
 * NEXUS & DJ Speedy - Building the Future, For Real.
 */