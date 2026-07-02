# 🐐 DEPLOY TO YOUR SERVERS - NOT VERCEL!

## ⚠️ STOP VERCEL DEPLOYMENTS

### Why NOT Vercel?
- ❌ Costs money
- ❌ You don't control the server
- ❌ Limited resources
- ❌ .env ignored
- ❌ Not private/secure

### Why YOUR Servers?
- ✅ You own the hardware
- ✅ 386GB storage (Server 1)
- ✅ Full control
- ✅ Private & secure
- ✅ No ongoing costs
- ✅ Gaming capabilities

---

## 🚀 DEPLOY TO SERVER 1 (93.127.214.171)

### SSH into your server:
```bash
ssh root@93.127.214.171
```

### Run these commands:
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Clone repository
cd /opt
git clone https://github.com/DJSPEEDYGA/nextjs-commerce.git

# Install dependencies
cd /opt/nextjs-commerce
npm install

# Create logs directory
mkdir -p logs

# Start services in background
nohup node simple-server.js > logs/simple-server.log 2>&1 &
nohup node web-app/goat-mining-server.js > logs/mining-server.log 2>&1 &

# Check services
ps aux | grep node
```

---

## 🎮 DEPLOY TO SERVER 2 (72.61.193.184)

### SSH into your gaming server:
```bash
ssh root@72.61.193.184
```

### Run these commands:
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install -y docker-compose

# Clone repository
cd /opt
git clone https://github.com/DJSPEEDYGA/nextjs-commerce.git

# Install dependencies
cd /opt/nextjs-commerce
npm install

# Start base services
nohup node simple-server.js > logs/simple-server.log 2>&1 &
```

---

## 🔧 REMOVE VERCEL INTEGRATION

### Option 1: From Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Find `nextjs-commerce` project
3. Delete project

### Option 2: From GitHub Settings
1. Go to https://github.com/DJSPEEDYGA/nextjs-commerce/settings
2. Click "Integrations & services"
3. Remove Vercel

---

## 📋 VERIFY DEPLOYMENT

### Check Server 1:
```bash
curl http://93.127.214.171:3000
curl http://93.127.214.171:3002
```

### Check Server 2:
```bash
curl http://72.61.193.184:3000
```

---

## 🌐 CONFIGURE DOMAIN (Optional)

If you have a domain for GOAT Royalty, point it to:
- **Main Server:** 93.127.214.171
- **Gaming Server:** 72.61.193.184

---

## 🎯 NEXT STEPS

1. **Remove Vercel integration** from GitHub
2. **Deploy to your servers** using commands above
3. **Configure your domain** (if you have one)
4. **Set up SSL certificates** (optional)
5. **Configure firewall rules**

---

**No more unwanted Vercel deployments!** 🐐✨