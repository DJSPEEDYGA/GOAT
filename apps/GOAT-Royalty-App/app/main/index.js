/**
 * GOAT Royalty App — Electron Main Process
 * Cross-platform: macOS (.dmg), Windows (.exe), Linux (.AppImage/.deb)
 */

const { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeTheme } = require('electron');
const path   = require('path');
const fs     = require('fs');
const http   = require('http');
const { exec, spawn } = require('child_process');

// ─── PATHS ───────────────────────────────────────────────────────────────────
const ROOT     = path.join(__dirname, '..', '..');
const WEB_APP  = path.join(ROOT, 'web-app');
const INTEL    = path.join(ROOT, 'goat-intel-server', 'goat_intel.py');
const ICON_MAC = path.join(ROOT, 'assets', 'icon.icns');
const ICON_WIN = path.join(ROOT, 'assets', 'icon.ico');
const ICON_PNG = path.join(ROOT, 'assets', 'icon.png');

function getIcon() {
  if (process.platform === 'darwin') return fs.existsSync(ICON_MAC) ? ICON_MAC : ICON_PNG;
  if (process.platform === 'win32')  return fs.existsSync(ICON_WIN) ? ICON_WIN : ICON_PNG;
  return ICON_PNG;
}

// ─── STATE ───────────────────────────────────────────────────────────────────
let mainWindow   = null;
let tray         = null;
let intelProcess = null;
let intelPort    = 5500;

// ─── INTEL SERVER ────────────────────────────────────────────────────────────
function startIntelServer() {
  if (!fs.existsSync(INTEL)) {
    console.log('[GOAT] Intel server not found at', INTEL);
    return;
  }

  const python = process.platform === 'win32' ? 'python' : 'python3';
  intelProcess = spawn(python, [INTEL], {
    cwd: path.dirname(INTEL),
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });

  intelProcess.stdout.on('data', d => console.log('[Intel]', d.toString().trim()));
  intelProcess.stderr.on('data', d => console.log('[Intel ERR]', d.toString().trim()));
  intelProcess.on('exit', code => console.log('[Intel] exited with code', code));
  console.log('[GOAT] Intel server started (PID', intelProcess.pid, ')');
}

function stopIntelServer() {
  if (intelProcess) {
    intelProcess.kill();
    intelProcess = null;
  }
}

function checkIntel(cb) {
  http.get(`http://127.0.0.1:${intelPort}/status`, res => {
    cb(res.statusCode === 200);
  }).on('error', () => cb(false));
}

