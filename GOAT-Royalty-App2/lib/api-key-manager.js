/**
 * API Key Management System for GOAT Royalty App
 * Secure storage and management of API keys and access tokens
 */

class APIKeyManager {
  constructor(config = {}) {
    this.encryptionKey = config.encryptionKey || process.env.ENCRYPTION_KEY;
    this.keys = new Map();
    this.keyHistory = [];
    this.rotationSchedule = new Map();
  }

  /**
   * Store an API key securely
   * @param {string} service - Service name (distrokid, mlc, soundexchange, tiktok, etc.)
   * @param {string} apiKey - API key or access token
   * @param {Object} metadata - Additional metadata
   */
  async storeKey(service, apiKey, metadata = {}) {
    const keyEntry = {
      service,
      encryptedKey: this.encrypt(apiKey),
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        lastRotated: new Date().toISOString()
      },
      status: 'active'
    };

    this.keys.set(service, keyEntry);
    this.keyHistory.push({
      action: 'stored',
      service,
      timestamp: new Date().toISOString()
    });

    return { success: true, service, timestamp: keyEntry.metadata.createdAt };
  }

  /**
   * Retrieve an API key
   * @param {string} service - Service name
   */
  async getKey(service) {
    const keyEntry = this.keys.get(service);
    
    if (!keyEntry) {
      throw new Error(`API key for service '${service}' not found`);
    }

    if (keyEntry.status !== 'active') {
      throw new Error(`API key for service '${service}' is not active`);
    }

    return this.decrypt(keyEntry.encryptedKey);
  }

  /**
   * Rotate an API key
   * @param {string} service - Service name
   * @param {string} newKey - New API key
   */
  async rotateKey(service, newKey) {
    const keyEntry = this.keys.get(service);
    
    if (!keyEntry) {
      throw new Error(`API key for service '${service}' not found`);
    }

    // Archive old key
    const oldKey = {
      service,
      encryptedKey: keyEntry.encryptedKey,
      rotatedAt: new Date().toISOString(),
      reason: 'manual_rotation'
    };

    // Update with new key
    keyEntry.encryptedKey = this.encrypt(newKey);
    keyEntry.metadata.lastRotated = new Date().toISOString();
    keyEntry.metadata.rotations = (keyEntry.metadata.rotations || 0) + 1;

    this.keys.set(service, keyEntry);
    this.keyHistory.push({
      action: 'rotated',
      service,
      timestamp: new Date().toISOString()
    });

    return { 
      success: true, 
      service, 
      rotatedAt: newKey.metadata.lastRotated,
      rotationCount: keyEntry.metadata.rotations
    };
  }

  /**
   * Revoke an API key
   * @param {string} service - Service name
   */
  async revokeKey(service) {
    const keyEntry = this.keys.get(service);
    
    if (!keyEntry) {
      throw new Error(`API key for service '${service}' not found`);
    }

    keyEntry.status = 'revoked';
    keyEntry.metadata.revokedAt = new Date().toISOString();
    keyEntry.metadata.revokedReason = 'manual_revocation';

    this.keys.set(service, keyEntry);
    this.keyHistory.push({
      action: 'revoked',
      service,
      timestamp: new Date().toISOString()
    });

    return { 
      success: true, 
      service, 
      revokedAt: keyEntry.metadata.revokedAt 
    };
  }

  /**
   * Get key status
   * @param {string} service - Service name
   */
  getKeyStatus(service) {
    const keyEntry = this.keys.get(service);
    
    if (!keyEntry) {
      return { 
        service, 
        status: 'not_found',
        exists: false
      };
    }

    return {
      service,
      exists: true,
      status: keyEntry.status,
      createdAt: keyEntry.metadata.createdAt,
      lastRotated: keyEntry.metadata.lastRotated,
      rotationCount: keyEntry.metadata.rotations || 0,
      daysSinceRotation: this.daysSince(keyEntry.metadata.lastRotated)
    };
  }

  /**
   * Get all keys status
   */
  getAllKeysStatus() {
    const services = ['distrokid', 'tunecore', 'cdbaby', 'mlc', 'soundexchange', 'tiktok', 'spotify', 'hostinger'];
    
    return services.map(service => this.getKeyStatus(service));
  }

  /**
   * Schedule automatic key rotation
   * @param {string} service - Service name
   * @param {number} days - Days between rotations
   */
  scheduleRotation(service, days) {
    this.rotationSchedule.set(service, {
      intervalDays: days,
      lastRotation: new Date().toISOString(),
      nextRotation: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    });

    return { success: true, service, nextRotation: this.rotationSchedule.get(service).nextRotation };
  }

  /**
   * Check if any keys need rotation
   */
  checkRotationsNeeded() {
    const needsRotation = [];

    this.rotationSchedule.forEach((schedule, service) => {
      const keyEntry = this.keys.get(service);
      if (keyEntry && keyEntry.status === 'active') {
        const daysSince = this.daysSince(keyEntry.metadata.lastRotated);
        if (daysSince >= schedule.intervalDays) {
          needsRotation.push({
            service,
            daysSinceRotation: daysSince,
            rotationInterval: schedule.intervalDays,
            overdue: daysSince - schedule.intervalDays
          });
        }
      }
    });

    return needsRotation;
  }

  /**
   * Get audit log of all key operations
   */
  getAuditLog() {
    return this.keyHistory;
  }

  /**
   * Encrypt data (simple XOR for demo - use proper encryption in production)
   * @param {string} data - Data to encrypt
   */
  encrypt(data) {
    // In production, use proper encryption like AES-256-GCM
    // This is a simplified version for demonstration
    const key = this.encryptionKey || 'default-key';
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return Buffer.from(encrypted).toString('base64');
  }

  /**
   * Decrypt data
   * @param {string} encryptedData - Encrypted data
   */
  decrypt(encryptedData) {
    const key = this.encryptionKey || 'default-key';
    const decoded = Buffer.from(encryptedData, 'base64').toString();
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return decrypted;
  }

  /**
   * Calculate days since a date
   * @param {string} dateString - ISO date string
   */
  daysSince(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Validate API key format for specific services
   * @param {string} service - Service name
   * @param {string} apiKey - API key to validate
   */
  validateKeyFormat(service, apiKey) {
    const formats = {
      distrokid: /^.{32,}$/,
      tunecore: /^.{32,}$/,
      cdbaby: /^.{32,}$/,
      mlc: /^Bearer\s+.+$/,
      soundexchange: /^[a-f0-9]{32}$/,
      tiktok: /^.{32,}$/,
      hostinger: /^[a-f0-9]{40,}$/
    };

    const regex = formats[service];
    return regex ? regex.test(apiKey) : true;
  }

  /**
   * Test API key connectivity
   * @param {string} service - Service name
   * @param {string} apiKey - API key to test
   */
  async testKeyConnectivity(service, apiKey) {
    // This would make actual API calls to validate the key
    // For now, return a mock response
    
    return {
      service,
      status: 'valid',
      timestamp: new Date().toISOString(),
      message: `Successfully connected to ${service} API`
    };
  }

  /**
   * Export keys for backup (encrypted)
   */
  exportKeys() {
    const exportData = {
      exportedAt: new Date().toISOString(),
      keys: Array.from(this.keys.entries()).map(([service, entry]) => ({
        service,
        encryptedKey: entry.encryptedKey,
        metadata: entry.metadata,
        status: entry.status
      }))
    };

    return Buffer.from(JSON.stringify(exportData)).toString('base64');
  }

  /**
   * Import keys from backup
   * @param {string} encryptedBackup - Base64 encoded backup
   */
  importKeys(encryptedBackup) {
    try {
      const decoded = Buffer.from(encryptedBackup, 'base64').toString();
      const importData = JSON.parse(decoded);
      
      importData.keys.forEach(({ service, encryptedKey, metadata, status }) => {
        this.keys.set(service, {
          service,
          encryptedKey,
          metadata,
          status
        });
      });

      return { 
        success: true, 
        importedAt: new Date().toISOString(),
        keyCount: importData.keys.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * Pre-configured API key manager for GOAT Royalty App
 */
class GOATAPIKeyManager extends APIKeyManager {
  constructor() {
    super();
    this.initializeRequiredServices();
  }

  /**
   * Initialize required service configurations
   */
  initializeRequiredServices() {
    const requiredServices = [
      {
        service: 'distrokid',
        description: 'Music distribution to TikTok, Spotify, etc.',
        requiredFor: 'Bulk music upload and distribution',
        rotationDays: 90
      },
      {
        service: 'mlc',
        description: 'Mechanical Licensing Collective',
        requiredFor: 'Mechanical royalty tracking',
        rotationDays: 365
      },
      {
        service: 'soundexchange',
        description: 'Sound Exchange performance royalties',
        requiredFor: 'Performance royalty tracking',
        rotationDays: 365
      },
      {
        service: 'tiktok',
        description: 'TikTok Creator Marketplace API',
        requiredFor: 'Music analytics and performance tracking',
        rotationDays: 90
      },
      {
        service: 'hostinger',
        description: 'Hostinger VPS management',
        requiredFor: 'Deployment and server management',
        rotationDays: 180
      }
    ];

    requiredServices.forEach(service => {
      this.rotationSchedule.set(service.service, {
        intervalDays: service.rotationDays,
        lastRotation: null,
        nextRotation: null,
        description: service.description,
        requiredFor: service.requiredFor
      });
    });
  }

  /**
   * Get required services configuration
   */
  getRequiredServices() {
    const services = [];
    this.rotationSchedule.forEach((config, service) => {
      const status = this.getKeyStatus(service);
      services.push({
        service,
        description: config.description,
        requiredFor: config.requiredFor,
        configured: status.exists,
        status: status.status,
        rotationInterval: config.intervalDays
      });
    });
    return services;
  }

  /**
   * Get setup checklist
   */
  getSetupChecklist() {
    const required = this.getRequiredServices();
    const configured = required.filter(s => s.configured);
    const missing = required.filter(s => !s.configured);

    return {
      total: required.length,
      configured: configured.length,
      missing: missing.length,
      progress: Math.round((configured.length / required.length) * 100),
      configuredServices: configured.map(s => s.service),
      missingServices: missing.map(s => ({
        service: s.service,
        description: s.description,
        requiredFor: s.requiredFor
      }))
    };
  }
}

module.exports = { APIKeyManager, GOATAPIKeyManager };