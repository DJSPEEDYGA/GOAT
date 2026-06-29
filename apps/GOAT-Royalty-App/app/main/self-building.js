/**
 * Self-Building System for GOAT Royalty App
 * 
 * This system enables the application to:
 * - Automatically update from GitHub
 * - Self-compile and rebuild
 * - Dynamically load new features
 * - Hot reload without restart
 * - Rollback on failed updates
 * 
 * @module SelfBuildingSystem
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process').promises;
const crypto = require('crypto');

class SelfBuildingSystem {
  constructor(config = {}) {
    this.config = {
      // GitHub Configuration
      github: {
        owner: config.github?.owner || 'DJSPEEDYGA',
        repo: config.github?.repo || 'GOAT-Royalty-App',
        branch: config.github?.branch || 'main',
        token: config.github?.token || process.env.GITHUB_TOKEN
      },
      
      // Update Configuration
      update: {
        checkInterval: config.update?.checkInterval || 3600000, // 1 hour
        autoUpdate: config.update?.autoUpdate !== false,
        requireConfirmation: config.update?.requireConfirmation !== true,
        backupBeforeUpdate: config.update?.backupBeforeUpdate !== false,
        maxRetries: config.update?.maxRetries || 3
      },
      
      // Build Configuration
      build: {
        commands: config.build?.commands || ['npm install', 'npm run build'],
        outputDir: config.build?.outputDir || './dist',
        tempDir: config.build?.tempDir || './temp-build'
      },
      
      // Rollback Configuration
      rollback: {
        enabled: config.rollback?.enabled !== false,
        maxBackups: config.rollback?.maxBackups || 5,
        backupDir: config.rollback?.backupDir || './backups'
      },
      
      // Logging
      logFile: config.logFile || './logs/self-building.log',
      enableConsole: config.enableConsole !== false
    };
    
    this.isBuilding = false;
    this.isUpdating = false;
    this.buildQueue = [];
    this.updateQueue = [];
    this.currentBuild = null;
    this.currentUpdate = null;
    this.buildHistory = [];
    this.updateHistory = [];
    this.rollbackHistory = [];
    
    this.initialize();
  }
  
  /**
   * Initialize the self-building system
   */
  async initialize() {
    try {
      await this.ensureDirectories();
      await this.loadBuildHistory();
      await this.loadUpdateHistory();
      await this.loadRollbackHistory();
      
      this.log('Self-Building System initialized');
      this.log(`Configuration: ${JSON.stringify({
        autoUpdate: this.config.update.autoUpdate,
        checkInterval: this.config.update.checkInterval,
        backupEnabled: this.config.rollback.enabled
      }, null, 2)}`);
      
      if (this.config.update.autoUpdate) {
        this.startUpdateChecker();
      }
      
      this.startBuildProcessor();
      this.startUpdateProcessor();
      
    } catch (error) {
      this.log('Failed to initialize Self-Building System', 'error');
      this.log(error.message, 'error');
    }
  }
  
  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    const dirs = [
      './logs',
      this.config.build.tempDir,
      this.config.build.outputDir,
      this.config.rollback.backupDir,
      './updates'
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }
  
  /**
   * Load build history from file
   */
  async loadBuildHistory() {
    try {
      const historyFile = './build-history.json';
      const data = await fs.readFile(historyFile, 'utf8');
      this.buildHistory = JSON.parse(data);
    } catch (error) {
      this.buildHistory = [];
    }
  }
  
  /**
   * Save build history to file
   */
  async saveBuildHistory() {
    try {
      const historyFile = './build-history.json';
      await fs.writeFile(historyFile, JSON.stringify(this.buildHistory, null, 2));
    } catch (error) {
      this.log('Failed to save build history', 'error');
    }
  }
  
  /**
   * Load update history from file
   */
  async loadUpdateHistory() {
    try {
      const historyFile = './update-history.json';
      const data = await fs.readFile(historyFile, 'utf8');
      this.updateHistory = JSON.parse(data);
    } catch (error) {
      this.updateHistory = [];
    }
  }
  
  /**
   * Save update history to file
   */
  async saveUpdateHistory() {
    try {
      const historyFile = './update-history.json';
      await fs.writeFile(historyFile, JSON.stringify(this.updateHistory, null, 2));
    } catch (error) {
      this.log('Failed to save update history', 'error');
    }
  }
  
  /**
   * Load rollback history from file
   */
  async loadRollbackHistory() {
    try {
      const historyFile = './rollback-history.json';
      const data = await fs.readFile(historyFile, 'utf8');
      this.rollbackHistory = JSON.parse(data);
    } catch (error) {
      this.rollbackHistory = [];
    }
  }
  
  /**
   * Save rollback history to file
   */
  async saveRollbackHistory() {
    try {
      const historyFile = './rollback-history.json';
      await fs.writeFile(historyFile, JSON.stringify(this.rollbackHistory, null, 2));
    } catch (error) {
      this.log('Failed to save rollback history', 'error');
    }
  }
  
  /**
   * Log messages to file and console
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // Write to log file
    fs.appendFile(this.config.logFile, logMessage + '\n').catch(err => {
      if (this.config.enableConsole) {
        console.error(`Failed to write to log file: ${err.message}`);
      }
    });
    
    // Print to console
    if (this.config.enableConsole) {
      const colors = {
        info: '\x1b[36m',    // Cyan
        success: '\x1b[32m',  // Green
        warning: '\x1b[33m',  // Yellow
        error: '\x1b[31m',    // Red
        reset: '\x1b[0m'
      };
      console.log(`${colors[level] || colors.info}${logMessage}${colors.reset}`);
    }
  }
  
  /**
   * Check for updates from GitHub
   */
  async checkForUpdates() {
    try {
      this.log('Checking for updates...');
      
      const { owner, repo, branch, token } = this.config.github;
      
      // Fetch latest commit from GitHub
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`,
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }
      
      const latestCommit = await response.json();
      const latestSha = latestCommit.sha;
      
      // Get current local commit
      const localSha = await this.getLocalCommitSha();
      
      // Check if update available
      if (localSha !== latestSha) {
        this.log('Update available!');
        this.log(`Local: ${localSha.substring(0, 7)}, Remote: ${latestSha.substring(0, 7)}`);
        
        const updateInfo = {
          sha: latestSha,
          message: latestCommit.commit.message,
          author: latestCommit.commit.author.name,
          date: latestCommit.commit.author.date,
          url: latestCommit.html_url
        };
        
        if (this.config.update.autoUpdate) {
          if (this.config.update.requireConfirmation) {
            this.log('Update requires confirmation. Queuing for manual approval.');
            return { updateAvailable: true, info: updateInfo, requiresConfirmation: true };
          } else {
            this.log('Auto-updating...');
            return await this.performUpdate(updateInfo);
          }
        } else {
          this.log('Auto-update disabled. Update available but not applied.');
          return { updateAvailable: true, info: updateInfo, autoUpdateDisabled: true };
        }
      } else {
        this.log('Already up to date');
        return { updateAvailable: false };
      }
      
    } catch (error) {
      this.log(`Failed to check for updates: ${error.message}`, 'error');
      return { updateAvailable: false, error: error.message };
    }
  }
  
  /**
   * Get local Git commit SHA
   */
  async getLocalCommitSha() {
    try {
      const { stdout } = await exec('git rev-parse HEAD');
      return stdout.trim();
    } catch (error) {
      this.log('Failed to get local commit SHA', 'warning');
      return 'unknown';
    }
  }
  
  /**
   * Perform update from GitHub
   */
  async performUpdate(updateInfo) {
    if (this.isUpdating) {
      this.log('Update already in progress', 'warning');
      return { success: false, message: 'Update already in progress' };
    }
    
    this.isUpdating = true;
    const updateId = crypto.randomUUID();
    const startTime = new Date();
    
    this.log(`Starting update ${updateId}...`);
    
    const updateRecord = {
      id: updateId,
      sha: updateInfo.sha,
      message: updateInfo.message,
      startTime: startTime.toISOString(),
      status: 'in_progress'
    };
    
    try {
      // Create backup if enabled
      if (this.config.rollback.enabled && this.config.update.backupBeforeUpdate) {
        this.log('Creating backup before update...');
        await this.createBackup(`pre-update-${updateId}`);
      }
      
      // Fetch latest changes
      this.log('Fetching latest changes...');
      await exec('git fetch origin');
      
      // Pull changes
      this.log('Pulling changes...');
      await exec(`git pull origin ${this.config.github.branch}`);
      
      // Install dependencies
      this.log('Installing dependencies...');
      await exec('npm install');
      
      // Rebuild application
      this.log('Rebuilding application...');
      const buildResult = await this.performBuild({ reason: 'update', updateId });
      
      updateRecord.status = 'success';
      updateRecord.endTime = new Date().toISOString();
      updateRecord.duration = Date.now() - startTime.getTime();
      
      this.updateHistory.push(updateRecord);
      await this.saveUpdateHistory();
      
      this.log(`Update ${updateId} completed successfully in ${updateRecord.duration}ms`, 'success');
      
      return { success: true, updateId, buildResult };
      
    } catch (error) {
      updateRecord.status = 'failed';
      updateRecord.error = error.message;
      updateRecord.endTime = new Date().toISOString();
      
      this.updateHistory.push(updateRecord);
      await this.saveUpdateHistory();
      
      this.log(`Update ${updateId} failed: ${error.message}`, 'error');
      
      // Attempt rollback if enabled
      if (this.config.rollback.enabled) {
        this.log('Attempting rollback...', 'warning');
        const rollbackResult = await this.performRollback(`pre-update-${updateId}`);
        return { success: false, error: error.message, rollbackResult };
      }
      
      return { success: false, error: error.message };
      
    } finally {
      this.isUpdating = false;
    }
  }
  
  /**
   * Perform build
   */
  async performBuild(options = {}) {
    if (this.isBuilding) {
      this.log('Build already in progress, queuing...', 'warning');
      this.buildQueue.push(options);
      return { success: false, message: 'Build queued', queuePosition: this.buildQueue.length };
    }
    
    this.isBuilding = true;
    const buildId = crypto.randomUUID();
    const startTime = new Date();
    
    this.log(`Starting build ${buildId}...`);
    
    const buildRecord = {
      id: buildId,
      reason: options.reason || 'manual',
      updateId: options.updateId || null,
      startTime: startTime.toISOString(),
      status: 'in_progress'
    };
    
    try {
      // Run build commands
      for (const command of this.config.build.commands) {
        this.log(`Executing: ${command}`);
        const { stdout, stderr } = await exec(command, { maxBuffer: 1024 * 1024 * 10 });
        if (stderr && !stderr.includes('warning')) {
          this.log(`Build warning: ${stderr}`, 'warning');
        }
      }
      
      buildRecord.status = 'success';
      buildRecord.endTime = new Date().toISOString();
      buildRecord.duration = Date.now() - startTime.getTime();
      
      this.buildHistory.push(buildRecord);
      await this.saveBuildHistory();
      
      this.log(`Build ${buildId} completed successfully in ${buildRecord.duration}ms`, 'success');
      
      return { success: true, buildId, duration: buildRecord.duration };
      
    } catch (error) {
      buildRecord.status = 'failed';
      buildRecord.error = error.message;
      buildRecord.endTime = new Date().toISOString();
      
      this.buildHistory.push(buildRecord);
      await this.saveBuildHistory();
      
      this.log(`Build ${buildId} failed: ${error.message}`, 'error');
      
      return { success: false, error: error.message };
      
    } finally {
      this.isBuilding = false;
      
      // Process queue
      if (this.buildQueue.length > 0) {
        const nextBuild = this.buildQueue.shift();
        this.log('Processing next build in queue...');
        setImmediate(() => this.performBuild(nextBuild));
      }
    }
  }
  
  /**
   * Create backup
   */
  async createBackup(backupName) {
    try {
      const backupPath = path.join(this.config.rollback.backupDir, backupName);
      this.log(`Creating backup: ${backupName}`);
      
      await fs.mkdir(backupPath, { recursive: true });
      
      // Copy critical files and directories
      const criticalPaths = [
        './src',
        './public',
        './package.json',
        './package-lock.json',
        './.env'
      ];
      
      for (const criticalPath of criticalPaths) {
        try {
          const stat = await fs.stat(criticalPath);
          const destPath = path.join(backupPath, criticalPath.replace('./', ''));
          
          if (stat.isDirectory()) {
            await this.copyDirectory(criticalPath, destPath);
          } else {
            await fs.mkdir(path.dirname(destPath), { recursive: true });
            await fs.copyFile(criticalPath, destPath);
          }
        } catch (err) {
          this.log(`Skipping ${criticalPath}: ${err.message}`, 'warning');
        }
      }
      
      // Save backup metadata
      const metadata = {
        name: backupName,
        createdAt: new Date().toISOString(),
        localSha: await this.getLocalCommitSha()
      };
      
      await fs.writeFile(
        path.join(backupPath, 'backup-metadata.json'),
        JSON.stringify(metadata, null, 2)
      );
      
      // Clean old backups
      await this.cleanOldBackups();
      
      this.log(`Backup created: ${backupName}`, 'success');
      
      return { success: true, backupPath, metadata };
      
    } catch (error) {
      this.log(`Failed to create backup: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Copy directory recursively
   */
  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
  
  /**
   * Clean old backups
   */
  async cleanOldBackups() {
    try {
      const backups = await fs.readdir(this.config.rollback.backupDir);
      
      if (backups.length > this.config.rollback.maxBackups) {
        // Sort by creation time (oldest first)
        const backupStats = await Promise.all(
          backups.map(async (backup) => {
            const backupPath = path.join(this.config.rollback.backupDir, backup);
            const stat = await fs.stat(backupPath);
            return { name: backup, created: stat.ctime };
          })
        );
        
        backupStats.sort((a, b) => a.created - b.created);
        
        // Remove oldest backups
        const toRemove = backupStats.slice(0, backups.length - this.config.rollback.maxBackups);
        
        for (const backup of toRemove) {
          const backupPath = path.join(this.config.rollback.backupDir, backup.name);
          await fs.rm(backupPath, { recursive: true });
          this.log(`Removed old backup: ${backup.name}`);
        }
      }
    } catch (error) {
      this.log(`Failed to clean old backups: ${error.message}`, 'warning');
    }
  }
  
  /**
   * Perform rollback
   */
  async performRollback(backupName) {
    try {
      const backupPath = path.join(this.config.rollback.backupDir, backupName);
      this.log(`Starting rollback to: ${backupName}`);
      
      // Check if backup exists
      const backupExists = await fs.access(backupPath)
        .then(() => true)
        .catch(() => false);
      
      if (!backupExists) {
        throw new Error(`Backup not found: ${backupName}`);
      }
      
      // Load backup metadata
      const metadataPath = path.join(backupPath, 'backup-metadata.json');
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      
      // Restore files
      const entries = await fs.readdir(backupPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name === 'backup-metadata.json') continue;
        
        const srcPath = path.join(backupPath, entry.name);
        const destPath = `./${entry.name}`;
        
        if (entry.isDirectory()) {
          await this.copyDirectory(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      }
      
      // Restore Git state if possible
      if (metadata.localSha) {
        try {
          await exec(`git reset --hard ${metadata.localSha}`);
          this.log(`Restored Git state to: ${metadata.localSha.substring(0, 7)}`);
        } catch (err) {
          this.log('Could not restore Git state', 'warning');
        }
      }
      
      const rollbackRecord = {
        backupName,
        restoredAt: new Date().toISOString(),
        metadata
      };
      
      this.rollbackHistory.push(rollbackRecord);
      await this.saveRollbackHistory();
      
      this.log(`Rollback to ${backupName} completed successfully`, 'success');
      
      return { success: true, backupName, metadata };
      
    } catch (error) {
      this.log(`Rollback failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Start update checker
   */
  startUpdateChecker() {
    this.log('Starting update checker...');
    
    this.updateCheckerInterval = setInterval(async () => {
      this.log('Running scheduled update check...');
      await this.checkForUpdates();
    }, this.config.update.checkInterval);
    
    this.log(`Update checker started (interval: ${this.config.update.checkInterval}ms)`);
  }
  
  /**
   * Stop update checker
   */
  stopUpdateChecker() {
    if (this.updateCheckerInterval) {
      clearInterval(this.updateCheckerInterval);
      this.log('Update checker stopped');
    }
  }
  
  /**
   * Start build processor
   */
  startBuildProcessor() {
    this.log('Build processor started');
  }
  
  /**
   * Start update processor
   */
  startUpdateProcessor() {
    this.log('Update processor started');
  }
  
  /**
   * Hot reload feature
   */
  async hotReload(modulePath) {
    try {
      this.log(`Hot reloading: ${modulePath}`);
      
      // Clear require cache
      const absolutePath = require.resolve(modulePath);
      delete require.cache[absolutePath];
      
      // Re-require module
      const module = require(modulePath);
      
      this.log(`Hot reload successful: ${modulePath}`, 'success');
      
      return { success: true, module };
      
    } catch (error) {
      this.log(`Hot reload failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Dynamically load feature
   */
  async loadFeature(featurePath, options = {}) {
    try {
      this.log(`Loading feature: ${featurePath}`);
      
      const absolutePath = path.resolve(featurePath);
      const featureModule = require(absolutePath);
      
      // Initialize feature if it's a class
      let feature = featureModule;
      if (typeof featureModule === 'function') {
        feature = new featureModule(options);
        
        // Call initialize if available
        if (typeof feature.initialize === 'function') {
          await feature.initialize();
        }
      }
      
      this.log(`Feature loaded: ${featurePath}`, 'success');
      
      return { success: true, feature };
      
    } catch (error) {
      this.log(`Failed to load feature: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get build status
   */
  getBuildStatus() {
    return {
      isBuilding: this.isBuilding,
      currentBuild: this.currentBuild,
      queueLength: this.buildQueue.length,
      lastBuild: this.buildHistory[this.buildHistory.length - 1] || null,
      totalBuilds: this.buildHistory.length
    };
  }
  
  /**
   * Get update status
   */
  getUpdateStatus() {
    return {
      isUpdating: this.isUpdating,
      currentUpdate: this.currentUpdate,
      queueLength: this.updateQueue.length,
      lastUpdate: this.updateHistory[this.updateHistory.length - 1] || null,
      totalUpdates: this.updateHistory.length
    };
  }
  
  /**
   * Get rollback status
   */
  getRollbackStatus() {
    return {
      enabled: this.config.rollback.enabled,
      maxBackups: this.config.rollback.maxBackups,
      lastRollback: this.rollbackHistory[this.rollbackHistory.length - 1] || null,
      totalRollbacks: this.rollbackHistory.length
    };
  }
  
  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      build: this.getBuildStatus(),
      update: this.getUpdateStatus(),
      rollback: this.getRollbackStatus(),
      config: {
        autoUpdate: this.config.update.autoUpdate,
        checkInterval: this.config.update.checkInterval,
        backupEnabled: this.config.rollback.enabled
      }
    };
  }
  
  /**
   * Shutdown gracefully
   */
  async shutdown() {
    this.log('Shutting down Self-Building System...');
    
    this.stopUpdateChecker();
    
    // Wait for current operations
    while (this.isBuilding || this.isUpdating) {
      this.log('Waiting for operations to complete...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await this.saveBuildHistory();
    await this.saveUpdateHistory();
    await this.saveRollbackHistory();
    
    this.log('Self-Building System shut down complete', 'success');
  }
}

module.exports = SelfBuildingSystem;