// ─── MENU ─────────────────────────────────────────────────────────────────────
function buildMenu() {
  const template = [
    {
      label: 'GOAT',
      submenu: [
        { label: 'Production Hub',   click: () => navigate('goat-production-hub.html') },
        { label: 'Beat Maker',       click: () => navigate('beat-maker.html') },
        { label: 'AI Beats',         click: () => navigate('goat-ai-beats.html') },
        { label: 'Synth',            click: () => navigate('goat-synth.html') },
        { label: 'EQ + Compressor',  click: () => navigate('goat-eq-comp.html') },
        { label: 'FX Rack',          click: () => navigate('goat-fx-rack.html') },
        { label: 'Auto-Tune',        click: () => navigate('goat-autotune.html') },
        { label: 'Stem Splitter',    click: () => navigate('goat-stem-splitter.html') },
        { label: 'Spectrum',         click: () => navigate('goat-spectrum.html') },
        { label: 'Sample Slicer',    click: () => navigate('goat-slicer.html') },
        { type: 'separator' },
        { label: 'AI Command Center', click: () => navigate('goat-ai-command.html') },
        { label: 'Dr. Devin',        click: () => navigate('dr-devin.html') },
        { type: 'separator' },
        { label: 'Reload',           role: 'reload' },
        { label: 'Quit GOAT',        role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Full Screen',      role: 'togglefullscreen' },
        { label: 'Zoom In',          role: 'zoomin' },
        { label: 'Zoom Out',         role: 'zoomout' },
        { label: 'Reset Zoom',       role: 'resetzoom' },
        { type: 'separator' },
        { label: 'Developer Tools',  role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template[0].submenu.unshift(
      { label: 'About GOAT Royalty App', role: 'about' },
      { type: 'separator' }
    );
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function navigate(page) {
  if (mainWindow) {
    mainWindow.loadFile(path.join(WEB_APP, page));
  }
}

// ─── WINDOW ───────────────────────────────────────────────────────────────────
function createWindow() {
  nativeTheme.themeSource = 'dark';

  mainWindow = new BrowserWindow({
    width:  1440,
    height: 900,
    minWidth:  1100,
    minHeight: 700,
    icon: getIcon(),
    title: 'GOAT Royalty App',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#060608',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,          // allow local file:// resources
      allowRunningInsecureContent: true
    }
  });

  // Load Production Hub as home screen
  const home = path.join(WEB_APP, 'goat-production-hub.html');
  if (fs.existsSync(home)) {
    mainWindow.loadFile(home);
  } else {
    // fallback to web-app index
    const idx = path.join(WEB_APP, 'index.html');
    mainWindow.loadFile(fs.existsSync(idx) ? idx : path.join(ROOT, 'index.html'));
  }

  // Show when ready to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  buildMenu();
}

// ─── TRAY ─────────────────────────────────────────────────────────────────────
function createTray() {
  const iconPath = fs.existsSync(ICON_PNG) ? ICON_PNG : null;
  if (!iconPath) return;

  tray = new Tray(iconPath);
  tray.setToolTip('GOAT Royalty App');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open GOAT',   click: () => { if (mainWindow) mainWindow.show(); else createWindow(); } },
    { label: 'Beat Maker',  click: () => navigate('beat-maker.html') },
    { label: 'AI Beats',    click: () => navigate('goat-ai-beats.html') },
    { type: 'separator' },
    { label: 'Quit',        click: () => app.quit() }
  ]));
  tray.on('double-click', () => { if (mainWindow) mainWindow.show(); });
}

// ─── IPC HANDLERS ─────────────────────────────────────────────────────────────
function registerIPC() {
  // Navigate to a page
  ipcMain.handle('navigate', (_, page) => navigate(page));

  // Launch a native app by path
  ipcMain.handle('launch-app', (_, appPath) => {
    return new Promise(resolve => {
      const cmd = process.platform === 'win32'
        ? `start "" "${appPath}"`
        : process.platform === 'darwin'
          ? `open "${appPath}"`
          : `xdg-open "${appPath}"`;
      exec(cmd, err => resolve({ ok: !err, error: err?.message }));
    });
  });

  // Open file/folder picker
  ipcMain.handle('pick-file', async (_, opts) => {
    return dialog.showOpenDialog(mainWindow, opts || { properties: ['openFile'] });
  });

  ipcMain.handle('pick-folder', async () => {
    return dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  });

  // Save file dialog
  ipcMain.handle('save-file', async (_, { defaultPath, content }) => {
    const result = await dialog.showSaveDialog(mainWindow, { defaultPath });
    if (result.canceled) return { ok: false };
    fs.writeFileSync(result.filePath, content);
    return { ok: true, filePath: result.filePath };
  });

  // Open in system browser
  ipcMain.handle('open-external', (_, url) => shell.openExternal(url));

  // Intel server status
  ipcMain.handle('intel-status', () => new Promise(r => checkIntel(ok => r({ ok }))));

  // Read file from disk (for audio loading etc)
  ipcMain.handle('read-file', (_, filePath) => {
    try {
      return { ok: true, data: fs.readFileSync(filePath).toString('base64') };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  // Platform info
  ipcMain.handle('platform', () => process.platform);

  // App version
  ipcMain.handle('version', () => app.getVersion());

  // Minimize / maximize
  ipcMain.on('window-minimize', () => mainWindow?.minimize());
  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize();
    else mainWindow?.maximize();
  });
  ipcMain.on('window-close', () => mainWindow?.close());
}

// ─── PRELOAD (create if missing) ──────────────────────────────────────────────
function ensurePreload() {
  const preload = path.join(__dirname, 'preload.js');
  if (!fs.existsSync(preload)) {
    fs.writeFileSync(preload, `
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
`);
  }
}

// ─── APP LIFECYCLE ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  ensurePreload();
  registerIPC();
  startIntelServer();
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // On macOS keep app alive in tray
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  stopIntelServer();
});

// Security: block new window creation to external URLs
app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://127.0.0.1') || url.startsWith('file://')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });
});
