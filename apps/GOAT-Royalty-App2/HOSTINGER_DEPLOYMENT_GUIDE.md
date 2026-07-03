# 🚀 Hostinger Deployment Guide - GOAT Royalty App

## Overview
This guide provides step-by-step instructions to deploy your GOAT Royalty App to Hostinger servers using GitHub integration or manual deployment.

---

## 🔐 Security Notes

**IMPORTANT:** Never share your API tokens or server credentials in chat or unsecured channels.

- Your token should be stored in GitHub Secrets or environment variables
- Use SSH keys for server authentication instead of passwords
- Rotate credentials regularly

---

## 📋 Prerequisites

### Required Tools:
- Node.js (v18 or higher)
- npm or yarn
- Git
- GitHub account
- Hostinger hosting account

### Files Needed:
- Built Next.js application
- Environment variables (`.env.production`)
- SSL certificates (optional but recommended)

---

## 🎯 Option 1: GitHub Integration (Recommended)

### Step 1: Connect Hostinger to GitHub

1. Log in to your Hostinger account
2. Navigate to **Hosting** → **Manage** → **Git**
3. Click **Connect to GitHub**
4. Authorize Hostinger to access your repository
5. Select `DJSPEEDYGA/GOAT-Royalty-App2`
6. Choose branch: `main`

### Step 2: Configure Deployment Settings

In Hostinger Git settings:

```
Repository: DJSPEEDYGA/GOAT-Royalty-App2
Branch: main
Public Directory: .next/standalone
Composer: Disabled
Node.js Version: 18.x
Build Command: npm run build
Deploy Command: npm start
```

### Step 3: Enable Automatic Deployment

- Toggle **Auto Deploy** to ON
- Set deployment trigger: **On push to main branch**
- Enable **Automatic SSL** for HTTPS

### Step 4: Add Environment Variables

In Hostinger hPanel:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Step 5: Deploy

- Click **Deploy Now** or push changes to main branch
- Deployment will trigger automatically
- Monitor deployment logs in Hostinger dashboard

---

## 🔧 Option 2: Manual SFTP Deployment

### Step 1: Build Locally

```bash
# Navigate to project directory
cd GOAT-Royalty-App2

# Install dependencies
npm install

# Build for production
npm run build

# The build output is in .next/standalone/
```

### Step 2: Prepare Files

```bash
# Create deployment package
cd .next/standalone
tar -czf ../goat-royalty-app.tar.gz .

# Verify contents
tar -tzf ../goat-royalty-app.tar.gz | head -20
```

### Step 3: Upload to Hostinger

Using SFTP client (FileZilla, WinSCP, etc.):

```
Host: your-hostinger-server.com
Username: your-username
Password: your-password
Port: 21 or 22 (SFTP)
```

Upload files to:
```
/home/your-username/public_html/
```

### Step 4: Configure Node.js

In Hostinger hPanel:

1. Navigate to **Hosting** → **Manage** → **Setup**
2. Enable **Node.js**
3. Set **Node.js Version** to 18.x or 20.x
4. Set **Application Root** to `public_html`
5. Set **Application URL** to your domain
6. Set **Application Startup File** to `server.js`
7. Click **Setup**

### Step 5: Set Permissions

```bash
# SSH into your server
ssh your-username@your-hostinger-server.com

# Navigate to application directory
cd public_html

# Set correct permissions
chmod 755 server.js
chmod -R 755 .next
chmod -R 755 node_modules
```

### Step 6: Restart Application

```bash
# In Hostinger hPanel
Hosting → Manage → Node.js → Restart
```

---

## 🤖 Option 3: GitHub Actions CI/CD

### Step 1: Add GitHub Secrets

Go to your repository: Settings → Secrets and variables → Actions

Add the following secrets:
```
HOSTINGER_HOST=your-hostinger-server.com
HOSTINGER_USERNAME=your-username
HOSTINGER_SSH_KEY=your-private-ssh-key
```

### Step 2: Create Workflow File

Create `.github/workflows/deploy-hostinger.yml`:

