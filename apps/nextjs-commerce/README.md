# 🐐 GOAT Royalty Management System

## 🎉 Complete Edition with Hostinger Integration & Brand Assets

A comprehensive, production-ready royalty management system with **autonomous AI agent capabilities**, **Hostinger API integration**, **professional brand videos**, and enterprise-grade features.

---

## 🌟 What's New in This Version?

### 🚀 Hostinger API Integration
- **8 New AI Agent Tools** for hosting automation
- **Domain Management** - DNS, SSL, email accounts
- **Hosting Monitoring** - Bandwidth, disk usage, performance
- **Database Management** - Create and manage databases
- **FTP Management** - File transfer automation
- **Automated SSL** - Certificate installation and renewal

### 🎬 Professional Brand Videos
- **15 High-Quality Videos** (249 MB total)
- **Main Brand Videos** - 4 promotional videos
- **Animated Sequences** - 11 flying GOAT animations
- **Video Gallery Component** - Built-in video management
- **Optimized for Web** - Multiple formats and sizes

### 🛠️ Integration Tools Support
- **NVIDIA AI Workbench** - AI development platform
- **Google Gemini Copilot** - AI coding assistant
- **DP Animation Maker** - Professional animation software
- **Elgato Wave Link** - Audio production tool
- **Elgato Stream Deck** - Workflow automation

---

## 🤖 Autonomous AI Agent System

The crown jewel of this system - an intelligent AI agent that can:
- **Execute complex tasks autonomously** with 23+ specialized tools (15 core + 8 Hostinger)
- **Make intelligent decisions** based on context and data
- **Process natural language commands** ("Analyze all royalties this month")
- **Manage hosting infrastructure** automatically
- **Run predefined workflows** (monthly close, quarterly reports, domain setup)
- **Optimize operations** (payment schedules, revenue forecasting, resource allocation)
- **Handle multi-step processes** without human intervention

### Available AI Agent Tools

#### Core Tools (15)
1. **analyze_royalties** - Analyze royalty data for patterns and insights
2. **process_payment** - Process payments to artists
3. **generate_report** - Generate comprehensive reports (PDF, Excel, CSV)
4. **send_email** - Send emails to artists or stakeholders
5. **query_database** - Query the database for specific information
6. **calculate_royalties** - Calculate royalty distributions
7. **optimize_payments** - Optimize payment schedules
8. **predict_revenue** - Predict future revenue trends
9. **send_notification** - Send in-app notifications
10. **export_data** - Export data in various formats
11. **sync_platform_data** - Sync data from external platforms
12. **analyze_contract** - Analyze contract terms
13. **check_compliance** - Check regulatory compliance
14. **search_web** - Search the web for information
15. **execute_workflow** - Execute predefined workflows

#### Hostinger Tools (8)
16. **manage_domain** - Manage domains and DNS records
17. **manage_ssl** - Install and manage SSL certificates
18. **manage_email** - Create and manage email accounts
19. **get_hosting_stats** - Monitor hosting performance
20. **manage_database** - Create and manage databases
21. **manage_ftp** - Manage FTP accounts
22. **check_domain_availability** - Check domain availability
23. **get_account_info** - Get Hostinger account information

---

## 🏗️ Architecture

### Backend (Node.js/Express)
- **RESTful API** with Express 5.2.1
- **MongoDB** with Mongoose 9.0.0
- **JWT Authentication** with role-based access control
- **Rate Limiting** and security middleware
- **Hostinger API Service** for hosting management
- **Autonomous Agent System** with 23+ tools

### Frontend (Next.js/React)
- **Next.js 16** with React 19
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Radix UI** components
- **Video Gallery** for brand assets
- **Real-time Dashboard** with analytics

### Desktop App (Electron)
- **Cross-platform** (Windows, macOS, Linux)
- **Native performance**
- **Offline capabilities**
- **Auto-updates**

---

## 📦 Quick Start

### Prerequisites
- Node.js 20.x or later
- MongoDB 7.0 or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git
cd GOAT-Royalty-App

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

### Environment Configuration

Create a `.env` file with the following:

```bash
# Server Configuration
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/royalty-app

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

# AI Providers
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
COHERE_API_KEY=your-cohere-api-key

# Hostinger API
HOSTINGER_API_TOKEN=your-hostinger-api-token

# CORS
CLIENT_URL=http://localhost:3000
```

---

## 🚀 Deployment

### VPS Deployment (Ubuntu 24.04.3 LTS)

See [VPS_DEPLOYMENT_GUIDE.md](VPS_DEPLOYMENT_GUIDE.md) for complete instructions.

**Quick Deploy:**
```bash
# On your VPS (93.127.214.171)
ssh root@93.127.214.171

# Clone and setup
git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App.git
cd GOAT-Royalty-App
npm install
cd client && npm install && npm run build && cd ..

# Configure environment
nano .env

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
```

