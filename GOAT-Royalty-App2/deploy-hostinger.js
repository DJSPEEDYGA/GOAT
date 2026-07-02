const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  apiToken: process.env.HOSTINGER_API_TOKEN || 'CLqIY1SNx72M92XS0WOvVnE2TJQ8FkQNInso0oU86c149a44',
  host: process.env.HOSTINGER_HOST || 'your-hostinger-server.com',
  username: process.env.HOSTINGER_USERNAME || 'your-username',
  domain: process.env.HOSTINGER_DOMAIN || 'your-domain.com',
  deployPath: process.env.DEPLOY_PATH || '~/public_html'
};

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${step}: ${message}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function checkPrerequisites() {
  logStep('1', 'Checking Prerequisites');
  
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'pages/_app.js',
    'pages/index.js'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    log('Missing required files:', 'red');
    missingFiles.forEach(file => log(`  - ${file}`, 'red'));
    process.exit(1);
  }
  
  log('✓ All required files present', 'green');
}

function buildApplication() {
  logStep('2', 'Building Application');
  
  try {
    log('Installing dependencies...', 'yellow');
    execSync('npm install', { stdio: 'inherit' });
    
    log('Building production bundle...', 'yellow');
    execSync('npm run build', { stdio: 'inherit' });
    
    log('✓ Build completed successfully', 'green');
    
    // Verify build output
    if (!fs.existsSync('.next/standalone/server.js')) {
      throw new Error('Build output not found');
    }
    
    log('✓ Build artifacts verified', 'green');
  } catch (error) {
    log('✗ Build failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

function createDeploymentPackage() {
  logStep('3', 'Creating Deployment Package');
  
  try {
    const packageName = 'goat-royalty-app.tar.gz';
    const buildDir = '.next/standalone';
    
    log('Creating deployment archive...', 'yellow');
    execSync(`cd ${buildDir} && tar -czf ../../${packageName} .`, { stdio: 'inherit' });
    
    const stats = fs.statSync(packageName);
    log(`✓ Package created: ${packageName}`, 'green');
    log(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`, 'green');
    
    return packageName;
  } catch (error) {
    log('✗ Package creation failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

function generateUploadScript(packageName) {
  logStep('4', 'Generating Upload Script');
  
  const scriptPath = 'upload-to-hostinger.sh';
  const script = `#!/bin/bash

# GOAT Royalty App - Hostinger Deployment Script
# Generated automatically by deploy-hostinger.js

set -e

echo "=========================================="
echo "  Uploading to Hostinger"
echo "=========================================="

# Configuration
HOST="${CONFIG.host}"
USERNAME="${CONFIG.username}"
DEPLOY_PATH="${CONFIG.deployPath}"
PACKAGE="${packageName}"

echo "Target: ${USERNAME}@${HOST}:${DEPLOY_PATH}"

# Upload package
echo ""
echo "Step 1: Uploading package..."
scp ${PACKAGE} ${USERNAME}@${HOST}:~

# Extract and deploy
echo ""
echo "Step 2: Extracting and deploying..."
ssh ${USERNAME}@${HOST} << 'ENDSSH'
  # Backup current version
  echo "Creating backup..."
  cd ${DEPLOY_PATH}
  if [ -d "backup" ]; then
    rm -rf backup
  fi
  mkdir -p backup
  cp -r .next backup/ 2>/dev/null || true
  cp server.js backup/ 2>/dev/null || true
  cp package.json backup/ 2>/dev/null || true
  echo "Backup created"
  
  # Extract new version
  echo "Extracting new version..."
  cd ~
  rm -rf ${DEPLOY_PATH}/.next
  rm -f ${DEPLOY_PATH}/server.js
  tar -xzf ${PACKAGE} -C ${DEPLOY_PATH}
  echo "Extraction complete"
  
  # Install dependencies
  echo "Installing dependencies..."
  cd ${DEPLOY_PATH}
  npm install --production
  echo "Dependencies installed"
  
  # Set permissions
  echo "Setting permissions..."
  chmod 755 server.js
  chmod -R 755 .next
  chmod -R 755 node_modules
  echo "Permissions set"
  
  # Restart application
  echo "Restarting application..."
  pm2 restart goat-royalty-app || pm2 start server.js --name goat-royalty-app
  echo "Application restarted"
ENDSSH

# Cleanup
echo ""
echo "Step 3: Cleaning up..."
rm ${PACKAGE}

# Health check
echo ""
echo "Step 4: Running health check..."
sleep 10
if curl -f https://${CONFIG.domain}/ > /dev/null 2>&1; then
  echo "✓ Health check passed!"
else
  echo "✗ Health check failed!"
  exit 1
fi

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo "Application URL: https://${CONFIG.domain}"
echo "=========================================="
`;

  fs.writeFileSync(scriptPath, script, { mode: 0o755 });
  log(`✓ Upload script created: ${scriptPath}`, 'green');
  
  return scriptPath;
}

function generateDeploymentInstructions(scriptPath) {
  logStep('5', 'Deployment Instructions');
  
  const instructions = `
╔═══════════════════════════════════════════════════════════╗
║     GOAT ROYALTY APP - HOSTINGER DEPLOYMENT               ║
╚═══════════════════════════════════════════════════════════╝

📦 Deployment Package Created: ✓
📝 Upload Script Generated: ✓
🔧 Build Status: Complete

═══════════════════════════════════════════════════════════

🚀 DEPLOYMENT OPTIONS:

OPTION 1: Automated Upload (Recommended)
-----------------------------------------
1. Ensure you have SSH access to your Hostinger server
2. Run the following command:
   
   ${colors.cyan}${scriptPath}${colors.reset}

3. Enter your password when prompted
4. Wait for deployment to complete


OPTION 2: Manual Upload
-------------------------
1. Use SFTP client (FileZilla, WinSCP) to upload files
2. Upload 'goat-royalty-app.tar.gz' to your home directory
3. SSH into your server and run extraction commands
4. Follow manual deployment guide for detailed steps


OPTION 3: GitHub Actions (Recommended for Production)
------------------------------------------------------
1. Add the following secrets to your GitHub repository:
   - HOSTINGER_HOST: ${CONFIG.host}
   - HOSTINGER_USERNAME: ${CONFIG.username}
   - HOSTINGER_SSH_KEY: Your SSH private key
   - HOSTINGER_URL: https://${CONFIG.domain}

2. Push changes to GOAT-APP branch
3. GitHub Actions will automatically deploy


═══════════════════════════════════════════════════════════

📋 DEPLOYMENT CHECKLIST:

Before deploying:
☐ Configure environment variables (.env.production)
☐ Update API endpoints and URLs
☐ Test build locally
☐ Backup current production version
☐ Prepare SSL certificates

After deploying:
☐ Verify application is running
☐ Test all key pages and features
☐ Check console logs for errors
☐ Monitor resource usage
☐ Set up monitoring and alerts

═══════════════════════════════════════════════════════════

🔍 VERIFICATION STEPS:

1. Check application status:
   ${colors.yellow}curl https://${CONFIG.domain}/${colors.reset}

2. Test Security Sandbox page:
   ${colors.yellow}https://${CONFIG.domain}/cyber-warrior${colors.reset}

3. View application logs:
   ${colors.yellow}ssh ${CONFIG.username}@${CONFIG.host} "pm2 logs goat-royalty-app"${colors.reset}

4. Monitor resources:
   ${colors.yellow}ssh ${CONFIG.username}@${CONFIG.host} "pm2 monit"${colors.reset}

═══════════════════════════════════════════════════════════

🆘 TROUBLESHOOTING:

Build fails locally:
  → Check Node.js version (requires 18+)
  → Delete node_modules and package-lock.json
  → Run npm install again

Application not starting:
  → Check server.js exists and has correct permissions
  → Verify port is not already in use
  → Check PM2 logs: pm2 logs goat-royalty-app

502 Bad Gateway:
  → Restart application: pm2 restart goat-royalty-app
  → Check Node.js version matches
  → Verify build output is complete

Static files not loading:
  → Check .next/static directory exists
  → Verify file permissions are 755
  → Clear browser cache

═══════════════════════════════════════════════════════════

📞 SUPPORT:

For detailed deployment guide, see:
${colors.cyan}HOSTINGER_DEPLOYMENT_GUIDE.md${colors.reset}

For GitHub Actions setup, see:
${colors.cyan}.github/workflows/deploy-hostinger.yml${colors.reset}

═══════════════════════════════════════════════════════════

🎉 READY TO DEPLOY!

Run this command to deploy:
${colors.bright}${colors.green}${scriptPath}${colors.reset}

Or push to GOAT-APP branch for automatic deployment via GitHub Actions

╔═══════════════════════════════════════════════════════════╗
║  © 2026 Harvey Miller / FASTASSMAN Publishing Inc         ║
╚═══════════════════════════════════════════════════════════╝

`;

  console.log(instructions);
}

function main() {
  console.log('\n');
  log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     GOAT ROYALTY APP - HOSTINGER DEPLOYMENT TOOL          ║', 'bright');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');
  
  // Step 1: Check prerequisites
  checkPrerequisites();
  
  // Step 2: Build application
  buildApplication();
  
  // Step 3: Create deployment package
  const packageName = createDeploymentPackage();
  
  // Step 4: Generate upload script
  const scriptPath = generateUploadScript(packageName);
  
  // Step 5: Show deployment instructions
  generateDeploymentInstructions(scriptPath);
  
  log('\n✓ Deployment preparation complete!\n', 'green');
}

// Run deployment tool
try {
  main();
} catch (error) {
  log('\n✗ Deployment preparation failed:', 'red');
  log(error.message, 'red');
  process.exit(1);
}