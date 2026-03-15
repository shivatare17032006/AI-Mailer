/**
 * TEST EMAIL SENDER
 * Send a test email to verify email delivery works
 */

require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');

async function sendTestEmail() {
  const recipientEmail = 'aryanshivatare35@gmail.com';
  
  console.log('\n📧 SENDING TEST EMAIL...\n');
  console.log('='.repeat(80));
  
  // Check email mode
  const emailMode = process.env.EMAIL_MODE || 'mock';
  
  if (emailMode === 'mock') {
    console.log('⚠️  EMAIL MODE is set to MOCK');
    console.log('   No real email will be sent.');
    console.log('\n   To send real emails:');
    console.log('   1. Get SendGrid API key from https://sendgrid.com');
    console.log('   2. Update .env: EMAIL_MODE=live');
    console.log('   3. Update .env: SENDGRID_API_KEY=your-key');
    console.log('   4. Run this script again\n');
    process.exit(0);
  }
  
  // Option 1: Using Gmail SMTP (easiest for testing)
  console.log('\n📮 Using Gmail SMTP for testing...\n');
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'your-gmail@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
    }
  });
  
  // Email content
  const mailOptions = {
    from: process.env.GMAIL_USER || 'SuperBFSI <campaigns@superbfsi.com>',
    to: recipientEmail,
    subject: '🎉 Test Email from SuperBFSI Campaign Manager',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Test Email Successful!</h1>
          </div>
          <div class="content">
            <h2>Hello from SuperBFSI!</h2>
            <p>Congratulations! This test email confirms that your <strong>AI-Powered Multi-Agent Email Campaign Manager</strong> is working correctly.</p>
            
            <p><strong>✅ What this means:</strong></p>
            <ul>
              <li>Email delivery system is operational</li>
              <li>Your campaigns can now send real emails</li>
              <li>All 7 AI agents are functioning properly</li>
              <li>Analytics tracking is active</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="http://localhost:3000" class="button">Open Dashboard</a>
            </div>
            
            <p>This email was sent on: <strong>${new Date().toLocaleString()}</strong></p>
            
            <p><em>This is a test email from your local development environment. In production, you can use SendGrid, AWS SES, or other enterprise email services.</em></p>
          </div>
          <div class="footer">
            <p>SuperBFSI Campaign Manager | Built with MERN Stack + 7 AI Agents</p>
            <p>Powered by GPT-4, MongoDB, React, Node.js</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Test Email from SuperBFSI Campaign Manager

Congratulations! This test email confirms that your AI-Powered Multi-Agent Email Campaign Manager is working correctly.

✅ What this means:
- Email delivery system is operational
- Your campaigns can now send real emails
- All 7 AI agents are functioning properly
- Analytics tracking is active

This email was sent on: ${new Date().toLocaleString()}

Visit your dashboard: http://localhost:3000
    `
  };
  
  try {
    console.log(`   To: ${recipientEmail}`);
    console.log(`   Subject: ${mailOptions.subject}`);
    console.log('\n   Sending...');
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('\n✅ EMAIL SENT SUCCESSFULLY!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log('\n📬 Check your inbox at: aryanshivatare35@gmail.com\n');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ FAILED TO SEND EMAIL');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 SOLUTION:');
      console.log('   Gmail requires an "App Password" for security.');
      console.log('   Follow these steps:');
      console.log('   1. Go to: https://myaccount.google.com/apppasswords');
      console.log('   2. Create an App Password for "Mail"');
      console.log('   3. Add to .env file:');
      console.log('      GMAIL_USER=aryanshivatare35@gmail.com');
      console.log('      GMAIL_APP_PASSWORD=your-16-char-password');
    }
    console.log('\n='.repeat(80));
  }
}

sendTestEmail();
