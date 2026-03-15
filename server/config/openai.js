const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Determine which AI provider to use
const AI_PROVIDER = process.env.AI_PROVIDER || 'mock'; // 'openai', 'gemini', or 'mock'

// Initialize OpenAI client
let openai;
if (AI_PROVIDER === 'openai') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Initialize Gemini client
let gemini;
if (AI_PROVIDER === 'gemini') {
  gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Call OpenAI API with structured prompts
 * @param {string} systemPrompt - System role instructions
 * @param {string} userPrompt - User message/query
 * @param {number} temperature - Creativity level (0-2)
 * @param {number} maxTokens - Max response length
 * @returns {Promise<string>} - AI response
 */
const callOpenAI = async (systemPrompt, userPrompt, temperature = 0.7, maxTokens = 2000) => {
  try {
    if (AI_PROVIDER === 'mock') {
      // Mock AI responses for testing
      console.log('🎭 MOCK MODE: Generating simulated AI response');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      return `This is a mock AI response to: ${userPrompt.substring(0, 100)}...`;
    } else if (AI_PROVIDER === 'gemini') {
      // Use Google Gemini
      const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `${systemPrompt}\n\n${userPrompt}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } else {
      // Use OpenAI
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens,
      });
      return response.choices[0].message.content.trim();
    }
  } catch (error) {
    console.error('AI API Error:', error.message);
    throw new Error(`AI API call failed: ${error.message}`);
  }
};

/**
 * Call OpenAI with JSON response mode
 * @param {string} systemPrompt - System instructions
 * @param {string} userPrompt - User query
 * @returns {Promise<object>} - Parsed JSON response
 */
const callOpenAIJSON = async (systemPrompt, userPrompt) => {
  try {
    if (AI_PROVIDER === 'mock') {
      // Mock AI JSON responses for testing
      console.log('🎭 MOCK MODE: Generating simulated JSON response');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      // Generate mock response based on what the agent is asking for
      if (userPrompt.includes('Extract the following information')) {
        // Campaign Understanding Agent
        return {
          product: "Premium Credit Card",
          baseOffer: "10% cashback on all purchases",
          specialOffer: "Zero annual fee for the first year",
          goals: ["Increase card adoption", "Target young professionals", "Boost lifestyle spending"],
          targetAudience: {
            ageRange: "25-35",
            location: ["Mumbai", "Bangalore"],
            demographics: "Young professionals",
            customerType: "active"
          },
          includeInactive: false,
          cta: "Apply Now for Premium Card"
        };
      } else if (userPrompt.includes('Design a comprehensive email campaign strategy') || userPrompt.includes('Design an email campaign strategy')) {
        // Strategy Agent
        return {
          segments: [
            {
              name: "High Income Young Professionals",
              criteria: "Age 25-35, Active customers, Metro cities",
              estimatedSize: 5000,
              priority: "high"
            },
            {
              name: "Lifestyle Spenders",
              criteria: "Frequent dining/shopping/travel transactions",
              estimatedSize: 3000,
              priority: "medium"
            }
          ],
          sendTime: {
            recommendedDay: "Tuesday",
            recommendedTimeSlot: "10:00-12:00",
            timezone: "Asia/Kolkata",
            reasoning: "Higher open rates during mid-week mornings for BFSI emails"
          },
          tone: "friendly",
          toneReasoning: "Professional yet approachable tone works best for young professionals",
          subjectLineStrategy: "Focus on instant gratification and exclusive benefits",
          abTesting: {
            enabled: true,
            variants: 3,
            testVariable: "subject_line"
          },
          expectedOutcome: {
            estimatedOpenRate: 18,
            estimatedClickRate: 4.5,
            confidence: "high"
          }
        };
      } else if (userPrompt.includes('Generate 3 subject line variants') || userPrompt.includes('Generate 3 compelling email subject lines')) {
        // Content Generation Agent - Subject Lines
        return {
          subjectLines: [
            {
              text: "🎉 Get 10% Cashback on Every Purchase - Limited Time!",
              type: "urgency",
              estimatedOpenRate: 22
            },
            {
              text: "Your Premium Card Awaits: Zero Annual Fee First Year",
              type: "direct",
              estimatedOpenRate: 19
            },
            {
              text: "Unlock Exclusive Lifestyle Benefits with Your New Card",
              type: "emotional",
              estimatedOpenRate: 18
            }
          ],
          recommended: "🎉 Get 10% Cashback on Every Purchase - Limited Time!"
        };
      } else if (userPrompt.includes('Write email body content')) {
        // Content Generation Agent - Email Body with better HTML
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #2c3e50; margin-bottom: 20px; }
    .intro { font-size: 16px; color: #555; margin-bottom: 25px; line-height: 1.8; }
    .benefits { background: #f8f9fa; border-left: 4px solid #667eea; padding: 25px; margin: 25px 0; border-radius: 5px; }
    .benefits h2 { color: #667eea; margin-top: 0; font-size: 20px; }
    .benefit-item { margin: 12px 0; padding-left: 25px; position: relative; }
    .benefit-item:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 18px; }
    .cta-section { text-align: center; margin: 35px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }
    .cta-button:hover { opacity: 0.9; }
    .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
    .feature-box { background: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; text-align: center; }
    .feature-icon { font-size: 32px; margin-bottom: 10px; }
    .feature-title { font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
    .feature-desc { font-size: 14px; color: #666; }
    .guarantee { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
    .guarantee-icon { font-size: 40px; margin-bottom: 10px; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #dee2e6; }
    .footer p { margin: 5px 0; }
    .social-links { margin: 15px 0; }
    .social-links a { display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .features { grid-template-columns: 1fr; }
      .content { padding: 20px 15px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎉 Exclusive Premium Card Offer</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px;">Limited Time: Get 10% Cashback + Zero Annual Fee</p>
    </div>
    
    <!-- Main Content -->
    <div class="content">
      <div class="greeting">Dear Valued Customer,</div>
      
      <div class="intro">
        We're thrilled to introduce our <strong>Premium Credit Card</strong>, exclusively designed for professionals like you who value smart financial choices and premium lifestyle benefits.
      </div>
      
      <!-- Benefits Section -->
      <div class="benefits">
        <h2>✨ Your Exclusive Benefits</h2>
        <div class="benefit-item"><strong>10% Cashback</strong> on all purchases for the first 3 months</div>
        <div class="benefit-item"><strong>Zero Annual Fee</strong> for the entire first year (₹5,000 value)</div>
        <div class="benefit-item"><strong>5X Reward Points</strong> on dining, shopping, and travel</div>
        <div class="benefit-item"><strong>Complimentary Airport Lounge Access</strong> at 1,000+ lounges worldwide</div>
        <div class="benefit-item"><strong>24/7 Concierge Service</strong> for travel bookings and reservations</div>
        <div class="benefit-item"><strong>Fuel Surcharge Waiver</strong> at all petrol pumps</div>
      </div>
      
      <!-- Features Grid -->
      <div class="features">
        <div class="feature-box">
          <div class="feature-icon">🚀</div>
          <div class="feature-title">Instant Approval</div>
          <div class="feature-desc">Get approved in minutes with our streamlined process</div>
        </div>
        <div class="feature-box">
          <div class="feature-icon">🔒</div>
          <div class="feature-title">Secure & Safe</div>
          <div class="feature-desc">Advanced fraud protection with zero liability</div>
        </div>
        <div class="feature-box">
          <div class="feature-icon">💳</div>
          <div class="feature-title">Contactless Pay</div>
          <div class="feature-desc">Tap and pay with NFC technology</div>
        </div>
        <div class="feature-box">
          <div class="feature-icon">📱</div>
          <div class="feature-title">Mobile First</div>
          <div class="feature-desc">Manage everything via our award-winning app</div>
        </div>
      </div>
      
      <!-- CTA Button -->
      <div class="cta-section">
        <a href="#apply" class="cta-button">Apply Now - Pre-Approved ➔</a>
        <p style="margin-top: 15px; color: #666; font-size: 14px;">
          ⏱️ Offer expires in 7 days • No hidden charges • Instant digital card
        </p>
      </div>
      
      <!-- Guarantee Section -->
      <div class="guarantee">
        <div class="guarantee-icon">🛡️</div>
        <strong style="display: block; margin-bottom: 8px; font-size: 16px;">Our Promise to You</strong>
        <p style="margin: 0; font-size: 14px;">
          Zero liability on unauthorized transactions • 24/7 customer support • Cancel anytime with no penalty
        </p>
      </div>
      
      <p style="margin-top: 30px; color: #555; line-height: 1.8;">
        As one of our valued customers, you're <strong>pre-approved</strong> for instant application. 
        Simply click the button above to complete your application in under 3 minutes—no complicated paperwork required.
      </p>
      
      <p style="color: #555; margin-top: 20px;">
        Need assistance? Our dedicated support team is available 24/7 to help you with any questions.
      </p>
      
      <p style="margin-top: 30px; color: #2c3e50; font-weight: 500;">
        Best regards,<br>
        The SuperBFSI Team
      </p>
      
      <p style="margin-top: 20px; font-size: 14px; color: #999; font-style: italic;">
        P.S. This exclusive offer is available for a limited time only. Lock in these premium benefits today!
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>SuperBFSI Financial Services</strong></p>
      <p>Your Trusted Financial Partner Since 1995</p>
      <div class="social-links">
        <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">LinkedIn</a> | <a href="#">Instagram</a>
      </div>
      <p style="margin-top: 15px; font-size: 12px;">
        <a href="#unsubscribe" style="color: #999;">Unsubscribe</a> | 
        <a href="#privacy" style="color: #999;">Privacy Policy</a> | 
        <a href="#terms" style="color: #999;">Terms & Conditions</a>
      </p>
      <p style="margin-top: 10px; font-size: 11px; color: #999;">
        © 2026 SuperBFSI. All rights reserved. This email was sent to you because you're a valued customer.
      </p>
    </div>
  </div>
</body>
</html>`;
      } else if (userPrompt.includes('Analyze the campaign performance')) {
        // Analytics/Optimization Agent
        return {
          weakPoints: [
            "Click rate is below industry average",
            "Segment 2 has lower engagement",
            "Mobile open rate needs improvement"
          ],
          recommendations: [
            "Add more compelling CTAs in email body",
            "Test different send times for Segment 2",
            "Optimize email design for mobile devices",
            "Consider A/B testing subject line variants"
          ],
          optimizedBrief: "Enhance mobile experience and add stronger CTAs. Test delivery times for better engagement.",
          expectedImprovement: "Expected 20-25% increase in click rates with these optimizations"
        };
      }
      
      // Default mock response
      return {
        success: true,
        message: "Mock data generated successfully",
        data: {}
      };
    } else if (AI_PROVIDER === 'gemini') {
      // Use Google Gemini with JSON parsing
      const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `${systemPrompt}\n\nYou must respond with valid JSON only.\n\n${userPrompt}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Extract JSON from response (Gemini sometimes includes markdown)
      let jsonText = text;
      if (text.includes('```json')) {
        jsonText = text.split('```json')[1].split('```')[0].trim();
      } else if (text.includes('```')) {
        jsonText = text.split('```')[1].split('```')[0].trim();
      }
      
      return JSON.parse(jsonText);
    } else {
      // Use OpenAI
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt + '\n\nYou must respond with valid JSON only.' },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });
      const content = response.choices[0].message.content.trim();
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('AI JSON API Error:', error.message);
    throw new Error(`AI JSON API call failed: ${error.message}`);
  }
};

/**
 * Validate API key
 * @returns {Promise<boolean>}
 */
const validateAPIKey = async () => {
  try {
    if (AI_PROVIDER === 'mock') {
      console.log('🎭 MOCK MODE: API key validation skipped');
      return true;
    } else if (AI_PROVIDER === 'gemini') {
      const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
      await model.generateContent('test');
      return true;
    } else {
      await openai.models.list();
      return true;
    }
  } catch (error) {
    console.error('Invalid AI API Key');
    return false;
  }
};

module.exports = {
  openai,
  callOpenAI,
  callOpenAIJSON,
  validateAPIKey
};
