const { callOpenAI } = require('../config/openai');
const Campaign = require('../models/Campaign');
const Analytics = require('../models/Analytics');

/**
 * Optimization Agent
 * Analyzes performance and generates improved campaign versions
 */
class OptimizationAgent {
  constructor() {
    this.systemPrompt = `You are an expert email campaign optimizer for BFSI companies in India.
Analyze campaign performance data and suggest specific, actionable improvements.

Focus on:
1. Subject line optimization for better open rates
2. Content and CTA improvements for better click rates
3. Segment targeting refinements
4. Send time optimization
5. Tone and messaging adjustments

Provide concrete, data-driven recommendations that can be directly implemented.`;

    this.minimumDataThreshold = 100; // Minimum emails sent before optimization
    this.scoringWeights = {
      openRate: 0.6,
      clickRate: 0.4
    };
  }

  /**
   * Analyze campaign and generate optimized version
   * @param {string} campaignId - Campaign ID to optimize
   * @returns {Promise<object>} - Optimization recommendations
   */
  async optimizeCampaign(campaignId) {
    try {
      console.log('🤖 Optimization Agent: Analyzing campaign performance...');
      
      // Get campaign and analytics data
      const campaign = await Campaign.findOne({ campaignId });
      const analytics = await Analytics.findOne({ campaignId });
      
      if (!campaign || !analytics) {
        throw new Error('Campaign or analytics data not found');
      }
      
      // Check if enough data is available
      if (analytics.overall.totalSent < this.minimumDataThreshold) {
        return {
          ready: false,
          message: `Need at least ${this.minimumDataThreshold} emails sent for meaningful optimization. Current: ${analytics.overall.totalSent}`
        };
      }
      
      // Identify weak points
      const weakPoints = this.identifyWeakPoints(analytics);
      
      // Generate AI recommendations
      const aiRecommendations = await this.generateAIRecommendations(campaign, analytics, weakPoints);
      
      // Create optimized campaign brief
      const optimizedBrief = await this.createOptimizedBrief(campaign, aiRecommendations);
      
      const optimization = {
        ready: true,
        originalCampaignId: campaignId,
        currentScore: analytics.campaignScore,
        weakPoints: weakPoints,
        recommendations: aiRecommendations,
        optimizedBrief: optimizedBrief,
        expectedImprovement: this.estimateImprovement(weakPoints),
        iterationNumber: (campaign.optimization.iterationNumber || 0) + 1
      };
      
      console.log('✅ Optimization Agent: Recommendations generated');
      console.log(`📉 Weak Points: ${weakPoints.join(', ')}`);
      console.log(`📈 Expected Improvement: ${optimization.expectedImprovement}`);
      
      return optimization;
      
    } catch (error) {
      console.error('❌ Optimization Agent Error:', error.message);
      throw new Error(`Optimization failed: ${error.message}`);
    }
  }

  /**
   * Identify weak points in campaign performance
   * @param {object} analytics - Analytics data
   * @returns {array} - List of weak points
   */
  identifyWeakPoints(analytics) {
    const weakPoints = [];
    
    // Check open rate
    if (analytics.rates.openRate < 15) {
      weakPoints.push('low_open_rate');
    }
    
    // Check click rate
    if (analytics.rates.clickRate < 3) {
      weakPoints.push('low_click_rate');
    }
    
    // Check delivery rate
    if (analytics.rates.deliveryRate < 95) {
      weakPoints.push('poor_delivery');
    }
    
    // Check segment performance variance
    if (analytics.segmentPerformance && analytics.segmentPerformance.length > 1) {
      const scores = analytics.segmentPerformance.map(s => s.score);
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      
      if (maxScore > minScore * 2) {
        weakPoints.push('inconsistent_segment_performance');
      }
    }
    
    // Check click-to-open rate
    if (analytics.rates.clickToOpenRate < 20) {
      weakPoints.push('low_engagement_after_open');
    }
    
    if (weakPoints.length === 0) {
      weakPoints.push('minor_optimizations');
    }
    
    return weakPoints;
  }

