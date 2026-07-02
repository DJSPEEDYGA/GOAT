const express = require('express');
const Payment = require('../models/Payment');
const Royalty = require('../models/Royalty');
const { protect, authorize, checkArtistAccess } = require('../middleware/auth');
const { 
  validatePaymentCreate,
  validateMongoId,
  validatePagination,
  validateDateRange
} = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Get all payments
// @route   GET /api/payments
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
      query.paymentDate = {};
      if (req.query.startDate) query.paymentDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.paymentDate.$lte = new Date(req.query.endDate);
    }

    // Add artist filter for artists (only their own payments)
    if (req.user.role === 'artist' && req.artistProfile) {
      query.artist = req.artistProfile._id;
    } else if (req.query.artist) {
      query.artist = req.query.artist;
    }

    // Add status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Add method filter
    if (req.query.method) {
      query.method = req.query.method;
    }

    const payments = await Payment.find(query)
      .populate('artist', 'name email')
      .populate('royalties.royalty', 'workTitle workType periodStart periodEnd')
      .populate('createdBy', 'username')
      .populate('processedBy', 'username')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: {
        payments,
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

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
router.get('/:id', 
  protect, 
  validateMongoId('id'),
  asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id)
      .populate('artist', 'name email user')
      .populate('royalties.royalty', 'workTitle workType amount')
      .populate('createdBy', 'username profile')
      .populate('processedBy', 'username');

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Check artist access
    if (req.user.role === 'artist' && req.artistProfile) {
      if (payment.artist._id.toString() !== req.artistProfile._id.toString()) {
        throw new AppError('Not authorized to access this payment', 403);
      }
    }

    res.json({
      success: true,
      data: {
        payment
      }
    });
  })
);

// @desc    Create payment
// @route   POST /api/payments
// @access  Private/Admin/Manager
router.post('/', 
  protect, 
  authorize('admin', 'manager'),
  validatePaymentCreate,
  asyncHandler(async (req, res) => {
    const { royalties, totalAmount, ...paymentData } = req.body;

    // Verify royalties exist and belong to the artist
    const royaltyIds = royalties.map(r => r.royalty);
    const royaltyDocs = await Royalty.find({ 
      _id: { $in: royaltyIds },
      artist: paymentData.artist 
    });

    if (royaltyDocs.length !== royaltyIds.length) {
      throw new AppError('One or more royalties not found or do not belong to the specified artist', 400);
    }

    // Check if royalties are already fully paid
    for (const royalty of royaltyDocs) {
      if (royalty.getPaymentStatus() === 'fully_paid') {
        throw new AppError(`Royalty for "${royalty.workTitle}" is already fully paid`, 400);
      }
    }

    // Validate total amount matches sum of royalty amounts
    const royaltyTotal = royalties.reduce((sum, r) => sum + r.amount, 0);
    if (Math.abs(royaltyTotal - totalAmount) > 0.01) {
      throw new AppError('Total amount does not match the sum of royalty amounts', 400);
    }

    const payment = await Payment.create({
      ...paymentData,
      royalties,
      createdBy: req.user.id
    });

    // Generate transaction ID
    payment.generateTransactionId();
    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: {
        payment: await Payment.findById(payment._id)
          .populate('artist', 'name email')
          .populate('royalties.royalty', 'workTitle workType')
          .populate('createdBy', 'username')
      }
    });
  })
);

// @desc    Process payment
// @route   PUT /api/payments/:id/process
// @access  Private/Admin/Manager
router.put('/:id/process', 
  protect, 
  authorize('admin', 'manager'),
  validateMongoId('id'),
  asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== 'pending') {
      throw new AppError('Payment is not pending', 400);
    }

    await payment.process(req.user.id);

    res.json({
      success: true,
      message: 'Payment processing started',
      data: {
        payment
      }
    });
  })
);

