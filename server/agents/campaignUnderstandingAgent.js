const { callOpenAIJSON } = require('../config/openai');

/**
 * Campaign Understanding Agent
 * Extracts structured campaign details from natural language input
 */
class CampaignUnderstandingAgent {
  constructor() {
    this.systemPrompt = `You are an expert campaign analyst for a BFSI company in India.
Your task is to extract structured campaign information from natural language briefs.

Extract the following information:
- product: Name of the product being promoted
- baseOffer: Main offer or benefit
- specialOffer: Any special offers or conditions
- goals: Array of campaign goals (e.g., "open_rate", "click_rate", "conversions")
- targetAudience: Description of target audience
- includeInactive: Boolean - whether to include inactive customers
- cta: Call-to-action URL
- additionalInfo: Any other relevant information

Return ONLY valid JSON in this exact format:
{
  "product": "string",
  "baseOffer": "string",
  "specialOffer": "string",
  "goals": ["array of strings"],
  "targetAudience": "string",
  "includeInactive": boolean,
  "cta": "string",
  "additionalInfo": "string"
}`;
  }

  /**
   * Process natural language brief and extract structured data
   * @param {string} briefText - Natural language campaign brief
   * @returns {Promise<object>} - Structured campaign data
   */
  async process(briefText) {
    try {
      console.log('🤖 Campaign Understanding Agent: Processing brief...');
      
      // Store briefText for use in validation
      this.briefText = briefText;
      
      const userPrompt = `Extract structured campaign details from this brief:

"${briefText}"

Analyze carefully and return structured JSON with all campaign details.`;

      const structuredData = await callOpenAIJSON(this.systemPrompt, userPrompt);
      
      // Validate and add defaults
      const validated = this.validateStructure(structuredData);
      
      console.log('✅ Campaign Understanding Agent: Extraction complete');
      console.log('📋 Product:', validated.product);
      console.log('🎯 Goals:', validated.goals.join(', '));
      
      return validated;
      
    } catch (error) {
      console.error('❌ Campaign Understanding Agent Error:', error.message);
      throw new Error(`Failed to extract campaign details: ${error.message}`);
    }
  }

  /**
   * Validate and add defaults to structured data
   * @param {object} data - Raw extracted data
   * @returns {object} - Validated data
   */
  validateStructure(data) {
    // Try to extract product from briefText if not provided
    let product = data.product;
    if (!product || product === 'Unknown Product') {
      // Try to find product keywords in the brief
      const briefLower = (this.briefText || '').toLowerCase();
      if (briefLower.includes('credit card') || briefLower.includes('card')) {
        product = 'Premium Credit Card';
      } else if (briefLower.includes('loan') || briefLower.includes('personal loan')) {
        product = 'Personal Loan';
      } else if (briefLower.includes('insurance') || briefLower.includes('policy')) {
        product = 'Insurance Policy';
      } else if (briefLower.includes('savings') || briefLower.includes('account')) {
        product = 'Savings Account';
      } else if (briefLower.includes('investment') || briefLower.includes('mutual fund')) {
        product = 'Investment Plan';
      } else if (briefLower.includes('mortgage') || briefLower.includes('home loan')) {
        product = 'Home Loan';
      } else {
        // Extract first meaningful phrase from brief (up to 50 chars)
        const cleanBrief = (this.briefText || '').trim().split('.')[0];
        product = cleanBrief.length > 50 ? cleanBrief.substring(0, 47) + '...' : cleanBrief;
      }
    }
    
    return {
      product: product || 'Email Campaign',
      baseOffer: data.baseOffer || '',
      specialOffer: data.specialOffer || '',
      goals: Array.isArray(data.goals) ? data.goals : ['open_rate', 'click_rate'],
      targetAudience: data.targetAudience || 'All customers',
      includeInactive: data.includeInactive !== undefined ? data.includeInactive : false,
      cta: data.cta || '',
      additionalInfo: data.additionalInfo || ''
    };
  }

  /**
   * Extract key insights from the brief
   * @param {object} structuredData - Structured campaign data
   * @returns {object} - Key insights
   */
  extractInsights(structuredData) {
    const insights = {
      productCategory: this.categorizeProduct(structuredData.product),
      offerStrength: this.evaluateOffer(structuredData.baseOffer),
      urgencyLevel: this.detectUrgency(structuredData.baseOffer + ' ' + structuredData.specialOffer),
      targetSegmentation: this.analyzeAudience(structuredData.targetAudience)
    };
    
    return insights;
  }

  categorizeProduct(product) {
    const keywords = {
      'deposit': 'deposits',
      'savings': 'savings',
      'loan': 'loans',
      'credit': 'credit',
      'insurance': 'insurance',
      'investment': 'investments'
    };
    
    const productLower = product.toLowerCase();
    for (const [keyword, category] of Object.entries(keywords)) {
      if (productLower.includes(keyword)) {
        return category;
      }
    }
    return 'general';
  }

  evaluateOffer(offer) {
    const offerLower = offer.toLowerCase();
    if (offerLower.includes('free') || offerLower.includes('bonus')) return 'strong';
    if (offerLower.includes('discount') || offerLower.includes('higher')) return 'medium';
    return 'standard';
  }

  detectUrgency(text) {
    const urgencyKeywords = ['limited', 'now', 'today', 'hurry', 'expires', 'deadline'];
    const textLower = text.toLowerCase();
    const urgencyCount = urgencyKeywords.filter(kw => textLower.includes(kw)).length;
    
    if (urgencyCount >= 2) return 'high';
    if (urgencyCount === 1) return 'medium';
    return 'low';
  }

  analyzeAudience(audience) {
    const audienceLower = audience.toLowerCase();
    if (audienceLower.includes('senior') || audienceLower.includes('elderly')) {
      return 'senior_citizens';
    }
    if (audienceLower.includes('female') || audienceLower.includes('women')) {
      return 'gender_specific';
    }
    if (audienceLower.includes('inactive')) {
      return 're_engagement';
    }
    return 'general';
  }
}

module.exports = new CampaignUnderstandingAgent();
