// Standalone build script for creating a true portable executable
const fs = require('fs');
const path = require('path');

console.log('Creating standalone build configuration...');

// Create a simplified version that bundles everything
const standaloneConfig = {
  name: 'GOAT Royalty App Standalone',
  version: '1.0.0',
  description: 'Standalone version with embedded server',
  main: 'standalone-main.js',
  build: {
    appId: 'com.goatroyalty.standalone',
    productName: 'GOAT Royalty App',
    asar: true,
    asarUnpack: [
      'node_modules/next/**/*',
      '.next/**/*'
    ],
    files: [
      'standalone-main.js',
      'preload.js',
      '.next/**/*',
      'public/**/*',
      'pages/**/*',
      'components/**/*',
      'styles/**/*',
      'node_modules/**/*',
      'package.json'
    ],
    win: {
      target: [
        {
          target: 'portable',
          arch: ['x64']
        }
      ],
      icon: 'public/icon.ico'
    },
    portable: {
      artifactName: 'GOAT-Royalty-App-Standalone.exe'
    },
    compression: 'maximum',
    nodeGypRebuild: false,
    npmRebuild: false
  }
};

console.log('Standalone configuration created!');
console.log('This will create a single portable .exe file');