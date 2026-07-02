# GOAT Royalty App - Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose installed on your server
- Git to clone the repository
- API keys for Supabase and Google Gemini

### Step 1: Clone the Repository

```bash
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2
```

### Step 2: Create Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual API keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xmvlnonsxmrpvlssjstl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_AI_API_KEY=your-google-ai-api-key
NODE_ENV=production
```

### Step 3: Deploy

```bash
./deploy-docker.sh
```

Or manually:

```bash
docker-compose up -d --build
```

### Step 4: Verify

Check that the application is running:

```bash
curl http://localhost:3000/api/health
```

You should see:
```json
{"status":"ok","timestamp":"...","service":"GOAT Royalty App","version":"1.0.0"}
```

## Server Deployment (Hostinger VPS)

### On your VPS (93.127.214.171):

1. **Install Docker** (if not already installed):
```bash
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER
```

2. **Clone and Deploy**:
```bash
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git
cd GOAT-Royalty-App2
cp .env.example .env.local
nano .env.local  # Add your API keys
./deploy-docker.sh
```

3. **The app will be available at**:
   - Port 3000 (direct): http://93.127.214.171:3000
   - Port 80 (via Nginx): http://93.127.214.171

## Useful Commands

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start containers in background |
| `docker-compose down` | Stop and remove containers |
| `docker-compose logs -f` | View live logs |
| `docker-compose restart` | Restart all containers |
| `docker-compose ps` | List running containers |
| `docker-compose build --no-cache` | Rebuild without cache |

## Troubleshooting

### Port Already in Use
If port 3000 is in use by another process:
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>

# Or change the port in docker-compose.yml
```

### Container Won't Start
Check the logs:
```bash
docker-compose logs goat-royalty-app
```

### Build Fails
Try clearing Docker cache:
```bash
docker system prune -a
docker-compose build --no-cache
```

## File Structure

```
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker Compose configuration
├── nginx.conf              # Nginx reverse proxy config
├── deploy-docker.sh        # Quick deployment script
├── .env.example            # Environment template
└── pages/api/health.js     # Health check endpoint
```

## Production Considerations

1. **SSL/HTTPS**: Use Let's Encrypt with Certbot
2. **Domain**: Point your domain to the server IP
3. **Firewall**: Open ports 80 and 443
4. **Backups**: Regular backups of your data
5. **Monitoring**: Set up health monitoring

## Support

For issues or questions, contact: contact@goatroyaltyapp.com