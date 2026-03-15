const { callOpenAI, callOpenAIJSON } = require('../config/openai');

/**
 * Content Generation Agent
 * Generates optimized email content including subject lines and body
 */
class ContentGenerationAgent {
  constructor() {
    this.subjectLinePrompt = `You are an expert email copywriter specializing in BFSI marketing in India.
Generate compelling subject lines optimized for high open rates.

Guidelines:
- Keep subject lines between 40-60 characters
- Use action-oriented language
- Create urgency when appropriate
- Personalize when possible
- Follow Indian market preferences
- Avoid spam trigger words

Return JSON with 3 subject line variants:
{
  "subjectLines": [
    {"text": "string", "type": "direct|emotional|urgency", "estimatedOpenRate": number},
    {"text": "string", "type": "direct|emotional|urgency", "estimatedOpenRate": number},
    {"text": "string", "type": "direct|emotional|urgency", "estimatedOpenRate": number}
  ],
  "recommended": "string (the best one)"
}`;

    this.emailBodyPrompt = `You are an expert email copywriter for BFSI products in India.
Write compelling email body content that drives clicks and conversions.

Guidelines:
- Start with personalized greeting
- Lead with compelling value proposition
- Include clear benefits
- Use short paragraphs and bullet points
- Add strong, clear CTA button
- Professional yet friendly tone
- Mobile-friendly format
- Include trust signals for financial products

Structure:
1. Personalized Opening
2. Value Proposition
3. Key Benefits (bullets)
4. Special Offer (if any)
5. Clear CTA
6. Trust/Safety message
7. Professional Closing

Return the email body as plain text with clear section markers.`;
  }

