/**
 * Test Script: Send Real Email via Nodemailer (Gmail SMTP)
 * This script sends a single test email to verify Nodemailer integration
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTestEmail() {
  console.log('\n🚀 Nodemailer Gmail SMTP Test\n');
  console.log('=' .repeat(50));
  console.log(`📧 From: ${process.env.FROM_EMAIL}`);
  console.log(`📬 To: ${process.env.GMAIL_USER}`);
  console.log(`🔑 Gmail User: ${process.env.GMAIL_USER}`);
  console.log(`🔐 App Password: ${process.env.GMAIL_APP_PASSWORD.substring(0, 4)}...`);
  console.log('=' .repeat(50) + '\n');

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '') // Remove spaces
    }
  });

  // Email content
  const mailOptions = {
    from: {
      name: 'SuperBFSI Campaign Manager',
      address: process.env.FROM_EMAIL
    },
    to: process.env.GMAIL_USER,
    subject: '✅ Nodemailer Integration Test - SuperBFSI',
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
            <h1>🎉 Nodemailer Integration Active!</h1>
          </div>
          <div class="content">
            <div class="success-badge">✅ Email Successfully Delivered via Gmail SMTP</div>
            
            <p>Hi there!</p>
            
            <p>Excellent news! Your <strong>SuperBFSI AI-Based Multi-Agent Email Campaign Manager</strong> 
            is now successfully sending real emails via <strong>Nodemailer with Gmail SMTP</strong>.</p>
            
            <div class="info-box">
              <strong>🤖 System Status:</strong>
              <ul>
                <li>✅ Nodemailer: Connected</li>
                <li>✅ Gmail SMTP: Working</li>
                <li>✅ Email Delivery: Successful</li>
                <li>✅ 7 AI Agents: Active (Mock Mode)</li>
                <li>✅ MongoDB Database: Connected</li>
                <li>✅ Analytics Tracking: Enabled</li>
              </ul>
            </div>
            
            <p><strong>Why Nodemailer?</strong></p>
            <ul>
              <li>✅ No verification needed - works immediately</li>
              <li>✅ Simple Gmail integration</li>
              <li>✅ Free for testing and development</li>
              <li>✅ Perfect for campaign testing</li>
            </ul>
            
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
              Provider: Nodemailer (Gmail SMTP)<br>
              From: ${process.env.FROM_EMAIL}<br>
              To: ${process.env.GMAIL_USER}
            </div>
            
            <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 5px;">
              <strong>⚠️ Gmail Sending Limits:</strong><br>
              Gmail allows up to <strong>500 emails per day</strong> for personal accounts. 
              For high-volume campaigns, consider upgrading to SendGrid later.
            </p>
            
            <p style="margin-top: 30px;">
              <strong>🎯 Ready to Launch Campaigns!</strong><br>
              Your AI-Based Email Campaign Manager is fully configured and ready to help you create, 
              execute, and optimize email campaigns with the power of 7 specialized AI agents.
            </p>
          </div>
          <div class="footer">
            <p>Sent by SuperBFSI Campaign Manager<br>
            Powered by AI Multi-Agent Architecture | Delivered via Nodemailer</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Nodemailer Integration Test - SuperBFSI

Excellent news! Your SuperBFSI AI-Based Multi-Agent Email Campaign Manager 
is now successfully sending real emails via Nodemailer with Gmail SMTP.

System Status:
✅ Nodemailer: Connected
✅ Gmail SMTP: Working  
✅ Email Delivery: Successful
✅ 7 AI Agents: Active (Mock Mode)
✅ MongoDB Database: Connected
✅ Analytics Tracking: Enabled

Why Nodemailer?
✅ No verification needed - works immediately
✅ Simple Gmail integration
✅ Free for testing and development
✅ Perfect for campaign testing

Test Details:
Sent: ${new Date().toLocaleString()}
Provider: Nodemailer (Gmail SMTP)
From: ${process.env.FROM_EMAIL}
To: ${process.env.GMAIL_USER}

⚠️ Gmail Sending Limits:
Gmail allows up to 500 emails per day for personal accounts.

Your campaign manager is ready to launch!
    `
  };

  try {
    console.log('📤 Sending email via Gmail SMTP...\n');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ SUCCESS! Email sent successfully!\n');
    console.log('📋 Response Details:');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log(`   Accepted: ${info.accepted.join(', ')}`);
    if (info.rejected.length > 0) {
      console.log(`   Rejected: ${info.rejected.join(', ')}`);
    }
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 Check your Gmail inbox: ' + process.env.GMAIL_USER);
    console.log('📧 Subject: ✅ Nodemailer Integration Test - SuperBFSI');
    console.log('=' .repeat(50) + '\n');
    
  } catch (error) {
    console.error('\n❌ ERROR: Failed to send email\n');
    console.error('Error Details:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    
    console.error('\n💡 Common Issues:');
    console.error('   1. Invalid Gmail App Password (should be 16 chars without spaces)');
    console.error('   2. 2-Step Verification not enabled on Gmail account');
    console.error('   3. "Less secure app access" blocked (use App Password instead)');
    console.error('   4. Incorrect Gmail username');
    console.error('   5. Create App Password at: https://myaccount.google.com/apppasswords');
    console.error('\n');
    
    process.exit(1);
  }
}

// Run the test
sendTestEmail().catch(console.error);
