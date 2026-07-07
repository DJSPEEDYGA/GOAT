const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Artist name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: [2000, 'Bio cannot exceed 2000 characters']
  },
  avatar: {
    type: String
  },
  socialMedia: {
    website: String,
    spotify: String,
    appleMusic: String,
    youtube: String,
    instagram: String,
    twitter: String,
    facebook: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  taxInfo: {
    taxId: String,
    taxIdType: {
      type: String,
      enum: ['SSN', 'EIN', 'VAT', 'OTHER']
    },
    taxIdCountry: String
  },
  bankInfo: {
    bankName: String,
    accountNumber: String,
    routingNumber: String,
    swiftCode: String,
    iban: String
  },
  contracts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  genre: [{
    type: String,
    trim: true
  }],
  totalEarnings: {
    type: Number,
    default: 0
  },
  pendingEarnings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
artistSchema.index({ name: 'text', bio: 'text' });
artistSchema.index({ user: 1 });
artistSchema.index({ isActive: 1 });
artistSchema.index({ 'tags': 1 });
artistSchema.index({ 'genre': 1 });

// Virtual for total royalties
artistSchema.virtual('totalRoyalties', {
  ref: 'Royalty',
  localField: '_id',
  foreignField: 'artist',
  count: true
});

// Method to calculate total earnings
artistSchema.methods.calculateTotalEarnings = async function() {
  const Royalty = mongoose.model('Royalty');
  const result = await Royalty.aggregate([
    { $match: { artist: this._id } },
    { $group: { _id: null, total: { $sum: '$amount' }, pending: { $sum: '$pendingAmount' } } }
  ]);
  
  if (result.length > 0) {
    this.totalEarnings = result[0].total;
    this.pendingEarnings = result[0].pending;
  }
  
  await this.save();
  return { total: this.totalEarnings, pending: this.pendingEarnings };
};

// Method to get artist summary
artistSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    genre: this.genre,
    tags: this.tags,
    totalEarnings: this.totalEarnings,
    pendingEarnings: this.pendingEarnings,
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Artist', artistSchema);