### Hostinger Integration

See [HOSTINGER_INTEGRATION_GUIDE.md](HOSTINGER_INTEGRATION_GUIDE.md) for complete instructions.

**Quick Setup:**
1. Get your Hostinger API token
2. Add to `.env`: `HOSTINGER_API_TOKEN=your-token`
3. Test connection: `GET /api/hostinger/test`

---

## 📚 Documentation

- **[VPS Deployment Guide](VPS_DEPLOYMENT_GUIDE.md)** - Complete VPS setup instructions
- **[Hostinger Integration Guide](HOSTINGER_INTEGRATION_GUIDE.md)** - Hostinger API documentation
- **[Integration Tools Guide](INTEGRATION_TOOLS_GUIDE.md)** - Third-party tools setup
- **[Autonomous Agent Guide](AUTONOMOUS_AGENT_GUIDE.md)** - AI agent documentation
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference

---

## 🎬 Brand Assets

### Video Gallery

Access the video gallery at `/videos` or use the `VideoGallery` component:

```tsx
import VideoGallery from '@/components/VideoGallery';

export default function BrandingPage() {
  return <VideoGallery />;
}
```

### Video Categories
- **Main Videos** (4) - Primary brand promotional content
- **Animated Videos** (11) - Flying GOAT animations

All videos are located in `public/videos/branding/` with metadata in `index.json`.

---

## 🛠️ Integration Tools

### Supported Tools
1. **NVIDIA AI Workbench** (116 MB) - AI development
2. **Google Gemini Copilot** (13 KB) - Coding assistant
3. **DP Animation Maker** (28 MB) - Animation creation
4. **Elgato Wave Link** (136 MB) - Audio production
5. **Elgato Stream Deck** (250 MB) - Workflow automation

See [INTEGRATION_TOOLS_GUIDE.md](INTEGRATION_TOOLS_GUIDE.md) for setup instructions.

---

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Role-Based Access Control** (Admin, Manager, Artist, Viewer)
- **Rate Limiting** to prevent abuse
- **Input Validation** with express-validator
- **Security Headers** with Helmet
- **CORS Protection** with configurable origins
- **Password Hashing** with bcrypt
- **Environment Variable Protection**

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Artists
- `GET /api/artists` - List all artists
- `POST /api/artists` - Create artist
- `GET /api/artists/:id` - Get artist details
- `PUT /api/artists/:id` - Update artist
- `DELETE /api/artists/:id` - Delete artist

### Royalties
- `GET /api/royalties` - List royalties
- `POST /api/royalties` - Create royalty
- `GET /api/royalties/:id` - Get royalty details
- `PUT /api/royalties/:id` - Update royalty
- `DELETE /api/royalties/:id` - Delete royalty

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Process payment
- `GET /api/payments/:id` - Get payment details

### Reports
- `GET /api/reports/dashboard` - Dashboard analytics
- `POST /api/reports/generate` - Generate report
- `GET /api/reports/earnings` - Earnings report

### Autonomous Agent
- `POST /api/agent/execute` - Execute custom task
- `POST /api/agent/chat` - Chat with agent
- `POST /api/agent/tasks/:taskName` - Run predefined task
- `GET /api/agent/status/:agentId` - Get agent status
- `GET /api/agent/capabilities` - List agent tools

### Hostinger
- `GET /api/hostinger/test` - Test API connection
- `GET /api/hostinger/domains` - List domains
- `GET /api/hostinger/domains/:domain/dns` - Get DNS records
- `POST /api/hostinger/domains/:domain/dns` - Create DNS record
- `GET /api/hostinger/domains/:domain/ssl` - Get SSL info
- `POST /api/hostinger/domains/:domain/ssl` - Install SSL
- `GET /api/hostinger/hosting/stats` - Get hosting stats

---

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd client && npm test

# Run integration tests
npm run test:integration
```

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

## 📄 License

ISC License - See LICENSE file for details

---

## 🆘 Support

- **GitHub Issues:** https://github.com/DJSPEEDYGA/GOAT-Royalty-App/issues
- **Email:** support@goatroyaltyapp.com
- **Documentation:** See guides in repository

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Blockchain integration for transparent royalty tracking
- [ ] Advanced AI analytics with predictive modeling
- [ ] Multi-currency support
- [ ] International payment gateways
- [ ] Advanced reporting with custom templates
- [ ] Real-time collaboration features

---

## ✨ Credits

Developed by **DJSPEEDYGA**

Special thanks to:
- OpenAI for GPT-4
- Google for Gemini AI
- Anthropic for Claude
- Hostinger for API access
- All open-source contributors

---

**© 2024 GOAT Royalty App - All Rights Reserved**

**Version:** 2.0.0  
**Last Updated:** December 2, 2024  
**Status:** Production Ready ✅