const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const artistRoutes = require('./routes/artists');
const royaltyRoutes = require('./routes/royalties');
const paymentRoutes = require('./routes/payments');
const reportRoutes = require('./routes/reports');
const agentRoutes = require('./routes/agent');
const hostingerRoutes = require('./routes/hostinger');
const chatRoutes = require('./routes/chat');
const loyaltyRoutes = require('./routes/loyalty');
const activationRoutes = require('./routes/activation');
const { logger, intrusionCheck } = require('./middleware/loyalty');
const ragRoutes = require('./routes/rag');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// General Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Intrusion detection – applied globally before all API routes
app.use('/api/', intrusionCheck);

// Static files
app.use('/uploads', express.static('uploads'));

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/royalties', royaltyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/hostinger', hostingerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/activation', activationRoutes);
app.use('/api/rag', ragRoutes);

// 404 Handler - handled by express router

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;