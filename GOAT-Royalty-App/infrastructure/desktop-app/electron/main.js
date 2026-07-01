/**
 * GOAT Royalty App - Main Electron Process
 * Complete desktop application with cross-platform support
 * Supports: Windows (32/64-bit), macOS (Intel/ARM/Universal), Linux, Portable
 */

const { app, BrowserWindow, Menu, Tray, shell, ipcMain, nativeTheme, dialog, Notification, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');

// Initialize persistent storage
const store = new Store({
  defaults: {
    windowBounds: { width: 1400, height: 900 },
    theme: 'dark',
    autoLaunch: false,
    minimizeToTray: true,
    recentFiles: [],
    userPreferences: {
      notifications: true,
      autoUpdate: true,
      analyticsEnabled: true
    }
  }
});

let mainWindow;
let tray = null;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// GOAT Royalty App Configuration
const APP_CONFIG = {
  name: 'GOAT Royalty',
  version: app.getVersion(),
  baseUrl: isDev ? 'http://localhost:8080' : `file://${path.join(__dirname, '../../web-app/index.html')}`,
  minWidth: 1024,
  minHeight: 700,
  defaultWidth: 1400,
  defaultHeight: 900
};

// All GOAT Tools for Menu
const GOAT_TOOLS = [
  { name: 'Fashion Hub', url: 'goat-fashion-hub.html', icon: '👗' },
  { name: '3D Studio', url: 'goat-3d-studio.html', icon: '🎬' },
  { name: 'Celebrity Lounge', url: 'goat-celebrity-lounge.html', icon: '⭐' },
  { name: 'Entertainment', url: 'goat-entertainment.html', icon: '🎭' },
  { name: 'NFT Studio', url: 'goat-nft-studio.html', icon: '🖼️' },
  { name: 'Fitness Pro', url: 'goat-fitness.html', icon: '💪' },
  { name: 'Health Dashboard', url: 'goat-health.html', icon: '❤️' },
  { name: 'Properties', url: 'goat-properties.html', icon: '🏠' },
  { name: 'Studio Locator', url: 'goat-studio-locator.html', icon: '📍' },
  { name: 'Video Editor', url: 'goat-video-enhanced.html', icon: '🎥' },
  { name: '3D Effects', url: 'goat-3d-effects.html', icon: '✨' },
  { name: 'AI Video', url: 'goat-ai-video.html', icon: '🤖' },
  { name: 'Social Scheduler', url: 'goat-social-scheduler.html', icon: '📱' },
  { name: 'Brand Deals', url: 'goat-brand-deals.html', icon: '💼' },
  { name: 'Tour Manager', url: 'goat-tour-manager.html', icon: '🎤' },
  { name: 'Analytics', url: 'goat-analytics.html', icon: '📊' },
  { name: 'Merch Store', url: 'goat-merch-store.html', icon: '🛒' }
];

// Create main application window
function createWindow() {
  const { width, height } = store.get('windowBounds');
  
  mainWindow = new BrowserWindow({
    width: width || APP_CONFIG.defaultWidth,
    height: height || APP_CONFIG.defaultHeight,
    minWidth: APP_CONFIG.minWidth,
    minHeight: APP_CONFIG.minHeight,
    backgroundColor: '#040608',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    frame: process.platform === 'darwin' ? true : false
  });

  // Load the app
  mainWindow.loadURL(APP_CONFIG.baseUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Save window bounds on resize/move
  mainWindow.on('resize', () => store.set('windowBounds', mainWindow.getBounds()));
  mainWindow.on('move', () => store.set('windowBounds', mainWindow.getBounds()));

  // Handle close - minimize to tray if enabled
  mainWindow.on('close', (event) => {
    if (store.get('minimizeToTray') && !app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Set up menu
  createMenu();
}

// Create application menu
function createMenu() {
  const template = [
    // App Menu (macOS)
    ...(process.platform === 'darwin' ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { label: 'Preferences...', accelerator: 'Cmd+,', click: () => mainWindow.webContents.send('open-preferences') },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    
    // File Menu
    {
      label: 'File',
      submenu: [
        { label: 'New Window', accelerator: 'CmdOrCtrl+N', click: () => createWindow() },
        { type: 'separator' },
        { label: 'Open Project...', accelerator: 'CmdOrCtrl+O', click: () => openProject() },
        { label: 'Save Project', accelerator: 'CmdOrCtrl+S', click: () => mainWindow.webContents.send('save-project') },
        { type: 'separator' },
        { role: 'close' }
      ]
    },
    
    // Edit Menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    
    // View Menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    
    // Tools Menu
    {
      label: 'Tools',
      submenu: GOAT_TOOLS.map(tool => ({
        label: `${tool.icon} ${tool.name}`,
        click: () => navigateToTool(tool.url)
      }))
    },
    
    // Window Menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    
    // Help Menu
    {
      role: 'help',
      submenu: [
        { label: 'Learn More', click: async () => await shell.openExternal('https://goatroyalty.app') },
        { label: 'Documentation', click: async () => await shell.openExternal('https://docs.goatroyalty.app') },
        { label: 'Release Notes', click: async () => await shell.openExternal('https://goatroyalty.app/releases') },
        { type: 'separator' },
        { label: 'Check for Updates...', click: () => checkForUpdates() },
        { type: 'separator' },
        { role: 'about' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Create system tray icon
function createTray() {
  const iconPath = path.join(__dirname, '../build/tray-icon.png');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open GOAT Royalty', click: () => { mainWindow.show(); } },
    { type: 'separator' },
    ...GOAT_TOOLS.slice(0, 8).map(tool => ({
      label: `${tool.icon} ${tool.name}`,
      click: () => {
        mainWindow.show();
        navigateToTool(tool.url);
      }
    })),
    { type: 'separator' },
    { label: 'Check for Updates', click: () => checkForUpdates() },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } }
  ]);
  
  tray.setToolTip('GOAT Royalty App');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// Navigate to a specific tool
function navigateToTool(url) {
  if (mainWindow) {
    const fullUrl = isDev 
      ? `http://localhost:8080/${url}`
      : `file://${path.join(__dirname, '../../web-app', url)}`;
    mainWindow.loadURL(fullUrl);
  }
}

// Open project dialog
async function openProject() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'GOAT Project', extensions: ['goat', 'json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    mainWindow.webContents.send('project-opened', result.filePaths[0]);
  }
}

// Check for updates
function checkForUpdates() {
  if (isDev) {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Updates',
      message: 'Updates are not available in development mode.'
    });
    return;
  }
  
  autoUpdater.checkForUpdatesAndNotify();
}

// Set up IPC handlers
function setupIPC() {
  // App information
  ipcMain.handle('get-version', () => app.getVersion());
  ipcMain.handle('get-platform', () => process.platform);
  ipcMain.handle('get-app-path', () => app.getAppPath());
  
  // Window controls
  ipcMain.on('window-minimize', () => mainWindow?.minimize());
  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on('window-close', () => mainWindow?.close());
  ipcMain.on('window-fullscreen', () => {
    mainWindow?.setFullScreen(!mainWindow.isFullScreen());
  });
  
  // Theme management
  ipcMain.handle('get-theme', () => store.get('theme'));
  ipcMain.handle('set-theme', (event, theme) => {
    store.set('theme', theme);
    nativeTheme.themeSource = theme;
    mainWindow?.webContents.send('theme-changed', theme);
    return true;
  });
  
  // Storage operations
  ipcMain.handle('store-get', (event, key) => store.get(key));
  ipcMain.handle('store-set', (event, key, value) => {
    store.set(key, value);
    return true;
  });
  ipcMain.handle('store-delete', (event, key) => {
    store.delete(key);
    return true;
  });
  ipcMain.handle('store-clear', () => {
    store.clear();
    return true;
  });
  ipcMain.handle('store-get-all', () => store.store);
  
  // File operations
  ipcMain.handle('dialog-open-file', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
  });
  
  ipcMain.handle('dialog-save-file', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
  });
  
  ipcMain.handle('file-read', async (event, filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('file-write', async (event, filePath, content) => {
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // External links
  ipcMain.handle('open-external', async (event, url) => {
    await shell.openExternal(url);
    return true;
  });
  
  // Notifications
  ipcMain.on('show-notification', (event, { title, body }) => {
    new Notification({ title, body, icon: path.join(__dirname, '../build/icon.png') }).show();
  });
  
  // Auto-updater
  ipcMain.handle('check-for-updates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { available: true, version: result.updateInfo.version };
    } catch (error) {
      return { available: false, error: error.message };
    }
  });
  
  ipcMain.handle('download-update', async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall();
    return true;
  });
  
  // Clipboard
  ipcMain.on('clipboard-write', (event, text) => clipboard.writeText(text));
  ipcMain.handle('clipboard-read', () => clipboard.readText());
  
  // Shell
  ipcMain.handle('shell-open-path', async (event, path) => {
    await shell.openPath(path);
    return true;
  });
  
  // API fetch (for backend integration)
  ipcMain.handle('api-fetch', async (event, { endpoint, options }) => {
    try {
      const response = await fetch(endpoint, options);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

// Auto-updater events
autoUpdater.on('update-available', (info) => {
  mainWindow?.webContents.send('update-available', info);
  new Notification({
    title: 'Update Available',
    body: `Version ${info.version} is available for download.`,
    icon: path.join(__dirname, '../build/icon.png')
  }).show();
});

autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update-downloaded');
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Ready',
    message: 'A new version has been downloaded. Restart the application to apply the update.',
    buttons: ['Restart', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('download-progress', (progress) => {
  mainWindow?.webContents.send('update-progress', progress);
});

autoUpdater.on('error', (error) => {
  console.error('Auto-updater error:', error);
});

// App lifecycle events
app.whenReady().then(() => {
  setupIPC();
  createWindow();
  createTray();
  
  // macOS: recreate window when dock icon clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up before quit
app.on('before-quit', () => {
  app.isQuitting = true;
  if (tray) tray.destroy();
});

// Security: Prevent navigation to unknown URLs
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'file://' && parsedUrl.origin !== 'http://localhost:8080') {
      event.preventDefault();
    }
  });
});

console.log('GOAT Royalty App - Electron Main Process Loaded');
console.log(`Platform: ${process.platform}`);
console.log(`Development Mode: ${isDev}`);