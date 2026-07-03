/**
 * GOAT Royalty App - Preload Script
 * Secure bridge between main and renderer processes
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('goatAPI', {
  // App Information
  getVersion: () => ipcRenderer.invoke('get-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Window Controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  fullscreenToggle: () => ipcRenderer.send('window-fullscreen'),
  
  // Theme Management
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
  onThemeChange: (callback) => {
    ipcRenderer.on('theme-changed', (event, theme) => callback(theme));
  },
  
  // Storage Operations
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key),
    clear: () => ipcRenderer.invoke('store-clear'),
    getAll: () => ipcRenderer.invoke('store-get-all')
  },
  
  // File Operations
  openFile: (options) => ipcRenderer.invoke('dialog-open-file', options),
  saveFile: (options) => ipcRenderer.invoke('dialog-save-file', options),
  readFile: (filePath) => ipcRenderer.invoke('file-read', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('file-write', filePath, content),
  
  // External Links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.send('show-notification', { title, body }),
  
  // Auto-Updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (event, info) => callback(info));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', () => callback());
  },
  onUpdateProgress: (callback) => {
    ipcRenderer.on('update-progress', (event, progress) => callback(progress));
  },
  
  // Clipboard
  clipboardWrite: (text) => ipcRenderer.send('clipboard-write', text),
  clipboardRead: () => ipcRenderer.invoke('clipboard-read'),
  
  // Shell Operations
  openPath: (path) => ipcRenderer.invoke('shell-open-path', path),
  
  // GOAT-specific API calls
  api: {
    fetch: async (endpoint, options = {}) => {
      return ipcRenderer.invoke('api-fetch', { endpoint, options });
    }
  }
});

// Log when preload script is loaded
console.log('GOAT Royalty preload script loaded successfully');