  /**
   * Generate AI-powered recommendations
   * @param {object} campaign - Campaign data
   * @param {object} analytics - Analytics data
   * @param {array} weakPoints - Identified weak points
   * @returns {Promise<object>} - AI recommendations
   */
  async generateAIRecommendations(campaign, analytics, weakPoints) {
    const performanceSummary = `
Campaign Performance Analysis:
- Product: ${campaign.structuredData.product}
- Current Open Rate: ${analytics.rates.openRate.toFixed(2)}%
- Current Click Rate: ${analytics.rates.clickRate.toFixed(2)}%
- Campaign Score: ${analytics.campaignScore.toFixed(2)}
- Weak Points: ${weakPoints.join(', ')}

Subject Line Used: "${campaign.content.selectedSubjectLine}"
Tone: ${campaign.strategy.tone}
Target Segments: ${campaign.strategy.segments.map(s => s.name).join(', ')}

Segment Performance:
${analytics.segmentPerformance.map(s => 
  `- ${s.segmentName}: Open ${s.openRate.toFixed(1)}%, Click ${s.clickRate.toFixed(1)}%`
).join('\n')}
`;

    const userPrompt = `${performanceSummary}

Based on this data, provide specific recommendations to improve:
1. Subject line (if open rate is low)
2. Email content and CTA (if click rate is low)
3. Segment targeting (if performance varies)
4. Overall strategy

Be specific and actionable. Format as clear bullet points.`;

    try {
      const recommendations = await callOpenAI(this.systemPrompt, userPrompt, 0.7, 1500);
      
      return {
        aiGenerated: recommendations,
        weakPointsAddressed: weakPoints,
        focusAreas: this.getFocusAreas(weakPoints)
      };
      
    } catch (error) {
      console.warn('AI recommendations generation failed, using rule-based');
      return this.generateRuleBasedRecommendations(weakPoints, analytics);
    }
  }

  /**
   * Generate rule-based recommendations (fallback)
   * @param {array} weakPoints - Weak points
   * @param {object} analytics - Analytics data
   * @returns {object} - Recommendations
   */
  generateRuleBasedRecommendations(weakPoints, analytics) {
    const recommendations = [];
    
    if (weakPoints.includes('low_open_rate')) {
      recommendations.push('📧 Improve subject line: Add urgency, personalization, or curiosity gap');
      recommendations.push('⏰ Test different send times to reach inbox at optimal moment');
    }
    
    if (weakPoints.includes('low_click_rate')) {
      recommendations.push('🎯 Make CTA more prominent with contrasting colors');
      recommendations.push('💬 Clarify value proposition in first 2 sentences');
      recommendations.push('📱 Ensure mobile-friendly button sizes');
    }
    
    if (weakPoints.includes('inconsistent_segment_performance')) {
      recommendations.push('👥 Focus budget on high-performing segments');
      recommendations.push('🔍 Analyze why certain segments underperform');
    }
    
    if (weakPoints.includes('low_engagement_after_open')) {
      recommendations.push('✍️ Rewrite opening paragraph to hook readers immediately');
      recommendations.push('🔗 Add multiple CTA placements throughout email');
    }
    
    return {
      aiGenerated: recommendations.join('\n'),
      weakPointsAddressed: weakPoints,
      focusAreas: this.getFocusAreas(weakPoints)
    };
  }

  /**
   * Get focus areas based on weak points
   * @param {array} weakPoints - Weak points
   * @returns {array} - Focus areas
   */
  getFocusAreas(weakPoints) {
    const focusMap = {
      'low_open_rate': ['subject_line', 'send_time', 'from_name'],
      'low_click_rate': ['content', 'cta', 'value_proposition'],
      'poor_delivery': ['email_list', 'content_spam_score'],
      'inconsistent_segment_performance': ['segmentation', 'personalization'],
      'low_engagement_after_open': ['content_quality', 'cta_placement']
    };
    
    const focusAreas = new Set();
    weakPoints.forEach(wp => {
      if (focusMap[wp]) {
        focusMap[wp].forEach(area => focusAreas.add(area));
      }
    });
    
    return Array.from(focusAreas);
  }