// @desc    Complete payment
// @route   PUT /api/payments/:id/complete
// @access  Private/Admin/Manager
router.put('/:id/complete', 
  protect, 
  authorize('admin', 'manager'),
  validateMongoId('id'),
  asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== 'processing') {
      throw new AppError('Payment is not being processed', 400);
    }

    await payment.complete();

    // Update artist earnings
    const Artist = require('../models/Artist');
    const artist = await Artist.findById(payment.artist);
    if (artist) {
      await artist.calculateTotalEarnings();
    }

    res.json({
      success: true,
      message: 'Payment completed successfully',
      data: {
        payment
      }
    });
  })
);

// @desc    Fail payment
// @route   PUT /api/payments/:id/fail
// @access  Private/Admin/Manager
router.put('/:id/fail', 
  protect, 
  authorize('admin', 'manager'),
  validateMongoId('id'),
  asyncHandler(async (req, res) => {
    const { reason } = req.body;

    if (!reason) {
      throw new AppError('Failure reason is required', 400);
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== 'processing') {
      throw new AppError('Payment is not being processed', 400);
    }

    await payment.fail(reason);

    res.json({
      success: true,
      message: 'Payment marked as failed',
      data: {
        payment
      }
    });
  })
);

// @desc    Refund payment
// @route   PUT /api/payments/:id/refund
// @access  Private/Admin/Manager
router.put('/:id/refund', 
  protect, 
  authorize('admin', 'manager'),
  validateMongoId('id'),
  asyncHandler(async (req, res) => {
    const { refundAmount, refundReason } = req.body;

    if (!refundAmount || !refundReason) {
      throw new AppError('Refund amount and reason are required', 400);
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== 'completed') {
      throw new AppError('Only completed payments can be refunded', 400);
    }

    if (refundAmount > payment.totalAmount) {
      throw new AppError('Refund amount cannot exceed payment total', 400);
    }

    await payment.refund(refundAmount, refundReason);

    // Update artist earnings
    const Artist = require('../models/Artist');
    const artist = await Artist.findById(payment.artist);
    if (artist) {
      await artist.calculateTotalEarnings();
    }

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      data: {
        payment
      }
    });
  })
);

// @desc    Get payment analytics
// @route   GET /api/payments/analytics
// @access  Private
router.get('/analytics', 
  protect, 
  validateDateRange,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    let matchStage = {};
    
    if (startDate || endDate) {
      matchStage.paymentDate = {};
      if (startDate) matchStage.paymentDate.$gte = new Date(startDate);
      if (endDate) matchStage.paymentDate.$lte = new Date(endDate);
    }

    // Artist filter for artists
    if (req.user.role === 'artist' && req.artistProfile) {
      matchStage.artist = req.artistProfile._id;
    }

    const analytics = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: '$totalAmount' },
          completedPayments: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$totalAmount', 0]
            }
          },
          pendingPayments: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, '$totalAmount', 0]
            }
          },
          processingPayments: {
            $sum: {
              $cond: [{ $eq: ['$status', 'processing'] }, '$totalAmount', 0]
            }
          },
          totalFees: { $sum: '$processingFees' },
          totalTaxes: { $sum: '$taxes' },
          netAmount: { $sum: '$netAmount' },
          count: { $sum: 1 },
          byMethod: {
            $push: {
              method: '$method',
              amount: '$totalAmount'
            }
          },
          byStatus: {
            $push: {
              status: '$status',
              amount: '$totalAmount'
            }
          }
        }
      }
    ]);

    const summary = analytics[0] || {
      totalPayments: 0,
      completedPayments: 0,
      pendingPayments: 0,
      processingPayments: 0,
      totalFees: 0,
      totalTaxes: 0,
      netAmount: 0,
      count: 0,
      byMethod: [],
      byStatus: []
    };

    // Group by method
    const methodSummary = summary.byMethod.reduce((acc, item) => {
      if (!acc[item.method]) {
        acc[item.method] = 0;
      }
      acc[item.method] += item.amount;
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
          totalPayments: summary.totalPayments,
          completedPayments: summary.completedPayments,
          pendingPayments: summary.pendingPayments,
          processingPayments: summary.processingPayments,
          totalFees: summary.totalFees,
          totalTaxes: summary.totalTaxes,
          netAmount: summary.netAmount,
          count: summary.count
        },
        byMethod: methodSummary,
        byStatus: statusSummary
      }
    });
  })
);

module.exports = router;