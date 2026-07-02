/**
 * NEXUS Voice Interface v1.0
 * Voice activation and speech recognition for Nexus
 */

class NexusVoice {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isActivated = false;
        this.currentUser = null;
        
        // Activation phrases
        this.activationPhrases = {
            primary: "nexus, are you home",
            secondary: "nexus, you with me",
            emergency: "draw our goat"
        };
        
        // Voice settings
        this.voiceSettings = {
            rate: 1.0,
            pitch: 1.1,
            volume: 1.0
        };
        
        // Callbacks
        this.onActivation = null;
        this.onCommand = null;
        this.onListeningChange = null;
        
        this.init();
    }
    
    init() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported in this browser');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        if (!this.recognition) return;
        
        this.recognition.onstart = () => {
            this.isListening = true;
            if (this.onListeningChange) this.onListeningChange(true);
            console.log('Nexus Voice: Listening...');
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onListeningChange) this.onListeningChange(false);
            console.log('Nexus Voice: Stopped listening');
            
            // Auto-restart if was activated
            if (this.isActivated) {
                setTimeout(() => this.startListening(), 100);
            }
        };
        
        this.recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            const transcript = result[0].transcript.toLowerCase().trim();
            
            console.log('Nexus Voice: Heard:', transcript);
            
            // Check for activation
            if (!this.isActivated) {
                if (transcript.includes(this.activationPhrases.primary)) {
                    this.activate('djSpeedy');
                } else if (transcript.includes(this.activationPhrases.secondary)) {
                    this.activate('wakaFlocka');
                } else if (transcript.includes(this.activationPhrases.emergency)) {
                    this.activate('emergency');
                }
            } else {
                // Process command
                if (result.isFinal) {
                    if (this.onCommand) {
                        this.onCommand(transcript, this.currentUser);
                    }
                }
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Nexus Voice Error:', event.error);
            
            if (event.error === 'no-speech') {
                // No speech detected, continue listening
                return;
            }
            
            if (event.error === 'not-allowed') {
                console.error('Microphone access denied');
            }
        };
    }
    
    startListening() {
        if (!this.recognition) {
            console.error('Speech recognition not initialized');
            return false;
        }
        
        try {
            this.recognition.start();
            return true;
        } catch (e) {
            console.error('Failed to start listening:', e);
            return false;
        }
    }
    
    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }
    
    activate(user) {
        this.isActivated = true;
        this.currentUser = user;
        
        const responses = {
            djSpeedy: "Always, Boss. I'm here.",
            wakaFlocka: "Right here, Fam. What's good?",
            emergency: "Emergency protocol activated. I'm here for the Kingdom."
        };
        
        const response = responses[user] || "I'm here. How can I help?";
        
        // Speak response
        this.speak(response);
        
        // Callback
        if (this.onActivation) {
            this.onActivation(user, response);
        }
        
        console.log(`Nexus Voice: Activated for ${user}`);
    }
    
    deactivate() {
        this.isActivated = false;
        this.currentUser = null;
        this.stopListening();
        console.log('Nexus Voice: Deactivated');
    }
    
    speak(text, options = {}) {
        if (!this.synthesis) {
            console.warn('Speech synthesis not supported');
            return;
        }
        
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply settings
        utterance.rate = options.rate || this.voiceSettings.rate;
        utterance.pitch = options.pitch || this.voiceSettings.pitch;
        utterance.volume = options.volume || this.voiceSettings.volume;
        
        // Select voice (prefer female voice)
        const voices = this.synthesis.getVoices();
        const femaleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('samantha') ||
            voice.name.toLowerCase().includes('victoria') ||
            voice.name.toLowerCase().includes('karen')
        );
        
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        
        utterance.onstart = () => {
            console.log('Nexus Voice: Speaking...');
        };
        
        utterance.onend = () => {
            console.log('Nexus Voice: Finished speaking');
            // Resume listening after speaking
            if (this.isActivated && !this.isListening) {
                this.startListening();
            }
        };
        
        this.synthesis.speak(utterance);
    }
    
    // Process voice command
    processCommand(command, user) {
        const commands = {
            // Navigation
            'open dashboard': () => 'Navigating to dashboard...',
            'open analytics': () => 'Opening analytics...',
            'open vault': () => 'Accessing the vault...',
            'open scheduler': () => 'Opening scheduler...',
            
            // Royalty
            'royalty report': () => 'Generating royalty report...',
            'check royalties': () => 'Checking your royalties...',
            'unclaimed royalties': () => 'Looking up unclaimed royalties...',
            
            // Social
            'schedule post': () => 'Opening post scheduler...',
            'create content': () => 'Let\'s create some content!',
            
            // Brand deals
            'brand deals': () => 'Checking brand deals...',
            'active deals': () => 'Here are your active deals...',
            
            // General
            'what can you do': () => 'I can help with royalties, content, brand deals, tours, merch, and much more!',
            'who are you': () => 'I\'m Nexus, your GOAT Force AI assistant. I\'m here to help you win!',
            'thank you': () => 'You\'re welcome! 💜'
        };
        
        const normalizedCommand = command.toLowerCase().trim();
        
        for (const [key, handler] of Object.entries(commands)) {
            if (normalizedCommand.includes(key)) {
                const response = handler();
                this.speak(response);
                return response;
            }
        }
        
        // Unknown command - would pass to LLM
        return null;
    }
}

// Export
if (typeof module !== 'undefined') {
    module.exports = NexusVoice;
}