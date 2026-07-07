import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, Settings, Mic, Zap, Globe, User } from 'lucide-react';

export default function TextToSpeechStudio() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [speed, setSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const voices = [
    {
      id: 'alloy',
      name: 'Alloy',
      description: 'Neutral and balanced voice',
      gender: 'Neutral',
      accent: 'American',
      icon: '🎭',
      color: 'from-blue-500 to-cyan-500',
      sample: 'Professional and clear'
    },
    {
      id: 'echo',
      name: 'Echo',
      description: 'Warm and engaging voice',
      gender: 'Male',
      accent: 'American',
      icon: '🎤',
      color: 'from-purple-500 to-pink-500',
      sample: 'Friendly and approachable'
    },
    {
      id: 'fable',
      name: 'Fable',
      description: 'Expressive storytelling voice',
      gender: 'Male',
      accent: 'British',
      icon: '📖',
      color: 'from-green-500 to-emerald-500',
      sample: 'Perfect for narration'
    },
    {
      id: 'onyx',
      name: 'Onyx',
      description: 'Deep and authoritative voice',
      gender: 'Male',
      accent: 'American',
      icon: '💎',
      color: 'from-gray-700 to-gray-900',
      sample: 'Strong and confident'
    },
    {
      id: 'nova',
      name: 'Nova',
      description: 'Energetic and youthful voice',
      gender: 'Female',
      accent: 'American',
      icon: '⭐',
      color: 'from-yellow-500 to-orange-500',
      sample: 'Bright and enthusiastic'
    },
    {
      id: 'shimmer',
      name: 'Shimmer',
      description: 'Soft and soothing voice',
      gender: 'Female',
      accent: 'American',
      icon: '✨',
      color: 'from-pink-500 to-rose-500',
      sample: 'Gentle and calming'
    }
  ];

  const presetTexts = [
    {
      category: 'Music Production',
      texts: [
        'Welcome to your music production studio. Let\'s create something amazing today.',
        'Your track is now ready for mastering. Would you like to proceed?',
        'Recording session started. Please begin when ready.',
        'Mix completed successfully. Exporting to WAV format.'
      ]
    },
    {
      category: 'Royalty Updates',
      texts: [
        'You have received a new royalty payment of $2,450 from Spotify.',
        'Your track "Summer Vibes" has reached 1 million streams!',
        'Monthly royalty report is now available for download.',
        'New contract pending your approval in the IP Protection Vault.'
      ]
    },
    {
      category: 'Studio Notifications',
      texts: [
        'Your virtual concert is scheduled to start in 30 minutes.',
        'New collaboration request from Harvey Miller.',
        'Track upload completed. Now available on all platforms.',
        'Backup completed successfully. All files are secure.'
      ]
    }
  ];

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      alert('Please enter some text to convert to speech');
      return;
    }

    // Simulate API call to OpenAI TTS
    // In production, this would call: https://api.openai.com/v1/audio/speech
    console.log('Generating speech with:', {
      voice: selectedVoice,
      text: text,
      speed: speed
    });

    // For demo, use Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
    } else {
      alert('Text-to-Speech not supported in this browser. In production, this would use OpenAI TTS API.');
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleDownload = () => {
    alert('In production, this would download the generated audio file as MP3/WAV');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🎤 Text-to-Speech Studio
            </h1>
            <p className="text-indigo-300">
              ChatGPT-style voice synthesis • Powered by OpenAI TTS
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Text Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Text Area */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-400" />
              Enter Text
            </h3>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here... (e.g., 'Welcome to your music production studio. Let's create something amazing today.')"
              className="w-full h-64 bg-gray-900 text-white p-4 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-400">
                {text.length} characters • {text.split(' ').filter(w => w).length} words
              </div>
              <button
                onClick={() => setText('')}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Voice Settings
            </h3>
            
            {/* Speed Control */}
            <div className="mb-6">
              <label className="text-white font-medium mb-2 block">
                Speed: {speed.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.25"
                max="4.0"
                step="0.25"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0.25x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>4.0x (Fast)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerateSpeech}
                disabled={!text.trim() || isPlaying}
                className={`flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  !text.trim() || isPlaying
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                }`}
              >
                <Play className="w-5 h-5" />
                Generate Speech
              </button>
              {isPlaying && (
                <button
                  onClick={handleStop}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all flex items-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Stop
                </button>
              )}
              <button
                onClick={handleDownload}
                disabled={!text.trim()}
                className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                  !text.trim()
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                }`}
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preset Texts */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Quick Presets</h3>
            <div className="space-y-4">
              {presetTexts.map((category, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-bold text-gray-400 mb-2">{category.category}</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {category.texts.map((presetText, i) => (
                      <button
                        key={i}
                        onClick={() => setText(presetText)}
                        className="text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-all"
                      >
                        {presetText}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Voice Selection Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Select Voice
            </h3>
            <div className="space-y-3">
              {voices.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`w-full p-4 rounded-lg transition-all text-left ${
                    selectedVoice === voice.id
                      ? `bg-gradient-to-r ${voice.color} text-white shadow-lg`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">{voice.icon}</div>
                    <div>
                      <div className="font-bold">{voice.name}</div>
                      <div className="text-xs opacity-80">{voice.gender} • {voice.accent}</div>
                    </div>
                  </div>
                  <div className="text-xs opacity-90">{voice.description}</div>
                  <div className="text-xs mt-2 italic opacity-75">"{voice.sample}"</div>
                </button>
              ))}
            </div>
          </div>

          {/* API Info */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              OpenAI TTS API
            </h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>• 6 natural voices</div>
              <div>• Multiple languages</div>
              <div>• HD audio quality</div>
              <div>• Real-time generation</div>
              <div>• MP3/WAV export</div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h4 className="text-white font-bold mb-3">Usage Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Generated Today:</span>
                <span className="text-white font-bold">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Characters:</span>
                <span className="text-white font-bold">12,450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Favorite Voice:</span>
                <span className="text-white font-bold">Alloy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">💡</div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              ChatGPT-Style Text-to-Speech
            </h3>
            <p className="text-gray-300 mb-4">
              Convert any text to natural-sounding speech using OpenAI's advanced TTS technology. 
              Perfect for voiceovers, notifications, audiobooks, and more.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-2xl mb-1">🎤</div>
                <div className="text-sm text-gray-300">6 Voices</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-2xl mb-1">🌍</div>
                <div className="text-sm text-gray-300">Multi-Language</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-sm text-gray-300">Real-time</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-2xl mb-1">💎</div>
                <div className="text-sm text-gray-300">HD Quality</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}