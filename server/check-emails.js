const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const Email = require('./models/Email');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/superbfsi_campaigns')
  .then(async () => {
    console.log('\n📧 EMAIL DELIVERY REPORT\n');
    console.log('='.repeat(80));
    
    const emails = await Email.find({}).sort({ createdAt: -1 }).limit(10);
    
    if (emails.length === 0) {
      console.log('No emails found in database yet.');
    } else {
      console.log(`Total emails in database: ${await Email.countDocuments()}\n`);
      
      emails.forEach((email, index) => {
        console.log(`\n${index + 1}. Email to: ${email.recipient.email}`);
        console.log(`   Campaign ID: ${email.campaignId}`);
        console.log(`   Status: ${email.delivery.status.toUpperCase()}`);
        console.log(`   Sent At: ${email.delivery.sentAt}`);
        console.log(`   Message ID: ${email.delivery.providerMessageId || 'N/A'}`);
        console.log(`   Opened: ${email.engagement.opened ? '✅ YES' : '❌ NO'}`);
        console.log(`   Clicked: ${email.engagement.clicked ? '✅ YES' : '❌ NO'}`);
        console.log(`   Segment: ${email.recipient.segment}`);
      });
      
      console.log('\n' + '='.repeat(80));
      
      // Summary stats
      const totalSent = emails.filter(e => e.delivery.status === 'sent').length;
      const totalOpened = emails.filter(e => e.engagement.opened).length;
      const totalClicked = emails.filter(e => e.engagement.clicked).length;
      
      console.log('\n📊 SUMMARY (Last 10 emails):');
      console.log(`   Delivered: ${totalSent}`);
      console.log(`   Opened: ${totalOpened} (${totalSent > 0 ? ((totalOpened/totalSent)*100).toFixed(1) : 0}%)`);
      console.log(`   Clicked: ${totalClicked} (${totalSent > 0 ? ((totalClicked/totalSent)*100).toFixed(1) : 0}%)`);
    }
    
    console.log('\n');
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
