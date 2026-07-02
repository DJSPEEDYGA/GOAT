# GOAT Royalty App - Deployment Guide

## Overview

This comprehensive guide covers the deployment of the GOAT Royalty App with all platform integrations and enhanced dashboard functionality.

## Prerequisites

### Development Environment
- Node.js 18+ 
- npm or yarn
- Git
- GitHub CLI (gh)
- PostgreSQL database
- Redis (for caching)
- AWS/Azure/GCP account (for cloud deployment)

### Platform API Keys
- TikTok Developer API credentials
- YouTube Data API v3 credentials
- Meta Graph API credentials (Instagram/Facebook)
- Spotify Web API credentials
- Adobe Creative SDK credentials

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/goat_royalty
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Platform APIs
TIKTOK_CLIENT_ID=your-tiktok-client-id
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
TIKTOK_REDIRECT_URI=http://localhost:3000/api/tiktok/callback

YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-client-secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback

META_CLIENT_ID=your-meta-client-id
META_CLIENT_SECRET=your-meta-client-secret
META_REDIRECT_URI=http://localhost:3000/api/meta/callback

SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback

ADOBE_CLIENT_ID=your-adobe-client-id
ADOBE_CLIENT_SECRET=your-adobe-client-secret
ADOBE_REDIRECT_URI=http://localhost:3000/api/adobe/callback

# AWS/Cloud Services
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=goat-royalty-app-uploads

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Local Development Setup

### 1. Clone and Install Dependencies
```bash
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2
npm install
```

### 2. Database Setup
```bash
# Install PostgreSQL and create database
createdb goat_royalty

# Run migrations (if using Prisma/Drizzle)
npx prisma migrate dev
# or
npm run db:migrate
```

### 3. Environment Configuration
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 4. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Production Deployment

### Option 1: Vercel Deployment (Recommended)

#### Prerequisites
- Vercel account
- Custom domain (optional)

#### Steps
1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

4. **Configure Environment Variables**
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# Add all other required environment variables
```

### Option 2: AWS Deployment

#### EC2 Setup
```bash
# Launch EC2 instance (Ubuntu 20.04+)
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install dependencies
sudo apt update
sudo apt install -y nodejs npm postgresql redis-server nginx

# Clone repository
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2

# Install dependencies
npm install
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/goat-royalty
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Systemd Service
```ini
# /etc/systemd/system/goat-royalty.service
[Unit]
Description=GOAT Royalty App
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/GOAT-Royalty-App2
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/home/ubuntu/GOAT-Royalty-App2/.env

[Install]
WantedBy=multi-user.target
```

#### Start Service
```bash
sudo systemctl enable goat-royalty
sudo systemctl start goat-royalty
sudo systemctl status goat-royalty
```

### Option 3: Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
      - redis
    env_file:
      - .env

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: goat_royalty
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

#### Deploy with Docker
```bash
docker-compose up -d --build
```

## Database Setup

### PostgreSQL Schema
```sql
-- Create database
CREATE DATABASE goat_royalty;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- TikTok integration tables
CREATE TABLE tiktok_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    tiktok_user_id VARCHAR(255) UNIQUE,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Similar tables for other platforms...
-- (Full schema in SQL-SCRIPTS.sql)
```

## Platform API Setup

### TikTok Developer Setup
1. Visit [TikTok Developer Portal](https://developers.tiktok.com)
2. Create a new app
3. Configure OAuth redirect URI
4. Get Client ID and Client Secret

### YouTube API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Configure redirect URI

### Meta API Setup (Instagram/Facebook)
1. Visit [Meta for Developers](https://developers.facebook.com)
2. Create new app
3. Add Instagram Basic Display and Graph API products
4. Configure OAuth redirect URI

### Spotify API Setup
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com)
2. Create new app
3. Set redirect URI
4. Get Client ID and Client Secret

### Adobe Creative SDK Setup
1. Visit [Adobe Developer Console](https://developer.adobe.com)
2. Create new project
3. Add Creative Cloud SDK
4. Configure OAuth credentials

## SSL/HTTPS Setup

### Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### Application Monitoring
```bash
# Install PM2 for process management
npm install -g pm2

# Start app with PM2
pm2 start npm --name "goat-royalty" -- start

# Monitor
pm2 monit

# Logs
pm2 logs goat-royalty
```

### Log Aggregation (Optional)
```bash
# Setup filebeat for log shipping
sudo apt install filebeat

# Configure /etc/filebeat/filebeat.yml
# Add your log shipping configuration
```

## Performance Optimization

### Next.js Optimization
```javascript
// next.config.js
module.exports = {
  // Enable experimental features
  experimental: {
    appDir: true,
  },
  
  // Optimization
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};
```

### Database Optimization
```sql
-- Create indexes for performance
CREATE INDEX idx_tiktok_accounts_user_id ON tiktok_accounts(user_id);
CREATE INDEX idx_tiktok_content_user_id ON tiktok_content(user_id);
CREATE INDEX idx_tiktok_content_tiktok_video_id ON tiktok_content(tiktok_video_id);

-- Analyze tables
ANALYZE;
```

## Security Configuration

### Security Headers
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
};
```

## Backup Strategy

### Database Backup
```bash
# Create backup script
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="goat_royalty"

pg_dump $DB_NAME > $BACKUP_DIR/goat_royalty_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "goat_royalty_*.sql" -mtime +7 -delete
```

### Automated Backups
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check firewall settings

2. **OAuth Authentication Failures**
   - Verify redirect URIs match exactly
   - Check API keys are correct
   - Ensure HTTPS is configured for production

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify environment variables

### Health Checks
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
}
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Implement session storage in Redis
- Database read replicas
- CDN for static assets

### Vertical Scaling
- Monitor resource usage
- Optimize database queries
- Implement caching strategies
- Use CDN for media files

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] API rate limits set
- [ ] Error logging configured

### Post-Deployment
- [ ] Verify all integrations working
- [ ] Check dashboard loading
- [ ] Test OAuth flows
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify backup process
- [ ] Update documentation
- [ ] Notify stakeholders

## Support and Maintenance

### Regular Tasks
- Weekly: Review logs and metrics
- Monthly: Update dependencies
- Quarterly: Security audit
- Yearly: Architecture review

### Emergency Procedures
- Database restoration
- Rollback procedures
- Contact information
- Incident response plan

---

For additional support or questions, refer to the project documentation or create an issue in the GitHub repository.