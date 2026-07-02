# Manual Deployment Guide for GOAT Royalty Store

## Server Information
- **Server IP:** 72.61.193.184
- **Port:** 8080
- **Web Server:** nginx/1.24.0 (Ubuntu)
- **Current Issue:** Files not deployed, serving old index.html for all requests

## Quick Deployment Steps

### Option 1: SSH Deployment (Recommended)

```bash
# 1. SSH into your server
ssh root@72.61.193.184

# 2. Navigate to web root (may vary)
cd /var/www/html
# or
cd /usr/share/nginx/html

# 3. Backup current files
sudo mkdir -p backup_$(date +%Y%m%d)
sudo cp -r * backup_$(date +%Y%m%d)/

# 4. Download the updated files
# From your local machine:
scp -r web-app/* root@72.61.193.184:/var/www/html/

# Or use git pull if git is set up on server
git pull origin feature/add-new-studio-pages

# 5. Set proper permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# 6. Restart nginx
sudo systemctl restart nginx
```

### Option 2: SFTP Deployment

```bash
# Using FileZilla or similar SFTP client
# Host: 72.61.193.184
# Port: 22
# Username: root
# Password: [your password]

# Navigate to /var/www/html or /usr/share/nginx/html
# Upload all files from web-app/ directory
```

### Option 3: GitHub Actions Auto-Deployment

See `.github/workflows/deploy.yml` for automated deployment setup.

## Files That Need to Deploy

### New Files (Critical):
- `web-app/ai-models-download.html` (69KB) - NEW AI Model Downloads page
- `web-app/download_models_windows.bat` - Windows download script
- `web-app/download_ollama_models.sh` - Linux/Mac download script

### Updated Files:
- `web-app/index.html` - Updated with new navigation link

### Deployment Scripts:
- `deploy-to-server.sh` - Automated deployment script
- `diagnose-server.sh` - Server diagnostics tool
- `nginx-config.conf` - Proper nginx configuration

## Nginx Configuration Updates

### Update `/etc/nginx/sites-available/default`

```nginx
server {
    listen 8080;
    server_name 72.61.193.184;
    
    root /var/www/html;
    index index.html;
    
    # Serve HTML files directly
    location ~* \.html$ {
        try_files $uri =404;
    }
    
    # Serve download scripts
    location ~* \.(bat|sh)$ {
        add_header Content-Type application/octet-stream;
        add_header Content-Disposition "attachment";
        try_files $uri =404;
    }
    
    # Handle client-side routing for SPA routes
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }
    
    # Special handling for specific pages
    location = /ai-models-download.html {
        try_files $uri =404;
    }
}
```

### Apply Nginx Changes

```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Or restart
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

## Verification Steps

After deployment, verify the following:

```bash
# 1. Check files are deployed
curl -I http://72.61.193.184:8080/ai-models-download.html

# 2. Check content length (should be ~69KB)
curl -s http://72.61.193.184:8080/ai-models-download.html | wc -c

# 3. Test download scripts
curl -I http://72.61.193.184:8080/download_models_windows.bat

# 4. Check navigation works
curl -I http://72.61.193.184:8080/models.html
curl -I http://72.61.193.184:8080/downloads.html
```

## Troubleshooting

### If pages still show index.html:

1. Check nginx configuration:
   ```bash
   sudo cat /etc/nginx/sites-available/default
   ```

2. Check files exist:
   ```bash
   ls -la /var/www/html/ai-models-download.html
   ```

3. Check nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

4. Clear browser cache and test:
   ```bash
   curl -s http://72.61.193.184:8080/ai-models-download.html | head -20
   ```

### If download scripts don't work:

1. Check file permissions:
   ```bash
   ls -la /var/www/html/*.bat
   ls -la /var/www/html/*.sh
   ```

2. Make scripts executable:
   ```bash
   sudo chmod +x /var/www/html/*.sh
   ```

3. Test download:
   ```bash
   wget http://72.61.193.184:8080/download_models_windows.bat
   ```

## Web Root Location

The web root might be in one of these locations. Check which one your server uses:

- `/var/www/html/` (most common)
- `/usr/share/nginx/html/`
- `/var/www/`
- `/home/username/public_html/`

Find the correct location:
```bash
sudo find / -name "index.html" 2>/dev/null
sudo nginx -T | grep root
```

## Security Notes

1. Ensure proper file permissions (755 for directories, 644 for files)
2. Keep backups before making changes
3. Test configuration changes before restarting nginx
4. Monitor logs for any issues

## Support

If you encounter issues:
1. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
2. Run diagnostic script: `./diagnose-server.sh`
3. Check file permissions: `ls -la /var/www/html/`
4. Verify nginx configuration: `sudo nginx -t`

## Expected Results After Fix

- ✅ `ai-models-download.html` shows 50+ models page (not index.html)
- ✅ `download_models_windows.bat` downloads as file
- ✅ `download_ollama_models.sh` downloads as file  
- ✅ All navigation links work properly
- ✅ No more page redirects to index.html