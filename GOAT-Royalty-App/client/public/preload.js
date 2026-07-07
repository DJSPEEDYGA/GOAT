const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  getAppName: () => ipcRenderer.invoke('app-name'),
  
  // Menu events
  onMenuNewArtist: (callback) => ipcRenderer.on('menu-new-artist', callback),
  onMenuImportData: (callback) => ipcRenderer.on('menu-import-data', callback),
  
  // File operations
  selectFile: () => ipcRenderer.invoke('dialog-open-file'),
  saveFile: (data, filename) => ipcRenderer.invoke('dialog-save-file', data, filename),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body)
});

// Remove all listeners when window is closed
window.addEventListener('beforeunload', () => {
  ipcRenderer.removeAllListeners('menu-new-artist');
  ipcRenderer.removeAllListeners('menu-import-data');
});