const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  // Campaign Identification
  campaignId: {
    type: String,
    required: true,
    unique: true,
    default: () => `CAMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },

  // Original User Input
  briefText: {
    type: String,
    required: true
  },

  // Structured Campaign Data (from Understanding Agent)
  structuredData: {
    product: String,
    baseOffer: String,
    specialOffer: String,
    goals: [String],
    includeInactive: Boolean,
    cta: String,
    additionalInfo: mongoose.Schema.Types.Mixed
  },

  // Strategy (from Strategy Agent)
  strategy: {
    segments: [{
      name: String,
      criteria: String,
      size: Number
    }],
    sendTime: {
      date: Date,
      timeSlot: String,
      timezone: String
    },
    tone: String,
    subjectLineStrategy: String,
    abTesting: {
      enabled: Boolean,
      variants: Number
    }
  },

  // Content (from Content Generation Agent)
  content: {
    subjectLines: [String],
    emailBody: String,
    personalizationBlocks: mongoose.Schema.Types.Mixed,
    ctaPlacement: String,
    selectedSubjectLine: String
  },

  // Approval Status
  approval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'edited'],
      default: 'pending'
    },
    approvedBy: String,
    approvedAt: Date,
    rejectionReason: String,
    editNotes: String
  },

  // Execution Status
  execution: {
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'failed'],
      default: 'not_started'
    },
    startedAt: Date,
    completedAt: Date,
    totalSent: Number,
    totalFailed: Number,
    errorLog: [String]
  },

  // Analytics Summary (aggregated from Analytics collection)
  analytics: {
    openRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    campaignScore: { type: Number, default: 0 },
    totalOpens: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },
    uniqueOpens: { type: Number, default: 0 },
    uniqueClicks: { type: Number, default: 0 },
    segmentPerformance: mongoose.Schema.Types.Mixed,
    lastUpdated: Date
  },

  // Optimization Data
  optimization: {
    iterationNumber: { type: Number, default: 1 },
    parentCampaignId: String,
    improvements: [String],
    optimizationReason: String
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

// Index for faster queries
campaignSchema.index({ campaignId: 1 });
campaignSchema.index({ 'approval.status': 1 });
campaignSchema.index({ createdAt: -1 });

// Virtual for campaign score calculation
campaignSchema.virtual('calculatedScore').get(function() {
  return (0.6 * this.analytics.openRate) + (0.4 * this.analytics.clickRate);
});

// Pre-save hook to update timestamps
campaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
