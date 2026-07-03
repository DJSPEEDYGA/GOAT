const { app, BrowserWindow, ipcMain, dialog, Menu, Tray, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

// Initialize persistent storage
const store = new Store({
  name: 'goat-royalty-data',
  defaults: {
    settings: {
      theme: 'dark',
      autoUpdate: true,
      notifications: true,
      aiProvider: 'auto',
      blockchain: {
        enabled: true,
        network: 'ethereum',
        rpcUrl: ''
      }
    },
    royaltyData: [],
    artists: [],
    works: [],
    transactions: [],
    aiAgents: {
      enabled: true,
      autonomous: true,
      memoryLimit: 1000
    }
  }
});

let mainWindow;
let tray = null;

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0a',
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: true
    },
    show: false
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create system tray
  createTray();
  
  // Create application menu
  createMenu();
}

// System tray for background operations
function createTray() {
  const iconPath = path.join(__dirname, 'assets/icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show GOAT App', click: () => mainWindow?.show() },
    { label: 'AI Agent Status', enabled: false },
    { type: 'separator' },
    { label: 'Mining Status: Active', enabled: false },
    { label: 'Royalty Tracking: Active', enabled: false },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
  
  tray.setToolTip('GOAT Royalty App');
  tray.setContextMenu(contextMenu);
}

// Application menu
function createMenu() {
  const template = [
    {
      label: 'GOAT',
      submenu: [
        { label: 'About GOAT Royalty App', click: showAbout },
        { type: 'separator' },
        { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: showSettings },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'AI Agents',
      submenu: [
        { label: 'Orchestrator Dashboard', click: () => navigateTo('ai-orchestrator') },
        { label: 'Worker Agents', click: () => navigateTo('ai-workers') },
        { label: 'Agent Memory', click: () => navigateTo('ai-memory') },
        { type: 'separator' },
        { label: 'Start Autonomous Mode', click: startAutonomousMode }
      ]
    },
    {
      label: 'Royalty',
      submenu: [
        { label: 'Dashboard', click: () => navigateTo('royalty-dashboard') },
        { label: 'Artists', click: () => navigateTo('artists') },
        { label: 'Works Catalog', click: () => navigateTo('works') },
        { label: 'Transactions', click: () => navigateTo('transactions') }
      ]
    },
    {
      label: 'Blockchain',
      submenu: [
        { label: 'Wallet', click: () => navigateTo('wallet') },
        { label: 'Smart Contracts', click: () => navigateTo('contracts') },
        { label: 'Mining', click: () => navigateTo('mining') },
        { label: 'Verification', click: () => navigateTo('verification') }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        { label: 'DSP Distribution', click: () => navigateTo('dsp') },
        { label: 'Video Editor', click: () => navigateTo('video-editor') },
        { label: 'Audio Studio', click: () => navigateTo('audio-studio') },
        { label: 'Report Generator', click: () => navigateTo('reports') }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function showAbout() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'About GOAT Royalty App',
    message: 'GOAT Royalty App v3.0.0',
    detail: 'The Greatest of All Time Royalty Management Platform\n\nBuilt by DJ Speedy\n\nPowered by Advanced AI Agents\n• Hierarchical Orchestrator\n• Multi-Agent Collaboration\n• Agentic RAG\n• 215+ LLM Support'
  });
}

function showSettings() {
  mainWindow.webContents.send('navigate', 'settings');
}

function navigateTo(section) {
  mainWindow.webContents.send('navigate', section);
}

function startAutonomousMode() {
  mainWindow.webContents.send('ai-command', { action: 'startAutonomous' });
}

// IPC Handlers for AI Agent System
ipcMain.handle('ai:invoke', async (event, { agent, task, params }) => {
  // Route to appropriate AI agent
  const agentRouter = require('./backend/agents/router');
  return await agentRouter.invokeAgent(agent, task, params);
});

ipcMain.handle('ai:orchestrate', async (event, { goal, context }) => {
  const orchestrator = require('./backend/agents/orchestrator');
  return await orchestrator.executeGoal(goal, context);
});

ipcMain.handle('ai:chat', async (event, { messages, model }) => {
  const llmRouter = require('./backend/llm/router');
  return await llmRouter.chat(messages, model);
});

// IPC Handlers for Royalty Management
ipcMain.handle('royalty:getData', async () => {
  return store.get('royaltyData');
});

ipcMain.handle('royalty:saveData', async (event, data) => {
  store.set('royaltyData', data);
  return { success: true };
});

ipcMain.handle('royalty:calculate', async (event, params) => {
  const royaltyEngine = require('./backend/royalty/engine');
  return await royaltyEngine.calculate(params);
});

// IPC Handlers for Blockchain
ipcMain.handle('blockchain:getBalance', async (event, address) => {
  const blockchain = require('./backend/blockchain/provider');
  return await blockchain.getBalance(address);
});

ipcMain.handle('blockchain:verifyRoyalty', async (event, data) => {
  const blockchain = require('./backend/blockchain/verification');
  return await blockchain.verifyRoyalty(data);
});

ipcMain.handle('blockchain:mining:start', async (event, config) => {
  const mining = require('./backend/blockchain/mining');
  return await mining.start(config);
});

ipcMain.handle('blockchain:mining:status', async () => {
  const mining = require('./backend/blockchain/mining');
  return mining.getStatus();
});

// IPC Handlers for Settings
ipcMain.handle('settings:get', async () => {
  return store.get('settings');
});

ipcMain.handle('settings:save', async (event, settings) => {
  store.set('settings', settings);
  return { success: true };
});

// IPC Handlers for File Operations
ipcMain.handle('file:open', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'CSV', extensions: ['csv'] },
      { name: 'JSON', extensions: ['json'] },
      { name: 'Excel', extensions: ['xlsx', 'xls'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const content = fs.readFileSync(result.filePaths[0], 'utf-8');
    return { path: result.filePaths[0], content };
  }
  return null;
});

ipcMain.handle('file:save', async (event, { content, defaultPath }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [
      { name: 'JSON', extensions: ['json'] },
      { name: 'CSV', extensions: ['csv'] },
      { name: 'PDF', extensions: ['pdf'] }
    ]
  });
  
  if (!result.canceled) {
    fs.writeFileSync(result.filePath, content);
    return { success: true, path: result.filePath };
  }
  return { success: false };
});

// Window controls
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window:close', () => mainWindow?.close());

// App lifecycle events
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Prevent navigation to external URLs
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
});