const mongoose = require('mongoose');

/**
 * Contact Schema
 * Stores customer/recipient email addresses and details
 */
const contactSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  name: {
    type: String,
    trim: true
  },
  segment: {
    type: String,
    enum: ['Premium', 'Standard', 'Basic', 'New', 'At-Risk', 'VIP', 'Other'],
    default: 'Standard'
  },
  customerId: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed', 'bounced'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    type: Map,
    of: String
  },
  source: {
    type: String,
    enum: ['manual', 'csv', 'api', 'campaign'],
    default: 'manual'
  },
  campaignsSent: {
    type: Number,
    default: 0
  },
  lastEmailedAt: {
    type: Date
  },
  addedBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
contactSchema.index({ email: 1 });
contactSchema.index({ segment: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ tags: 1 });

module.exports = mongoose.model('Contact', contactSchema);
