/**
 * Main Entry Point for Self-Contained GOAT Royalty App
 * 
 * This is the main entry point for the Electron-based self-contained application.
 * It initializes all systems including:
 * - Self-Healing System
 * - Self-Building System
 * - Built-in Development Tools
 * - Google Drive Pipeline
 * - Offline Data Service
 * - AI Assistant Hub
 * 
 * @module MainEntryPoint
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

// Import core systems
const SelfHealingSystem = require('./self-healing');
const SelfBuildingSystem = require('./self-building');
const BuiltInTools = require('./builtin-tools');

class GOATRoyaltyApp {
  constructor() {
    this.window = null;
    this.selfHealingSystem = null;
    this.selfBuildingSystem = null;
    this.builtInTools = null;
    this.isReady = false;
    
    // Application paths
    this.paths = {
      root: app.getAppPath(),
      userData: app.getPath('userData'),
      logs: path.join(app.getPath('userData'), 'logs'),
      data: path.join(app.getPath('userData'), 'data'),
      backups: path.join(app.getPath('userData'), 'backups'),
      cache: path.join(app.getPath('userData'), 'cache')
    };
  }
  
  /**
   * Initialize the application
   */
  async initialize() {
    console.log('🐐 Initializing GOAT Royalty App...');
    
    try {
      // Ensure directories exist
      await this.ensureDirectories();
      
      // Initialize self-healing system
      console.log('🔧 Initializing Self-Healing System...');
      this.selfHealingSystem = new SelfHealingSystem({
        logFile: path.join(this.paths.logs, 'self-healing.log'),
        enableConsole: true
      });
      
      // Initialize self-building system
      console.log('🏗️  Initializing Self-Building System...');
      this.selfBuildingSystem = new SelfBuildingSystem({
        github: {
          owner: 'DJSPEEDYGA',
          repo: 'GOAT-Royalty-App',
          branch: 'main',
          token: process.env.GITHUB_TOKEN
        },
        update: {
          autoUpdate: true,
          checkInterval: 3600000, // 1 hour
          backupBeforeUpdate: true
        },
        rollback: {
          enabled: true,
          maxBackups: 5,
          backupDir: this.paths.backups
        },
        logFile: path.join(this.paths.logs, 'self-building.log'),
        enableConsole: true
      });
      
      // Initialize built-in tools
      console.log('🛠️  Initializing Built-in Development Tools...');
      this.builtInTools = new BuiltInTools();
      
      // Register IPC handlers
      this.registerIPCHandlers();
      
      this.isReady = true;
      console.log('✅ GOAT Royalty App initialized successfully!');
      
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      throw error;
    }
  }
  
  /**
   * Ensure all required directories exist
   */
  async ensureDirectories() {
    const dirs = Object.values(this.paths);
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }
  
  /**
   * Create the main application window
   */
  async createWindow() {
    console.log('🪟 Creating main window...');
    
    this.window = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      },
      title: '🐐 GOAT Royalty App',
      icon: path.join(__dirname, '../../assets/icon.png')
    });
    
    // Load the application
    const indexPath = path.join(__dirname, '../../dist/index.html');
    
    // Check if built version exists
    try {
      await fs.access(indexPath);
      this.window.loadFile(indexPath);
    } catch (error) {
      // Fall back to development server
      console.log('Built version not found, loading from development server...');
      this.window.loadURL('http://localhost:3000');
    }
    
    // Open DevTools in development mode
    if (process.env.NODE_ENV === 'development') {
      this.window.webContents.openDevTools();
    }
    
    // Handle window closed
    this.window.on('closed', () => {
      this.window = null;
    });
    
    console.log('✅ Main window created successfully!');
  }
  
  /**
   * Register IPC handlers for communication with renderer process
   */
  registerIPCHandlers() {
    console.log('📡 Registering IPC handlers...');
    
    // System status handlers
    ipcMain.handle('get-system-status', async () => {
      return {
        healing: this.selfHealingSystem?.getSystemStatus(),
        building: this.selfBuildingSystem?.getSystemStatus(),
        tools: {
          codeEditor: true,
          terminal: true,
          gitClient: true,
          fileExplorer: true,
          processManager: true,
          systemMonitor: true
        },
        paths: this.paths,
        isReady: this.isReady
      };
    });
    
    // Self-healing handlers
    ipcMain.handle('check-health', async () => {
      if (!this.selfHealingSystem) {
        return { success: false, error: 'Self-healing system not initialized' };
      }
      return await this.selfHealingSystem.checkSystemHealth();
    });
    
    ipcMain.handle('get-health-history', async () => {
      if (!this.selfHealingSystem) {
        return { success: false, error: 'Self-healing system not initialized' };
      }
      return { success: true, history: this.selfHealingSystem.getHealthHistory() };
    });
    
    // Self-building handlers
    ipcMain.handle('check-updates', async () => {
      if (!this.selfBuildingSystem) {
        return { success: false, error: 'Self-building system not initialized' };
      }
      return await this.selfBuildingSystem.checkForUpdates();
    });
    
    ipcMain.handle('perform-update', async (event, updateInfo) => {
      if (!this.selfBuildingSystem) {
        return { success: false, error: 'Self-building system not initialized' };
      }
      return await this.selfBuildingSystem.performUpdate(updateInfo);
    });
    
    ipcMain.handle('perform-build', async (event, options) => {
      if (!this.selfBuildingSystem) {
        return { success: false, error: 'Self-building system not initialized' };
      }
      return await this.selfBuildingSystem.performBuild(options);
    });
    
    ipcMain.handle('get-build-history', async () => {
      if (!this.selfBuildingSystem) {
        return { success: false, error: 'Self-building system not initialized' };
      }
      return { success: true, history: this.selfBuildingSystem.buildHistory };
    });
    
    ipcMain.handle('get-update-history', async () => {
      if (!this.selfBuildingSystem) {
        return { success: false, error: 'Self-building system not initialized' };
      }
      return { success: true, history: this.selfBuildingSystem.updateHistory };
    });
    
    ipcMain.handle('perform-rollback', async (event, backupName) => {
      if (!this.selfBuildingSystem) {
        return { success: false, error: 'Self-building system not initialized' };
      }
      return await this.selfBuildingSystem.performRollback(backupName);
    });
    
    ipcMain.handle('hot-reload', async (event, modulePath) => {
      if (!this.selfBuildingSystem) {
        return { success: false, error: 'Self-building system not initialized' };
      }
      return await this.selfBuildingSystem.hotReload(modulePath);
    });
    
    // File system handlers
    ipcMain.handle('select-file', async () => {
      const result = await dialog.showOpenDialog(this.window, {
        properties: ['openFile', 'openDirectory']
      });
      return result;
    });
    
    ipcMain.handle('save-file', async (event, defaultPath, content) => {
      const result = await dialog.showSaveDialog(this.window, {
        defaultPath: defaultPath
      });
      
      if (result.canceled) {
        return { success: false, canceled: true };
      }
      
      await fs.writeFile(result.filePath, content);
      return { success: true, filePath: result.filePath };
    });
    
    console.log('✅ IPC handlers registered successfully!');
  }
  
  /**
   * Start the application
   */
  async start() {
    console.log('🚀 Starting GOAT Royalty App...');
    
    // Wait for app to be ready
    await app.whenReady();
    
    // Initialize systems
    await this.initialize();
    
    // Create window
    await this.createWindow();
    
    // Handle app activation
    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.createWindow();
      }
    });
    
    // Handle app quit
    app.on('before-quit', async () => {
      console.log('🛑 Shutting down GOAT Royalty App...');
      
      // Shutdown systems
      if (this.selfHealingSystem) {
        await this.selfHealingSystem.shutdown();
      }
      
      if (this.selfBuildingSystem) {
        await this.selfBuildingSystem.shutdown();
      }
      
      console.log('✅ GOAT Royalty App shut down successfully!');
    });
    
    // Handle all windows closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
    
    console.log('✅ GOAT Royalty App started successfully!');
  }
}

// Create and start the application
const goatRoyaltyApp = new GOATRoyaltyApp();
goatRoyaltyApp.start().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

module.exports = GOATRoyaltyApp;