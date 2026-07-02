const express = require('express');
const Royalty = require('../models/Royalty');
const Payment = require('../models/Payment');
const Artist = require('../models/Artist');
const Contract = require('../models/Contract');
const { protect, authorize } = require('../middleware/auth');
const { validateDateRange } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Get dashboard analytics
// @route   GET /api/reports/dashboard
// @access  Private
router.get('/dashboard', 
  protect, 
  validateDateRange,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    let dateMatch = {};
    if (startDate || endDate) {
      dateMatch = {};
      if (startDate) dateMatch.$gte = new Date(startDate);
      if (endDate) dateMatch.$lte = new Date(endDate);
    }

    // Artist filter for artists
    let artistMatch = {};
    if (req.user.role === 'artist' && req.artistProfile) {
      artistMatch = { artist: req.artistProfile._id };
    }

    const [
      royaltyStats,
      paymentStats,
      artistStats,
      contractStats,
      monthlyTrend
    ] = await Promise.all([
      // Royalty statistics
      Royalty.aggregate([
        { $match: { ...artistMatch, ...(dateMatch.periodStart && { periodStart: dateMatch }) } },
        {
          $group: {
            _id: null,
            totalRoyalties: { $sum: '$amount' },
            totalPending: { $sum: '$pendingAmount' },
            totalPaid: { $sum: '$paidAmount' },
            averageRoyalty: { $avg: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Payment statistics
      Payment.aggregate([
        { $match: { ...artistMatch, ...(dateMatch.paymentDate && { paymentDate: dateMatch }) } },
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
            totalFees: { $sum: '$processingFees' },
            netAmount: { $sum: '$netAmount' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Artist statistics
      Artist.aggregate([
        { $match: artistMatch || {} },
        {
          $group: {
            _id: null,
            totalArtists: { $sum: 1 },
            activeArtists: {
              $sum: { $cond: ['$isActive', 1, 0] }
            },
            totalEarnings: { $sum: '$totalEarnings' }
          }
        }
      ]),
      
      // Contract statistics
      Contract.aggregate([
        { $match: artistMatch || {} },
        {
          $group: {
            _id: null,
            totalContracts: { $sum: 1 },
            activeContracts: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            }
          }
        }
      ]),
      
      // Monthly trend (last 12 months)
      Royalty.aggregate([
        { $match: artistMatch },
        {
          $group: {
            _id: {
              year: { $year: '$periodStart' },
              month: { $month: '$periodStart' }
            },
            totalRoyalties: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    const royaltySummary = royaltyStats[0] || {
      totalRoyalties: 0,
      totalPending: 0,
      totalPaid: 0,
      averageRoyalty: 0,
      count: 0
    };

    const paymentSummary = paymentStats[0] || {
      totalPayments: 0,
      completedPayments: 0,
      pendingPayments: 0,
      totalFees: 0,
      netAmount: 0,
      count: 0
    };

    const artistSummary = artistStats[0] || {
      totalArtists: 0,
      activeArtists: 0,
      totalEarnings: 0
    };

    const contractSummary = contractStats[0] || {
      totalContracts: 0,
      activeContracts: 0
    };

    res.json({
      success: true,
      data: {
        royalties: royaltySummary,
        payments: paymentSummary,
        artists: artistSummary,
        contracts: contractSummary,
        monthlyTrend: monthlyTrend.map(item => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          totalRoyalties: item.totalRoyalties,
          count: item.count
        })).reverse()
      }
    });
  })
);

// @desc    Get artist earnings report
// @route   GET /api/reports/artist-earnings
// @access  Private
router.get('/artist-earnings', 
  protect, 
  validateDateRange,
  asyncHandler(async (req, res) => {
    const { startDate, endDate, artistId } = req.query;
    
    let matchStage = {};
    
    if (startDate || endDate) {
      matchStage.periodStart = {};
      if (startDate) matchStage.periodStart.$gte = new Date(startDate);
      if (endDate) matchStage.periodStart.$lte = new Date(endDate);
    }

    // Artist filter
    if (req.user.role === 'artist' && req.artistProfile) {
      matchStage.artist = req.artistProfile._id;
    } else if (artistId) {
      matchStage.artist = artistId;
    }

    const artistEarnings = await Royalty.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'artists',
          localField: 'artist',
          foreignField: '_id',
          as: 'artistInfo'
        }
      },
      { $unwind: '$artistInfo' },
      {
        $group: {
          _id: '$artist',
          artistName: { $first: '$artistInfo.name' },
          artistEmail: { $first: '$artistInfo.email' },
          totalRoyalties: { $sum: '$amount' },
          totalPending: { $sum: '$pendingAmount' },
          totalPaid: { $sum: '$paidAmount' },
          royaltyCount: { $sum: 1 },
          bySource: {
            $push: {
              source: '$source',
              amount: '$amount'
            }
          },
          byWorkType: {
            $push: {
              workType: '$workType',
              amount: '$amount'
            }
          }
        }
      },
      { $sort: { totalRoyalties: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        artistEarnings: artistEarnings.map(artist => ({
          artistId: artist._id,
          artistName: artist.artistName,
          artistEmail: artist.artistEmail,
          totalRoyalties: artist.totalRoyalties,
          totalPending: artist.totalPending,
          totalPaid: artist.totalPaid,
          royaltyCount: artist.royaltyCount,
          bySource: artist.bySource.reduce((acc, item) => {
            acc[item.source] = (acc[item.source] || 0) + item.amount;
            return acc;
          }, {}),
          byWorkType: artist.byWorkType.reduce((acc, item) => {
            acc[item.workType] = (acc[item.workType] || 0) + item.amount;
            return acc;
          }, {})
        }))
      }
    });
  })
);

// @desc    Get revenue by platform report
// @route   GET /api/reports/platform-revenue
// @access  Private
router.get('/platform-revenue', 
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

    const platformRevenue = await Royalty.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$source',
          totalRevenue: { $sum: '$amount' },
          totalPending: { $sum: '$pendingAmount' },
          totalPaid: { $sum: '$paidAmount' },
          royaltyCount: { $sum: 1 },
          averageRevenue: { $avg: '$amount' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Monthly breakdown by platform
    const monthlyPlatformRevenue = await Royalty.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            source: '$source',
            year: { $year: '$periodStart' },
            month: { $month: '$periodStart' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    res.json({
      success: true,
      data: {
        platformSummary: platformRevenue,
        monthlyBreakdown: monthlyPlatformRevenue.map(item => ({
          source: item._id.source,
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          revenue: item.revenue
        }))
      }
    });
  })
);

// @desc    Get payment status report
// @route   GET /api/reports/payment-status
// @access  Private
router.get('/payment-status', 
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

    const paymentStatus = await Payment.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'artists',
          localField: 'artist',
          foreignField: '_id',
          as: 'artistInfo'
        }
      },
      { $unwind: '$artistInfo' },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$totalAmount' },
          payments: {
            $push: {
              id: '$_id',
              artistName: '$artistInfo.name',
              amount: '$totalAmount',
              method: '$method',
              paymentDate: '$paymentDate',
              transactionId: '$transactionId'
            }
          }
        }
      }
    ]);

    const overduePayments = await Payment.aggregate([
      { $match: { 
        ...matchStage,
        status: { $in: ['pending', 'processing'] },
        paymentDate: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 days ago
      }},
      {
        $lookup: {
          from: 'artists',
          localField: 'artist',
          foreignField: '_id',
          as: 'artistInfo'
        }
      },
      { $unwind: '$artistInfo' },
      {
        $project: {
          id: '$_id',
          artistName: '$artistInfo.name',
          amount: '$totalAmount',
          paymentDate: '$paymentDate',
          daysOverdue: {
            $divide: [
              { $subtract: [new Date(), '$paymentDate'] },
              24 * 60 * 60 * 1000 // Convert to days
            ]
          }
        }
      },
      { $sort: { daysOverdue: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        paymentStatus,
        overduePayments,
        summary: {
          totalStatuses: paymentStatus.length,
          overdueCount: overduePayments.length,
          overdueAmount: overduePayments.reduce((sum, p) => sum + p.amount, 0)
        }
      }
    });
  })
);

