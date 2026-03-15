const { callOpenAIJSON } = require('../config/openai');

/**
 * Strategy Agent
 * Designs campaign strategy including segmentation, timing, tone, and approach
 */
class StrategyAgent {
  constructor() {
    this.systemPrompt = `You are a senior email marketing strategist for BFSI companies in India.
Design optimal email campaign strategies based on product, audience, and goals.

Consider:
1. Customer Segmentation - Create meaningful segments
2. Send Timing - Best time and day for BFSI emails in India
3. Tone - Formal, friendly, urgent, emotional
4. Subject Line Strategy - What type of subject line works best
5. A/B Testing - Should we test variants?

Return ONLY valid JSON in this format:
{
  "segments": [
    {"name": "string", "criteria": "string", "estimatedSize": number, "priority": "high|medium|low"}
  ],
  "sendTime": {
    "recommendedDay": "string",
    "recommendedTimeSlot": "string (e.g., 10:00-12:00)",
    "timezone": "Asia/Kolkata",
    "reasoning": "string"
  },
  "tone": "string (formal|friendly|urgent|emotional)",
  "toneReasoning": "string",
  "subjectLineStrategy": "string",
  "abTesting": {
    "enabled": boolean,
    "variants": number,
    "testVariable": "string"
  },
  "expectedOutcome": {
    "estimatedOpenRate": number,
    "estimatedClickRate": number,
    "confidence": "high|medium|low"
  }
}`;
  }

  /**
   * Generate campaign strategy based on structured data
   * @param {object} structuredData - Structured campaign data from Understanding Agent
   * @returns {Promise<object>} - Campaign strategy
   */
  async generateStrategy(structuredData) {
    try {
      console.log('🤖 Strategy Agent: Generating campaign strategy...');
      
      const userPrompt = `Design an email campaign strategy for:

Product: ${structuredData.product}
Base Offer: ${structuredData.baseOffer}
Special Offer: ${structuredData.specialOffer}
Target Audience: ${structuredData.targetAudience}
Include Inactive Customers: ${structuredData.includeInactive}
Goals: ${structuredData.goals.join(', ')}

This is for a BFSI company in India. Design optimal strategy considering:
- Indian banking customer behavior
- Best timing for email engagement in India
- Appropriate tone for financial services
- Segment-wise personalization
- A/B testing opportunities

Return complete strategy as JSON.`;

      const strategy = await callOpenAIJSON(this.systemPrompt, userPrompt);
      
      // Enhance with business rules
      const enhancedStrategy = this.applyBusinessRules(strategy, structuredData);
      
      console.log('✅ Strategy Agent: Strategy generated');
      console.log('📊 Segments:', enhancedStrategy.segments.length);
      console.log('⏰ Recommended Time:', enhancedStrategy.sendTime.recommendedTimeSlot);
      console.log('🎭 Tone:', enhancedStrategy.tone);
      
      return enhancedStrategy;
      
    } catch (error) {
      console.error('❌ Strategy Agent Error:', error.message);
      throw new Error(`Failed to generate strategy: ${error.message}`);
    }
  }

  /**
   * Apply business rules and enhance strategy
   * @param {object} strategy - Raw strategy from AI
   * @param {object} structuredData - Original campaign data
   * @returns {object} - Enhanced strategy
   */
  applyBusinessRules(strategy, structuredData) {
    // Business Rule: Senior citizens get priority segment
    if (structuredData.targetAudience.toLowerCase().includes('senior')) {
      const seniorSegment = strategy.segments.find(s => 
        s.name.toLowerCase().includes('senior')
      );
      if (seniorSegment) {
        seniorSegment.priority = 'high';
      }
    }

    // Business Rule: If including inactive, create re-engagement segment
    if (structuredData.includeInactive) {
      const hasInactiveSegment = strategy.segments.some(s => 
        s.name.toLowerCase().includes('inactive')
      );
      
      if (!hasInactiveSegment) {
        strategy.segments.push({
          name: "Re-engagement: Inactive Customers",
          criteria: "No activity in last 90 days",
          estimatedSize: 1000,
          priority: "medium"
        });
      }
    }

    // Business Rule: Default to morning slot for BFSI
    if (!strategy.sendTime.recommendedTimeSlot) {
      strategy.sendTime.recommendedTimeSlot = "10:00-12:00";
      strategy.sendTime.recommendedDay = "Tuesday";
      strategy.sendTime.reasoning = "Morning hours show higher engagement for BFSI emails";
    }

    // Business Rule: A/B testing for campaigns with special offers
    if (structuredData.specialOffer && !strategy.abTesting.enabled) {
      strategy.abTesting.enabled = true;
      strategy.abTesting.variants = 2;
      strategy.abTesting.testVariable = "subject_line";
    }

    // Add default expected outcomes if missing
    if (!strategy.expectedOutcome) {
      strategy.expectedOutcome = {
        estimatedOpenRate: 18,
        estimatedClickRate: 4,
        confidence: "medium"
      };
    }

    return strategy;
  }

  /**
   * Calculate segment sizes based on historical data (mock for now)
   * @param {array} segments - Segment definitions
   * @returns {array} - Segments with calculated sizes
   */
  calculateSegmentSizes(segments) {
    // In production, this would query actual customer database
    return segments.map(segment => {
      segment.calculatedSize = Math.floor(Math.random() * 5000) + 1000;
      return segment;
    });
  }

  /**
   * Validate strategy completeness
   * @param {object} strategy - Strategy object
   * @returns {boolean} - Is valid
   */
  validateStrategy(strategy) {
    const required = ['segments', 'sendTime', 'tone', 'subjectLineStrategy'];
    return required.every(field => strategy[field]);
  }
}

module.exports = new StrategyAgent();
