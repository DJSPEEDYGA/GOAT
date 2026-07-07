const express = require('express');
const Artist = require('../models/Artist');
const User = require('../models/User');
const { protect, authorize, checkArtistAccess } = require('../middleware/auth');
const { 
  validateArtistCreate, 
  validateArtistUpdate,
  validateMongoId,
  validatePagination,
  validateDateRange
} = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Get all artists
// @route   GET /api/artists
// @access  Private
router.get('/', 
  protect, 
  validatePagination,
  validateDateRange,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true };
    
    // Add date range filter
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
    }

    // Add search filter
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Add genre filter
    if (req.query.genre) {
      query.genre = { $in: [req.query.genre] };
    }

    // For artists, only show their own profile
    if (req.user.role === 'artist' && req.artistProfile) {
      query._id = req.artistProfile._id;
    }

    const artists = await Artist.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Artist.countDocuments(query);

    res.json({
      success: true,
      data: {
        artists: artists.map(artist => artist.getSummary()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  })
);

// @desc    Get single artist
// @route   GET /api/artists/:id
// @access  Private
router.get('/:id', 
  protect, 
  validateMongoId('id'),
  checkArtistAccess,
  asyncHandler(async (req, res) => {
    const artist = await Artist.findById(req.params.id)
      .populate('user', 'username email profile')
      .populate('contracts');

    if (!artist) {
      throw new AppError('Artist not found', 404);
    }

    res.json({
      success: true,
      data: {
        artist
      }
    });
  })
);

// @desc    Create artist
// @route   POST /api/artists
// @access  Private/Admin/Manager
router.post('/', 
  protect, 
  authorize('admin', 'manager'),
  validateArtistCreate,
  asyncHandler(async (req, res) => {
    const { name, email, userId, ...artistData } = req.body;

    // Check if artist already exists
    const existingArtist = await Artist.findOne({ name });
    if (existingArtist) {
      throw new AppError('Artist with this name already exists', 400);
    }

    // If userId provided, verify user exists
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      artistData.user = userId;
    } else {
      artistData.user = req.user.id;
    }

    const artist = await Artist.create(artistData);

    // Calculate initial earnings
    await artist.calculateTotalEarnings();

    res.status(201).json({
      success: true,
      message: 'Artist created successfully',
      data: {
        artist: artist.getSummary()
      }
    });
  })
);

// @desc    Update artist
// @route   PUT /api/artists/:id
// @access  Private
router.put('/:id', 
  protect, 
  validateMongoId('id'),
  validateArtistUpdate,
  checkArtistAccess,
  asyncHandler(async (req, res) => {
    const artist = await Artist.findById(req.params.id);

    if (!artist) {
      throw new AppError('Artist not found', 404);
    }

    // Check if new name conflicts with existing artist
    if (req.body.name && req.body.name !== artist.name) {
      const existingArtist = await Artist.findOne({ 
        name: req.body.name,
        _id: { $ne: req.params.id }
      });
      if (existingArtist) {
        throw new AppError('Artist with this name already exists', 400);
      }
    }

    // Update artist
    Object.assign(artist, req.body);
    await artist.save();

    res.json({
      success: true,
      message: 'Artist updated successfully',
      data: {
        artist: artist.getSummary()
      }
    });
  })
);

// @desc    Delete artist (soft delete)
// @route   DELETE /api/artists/:id
// @access  Private/Admin/Manager
router.delete('/:id', 
  protect, 
  authorize('admin', 'manager'),
  validateMongoId('id'),
  asyncHandler(async (req, res) => {
    const artist = await Artist.findById(req.params.id);

    if (!artist) {
      throw new AppError('Artist not found', 404);
    }

    // Soft delete
    artist.isActive = false;
    await artist.save();

    res.json({
      success: true,
      message: 'Artist deleted successfully'
    });
  })
);

// @desc    Get artist earnings summary
// @route   GET /api/artists/:id/earnings
// @access  Private
router.get('/:id/earnings', 
  protect, 
  validateMongoId('id'),
  validateDateRange,
  checkArtistAccess,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const Royalty = require('../models/Royalty');
    const Payment = require('../models/Payment');

    const [royaltySummary, paymentSummary] = await Promise.all([
      Royalty.getArtistSummary(req.params.id, startDate, endDate),
      Payment.getPaymentSummary(req.params.id, startDate, endDate)
    ]);

    res.json({
      success: true,
      data: {
        royalties: royaltySummary,
        payments: paymentSummary,
        totalEarnings: royaltySummary.totalRoyalties,
        pendingPayments: royaltySummary.pendingAmount,
        netEarnings: paymentSummary.completedPayments
      }
    });
  })
);

// @desc    Get artist royalty history
// @route   GET /api/artists/:id/royalties
// @access  Private
router.get('/:id/royalties', 
  protect, 
  validateMongoId('id'),
  validatePagination,
  validateDateRange,
  checkArtistAccess,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const Royalty = require('../models/Royalty');
    
    // Build query
    const query = { artist: req.params.id };
    
    if (req.query.startDate || req.query.endDate) {
      query.periodStart = {};
      if (req.query.startDate) query.periodStart.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.periodStart.$lte = new Date(req.query.endDate);
    }

    // Add status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    const royalties = await Royalty.find(query)
      .populate('createdBy', 'username')
      .sort({ periodStart: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Royalty.countDocuments(query);

    res.json({
      success: true,
      data: {
        royalties,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  })
);

module.exports = router;