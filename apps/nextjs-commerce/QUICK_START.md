# 🚀 GOAT Royalty App - Quick Start Guide

## ⚡ Get Started in 5 Minutes

### 1. Clone & Install (2 minutes)
```bash
# Clone repository
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git
cd GOAT-Royalty-App

# Install dependencies
npm install
cd client && npm install && cd ..
```

### 2. Configure Environment (1 minute)
```bash
# Copy example environment file
cp .env.example .env

# Edit with your settings
nano .env
```

**Minimum Required Configuration:**
```bash
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/royalty-app
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:3000
HOSTINGER_API_TOKEN=u4WIezhO6K1Zv0ZXor4VMDHZNFzpKb3h0iNgdUpda243813a
```

### 3. Start Development (1 minute)
```bash
# Start both backend and frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- API Health: http://localhost:5001/api/health

### 4. Test Features (1 minute)
```bash
# Test Hostinger API
curl http://localhost:5001/api/hostinger/test

# View videos
# Navigate to: http://localhost:3000/videos
```

---

## 🎯 Key Features

### Hostinger Integration
- Domain management
- SSL certificates
- Email accounts
- Hosting monitoring

### Brand Videos
- 15 professional videos
- Video gallery component
- Optimized playback

### AI Agent
- 23 autonomous tools
- Natural language commands
- Automated workflows

---

## 📚 Documentation

- **[README.md](README.md)** - Complete overview
- **[VPS_DEPLOYMENT_GUIDE.md](VPS_DEPLOYMENT_GUIDE.md)** - Deploy to server
- **[HOSTINGER_INTEGRATION_GUIDE.md](HOSTINGER_INTEGRATION_GUIDE.md)** - API docs
- **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - What's new

---

## 🚀 Deploy to VPS

### Quick Deploy to 93.127.214.171
```bash
# SSH to VPS
ssh root@93.127.214.171

# Clone and setup
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git
cd GOAT-Royalty-App
npm install
cd client && npm install && npm run build && cd ..

# Configure
nano .env

# Start with PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

See [VPS_DEPLOYMENT_GUIDE.md](VPS_DEPLOYMENT_GUIDE.md) for complete instructions.

---

## 🆘 Need Help?

- **Issues:** https://github.com/DJSPEEDYGA/GOAT-Royalty-App/issues
- **Docs:** Check guides in repository
- **Email:** support@goatroyaltyapp.com

---

**Ready to go! 🎉**