```yaml
name: Deploy to Hostinger

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Deploy to Hostinger
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOSTINGER_HOST }}
          username: ${{ secrets.HOSTINGER_USERNAME }}
          key: ${{ secrets.HOSTINGER_SSH_KEY }}
          script: |
            cd ~/public_html
            git pull origin main
            npm install --production
            npm run build
            pm2 restart goat-royalty-app
```

### Step 3: Push and Deploy

```bash
# Commit workflow changes
git add .github/workflows/deploy-hostinger.yml
git commit -m "Add Hostinger deployment workflow"
git push origin main
```

The workflow will automatically deploy to Hostinger on every push to main.

---

## 🔍 Option 4: Deploy via Hostinger API

### Create Deployment Script

Create `deploy-hostinger.js`:

```javascript
const https = require('https');

const HOSTINGER_API = 'https://api.hostinger.com/v1';
const API_TOKEN = process.env.HOSTINGER_API_TOKEN;

function deployToHostinger() {
  const options = {
    hostname: 'api.hostinger.com',
    port: 443,
    path: '/deploy',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    res.on('data', (d) => {
      console.log(d.toString());
    });
  });

  req.on('error', (error) => {
    console.error(error);
  });

  req.write(JSON.stringify({
    repository: 'DJSPEEDYGA/GOAT-Royalty-App2',
    branch: 'main',
    buildCommand: 'npm run build'
  }));

  req.end();
}

deployToHostinger();
```

### Run Deployment

```bash
# Set environment variable
export HOSTINGER_API_TOKEN=CLqIY1SNx72M92XS0WOvVnE2TJQ8FkQNInso0oU86c149a44

# Run deployment
node deploy-hostinger.js
```

---

## ✅ Post-Deployment Checklist

### Verify Deployment:

1. **Check Application Status**
   ```bash
   curl https://your-domain.com
   ```

2. **Test Key Pages**
   - https://your-domain.com
   - https://your-domain.com/cyber-warrior
   - https://your-domain.com/dashboard

3. **Check Console Logs**
   ```bash
   pm2 logs goat-royalty-app
   ```

4. **Monitor Resources**
   - CPU usage
   - Memory usage
   - Disk space

### Security Configuration:

1. **Enable HTTPS**
   - Install SSL certificate
   - Redirect HTTP to HTTPS

2. **Set Security Headers**
   - Already configured in `next.config.js`

3. **Configure Firewall**
   - Allow only necessary ports
   - Block malicious IPs

4. **Enable Backups**
   - Automatic daily backups
   - Retention policy

---

## 🛠️ Troubleshooting

### Common Issues:

**Issue:** Build fails on Hostinger
```
Solution: Check Node.js version matches local environment
Ensure all dependencies are listed in package.json
```

**Issue:** Application not starting
```
Solution: Check server.js exists in root directory
Verify file permissions (755)
Check Node.js process logs
```

**Issue:** 502 Bad Gateway
```
Solution: Restart Node.js application
Check port conflicts
Verify application is running
```

**Issue:** Static files not loading
```
Solution: Check .next/static directory exists
Verify public path configuration
Check file permissions
```

---

## 📊 Performance Optimization

### Enable Caching:

```javascript
// next.config.js
const nextConfig = {
  // ... existing config
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};
```

### Enable Compression:

```bash
# Install compression middleware
npm install compression
```

### Database Optimization:

- Use connection pooling
- Enable query caching
- Optimize indexes

---

## 🔄 Updates and Maintenance

### Update Application:

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Rebuild
npm run build

# Restart application
pm2 restart goat-royalty-app
```

### Scheduled Maintenance:

```bash
# Add to crontab for daily backups
0 2 * * * /home/your-user/backup-script.sh
```

---

## 📞 Support

If you encounter issues:

1. Check Hostinger documentation
2. Review deployment logs
3. Check GitHub Actions workflow logs
4. Contact Hostinger support

---

## 🎉 Summary

You have four deployment options:

1. **GitHub Integration** (Easiest - Recommended)
2. **Manual SFTP Deployment** (Full control)
3. **GitHub Actions CI/CD** (Automated)
4. **Hostinger API** (Programmatic)

Choose the option that best fits your workflow and expertise level.

---

*© 2026 Harvey Miller / FASTASSMAN Publishing Inc*