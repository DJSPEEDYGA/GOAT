/**
 * Desktop Controller Module - Voice-Controlled System Operations
 * Control your computer with voice commands through the GOAT app
 * Cross-platform: Windows, macOS, Linux
 */

const EventEmitter = require('events');
const { exec, spawn } = require('child_process');
const path = require('path');
const os = require('os');

class DesktopController extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.platform = os.platform(); // 'win32', 'darwin', 'linux'
        this.enabled = options.enabled !== false;
        this.requireConfirmation = options.requireConfirmation || false;
        
        // Safety settings
        this.allowedCommands = new Set([
            // Application control
            'open', 'close', 'switch', 'minimize', 'maximize',
            // File operations
            'open_file', 'new_folder', 'delete',
            // System
            'volume_up', 'volume_down', 'mute', 'screenshot', 'lock',
            // Browser
            'search', 'navigate', 'refresh',
            // GOAT app
            'show_catalog', 'show_royalties', 'show_network', 'show_mining'
        ]);
        
        // Dangerous commands that require confirmation
        this.dangerousCommands = new Set([
            'delete', 'format', 'shutdown', 'restart', 'close_all'
        ]);
        
        // Platform-specific app paths
        this.appPaths = {
            win32: {
                chrome: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                firefox: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
                spotify: 'C:\\Users\\{user}\\AppData\\Roaming\\Spotify\\Spotify.exe',
                vscode: 'C:\\Users\\{user}\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
                notepad: 'notepad.exe',
                calculator: 'calc.exe',
                explorer: 'explorer.exe',
                settings: 'start ms-settings:',
                terminal: 'cmd.exe'
            },
            darwin: {
                chrome: '/Applications/Google Chrome.app',
                firefox: '/Applications/Firefox.app',
                spotify: '/Applications/Spotify.app',
                vscode: '/Applications/Visual Studio Code.app',
                safari: '/Applications/Safari.app',
                finder: '/System/Library/CoreServices/Finder.app',
                terminal: '/Applications/Utilities/Terminal.app',
                settings: '/System/Applications/System Preferences.app'
            },
            linux: {
                chrome: 'google-chrome',
                firefox: 'firefox',
                spotify: 'spotify',
                vscode: 'code',
                terminal: 'gnome-terminal',
                files: 'nautilus',
                settings: 'gnome-control-center'
            }
        };
        
        this.currentApp = null;
        this.commandHistory = [];
    }
    
    /**
     * Initialize the desktop controller
     */
    async initialize() {
        console.log('🖥️ Initializing Desktop Controller...');
        console.log(`  Platform: ${this.platform}`);
        console.log(`  Enabled: ${this.enabled}`);
        
        // Check for RobotJS (for advanced control)
        try {
            this.robot = require('robotjs');
            console.log('  ✓ RobotJS available for advanced control');
        } catch (e) {
            console.log('  ⚠ RobotJS not installed - basic control only');
            this.robot = null;
        }
        
        console.log('  ✓ Desktop Controller initialized');
        return true;
    }
    
    /**
     * Execute a voice command
     */
    async executeCommand(command, params = {}) {
        if (!this.enabled) {
            return { success: false, error: 'Desktop control is disabled' };
        }
        
        // Parse command
        const parsed = this.parseCommand(command);
        
        if (!parsed) {
            return { success: false, error: 'Could not parse command' };
        }
        
        // Check if command is allowed
        if (!this.allowedCommands.has(parsed.action)) {
            return { success: false, error: `Command '${parsed.action}' is not allowed` };
        }
        
        // Check for dangerous commands
        if (this.dangerousCommands.has(parsed.action) && this.requireConfirmation) {
            this.emit('confirmation-required', {
                command: parsed,
                message: `Are you sure you want to ${parsed.action}?`
            });
            return { success: false, requiresConfirmation: true };
        }
        
        // Execute the command
        const result = await this.executeAction(parsed, params);
        
        // Log to history
        this.commandHistory.push({
            command,
            parsed,
            result,
            timestamp: Date.now()
        });
        
        return result;
    }
    
    /**
     * Parse natural language command
     */
    parseCommand(text) {
        const lower = text.toLowerCase().trim();
        
        // Application control patterns
        const patterns = [
            // Open applications
            { regex: /^open\s+(.+)$/i, action: 'open', extract: 1 },
            { regex: /^launch\s+(.+)$/i, action: 'open', extract: 1 },
            { regex: /^start\s+(.+)$/i, action: 'open', extract: 1 },
            
            // Close applications
            { regex: /^close\s+(.+)$/i, action: 'close', extract: 1 },
            { regex: /^quit\s+(.+)$/i, action: 'close', extract: 1 },
            { regex: /^exit\s+(.+)$/i, action: 'close', extract: 1 },
            
            // Switch windows
            { regex: /^switch\s+to\s+(.+)$/i, action: 'switch', extract: 1 },
            { regex: /^go\s+to\s+(.+)$/i, action: 'switch', extract: 1 },
            
            // Volume control
            { regex: /^volume\s+up$/i, action: 'volume_up' },
            { regex: /^volume\s+down$/i, action: 'volume_down' },
            { regex: /^mute$/i, action: 'mute' },
            { regex: /^unmute$/i, action: 'unmute' },
            
            // System
            { regex: /^take\s+screenshot$/i, action: 'screenshot' },
            { regex: /^screenshot$/i, action: 'screenshot' },
            { regex: /^lock\s+screen$/i, action: 'lock' },
            { regex: /^lock$/i, action: 'lock' },
            
            // Browser
            { regex: /^search\s+(?:for\s+)?(.+)$/i, action: 'search', extract: 1 },
            { regex: /^google\s+(.+)$/i, action: 'search', extract: 1 },
            { regex: /^refresh$/i, action: 'refresh' },
            
            // Typing
            { regex: /^type\s+(.+)$/i, action: 'type', extract: 1 },
            
            // GOAT app navigation
            { regex: /^show\s+(?:my\s+)?catalog$/i, action: 'show_catalog' },
            { regex: /^show\s+(?:my\s+)?royalt(?:y|ies)$/i, action: 'show_royalties' },
            { regex: /^show\s+(?:my\s+)?network$/i, action: 'show_network' },
            { regex: /^mining\s+(?:dashboard|status)?$/i, action: 'show_mining' }
        ];
        
        for (const pattern of patterns) {
            const match = lower.match(pattern.regex);
            if (match) {
                return {
                    action: pattern.action,
                    target: pattern.extract ? match[pattern.extract].trim() : null,
                    raw: text
                };
            }
        }
        
        return null;
    }
    
    /**
     * Execute the parsed action
     */
    async executeAction(parsed, params = {}) {
        const { action, target } = parsed;
        
        this.emit('executing', { action, target });
        
        switch (action) {
            case 'open':
                return this.openApplication(target);
            case 'close':
                return this.closeApplication(target);
            case 'switch':
                return this.switchWindow(target);
            case 'volume_up':
                return this.volumeUp();
            case 'volume_down':
                return this.volumeDown();
            case 'mute':
                return this.mute();
            case 'screenshot':
                return this.takeScreenshot();
            case 'lock':
                return this.lockScreen();
            case 'search':
                return this.webSearch(target);
            case 'type':
                return this.typeText(target);
            case 'refresh':
                return this.refresh();
            default:
                return { success: false, error: `Unknown action: ${action}` };
        }
    }
    
    /**
     * Open an application
     */
    async openApplication(appName) {
        const appPath = this.getAppPath(appName);
        
        if (!appPath) {
            return { success: false, error: `Unknown application: ${appName}` };
        }
        
        return new Promise((resolve) => {
            let command;
            let args = [];
            
            if (this.platform === 'win32') {
                command = 'start';
                args = ['', appPath];
            } else if (this.platform === 'darwin') {
                command = 'open';
                args = [appPath];
            } else {
                command = appPath;
            }
            
            const proc = spawn(command, args, {
                detached: true,
                stdio: 'ignore'
            });
            
            proc.on('error', (err) => {
                resolve({ success: false, error: err.message });
            });
            
            proc.unref();
            this.currentApp = appName;
            
            this.emit('app-opened', { app: appName });
            resolve({ success: true, app: appName, message: `Opened ${appName}` });
        });
    }
    
    /**
     * Get platform-specific app path
     */
    getAppPath(appName) {
        const normalized = appName.toLowerCase().replace(/\s+/g, '');
        const paths = this.appPaths[this.platform] || {};
        
        // Direct match
        if (paths[normalized]) {
            return paths[normalized];
        }
        
        // Fuzzy match
        for (const [key, value] of Object.entries(paths)) {
            if (normalized.includes(key) || key.includes(normalized)) {
                return value;
            }
        }
        
        // Return as-is for command-line apps
        return appName;
    }
    
    /**
     * Close an application
     */
    async closeApplication(appName) {
        return new Promise((resolve) => {
            let command;
            
            if (this.platform === 'win32') {
                command = `taskkill /IM "${appName}.exe" /F`;
            } else if (this.platform === 'darwin') {
                command = `pkill -x "${appName}"`;
            } else {
                command = `pkill -x "${appName}"`;
            }
            
            exec(command, (error) => {
                if (error) {
                    resolve({ success: false, error: error.message });
                } else {
                    this.emit('app-closed', { app: appName });
                    resolve({ success: true, message: `Closed ${appName}` });
                }
            });
        });
    }
    
    /**
     * Switch to a window
     */
    async switchWindow(windowName) {
        if (this.platform === 'win32') {
            return new Promise((resolve) => {
                // Use PowerShell to switch windows
                const psScript = `
                    Add-Type @"
                        using System;
                        using System.Runtime.InteropServices;
                        public class Win32 {
                            [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
                            [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
                        }
                    "@
                    $proc = Get-Process -Name "${windowName}" -ErrorAction SilentlyContinue
                    if ($proc) {
                        [Win32]::SetForegroundWindow($proc.MainWindowHandle)
                    }
                `;
                
                exec(`powershell -command "${psScript}"`, (error) => {
                    if (error) {
                        resolve({ success: false, error: error.message });
                    } else {
                        resolve({ success: true, message: `Switched to ${windowName}` });
                    }
                });
            });
        }
        
        return { success: false, error: 'Window switching not supported on this platform' };
    }
    
    /**
     * Volume control
     */
    async volumeUp() {
        if (this.robot) {
            this.robot.keyTap('audio_vol_up');
            return { success: true, message: 'Volume increased' };
        }
        
        return this.executePlatformCommand('volumeUp');
    }
    
    async volumeDown() {
        if (this.robot) {
            this.robot.keyTap('audio_vol_down');
            return { success: true, message: 'Volume decreased' };
        }
        
        return this.executePlatformCommand('volumeDown');
    }
    
    async mute() {
        if (this.robot) {
            this.robot.keyTap('audio_mute');
            return { success: true, message: 'Audio muted' };
        }
        
        return this.executePlatformCommand('mute');
    }
    
    /**
     * Take screenshot
     */
    async takeScreenshot() {
        const timestamp = Date.now();
        const filename = `screenshot_${timestamp}.png`;
        const filepath = path.join(os.homedir(), 'Pictures', filename);
        
        return new Promise((resolve) => {
            let command;
            
            if (this.platform === 'win32') {
                // Use PowerShell for screenshot
                command = `powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::PrimaryScreen | ForEach-Object { $bmp = New-Object System.Drawing.Bitmap($_.Bounds.Width, $_.Bounds.Height); $graphics = [System.Drawing.Graphics]::FromImage($bmp); $graphics.CopyFromScreen($_.Bounds.Location, [System.Drawing.Point]::Empty, $_.Bounds.Size); $bmp.Save('${filepath}'); }"`;
            } else if (this.platform === 'darwin') {
                command = `screencapture -x "${filepath}"`;
            } else {
                command = `gnome-screenshot -f "${filepath}"`;
            }
            
            exec(command, (error) => {
                if (error) {
                    resolve({ success: false, error: error.message });
                } else {
                    this.emit('screenshot-taken', { path: filepath });
                    resolve({ success: true, path: filepath, message: 'Screenshot saved' });
                }
            });
        });
    }
    
    /**
     * Lock screen
     */
    async lockScreen() {
        return new Promise((resolve) => {
            let command;
            
            if (this.platform === 'win32') {
                command = 'rundll32.exe user32.dll,LockWorkStation';
            } else if (this.platform === 'darwin') {
                command = 'pmset displaysleepnow';
            } else {
                command = 'loginctl lock-session';
            }
            
            exec(command, (error) => {
                if (error) {
                    resolve({ success: false, error: error.message });
                } else {
                    resolve({ success: true, message: 'Screen locked' });
                }
            });
        });
    }
    
    /**
     * Web search
     */
    async webSearch(query) {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://www.google.com/search?q=${encodedQuery}`;
        
        return this.openURL(url);
    }
    
    /**
     * Open URL in default browser
     */
    async openURL(url) {
        return new Promise((resolve) => {
            let command;
            
            if (this.platform === 'win32') {
                command = `start "" "${url}"`;
            } else if (this.platform === 'darwin') {
                command = `open "${url}"`;
            } else {
                command = `xdg-open "${url}"`;
            }
            
            exec(command, (error) => {
                if (error) {
                    resolve({ success: false, error: error.message });
                } else {
                    resolve({ success: true, url, message: 'Opened in browser' });
                }
            });
        });
    }
    
    /**
     * Type text (requires RobotJS)
     */
    async typeText(text) {
        if (!this.robot) {
            return { success: false, error: 'RobotJS required for typing' };
        }
        
        this.robot.typeString(text);
        return { success: true, message: 'Text typed' };
    }
    
    /**
     * Refresh page (F5)
     */
    async refresh() {
        if (this.robot) {
            this.robot.keyTap('f5');
            return { success: true, message: 'Refreshed' };
        }
        
        return { success: false, error: 'RobotJS required for keyboard input' };
    }
    
    /**
     * Execute platform-specific command
     */
    async executePlatformCommand(cmd) {
        // Platform-specific implementations would go here
        return { success: false, error: `Command '${cmd}' not implemented for ${this.platform}` };
    }
    
    /**
     * Get available commands
     */
    getCommands() {
        return {
            applications: {
                'open {app}': 'Opens an application',
                'close {app}': 'Closes an application',
                'switch to {app}': 'Switches to application window'
            },
            system: {
                'volume up': 'Increases system volume',
                'volume down': 'Decreases system volume',
                'mute': 'Mutes system audio',
                'take screenshot': 'Takes a screenshot',
                'lock screen': 'Locks the screen'
            },
            browser: {
                'search for {query}': 'Searches the web',
                'google {query}': 'Searches Google',
                'refresh': 'Refreshes current page'
            },
            typing: {
                'type {text}': 'Types the specified text'
            },
            goat: {
                'show catalog': 'Opens music catalog',
                'show royalties': 'Opens royalty calculator',
                'show network': 'Shows network profiles',
                'mining status': 'Opens mining dashboard'
            }
        };
    }
}

module.exports = { DesktopController };