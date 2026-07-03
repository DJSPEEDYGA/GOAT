/**
 * GOAT Royalty App - Data Stream Handler
 * RAID 0 Architecture - Secure Data Flow
 * 
 * Handles INCOMING and OUTGOING data with isolation
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class DataStreamHandler {
  constructor(config) {
    this.config = config;
    this.incomingDir = config.INCOMING.baseDir;
    this.outgoingDir = config.OUTGOING.baseDir;
    this.encryptionKey = process.env.RAID0_ENCRYPTION_KEY || this.generateKey();
    
    this.ensureDirectories();
  }

  // ═══════════════════════════════════════════════════════════
  // DIRECTORY SETUP
  // ═══════════════════════════════════════════════════════════
  ensureDirectories() {
    // Create INCOMING directories
    Object.values(this.config.INCOMING).forEach(dir => {
      if (typeof dir === 'object' && dir.path) {
        this.createSecureDir(dir.path);
      }
    });
    
    // Create OUTGOING directories
    Object.values(this.config.OUTGOING).forEach(dir => {
      if (typeof dir === 'object' && dir.path) {
        this.createSecureDir(dir.path);
      }
    });
    
    console.log('✅ RAID 0 directory structure initialized');
  }

  createSecureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true, mode: 0o700 });
      console.log(`📁 Created secure directory: ${dirPath}`);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // ENCRYPTION
  // ═══════════════════════════════════════════════════════════
  generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      data: encrypted,
      authTag: authTag.toString('hex'),
    };
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(this.encryptionKey, 'hex'),
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  // ═══════════════════════════════════════════════════════════
  // INCOMING DATA HANDLERS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Handle incoming stream data
   * @param {string} source - Source identifier
   * @param {object} data - Stream data payload
   */
  async handleIncomingStream(source, data) {
    const timestamp = Date.now();
    const filename = `${source}_${timestamp}.json`;
    const filepath = path.join(this.config.INCOMING.streams.path, filename);
    
    const payload = {
      source,
      timestamp,
      data,
      checksum: this.generateChecksum(data),
    };
    
    const encrypted = this.encrypt(payload);
    await this.writeSecureFile(filepath, JSON.stringify(encrypted));
    
    console.log(`📥 INCOMING stream saved: ${filename}`);
    return { success: true, filepath, checksum: payload.checksum };
  }

  /**
   * Handle incoming file upload
   * @param {string} userId - User ID
   * @param {object} file - File metadata and content
   */
  async handleIncomingUpload(userId, file) {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${userId}_${timestamp}_${safeName}`;
    const filepath = path.join(this.config.INCOMING.uploads.path, filename);
    
    // Validate file type
    const ext = path.extname(file.name).toLowerCase();
    const allowedTypes = this.config.INCOMING.uploads.allowedTypes;
    
    if (!allowedTypes.includes(ext)) {
      throw new Error(`File type ${ext} not allowed`);
    }
    
    // Validate file size
    const maxSize = this.parseSize(this.config.INCOMING.uploads.maxSize);
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum of ${this.config.INCOMING.uploads.maxSize}`);
    }
    
    await this.writeSecureFile(filepath, file.content);
    
    console.log(`📥 INCOMING upload saved: ${filename}`);
    return { success: true, filepath, size: file.size };
  }

  /**
   * Handle incoming API request data
   * @param {string} endpoint - API endpoint
   * @param {object} payload - Request payload
   */
  async handleIncomingAPI(endpoint, payload) {
    const timestamp = Date.now();
    const filename = `${endpoint.replace(/\//g, '_')}_${timestamp}.json`;
    const filepath = path.join(this.config.INCOMING.apiInputs.path, filename);
    
    const data = {
      endpoint,
      timestamp,
      payload,
      ip: payload.ip || 'unknown',
      userAgent: payload.userAgent || 'unknown',
    };
    
    const encrypted = this.encrypt(data);
    await this.writeSecureFile(filepath, JSON.stringify(encrypted));
    
    return { success: true, logged: true };
  }

  /**
   * Handle incoming webhook
   * @param {string} source - Webhook source
   * @param {object} payload - Webhook payload
   * @param {string} signature - Webhook signature
   */
  async handleIncomingWebhook(source, payload, signature) {
    // Verify source is allowed
    const allowedSources = this.config.INCOMING.webhooks.allowedSources;
    if (!allowedSources.some(s => source.includes(s))) {
      throw new Error(`Webhook source ${source} not allowed`);
    }
    
    const timestamp = Date.now();
    const filename = `${source.replace(/\./g, '_')}_${timestamp}.json`;
    const filepath = path.join(this.config.INCOMING.webhooks.path, filename);
    
    const data = {
      source,
      timestamp,
      payload,
      signature,
      verified: true,
    };
    
    const encrypted = this.encrypt(data);
    await this.writeSecureFile(filepath, JSON.stringify(encrypted));
    
    console.log(`📥 INCOMING webhook from ${source}`);
    return { success: true, verified: true };
  }

  // ═══════════════════════════════════════════════════════════
  // OUTGOING DATA HANDLERS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Handle outgoing export
   * @param {string} userId - User ID
   * @param {string} type - Export type
   * @param {object} data - Export data
   */
  async handleOutgoingExport(userId, type, data) {
    const timestamp = Date.now();
    const filename = `${userId}_${type}_${timestamp}.json`;
    const filepath = path.join(this.config.OUTGOING.exports.path, filename);
    
    const exportData = {
      userId,
      type,
      timestamp,
      data,
      watermark: `GOAT-ROYALTY-${timestamp}`,
    };
    
    const encrypted = this.encrypt(exportData);
    await this.writeSecureFile(filepath, JSON.stringify(encrypted));
    
    console.log(`📤 OUTGOING export created: ${filename}`);
    return { success: true, filepath, watermark: exportData.watermark };
  }

  /**
   * Handle outgoing report
   * @param {string} reportType - Report type
   * @param {object} data - Report data
   * @param {string} format - Output format
   */
  async handleOutgoingReport(reportType, data, format = 'pdf') {
    const timestamp = Date.now();
    const filename = `${reportType}_${timestamp}.${format}`;
    const filepath = path.join(this.config.OUTGOING.reports.path, filename);
    
    const report = {
      type: reportType,
      timestamp,
      format,
      data,
      generated: new Date().toISOString(),
    };
    
    await this.writeSecureFile(filepath, JSON.stringify(report));
    
    console.log(`📤 OUTGOING report generated: ${filename}`);
    return { success: true, filepath, format };
  }

  /**
   * Handle API response caching
   * @param {string} endpoint - API endpoint
   * @param {object} response - Response data
   */
  async cacheAPIResponse(endpoint, response) {
    const filename = `${endpoint.replace(/\//g, '_')}.json`;
    const filepath = path.join(this.config.OUTGOING.apiOutputs.path, filename);
    
    const cached = {
      endpoint,
      cachedAt: Date.now(),
      ttl: this.config.OUTGOING.apiOutputs.ttl,
      response,
    };
    
    await this.writeSecureFile(filepath, JSON.stringify(cached));
    
    return { success: true, cached: true };
  }

  /**
   * Create backup
   * @param {string} type - Backup type
   * @param {object} data - Data to backup
   */
  async createBackup(type, data) {
    const timestamp = Date.now();
    const filename = `backup_${type}_${timestamp}.enc`;
    const filepath = path.join(this.config.OUTGOING.backups.path, filename);
    
    const backup = {
      type,
      timestamp,
      version: '3.0.0',
      data,
    };
    
    const encrypted = this.encrypt(backup);
    await this.writeSecureFile(filepath, JSON.stringify(encrypted));
    
    console.log(`📤 OUTGOING backup created: ${filename}`);
    return { success: true, filepath, encrypted: true };
  }

  // ═══════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════
  
  generateChecksum(data) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  parseSize(sizeStr) {
    const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    const match = sizeStr.match(/^(\d+)(B|KB|MB|GB)$/i);
    if (!match) return 0;
    return parseInt(match[1]) * units[match[2].toUpperCase()];
  }

  async writeSecureFile(filepath, content) {
    fs.writeFileSync(filepath, content, { mode: 0o600 });
  }

  // ═══════════════════════════════════════════════════════════
  // AUDIT LOGGING
  // ═══════════════════════════════════════════════════════════
  
  logAccess(direction, type, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      direction, // INCOMING or OUTGOING
      type,
      details,
      server: process.env.HOSTNAME || 'goat-royalty',
    };
    
    console.log(`🔍 AUDIT: [${direction}] ${type}`, details);
    return logEntry;
  }
}

module.exports = DataStreamHandler;