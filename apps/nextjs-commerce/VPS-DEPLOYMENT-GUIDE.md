# 🚀 GOAT Royalty App - VPS Production Deployment Guide

## Overview
This guide provides complete instructions for deploying the GOAT Royalty App to your Hostinger VPS with RAID 0 security architecture and production-grade configuration.

## Your VPS Information
- **IP Address**: 93.127.214.171
- **Expiration**: 2026-04-20
- **OS**: Kali Linux
- **Repository**: DJSPEEDYGA/GOAT-Royalty-App

## Quick Deployment (Recommended)

### Option 1: One-Click Deployment (Easiest)

1. **SSH into your VPS:**
   ```bash
   ssh root@93.127.214.171
   ```

2. **Clone the repository and deploy:**
   ```bash
   git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git /tmp/deploy
   cd /tmp/deploy
   chmod +x quick-deploy.sh
   sudo ./quick-deploy.sh
   ```

3. **Access your app:**
   - Open your browser: `http://93.127.214.171`

### Option 2: Automated Deployment Script

1. **Download and run the quick deployment:**
   ```bash
   ssh root@93.127.214.171
   wget https://raw.githubusercontent.com/DJSPEEDYGA/GOAT-Royalty-App/main/quick-deploy.sh
   chmod +x quick-deploy.sh
   sudo ./quick-deploy.sh
   ```

### Option 3: Full Production Setup (Advanced)

If you need SSL certificates and advanced configuration:

```bash
ssh root@93.127.214.171
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git /tmp/deploy
cd /tmp/deploy
chmod +x production-setup.sh
sudo ./production-setup.sh
```

## What the Deployment Does

### RAID 0 Data Architecture
The deployment creates a secure data separation architecture:

```
/raid0/
├── incoming/              # INCOMING data streams
│   ├── streams/          # Real-time data streams
│   ├── uploads/          # User uploads (500MB max)
│   ├── api-inputs/       # API request data
│   ├── webhooks/         # Incoming webhooks
│   └── metrics/          # Incoming metrics
├── outgoing/              # OUTGOING data
│   ├── exports/          # Data exports
│   ├── reports/          # Generated reports
│   ├── api-outputs/      # API responses
│   ├── backups/          # Automated backups
│   └── logs/             # Application logs
└── app/                   # Application files
    ├── logs/             # App logs
    └── keys/             # Encryption keys
```

### Security Features
- ✅ **UFW Firewall** - Configured to allow only necessary ports (22, 80, 443)
- ✅ **Fail2Ban** - Protects against brute force attacks
- ✅ **Rate Limiting** - Prevents DDoS attacks via Nginx
- ✅ **Security Headers** - XSS, clickjacking protection
- ✅ **RAID 0 Data Separation** - INCOMING/OUTGOING isolation
- ✅ **Systemd Service** - Automatic restart on failure
- ✅ **Monitoring** - Health checks and logging
- ✅ **SSL/TLS** - Optional Let's Encrypt certificates

### Service Management

#### GOAT Royalty App Service
```bash
# Start service
systemctl start goat-royalty

# Stop service
systemctl stop goat-royalty

# Restart service
systemctl restart goat-royalty

# Check status
systemctl status goat-royalty

# View logs
journalctl -u goat-royalty -f
tail -f /raid0/app/logs/app.log
```

#### Nginx Web Server
```bash
# Restart Nginx
systemctl restart nginx

# Check Nginx status
systemctl status nginx

# Test configuration
nginx -t

# View Nginx logs
tail -f /raid0/outgoing/logs/nginx_access.log
tail -f /raid0/outgoing/logs/nginx_error.log
```

#### Security Services
```bash
# Check firewall status
ufw status

# Check Fail2Ban status
fail2ban-client status

# View blocked IPs
fail2ban-client status sshd
```

## Access Your App

After deployment, your app will be accessible at:
- **HTTP**: http://93.127.214.171
- **Health Check**: http://93.127.214.171/health

## Troubleshooting

### App Not Starting
```bash
# Check service status
systemctl status goat-royalty

# View logs
journalctl -u goat-royalty -n 50

# Check if port is in use
netstat -tulpn | grep 3000
```

### Nginx Issues
```bash
# Test Nginx configuration
nginx -t

# View Nginx error log
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### Permission Issues
```bash
# Fix permissions
chown -R root:root /raid0/app
chmod -R 755 /raid0/app
chmod 700 /raid0/keys
```

### Firewall Blocking Connections
```bash
# Check firewall status
ufw status verbose

# Allow port if needed
ufw allow 80/tcp
ufw allow 443/tcp
```

## SSL Certificate Setup (Optional)

### Using Let's Encrypt (Free SSL)
```bash
# Install certbot
apt-get install -y certbot python3-certbot-nginx

# Obtain certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test SSL renewal
certbot renew --dry-run
```

### Self-Signed Certificate (For Testing)
```bash
mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/privkey.pem \
  -out /etc/nginx/ssl/fullchain.pem \
  -subj "/C=US/ST=State/L=City/O=GOAT/CN=93.127.214.171"
```

## Performance Optimization

### Enable Caching
Add to Nginx configuration:
```nginx
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Enable Gzip Compression
Add to Nginx configuration:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

## Monitoring & Maintenance

### Health Check
```bash
curl http://93.127.214.171/health
```

### View Logs
```bash
# Real-time log monitoring
tail -f /raid0/app/logs/app.log

# Search for errors
grep -i error /raid0/app/logs/app.log

# Check system resources
htop
df -h /raid0
free -h
```

### Backup Strategy
```bash
# Create backup
tar -czf /backup/goat-royalty-$(date +%Y%m%d).tar.gz /raid0/

# Automated backup (add to crontab)
crontab -e
# Add: 0 2 * * * /raid0/app/backup.sh
```

## Post-Deployment Checklist

- [ ] App is accessible at http://93.127.214.171
- [ ] Health check endpoint returns "healthy"
- [ ] All app features are working
- [ ] Systemd service is active
- [ ] Nginx is running and serving traffic
- [ ] Firewall is configured correctly
- [ ] Logs are being written
- [ ] SSL certificate is configured (if needed)
- [ ] Backup strategy is in place
- [ ] Monitoring is set up

## Next Steps

1. ✅ Deploy using quick-deploy.sh
2. ✅ Verify app accessibility
3. ✅ Test all app features
4. ⏳ Configure domain name (optional)
5. ⏳ Setup SSL certificates (optional)
6. ⏳ Configure automated backups
7. ⏳ Setup monitoring alerts

## Support

For issues or questions:
1. Check the logs: `/raid0/app/logs/`
2. Review troubleshooting section above
3. Check service status: `systemctl status goat-royalty`
4. Verify Nginx configuration: `nginx -t`

## Quick Reference

```bash
# SSH into VPS
ssh root@93.127.214.171

# Restart app
systemctl restart goat-royalty

# Restart Nginx
systemctl restart nginx

# View logs
tail -f /raid0/app/logs/app.log

# Check service status
systemctl status goat-royalty

# Test deployment
curl -I http://93.127.214.171
```

---

**Deployment Status**: Ready for production deployment
**Last Updated**: 2025-01-18
**Version**: 1.0.0
**Repository**: DJSPEEDYGA/GOAT-Royalty-App