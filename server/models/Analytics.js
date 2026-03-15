const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  // Campaign Reference
  campaignId: {
    type: String,
    required: true,
    ref: 'Campaign',
    unique: true
  },

  // Overall Metrics
  overall: {
    totalSent: { type: Number, default: 0 },
    totalDelivered: { type: Number, default: 0 },
    totalBounced: { type: Number, default: 0 },
    totalOpened: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },
    uniqueOpens: { type: Number, default: 0 },
    uniqueClicks: { type: Number, default: 0 },
    unsubscribes: { type: Number, default: 0 }
  },

  // Calculated Rates (%)
  rates: {
    deliveryRate: { type: Number, default: 0 },
    openRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    clickToOpenRate: { type: Number, default: 0 },
    unsubscribeRate: { type: Number, default: 0 }
  },

  // Campaign Score (Formula: 0.6 * OpenRate + 0.4 * ClickRate)
  campaignScore: {
    type: Number,
    default: 0
  },

  // Segment-wise Performance
  segmentPerformance: [{
    segmentName: String,
    sent: Number,
    opened: Number,
    clicked: Number,
    openRate: Number,
    clickRate: Number,
    score: Number
  }],

  // Time-slot Performance
  timeSlotPerformance: {
    timeSlot: String,
    performanceScore: Number,
    bestOpenHour: Number,
    bestClickHour: Number
  },

  // A/B Testing Results
  abTestResults: [{
    variant: String,
    sent: Number,
    opened: Number,
    clicked: Number,
    openRate: Number,
    clickRate: Number,
    winner: Boolean
  }],

  // Subject Line Performance
  subjectLinePerformance: {
    subjectLine: String,
    sent: Number,
    openRate: Number,
    effectiveness: String
  },

  // Engagement Timeline (hourly data for charts)
  timeline: [{
    hour: Number,
    date: Date,
    opens: Number,
    clicks: Number
  }],

  // Best Performers
  topPerformers: {
    bestSegment: String,
    bestTimeSlot: String,
    bestVariant: String
  },

  // Optimization Insights
  insights: [{
    type: {
      type: String,
      enum: ['success', 'warning', 'improvement', 'info']
    },
    message: String,
    metric: String,
    value: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Recommendations for next campaign
  recommendations: [{
    category: String,
    suggestion: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    expectedImprovement: String
  }],

  // Last calculation timestamp
  lastCalculated: {
    type: Date,
    default: Date.now
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
analyticsSchema.index({ campaignId: 1 });
analyticsSchema.index({ campaignScore: -1 });
analyticsSchema.index({ lastCalculated: -1 });

// Method to calculate all metrics
analyticsSchema.methods.calculateMetrics = async function() {
  const Email = mongoose.model('Email');
  
  // Get all emails for this campaign
  const emails = await Email.find({ campaignId: this.campaignId });
  
  // Calculate overall metrics
  this.overall.totalSent = emails.length;
  this.overall.totalDelivered = emails.filter(e => e.delivery.status === 'delivered').length;
  this.overall.totalBounced = emails.filter(e => e.delivery.status === 'bounced').length;
  this.overall.uniqueOpens = emails.filter(e => e.engagement.opened).length;
  this.overall.uniqueClicks = emails.filter(e => e.engagement.clicked).length;
  this.overall.totalOpens = emails.reduce((sum, e) => sum + e.engagement.openCount, 0);
  this.overall.totalClicks = emails.reduce((sum, e) => sum + e.engagement.clickCount, 0);
  this.overall.unsubscribes = emails.filter(e => e.engagement.unsubscribed).length;
  
  // Calculate rates
  if (this.overall.totalDelivered > 0) {
    this.rates.deliveryRate = (this.overall.totalDelivered / this.overall.totalSent) * 100;
    this.rates.openRate = (this.overall.uniqueOpens / this.overall.totalDelivered) * 100;
    this.rates.clickRate = (this.overall.uniqueClicks / this.overall.totalDelivered) * 100;
    this.rates.unsubscribeRate = (this.overall.unsubscribes / this.overall.totalDelivered) * 100;
  }
  
  if (this.overall.uniqueOpens > 0) {
    this.rates.clickToOpenRate = (this.overall.uniqueClicks / this.overall.uniqueOpens) * 100;
  }
  
  // Calculate campaign score
  this.campaignScore = (0.6 * this.rates.openRate) + (0.4 * this.rates.clickRate);
  
  this.lastCalculated = new Date();
  
  return this.save();
};

// Static method to generate insights
analyticsSchema.statics.generateInsights = function(analytics) {
  const insights = [];
  
  if (analytics.rates.openRate > 20) {
    insights.push({
      type: 'success',
      message: 'Excellent open rate! Subject line is working well.',
      metric: 'openRate',
      value: analytics.rates.openRate
    });
  } else if (analytics.rates.openRate < 10) {
    insights.push({
      type: 'warning',
      message: 'Low open rate. Consider improving subject line.',
      metric: 'openRate',
      value: analytics.rates.openRate
    });
  }
  
  if (analytics.rates.clickRate > 5) {
    insights.push({
      type: 'success',
      message: 'Strong click rate! CTA is compelling.',
      metric: 'clickRate',
      value: analytics.rates.clickRate
    });
  } else if (analytics.rates.clickRate < 2) {
    insights.push({
      type: 'improvement',
      message: 'Low click rate. Improve CTA visibility and message.',
      metric: 'clickRate',
      value: analytics.rates.clickRate
    });
  }
  
  if (analytics.campaignScore > 15) {
    insights.push({
      type: 'success',
      message: 'Outstanding campaign performance!',
      metric: 'campaignScore',
      value: analytics.campaignScore
    });
  }
  
  return insights;
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;
