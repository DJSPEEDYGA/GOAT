/**
 * SpeechToTextService - Advanced STT with multiple languages and real-time transcription
 * Clone and enhance ChatGPT's speech recognition capabilities
 */

class SpeechToTextService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.transcription = '';
        this interimResults = [];
        this.finalResults = [];
        this.supportedLanguages = new Map();
        this.defaultSettings = {
            language: 'en-US',
            continuous: true,
            interimResults: true,
            maxAlternatives: 1
        };
        
        this.initializeRecognition();
        this.initializeLanguages();
    }

    /**
     * Initialize speech recognition
     */
    initializeRecognition() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || 
                                  window.webkitSpeechRecognition || 
                                  window.mozSpeechRecognition || 
                                  window.msSpeechRecognition;
        
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.setupRecognitionHandlers();
        } else {
            console.warn('Speech recognition not supported in this browser');
        }
    }

    /**
     * Setup recognition event handlers
     */
    setupRecognitionHandlers() {
        if (!this.recognition) return;
        
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('Speech recognition started');
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            console.log('Speech recognition ended');
            
            // Restart if continuous mode is enabled
            if (this.defaultSettings.continuous && this.isListening) {
                this.recognition.start();
            }
        };
        
        this.recognition.onresult = (event) => {
            this.handleRecognitionResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.handleError(event.error);
        };
        
        this.recognition.onnomatch = () => {
            console.log('No speech was recognized');
        };
        
        this.recognition.onsoundstart = () => {
            console.log('Sound detected');
        };
        
        this.recognition.onsoundend = () => {
            console.log('Sound ended');
        };
        
        this.recognition.onspeechstart = () => {
            console.log('Speech detected');
        };
        
        this.recognition.onspeechend = () => {
            console.log('Speech ended');
        };
    }

    /**
     * Handle recognition results
     */
    handleRecognitionResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
                this.finalResults.push({
                    text: transcript,
                    confidence: confidence,
                    timestamp: new Date()
                });
            } else {
                interimTranscript += transcript;
                this.interimResults.push({
                    text: transcript,
                    confidence: confidence,
                    timestamp: new Date()
                });
            }
        }
        
        this.transcription = finalTranscript || interimTranscript;
        
        // Emit or return results
        if (typeof this.onResult === 'function') {
            this.onResult({
                final: finalTranscript,
                interim: interimTranscript,
                isFinal: event.results[event.results.length - 1].isFinal
            });
        }
    }

    /**
     * Handle recognition errors
     */
    handleError(error) {
        const errorMessages = {
            'no-speech': 'No speech was detected',
            'audio-capture': 'No microphone was found',
            'not-allowed': 'Microphone permission was denied',
            'network': 'Network error occurred',
            'aborted': 'Speech recognition was aborted'
        };
        
        const message = errorMessages[error] || `Unknown error: ${error}`;
        
        if (typeof this.onError === 'function') {
            this.onError({ error, message });
        }
    }

    /**
     * Initialize supported languages
     */
    initializeLanguages() {
        this.supportedLanguages.set('en-US', { name: 'English (US)', code: 'en-US' });
        this.supportedLanguages.set('en-GB', { name: 'English (UK)', code: 'en-GB' });
        this.supportedLanguages.set('es-ES', { name: 'Spanish (Spain)', code: 'es-ES' });
        this.supportedLanguages.set('es-MX', { name: 'Spanish (Mexico)', code: 'es-MX' });
        this.supportedLanguages.set('fr-FR', { name: 'French (France)', code: 'fr-FR' });
        this.supportedLanguages.set('de-DE', { name: 'German (Germany)', code: 'de-DE' });
        this.supportedLanguages.set('it-IT', { name: 'Italian (Italy)', code: 'it-IT' });
        this.supportedLanguages.set('pt-BR', { name: 'Portuguese (Brazil)', code: 'pt-BR' });
        this.supportedLanguages.set('pt-PT', { name: 'Portuguese (Portugal)', code: 'pt-PT' });
        this.supportedLanguages.set('ja-JP', { name: 'Japanese (Japan)', code: 'ja-JP' });
        this.supportedLanguages.set('zh-CN', { name: 'Chinese (Simplified)', code: 'zh-CN' });
        this.supportedLanguages.set('zh-TW', { name: 'Chinese (Traditional)', code: 'zh-TW' });
        this.supportedLanguages.set('ko-KR', { name: 'Korean (South Korea)', code: 'ko-KR' });
        this.supportedLanguages.set('ru-RU', { name: 'Russian (Russia)', code: 'ru-RU' });
        this.supportedLanguages.set('ar-SA', { name: 'Arabic (Saudi Arabia)', code: 'ar-SA' });
        this.supportedLanguages.set('hi-IN', { name: 'Hindi (India)', code: 'hi-IN' });
    }

    /**
     * Start speech recognition
     */
    startListening(options = {}) {
        if (!this.recognition) {
            throw new Error('Speech recognition not supported');
        }
        
        const settings = { ...this.defaultSettings, ...options };
        
        this.recognition.lang = settings.language;
        this.recognition.continuous = settings.continuous;
        this.recognition.interimResults = settings.interimResults;
        this.recognition.maxAlternatives = settings.maxAlternatives;
        
        this.recognition.start();
        this.isListening = true;
        
        return {
            success: true,
            language: settings.language,
            continuous: settings.continuous
        };
    }

    /**
     * Stop speech recognition
     */
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            return { success: true };
        }
        return { success: false, message: 'Recognition not active' };
    }

    /**
     * Get current transcription
     */
    getTranscription() {
        return {
            full: this.transcription,
            interim: this.interimResults,
            final: this.finalResults
        };
    }

    /**
     * Clear transcription
     */
    clearTranscription() {
        this.transcription = '';
        this.interimResults = [];
        this.finalResults = [];
        return { success: true };
    }

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return Array.from(this.supportedLanguages.values());
    }

    /**
     * Set result callback
     */
    onResult(callback) {
        this.onResult = callback;
    }

    /**
     * Set error callback
     */
    onError(callback) {
        this.onError = callback;
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isListening: this.isListening,
            isSupported: !!this.recognition,
            language: this.defaultSettings.language,
            transcriptionLength: this.transcription.length,
            finalResultsCount: this.finalResults.length
        };
    }

    /**
     * Update settings
     */
    updateSettings(newSettings) {
        this.defaultSettings = { ...this.defaultSettings, ...newSettings };
        return this.defaultSettings;
    }
}

