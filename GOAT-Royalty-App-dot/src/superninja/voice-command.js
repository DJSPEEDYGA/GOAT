/**
 * VOICE COMMAND CONTROL SYSTEM
 * Control the GOAT Royalty App with your voice
 * Created by SuperNinja - NinjaTech AI
 */

const { EventEmitter } = require('events');

class VoiceCommandSystem extends EventEmitter {
  constructor() {
    super();
    this.isListening = false;
    this.commands = new Map();
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.confidenceThreshold = 0.7;
    this.language = 'en-US';
    this.commandHistory = [];
    this.isInitialized = false;
  }

  /**
   * Initialize voice command system
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('⚠️ Voice Command System already initialized');
      return;
    }
    
    console.log('🎤 Voice Command System initializing...');
    
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('⚠️ Speech recognition not supported in this browser');
      return false;
    }
    
    // Setup speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.language;
    this.recognition.maxAlternatives = 3;
    
    // Setup event handlers
    this.recognition.onresult = (event) => this.handleResult(event);
    this.recognition.onerror = (event) => this.handleError(event);
    this.recognition.onend = () => this.handleEnd();
    
    // Register built-in commands
    this.registerBuiltInCommands();
    
    this.isInitialized = true;
    console.log('✅ Voice Command System ready');
    
    return true;
  }

  /**
   * Register built-in commands
   */
  registerBuiltInCommands() {
    // Production commands
    this.registerCommand('start recording', {
      description: 'Start audio recording',
      action: () => this.emit('command:recording:start'),
      category: 'production'
    });
    
    this.registerCommand('stop recording', {
      description: 'Stop audio recording',
      action: () => this.emit('command:recording:stop'),
      category: 'production'
    });
    
    this.registerCommand('play', {
      description: 'Play current track',
      action: () => this.emit('command:playback:play'),
      category: 'playback'
    });
    
    this.registerCommand('pause', {
      description: 'Pause playback',
      action: () => this.emit('command:playback:pause'),
      category: 'playback'
    });
    
    this.registerCommand('stop', {
      description: 'Stop playback',
      action: () => this.emit('command:playback:stop'),
      category: 'playback'
    });
    
    // Navigation commands
    this.registerCommand('go to dashboard', {
      description: 'Navigate to dashboard',
      action: () => this.emit('command:navigate:dashboard'),
      category: 'navigation'
    });
    
    this.registerCommand('go to studio', {
      description: 'Navigate to studio',
      action: () => this.emit('command:navigate:studio'),
      category: 'navigation'
    });
    
    this.registerCommand('go to analytics', {
      description: 'Navigate to analytics',
      action: () => this.emit('command:navigate:analytics'),
      category: 'navigation'
    });
    
    // AI commands
    this.registerCommand('produce track', {
      description: 'Start AI music production',
      action: () => this.emit('command:ai:produce'),
      category: 'ai'
    });
    
    this.registerCommand('optimize royalties', {
      description: 'Run royalty optimization',
      action: () => this.emit('command:ai:optimize'),
      category: 'ai'
    });
    
    this.registerCommand('curate playlist', {
      description: 'Create AI playlist',
      action: () => this.emit('command:ai:curate'),
      category: 'ai'
    });
    
    // System commands
    this.registerCommand('activate stealth mode', {
      description: 'Enable stealth mode',
      action: () => this.emit('command:system:stealth-on'),
      category: 'system'
    });
    
    this.registerCommand('deactivate stealth mode', {
      description: 'Disable stealth mode',
      action: () => this.emit('command:system:stealth-off'),
      category: 'system'
    });
    
    this.registerCommand('save project', {
      description: 'Save current project',
      action: () => this.emit('command:system:save'),
      category: 'system'
    });
    
    this.registerCommand('new project', {
      description: 'Create new project',
      action: () => this.emit('command:system:new'),
      category: 'system'
    });
    
    // Theme commands
    this.registerCommand('activate ninja mode', {
      description: 'Enable ninja theme',
      action: () => this.emit('command:theme:ninja'),
      category: 'theme'
    });
    
    this.registerCommand('switch to light mode', {
      description: 'Switch to light theme',
      action: () => this.emit('command:theme:light'),
      category: 'theme'
    });
    
    // Help commands
    this.registerCommand('what can I say', {
      description: 'List available commands',
      action: () => this.listCommands(),
      category: 'help'
    });
    
    this.registerCommand('help', {
      description: 'Show help information',
      action: () => this.speak('I can help you with recording, playback, navigation, AI features, and system commands. Say "what can I say" for a full list.'),
      category: 'help'
    });
  }

  /**
   * Register custom command
   */
  registerCommand(phrase, config) {
    const command = {
      phrase: phrase.toLowerCase(),
      description: config.description || '',
      action: config.action || (() => {}),
      category: config.category || 'custom',
      enabled: true,
      usageCount: 0
    };
    
    this.commands.set(phrase.toLowerCase(), command);
    console.log(`🎤 Command registered: "${phrase}"`);
  }

  /**
   * Start listening
   */
  startListening() {
    if (!this.isInitialized) {
      console.warn('⚠️ Voice Command System not initialized');
      return false;
    }
    
    if (this.isListening) {
      console.log('⚠️ Already listening');
      return false;
    }
    
    try {
      this.recognition.start();
      this.isListening = true;
      this.emit('listening-started');
      console.log('🎤 Listening...');
      return true;
    } catch (error) {
      console.error('❌ Failed to start listening:', error);
      return false;
    }
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (!this.isListening) {
      return false;
    }
    
    try {
      this.recognition.stop();
      this.isListening = false;
      this.emit('listening-stopped');
      console.log('🎤 Stopped listening');
      return true;
    } catch (error) {
      console.error('❌ Failed to stop listening:', error);
      return false;
    }
  }

