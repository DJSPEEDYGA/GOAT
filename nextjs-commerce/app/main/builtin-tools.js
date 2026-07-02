/**
 * Built-in Development Tools for GOAT Royalty App
 * 
 * This module provides built-in development tools that run entirely within
 * the self-contained application, including:
 * - Code Editor (VS Code-like)
 * - Terminal/Shell
 * - Git/GitHub Client
 * - File Explorer
 * - Process Manager
 * - System Monitor
 * 
 * @module BuiltInTools
 */

const { ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process').promises;
const fs = require('fs').promises;

class BuiltInTools {
  constructor() {
    this.tools = {
      codeEditor: null,
      terminal: null,
      gitClient: null,
      fileExplorer: null,
      processManager: null,
      systemMonitor: null
    };
    
    this.openWindows = new Map();
    this.registerHandlers();
  }
  
  /**
   * Register IPC handlers for built-in tools
   */
  registerHandlers() {
    // Code Editor Handlers
    ipcMain.handle('tool:code-editor:open', async (event, filePath) => {
      return await this.openCodeEditor(filePath);
    });
    
    ipcMain.handle('tool:code-editor:save', async (event, filePath, content) => {
      return await this.saveCodeEditor(filePath, content);
    });
    
    ipcMain.handle('tool:code-editor:get-file', async (event, filePath) => {
      return await this.getFileContent(filePath);
    });
    
    // Terminal Handlers
    ipcMain.handle('tool:terminal:execute', async (event, command, cwd) => {
      return await this.executeCommand(command, cwd);
    });
    
    ipcMain.handle('tool:terminal:get-history', async () => {
      return this.getTerminalHistory();
    });
    
    // Git Client Handlers
    ipcMain.handle('tool:git:status', async (event, cwd) => {
      return await this.getGitStatus(cwd);
    });
    
    ipcMain.handle('tool:git:log', async (event, cwd, limit = 10) => {
      return await this.getGitLog(cwd, limit);
    });
    
    ipcMain.handle('tool:git:commit', async (event, cwd, message) => {
      return await this.gitCommit(cwd, message);
    });
    
    ipcMain.handle('tool:git:push', async (event, cwd, remote = 'origin', branch = 'main') => {
      return await this.gitPush(cwd, remote, branch);
    });
    
    ipcMain.handle('tool:git:pull', async (event, cwd, remote = 'origin', branch = 'main') => {
      return await this.gitPull(cwd, remote, branch);
    });
    
    ipcMain.handle('tool:git:create-branch', async (event, cwd, branchName) => {
      return await this.gitCreateBranch(cwd, branchName);
    });
    
    ipcMain.handle('tool:git:checkout', async (event, cwd, branchName) => {
      return await this.gitCheckout(cwd, branchName);
    });
    
    // File Explorer Handlers
    ipcMain.handle('tool:explorer:list', async (event, dirPath) => {
      return await this.listDirectory(dirPath);
    });
    
    ipcMain.handle('tool:explorer:read', async (event, filePath) => {
      return await this.getFileContent(filePath);
    });
    
    ipcMain.handle('tool:explorer:write', async (event, filePath, content) => {
      return await this.writeFile(filePath, content);
    });
    
    ipcMain.handle('tool:explorer:create-dir', async (event, dirPath) => {
      return await this.createDirectory(dirPath);
    });
    
    ipcMain.handle('tool:explorer:delete', async (event, filePath) => {
      return await this.deleteFile(filePath);
    });
    
    ipcMain.handle('tool:explorer:move', async (event, oldPath, newPath) => {
      return await this.moveFile(oldPath, newPath);
    });
    
    // Process Manager Handlers
    ipcMain.handle('tool:process:list', async () => {
      return await this.listProcesses();
    });
    
    ipcMain.handle('tool:process:kill', async (event, pid) => {
      return await this.killProcess(pid);
    });
    
    ipcMain.handle('tool:process:restart', async (event, pid) => {
      return await this.restartProcess(pid);
    });
    
    // System Monitor Handlers
    ipcMain.handle('tool:monitor:stats', async () => {
      return await this.getSystemStats();
    });
    
    ipcMain.handle('tool:monitor:disk', async () => {
      return await this.getDiskStats();
    });
    
    ipcMain.handle('tool:monitor:network', async () => {
      return await this.getNetworkStats();
    });
  }
  
  /**
   * Open Code Editor Window
   */
  async openCodeEditor(filePath = null) {
    const windowId = `code-editor-${Date.now()}`;
    
    if (this.openWindows.has(windowId)) {
      return { success: false, error: 'Code editor already open' };
    }
    
    const editorWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      title: filePath ? `Code Editor - ${path.basename(filePath)}` : 'Code Editor',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    
    // Load code editor UI (placeholder for now)
    editorWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(this.getCodeEditorHTML(filePath))}`);
    
    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      editorWindow.webContents.openDevTools();
    }
    
    editorWindow.on('closed', () => {
      this.openWindows.delete(windowId);
    });
    
    this.openWindows.set(windowId, editorWindow);
    
    return { success: true, windowId, filePath };
  }
  
  /**
   * Get Code Editor HTML
   */
  getCodeEditorHTML(filePath) {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Code Editor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      background: #1e1e1e;
      color: #d4d4d4;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .toolbar {
      background: #252526;
      padding: 10px;
      border-bottom: 1px solid #3e3e42;
      display: flex;
      gap: 10px;
    }
    .toolbar button {
      background: #0e639c;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    .toolbar button:hover {
      background: #1177bb;
    }
    .toolbar input {
      background: #3c3c3c;
      color: white;
      border: 1px solid #3e3e42;
      padding: 8px;
      border-radius: 4px;
      flex: 1;
    }
    .editor-container {
      flex: 1;
      display: flex;
    }
    .line-numbers {
      background: #1e1e1e;
      color: #858585;
      padding: 10px;
      text-align: right;
      user-select: none;
      min-width: 50px;
    }
    textarea {
      flex: 1;
      background: #1e1e1e;
      color: #d4d4d4;
      border: none;
      padding: 10px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      resize: none;
      outline: none;
      line-height: 1.5;
    }
    .status-bar {
      background: #007acc;
      color: white;
      padding: 5px 10px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button onclick="saveFile()">💾 Save</button>
    <button onclick="newFile()">📄 New</button>
    <input type="text" id="filePath" placeholder="File path..." value="${filePath || ''}">
  </div>
  <div class="editor-container">
    <div class="line-numbers" id="lineNumbers">1</div>
    <textarea id="editor" spellcheck="false"></textarea>
  </div>
  <div class="status-bar" id="statusBar">Ready</div>
  
  <script>
    const { ipcRenderer } = require('electron');
    const editor = document.getElementById('editor');
    const filePathInput = document.getElementById('filePath');
    const lineNumbers = document.getElementById('lineNumbers');
    const statusBar = document.getElementById('statusBar');
    
    // Load file if path provided
    if ('${filePath}') {
      loadFile('${filePath}');
    }
    
    // Update line numbers
    editor.addEventListener('input', updateLineNumbers);
    editor.addEventListener('scroll', () => {
      lineNumbers.scrollTop = editor.scrollTop;
    });
    
    async function loadFile(path) {
      try {
        const result = await ipcRenderer.invoke('tool:code-editor:get-file', path);
        if (result.success) {
          editor.value = result.content;
          updateLineNumbers();
          statusBar.textContent = 'Loaded: ' + path;
        } else {
          statusBar.textContent = 'Error: ' + result.error;
        }
      } catch (error) {
        statusBar.textContent = 'Error: ' + error.message;
      }
    }
    
    async function saveFile() {
      const path = filePathInput.value;
      if (!path) {
        alert('Please enter a file path');
        return;
      }
      
      try {
        const result = await ipcRenderer.invoke('tool:code-editor:save', path, editor.value);
        if (result.success) {
          statusBar.textContent = 'Saved: ' + path;
        } else {
          statusBar.textContent = 'Error: ' + result.error;
        }
      } catch (error) {
        statusBar.textContent = 'Error: ' + error.message;
      }
    }
    
    function newFile() {
      editor.value = '';
      filePathInput.value = '';
      updateLineNumbers();
      statusBar.textContent = 'New file';
    }
    
    function updateLineNumbers() {
      const lines = editor.value.split('\\n').length;
      lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
    }
    
    // Keyboard shortcuts
    editor.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
    });
  </script>
</body>
</html>
    `;
  }
  
  /**
   * Save Code Editor Content
   */
  async saveCodeEditor(filePath, content) {
    try {
      await fs.writeFile(filePath, content, 'utf8');
      return { success: true, filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get File Content
   */
  async getFileContent(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Execute Command in Terminal
   */
  async executeCommand(command, cwd = process.cwd()) {
    try {
      const { stdout, stderr } = await exec(command, { cwd, timeout: 30000, maxBuffer: 1024 * 1024 * 10 });
      return {
        success: true,
        stdout,
        stderr,
        exitCode: 0
      };
    } catch (error) {
      return {
        success: false,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || 1
      };
    }
  }
  
  /**
   * Get Terminal History
   */
  getTerminalHistory() {
    return { success: true, history: [] };
  }
  
  /**
   * Git Status
   */
  async getGitStatus(cwd = process.cwd()) {
    try {
      const result = await exec('git status --porcelain', { cwd });
      const lines = result.stdout.trim().split('\n').filter(line => line);
      const status = lines.map(line => ({
        status: line.substring(0, 2).trim(),
        path: line.substring(3)
      }));
      
      return { success: true, status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Git Log
   */
  async getGitLog(cwd = process.cwd(), limit = 10) {
    try {
      const result = await exec(`git log --oneline -${limit}`, { cwd });
      const commits = result.stdout.trim().split('\n').map(line => {
        const [hash, ...messageParts] = line.split(' ');
        return { hash, message: messageParts.join(' ') };
      });
      
      return { success: true, commits };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Git Commit
   */
  async gitCommit(cwd = process.cwd(), message) {
    try {
      await exec('git add .', { cwd });
      const result = await exec(`git commit -m "${message}"`, { cwd });
      
      return {
        success: true,
        stdout: result.stdout
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Git Push
   */
  async gitPush(cwd = process.cwd(), remote = 'origin', branch = 'main') {
    try {
      const result = await exec(`git push ${remote} ${branch}`, { cwd, timeout: 60000 });
      
      return {
        success: true,
        stdout: result.stdout
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Git Pull
   */
  async gitPull(cwd = process.cwd(), remote = 'origin', branch = 'main') {
    try {
      const result = await exec(`git pull ${remote} ${branch}`, { cwd, timeout: 60000 });
      
      return {
        success: true,
        stdout: result.stdout
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Git Create Branch
   */
  async gitCreateBranch(cwd = process.cwd(), branchName) {
    try {
      await exec(`git checkout -b ${branchName}`, { cwd });
      
      return { success: true, branch: branchName };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Git Checkout
   */
  async gitCheckout(cwd = process.cwd(), branchName) {
    try {
      await exec(`git checkout ${branchName}`, { cwd });
      
      return { success: true, branch: branchName };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * List Directory
   */
  async listDirectory(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const files = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name);
        const stats = await fs.stat(fullPath);
        return {
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
          size: stats.size,
          modified: stats.mtime
        };
      }));
      
      return { success: true, files };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Write File
   */
  async writeFile(filePath, content) {
    try {
      await fs.writeFile(filePath, content, 'utf8');
      return { success: true, filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Create Directory
   */
  async createDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      return { success: true, path: dirPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Delete File
   */
  async deleteFile(filePath) {
    try {
      await fs.rm(filePath, { recursive: true });
      return { success: true, path: filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Move File
   */
  async moveFile(oldPath, newPath) {
    try {
      await fs.rename(oldPath, newPath);
      return { success: true, newPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * List Processes
   */
  async listProcesses() {
    try {
      let command;
      if (process.platform === 'win32') {
        command = 'tasklist /fo csv';
      } else {
        command = 'ps aux';
      }
      
      const { stdout } = await exec(command);
      
      return { success: true, processes: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Kill Process
   */
  async killProcess(pid) {
    try {
      let command;
      if (process.platform === 'win32') {
        command = `taskkill /F /PID ${pid}`;
      } else {
        command = `kill -9 ${pid}`;
      }
      
      await exec(command);
      return { success: true, pid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Restart Process
   */
  async restartProcess(pid) {
    return { success: false, error: 'Not implemented' };
  }
  
  /**
   * Get System Stats
   */
  async getSystemStats() {
    try {
      const os = require('os');
      
      return {
        success: true,
        stats: {
          platform: os.platform(),
          arch: os.arch(),
          nodeVersion: process.version,
          uptime: os.uptime(),
          totalMemory: os.totalmem(),
          freeMemory: os.freemem(),
          cpuCount: os.cpus().length,
          loadAverage: os.loadavg()
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get Disk Stats
   */
  async getDiskStats() {
    try {
      let command;
      if (process.platform === 'win32') {
        command = 'wmic logicaldisk get size,freespace,caption';
      } else {
        command = 'df -h';
      }
      
      const { stdout } = await exec(command);
      
      return { success: true, disk: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get Network Stats
   */
  async getNetworkStats() {
    try {
      const os = require('os');
      const networkInterfaces = os.networkInterfaces();
      
      return {
        success: true,
        network: networkInterfaces
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = BuiltInTools;