// Server-side STT service for file transcription
class ServerSpeechToTextService {
    constructor() {
        this.sttEngines = new Map();
        this.defaultEngine = 'google';
        
        this.initializeEngines();
    }

    /**
     * Initialize STT engines
     */
    initializeEngines() {
        // Google Cloud Speech-to-Text
        this.sttEngines.set('google', {
            name: 'Google Cloud Speech-to-Text',
            available: false,
            features: ['real-time', 'batch', 'streaming'],
            languages: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN', 'ko-KR'],
            pricing: 'pay-per-use'
        });
        
        // Amazon Transcribe
        this.sttEngines.set('amazon', {
            name: 'Amazon Transcribe',
            available: false,
            features: ['real-time', 'batch', 'speaker-diarization'],
            languages: ['en-US', 'en-GB', 'es-US', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN'],
            pricing: 'pay-per-use'
        });
        
        // Microsoft Azure Speech Services
        this.sttEngines.set('azure', {
            name: 'Microsoft Azure Speech Services',
            available: false,
            features: ['real-time', 'batch', 'custom'],
            languages: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN', 'ko-KR'],
            pricing: 'pay-per-use'
        });
        
        // OpenAI Whisper
        this.sttEngines.set('openai', {
            name: 'OpenAI Whisper',
            available: false,
            features: ['batch', 'multi-language'],
            languages: ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko', 'it', 'pt', 'ru'],
            pricing: 'pay-per-use'
        });
        
        // Local Whisper (open-source)
        this.sttEngines.set('whisper-local', {
            name: 'Whisper (Local)',
            available: false,
            features: ['batch', 'offline'],
            languages: ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko', 'it', 'pt', 'ru'],
            pricing: 'free'
        });
    }

    /**
     * Transcribe audio file
     */
    async transcribeFile(audioFilePath, options = {}) {
        const engine = options.engine || this.defaultEngine;
        const language = options.language || 'en-US';
        const format = options.format || 'auto';
        
        const sttEngine = this.sttEngines.get(engine);
        if (!sttEngine) {
            throw new Error(`STT engine '${engine}' not found`);
        }
        
        // In production, this would call the actual STT API
        // For now, return a mock response
        
        const response = {
            success: true,
            engine: engine,
            language: language,
            transcription: this.generateMockTranscription(),
            confidence: 0.95,
            duration: options.duration || 30,
            words: this.generateMockWords(),
            speakers: options.enableDiarization ? 
                this.generateMockSpeakers() : null,
            timestamps: options.enableTimestamps ?
                this.generateMockTimestamps() : null,
            metadata: {
                file: audioFilePath,
                format: format,
                processedAt: new Date(),
                processingTime: 2.5
            }
        };
        
        return response;
    }

    /**
     * Generate mock transcription
     */
    generateMockTranscription() {
        return 'This is a sample transcription of the audio file. In production, this would contain the actual transcribed text from the speech recognition engine.';
    }

    /**
     * Generate mock word-level data
     */
    generateMockWords() {
        return [
            { word: 'This', start: 0.0, end: 0.3, confidence: 0.98 },
            { word: 'is', start: 0.3, end: 0.5, confidence: 0.99 },
            { word: 'a', start: 0.5, end: 0.6, confidence: 0.97 },
            { word: 'sample', start: 0.6, end: 1.0, confidence: 0.96 },
            { word: 'transcription', start: 1.0, end: 1.8, confidence: 0.95 }
        ];
    }

    /**
     * Generate mock speaker data
     */
    generateMockSpeakers() {
        return [
            { speaker: 'Speaker 1', start: 0.0, end: 5.0 },
            { speaker: 'Speaker 2', start: 5.0, end: 10.0 }
        ];
    }

    /**
     * Generate mock timestamps
     */
    generateMockTimestamps() {
        return [
            { time: 0.0, text: 'This is a sample' },
            { time: 1.0, text: 'transcription of the' },
            { time: 2.0, text: 'audio file.' }
        ];
    }

    /**
     * Get available engines
     */
    getAvailableEngines() {
        return Array.from(this.sttEngines.values()).map(engine => ({
            name: engine.name,
            available: engine.available,
            features: engine.features,
            languageCount: engine.languages.length,
            pricing: engine.pricing
        }));
    }

    /**
     * Get languages for engine
     */
    getLanguagesForEngine(engineName) {
        const engine = this.sttEngines.get(engineName);
        return engine ? engine.languages : [];
    }

    /**
     * Set default engine
     */
    setDefaultEngine(engineName) {
        if (this.sttEngines.has(engineName)) {
            this.defaultEngine = engineName;
            return true;
        }
        return false;
    }

    /**
     * Transcribe with speaker diarization
     */
    async transcribeWithDiarization(audioFilePath, options = {}) {
        return await this.transcribeFile(audioFilePath, {
            ...options,
            enableDiarization: true
        });
    }

    /**
     * Batch transcribe multiple files
     */
    async batchTranscribe(filePaths, options = {}) {
        const results = [];
        
        for (const filePath of filePaths) {
            try {
                const result = await this.transcribeFile(filePath, options);
                results.push({ file: filePath, ...result });
            } catch (error) {
                results.push({ file: filePath, success: false, error: error.message });
            }
        }
        
        return results;
    }
}

// Export both versions
module.exports = {
    SpeechToTextService,
    ServerSpeechToTextService
};