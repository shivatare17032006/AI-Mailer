const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const Campaign = require('../models/Campaign');
const analyticsAgent = require('../agents/analyticsAgent');

/**
 * GET /api/analytics/:campaignId
 * Get analytics for specific campaign
 */
router.get('/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    let analytics = await Analytics.findOne({ campaignId });
    
    if (!analytics) {
      // Calculate analytics if not exists
      analytics = await analyticsAgent.calculateAnalytics(campaignId);
    }
    
    res.json({
      status: 'success',
      data: analytics
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * POST /api/analytics/:campaignId/refresh
 * Recalculate analytics for campaign
 */
router.post('/:campaignId/refresh', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    console.log(`🔄 Refreshing analytics for ${campaignId}...`);
    
    const analytics = await analyticsAgent.calculateAnalytics(campaignId);
    
    // Update campaign analytics summary
    await Campaign.updateOne(
      { campaignId },
      {
        'analytics.openRate': analytics.rates.openRate,
        'analytics.clickRate': analytics.rates.clickRate,
        'analytics.campaignScore': analytics.campaignScore,
        'analytics.totalOpens': analytics.overall.totalOpens,
        'analytics.totalClicks': analytics.overall.totalClicks,
        'analytics.uniqueOpens': analytics.overall.uniqueOpens,
        'analytics.uniqueClicks': analytics.overall.uniqueClicks,
        'analytics.lastUpdated': new Date()
      }
    );
    
    res.json({
      status: 'success',
      message: 'Analytics refreshed successfully',
      data: analytics
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/:campaignId/realtime
 * Get real-time stats
 */
router.get('/:campaignId/realtime', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const realtimeStats = await analyticsAgent.getRealtimeStats(campaignId);
    
    res.json({
      status: 'success',
      data: realtimeStats
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/:campaignId/compare
 * Compare with historical performance
 */
router.get('/:campaignId/compare', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const comparison = await analyticsAgent.compareWithHistorical(campaignId);
    
    res.json({
      status: 'success',
      data: comparison
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/dashboard/overview
 * Get dashboard overview with aggregate stats
 */
router.get('/dashboard/overview', async (req, res) => {
  try {
    // Get all campaigns
    const campaigns = await Campaign.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    const totalCampaigns = await Campaign.countDocuments();
    
    // Calculate aggregate metrics
    const allAnalytics = await Analytics.find();
    
    const averageOpenRate = allAnalytics.length > 0
      ? allAnalytics.reduce((sum, a) => sum + a.rates.openRate, 0) / allAnalytics.length
      : 0;
    
    const averageClickRate = allAnalytics.length > 0
      ? allAnalytics.reduce((sum, a) => sum + a.rates.clickRate, 0) / allAnalytics.length
      : 0;
    
    const averageCampaignScore = allAnalytics.length > 0
      ? allAnalytics.reduce((sum, a) => sum + a.campaignScore, 0) / allAnalytics.length
      : 0;
    
    // Find best performing campaign
    let bestCampaign = null;
    if (allAnalytics.length > 0) {
      const bestAnalytics = allAnalytics.reduce((best, current) => 
        current.campaignScore > best.campaignScore ? current : best
      );
      bestCampaign = await Campaign.findOne({ campaignId: bestAnalytics.campaignId });
    }
    
    // Find best performing segment across all campaigns
    const allSegments = [];
    allAnalytics.forEach(analytics => {
      if (analytics.segmentPerformance) {
        allSegments.push(...analytics.segmentPerformance);
      }
    });
    
    const bestSegment = allSegments.length > 0
      ? allSegments.reduce((best, current) => 
          current.score > best.score ? current : best
        ).segmentName
      : 'N/A';
    
    // Calculate total emails sent
    const totalEmailsSent = campaigns.reduce((sum, c) => 
      sum + (c.execution.totalSent || 0), 0
    );
    
    res.json({
      status: 'success',
      data: {
        overview: {
          totalCampaigns,
          totalEmailsSent,
          averageOpenRate: averageOpenRate.toFixed(2),
          averageClickRate: averageClickRate.toFixed(2),
          averageCampaignScore: averageCampaignScore.toFixed(2)
        },
        bestPerformers: {
          campaign: bestCampaign ? {
            campaignId: bestCampaign.campaignId,
            product: bestCampaign.structuredData?.product || bestCampaign.briefText?.substring(0, 30) || 'Campaign',
            score: bestCampaign.analytics.campaignScore
          } : null,
          segment: bestSegment
        },
        recentCampaigns: campaigns.slice(0, 5).map(c => ({
          campaignId: c.campaignId,
          product: c.structuredData?.product || c.briefText?.substring(0, 30) || 'Campaign',
          status: c.approval.status,
          executionStatus: c.execution.status,
          score: c.analytics.campaignScore || 0,
          createdAt: c.createdAt
        }))
      }
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/charts/performance
 * Get performance chart data for all campaigns
 */
router.get('/charts/performance', async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .sort({ createdAt: 1 })
      .limit(10);
    
    const chartData = await Promise.all(
      campaigns.map(async (campaign) => {
        const analytics = await Analytics.findOne({ 
          campaignId: campaign.campaignId 
        });
        
        return {
          campaignId: campaign.campaignId,
          product: (campaign.structuredData?.product || campaign.briefText?.substring(0, 15) || 'Campaign').substring(0, 15),
          openRate: analytics ? analytics.rates.openRate : 0,
          clickRate: analytics ? analytics.rates.clickRate : 0,
          score: analytics ? analytics.campaignScore : 0,
          date: campaign.createdAt
        };
      })
    );
    
    res.json({
      status: 'success',
      data: chartData
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/segments/performance
 * Get segment performance across all campaigns
 */
router.get('/segments/performance', async (req, res) => {
  try {
    const allAnalytics = await Analytics.find();
    
    // Aggregate segment performance
    const segmentMap = new Map();
    
    allAnalytics.forEach(analytics => {
      if (analytics.segmentPerformance) {
        analytics.segmentPerformance.forEach(seg => {
          if (!segmentMap.has(seg.segmentName)) {
            segmentMap.set(seg.segmentName, {
              segmentName: seg.segmentName,
              totalSent: 0,
              totalOpened: 0,
              totalClicked: 0,
              campaigns: 0
            });
          }
          
          const data = segmentMap.get(seg.segmentName);
          data.totalSent += seg.sent;
          data.totalOpened += seg.opened;
          data.totalClicked += seg.clicked;
          data.campaigns += 1;
        });
      }
    });
    
    const segmentPerformance = Array.from(segmentMap.values()).map(seg => ({
      ...seg,
      avgOpenRate: seg.totalSent > 0 ? (seg.totalOpened / seg.totalSent) * 100 : 0,
      avgClickRate: seg.totalSent > 0 ? (seg.totalClicked / seg.totalSent) * 100 : 0
    }));
    
    // Sort by performance
    segmentPerformance.sort((a, b) => {
      const scoreA = (0.6 * a.avgOpenRate) + (0.4 * a.avgClickRate);
      const scoreB = (0.6 * b.avgOpenRate) + (0.4 * b.avgClickRate);
      return scoreB - scoreA;
    });
    
    res.json({
      status: 'success',
      data: segmentPerformance
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
