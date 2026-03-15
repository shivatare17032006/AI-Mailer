const Analytics = require('../models/Analytics');
const Email = require('../models/Email');

/**
 * Analytics Agent
 * Collects and analyzes campaign performance data
 */
class AnalyticsAgent {
  constructor() {
    this.refreshInterval = parseInt(process.env.ANALYTICS_UPDATE_INTERVAL) || 60000;
  }

  /**
   * Calculate complete analytics for a campaign
   * @param {string} campaignId - Campaign ID
   * @returns {Promise<object>} - Analytics data
   */
  async calculateAnalytics(campaignId) {
    try {
      console.log('🤖 Analytics Agent: Calculating campaign analytics...');
      
      // Get or create analytics record
      let analytics = await Analytics.findOne({ campaignId });
      
      if (!analytics) {
        analytics = new Analytics({ campaignId });
      }
      
      // Calculate metrics using the model method
      await analytics.calculateMetrics();
      
      // Calculate segment performance
      analytics.segmentPerformance = await this.calculateSegmentPerformance(campaignId);
      
      // Generate insights
      analytics.insights = Analytics.generateInsights(analytics);
      
      // Generate recommendations
      analytics.recommendations = await this.generateRecommendations(analytics);
      
      // Calculate top performers
      analytics.topPerformers = this.identifyTopPerformers(analytics);
      
      await analytics.save();
      
      console.log('✅ Analytics Agent: Analysis complete');
      console.log(`📊 Open Rate: ${analytics.rates.openRate.toFixed(2)}%`);
      console.log(`🖱️  Click Rate: ${analytics.rates.clickRate.toFixed(2)}%`);
      console.log(`🏆 Campaign Score: ${analytics.campaignScore.toFixed(2)}`);
      
      return analytics;
      
    } catch (error) {
      console.error('❌ Analytics Agent Error:', error.message);
      throw new Error(`Analytics calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate performance by segment
   * @param {string} campaignId - Campaign ID
   * @returns {Promise<array>} - Segment performance data
   */
  async calculateSegmentPerformance(campaignId) {
    const emails = await Email.find({ campaignId });
    
    // Group by segment
    const segmentMap = new Map();
    
    emails.forEach(email => {
      const segment = email.recipient.segment || 'Unknown';
      
      if (!segmentMap.has(segment)) {
        segmentMap.set(segment, {
          segmentName: segment,
          sent: 0,
          opened: 0,
          clicked: 0,
          openRate: 0,
          clickRate: 0,
          score: 0
        });
      }
      
      const data = segmentMap.get(segment);
      data.sent++;
      if (email.engagement.opened) data.opened++;
      if (email.engagement.clicked) data.clicked++;
    });
    
    // Calculate rates and scores
    const segmentPerformance = Array.from(segmentMap.values()).map(seg => {
      seg.openRate = seg.sent > 0 ? (seg.opened / seg.sent) * 100 : 0;
      seg.clickRate = seg.sent > 0 ? (seg.clicked / seg.sent) * 100 : 0;
      seg.score = (0.6 * seg.openRate) + (0.4 * seg.clickRate);
      return seg;
    });
    
    // Sort by score
    return segmentPerformance.sort((a, b) => b.score - a.score);
  }

  /**
   * Generate time-based performance data
   * @param {string} campaignId - Campaign ID
   * @returns {Promise<array>} - Hourly performance data
   */
  async calculateTimelinePerformance(campaignId) {
    const emails = await Email.find({ campaignId });
    
    const hourlyData = new Map();
    
    emails.forEach(email => {
      if (email.engagement.openedAt) {
        const hour = new Date(email.engagement.openedAt).getHours();
        if (!hourlyData.has(hour)) {
          hourlyData.set(hour, { hour, opens: 0, clicks: 0 });
        }
        hourlyData.get(hour).opens++;
      }
      
      if (email.engagement.clickedAt) {
        const hour = new Date(email.engagement.clickedAt).getHours();
        if (!hourlyData.has(hour)) {
          hourlyData.set(hour, { hour, opens: 0, clicks: 0 });
        }
        hourlyData.get(hour).clicks++;
      }
    });
    
    return Array.from(hourlyData.values()).sort((a, b) => a.hour - b.hour);
  }

  /**
   * Generate recommendations based on performance
   * @param {object} analytics - Analytics data
   * @returns {Promise<array>} - Recommendations
   */
  async generateRecommendations(analytics) {
    const recommendations = [];
    
    // Recommendation: Open Rate
    if (analytics.rates.openRate < 15) {
      recommendations.push({
        category: 'Subject Line',
        suggestion: 'Subject line needs improvement. Try more compelling, action-oriented language.',
        priority: 'high',
        expectedImprovement: '5-10% increase in open rate'
      });
    } else if (analytics.rates.openRate > 25) {
      recommendations.push({
        category: 'Subject Line',
        suggestion: 'Excellent subject line! Maintain this approach in future campaigns.',
        priority: 'low',
        expectedImprovement: 'Continue current strategy'
      });
    }
    
    // Recommendation: Click Rate
    if (analytics.rates.clickRate < 3) {
      recommendations.push({
        category: 'CTA & Content',
        suggestion: 'Low click rate. Make CTA more prominent and value proposition clearer.',
        priority: 'high',
        expectedImprovement: '3-5% increase in click rate'
      });
    }
    
    // Recommendation: Segment Performance
    if (analytics.segmentPerformance && analytics.segmentPerformance.length > 0) {
      const topSegment = analytics.segmentPerformance[0];
      const bottomSegment = analytics.segmentPerformance[analytics.segmentPerformance.length - 1];
      
      if (topSegment.score > bottomSegment.score * 2) {
        recommendations.push({
          category: 'Segmentation',
          suggestion: `Focus more on "${topSegment.segmentName}" segment which shows 2x better performance.`,
          priority: 'medium',
          expectedImprovement: '10-15% overall score improvement'
        });
      }
    }
    
    // Recommendation: Send Time
    if (analytics.timeSlotPerformance) {
      recommendations.push({
        category: 'Timing',
        suggestion: `Best engagement observed during ${analytics.timeSlotPerformance.timeSlot}. Schedule future campaigns accordingly.`,
        priority: 'medium',
        expectedImprovement: '3-5% improvement in engagement'
      });
    }
    
    // General campaign score recommendation
    if (analytics.campaignScore < 10) {
      recommendations.push({
        category: 'Overall',
        suggestion: 'Campaign needs significant optimization. Consider complete strategy revision.',
        priority: 'high',
        expectedImprovement: 'Up to 50% improvement possible'
      });
    } else if (analytics.campaignScore > 20) {
      recommendations.push({
        category: 'Overall',
        suggestion: 'Outstanding performance! Use this as a template for future campaigns.',
        priority: 'low',
        expectedImprovement: 'Maintain excellence'
      });
    }
    
    return recommendations;
  }

  /**
   * Identify top performing elements
   * @param {object} analytics - Analytics data
   * @returns {object} - Top performers
   */
  identifyTopPerformers(analytics) {
    const topPerformers = {
      bestSegment: null,
      bestTimeSlot: null,
      bestVariant: null
    };
    
    // Best segment
    if (analytics.segmentPerformance && analytics.segmentPerformance.length > 0) {
      topPerformers.bestSegment = analytics.segmentPerformance[0].segmentName;
    }
    
    // Best time slot
    if (analytics.timeSlotPerformance) {
      topPerformers.bestTimeSlot = analytics.timeSlotPerformance.timeSlot;
    }
    
    // Best A/B variant
    if (analytics.abTestResults && analytics.abTestResults.length > 0) {
      const winner = analytics.abTestResults.find(v => v.winner);
      topPerformers.bestVariant = winner ? winner.variant : analytics.abTestResults[0].variant;
    }
    
    return topPerformers;
  }

  /**
   * Real-time analytics update (for live monitoring)
   * @param {string} campaignId - Campaign ID
   * @returns {Promise<object>} - Quick stats
   */
  async getRealtimeStats(campaignId) {
    const emails = await Email.find({ campaignId });
    
    const stats = {
      totalSent: emails.length,
      recentOpens: emails.filter(e => 
        e.engagement.opened && 
        (Date.now() - new Date(e.engagement.openedAt).getTime()) < 3600000
      ).length,
      recentClicks: emails.filter(e => 
        e.engagement.clicked && 
        (Date.now() - new Date(e.engagement.clickedAt).getTime()) < 3600000
      ).length,
      timestamp: new Date()
    };
    
    return stats;
  }

  /**
   * Compare campaign performance with historical average
   * @param {string} campaignId - Current campaign ID
   * @returns {Promise<object>} - Comparison data
   */
  async compareWithHistorical(campaignId) {
    const currentAnalytics = await Analytics.findOne({ campaignId });
    
    // Get all past campaigns
    const allAnalytics = await Analytics.find({ 
      campaignId: { $ne: campaignId } 
    });
    
    if (allAnalytics.length === 0) {
      return {
        comparison: 'first_campaign',
        message: 'This is your first campaign. No historical data for comparison.'
      };
    }
    
    const avgOpenRate = allAnalytics.reduce((sum, a) => sum + a.rates.openRate, 0) / allAnalytics.length;
    const avgClickRate = allAnalytics.reduce((sum, a) => sum + a.rates.clickRate, 0) / allAnalytics.length;
    const avgScore = allAnalytics.reduce((sum, a) => sum + a.campaignScore, 0) / allAnalytics.length;
    
    return {
      current: {
        openRate: currentAnalytics.rates.openRate,
        clickRate: currentAnalytics.rates.clickRate,
        score: currentAnalytics.campaignScore
      },
      historical: {
        avgOpenRate,
        avgClickRate,
        avgScore
      },
      performance: {
        openRateDiff: currentAnalytics.rates.openRate - avgOpenRate,
        clickRateDiff: currentAnalytics.rates.clickRate - avgClickRate,
        scoreDiff: currentAnalytics.campaignScore - avgScore
      }
    };
  }
}

module.exports = new AnalyticsAgent();
