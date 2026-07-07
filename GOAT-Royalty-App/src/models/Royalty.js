const mongoose = require('mongoose');

const royaltySchema = new mongoose.Schema({
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: [true, 'Artist is required']
  },
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  },
  workTitle: {
    type: String,
    required: [true, 'Work title is required'],
    trim: true,
    maxlength: [200, 'Work title cannot exceed 200 characters']
  },
  workType: {
    type: String,
    enum: ['song', 'album', 'video', 'book', 'software', 'other'],
    required: [true, 'Work type is required']
  },
  periodStart: {
    type: Date,
    required: [true, 'Period start date is required']
  },
  periodEnd: {
    type: Date,
    required: [true, 'Period end date is required']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  pendingAmount: {
    type: Number,
    default: 0,
    min: [0, 'Pending amount cannot be negative']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  royaltyRate: {
    type: Number,
    required: [true, 'Royalty rate is required'],
    min: [0, 'Royalty rate cannot be negative'],
    max: [100, 'Royalty rate cannot exceed 100']
  },
  salesData: {
    unitsSold: {
      type: Number,
      default: 0,
      min: 0
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0
    },
    streams: {
      type: Number,
      default: 0,
      min: 0
    },
    downloads: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  source: {
    type: String,
    enum: ['spotify', 'apple', 'youtube', 'amazon', 'physical', 'digital', 'other'],
    required: [true, 'Source is required']
  },
  sourceDetails: {
    platform: String,
    region: String,
    reportId: String,
    importDate: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'disputed', 'cancelled'],
    default: 'pending'
  },
  payments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
royaltySchema.index({ artist: 1, periodStart: -1 });
royaltySchema.index({ contract: 1 });
royaltySchema.index({ status: 1 });
royaltySchema.index({ source: 1 });
royaltySchema.index({ createdBy: 1 });
royaltySchema.index({ workTitle: 'text' });

// Virtual for remaining amount to be paid
royaltySchema.virtual('remainingAmount').get(function() {
  return this.amount - this.paidAmount;
});

// Method to calculate payment status
royaltySchema.methods.getPaymentStatus = function() {
  if (this.paidAmount >= this.amount) {
    return 'fully_paid';
  } else if (this.paidAmount > 0) {
    return 'partially_paid';
  }
  return 'unpaid';
};

// Method to approve royalty
royaltySchema.methods.approve = function(approvedBy) {
  this.status = 'approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  return this.save();
};

// Method to add payment
royaltySchema.methods.addPayment = function(paymentId, amount) {
  this.payments.push(paymentId);
  this.paidAmount += amount;
  
  if (this.paidAmount >= this.amount) {
    this.status = 'paid';
    this.pendingAmount = 0;
  } else {
    this.pendingAmount = this.amount - this.paidAmount;
  }
  
  return this.save();
};

// Static method to get royalty summary for artist
royaltySchema.statics.getArtistSummary = async function(artistId, startDate, endDate) {
  const matchStage = { artist: artistId };
  
  if (startDate || endDate) {
    matchStage.periodStart = {};
    if (startDate) matchStage.periodStart.$gte = new Date(startDate);
    if (endDate) matchStage.periodStart.$lte = new Date(endDate);
  }
  
  const summary = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$artist',
        totalRoyalties: { $sum: '$amount' },
        paidAmount: { $sum: '$paidAmount' },
        pendingAmount: { $sum: '$pendingAmount' },
        totalUnits: { $sum: '$salesData.unitsSold' },
        totalStreams: { $sum: '$salesData.streams' },
        totalDownloads: { $sum: '$salesData.downloads' },
        averageRoyalty: { $avg: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return summary[0] || {
    totalRoyalties: 0,
    paidAmount: 0,
    pendingAmount: 0,
    totalUnits: 0,
    totalStreams: 0,
    totalDownloads: 0,
    averageRoyalty: 0,
    count: 0
  };
};

module.exports = mongoose.model('Royalty', royaltySchema);