const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  // Email Identification
  emailId: {
    type: String,
    required: true,
    unique: true,
    default: () => `EMAIL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },

  // Campaign Reference
  campaignId: {
    type: String,
    required: true,
    ref: 'Campaign'
  },

  // Recipient Information
  recipient: {
    email: {
      type: String,
      required: true
    },
    name: String,
    segment: String,
    customerId: String,
    metadata: mongoose.Schema.Types.Mixed
  },

  // Email Content (as sent)
  content: {
    subject: String,
    body: String,
    ctaUrl: String,
    personalization: mongoose.Schema.Types.Mixed
  },

  // Delivery Status
  delivery: {
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'bounced', 'failed'],
      default: 'queued'
    },
    sentAt: Date,
    deliveredAt: Date,
    errorMessage: String,
    providerMessageId: String
  },

  // Engagement Tracking
  engagement: {
    opened: {
      type: Boolean,
      default: false
    },
    openedAt: Date,
    openCount: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Boolean,
      default: false
    },
    clickedAt: Date,
    clickCount: {
      type: Number,
      default: 0
    },
    unsubscribed: {
      type: Boolean,
      default: false
    },
    unsubscribedAt: Date
  },

  // Tracking URLs (unique per recipient)
  tracking: {
    openTrackingUrl: String,
    clickTrackingUrl: String,
    unsubscribeUrl: String
  },

  // A/B Testing Variant
  variant: {
    type: String,
    default: 'A'
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
emailSchema.index({ campaignId: 1 });
emailSchema.index({ 'recipient.email': 1 });
emailSchema.index({ 'delivery.status': 1 });
emailSchema.index({ 'engagement.opened': 1 });
emailSchema.index({ 'engagement.clicked': 1 });
emailSchema.index({ createdAt: -1 });

// Pre-save hook
emailSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to mark email as opened
emailSchema.methods.markAsOpened = function() {
  if (!this.engagement.opened) {
    this.engagement.opened = true;
    this.engagement.openedAt = new Date();
  }
  this.engagement.openCount += 1;
  return this.save();
};

// Method to mark email as clicked
emailSchema.methods.markAsClicked = function() {
  if (!this.engagement.clicked) {
    this.engagement.clicked = true;
    this.engagement.clickedAt = new Date();
  }
  this.engagement.clickCount += 1;
  return this.save();
};

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
