const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Contract title is required'],
    trim: true,
    maxlength: [200, 'Contract title cannot exceed 200 characters']
  },
  contractNumber: {
    type: String,
    unique: true,
    required: [true, 'Contract number is required'],
    trim: true
  },
  artists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  }],
  type: {
    type: String,
    enum: ['recording', 'publishing', 'distribution', 'licensing', 'management', 'other'],
    required: [true, 'Contract type is required']
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'expired', 'terminated', 'suspended'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    required: [true, 'Contract start date is required']
  },
  endDate: {
    type: Date
  },
  renewalTerms: {
    autoRenew: {
      type: Boolean,
      default: false
    },
    renewalPeriod: {
      type: String,
      enum: ['monthly', 'quarterly', 'semi-annual', 'annual']
    },
    renewalNoticeDays: {
      type: Number,
      min: 0,
      default: 30
    }
  },
  terms: {
    duration: {
      type: Number, // in months
      required: [true, 'Contract duration is required'],
      min: 1
    },
    exclusivity: {
      type: Boolean,
      default: false
    },
    territory: [{
      type: String,
      trim: true
    }],
    language: [{
      type: String,
      trim: true
    }]
  },
  royalties: [{
    type: {
      type: String,
      enum: ['mechanical', 'performance', 'synchronization', 'digital', 'physical', 'other'],
      required: true
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    rateType: {
      type: String,
      enum: ['percentage', 'fixed', 'tiered'],
      default: 'percentage'
    },
    basis: {
      type: String,
      enum: ['gross', 'net', 'wholesale', 'retail'],
      default: 'net'
    },
    minGuarantee: {
      type: Number,
      default: 0,
      min: 0
    },
    recoupable: {
      type: Boolean,
      default: true
    }
  }],
  advances: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    recoupable: {
      type: Boolean,
      default: true
    }
  }],
  currency: {
    type: String,
    default: 'USD'
  },
  paymentTerms: {
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'semi-annual', 'annual', 'on-demand'],
      default: 'quarterly'
    },
    paymentDays: {
      type: Number,
      default: 30,
      min: 0
    },
    reportingPeriod: {
      type: String,
      enum: ['monthly', 'quarterly', 'semi-annual', 'annual'],
      default: 'quarterly'
    }
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
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  terminatedAt: Date,
  terminatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  terminationReason: {
    type: String,
    maxlength: [1000, 'Termination reason cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
contractSchema.index({ contractNumber: 1 });
contractSchema.index({ artists: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ type: 1 });
contractSchema.index({ createdBy: 1 });
contractSchema.index({ startDate: 1, endDate: 1 });

// Virtual for remaining duration
contractSchema.virtual('remainingDuration').get(function() {
  if (!this.endDate) return null;
  const now = new Date();
  const diffTime = this.endDate - now;
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  return diffMonths > 0 ? diffMonths : 0;
});

// Virtual for total advances
contractSchema.virtual('totalAdvances').get(function() {
  return this.advances.reduce((total, advance) => total + advance.amount, 0);
});

// Method to generate contract number
contractSchema.methods.generateContractNumber = function() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  this.contractNumber = `CON-${year}-${random}`;
  return this.contractNumber;
};

// Method to activate contract
contractSchema.methods.activate = function(approvedBy) {
  this.status = 'active';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  
  if (!this.contractNumber) {
    this.generateContractNumber();
  }
  
  // Set end date if not specified
  if (!this.endDate && this.terms.duration) {
    this.endDate = new Date();
    this.endDate.setMonth(this.endDate.getMonth() + this.terms.duration);
  }
  
  return this.save();
};

// Method to terminate contract
contractSchema.methods.terminate = function(terminatedBy, reason) {
  this.status = 'terminated';
  this.terminatedBy = terminatedBy;
  this.terminatedAt = new Date();
  this.terminationReason = reason;
  return this.save();
};

// Method to check if contract is expired
contractSchema.methods.isExpired = function() {
  return this.endDate && this.endDate < new Date();
};

// Method to get royalty rate for a specific type
contractSchema.methods.getRoyaltyRate = function(type) {
  const royalty = this.royalties.find(r => r.type === type);
  return royalty ? royalty.rate : 0;
};

// Method to calculate recoupable amount
contractSchema.methods.calculateRecoupableAmount = function() {
  return this.advances
    .filter(advance => advance.recoupable)
    .reduce((total, advance) => total + advance.amount, 0);
};

// Static method to get active contracts
contractSchema.statics.getActiveContracts = function(artistId) {
  return this.find({
    artists: artistId,
    status: 'active',
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gt: new Date() } }
    ]
  }).populate('artists');
};

// Static method to get expiring contracts
contractSchema.statics.getExpiringContracts = function(days = 30) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  return this.find({
    status: 'active',
    endDate: { $lte: expiryDate, $gt: new Date() }
  }).populate('artists');
};

module.exports = mongoose.model('Contract', contractSchema);