const Email = require('../models/Email');

/**
 * Execution Agent
 * Handles email sending via API (SendGrid or mock)
 */
class ExecutionAgent {
  constructor() {
    this.emailMode = process.env.EMAIL_MODE || 'mock';
    this.emailProvider = process.env.EMAIL_PROVIDER || 'nodemailer';
    this.fromEmail = process.env.FROM_EMAIL || 'campaigns@superbfsi.com';
  }

  /**
   * Execute campaign - send emails to all segments
   * @param {object} campaign - Full campaign object
   * @returns {Promise<object>} - Execution summary
   */
  async executeCampaign(campaign) {
    try {
      console.log('🤖 Execution Agent: Starting campaign execution...');
      console.log(`📧 Email Mode: ${this.emailMode}`);
      
      const startTime = Date.now();
      
      // Generate recipient list based on segments
      const recipients = await this.generateRecipientList(campaign.strategy.segments);
      
      console.log(`👥 Total recipients: ${recipients.length}`);
      
      // Send emails
      const results = await this.sendBulkEmails(campaign, recipients);
      
      const executionTime = Date.now() - startTime;
      
      const summary = {
        totalRecipients: recipients.length,
        totalSent: results.sent,
        totalFailed: results.failed,
        executionTime: executionTime,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        mode: this.emailMode
      };
      
      console.log('✅ Execution Agent: Campaign execution complete');
      console.log(`✉️  Sent: ${summary.totalSent} | Failed: ${summary.totalFailed}`);
      console.log(`⏱️  Time: ${(executionTime / 1000).toFixed(2)}s`);
      
      return summary;
      
    } catch (error) {
      console.error('❌ Execution Agent Error:', error.message);
      throw new Error(`Campaign execution failed: ${error.message}`);
    }
  }

  /**
   * Generate recipient list from Contact database
   * @param {array} segments - Campaign segments
   * @returns {Promise<array>} - List of recipients
   */
  async generateRecipientList(segments) {
    const Contact = require('../models/Contact');
    
    try {
      // ALWAYS get all active contacts - segment matching is for display only
      console.log('📧 Fetching all active contacts from database...');
      const contacts = await Contact.find({ status: 'active' });
      
      console.log(`✅ Found ${contacts.length} active contacts`);
      contacts.forEach(c => {
        console.log(`   → ${c.email} (${c.segment})`);
      });
      
      if (contacts.length === 0) {
        console.warn('⚠️  No active contacts found in database. Please add contacts first.');
        return [];
      }
      
      // Map contacts to recipient format
      const recipients = contacts.map(contact => ({
        email: contact.email,
        name: contact.name || contact.email.split('@')[0],
        segment: contact.segment || 'Standard',
        customerId: contact.customerId || contact._id.toString(),
        metadata: {
          priority: 'medium',
          phone: contact.phone,
          company: contact.company,
          tags: contact.tags
        }
      }));
      
      console.log(`📧 Prepared ${recipients.length} recipients for email sending`);
      
      return recipients;
      
    } catch (error) {
      console.error('Error fetching recipients from database:', error);
      throw new Error('Failed to fetch recipients from Contact database');
    }
  }