  /**
   * Handle speech recognition result
   */
  handleResult(event) {
    const results = event.results;
    const latestResult = results[results.length - 1];
    const transcript = latestResult[0].transcript.trim();
    const confidence = latestResult[0].confidence;
    
    if (latestResult.isFinal) {
      console.log(`🗣️ Recognized: "${transcript}" (confidence: ${confidence.toFixed(2)})`);
      
      // Add to history
      this.commandHistory.push({
        transcript,
        confidence,
        timestamp: Date.now(),
        executed: false
      });
      
      // Try to match and execute command
      if (confidence >= this.confidenceThreshold) {
        this.executeCommand(transcript);
      } else {
        console.warn('⚠️ Confidence too low to execute command');
        this.emit('command:rejected', { transcript, confidence });
      }
    } else {
      // Interim result
      this.emit('interim-result', { transcript, confidence });
    }
  }

  /**
   * Execute command
   */
  executeCommand(transcript) {
    const lowerTranscript = transcript.toLowerCase();
    
    // Try exact match first
    if (this.commands.has(lowerTranscript)) {
      const command = this.commands.get(lowerTranscript);
      this.runCommand(command, transcript);
      return;
    }
    
    // Try partial match
    for (const [phrase, command] of this.commands) {
      if (lowerTranscript.includes(phrase) || phrase.includes(lowerTranscript)) {
        this.runCommand(command, transcript);
        return;
      }
    }
    
    // No match found
    console.warn('⚠️ No matching command found');
    this.emit('command:not-found', { transcript });
    this.speak("I didn't understand that command");
  }

  /**
   * Run command
   */
  runCommand(command, transcript) {
    console.log(`✅ Executing command: "${command.phrase}"`);
    
    command.usageCount++;
    
    // Update command history
    const historyItem = this.commandHistory[this.commandHistory.length - 1];
    if (historyItem) {
      historyItem.executed = true;
      historyItem.matchedPhrase = command.phrase;
    }
    
    // Execute command action
    try {
      command.action();
      this.emit('command:executed', {
        phrase: command.phrase,
        transcript,
        category: command.category
      });
    } catch (error) {
      console.error('❌ Command execution error:', error);
      this.emit('command:error', {
        phrase: command.phrase,
        error: error.message
      });
    }
  }

  /**
   * Handle speech recognition error
   */
  handleError(event) {
    console.error('❌ Speech recognition error:', event.error);
    this.emit('recognition-error', { error: event.error });
    
    if (event.error === 'not-allowed') {
      this.speak('Microphone access denied. Please allow microphone access.');
    }
  }

  /**
   * Handle speech recognition end
   */
  handleEnd() {
    if (this.isListening) {
      // Restart if still supposed to be listening
      setTimeout(() => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (error) {
            console.error('❌ Failed to restart recognition:', error);
          }
        }
      }, 100);
    }
  }

  /**
   * Speak text
   */
  speak(text) {
    if (!this.synthesis) {
      console.warn('⚠️ Speech synthesis not supported');
      return;
    }
    
    // Cancel any ongoing speech
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.language;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    this.synthesis.speak(utterance);
    console.log(`🔊 Speaking: "${text}"`);
  }

  /**
   * List available commands
   */
  listCommands() {
    const categories = {};
    
    for (const [phrase, command] of this.commands) {
      if (!categories[command.category]) {
        categories[command.category] = [];
      }
      
      categories[command.category].push({
        phrase,
        description: command.description,
        usageCount: command.usageCount
      });
    }
    
    const response = `Available commands:\n\n` +
      Object.entries(categories)
        .map(([category, commands]) =>
          `${category.toUpperCase()}:\n` +
          commands.map(c => `  • "${c.phrase}" - ${c.description}`).join('\n')
        )
        .join('\n\n');
    
    console.log(response);
    this.speak(`I have ${this.commands.size} commands available. Check the console for the full list.`);
    this.emit('commands-listed', categories);
    
    return categories;
  }

  /**
   * Get command history
   */
  getCommandHistory(limit = 20) {
    return this.commandHistory.slice(-limit);
  }

  /**
   * Get commands by category
   */
  getCommandsByCategory(category) {
    const commands = [];
    
    for (const [phrase, command] of this.commands) {
      if (command.category === category) {
        commands.push({ phrase, ...command });
      }
    }
    
    return commands;
  }

  /**
   * Enable command
   */
  enableCommand(phrase) {
    const command = this.commands.get(phrase.toLowerCase());
    if (command) {
      command.enabled = true;
      console.log(`✅ Command enabled: "${phrase}"`);
    }
  }

  /**
   * Disable command
   */
  disableCommand(phrase) {
    const command = this.commands.get(phrase.toLowerCase());
    if (command) {
      command.enabled = false;
      console.log(`🚫 Command disabled: "${phrase}"`);
    }
  }

  /**
   * Set language
   */
  setLanguage(language) {
    this.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
    console.log(`🌐 Language set to: ${language}`);
  }

  /**
   * Set confidence threshold
   */
  setConfidenceThreshold(threshold) {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
    console.log(`🎯 Confidence threshold set to: ${this.confidenceThreshold}`);
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isListening: this.isListening,
      language: this.language,
      confidenceThreshold: this.confidenceThreshold,
      totalCommands: this.commands.size,
      commandHistorySize: this.commandHistory.length
    };
  }

  /**
   * Clear command history
   */
  clearHistory() {
    this.commandHistory = [];
    console.log('🗑️ Command history cleared');
  }
}

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceCommandSystem;
}