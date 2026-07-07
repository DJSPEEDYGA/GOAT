const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow;
const PORT = 3000;

// Simple function to check if server is responding
function waitForServer(maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkServer = () => {
      attempts++;
      console.log(`Checking server... attempt ${attempts}/${maxAttempts}`);
      
      const req = http.get(`http://localhost:${PORT}`, (res) => {
        console.log('Server is ready!');
        resolve();
      });
      
      req.on('error', (err) => {
        if (attempts >= maxAttempts) {
          console.error('Server failed to start after', maxAttempts, 'attempts');
          reject(new Error('Server timeout'));
        } else {
          // Try again in 1 second
          setTimeout(checkServer, 1000);
        }
      });
      
      req.setTimeout(1000, () => {
        req.destroy();
      });
    };
    
    checkServer();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'public', 'icon.png'),
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);

  // Open DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Reload on fail
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.loadURL(`http://localhost:${PORT}`);
      }
    }, 2000);
  });
}

app.whenReady().then(async () => {
  console.log('Electron app starting...');
  console.log('App is packaged:', app.isPackaged);
  console.log('App path:', app.getAppPath());
  
  try {
    console.log('Waiting for Next.js server on port', PORT);
    await waitForServer();
    console.log('Creating window...');
    createWindow();
  } catch (error) {
    console.error('Failed to connect to server:', error);
    
    // Show error dialog
    const { dialog } = require('electron');
    dialog.showErrorBox(
      'Server Error',
      'Could not connect to the application server.\n\n' +
      'Please make sure:\n' +
      '1. Port 3000 is not in use by another application\n' +
      '2. You have run "npm run dev" in a separate terminal\n\n' +
      'For packaged app: The server should start automatically.\n' +
      'If this error persists, please contact support.'
    );
    
    app.quit();
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});