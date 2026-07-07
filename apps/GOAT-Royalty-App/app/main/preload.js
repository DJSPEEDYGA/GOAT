
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('goat', {
  navigate:     page  => ipcRenderer.invoke('navigate', page),
  launchApp:    p     => ipcRenderer.invoke('launch-app', p),
  pickFile:     opts  => ipcRenderer.invoke('pick-file', opts),
  pickFolder:   ()    => ipcRenderer.invoke('pick-folder'),
  saveFile:     opts  => ipcRenderer.invoke('save-file', opts),
  openExternal: url   => ipcRenderer.invoke('open-external', url),
  intelStatus:  ()    => ipcRenderer.invoke('intel-status'),
  readFile:     p     => ipcRenderer.invoke('read-file', p),
  platform:     ()    => ipcRenderer.invoke('platform'),
  version:      ()    => ipcRenderer.invoke('version'),
  minimize:     ()    => ipcRenderer.send('window-minimize'),
  maximize:     ()    => ipcRenderer.send('window-maximize'),
  close:        ()    => ipcRenderer.send('window-close'),
});