  /**
   * Create optimized campaign brief
   * @param {object} campaign - Original campaign
   * @param {object} recommendations - Recommendations
   * @returns {Promise<string>} - Optimized brief
   */
  async createOptimizedBrief(campaign, recommendations) {
    const focusAreas = recommendations.focusAreas.join(', ');
    
    const optimizationPrompt = `Original campaign brief:
"${campaign.briefText}"

Performance issues: ${recommendations.weakPointsAddressed.join(', ')}
Focus areas: ${focusAreas}

Recommendations:
${recommendations.aiGenerated}

Rewrite the campaign brief incorporating these optimizations while maintaining the core offer and product.
Keep it concise and actionable.`;

    try {
      const optimizedBrief = await callOpenAI(
        'You are an expert marketing copywriter. Rewrite campaign briefs to incorporate performance optimizations.',
        optimizationPrompt,
        0.7,
        500
      );
      
      return optimizedBrief;
      
    } catch (error) {
      // Fallback: Return original with note
      return `${campaign.briefText}\n\nOptimization Focus: ${focusAreas}`;
    }
  }

  /**
   * Estimate improvement potential
   * @param {array} weakPoints - Weak points
   * @returns {string} - Improvement estimate
   */
  estimateImprovement(weakPoints) {
    const severityScore = weakPoints.length;
    
    if (severityScore >= 4) {
      return '30-50% score improvement possible with optimizations';
    } else if (severityScore >= 2) {
      return '15-30% score improvement expected';
    } else {
      return '5-15% incremental improvement';
    }
  }

  /**
   * Create new optimized campaign
   * @param {string} originalCampaignId - Original campaign ID
   * @returns {Promise<object>} - New campaign object
   */
  async createOptimizedCampaignVersion(originalCampaignId) {
    const optimization = await this.optimizeCampaign(originalCampaignId);
    
    if (!optimization.ready) {
      throw new Error(optimization.message);
    }
    
    const originalCampaign = await Campaign.findOne({ campaignId: originalCampaignId });
    
    // Create new campaign with optimizations
    const newCampaign = {
      briefText: optimization.optimizedBrief,
      optimization: {
        iterationNumber: optimization.iterationNumber,
        parentCampaignId: originalCampaignId,
        improvements: optimization.recommendations.focusAreas,
        optimizationReason: optimization.recommendations.aiGenerated
      }
    };
    
    return {
      success: true,
      newCampaignBrief: newCampaign.briefText,
      optimizationDetails: optimization,
      message: 'Optimized campaign ready. Submit this brief to create new campaign.'
    };
  }

  /**
   * Get optimization history for a campaign chain
   * @param {string} campaignId - Any campaign in the chain
   * @returns {Promise<array>} - Campaign chain with scores
   */
  async getOptimizationHistory(campaignId) {
    const campaign = await Campaign.findOne({ campaignId });
    
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    
    // Find all campaigns in this optimization chain
    const parentId = campaign.optimization.parentCampaignId || campaignId;
    
    const chain = await Campaign.find({
      $or: [
        { campaignId: parentId },
        { 'optimization.parentCampaignId': parentId }
      ]
    }).sort({ 'optimization.iterationNumber': 1 });
    
    // Get analytics for each
    const history = await Promise.all(
      chain.map(async (camp) => {
        const analytics = await Analytics.findOne({ campaignId: camp.campaignId });
        return {
          campaignId: camp.campaignId,
          iteration: camp.optimization.iterationNumber,
          score: analytics ? analytics.campaignScore : 0,
          openRate: analytics ? analytics.rates.openRate : 0,
          clickRate: analytics ? analytics.rates.clickRate : 0,
          improvements: camp.optimization.improvements
        };
      })
    );
    
    return history;
  }
}

module.exports = new OptimizationAgent();
