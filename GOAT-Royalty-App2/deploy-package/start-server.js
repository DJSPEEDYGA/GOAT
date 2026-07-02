const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Next.js server...');
console.log('Current directory:', __dirname);

// Determine the correct path to the Next.js server
let serverPath;
let serverArgs = ['start'];

// Check if we're in a packaged app
const isPackaged = !__dirname.includes('node_modules');

if (isPackaged) {
  // In packaged app, look for standalone server
  const standalonePath = path.join(__dirname, '.next', 'standalone', 'server.js');
  if (fs.existsSync(standalonePath)) {
    console.log('Using standalone server:', standalonePath);
    serverPath = 'node';
    serverArgs = [standalonePath];
  } else {
    // Fallback to regular next
    const nextPath = path.join(__dirname, 'node_modules', '.bin', 'next.cmd');
    if (fs.existsSync(nextPath)) {
      console.log('Using next.cmd:', nextPath);
      serverPath = nextPath;
    } else {
      console.error('Could not find Next.js server!');
      console.log('Checked paths:');
      console.log('- Standalone:', standalonePath);
      console.log('- Next.cmd:', nextPath);
      process.exit(1);
    }
  }
} else {
  // In development, use npx
  console.log('Development mode - using npx next');
  serverPath = 'npx';
  serverArgs = ['next', 'start'];
}

console.log('Starting server with:', serverPath, serverArgs.join(' '));

const server = spawn(serverPath, serverArgs, {
  cwd: __dirname,
  shell: true,
  stdio: 'inherit'
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log('Server exited with code:', code);
  process.exit(code);
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('Stopping server...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping server...');
  server.kill();
  process.exit(0);
});