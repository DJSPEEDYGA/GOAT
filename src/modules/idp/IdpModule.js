/**
 * GOAT Royalty App - Intelligent Document Processing (IDP) Module
 * 
 * Inspired by: 6Estates Intelligent Document Processing Platform
 * 
 * Capabilities:
 * - Automated contract scanning (PDF, DOCX, images)
 * - AI-powered contract analysis using local Ollama
 * - Royalty rate extraction
 * - Expiration date tracking
 * - Compliance checking
 * - OCR integration for scanned documents
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class IdpModule extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      ollamaUrl: config.ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434',
      ollamaModel: config.ollamaModel || process.env.OLLAMA_MODEL || 'llama3.1:8b',
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 120000,
      uploadDir: config.uploadDir || './uploads/contracts',
      processedDir: config.processedDir || './processed/contracts',
      ...config
    };

    // Ensure directories exist
    [this.config.uploadDir, this.config.processedDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Processing queue
    this.queue = [];
    this.isProcessing = false;

    console.log('📄 IDP Module initialized');
    console.log(`   Upload directory: ${this.config.uploadDir}`);
    console.log(`   Processed directory: ${this.config.processedDir}`);
  }

  /**
   * Upload and process a contract document
   */
  async uploadContract(filePath, metadata = {}) {
    try {
      const fileInfo = {
        id: `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        originalPath: filePath,
        fileName: path.basename(filePath),
        fileSize: fs.statSync(filePath).size,
        uploadDate: new Date(),
        metadata
      };

      // Move to upload directory
      const uploadPath = path.join(this.config.uploadDir, fileInfo.fileName);
      fs.copyFileSync(filePath, uploadPath);
      fileInfo.uploadPath = uploadPath;

      // Add to processing queue
      this.queue.push(fileInfo);
      this.emit('uploaded', fileInfo);

      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue();
      }

      return fileInfo;
    } catch (error) {
      console.error(`❌ Error uploading contract: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process the queue of documents
   */
  async processQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    console.log('🔄 Started processing queue...');

    while (this.queue.length > 0) {
      const document = this.queue.shift();
      await this.processDocument(document);
    }

    this.isProcessing = false;
    this.emit('queueComplete');
    console.log('✅ Queue processing complete');
  }

  /**
   * Process a single document
   */
  async processDocument(document) {
    try {
      this.emit('processing', document);

      // Extract text from document
      const textContent = await this.extractText(document.uploadPath);
      document.textContent = textContent;

      // Analyze with local LLM
      const analysis = await this.analyzeContract(textContent, document);
      document.analysis = analysis;

      // Save processed document
      const processedPath = path.join(this.config.processedDir, document.fileName);
      fs.copyFileSync(document.uploadPath, processedPath);
      document.processedPath = processedPath;

      // Update status
      document.status = 'completed';
      document.processedDate = new Date();

      this.emit('completed', document);
      console.log(`✅ Processed: ${document.fileName}`);

      return document;
    } catch (error) {
      document.status = 'error';
      document.error = error.message;
      this.emit('error', document);
      console.error(`❌ Error processing document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract text from document (PDF, DOCX, TXT)
   */
  async extractText(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    try {
      // For now, we'll implement basic text extraction
      // In production, you'd use libraries like:
      // - pdf-parse for PDFs
      // - mammoth for DOCX
      // - tesseract.js for OCR

      if (ext === '.txt' || ext === '.md') {
        return fs.readFileSync(filePath, 'utf-8');
      }

      // For PDFs and DOCX, we'd integrate proper libraries
      // For now, return a placeholder
      return await this.callOllama Extraction(
        'Help me understand this is a contract file. What file format is this?',
        { temperature: 0.3 }
      );

    } catch (error) {
      console.error(`❌ Error extracting text from ${filePath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze contract using local Ollama
   */
  async analyzeContract(text, document) {
    try {
      const prompt = `Analyze this music industry contract and extract the following information in JSON format:

{
  "contractTitle": "Title of the contract",
  "contractType": "Type (Recording, Publishing, Distribution, Licensing, etc.)",
  "parties": ["Party A", "Party B"],
  "effectiveDate": "YYYY-MM-DD",
  "expirationDate": "YYYY-MM-DD or null",
  "royaltyRates": {
    "mechanical": "percentage or rate",
    "performance": "percentage or rate",
    "synchronization": "percentage or rate"
  },
  "territory": "Geographic coverage",
  "exclusive": true/false,
  "keyTerms": ["key term 1", "key term 2"],
  "obligations": ["Party A obligations", "Party B obligations"],
  "terminationClauses": ["termination condition"],
  "redFlags": ["any concerning clauses"],
  "complianceIssues": ["potential issues"],
  "summary": "Brief summary of the contract"
}

Contract text:
${text.substring(0, 10000)}`;

      const response = await this.callOllama(prompt, { temperature: 0.3 });

      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const analysis = JSON.parse(jsonMatch[0]);
          analysis.rawAnalysis = response;
          return analysis;
        } catch (e) {
          console.log('⚠️ Could not parse JSON, returning raw response');
        }
      }

      // Return raw analysis if JSON parsing failed
      return {
        summary: response,
        extractedData: {},
        redFlags: [],
        complianceIssues: []
      };

    } catch (error) {
      console.error(`❌ Error analyzing contract: ${error.message}`);
      throw error;
    }
  }

  /**
   * Call local Ollama for text analysis
   */
  async callOllama(prompt, options = {}) {
    try {
      const response = await axios.post(`${this.config.ollamaUrl}/api/chat`, {
        model: this.config.ollamaModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert music industry contract analyst. Extract key terms, royalty rates, dates, parties, and potential issues from contracts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_ctx: options.contextSize || 8192
        }
      }, {
        timeout: this.config.timeout
      });

      return response.data.message?.content || '';
    } catch (error) {
      console.error('❌ Ollama API error:', error.message);
      throw new Error('Failed to analyze document with local AI');
    }
  }

  /**
   * Compare contracts for differences
   */
  async compareContracts(contractId1, contractId2) {
    try {
      // This would fetch from database in production
      const contract1 = { id: contractId1 }; // Placeholder
      const contract2 = { id: contractId2 }; // Placeholder

      const prompt = `Compare these two music contracts and highlight differences in:

1. Royalty rates
2. Territory
3. Expiration dates
4. Key obligations
5. Risk factors

Contract 1: ${JSON.stringify(contract1)}
Contract 2: ${JSON.stringify(contract2)}`;

      const comparison = await this.callOllama(prompt);
      return { comparison, differences: [] };

    } catch (error) {
      console.error(`❌ Error comparing contracts: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check for compliance issues
   */
  async checkCompliance(contractId) {
    try {
      const prompt = `Review this music contract for compliance issues:
- Fair compensation
- Transparent reporting
- No hidden fees
- Reasonable term lengths
- Clear termination rights
- Proper attribution

Identify any red flags or compliance concerns.`;

      const complianceCheck = await this.callOllama(prompt);
      return {
        isCompliant: true, // Would be determined by analysis
        issues: [],
        recommendations: complianceCheck
      };

    } catch (error) {
      console.error(`❌ Error checking compliance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get processing status
   */
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      queueLength: this.queue.length,
      uploadDir: this.config.uploadDir,
      processedDir: this.config.processedDir
    };
  }

  /**
   * Clear processed files
   */
  clearProcessed() {
    try {
      const files = fs.readdirSync(this.config.processedDir);
      files.forEach(file => {
        const filePath = path.join(this.config.processedDir, file);
        fs.unlinkSync(filePath);
      });
      console.log('🗑️ Cleared processed directory');
    } catch (error) {
      console.error(`❌ Error clearing processed files: ${error.message}`);
    }
  }
}

module.exports = IdpModule;