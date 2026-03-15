const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const campaignUnderstandingAgent = require('../agents/campaignUnderstandingAgent');
const strategyAgent = require('../agents/strategyAgent');
const contentGenerationAgent = require('../agents/contentGenerationAgent');
const executionAgent = require('../agents/executionAgent');
const analyticsAgent = require('../agents/analyticsAgent');
const optimizationAgent = require('../agents/optimizationAgent');

/**
 * POST /api/campaigns/create
 * Create new campaign from natural language brief
 */
router.post('/create', async (req, res) => {
  try {
    const { briefText } = req.body;
    
    if (!briefText) {
      return res.status(400).json({
        status: 'error',
        message: 'Campaign brief text is required'
      });
    }
    
    console.log('\n🚀 Starting Campaign Creation Pipeline...\n');
    
    // Agent 1: Extract structured data
    const structuredData = await campaignUnderstandingAgent.process(briefText);
    
    // Agent 2: Generate strategy
    const strategy = await strategyAgent.generateStrategy(structuredData);
    
    // Agent 3: Generate content
    const content = await contentGenerationAgent.generateContent(structuredData, strategy);
    
    // Create campaign record
    const campaign = new Campaign({
      briefText,
      structuredData,
      strategy,
      content,
      approval: {
        status: 'pending'
      }
    });
    
    await campaign.save();
    
    console.log('✅ Campaign Created Successfully!\n');
    
    res.status(201).json({
      status: 'success',
      message: 'Campaign created and ready for approval',
      data: {
        campaignId: campaign.campaignId,
        campaign: campaign
      }
    });
    
  } catch (error) {
    console.error('Campaign Creation Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/campaigns/:campaignId
 * Get campaign details
 */
router.get('/:campaignId', async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ campaignId: req.params.campaignId });
    
    if (!campaign) {
      return res.status(404).json({
        status: 'error',
        message: 'Campaign not found'
      });
    }
    
    res.json({
      status: 'success',
      data: campaign
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/campaigns
 * Get all campaigns with pagination
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const campaigns = await Campaign.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Campaign.countDocuments();
    
    res.json({
      status: 'success',
      data: {
        campaigns,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
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
 * PUT /api/campaigns/:campaignId/approve
 * Approve campaign for execution
 */
router.put('/:campaignId/approve', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { approvedBy, modifications } = req.body;
    
    const campaign = await Campaign.findOne({ campaignId });
    
    if (!campaign) {
      return res.status(404).json({
        status: 'error',
        message: 'Campaign not found'
      });
    }
    
    // Update approval status
    campaign.approval.status = 'approved';
    campaign.approval.approvedBy = approvedBy || 'Admin';
    campaign.approval.approvedAt = new Date();
    
    // Apply modifications if provided
    if (modifications) {
      if (modifications.subjectLine) {
        campaign.content.selectedSubjectLine = modifications.subjectLine;
      }
      if (modifications.emailBody) {
        campaign.content.emailBody = modifications.emailBody;
      }
      campaign.approval.editNotes = 'Modified by user';
    }
    
    await campaign.save();
    
    res.json({
      status: 'success',
      message: 'Campaign approved successfully',
      data: campaign
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * PUT /api/campaigns/:campaignId/reject
 * Reject campaign
 */
router.put('/:campaignId/reject', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { reason } = req.body;
    
    const campaign = await Campaign.findOne({ campaignId });
    
    if (!campaign) {
      return res.status(404).json({
        status: 'error',
        message: 'Campaign not found'
      });
    }
    
    campaign.approval.status = 'rejected';
    campaign.approval.rejectionReason = reason || 'No reason provided';
    
    await campaign.save();
    
    res.json({
      status: 'success',
      message: 'Campaign rejected',
      data: campaign
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * POST /api/campaigns/:campaignId/execute
 * Execute approved campaign
 */
router.post('/:campaignId/execute', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const campaign = await Campaign.findOne({ campaignId });
    
    if (!campaign) {
      return res.status(404).json({
        status: 'error',
        message: 'Campaign not found'
      });
    }
    
    if (campaign.approval.status !== 'approved') {
      return res.status(400).json({
        status: 'error',
        message: 'Campaign must be approved before execution'
      });
    }
    
    console.log('\n🚀 Starting Campaign Execution...\n');
    
    // Update execution status
    campaign.execution.status = 'in_progress';
    campaign.execution.startedAt = new Date();
    await campaign.save();
    
    // Agent 5: Execute campaign
    const executionSummary = await executionAgent.executeCampaign(campaign);
    
    // Update campaign with execution results
    campaign.execution.status = 'completed';
    campaign.execution.completedAt = executionSummary.completedAt;
    campaign.execution.totalSent = executionSummary.totalSent;
    campaign.execution.totalFailed = executionSummary.totalFailed;
    await campaign.save();
    
    // Agent 6: Calculate initial analytics
    setTimeout(async () => {
      try {
        await analyticsAgent.calculateAnalytics(campaignId);
      } catch (error) {
        console.error('Analytics calculation error:', error);
      }
    }, 5000);
    
    res.json({
      status: 'success',
      message: 'Campaign executed successfully',
      data: {
        campaign,
        executionSummary
      }
    });
    
  } catch (error) {
    console.error('Campaign Execution Error:', error);
    
    // Update campaign status to failed
    try {
      await Campaign.updateOne(
        { campaignId: req.params.campaignId },
        { 
          'execution.status': 'failed',
          $push: { 'execution.errorLog': error.message }
        }
      );
    } catch (updateError) {
      console.error('Failed to update campaign status:', updateError);
    }
    
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * POST /api/campaigns/:campaignId/optimize
 * Generate optimized version of campaign
 */
router.post('/:campaignId/optimize', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    console.log('\n🔄 Starting Campaign Optimization...\n');
    
    // Agent 7: Generate optimization
    const optimization = await optimizationAgent.optimizeCampaign(campaignId);
    
    if (!optimization.ready) {
      return res.status(400).json({
        status: 'pending',
        message: optimization.message
      });
    }
    
    res.json({
      status: 'success',
      message: 'Optimization recommendations generated',
      data: optimization
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * POST /api/campaigns/:campaignId/create-optimized
 * Create new campaign based on optimization
 */
router.post('/:campaignId/create-optimized', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const result = await optimizationAgent.createOptimizedCampaignVersion(campaignId);
    
    res.json({
      status: 'success',
      message: result.message,
      data: result
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/campaigns/:campaignId/history
 * Get optimization history chain
 */
router.get('/:campaignId/history', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const history = await optimizationAgent.getOptimizationHistory(campaignId);
    
    res.json({
      status: 'success',
      data: history
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * DELETE /api/campaigns/:campaignId
 * Delete campaign
 */
router.delete('/:campaignId', async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({ 
      campaignId: req.params.campaignId 
    });
    
    if (!campaign) {
      return res.status(404).json({
        status: 'error',
        message: 'Campaign not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Campaign deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
