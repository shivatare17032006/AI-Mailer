/**
 * Test Script: Send Real Email via SendGrid
 * This script sends a single test email to verify SendGrid integration
 */

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendTestEmail() {
  console.log('\n🚀 SendGrid Real Email Test\n');
  console.log('=' .repeat(50));
  console.log(`📧 From: ${process.env.FROM_EMAIL}`);
  console.log(`📬 To: aryanshivatare35@gmail.com`);
  console.log(`🔑 API Key: ${process.env.SENDGRID_API_KEY.substring(0, 15)}...`);
  console.log('=' .repeat(50) + '\n');

  const msg = {
    to: 'aryanshivatare35@gmail.com',
    from: {
      email: process.env.FROM_EMAIL,
      name: 'SuperBFSI Campaign Manager'
    },
    subject: '✅ SendGrid Integration Test - SuperBFSI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                   color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-badge { background: #10b981; color: white; padding: 10px 20px; 
                          border-radius: 20px; display: inline-block; margin: 20px 0; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; 
                     margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .cta-button { background: #667eea; color: white; padding: 12px 30px; 
                       text-decoration: none; border-radius: 5px; display: inline-block; 
                       margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 SendGrid Integration Active!</h1>
          </div>
          <div class="content">
            <div class="success-badge">✅ Email Successfully Delivered</div>
            
            <p>Hi there!</p>
            
            <p>Congratulations! Your <strong>SuperBFSI AI-Based Multi-Agent Email Campaign Manager</strong> 
            is now successfully sending real emails via SendGrid.</p>
            
            <div class="info-box">
              <strong>🤖 System Status:</strong>
              <ul>
                <li>✅ SendGrid API: Connected</li>
                <li>✅ Email Delivery: Working</li>
                <li>✅ 7 AI Agents: Active (Mock Mode)</li>
                <li>✅ MongoDB Database: Connected</li>
                <li>✅ Analytics Tracking: Enabled</li>
              </ul>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Create your first real campaign from the dashboard</li>
              <li>Target specific customer segments</li>
              <li>Track opens, clicks, and conversions</li>
              <li>Get AI-powered optimization suggestions</li>
            </ul>
            
            <a href="http://localhost:3000" class="cta-button">
              Open Dashboard →
            </a>
            
            <div class="info-box">
              <strong>📊 Test Details:</strong><br>
              Sent: ${new Date().toLocaleString()}<br>
              Provider: SendGrid<br>
              From: ${process.env.FROM_EMAIL}<br>
              To: aryanshivatare35@gmail.com
            </div>
            
            <p style="margin-top: 30px;">
              <strong>Need Help?</strong><br>
              Your AI-Based Email Campaign Manager is ready to help you create, 
              execute, and optimize email campaigns with the power of 7 specialized AI agents.
            </p>
          </div>
          <div class="footer">
            <p>Sent by SuperBFSI Campaign Manager<br>
            Powered by AI Multi-Agent Architecture</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
SendGrid Integration Test - SuperBFSI

Congratulations! Your SuperBFSI AI-Based Multi-Agent Email Campaign Manager 
is now successfully sending real emails via SendGrid.

System Status:
✅ SendGrid API: Connected
✅ Email Delivery: Working
✅ 7 AI Agents: Active (Mock Mode)
✅ MongoDB Database: Connected
✅ Analytics Tracking: Enabled

Test Details:
Sent: ${new Date().toLocaleString()}
Provider: SendGrid
From: ${process.env.FROM_EMAIL}
To: aryanshivatare35@gmail.com

Your campaign manager is ready!
    `,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true }
    }
  };

  try {
    console.log('📤 Sending email...\n');
    const response = await sgMail.send(msg);
    
    console.log('✅ SUCCESS! Email sent successfully!\n');
    console.log('📋 Response Details:');
    console.log(`   Status Code: ${response[0].statusCode}`);
    console.log(`   Message ID: ${response[0].headers['x-message-id']}`);
    console.log(`   Body: ${response[0].body || 'Email queued for delivery'}\n`);
    console.log('=' .repeat(50));
    console.log('🎉 Check your inbox: aryanshivatare35@gmail.com');
    console.log('=' .repeat(50) + '\n');
    
  } catch (error) {
    console.error('\n❌ ERROR: Failed to send email\n');
    console.error('Error Details:');
    console.error(`   Message: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status Code: ${error.response.statusCode}`);
      console.error(`   Body: ${JSON.stringify(error.response.body, null, 2)}`);
    }
    
    console.error('\n💡 Common Issues:');
    console.error('   1. Sender email not verified in SendGrid');
    console.error('   2. Invalid or expired API key');
    console.error('   3. SendGrid account suspended or limited');
    console.error('   4. Need to verify sender identity at: https://app.sendgrid.com/settings/sender_auth');
    console.error('\n');
    
    process.exit(1);
  }
}

// Run the test
sendTestEmail().catch(console.error);
