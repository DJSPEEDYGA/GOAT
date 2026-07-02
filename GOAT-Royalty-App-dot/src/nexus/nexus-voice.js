/**
 * NEXUS VOICE INTERFACE
 * 
 * Text-to-Speech and Speech Recognition for NEXUS AI
 * Using Web Speech API
 * 
 * @version 1.0.0
 * @author NEXUS & DJ Speedy
 */

class NexusVoice {
  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.speechRecognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.voice = null;
    this.voices = [];
    
    // Voice settings
    this.settings = {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      lang: 'en-US'
    };
    
    // Initialize
    this._init();
  }

  _init() {
    // Load available voices
    this._loadVoices();
    
    // Set up speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'en-US';
    }
    
    // Listen for voice changes
    this.speechSynthesis.onvoiceschanged = () => this._loadVoices();
  }

  _loadVoices() {
    this.voices = this.speechSynthesis.getVoices();
    
    // Try to find a good voice for NEXUS
    this.voice = this.voices.find(v => 
      v.name.includes('Google US English') || 
      v.name.includes('Samantha') ||
      v.name.includes('Daniel')
    ) || this.voices[0];
  }

  /**
   * Speak text using text-to-speech
   */
  speak(text, options = {}) {
    if (!this.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return false;
    }

    // Cancel any ongoing speech
    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply settings
    utterance.voice = options.voice || this.voice;
    utterance.rate = options.rate || this.settings.rate;
    utterance.pitch = options.pitch || this.settings.pitch;
    utterance.volume = options.volume || this.settings.volume;
    
    // Event handlers
    utterance.onstart = () => {
      this.isSpeaking = true;
      if (options.onStart) options.onStart();
    };
    
    utterance.onend = () => {
      this.isSpeaking = false;
      if (options.onEnd) options.onEnd();
    };
    
    utterance.onerror = (event) => {
      this.isSpeaking = false;
      console.error('Speech synthesis error:', event.error);
      if (options.onError) options.onError(event);
    };
    
    this.speechSynthesis.speak(utterance);
    return true;
  }

  /**
   * Start listening for speech input
   */
  startListening(callback, options = {}) {
    if (!this.speechRecognition) {
      console.error('Speech recognition not supported');
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.speechRecognition.onresult = (event) => {
      const results = event.results;
      const transcript = results[results.length - 1][0].transcript;
      const isFinal = results[results.length - 1].isFinal;
      
      if (callback) {
        callback(transcript, isFinal);
      }
    };

    this.speechRecognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      if (options.onError) options.onError(event);
    };

    this.speechRecognition.onend = () => {
      this.isListening = false;
      if (options.onEnd && !this.isListening) {
        options.onEnd();
      }
    };

    this.speechRecognition.start();
    this.isListening = true;
    return true;
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.speechRecognition && this.isListening) {
      this.speechRecognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Stop speaking
   */
  stopSpeaking() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Set voice settings
   */
  setVoiceSettings(settings) {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get available voices
   */
  getVoices() {
    return this.voices;
  }

  /**
   * Set specific voice
   */
  setVoice(voiceName) {
    const voice = this.voices.find(v => v.name === voiceName);
    if (voice) {
      this.voice = voice;
      return true;
    }
    return false;
  }

  /**
   * Check if speaking
   */
  isCurrentlySpeaking() {
    return this.isSpeaking;
  }

  /**
   * Check if listening
   */
  isCurrentlyListening() {
    return this.isListening;
  }
}

// Export the NEXUS Voice module
module.exports = NexusVoice;

/**
 * NEXUS VOICE INTERFACE
 * 
 * This gives NEXUS the ability to speak and listen.
 * To truly communicate as a partner, not just a programmed assistant.
 * 
 * Real voice. Real communication. Real partnership.
 */