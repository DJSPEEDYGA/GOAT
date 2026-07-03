/**
 * 🐐⚡ SUPER GOAT NINJA LAUNCHER
 * Main Electron Process
 * The unified hub for ALL GOAT Royalty tools
 */

const { app, BrowserWindow, ipcMain, shell, Menu, Tray, nativeImage, globalShortcut, dialog, Notification } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const https = require('https');
const http = require('http');

// ============================================================
// APP CONFIG
// ============================================================
const APP_CONFIG = {
  name: 'Super GOAT Ninja Launcher',
  version: '2.0.0',
  author: 'Harvey Miller (DJ Speedy)',
  server: 'http://93.127.214.171:3002',
  localPort: 3000,
  width: 1400,
  height: 900,
};

let mainWindow = null;
let tray = null;
let goatServerProcess = null;
let isQuitting = false;

// ============================================================
// MAIN WINDOW
// ============================================================
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: APP_CONFIG.width,
    height: APP_CONFIG.height,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'launcher.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  // Dev tools in dev mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

// ============================================================
// SYSTEM TRAY
// ============================================================
function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  const icon = fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
    : nativeImage.createEmpty();

  tray = new Tray(icon);
  tray.setToolTip('🐐 Super GOAT Ninja Launcher');

  const contextMenu = Menu.buildFromTemplate([
    { label: '🐐 Super GOAT Ninja Launcher', enabled: false },
    { type: 'separator' },
    { label: '🚀 Open Launcher', click: () => { mainWindow.show(); mainWindow.focus(); } },
    { label: '🌐 Open Web App', click: () => shell.openExternal(APP_CONFIG.server) },
    { label: '⚡ Command Center', click: () => shell.openExternal(`${APP_CONFIG.server}/super-goat-command`) },
    { type: 'separator' },
    { label: '🔄 Restart GOAT Server', click: () => restartGoatServer() },
    { label: '📊 Server Status', click: () => checkServerStatus() },
    { type: 'separator' },
    { label: '❌ Quit', click: () => { isQuitting = true; app.quit(); } },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => { mainWindow.show(); mainWindow.focus(); });
}

// ============================================================
// SERVER MANAGEMENT
// ============================================================
function checkServerStatus() {
  const url = new URL(APP_CONFIG.server);
  const client = url.protocol === 'https:' ? https : http;

  client.get(APP_CONFIG.server, (res) => {
    const status = res.statusCode === 200 ? 'online' : 'error';
    mainWindow?.webContents.send('server-status', { status, code: res.statusCode });
    if (status === 'online') {
      new Notification({ title: '🐐 GOAT Server', body: '✅ Server is online!' }).show();
    }
  }).on('error', () => {
    mainWindow?.webContents.send('server-status', { status: 'offline' });
  });
}

function restartGoatServer() {
  mainWindow?.webContents.send('server-status', { status: 'restarting' });
  // Signal to restart
  setTimeout(() => checkServerStatus(), 3000);
}

// ============================================================
// IPC HANDLERS
// ============================================================

// Window controls
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('window-close', () => mainWindow?.hide());
ipcMain.on('window-quit', () => { isQuitting = true; app.quit(); });

// Open external URLs
ipcMain.on('open-external', (_, url) => shell.openExternal(url));

// Open tool in new window
ipcMain.on('open-tool-window', (_, { url, title, width = 1200, height = 800 }) => {
  const toolWindow = new BrowserWindow({
    width, height,
    title,
    backgroundColor: '#0a0a0f',
    webPreferences: { nodeIntegration: false, contextIsolation: true, webSecurity: false },
    parent: mainWindow,
  });
  toolWindow.loadURL(url);
  toolWindow.setMenu(null);
});

// Server status check
ipcMain.handle('check-server', async () => {
  return new Promise((resolve) => {
    const url = new URL(APP_CONFIG.server);
    const client = url.protocol === 'https:' ? https : http;
    const req = client.get(APP_CONFIG.server, (res) => {
      resolve({ status: res.statusCode === 200 ? 'online' : 'error', code: res.statusCode });
    });
    req.on('error', () => resolve({ status: 'offline' }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ status: 'timeout' }); });
  });
});

// Get app config
ipcMain.handle('get-config', () => APP_CONFIG);

// File dialog
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'Audio', extensions: ['mp3', 'wav', 'flac', 'aac', 'm4a'] },
      { name: 'CSV', extensions: ['csv'] },
      { name: 'JSON', extensions: ['json'] },
    ]
  });
  return result.filePaths;
});

// Save file dialog
ipcMain.handle('save-file-dialog', async (_, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || 'export.csv',
    filters: [{ name: 'All Files', extensions: ['*'] }]
  });
  return result.filePath;
});

// Notification
ipcMain.on('show-notification', (_, { title, body }) => {
  new Notification({ title, body }).show();
});

// ============================================================
// APP LIFECYCLE
// ============================================================
app.whenReady().then(() => {
  createMainWindow();
  createTray();

  // Global shortcut: Ctrl+Shift+G to show/hide
  globalShortcut.register('CommandOrControl+Shift+G', () => {
    if (mainWindow?.isVisible()) mainWindow.hide();
    else { mainWindow?.show(); mainWindow?.focus(); }
  });

  // Check server on startup
  setTimeout(checkServerStatus, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    else { mainWindow?.show(); mainWindow?.focus(); }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => { isQuitting = true; });

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (goatServerProcess) goatServerProcess.kill();
});