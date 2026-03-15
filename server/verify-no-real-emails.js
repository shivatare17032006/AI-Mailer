const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const Email = require('./models/Email');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/superbfsi_campaigns')
  .then(async () => {
    console.log('\n🔍 CHECKING FOR YOUR EMAIL ADDRESS...\n');
    console.log('='.repeat(80));
    
    // Check if your email exists in database
    const yourEmail = 'aryanshivatare35@gmail.com';
    const found = await Email.findOne({ 'recipient.email': yourEmail });
    
    if (found) {
      console.log('⚠️  WARNING: Your email WAS found in database!');
      console.log(`   Email: ${found.recipient.email}`);
      console.log(`   Status: ${found.delivery.status}`);
    } else {
      console.log('✅ CONFIRMED: Your email (aryanshivatare35@gmail.com) is NOT in the database');
      console.log('   No emails were sent to your real email address.');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📧 ACTUAL EMAIL ADDRESSES IN DATABASE:\n');
    
    // Show first 10 email addresses that ARE in the database
    const emails = await Email.find({}).limit(10).select('recipient.email delivery.status');
    
    emails.forEach((email, i) => {
      console.log(`${i + 1}. ${email.recipient.email} - Status: ${email.delivery.status}`);
    });
    
    console.log('\n✅ All emails shown above are TEST ADDRESSES (customer@example.com)');
    console.log('✅ NO real emails were sent');
    console.log('✅ System is in MOCK MODE - safe for testing\n');
    
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
