const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Continue without user if token is invalid
      req.user = null;
    }
  }

  next();
};

// Check if user owns the resource or is admin/manager
const checkOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    // Admin and managers can access all resources
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      return next();
    }

    // Check if user owns the resource
    if (req.resource && req.resource[resourceField] && 
        req.resource[resourceField].toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }

    next();
  };
};

// Rate limiting for auth routes
const createAuthLimiter = (windowMs, max, message) => {
  const rateLimit = require('express-rate-limit');
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Email verification middleware
const requireEmailVerification = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required. Please verify your email address.'
    });
  }
  next();
};

// Artist access check - allows artists to access their own data
const checkArtistAccess = async (req, res, next) => {
  const Artist = require('../models/Artist');
  
  try {
    // Admin and managers can access all artist data
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      return next();
    }

    // For artists, check if they're accessing their own data
    if (req.user.role === 'artist') {
      const artist = await Artist.findOne({ user: req.user.id });
      
      if (!artist) {
        return res.status(403).json({
          success: false,
          message: 'Artist profile not found'
        });
      }

      // Add artist to request for use in controllers
      req.artistProfile = artist;

      // Check if accessing own artist data
      if (req.params.artistId && req.params.artistId !== artist._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this artist data'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Artist access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking artist access'
    });
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  checkOwnership,
  createAuthLimiter,
  requireEmailVerification,
  checkArtistAccess
};