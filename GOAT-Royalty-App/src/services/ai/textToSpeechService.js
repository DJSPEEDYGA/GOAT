/**
 * TextToSpeechService - Advanced TTS with multiple voices and languages
 * Clone and enhance ChatGPT's TTS capabilities
 */

class TextToSpeechService {
    constructor() {
        this.voices = new Map();
        this.synthesis = window.speechSynthesis || null;
        this.audioQueue = [];
        this.isPlaying = false;
        this.defaultSettings = {
            voice: null,
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            language: 'en-US'
        };
        
        this.initializeVoices();
    }

    /**
     * Initialize available voices
     */
    initializeVoices() {
        if (this.synthesis) {
            // Load voices
            const loadVoices = () => {
                const availableVoices = this.synthesis.getVoices();
                this.voices.clear();
                
                availableVoices.forEach((voice, index) => {
                    this.voices.set(index, {
                        id: index,
                        name: voice.name,
                        lang: voice.lang,
                        localService: voice.localService,
                        default: voice.default
                    });
                });
            };
            
            // Voices load asynchronously in some browsers
            if (this.synthesis.getVoices().length === 0) {
                this.synthesis.onvoiceschanged = loadVoices;
            } else {
                loadVoices();
            }
        }
    }

    /**
     * Get available voices
     */
    getAvailableVoices() {
        return Array.from(this.voices.values());
    }

    /**
     * Get voices by language
     */
    getVoicesByLanguage(language) {
        return this.getAvailableVoices().filter(voice => 
            voice.lang.startsWith(language)
        );
    }

    /**
     * Synthesize text to speech
     */
    async synthesize(text, options = {}) {
        const settings = { ...this.defaultSettings, ...options };
        
        if (!this.synthesis) {
            throw new Error('Speech synthesis not supported in this environment');
        }
        
        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set voice
            if (settings.voice !== null && this.voices.has(settings.voice)) {
                utterance.voice = this.synthesis.getVoices()[settings.voice];
            } else if (settings.language) {
                // Find best matching voice for language
                const matchingVoice = this.findBestVoice(settings.language);
                if (matchingVoice) {
                    utterance.voice = matchingVoice;
                }
            }
            
            // Set properties
            utterance.rate = settings.rate;
            utterance.pitch = settings.pitch;
            utterance.volume = settings.volume;
            utterance.lang = settings.language;
            
            // Event handlers
            utterance.onend = () => {
                resolve({
                    success: true,
                    duration: this.estimateDuration(text, settings.rate),
                    voice: utterance.voice ? utterance.voice.name : 'default'
                });
            };
            
            utterance.onerror = (event) => {
                reject(new Error(`Speech synthesis error: ${event.error}`));
            };
            
            utterance.onstart = () => {
                console.log('Speech synthesis started');
            };
            
            // Speak
            this.synthesis.speak(utterance);
        });
    }

    /**
     * Find best matching voice for language
     */
    findBestVoice(language) {
        const voices = this.synthesis.getVoices();
        
        // First try exact match
        let exactMatch = voices.find(v => v.lang === language);
        if (exactMatch) return exactMatch;
        
        // Try language code match (e.g., 'en' for 'en-US')
        const langCode = language.split('-')[0];
        let langMatch = voices.find(v => v.lang.startsWith(langCode));
        if (langMatch) return langMatch;
        
        // Fall back to default voice
        return voices.find(v => v.default) || voices[0];
    }

    /**
     * Estimate speech duration
     */
    estimateDuration(text, rate = 1.0) {
        const wordsPerMinute = 150; // Average speaking rate
        const words = text.split(/\s+/).length;
        const minutes = words / wordsPerMinute;
        const seconds = minutes * 60 / rate;
        
        return Math.ceil(seconds);
    }

    /**
     * Stop current speech
     */
    stop() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isPlaying = false;
        }
    }

    /**
     * Pause speech
     */
    pause() {
        if (this.synthesis && this.isPlaying) {
            this.synthesis.pause();
            this.isPlaying = false;
        }
    }

    /**
     * Resume speech
     */
    resume() {
        if (this.synthesis) {
            this.synthesis.resume();
            this.isPlaying = true;
        }
    }

    /**
     * Speak multiple texts in sequence
     */
    async speakSequence(texts, options = {}) {
        const results = [];
        
        for (const text of texts) {
            try {
                const result = await this.synthesize(text, options);
                results.push(result);
            } catch (error) {
                results.push({ success: false, error: error.message });
            }
        }
        
        return results;
    }

    /**
     * Create audio file from text (for server-side TTS)
     */
    async createAudioFile(text, options = {}) {
        // This would integrate with server-side TTS services
        // For now, return a placeholder implementation
        
        const filename = `tts-${Date.now()}.mp3`;
        
        return {
            filename,
            text,
            duration: this.estimateDuration(text, options.rate || 1.0),
            format: 'mp3',
            sampleRate: 44100
        };
    }

    /**
     * Get recommended voices for different use cases
     */
    getRecommendedVoices() {
        return {
            general: this.getVoicesByLanguage('en-US'),
            british: this.getVoicesByLanguage('en-GB'),
            australian: this.getVoicesByLanguage('en-AU'),
            spanish: this.getVoicesByLanguage('es'),
            french: this.getVoicesByLanguage('fr'),
            german: this.getVoicesByLanguage('de'),
            japanese: this.getVoicesByLanguage('ja'),
            chinese: this.getVoicesByLanguage('zh'),
            korean: this.getVoicesByLanguage('ko'),
            italian: this.getVoicesByLanguage('it'),
            portuguese: this.getVoicesByLanguage('pt'),
            russian: this.getVoicesByLanguage('ru'),
            arabic: this.getVoicesByLanguage('ar')
        };
    }

    /**
     * Test voice
     */
    async testVoice(voiceId, testText = 'Hello, this is a test of the text to speech service.') {
        const voice = this.voices.get(voiceId);
        
        if (!voice) {
            throw new Error('Voice not found');
        }
        
        return await this.synthesize(testText, { voice: voiceId });
    }

    /**
     * Get voice settings
     */
    getSettings() {
        return { ...this.defaultSettings };
    }

    /**
     * Update settings
     */
    updateSettings(newSettings) {
        this.defaultSettings = { ...this.defaultSettings, ...newSettings };
        return this.defaultSettings;
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isPlaying: this.isPlaying,
            isPaused: this.synthesis ? this.synthesis.paused : false,
            isSpeaking: this.synthesis ? this.synthesis.speaking : false,
            pendingUtterances: this.synthesis ? this.synthesis.pending : false,
            voiceCount: this.voices.size
        };
    }
}

