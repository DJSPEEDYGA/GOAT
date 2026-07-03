/**
 * Super GOAT Ninja Launcher - Preload Script
 * Secure IPC bridge between renderer and main process
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('goatLauncher', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  quit: () => ipcRenderer.send('window-quit'),

  // External links
  openExternal: (url) => ipcRenderer.send('open-external', url),
  openToolWindow: (opts) => ipcRenderer.send('open-tool-window', opts),

  // Server management
  checkServer: () => ipcRenderer.invoke('check-server'),
  getConfig: () => ipcRenderer.invoke('get-config'),

  // File operations
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (name) => ipcRenderer.invoke('save-file-dialog', name),

  // Notifications
  notify: (title, body) => ipcRenderer.send('show-notification', { title, body }),

  // Event listeners
  on: (channel, callback) => {
    const validChannels = ['server-status', 'tool-update', 'notification'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, data) => callback(data));
    }
  },
  off: (channel) => ipcRenderer.removeAllListeners(channel),
});