/**
 * Data Processor Service
 * 
 * Processes and extracts metadata from various file types
 * for the GOAT Royalty App data pipeline
 * 
 * @author DJSPEEDYGA
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class DataProcessor {
  constructor(config) {
    this.config = config;
    this.processors = new Map();
    this.cache = new Map();
  }

  /**
   * Initialize data processor
   */
  async initialize() {
    console.log('🔧 Initializing Data Processor...');
    
    // Register processors for different file types
    this.registerProcessors();
    
    // Check for required tools
    await this.checkTools();
    
    console.log('✅ Data Processor initialized');
    return true;
  }

  /**
   * Register file type processors
   */
  registerProcessors() {
    // Book processors
    this.processors.set('pdf', this.processPDF.bind(this));
    this.processors.set('epub', this.processEPUB.bind(this));
    
    // Music processors
    this.processors.set('audio', this.processAudio.bind(this));
    
    // Code processors
    this.processors.set('javascript', this.processJavaScript.bind(this));
    this.processors.set('python', this.processPython.bind(this));
    this.processors.set('json', this.processJSON.bind(this));
    
    // Image processors
    this.processors.set('image', this.processImage.bind(this));
    
    // Document processors
    this.processors.set('document', this.processDocument.bind(this));
    
    // Data processors
    this.processors.set('csv', this.processCSV.bind(this));
    this.processors.set('sql', this.processSQL.bind(this));
    
    console.log('✅ Registered processors for all file types');
  }

  /**
   * Check for required tools
   */
  async checkTools() {
    const tools = {
      pdftotext: 'PDF text extraction',
      ffprobe: 'Audio metadata',
      identify: 'Image metadata',
      exiftool: 'EXIF metadata'
    };

    for (const [tool, description] of Object.entries(tools)) {
      try {
        execSync(`which ${tool}`, { stdio: 'ignore' });
        console.log(`✅ Found ${tool} (${description})`);
      } catch {
        console.log(`⚠️  ${tool} not found (${description}) - some features may be limited`);
      }
    }
  }

  /**
   * Extract book metadata
   */
  async extractBookMetadata(file) {
    const metadata = {
      type: 'book',
      title: file.name,
      author: null,
      isbn: null,
      pageCount: null,
      language: null,
      subjects: [],
      summary: null
    };

    const mimeType = file.mimeType || '';
    const fileName = file.name.toLowerCase();

    try {
      if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) {
        return await this.processPDF(file, metadata);
      } else if (fileName.endsWith('.epub')) {
        return await this.processEPUB(file, metadata);
      } else if (fileName.endsWith('.mobi')) {
        return await this.processMOBI(file, metadata);
      }
    } catch (error) {
      console.error(`Failed to extract book metadata: ${error.message}`);
    }

    return metadata;
  }

  /**
   * Process PDF file
   */
  async processPDF(file, metadata = {}) {
    try {
      // Use pdftotext to extract text
      const textContent = await this.extractPDFText(file);
      
      metadata.format = 'PDF';
      metadata.textLength = textContent.length;
      metadata.extractedText = textContent.substring(0, 1000); // First 1000 chars
      
      // Try to extract PDF info
      try {
        const pdfInfo = execSync(`pdfinfo "${file.id}"`, { 
          encoding: 'utf8',
          timeout: 10000 
        });
        
        const info = this.parsePDFInfo(pdfInfo);
        metadata.pageCount = parseInt(info.Pages);
        metadata.title = info.Title || metadata.title;
        metadata.author = info.Author;
        metadata.subject = info.Subject;
        metadata.keywords = info.Keywords?.split(',').map(k => k.trim()) || [];
        metadata.creationDate = info.CreationDate;
      } catch {
        // PDF info extraction failed, continue with basic metadata
      }
      
      return metadata;
    } catch (error) {
      console.error(`PDF processing failed: ${error.message}`);
      return metadata;
    }
  }

  /**
   * Extract text from PDF
   */
  async extractPDFText(file) {
    try {
      const text = execSync(`pdftotext "${file.id}" - -nopgbrk`, {
        encoding: 'utf8',
        timeout: 30000
      });
      return text;
    } catch (error) {
      console.error(`PDF text extraction failed: ${error.message}`);
      return '';
    }
  }

  /**
   * Parse pdfinfo output
   */
  parsePDFInfo(pdfInfo) {
    const info = {};
    const lines = pdfInfo.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        info[match[1].trim()] = match[2].trim();
      }
    }
    
    return info;
  }

  /**
   * Process EPUB file
   */
  async processEPUB(file, metadata = {}) {
    try {
      metadata.format = 'EPUB';
      
      // Extract EPUB metadata
      const epubInfo = execSync(`unzip -p "${file.id}" META-INF/container.xml`, {
        encoding: 'utf8',
        timeout: 5000
      });
      
      // Parse container.xml to find rootfile
      const rootFileMatch = epubInfo.match(/full-path="([^"]+)"/);
      if (rootFileMatch) {
        const rootFilePath = rootFileMatch[1];
        const opfContent = execSync(`unzip -p "${file.id}" "${rootFilePath}"`, {
          encoding: 'utf8',
          timeout: 5000
        });
        
        // Parse OPF metadata
        const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/);
        if (titleMatch) metadata.title = titleMatch[1];
        
        const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/);
        if (authorMatch) metadata.author = authorMatch[1];
        
        const subjectMatch = opfContent.matchAll(/<dc:subject[^>]*>([^<]+)<\/dc:subject>/g);
        metadata.subjects = Array.from(subjectMatch).map(m => m[1]);
      }
      
      return metadata;
    } catch (error) {
      console.error(`EPUB processing failed: ${error.message}`);
      return metadata;
    }
  }

  /**
   * Process MOBI file
   */
  async processMOBI(file, metadata = {}) {
    metadata.format = 'MOBI';
    // MOBI processing requires specialized tools
    return metadata;
  }

  /**
   * Extract music metadata
   */
  async extractMusicMetadata(file) {
    const metadata = {
      type: 'music',
      title: file.name,
      artist: null,
      album: null,
      genre: null,
      year: null,
      duration: null,
      bitrate: null,
      sampleRate: null,
      format: null
    };

    try {
      return await this.processAudio(file, metadata);
    } catch (error) {
      console.error(`Failed to extract music metadata: ${error.message}`);
      return metadata;
    }
  }

  /**
   * Process audio file
   */
  async processAudio(file, metadata = {}) {
    try {
      // Use ffprobe to extract audio metadata
      const ffprobeOutput = execSync(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${file.id}"`,
        { encoding: 'utf8', timeout: 10000 }
      );
      
      const ffprobeData = JSON.parse(ffprobeOutput);
      const audioStream = ffprobeData.streams.find(s => s.codec_type === 'audio');
      const format = ffprobeData.format;
      
      if (audioStream) {
        metadata.duration = parseFloat(audioStream.duration);
        metadata.bitrate = parseInt(audioStream.bit_rate);
        metadata.sampleRate = parseInt(audioStream.sample_rate);
        metadata.codec = audioStream.codec_name;
        metadata.channels = audioStream.channels;
      }
      
      if (format) {
        metadata.format = format.format_name;
        metadata.size = parseInt(format.size);
        
        // Extract tags if available
        const tags = format.tags || {};
        metadata.title = tags.TITLE || metadata.title;
        metadata.artist = tags.ARTIST || tags.artist;
        metadata.album = tags.ALBUM || tags.album;
        metadata.genre = tags.GENRE || tags.genre;
        metadata.year = tags.DATE || tags.year;
        metadata.track = tags.TRACK || tags.track;
      }
      
      return metadata;
    } catch (error) {
      console.error(`Audio processing failed: ${error.message}`);
      return metadata;
    }
  }

  /**
   * Extract code metadata
   */
  async extractCodeMetadata(file) {
    const metadata = {
      type: 'code',
      title: file.name,
      language: null,
      linesOfCode: null,
      functions: [],
      classes: [],
      imports: [],
      dependencies: []
    };

    try {
      const mimeType = file.mimeType || '';
      const fileName = file.name.toLowerCase();

      if (mimeType.includes('javascript') || fileName.endsWith('.js')) {
        return await this.processJavaScript(file, metadata);
      } else if (fileName.endsWith('.py')) {
        return await this.processPython(file, metadata);
      } else if (fileName.endsWith('.json')) {
        return await this.processJSON(file, metadata);
      } else if (fileName.endsWith('.java')) {
        return await this.processJava(file, metadata);
      }
    } catch (error) {
      console.error(`Failed to extract code metadata: ${error.message}`);
    }

    return metadata;
  }

  /**
   * Process JavaScript file
   */
  async processJavaScript(file, metadata = {}) {
    try {
      metadata.language = 'JavaScript';
      metadata.extension = '.js';
      
      // Read file content
      const content = await fs.readFile(file.id, 'utf8');
      metadata.linesOfCode = content.split('\n').length;
      
      // Extract imports/requires
      const importMatches = content.matchAll(/(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g);
      metadata.imports = Array.from(importMatches).map(m => m[1]);
      
      // Extract function declarations
      const functionMatches = content.matchAll(/function\s+(\w+)\s*\(/g);
      metadata.functions = Array.from(functionMatches).map(m => m[1]);
      
      // Extract class declarations
      const classMatches = content.matchAll(/class\s+(\w+)/g);
      metadata.classes = Array.from(classMatches).map(m => m[1]);
      
      // Extract async functions
      const asyncMatches = content.matchAll(/async\s+function\s+(\w+)/g);
      metadata.asyncFunctions = Array.from(asyncMatches).map(m => m[1]);
      
      return metadata;
    } catch (error) {
      console.error(`JavaScript processing failed: ${error.message}`);
      return metadata;
    }
  }

  /**
   * Process Python file
   */
  async processPython(file, metadata = {}) {
    try {
      metadata.language = 'Python';
      metadata.extension = '.py';
      
      const content = await fs.readFile(file.id, 'utf8');
      metadata.linesOfCode = content.split('\n').length;
      
      // Extract imports
      const importMatches = content.matchAll(/^(?:from|import)\s+(\S+)/gm);
      metadata.imports = Array.from(importMatches).map(m => m[1]);
      
      // Extract function definitions
      const functionMatches = content.matchAll(/^def\s+(\w+)\s*\(/gm);
      metadata.functions = Array.from(functionMatches).map(m => m[1]);
      
      // Extract class definitions
      const classMatches = content.matchAll(/^class\s+(\w+)/gm);
      metadata.classes = Array.from(classMatches).map(m => m[1]);
      
      return metadata;
    } catch (error) {
      console.error(`Python processing failed: ${error.message}`);
      return metadata;
    }
  }

  /**
   * Process JSON file
   */
  async processJSON(file, metadata = {}) {
    try {
      metadata.language = 'JSON';
      metadata.extension = '.json';
      
      const content = await fs.readFile(file.id, 'utf8');
      const jsonData = JSON.parse(content);
      
      metadata.structure = this.analyzeJSONStructure(jsonData);
      metadata.keys = Object.keys(jsonData);
      metadata.arrayLengths = this.getArrayLengths(jsonData);
      
      return metadata;
    } catch (error) {
      console.error(`JSON processing failed: ${error.message}`);
      return metadata;
    }
  }

  /**
   * Analyze JSON structure
   */
  analyzeJSONStructure(data) {
    if (Array.isArray(data)) {
      return `array[${data.length}]`;
    } else if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      return `object{${keys.join(',')}}`;
    }
    return typeof data;
  }

  /**
   * Get array lengths from JSON
   */
  getArrayLengths(data, path = '') {
    const lengths = {};
    
    if (Array.isArray(data)) {
      lengths[path || 'root'] = data.length;
    }
    
    if (typeof data === 'object' && data !== null) {
      for (const key of Object.keys(data)) {
        const currentPath = path ? `${path}.${key}` : key;
        Object.assign(lengths, this.getArrayLengths(data[key], currentPath));
      }
    }
    
    return lengths;
  }

  /**
   * Process Java file
   */
  async processJava(file, metadata = {}) {
    try {
      metadata.language = 'Java';
      metadata.extension = '.java';
      
      const content = await fs.readFile(file.id, 'utf8');
      metadata.linesOfCode = content.split('\n').length;
      
      // Extract package
      const packageMatch = content.match(/package\s+([\w.]+);/);
      metadata.package = packageMatch ? packageMatch[1] : null;
      
      // Extract imports
      const importMatches = content.matchAll(/import\s+([\w.]+);/g);
      metadata.imports = Array.from(importMatches).map(m => m[1]);
      
      // Extract class declarations
      const classMatches = content.matchAll(/(?:public|private|protected)?\s*class\s+(\w+)/g);
      metadata.classes = Array.from(classMatches).map(m => m[1]);
      
      // Extract method declarations
      const methodMatches = content.matchAll(
        /(?:public|private|protected)?\s*(?:static)?\s*\w+\s+(\w+)\s*\([^)]*\)/g
      );
      metadata.methods = Array.from(methodMatches).map(m => m[1]);
      
      return metadata;
    } catch (error) {
      console.error(`Java processing failed: ${error.message}`);
      return metadata;
    }
  }

  /**
   * Extract contract metadata
   */
  async extractContractMetadata(file) {
    const metadata = {
      type: 'contract',
      title: file.name,
      parties: [],
      effectiveDate: null,
      expirationDate: null,
      terms: [],
      obligations: [],
      value: null,
      currency: null
    };

    try {
      return await this.processDocument(file, metadata);
    } catch (error) {
      console.error(`Failed to extract contract metadata: ${error.message}`);
      return metadata;
    }
  }

  /**
   * Process document file
   */
  async processDocument(file, metadata = {}) {
    try {
      const mimeType = file.mimeType || '';
      const fileName = file.name.toLowerCase();

      if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) {
        return await this.processPDF(file, { ...metadata, documentType: 'PDF' });
      } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        return await this.processWord(file, metadata);
      } else if (fileName.endsWith('.txt')) {
        return await this.processText(file, metadata);
      }
    } catch (error) {
      console.error(`Document processing failed: ${error.message}`);
    }

    return metadata;
  }

  /**
   * Process Word document
   */
  async processWord(file, metadata = {}) {
    try {
      // Use antiword for .doc or pandoc for .docx
      const fileName = file.name.toLowerCase();
      
      if (fileName.endsWith('.doc')) {
        const textContent = execSync(`antiword "${file.id}"`, {
          encoding: 'utf8',
          timeout: 30000
        });
        metadata.textLength = textContent.length;
        metadata.extractedText = textContent.substring(0, 1000);
      } else if (fileName.endsWith('.docx')) {
        const textContent = execSync(`pandoc "${file.id}" -t plain`, {
          encoding: 'utf8',
          timeout: 30000
        });
        metadata.textLength = textContent.length;
        metadata.extractedText = textContent.substring(0, 1000);
      }
      
      return metadata;
    } catch (error) {
      console.error(`Word document processing failed: ${error.message}`);
      return metadata;
    }
  }

  /**
   * Process text file
   */
  async processText(file, metadata = {}) {
    try {
      const content = await fs.readFile(file.id, 'utf8');
      metadata.textLength = content.length;
      metadata.extractedText = content.substring(0, 1000);
      metadata.lines = content.split('\n').length;
      metadata.words = content.split(/\s+/).length;
      
      return metadata;
    } catch (error) {
      console.error(`Text processing failed: ${error.message}`);
      return metadata;
    }
  }

  /**
   * Process image file
   */
  async processImage(file, metadata = {}) {
    try {
      // Use identify command to get image metadata
      const identifyOutput = execSync(`identify -verbose "${file.id}"`, {
        encoding: 'utf8',
        timeout: 10000
      });
      
      const metadataLines = identifyOutput.split('\n');
      
      for (const line of metadataLines) {
        if (line.includes('Geometry:')) {
          const match = line.match(/(\d+)x(\d+)/);
          if (match) {
            metadata.width = parseInt(match[1]);
            metadata.height = parseInt(match[2]);
          }
        } else if (line.includes('Format:')) {
          metadata.format = line.split(':')[1].trim();
        } else if (line.includes('Colorspace:')) {
          metadata.colorspace = line.split(':')[1].trim();
        }
      }
      
      return metadata;
    } catch (error) {
      console.error(`Image processing failed: ${error.message}`);
      return metadata;
    }
  }

  /**
   * Process CSV file
   */
  async processCSV(file, metadata = {}) {
    try {
      const content = await fs.readFile(file.id, 'utf8');
      const lines = content.split('\n');
      
      metadata.lines = lines.length;
      metadata.headers = lines[0].split(',');
      metadata.columns = metadata.headers.length;
      
      // Sample first few rows
      metadata.sampleRows = lines.slice(1, 6).map(line => line.split(','));
      
      return metadata;
    } catch (error) {
      console.error(`CSV processing failed: ${error.message}`);
      return metadata;
    }
  }

  /**
   * Process SQL file
   */
  async processSQL(file, metadata = {}) {
    try {
      const content = await fs.readFile(file.id, 'utf8');
      
      metadata.lines = content.split('\n').length;
      
      // Extract table names
      const tableMatches = content.matchAll(/CREATE\s+TABLE\s+(\w+)/gi);
      metadata.tables = Array.from(tableMatches).map(m => m[1]);
      
      // Extract view names
      const viewMatches = content.matchAll(/CREATE\s+VIEW\s+(\w+)/gi);
      metadata.views = Array.from(viewMatches).map(m => m[1]);
      
      return metadata;
    } catch (error) {
      console.error(`SQL processing failed: ${error.message}`);
      return metadata;
    }
  }

  /**
   * Get processor for file type
   */
  getProcessor(fileType) {
    return this.processors.get(fileType);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('✅ Data Processor cache cleared');
  }
}

module.exports = { DataProcessor };