// @desc    Export report data
// @route   GET /api/reports/export/:type
// @access  Private/Admin/Manager
router.get('/export/:type', 
  protect, 
  authorize('admin', 'manager'),
  validateDateRange,
  asyncHandler(async (req, res) => {
    const { type } = req.params;
    const { startDate, endDate, format = 'json' } = req.query;

    let data;
    
    switch (type) {
      case 'royalties':
        data = await Royalty.find({
          ...(startDate || endDate ? {
            periodStart: {
              ...(startDate && { $gte: new Date(startDate) }),
              ...(endDate && { $lte: new Date(endDate) })
            }
          } : {})
        }).populate('artist', 'name email');
        break;
        
      case 'payments':
        data = await Payment.find({
          ...(startDate || endDate ? {
            paymentDate: {
              ...(startDate && { $gte: new Date(startDate) }),
              ...(endDate && { $lte: new Date(endDate) })
            }
          } : {})
        }).populate('artist', 'name email');
        break;
        
      case 'artists':
        data = await Artist.find({}).populate('user', 'username email');
        break;
        
      default:
        throw new AppError('Invalid export type', 400);
    }

    if (format === 'csv') {
      // Convert to CSV (simplified implementation)
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
      return res.send(csv);
    }

    res.json({
      success: true,
      data: {
        type,
        count: data.length,
        exportedAt: new Date().toISOString(),
        data
      }
    });
  })
);

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0].toObject ? data[0].toObject() : data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(item => {
    const obj = item.toObject ? item.toObject() : item;
    return headers.map(header => {
      const value = obj[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

module.exports = router;