  /**
   * Send emails in bulk
   * @param {object} campaign - Campaign object
   * @param {array} recipients - List of recipients
   * @returns {Promise<object>} - Send results
   */
  async sendBulkEmails(campaign, recipients) {
    const sent = [];
    const failed = [];
    
    // Batch processing to avoid overwhelming the system
    const batchSize = 100;
    const batches = this.createBatches(recipients, batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`📦 Processing batch ${i + 1}/${batches.length} (${batch.length} emails)`);
      
      const batchPromises = batch.map(recipient => 
        this.sendSingleEmail(campaign, recipient)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
          sent.push(result.value.email);
        } else {
          failed.push(result.value || result.reason);
        }
      });
    }
    
    return {
      sent: sent.length,
      failed: failed.length,
      sentEmails: sent,
      failedEmails: failed
    };
  }

  /**
   * Send single email
   * @param {object} campaign - Campaign object
   * @param {object} recipient - Recipient details
   * @returns {Promise<object>} - Send result
   */
  async sendSingleEmail(campaign, recipient) {
    try {
      // Create email record
      const emailRecord = new Email({
        campaignId: campaign.campaignId,
        recipient: recipient,
        content: {
          subject: campaign.content.selectedSubjectLine,
          body: campaign.content.emailBody,
          ctaUrl: campaign.structuredData.cta
        },
        tracking: {
          openTrackingUrl: this.generateTrackingUrl(campaign.campaignId, recipient.email, 'open'),
          clickTrackingUrl: this.generateTrackingUrl(campaign.campaignId, recipient.email, 'click'),
          unsubscribeUrl: this.generateUnsubscribeUrl(recipient.email)
        },
        variant: 'A'
      });
      
      if (this.emailMode === 'live') {
        // Send via configured email provider
        let sendResult;
        if (this.emailProvider === 'sendgrid') {
          sendResult = await this.sendViaSendGrid(emailRecord);
        } else {
          sendResult = await this.sendViaNodemailer(emailRecord);
        }
        emailRecord.delivery.status = 'sent';
        emailRecord.delivery.sentAt = new Date();
        emailRecord.delivery.providerMessageId = sendResult.messageId;
      } else {
        // Mock send for development
        emailRecord.delivery.status = 'sent';
        emailRecord.delivery.sentAt = new Date();
        emailRecord.delivery.providerMessageId = `MOCK-${Date.now()}`;
        
        // Simulate random opens and clicks for demo
        if (Math.random() > 0.7) {
          emailRecord.engagement.opened = true;
          emailRecord.engagement.openedAt = new Date(Date.now() + Math.random() * 3600000);
        }
        if (Math.random() > 0.9) {
          emailRecord.engagement.clicked = true;
          emailRecord.engagement.clickedAt = new Date(Date.now() + Math.random() * 7200000);
        }
      }
      
      await emailRecord.save();
      
      return {
        success: true,
        email: emailRecord
      };
      
    } catch (error) {
      return {
        success: false,
        recipient: recipient.email,
        error: error.message
      };
    }
  }

  /**
   * Send email via Nodemailer (Gmail SMTP)
   * @param {object} emailRecord - Email record
   * @returns {Promise<object>} - Nodemailer response
   */
  async sendViaNodemailer(emailRecord) {
    const nodemailer = require('nodemailer');
    
    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '') // Remove spaces
      }
    });
    
    const mailOptions = {
      from: {
        name: 'SuperBFSI Campaign Manager',
        address: this.fromEmail
      },
      to: emailRecord.recipient.email,
      subject: emailRecord.content.subject,
      html: emailRecord.content.body,
      text: emailRecord.content.body.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };
    
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${emailRecord.recipient.email}: ${info.messageId}`);
      return { 
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      console.error('Nodemailer Error:', error.message);
      throw error;
    }
  }

  /**
   * Send email via SendGrid API
   * @param {object} emailRecord - Email record
   * @returns {Promise<object>} - SendGrid response
   */
  async sendViaSendGrid(emailRecord) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: emailRecord.recipient.email,
      from: {
        email: this.fromEmail,
        name: 'SuperBFSI Campaign Manager'
      },
      subject: emailRecord.content.subject,
      html: emailRecord.content.body,
      trackingSettings: {
        clickTracking: {
          enable: true
        },
        openTracking: {
          enable: true
        }
      }
    };
    
    try {
      const response = await sgMail.send(msg);
      return { 
        messageId: response[0].headers['x-message-id'] || `SG-${Date.now()}`,
        statusCode: response[0].statusCode
      };
    } catch (error) {
      console.error('SendGrid Error:', error.message);
      throw error;
    }
  }

  /**
   * Create batches from array
   * @param {array} array - Input array
   * @param {number} size - Batch size
   * @returns {array} - Array of batches
   */
  createBatches(array, size) {
    const batches = [];
    for (let i = 0; i < array.length; i += size) {
      batches.push(array.slice(i, i + size));
    }
    return batches;
  }

  /**
   * Generate tracking URL
   * @param {string} campaignId - Campaign ID
   * @param {string} email - Recipient email
   * @param {string} type - Tracking type (open/click)
   * @returns {string} - Tracking URL
   */
  generateTrackingUrl(campaignId, email, type) {
    const encoded = Buffer.from(`${campaignId}:${email}`).toString('base64');
    return `https://superbfsi.com/track/${type}/${encoded}`;
  }

  /**
   * Generate unsubscribe URL
   * @param {string} email - Recipient email
   * @returns {string} - Unsubscribe URL
   */
  generateUnsubscribeUrl(email) {
    const encoded = Buffer.from(email).toString('base64');
    return `https://superbfsi.com/unsubscribe/${encoded}`;
  }

  /**
   * Schedule campaign for future execution
   * @param {object} campaign - Campaign object
   * @param {Date} scheduledTime - When to send
   * @returns {Promise<object>} - Schedule confirmation
   */
  async scheduleCampaign(campaign, scheduledTime) {
    // In production, use a job scheduler like Bull or Agenda
    console.log(`📅 Campaign scheduled for: ${scheduledTime}`);
    
    return {
      scheduled: true,
      campaignId: campaign.campaignId,
      scheduledTime: scheduledTime,
      message: 'Campaign will be executed at the scheduled time'
    };
  }
}

module.exports = new ExecutionAgent();
