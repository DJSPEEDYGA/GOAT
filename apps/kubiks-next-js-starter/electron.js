const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let nextProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Kubiks Next.js Starter',
    show: false,
    backgroundColor: '#ffffff',
  });

  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '.next/server/app/page.html')}`;
  
  if (process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(startUrl);
  } else {
    mainWindow.loadURL(startUrl);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    const isDev = process.env.ELECTRON_START_URL;
    
    if (isDev) {
      resolve('http://localhost:3000');
      return;
    }

    const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');
    
    nextProcess = spawn('node', [serverPath], {
      cwd: __dirname,
      env: { ...process.env, PORT: '3000' },
      stdio: 'inherit'
    });

    nextProcess.on('error', (err) => {
      console.error('Failed to start Next.js server:', err);
      reject(err);
    });

    setTimeout(() => {
      resolve('http://localhost:3000');
    }, 2000);
  });
}

app.on('ready', async () => {
  try {
    const url = await startNextServer();
    process.env.ELECTRON_START_URL = url;
    createWindow();
  } catch (err) {
    console.error('Error starting app:', err);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (nextProcess) {
      nextProcess.kill();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (nextProcess) {
    nextProcess.kill();
  }
});