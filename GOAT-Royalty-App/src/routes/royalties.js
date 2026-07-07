const express = require('express');
const Royalty = require('../models/Royalty');
const { protect, authorize, checkArtistAccess } = require('../middleware/auth');
const { 
  validateRoyaltyCreate,
  validateMongoId,
  validatePagination,
  validateDateRange
} = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Get all royalties
// @route   GET /api/royalties
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
    let query = {};
    
    // Add date range filter
    if (req.query.startDate || req.query.endDate) {
      query.periodStart = {};
      if (req.query.startDate) query.periodStart.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.periodStart.$lte = new Date(req.query.endDate);
    }

    // Add artist filter for artists (only their own royalties)
    if (req.user.role === 'artist' && req.artistProfile) {
      query.artist = req.artistProfile._id;
    } else if (req.query.artist) {
      query.artist = req.query.artist;
    }

    // Add status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Add source filter
    if (req.query.source) {
      query.source = req.query.source;
    }

    // Add work type filter
    if (req.query.workType) {
      query.workType = req.query.workType;
    }

    const royalties = await Royalty.find(query)
      .populate('artist', 'name email')
      .populate('createdBy', 'username')
      .populate('approvedBy', 'username')
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

// @desc    Get single royalty
// @route   GET /api/royalties/:id
// @access  Private
router.get('/:id', 
  protect, 
  validateMongoId('id'),
  asyncHandler(async (req, res) => {
    const royalty = await Royalty.findById(req.params.id)
      .populate('artist', 'name email user')
      .populate('contract', 'title contractNumber')
      .populate('createdBy', 'username profile')
      .populate('approvedBy', 'username')
      .populate('payments');

    if (!royalty) {
      throw new AppError('Royalty not found', 404);
    }

    // Check artist access
    if (req.user.role === 'artist' && req.artistProfile) {
      if (royalty.artist._id.toString() !== req.artistProfile._id.toString()) {
        throw new AppError('Not authorized to access this royalty', 403);
      }
    }

    res.json({
      success: true,
      data: {
        royalty
      }
    });
  })
);

// @desc    Create royalty
// @route   POST /api/royalties
// @access  Private/Admin/Manager
router.post('/', 
  protect, 
  authorize('admin', 'manager'),
  validateRoyaltyCreate,
  asyncHandler(async (req, res) => {
    const royaltyData = {
      ...req.body,
      createdBy: req.user.id
    };

    const royalty = await Royalty.create(royaltyData);

    // Update artist earnings
    const Artist = require('../models/Artist');
    const artist = await Artist.findById(royalty.artist);
    if (artist) {
      await artist.calculateTotalEarnings();
    }

    res.status(201).json({
      success: true,
      message: 'Royalty created successfully',
      data: {
        royalty: await Royalty.findById(royalty._id)
          .populate('artist', 'name email')
          .populate('createdBy', 'username')
      }
    });
  })
);

// @desc    Update royalty
// @route   PUT /api/royalties/:id
// @access  Private/Admin/Manager
router.put('/:id', 
  protect, 
  authorize('admin', 'manager'),
  validateMongoId('id'),
  asyncHandler(async (req, res) => {
    const royalty = await Royalty.findById(req.params.id);

    if (!royalty) {
      throw new AppError('Royalty not found', 404);
    }

    // Don't allow updates to approved royalties
    if (royalty.status === 'approved' || royalty.status === 'paid') {
      throw new AppError('Cannot update approved or paid royalties', 400);
    }

    // Update royalty
    Object.assign(royalty, req.body);
    await royalty.save();

    res.json({
      success: true,
      message: 'Royalty updated successfully',
      data: {
        royalty: await Royalty.findById(royalty._id)
          .populate('artist', 'name email')
          .populate('createdBy', 'username')
      }
    });
  })
);

// @desc    Approve royalty
// @route   PUT /api/royalties/:id/approve
// @access  Private/Admin/Manager
router.put('/:id/approve', 
  protect, 
  authorize('admin', 'manager'),
  validateMongoId('id'),
  asyncHandler(async (req, res) => {
    const royalty = await Royalty.findById(req.params.id);

    if (!royalty) {
      throw new AppError('Royalty not found', 404);
    }

    if (royalty.status !== 'pending') {
      throw new AppError('Royalty is not pending approval', 400);
    }

    await royalty.approve(req.user.id);

    res.json({
      success: true,
      message: 'Royalty approved successfully',
      data: {
        royalty
      }
    });
  })
);

// @desc    Delete royalty
// @route   DELETE /api/royalties/:id
// @access  Private/Admin/Manager
router.delete('/:id', 
  protect, 
  authorize('admin', 'manager'),
  validateMongoId('id'),
  asyncHandler(async (req, res) => {
    const royalty = await Royalty.findById(req.params.id);

    if (!royalty) {
      throw new AppError('Royalty not found', 404);
    }

    // Don't allow deletion of approved or paid royalties
    if (royalty.status === 'approved' || royalty.status === 'paid') {
      throw new AppError('Cannot delete approved or paid royalties', 400);
    }

    await Royalty.findByIdAndDelete(req.params.id);

    // Update artist earnings
    const Artist = require('../models/Artist');
    const artist = await Artist.findById(royalty.artist);
    if (artist) {
      await artist.calculateTotalEarnings();
    }

    res.json({
      success: true,
      message: 'Royalty deleted successfully'
    });
  })
);

// @desc    Get royalty analytics
// @route   GET /api/royalties/analytics
// @access  Private
router.get('/analytics', 
  protect, 
  validateDateRange,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    let matchStage = {};
    
    if (startDate || endDate) {
      matchStage.periodStart = {};
      if (startDate) matchStage.periodStart.$gte = new Date(startDate);
      if (endDate) matchStage.periodStart.$lte = new Date(endDate);
    }

    // Artist filter for artists
    if (req.user.role === 'artist' && req.artistProfile) {
      matchStage.artist = req.artistProfile._id;
    }

    const analytics = await Royalty.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRoyalties: { $sum: '$amount' },
          totalPending: { $sum: '$pendingAmount' },
          totalPaid: { $sum: '$paidAmount' },
          averageRoyalty: { $avg: '$amount' },
          count: { $sum: 1 },
          bySource: {
            $push: {
              source: '$source',
              amount: '$amount'
            }
          },
          byStatus: {
            $push: {
              status: '$status',
              amount: '$amount'
            }
          }
        }
      }
    ]);

    const summary = analytics[0] || {
      totalRoyalties: 0,
      totalPending: 0,
      totalPaid: 0,
      averageRoyalty: 0,
      count: 0,
      bySource: [],
      byStatus: []
    };

    // Group by source
    const sourceSummary = summary.bySource.reduce((acc, item) => {
      if (!acc[item.source]) {
        acc[item.source] = 0;
      }
      acc[item.source] += item.amount;
      return acc;
    }, {});

    // Group by status
    const statusSummary = summary.byStatus.reduce((acc, item) => {
      if (!acc[item.status]) {
        acc[item.status] = { count: 0, amount: 0 };
      }
      acc[item.status].count += 1;
      acc[item.status].amount += item.amount;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        summary: {
          totalRoyalties: summary.totalRoyalties,
          totalPending: summary.totalPending,
          totalPaid: summary.totalPaid,
          averageRoyalty: summary.averageRoyalty,
          count: summary.count
        },
        bySource: sourceSummary,
        byStatus: statusSummary
      }
    });
  })
);

module.exports = router;