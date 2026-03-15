/**
 * PRODUCTION CUSTOMER DATABASE INTEGRATION EXAMPLE
 * 
 * This shows how to integrate with your real customer database
 * instead of using mock/test emails
 */

const mongoose = require('mongoose');

// Example Customer Schema (you would have your own)
const customerSchema = new mongoose.Schema({
  customerId: String,
  email: String,
  name: String,
  phone: String,
  age: Number,
  location: String,
  customerType: String, // 'active' or 'inactive'
  accountBalance: Number,
  lastTransactionDate: Date,
  preferences: {
    emailOptIn: Boolean,
    categories: [String] // e.g., ['credit_card', 'loans', 'investments']
  }
});

const Customer = mongoose.model('Customer', customerSchema);

/**
 * Generate real recipient list from customer database
 * @param {array} segments - Campaign segments with criteria
 * @returns {Promise<array>} - Real customers matching criteria
 */
async function generateRealRecipientList(segments, campaign) {
  const recipients = [];
  
  for (const segment of segments) {
    console.log(`📊 Querying customers for segment: ${segment.name}`);
    
    // Build MongoDB query based on segment criteria
    const query = buildSegmentQuery(segment, campaign);
    
    // Query your actual customer database
    const customers = await Customer.find(query)
      .where('preferences.emailOptIn').equals(true) // Only customers who opted in
      .limit(segment.estimatedSize || 1000); // Safety limit
    
    console.log(`✅ Found ${customers.length} customers for ${segment.name}`);
    
    // Add to recipient list
    customers.forEach(customer => {
      recipients.push({
        email: customer.email,
        name: customer.name,
        customerId: customer.customerId,
        segment: segment.name,
        metadata: {
          priority: segment.priority || 'medium',
          segmentCriteria: segment.criteria,
          age: customer.age,
          location: customer.location
        }
      });
    });
  }
  
  // Remove duplicates (same customer in multiple segments)
  const uniqueRecipients = Array.from(
    new Map(recipients.map(r => [r.email, r])).values()
  );
  
  console.log(`📧 Total unique recipients: ${uniqueRecipients.length}`);
  
  return uniqueRecipients;
}

/**
 * Build MongoDB query from segment criteria
 */
function buildSegmentQuery(segment, campaign) {
  const query = {};
  
  // Parse target audience from campaign
  const targetAudience = campaign.structuredData.targetAudience;
  
  // Age range
  if (targetAudience.ageRange) {
    const [minAge, maxAge] = targetAudience.ageRange.split('-').map(Number);
    query.age = { $gte: minAge, $lte: maxAge };
  }
  
  // Location
  if (targetAudience.location && targetAudience.location.length > 0) {
    query.location = { $in: targetAudience.location };
  }
  
  // Customer type
  if (targetAudience.customerType) {
    query.customerType = targetAudience.customerType;
  }
  
  // Active customers only (unless including inactive)
  if (!campaign.structuredData.includeInactive) {
    query.customerType = 'active';
    query.lastTransactionDate = { 
      $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Active in last 90 days
    };
  }
  
  // Minimum account balance for premium products
  if (segment.priority === 'high') {
    query.accountBalance = { $gte: 50000 }; // 50k minimum
  }
  
  console.log('🔍 Query:', JSON.stringify(query, null, 2));
  
  return query;
}

/**
 * SAFETY CHECKS before sending to real customers
 */
function validateRecipientsBeforeSending(recipients, campaign) {
  const issues = [];
  
  // Check for valid emails
  const invalidEmails = recipients.filter(r => !isValidEmail(r.email));
  if (invalidEmails.length > 0) {
    issues.push(`${invalidEmails.length} invalid email addresses found`);
  }
  
  // Check for blacklisted domains
  const blacklisted = recipients.filter(r => 
    r.email.endsWith('@competitor.com') || 
    r.email.endsWith('@spam.com')
  );
  if (blacklisted.length > 0) {
    issues.push(`${blacklisted.length} blacklisted email addresses found`);
  }
  
  // Check for reasonable volume
  if (recipients.length > 10000) {
    issues.push(`Very large recipient list: ${recipients.length}. Consider splitting campaign.`);
  }
  
  // All recipients must have opted in
  const missingOptIn = recipients.filter(r => !r.metadata.emailOptIn);
  if (missingOptIn.length > 0) {
    issues.push(`${missingOptIn.length} recipients without email opt-in consent`);
  }
  
  if (issues.length > 0) {
    console.error('⛔ SAFETY CHECKS FAILED:');
    issues.forEach(issue => console.error(`  - ${issue}`));
    return false;
  }
  
  console.log('✅ All safety checks passed');
  return true;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  generateRealRecipientList,
  validateRecipientsBeforeSending,
  buildSegmentQuery
};

/**
 * HOW TO USE THIS IN PRODUCTION:
 * 
 * 1. Update executionAgent.js to use generateRealRecipientList() 
 *    instead of generating mock emails
 * 
 * 2. Make sure you have a Customer collection in MongoDB with:
 *    - email addresses
 *    - demographic data (age, location)
 *    - opt-in preferences
 *    - customer status (active/inactive)
 * 
 * 3. Set EMAIL_MODE=live in .env
 * 
 * 4. Add SendGrid API key
 * 
 * 5. Test with a small segment first (10-20 emails)
 * 
 * 6. Monitor delivery rates and adjust
 */
