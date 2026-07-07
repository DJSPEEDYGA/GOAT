/**
 * GOAT Force Agent App — Universal Electron Main
 * Reads GOAT_APP_TARGET env var to know which agent to load.
 * Falls back to localhost:8090 → local web-app files.
 */
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const http  = require('http');
const fs    = require('fs');

// ── Which agent am I? ────────────────────────────────────────
const TARGET  = process.env.GOAT_APP_TARGET || 'index';
// Web root: bundled copy inside app Resources, or fall back to dev path
const BUNDLED = path.join(process.resourcesPath || '', 'web-app');
const DEV_PATH = path.join(__dirname, '..', 'web-app');
const WEBROOT = fs.existsSync(BUNDLED) ? BUNDLED
              : fs.existsSync(DEV_PATH) ? DEV_PATH
              : '/Users/be100radio/GOAT-Royalty-App/web-app';
const SERVER  = 'http://127.0.0.1:8090';

const AGENTS = {
  'index':        { title: '🐐 GOAT Royalty App',                page: '',                  icon: 'goat-royalty' },
  'the-goat':     { title: '🐐 THE GOAT — Supreme Commander',    page: 'the-goat.html',     icon: 'the-goat'     },
  'moneypenny':   { title: '💼 Ms. Money Penny — GOAT Force',    page: 'moneypenny.html',   icon: 'moneypenny'   },
  'dr-devin':     { title: '🤖 Dr. Devin — GOAT Force AI',       page: 'dr-devin.html',     icon: 'dr-devin'     },
  'master-oscar': { title: '🤝 Master Oscar — GOAT Force',       page: 'moneypenny.html?mode=oscar', icon: 'master-oscar' },
  'nexus':        { title: '📡 Nexus — GOAT Force Intel',        page: 'moneypenny.html?mode=nexus', icon: 'nexus'        },
  'lexi':         { title: '🎤 Lexi — GOAT Force Creative',      page: 'moneypenny.html?mode=lexi',  icon: 'lexi'         },
  'sir-codex':    { title: '📖 Sir Codex — GOAT Force',         page: 'moneypenny.html?mode=codex', icon: 'sir-codex'    },
  'goat-intel':   { title: '🧠 GOAT Intel Server',              page: 'intel.html',        icon: 'goat-royalty' },
};

const agent = AGENTS[TARGET] || AGENTS['index'];

function checkServer() {
  return new Promise(resolve => {
    try {
      const req = http.get(SERVER, res => { res.destroy(); resolve(res.statusCode < 500); });
      req.setTimeout(1500, () => { req.destroy(); resolve(false); });
      req.on('error', () => resolve(false));
    } catch { resolve(false); }
  });
}

function buildMenu(base, isServer) {
  const nav = (page) => isServer ? `${SERVER}/${page}` : `file://${WEBROOT}/${page}`;
  const template = [
    {
      label: '🐐 GOAT Force',
      submenu: [
        { label: '🏠 Home',             click: (_, w) => w?.loadURL(nav('')) },
        { label: '🐐 THE GOAT',         click: (_, w) => w?.loadURL(nav('the-goat.html')) },
        { label: '💼 Ms. Money Penny',  click: (_, w) => w?.loadURL(nav('moneypenny.html')) },
        { label: '🤖 Dr. Devin',        click: (_, w) => w?.loadURL(nav('dr-devin.html')) },
        { label: '👑 Royalty App',       click: (_, w) => w?.loadURL(nav('goat-royalty/')) },
        { label: '🤝 Master Oscar',      click: (_, w) => w?.loadURL(nav('moneypenny.html?mode=oscar')) },
        { label: '📡 Nexus',             click: (_, w) => w?.loadURL(nav('moneypenny.html?mode=nexus')) },
        { label: '🎤 Lexi',              click: (_, w) => w?.loadURL(nav('moneypenny.html?mode=lexi')) },
        { label: '📖 Sir Codex',         click: (_, w) => w?.loadURL(nav('moneypenny.html?mode=codex')) },
        { type: 'separator' },
        { label: '📊 AI Dashboard',      click: (_, w) => w?.loadURL(nav('ai-dashboard.html')) },
        { label: '🎵 Studio Hub',         click: (_, w) => w?.loadURL(nav('studio-hub.html')) },
        { label: '🛒 GOAT Shop',          click: (_, w) => w?.loadURL(nav('shop.html')) },
        { label: '⚙️ Settings',           click: (_, w) => w?.loadURL(nav('settings.html')) },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' }
      ]
    },
    {
      label: 'Navigate',
      submenu: [
        { label: 'Back',      click: (_, w) => w?.webContents.goBack(),    accelerator: 'CmdOrCtrl+[' },
        { label: 'Forward',   click: (_, w) => w?.webContents.goForward(), accelerator: 'CmdOrCtrl+]' },
        { label: 'Reload',    click: (_, w) => w?.webContents.reload(),    accelerator: 'CmdOrCtrl+R' },
        { label: 'Dev Tools', click: (_, w) => w?.webContents.toggleDevTools(), accelerator: 'CmdOrCtrl+Option+I' }
      ]
    },
    { label: 'Window', role: 'windowMenu' },
    {
      label: 'GOAT Intel',
      submenu: [
        { label: 'Start Intel Server', click: () => { shell.openPath('/Users/be100radio/GOAT-Royalty-App/goat-intel-server'); } },
        { label: 'Intel Dashboard', click: (_, w) => w?.loadURL('http://127.0.0.1:5500') }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(async () => {
  const serverUp = await checkServer();
  const startURL = serverUp
    ? (agent.page ? `${SERVER}/${agent.page}` : SERVER)
    : `file://${WEBROOT}/${agent.page || 'index.html'}`;

  buildMenu(serverUp ? SERVER : `file://${WEBROOT}`, serverUp);

  const win = new BrowserWindow({
    width: 1440, height: 900,
    minWidth: 960, minHeight: 640,
    title: agent.title,
    backgroundColor: '#080808',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });

  win.loadURL(startURL);

  win.webContents.once('did-finish-load', () => {
    win.setTitle(agent.title + (serverUp ? '' : ' [Local]'));
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://127.0.0.1') || url.startsWith('http://localhost') || url.startsWith('file://')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) app.emit('ready');
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