// Node.js compatible version for server-side TTS
class ServerTextToSpeechService {
    constructor() {
        this.ttsEngines = new Map();
        this.defaultEngine = 'google';
        
        this.initializeEngines();
    }

    /**
     * Initialize TTS engines
     */
    initializeEngines() {
        // Google TTS (requires API key)
        this.ttsEngines.set('google', {
            name: 'Google Cloud Text-to-Speech',
            available: false,
            voices: ['en-US-Standard-A', 'en-US-Standard-B', 'en-US-Standard-C', 'en-US-Standard-D', 'en-US-Standard-E'],
            languages: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN', 'ko-KR']
        });
        
        // Amazon Polly (requires AWS credentials)
        this.ttsEngines.set('amazon', {
            name: 'Amazon Polly',
            available: false,
            voices: ['Joanna', 'Matthew', 'Amy', 'Brian', 'Emma', 'Raveena'],
            languages: ['en-US', 'en-GB', 'en-IN', 'es-US', 'fr-FR', 'de-DE']
        });
        
        // Microsoft Azure TTS (requires API key)
        this.ttsEngines.set('azure', {
            name: 'Microsoft Azure Text-to-Speech',
            available: false,
            voices: ['Aria', 'Jenny', 'Guy', 'Davis', 'Sara'],
            languages: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP']
        });
        
        // OpenAI TTS (requires API key)
        this.ttsEngines.set('openai', {
            name: 'OpenAI Text-to-Speech',
            available: false,
            voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
            languages: ['en']
        });
    }

    /**
     * Synthesize text to speech
     */
    async synthesize(text, options = {}) {
        const engine = options.engine || this.defaultEngine;
        const voice = options.voice || 'default';
        const outputFormat = options.outputFormat || 'mp3';
        
        // Check if engine is available
        const ttsEngine = this.ttsEngines.get(engine);
        if (!ttsEngine) {
            throw new Error(`TTS engine '${engine}' not found`);
        }
        
        // In production, this would call the actual TTS API
        // For now, return a mock response
        
        const response = {
            success: true,
            engine: engine,
            voice: voice,
            text: text,
            audioFile: `${engine}-${voice}-${Date.now()}.${outputFormat}`,
            duration: this.estimateDuration(text),
            format: outputFormat,
            sampleRate: 24000,
            createdAt: new Date()
        };
        
        return response;
    }

    /**
     * Estimate speech duration
     */
    estimateDuration(text, rate = 1.0) {
        const wordsPerMinute = 150;
        const words = text.split(/\s+/).length;
        const minutes = words / wordsPerMinute;
        const seconds = minutes * 60 / rate;
        
        return Math.ceil(seconds);
    }

    /**
     * Get available engines
     */
    getAvailableEngines() {
        return Array.from(this.ttsEngines.values()).map(engine => ({
            name: engine.name,
            available: engine.available,
            voiceCount: engine.voices.length,
            languageCount: engine.languages.length
        }));
    }

    /**
     * Get voices for engine
     */
    getVoicesForEngine(engineName) {
        const engine = this.ttsEngines.get(engineName);
        return engine ? engine.voices : [];
    }

    /**
     * Set default engine
     */
    setDefaultEngine(engineName) {
        if (this.ttsEngines.has(engineName)) {
            this.defaultEngine = engineName;
            return true;
        }
        return false;
    }
}

// Export both versions
module.exports = {
    TextToSpeechService,
    ServerTextToSpeechService
};