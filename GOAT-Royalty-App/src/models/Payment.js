const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: [true, 'Artist is required']
  },
  royalties: [{
    royalty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Royalty',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['bank_transfer', 'paypal', 'stripe', 'check', 'cash', 'other'],
    required: [true, 'Payment method is required']
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    routingNumber: String,
    swiftCode: String,
    iban: String
  },
  processingFees: {
    type: Number,
    default: 0,
    min: [0, 'Processing fees cannot be negative']
  },
  taxes: {
    type: Number,
    default: 0,
    min: [0, 'Taxes cannot be negative']
  },
  netAmount: {
    type: Number,
    required: true,
    min: [0, 'Net amount cannot be negative']
  },
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
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  completedAt: Date,
  failureReason: {
    type: String
  },
  refundDetails: {
    refundAmount: Number,
    refundDate: Date,
    refundReason: String,
    refundTransactionId: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ artist: 1, paymentDate: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdBy: 1 });

// Pre-save middleware to calculate net amount
paymentSchema.pre('save', function(next) {
  if (this.isModified('totalAmount') || this.isModified('processingFees') || this.isModified('taxes')) {
    this.netAmount = this.totalAmount - this.processingFees - this.taxes;
  }
  next();
});

// Method to generate transaction ID
paymentSchema.methods.generateTransactionId = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  this.transactionId = `PAY-${timestamp}-${random}`.toUpperCase();
  return this.transactionId;
};

// Method to process payment
paymentSchema.methods.process = function(processedBy) {
  this.status = 'processing';
  this.processedBy = processedBy;
  this.processedAt = new Date();
  
  if (!this.transactionId) {
    this.generateTransactionId();
  }
  
  return this.save();
};

// Method to complete payment
paymentSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  
  // Update associated royalties
  const Royalty = mongoose.model('Royalty');
  const updatePromises = this.royalties.map(async (royaltyItem) => {
    await Royalty.findByIdAndUpdate(
      royaltyItem.royalty,
      { 
        $push: { payments: this._id },
        $inc: { paidAmount: royaltyItem.amount }
      }
    );
  });
  
  return Promise.all(updatePromises).then(() => this.save());
};

// Method to fail payment
paymentSchema.methods.fail = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  return this.save();
};

// Method to refund payment
paymentSchema.methods.refund = function(refundAmount, refundReason) {
  this.status = 'refunded';
  this.refundDetails = {
    refundAmount,
    refundDate: new Date(),
    refundReason,
    refundTransactionId: `REF-${this.generateTransactionId()}`
  };
  
  // Update associated royalties
  const Royalty = mongoose.model('Royalty');
  const updatePromises = this.royalties.map(async (royaltyItem) => {
    await Royalty.findByIdAndUpdate(
      royaltyItem.royalty,
      { 
        $pull: { payments: this._id },
        $inc: { paidAmount: -royaltyItem.amount }
      }
    );
  });
  
  return Promise.all(updatePromises).then(() => this.save());
};

// Static method to get payment summary
paymentSchema.statics.getPaymentSummary = async function(artistId, startDate, endDate) {
  const matchStage = { artist: artistId };
  
  if (startDate || endDate) {
    matchStage.paymentDate = {};
    if (startDate) matchStage.paymentDate.$gte = new Date(startDate);
    if (endDate) matchStage.paymentDate.$lte = new Date(endDate);
  }
  
  const summary = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$artist',
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
        paymentCount: { $sum: 1 },
        completedCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  return summary[0] || {
    totalPayments: 0,
    completedPayments: 0,
    pendingPayments: 0,
    processingPayments: 0,
    totalFees: 0,
    totalTaxes: 0,
    netAmount: 0,
    paymentCount: 0,
    completedCount: 0
  };
};

module.exports = mongoose.model('Payment', paymentSchema);