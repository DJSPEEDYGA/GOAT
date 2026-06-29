/**
 * GOAT Force — Voice Studio
 * Complete TTS (Text-to-Speech) + STT (Speech-to-Text) System
 * Uses Web Speech API for browser-native voice capabilities
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, Square, Mic, MicOff, Volume2, VolumeX, 
  Download, Settings, Zap, Globe, RefreshCw, Copy, 
  Trash2, Save, ChevronDown, Waveform
} from 'lucide-react';

export default function VoiceStudio() {
  // ═══ TTS STATE ═══
  const [ttsText, setTtsText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [ttsHistory, setTtsHistory] = useState([]);

  // ═══ STT STATE ═══
  const [isListening, setIsListening] = useState(false);
  const [sttText, setSttText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [sttLanguage, setSttLanguage] = useState('en-US');
  const [continuous, setContinuous] = useState(true);
  const [sttHistory, setSttHistory] = useState([]);
  const [confidence, setConfidence] = useState(0);

  // ═══ UI STATE ═══
  const [activeTab, setActiveTab] = useState('tts');
  const [showSettings, setShowSettings] = useState(false);
  const [visualizerBars, setVisualizerBars] = useState(Array(32).fill(5));

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const animFrameRef = useRef(null);

  // ═══ LANGUAGES FOR STT ═══
  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese (BR)', flag: '🇧🇷' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh-CN', name: 'Chinese (Mandarin)', flag: '🇨🇳' },
    { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  ];

  // ═══ LOAD VOICES ═══
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    
    const loadVoices = () => {
      const availableVoices = synthRef.current?.getVoices() || [];
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    loadVoices();
    if (synthRef.current) {
      synthRef.current.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ═══ AUDIO VISUALIZER ═══
  const animateVisualizer = useCallback((active) => {
    if (!active) {
      setVisualizerBars(Array(32).fill(5));
      return;
    }
    const animate = () => {
      setVisualizerBars(prev => prev.map(() => 
        active ? Math.random() * 80 + 10 : 5
      ));
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
  }, []);

  // ═══ TTS FUNCTIONS ═══
  const speak = () => {
    if (!ttsText.trim() || !synthRef.current) return;
    
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(ttsText);
    
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      animateVisualizer(true);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      animateVisualizer(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      animateVisualizer(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };

    synthRef.current.speak(utterance);
    setTtsHistory(prev => [{
      text: ttsText.substring(0, 100) + (ttsText.length > 100 ? '...' : ''),
      voice: selectedVoice?.name || 'Default',
      time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 20));
  };

  const pauseResume = () => {
    if (!synthRef.current) return;
    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      animateVisualizer(true);
    } else {
      synthRef.current.pause();
      setIsPaused(true);
      animateVisualizer(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  };

  const stopSpeaking = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    animateVisualizer(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  // ═══ STT FUNCTIONS ═══
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = sttLanguage;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      animateVisualizer(true);
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const conf = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          final += transcript;
          setConfidence(Math.round(conf * 100));
        } else {
          interim += transcript;
        }
      }
      
      if (final) {
        setSttText(prev => prev + (prev ? ' ' : '') + final);
        setSttHistory(prev => [{
          text: final.substring(0, 100),
          confidence: Math.round(event.results[event.results.length - 1][0].confidence * 100),
          time: new Date().toLocaleTimeString(),
          lang: sttLanguage
        }, ...prev].slice(0, 20));
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      console.error('STT Error:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
        animateVisualizer(false);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
      animateVisualizer(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setInterimText('');
    animateVisualizer(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const sendToTTS = () => {
    setTtsText(sttText);
    setActiveTab('tts');
  };

  // ═══ VOICE CATEGORIES ═══
  const categorizeVoices = () => {
    const categories = {};
    voices.forEach(v => {
      const lang = v.lang?.split('-')[0] || 'other';
      if (!categories[lang]) categories[lang] = [];
      categories[lang].push(v);
    });
    return categories;
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'linear-gradient(135deg, #1a0000 0%, #0A0A0A 40%, #0A0A0A 60%, #1a0505 100%)' }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-gradient-to-br from-red-600 to-yellow-600 rounded-2xl">
            <Volume2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent"
                style={{ fontFamily: "var(--font-display)" }}>
              GOAT VOICE STUDIO
            </h1>
            <p className="text-white/50 text-sm tracking-widest uppercase"
               style={{ fontFamily: "var(--font-tech)" }}>
              Text-to-Speech & Speech-to-Text Engine
            </p>
          </div>
        </div>

        {/* Audio Visualizer Bar */}
        <div className="flex items-end gap-[2px] h-12 mt-4 bg-black/30 rounded-xl p-2 overflow-hidden">
          {visualizerBars.map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-t transition-all duration-75"
              style={{
                height: `${height}%`,
                background: `linear-gradient(to top, ${i % 3 === 0 ? '#DC2626' : i % 3 === 1 ? '#F59E0B' : '#EF4444'}, transparent)`,
                opacity: (isSpeaking || isListening) ? 0.9 : 0.2
              }}
            />
          ))}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex gap-2 bg-black/30 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('tts')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
              activeTab === 'tts'
                ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white shadow-lg shadow-red-500/25'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <Volume2 className="w-5 h-5" />
            Text to Speech
          </button>
          <button
            onClick={() => setActiveTab('stt')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
              activeTab === 'stt'
                ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white shadow-lg shadow-red-500/25'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <Mic className="w-5 h-5" />
            Speech to Text
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* ═══════════════════════════════════════ */}
        {/* TTS TAB */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'tts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main TTS Panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* Text Input */}
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 backdrop-blur-md rounded-2xl border border-red-500/20 p-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white/70 text-sm uppercase tracking-wider"
                         style={{ fontFamily: "var(--font-tech)" }}>
                    Enter Text
                  </label>
                  <span className="text-white/30 text-xs">{ttsText.length} chars</span>
                </div>
                <textarea
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  placeholder="Type or paste text here to convert to speech..."
                  className="w-full h-48 bg-black/40 text-white rounded-xl p-4 border border-white/10 focus:border-red-500/50 focus:outline-none resize-none placeholder-white/20"
                  style={{ fontFamily: "var(--font-body)" }}
                />
                
                {/* Controls */}
                <div className="flex items-center gap-3 mt-4">
                  {!isSpeaking ? (
                    <button
                      onClick={speak}
                      disabled={!ttsText.trim()}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-yellow-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed goat-glow shadow-red-500/25"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      <Play className="w-5 h-5" />
                      SPEAK
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={pauseResume}
                        className="flex items-center gap-2 px-5 py-3 bg-yellow-600 text-white font-bold rounded-xl hover:bg-yellow-700 transition-all"
                      >
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                        {isPaused ? 'RESUME' : 'PAUSE'}
                      </button>
                      <button
                        onClick={stopSpeaking}
                        className="flex items-center gap-2 px-5 py-3 bg-red-700 text-white font-bold rounded-xl hover:bg-red-800 transition-all"
                      >
                        <Square className="w-5 h-5" />
                        STOP
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setTtsText('')}
                    className="p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    title="Clear text"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(ttsText)}
                    className="p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    title="Copy text"
                  >
                    <Copy className="w-5 h-5" />
                  </button>

                  {/* Status */}
                  {isSpeaking && (
                    <div className="ml-auto flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
                      <span className="text-white/50 text-sm">{isPaused ? 'Paused' : 'Speaking...'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Speed / Pitch / Volume Controls */}
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 backdrop-blur-md rounded-2xl border border-red-500/20 p-6">
                <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm"
                    style={{ fontFamily: "var(--font-tech)" }}>
                  ⚡ Voice Controls
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">
                      Speed: {rate.toFixed(1)}x
                    </label>
                    <input
                      type="range" min="0.5" max="2" step="0.1"
                      value={rate}
                      onChange={(e) => setRate(parseFloat(e.target.value))}
                      className="w-full accent-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">
                      Pitch: {pitch.toFixed(1)}
                    </label>
                    <input
                      type="range" min="0.5" max="2" step="0.1"
                      value={pitch}
                      onChange={(e) => setPitch(parseFloat(e.target.value))}
                      className="w-full accent-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">
                      Volume: {Math.round(volume * 100)}%
                    </label>
                    <input
                      type="range" min="0" max="1" step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full accent-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Phrases */}
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 backdrop-blur-md rounded-2xl border border-red-500/20 p-6">
                <h3 className="text-white font-bold mb-3 uppercase tracking-wider text-sm"
                    style={{ fontFamily: "var(--font-tech)" }}>
                  🎯 Quick Phrases
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Welcome to GOAT Force Royalty Command Center",
                    "Your royalty report is ready for review",
                    "New track detected with 1.2 billion streams",
                    "Alert: Unauthorized sample usage detected",
                    "DJ Speedy in the building!",
                    "GOAT Force systems are fully operational",
                    "Royalty payment of $865,000 has been processed",
                    "Agent Codex 008 reporting for duty"
                  ].map((phrase, i) => (
                    <button
                      key={i}
                      onClick={() => setTtsText(phrase)}
                      className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-white/70 text-xs rounded-xl hover:bg-red-500/20 hover:text-white transition-all"
                    >
                      {phrase.substring(0, 40)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Voice Selector Sidebar */}
            <div className="space-y-4">
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 backdrop-blur-md rounded-2xl border border-red-500/20 p-6">
                <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm"
                    style={{ fontFamily: "var(--font-tech)" }}>
                  🎤 Select Voice ({voices.length})
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {voices.map((voice, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVoice(voice)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        selectedVoice === voice
                          ? 'bg-gradient-to-r from-red-600/30 to-yellow-600/20 border border-red-500/50'
                          : 'bg-black/20 border border-white/5 hover:border-red-500/30'
                      }`}
                    >
                      <div className="text-white text-sm font-semibold truncate">{voice.name}</div>
                      <div className="text-white/40 text-xs truncate">{voice.lang}</div>
                    </button>
                  ))}
                  {voices.length === 0 && (
                    <p className="text-white/30 text-sm text-center py-4">Loading voices...</p>
                  )}
                </div>
              </div>

              {/* TTS History */}
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 backdrop-blur-md rounded-2xl border border-red-500/20 p-6">
                <h3 className="text-white font-bold mb-3 uppercase tracking-wider text-sm"
                    style={{ fontFamily: "var(--font-tech)" }}>
                  📜 History
                </h3>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {ttsHistory.length === 0 ? (
                    <p className="text-white/20 text-sm text-center py-4">No history yet</p>
                  ) : ttsHistory.map((item, i) => (
                    <div key={i} className="p-2 bg-black/20 rounded-xl">
                      <div className="text-white/70 text-xs truncate">{item.text}</div>
                      <div className="text-white/30 text-[10px] mt-1">{item.voice} • {item.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* STT TAB */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'stt' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main STT Panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* Mic Control */}
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 backdrop-blur-md rounded-2xl border border-red-500/20 p-8 text-center">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`relative w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${
                    isListening
                      ? 'bg-gradient-to-br from-red-600 to-red-800 shadow-[0_0_60px_rgba(220,38,38,0.5)] scale-110'
                      : 'bg-gradient-to-br from-red-600 to-yellow-600 shadow-lg shadow-red-500/25 hover:scale-105'
                  }`}
                >
                  {isListening && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                      <div className="absolute -inset-4 rounded-full border-2 border-red-500/30 animate-pulse" />
                      <div className="absolute -inset-8 rounded-full border border-red-500/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </>
                  )}
                  {isListening ? (
                    <MicOff className="w-12 h-12 text-white relative z-10" />
                  ) : (
                    <Mic className="w-12 h-12 text-white relative z-10" />
                  )}
                </button>
                <p className="mt-4 text-lg font-bold text-white"
                   style={{ fontFamily: "var(--font-heading)" }}>
                  {isListening ? '🔴 LISTENING...' : 'TAP TO SPEAK'}
                </p>
                <p className="text-white/40 text-sm mt-1">
                  {isListening ? 'Speak clearly into your microphone' : 'Click the microphone to start voice recognition'}
                </p>
                {confidence > 0 && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-green-400 text-xs font-bold">{confidence}% Confidence</span>
                  </div>
                )}
              </div>

              {/* Transcription Output */}
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 backdrop-blur-md rounded-2xl border border-red-500/20 p-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white/70 text-sm uppercase tracking-wider"
                         style={{ fontFamily: "var(--font-tech)" }}>
                    Transcription
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(sttText)}
                      className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={sendToTTS}
                      disabled={!sttText.trim()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs rounded-xl hover:bg-red-500/30 transition-all disabled:opacity-30"
                      title="Send to TTS"
                    >
                      <Volume2 className="w-3 h-3" />
                      Send to TTS
                    </button>
                    <button
                      onClick={() => { setSttText(''); setInterimText(''); }}
                      className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      title="Clear"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="min-h-[200px] bg-black/40 rounded-xl p-4 border border-white/10">
                  {sttText || interimText ? (
                    <div className="text-white text-lg leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                      {sttText}
                      {interimText && (
                        <span className="text-yellow-400/60 italic"> {interimText}</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-white/20 text-center mt-16">
                      Your speech will appear here in real-time...
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 text-white/30 text-xs">
                  <span>{sttText.split(/\s+/).filter(Boolean).length} words</span>
                  <span>{sttText.length} characters</span>
                </div>
              </div>
            </div>

            {/* STT Settings Sidebar */}
            <div className="space-y-4">
              {/* Language Selector */}
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 backdrop-blur-md rounded-2xl border border-red-500/20 p-6">
                <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm"
                    style={{ fontFamily: "var(--font-tech)" }}>
                  🌍 Language
                </h3>
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSttLanguage(lang.code)}
                      className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                        sttLanguage === lang.code
                          ? 'bg-gradient-to-r from-red-600/30 to-yellow-600/20 border border-red-500/50'
                          : 'bg-black/20 border border-white/5 hover:border-red-500/30'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="text-white text-sm">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STT Settings */}
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 backdrop-blur-md rounded-2xl border border-red-500/20 p-6">
                <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm"
                    style={{ fontFamily: "var(--font-tech)" }}>
                  ⚙️ Settings
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-white/70 text-sm">Continuous Mode</span>
                    <div
                      onClick={() => setContinuous(!continuous)}
                      className={`w-12 h-6 rounded-full transition-all cursor-pointer ${
                        continuous ? 'bg-red-600' : 'bg-gray-700'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-all ${
                        continuous ? 'ml-6' : 'ml-0.5'
                      }`} />
                    </div>
                  </label>
                </div>
              </div>

              {/* STT History */}
              <div className="goat-gradient-card goat-gradient-card goat-card-hover/5 backdrop-blur-md rounded-2xl border border-red-500/20 p-6">
                <h3 className="text-white font-bold mb-3 uppercase tracking-wider text-sm"
                    style={{ fontFamily: "var(--font-tech)" }}>
                  📜 Recognition History
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {sttHistory.length === 0 ? (
                    <p className="text-white/20 text-sm text-center py-4">No history yet</p>
                  ) : sttHistory.map((item, i) => (
                    <div key={i} className="p-2 bg-black/20 rounded-xl">
                      <div className="text-white/70 text-xs truncate">{item.text}</div>
                      <div className="text-white/30 text-[10px] mt-1">
                        {item.confidence}% • {item.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}