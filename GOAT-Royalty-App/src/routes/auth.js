const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { 
  validateUserRegistration, 
  validateUserLogin, 
  validateUserUpdate
} = require('../middleware/validation');
const { createAuthLimiter } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', 
  createAuthLimiter(15 * 60 * 1000, 5, 'Too many registration attempts, please try again later'),
  validateUserRegistration,
  asyncHandler(async (req, res) => {
    const { username, email, password, role, profile } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      throw new AppError('User with this email or username already exists', 400);
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'artist',
      profile
    });

    // Generate token
    const token = generateToken(user._id);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.getProfile(),
        token
      }
    });
  })
);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', 
  createAuthLimiter(15 * 60 * 1000, 5, 'Too many login attempts, please try again later'),
  validateUserLogin,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getProfile(),
        token
      }
    });
  })
);

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: {
      user: user.getProfile()
    }
  });
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', 
  protect, 
  validateUserUpdate,
  asyncHandler(async (req, res) => {
    const { username, email, profile, preferences } = req.body;
    
    // Check if username/email is taken by another user
    if (username || email) {
      const existingUser = await User.findOne({
        _id: { $ne: req.user.id },
        $or: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : [])
        ]
      });

      if (existingUser) {
        throw new AppError('Username or email already taken', 400);
      }
    }

    // Update user
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (profile) updateData.profile = { ...req.user.profile, ...profile };
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getProfile()
      }
    });
  })
);

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', 
  protect,
  [
    require('express-validator').body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    require('express-validator').body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
    require('../middleware/validation').handleValidationErrors
  ],
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  })
);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, asyncHandler(async (req, res) => {
  // Clear cookie
  res.cookie('token', 'none', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0)
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', 
  createAuthLimiter(15 * 60 * 1000, 3, 'Too many password reset attempts, please try again later'),
  [
    require('express-validator').body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    require('../middleware/validation').handleValidationErrors
  ],
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'Password reset email sent if user exists'
      });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15);
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // TODO: Send email with reset token
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  })
);

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', 
  createAuthLimiter(15 * 60 * 1000, 3, 'Too many password reset attempts, please try again later'),
  [
    require('express-validator').body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    require('express-validator').body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    require('../middleware/validation').handleValidationErrors
  ],
  asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    // Find user by token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  })
);

module.exports = router;