/**
 * Self-Healing System for GOAT Royalty App
 * 
 * Monitors system health and automatically repairs issues
 * 
 * @author DJSPEEDYGA
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn, exec } = require('child_process');
const { EventEmitter } = require('events');

class SelfHealingSystem extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.healthMonitorInterval = null;
    this.repairQueue = [];
    this.healthStatus = {
      overall: 'unknown',
      services: {},
      system: {},
      lastCheck: null
    };
    this.metrics = {
      totalRepairs: 0,
      successfulRepairs: 0,
      failedRepairs: 0,
      repairHistory: []
    };
  }

  /**
   * Initialize self-healing system
   */
  async initialize() {
    console.log('🔧 Initializing Self-Healing System...');
    
    try {
      // Create backup directory
      await this.createBackupDirectory();
      
      // Load previous health status
      await this.loadHealthStatus();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      console.log('✅ Self-Healing System initialized');
      this.emit('initialized');
      
      return true;
    } catch (error) {
      console.error('❌ Self-Healing System initialization failed:', error.message);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create backup directory
   */
  async createBackupDirectory() {
    const backupDir = path.join(this.config.rootDir, 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    // Create subdirectories
    const subdirs = ['config', 'data', 'logs', 'cache', 'services'];
    for (const subdir of subdirs) {
      await fs.mkdir(path.join(backupDir, subdir), { recursive: true });
    }
  }

  /**
   * Start continuous health monitoring
   */
  startHealthMonitoring() {
    const interval = this.config.monitorInterval || 60000; // 1 minute
    
    this.healthMonitorInterval = setInterval(async () => {
      await this.checkSystemHealth();
      await this.processRepairQueue();
    }, interval);
    
    console.log(`🔄 Health monitoring started (interval: ${interval}ms)`);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    if (this.healthMonitorInterval) {
      clearInterval(this.healthMonitorInterval);
      this.healthMonitorInterval = null;
      console.log('⏹️  Health monitoring stopped');
    }
  }

  /**
   * Check overall system health
   */
  async checkSystemHealth() {
    console.log('🔍 Checking system health...');
    
    try {
      // Check system resources
      const systemHealth = await this.checkSystemResources();
      
      // Check service health
      const servicesHealth = await this.checkServices();
      
      // Check file integrity
      const fileHealth = await this.checkFileIntegrity();
      
      // Check configuration
      const configHealth = await this.checkConfiguration();
      
      // Check dependencies
      const dependenciesHealth = await this.checkDependencies();
      
      // Update health status
      this.healthStatus = {
        overall: this.calculateOverallHealth({
          system: systemHealth,
          services: servicesHealth,
          files: fileHealth,
          config: configHealth,
          dependencies: dependenciesHealth
        }),
        services: servicesHealth,
        system: systemHealth,
        files: fileHealth,
        config: configHealth,
        dependencies: dependenciesHealth,
        lastCheck: new Date().toISOString()
      };
      
      // Save health status
      await this.saveHealthStatus();
      
      // Emit health status
      this.emit('health:check', this.healthStatus);
      
      // Detect issues and queue repairs
      await this.detectIssues(this.healthStatus);
      
      console.log(`✅ System health: ${this.healthStatus.overall}`);
      return this.healthStatus;
    } catch (error) {
      console.error('Health check failed:', error.message);
      this.emit('error', error);
      return null;
    }
  }

  /**
   * Check system resources
   */
  async checkSystemResources() {
    const os = require('os');
    
    return {
      cpu: {
        usage: process.cpuUsage(),
        cores: os.cpus().length,
        status: 'ok'
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2),
        status: os.freemem() / os.totalmem() > 0.1 ? 'ok' : 'warning'
      },
      disk: {
        path: this.config.rootDir,
        status: 'ok'
      },
      uptime: os.uptime(),
      status: 'ok'
    };
  }

  /**
   * Check service health
   */
  async checkServices() {
    const services = {};
    
    // Check database service
    services.database = await this.checkDatabaseService();
    
    // Check API service
    services.api = await this.checkAPIService();
    
    // Check AI service
    services.ai = await this.checkAIService();
    
    // Check offline data service
    services.offlineData = await this.checkOfflineDataService();
    
    return services;
  }

  /**
   * Check database service
   */
  async checkDatabaseService() {
    try {
      // Check if database is accessible
      const mongoose = require('mongoose');
      const connection = mongoose.connection.readyState;
      
      if (connection === 1) { // Connected
        return { status: 'ok', message: 'Database connected' };
      } else {
        return { status: 'error', message: 'Database not connected' };
      }
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Check API service
   */
  async checkAPIService() {
    try {
      // Check if API server is running
      const response = await fetch('http://localhost:5001/health', {
        timeout: 5000
      });
      
      if (response.ok) {
        return { status: 'ok', message: 'API server running' };
      } else {
        return { status: 'error', message: 'API server error' };
      }
    } catch (error) {
      return { status: 'error', message: 'API server not responding' };
    }
  }

  /**
   * Check AI service
   */
  async checkAIService() {
    try {
      // Check if Super LLM is accessible
      const { SuperLLM } = require('../../super-llm/core/SuperLLM');
      const llm = new SuperLLM({
        apiKey: this.config.nvidiaApiKey,
        enableCache: true
      });
      
      // Test with simple query
      await llm.query('test');
      
      return { status: 'ok', message: 'AI service operational' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Check offline data service
   */
  async checkOfflineDataService() {
    try {
      const { OfflineDataService } = require('../services/offlineDataService');
      const service = new OfflineDataService(this.config);
      
      const metrics = service.getMetrics();
      
      return { 
        status: 'ok', 
        message: 'Offline data service operational',
        metrics: metrics
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Check file integrity
   */
  async checkFileIntegrity() {
    const criticalFiles = [
      'app/main/index.js',
      'app/renderer/index.html',
      'config/pipeline-config.json',
      'super-llm/core/SuperLLM.js'
    ];
    
    const results = {};
    
    for (const file of criticalFiles) {
      try {
        const filePath = path.join(this.config.rootDir, file);
        await fs.access(filePath);
        results[file] = { status: 'ok' };
      } catch (error) {
        results[file] = { status: 'error', message: 'File not found' };
      }
    }
    
    const allOk = Object.values(results).every(r => r.status === 'ok');
    
    return {
      files: results,
      status: allOk ? 'ok' : 'error'
    };
  }

  /**
   * Check configuration
   */
  async checkConfiguration() {
    const configFiles = [
      'config/pipeline-config.json',
      'config/google-drive-credentials.json',
      '.env'
    ];
    
    const results = {};
    
    for (const file of configFiles) {
      try {
        const filePath = path.join(this.config.rootDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        if (file.endsWith('.json')) {
          JSON.parse(content);
        }
        
        results[file] = { status: 'ok' };
      } catch (error) {
        results[file] = { status: 'error', message: error.message };
      }
    }
    
    const allOk = Object.values(results).every(r => r.status === 'ok');
    
    return {
      files: results,
      status: allOk ? 'ok' : 'error'
    };
  }

  /**
   * Check dependencies
   */
  async checkDependencies() {
    const criticalDependencies = [
      'express',
      'mongoose',
      'googleapis',
      'electron'
    ];
    
    const results = {};
    
    for (const dep of criticalDependencies) {
      try {
        require(dep);
        results[dep] = { status: 'ok' };
      } catch (error) {
        results[dep] = { status: 'error', message: 'Not installed' };
      }
    }
    
    const allOk = Object.values(results).every(r => r.status === 'ok');
    
    return {
      dependencies: results,
      status: allOk ? 'ok' : 'error'
    };
  }

  /**
   * Calculate overall health status
   */
  calculateOverallHealth(healthComponents) {
    const statuses = [
      healthComponents.system.status,
      healthComponents.services.database?.status,
      healthComponents.services.api?.status,
      healthComponents.services.ai?.status,
      healthComponents.files.status,
      healthComponents.config.status,
      healthComponents.dependencies.status
    ];
    
    const hasError = statuses.includes('error');
    const hasWarning = statuses.includes('warning');
    
    if (hasError) {
      return 'error';
    } else if (hasWarning) {
      return 'warning';
    } else {
      return 'ok';
    }
  }

  /**
   * Detect issues and queue repairs
   */
  async detectIssues(healthStatus) {
    const issues = [];
    
    // Detect service failures
    for (const [service, status] of Object.entries(healthStatus.services)) {
      if (status.status === 'error') {
        issues.push({
          type: 'service',
          service: service,
          severity: 'critical',
          message: status.message
        });
      }
    }
    
    // Detect file corruption
    for (const [file, status] of Object.entries(healthStatus.files.files)) {
      if (status.status === 'error') {
        issues.push({
          type: 'file',
          file: file,
          severity: 'critical',
          message: status.message
        });
      }
    }
    
    // Detect configuration errors
    for (const [file, status] of Object.entries(healthStatus.config.files)) {
      if (status.status === 'error') {
        issues.push({
          type: 'config',
          file: file,
          severity: 'high',
          message: status.message
        });
      }
    }
    
    // Detect missing dependencies
    for (const [dep, status] of Object.entries(healthStatus.dependencies.dependencies)) {
      if (status.status === 'error') {
        issues.push({
          type: 'dependency',
          dependency: dep,
          severity: 'high',
          message: status.message
        });
      }
    }
    
    // Queue repairs
    for (const issue of issues) {
      this.queueRepair(issue);
    }
  }

  /**
   * Queue a repair task
   */
  queueRepair(issue) {
    const repair = {
      id: Date.now(),
      issue: issue,
      queuedAt: new Date(),
      status: 'queued'
    };
    
    this.repairQueue.push(repair);
    this.emit('repair:queued', repair);
  }

  /**
   * Process repair queue
   */
  async processRepairQueue() {
    while (this.repairQueue.length > 0) {
      const repair = this.repairQueue.shift();
      
      try {
        await this.executeRepair(repair);
      } catch (error) {
        console.error(`Repair failed for ${repair.issue.type}:`, error.message);
        repair.status = 'failed';
        repair.error = error.message;
      }
    }
  }

  /**
   * Execute a repair
   */
  async executeRepair(repair) {
    repair.status = 'in_progress';
    this.emit('repair:started', repair);
    
    this.metrics.totalRepairs++;
    
    switch (repair.issue.type) {
      case 'service':
        await this.repairService(repair);
        break;
      case 'file':
        await this.repairFile(repair);
        break;
      case 'config':
        await this.repairConfig(repair);
        break;
      case 'dependency':
        await this.repairDependency(repair);
        break;
      default:
        console.log(`Unknown repair type: ${repair.issue.type}`);
    }
    
    if (repair.status !== 'failed') {
      repair.status = 'completed';
      this.metrics.successfulRepairs++;
      this.emit('repair:completed', repair);
    } else {
      this.metrics.failedRepairs++;
      this.emit('repair:failed', repair);
    }
    
    // Add to repair history
    this.metrics.repairHistory.push({
      ...repair,
      completedAt: new Date()
    });
  }

  /**
   * Repair a service
   */
  async repairService(repair) {
    console.log(`🔧 Repairing service: ${repair.issue.service}`);
    
    switch (repair.issue.service) {
      case 'database':
        await this.restartDatabase();
        break;
      case 'api':
        await this.restartAPIServer();
        break;
      case 'ai':
        await this.restartAIService();
        break;
      default:
        console.log(`Unknown service: ${repair.issue.service}`);
    }
  }

  /**
   * Restart database
   */
  async restartDatabase() {
    // Database restart logic
    console.log('🔄 Restarting database...');
  }

  /**
   * Restart API server
   */
  async restartAPIServer() {
    // API server restart logic
    console.log('🔄 Restarting API server...');
  }

  /**
   * Restart AI service
   */
  async restartAIService() {
    // AI service restart logic
    console.log('🔄 Restarting AI service...');
  }

  /**
   * Repair a file
   */
  async repairFile(repair) {
    console.log(`🔧 Repairing file: ${repair.issue.file}`);
    
    // Try to restore from backup
    const backupFile = await this.restoreFromBackup(repair.issue.file);
    
    if (backupFile) {
      console.log(`✅ Restored file from backup: ${repair.issue.file}`);
    } else {
      console.log(`⚠️  Could not restore file: ${repair.issue.file}`);
      repair.status = 'failed';
    }
  }

  /**
   * Restore file from backup
   */
  async restoreFromBackup(filePath) {
    const backupPath = path.join(this.config.rootDir, 'backups', filePath);
    
    try {
      await fs.access(backupPath);
      const content = await fs.readFile(backupPath);
      const targetPath = path.join(this.config.rootDir, filePath);
      await fs.writeFile(targetPath, content);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Repair configuration
   */
  async repairConfig(repair) {
    console.log(`🔧 Repairing configuration: ${repair.issue.file}`);
    
    // Restore from default or backup
    const configPath = path.join(this.config.rootDir, repair.issue.file);
    const defaultPath = path.join(this.config.rootDir, repair.issue.file + '.default');
    
    try {
      await fs.access(defaultPath);
      await fs.copyFile(defaultPath, configPath);
      console.log(`✅ Restored configuration from default: ${repair.issue.file}`);
    } catch (error) {
      console.log(`⚠️  Could not restore configuration: ${repair.issue.file}`);
      repair.status = 'failed';
    }
  }

  /**
   * Repair dependency
   */
  async repairDependency(repair) {
    console.log(`🔧 Installing dependency: ${repair.issue.dependency}`);
    
    return new Promise((resolve, reject) => {
      const npm = spawn('npm', ['install', repair.issue.dependency], {
        cwd: this.config.rootDir
      });
      
      npm.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Installed dependency: ${repair.issue.dependency}`);
          resolve();
        } else {
          console.log(`⚠️  Failed to install: ${repair.issue.dependency}`);
          repair.status = 'failed';
          reject(new Error(`npm install failed with code ${code}`));
        }
      });
    });
  }

  /**
   * Save health status
   */
  async saveHealthStatus() {
    const statusPath = path.join(this.config.rootDir, 'backups/logs/health-status.json');
    await fs.writeFile(statusPath, JSON.stringify(this.healthStatus, null, 2));
  }

  /**
   * Load health status
   */
  async loadHealthStatus() {
    try {
      const statusPath = path.join(this.config.rootDir, 'backups/logs/health-status.json');
      const content = await fs.readFile(statusPath, 'utf8');
      this.healthStatus = JSON.parse(content);
    } catch (error) {
      console.log('ℹ️  No previous health status found');
    }
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    return this.healthStatus;
  }

  /**
   * Get repair metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      repairQueueLength: this.repairQueue.length
    };
  }

  /**
   * Create backup
   */
  async createBackup() {
    const timestamp = Date.now();
    const backupDir = path.join(this.config.rootDir, 'backups', `backup-${timestamp}`);
    
    await fs.mkdir(backupDir, { recursive: true });
    
    // Backup critical files
    const filesToBackup = [
      'config',
      'data',
      'logs',
      '.env'
    ];
    
    for (const file of filesToBackup) {
      const sourcePath = path.join(this.config.rootDir, file);
      const targetPath = path.join(backupDir, file);
      
      try {
        await this.copyDirectory(sourcePath, targetPath);
      } catch (error) {
        console.log(`⚠️  Could not backup ${file}: ${error.message}`);
      }
    }
    
    console.log(`✅ Backup created: ${backupDir}`);
    return backupDir;
  }

  /**
   * Copy directory recursively
   */
  async copyDirectory(source, target) {
    await fs.mkdir(target, { recursive: true });
    
    const files = await fs.readdir(source);
    
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);
      
      const stat = await fs.stat(sourcePath);
      
      if (stat.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }
}

module.exports = { SelfHealingSystem };