  /**
   * Generate complete email content
   * @param {object} structuredData - Campaign data
   * @param {object} strategy - Campaign strategy
   * @returns {Promise<object>} - Generated content
   */
  async generateContent(structuredData, strategy) {
    try {
      console.log('🤖 Content Generation Agent: Creating email content...');
      
      // Generate subject lines
      const subjectLines = await this.generateSubjectLines(structuredData, strategy);
      
      // Generate email body
      const emailBody = await this.generateEmailBody(structuredData, strategy);
      
      // Generate personalization blocks
      const personalization = this.createPersonalizationBlocks(structuredData, strategy);
      
      // Extract just the text from subject lines (model expects array of strings)
      const subjectLineTexts = subjectLines.subjectLines.map(sl => 
        typeof sl === 'string' ? sl : sl.text
      );
      
      const content = {
        subjectLines: subjectLineTexts,
        selectedSubjectLine: subjectLines.recommended,
        emailBody: emailBody,
        personalizationBlocks: personalization,
        ctaPlacement: 'center',
        metadata: {
          wordCount: emailBody.split(' ').length,
          estimatedReadTime: Math.ceil(emailBody.split(' ').length / 200),
          mobileOptimized: true
        }
      };
      
      console.log('✅ Content Generation Agent: Content created');
      console.log('📝 Subject lines generated:', content.subjectLines.length);
      console.log('📄 Email word count:', content.metadata.wordCount);
      
      return content;
      
    } catch (error) {
      console.error('❌ Content Generation Agent Error:', error.message);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  /**
   * Generate subject line variants
   * @param {object} structuredData - Campaign data
   * @param {object} strategy - Campaign strategy
   * @returns {Promise<object>} - Subject lines
   */
  async generateSubjectLines(structuredData, strategy) {
    const userPrompt = `Generate 3 subject line variants for this email campaign:

Product: ${structuredData.product}
Offer: ${structuredData.baseOffer}
Special Offer: ${structuredData.specialOffer}
Tone: ${strategy.tone}
Target: ${structuredData.targetAudience}

Strategy Notes: ${strategy.subjectLineStrategy}

Generate 3 different approaches: direct, emotional, and urgency-based.
Return as JSON with estimated open rates.`;

    try {
      const result = await callOpenAIJSON(this.subjectLinePrompt, userPrompt);
      
      // Validate and ensure we have 3 subject lines
      if (!result.subjectLines || result.subjectLines.length < 3) {
        return this.generateFallbackSubjectLines(structuredData);
      }
      
      return result;
      
    } catch (error) {
      console.warn('Subject line generation failed, using fallback');
      return this.generateFallbackSubjectLines(structuredData);
    }
  }

  /**
   * Generate email body content
   * @param {object} structuredData - Campaign data
   * @param {object} strategy - Campaign strategy
   * @returns {Promise<string>} - Email body HTML/text
   */
  async generateEmailBody(structuredData, strategy) {
    const userPrompt = `Write email body content for:

Product: ${structuredData.product}
Base Offer: ${structuredData.baseOffer}
Special Offer: ${structuredData.specialOffer}
Tone: ${strategy.tone}
Target Audience: ${structuredData.targetAudience}
CTA URL: ${structuredData.cta}

Write compelling, conversion-focused email body following best practices for Indian BFSI customers.
Keep it concise (200-300 words), include clear benefits, and strong CTA.`;

    try {
      const emailBody = await callOpenAI(this.emailBodyPrompt, userPrompt, 0.7, 1500);
      return this.formatEmailBody(emailBody, structuredData);
      
    } catch (error) {
      console.warn('Email body generation failed, using template');
      return this.generateFallbackEmailBody(structuredData);
    }
  }

  /**
   * Format email body with HTML structure
   * @param {string} content - Raw content
   * @param {object} structuredData - Campaign data
   * @returns {string} - Formatted HTML email
   */
  formatEmailBody(content, structuredData) {
    // Simple HTML template
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Campaign</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
    ${content.split('\n\n').map(para => `<p style="margin-bottom: 15px;">${para}</p>`).join('\n')}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${structuredData.cta}" style="background-color: #007bff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Explore ${structuredData.product}
      </a>
    </div>
    
    <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
      SuperBFSI - Your Trusted Financial Partner<br>
      This email was sent to you because you are a valued customer.
    </p>
  </div>
</body>
</html>`;
  }

  /**
   * Create personalization blocks for different segments
   * @param {object} structuredData - Campaign data
   * @param {object} strategy - Campaign strategy
   * @returns {object} - Personalization rules
   */
  createPersonalizationBlocks(structuredData, strategy) {
    const blocks = {
      greeting: {
        default: "Dear Valued Customer",
        senior: "Dear Respected Customer",
        female: "Dear Madam",
        male: "Dear Sir"
      },
      offerHighlight: {},
      closingNote: {
        default: "Thank you for being a valued member of the SuperBFSI family.",
        senior: "We value your trust and continued relationship with us.",
        inactive: "We've missed you! Come back and discover what's new."
      }
    };
    
    // Add special offer personalization
    if (structuredData.specialOffer) {
      blocks.offerHighlight.hasSpecialOffer = `Plus, ${structuredData.specialOffer}`;
    }
    
    return blocks;
  }

  /**
   * Fallback subject lines if AI generation fails
   * @param {object} structuredData - Campaign data
   * @returns {object} - Fallback subject lines
   */
  generateFallbackSubjectLines(structuredData) {
    return {
      subjectLines: [
        {
          text: `🎯 Introducing ${structuredData.product} - ${structuredData.baseOffer}`,
          type: 'direct',
          estimatedOpenRate: 18
        },
        {
          text: `Exclusive Offer: ${structuredData.baseOffer} on ${structuredData.product}`,
          type: 'urgency',
          estimatedOpenRate: 20
        },
        {
          text: `Your Financial Future Just Got Better with ${structuredData.product}`,
          type: 'emotional',
          estimatedOpenRate: 16
        }
      ],
      recommended: `🎯 Introducing ${structuredData.product} - ${structuredData.baseOffer}`
    };
  }

  /**
   * Fallback email body if AI generation fails
   * @param {object} structuredData - Campaign data
   * @returns {string} - Fallback email HTML
   */
  generateFallbackEmailBody(structuredData) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
    <h2 style="color: #007bff;">Introducing ${structuredData.product}</h2>
    
    <p>Dear Valued Customer,</p>
    
    <p>We're excited to introduce <strong>${structuredData.product}</strong>, designed specifically for customers like you.</p>
    
    <p><strong>Here's what makes it special:</strong></p>
    <ul>
      <li>${structuredData.baseOffer}</li>
      ${structuredData.specialOffer ? `<li>${structuredData.specialOffer}</li>` : ''}
      <li>Trusted by thousands of customers across India</li>
      <li>Easy application process</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${structuredData.cta}" style="background-color: #007bff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Learn More
      </a>
    </div>
    
    <p>Thank you for being a valued member of the SuperBFSI family.</p>
    
    <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
      SuperBFSI - Your Trusted Financial Partner<br>
      This email was sent to you because you are a valued customer.
    </p>
  </div>
</body>
</html>`;
  }
}

module.exports = new ContentGenerationAgent();
