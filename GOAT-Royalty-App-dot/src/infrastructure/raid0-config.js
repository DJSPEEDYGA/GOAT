/**
 * GOAT Royalty App - RAID 0 Security Architecture
 * High-Level Security Configuration
 * 
 * INCOMING DATA ←→ OUTGOING DATA (Separated)
 * AWS-style infrastructure
 */

const RAID0_CONFIG = {
  // ═══════════════════════════════════════════════════════════
  // INCOMING DATA STREAMS (Isolated from outgoing)
  // ═══════════════════════════════════════════════════════════
  INCOMING: {
    baseDir: '/raid0/incoming',
    
    streams: {
      path: '/raid0/incoming/streams',
      description: 'Real-time data streams from APIs and webhooks',
      encrypted: true,
      rateLimit: 1000, // requests per minute
    },
    
    uploads: {
      path: '/raid0/incoming/uploads',
      description: 'File uploads from users and external sources',
      maxSize: '500MB',
      allowedTypes: ['.mp3', '.wav', '.flac', '.pdf', '.csv', '.json'],
      virusScan: true,
    },
    
    apiInputs: {
      path: '/raid0/incoming/api-inputs',
      description: 'API request payloads and query data',
      logging: true,
      retention: '30d',
    },
    
    webhooks: {
      path: '/raid0/incoming/webhooks',
      description: 'Incoming webhook payloads',
      signature: true, // Require signature verification
      allowedSources: [
        'stripe.com',
        'ascap.com',
        'bmi.com',
        'mlc.com',
        'spotify.com',
        'apple.com',
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════
  // OUTGOING DATA STREAMS (Isolated from incoming)
  // ═══════════════════════════════════════════════════════════
  OUTGOING: {
    baseDir: '/raid0/outgoing',
    
    exports: {
      path: '/raid0/outgoing/exports',
      description: 'Data exports for users and partners',
      encrypted: true,
      watermark: true, // Add watermark to exports
    },
    
    reports: {
      path: '/raid0/outgoing/reports',
      description: 'Generated royalty and analytics reports',
      formats: ['pdf', 'csv', 'xlsx', 'json'],
      compression: 'gzip',
    },
    
    apiOutputs: {
      path: '/raid0/outgoing/api-outputs',
      description: 'API responses and cached data',
      caching: true,
      ttl: 3600, // 1 hour
    },
    
    backups: {
      path: '/raid0/outgoing/backups',
      description: 'Automated backup storage',
      schedule: '0 2 * * *', // 2 AM daily
      retention: '90d',
      encryption: 'AES-256-GCM',
    },
  },

  // ═══════════════════════════════════════════════════════════
  // SECURITY SETTINGS
  // ═══════════════════════════════════════════════════════════
  SECURITY: {
    encryption: {
      algorithm: 'AES-256-GCM',
      keyRotation: '30d',
      keyLength: 256,
    },
    
    access: {
      incoming: {
        read: ['api-server', 'webhook-handler', 'upload-service'],
        write: ['api-server', 'webhook-handler', 'upload-service'],
        delete: ['admin', 'cleanup-service'],
      },
      outgoing: {
        read: ['api-server', 'report-generator', 'export-service'],
        write: ['report-generator', 'export-service', 'backup-service'],
        delete: ['admin', 'cleanup-service'],
      },
    },
    
    firewall: {
      incomingPorts: [80, 443, 22],
      outgoingPorts: [443, 587],
      ddosProtection: true,
      rateLimitGlobal: 10000,
    },
    
    audit: {
      enabled: true,
      logAllAccess: true,
      retention: '1y',
      alertOnSuspicious: true,
    },
  },

  // ═══════════════════════════════════════════════════════════
  // VPS CONFIGURATION
  // ═══════════════════════════════════════════════════════════
  VPS: {
    primary: {
      ip: '93.127.214.171',
      hostname: 'srv832760.hstgr.cloud',
      type: 'docker',
      specs: 'KVM 8 (8 CPU, 32GB RAM, 200GB disk)',
    },
    secondary: {
      ip: '72.61.193.184',
      hostname: 'srv1148455.hstgr.cloud',
      type: 'nemoclaw',
      specs: 'KVM 2 (2 CPU, 8GB RAM, 100GB disk)',
    },
  },
};

module.exports = RAID0_CONFIG;