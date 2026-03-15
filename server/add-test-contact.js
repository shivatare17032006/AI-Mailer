/**
 * Script to add test contact to database
 * Run this to quickly add a contact for testing email campaigns
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Contact = require('./models/Contact');

async function addTestContact() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n✅ Connected to MongoDB\n');
    
    // Check if contact already exists
    const existing = await Contact.findOne({ email: 'aryanshivatare35@gmail.com' });
    
    if (existing) {
      console.log('✅ Contact already exists in database:');
      console.log(`   Email: ${existing.email}`);
      console.log(`   Name: ${existing.name}`);
      console.log(`   Segment: ${existing.segment}`);
      console.log('\n');
      process.exit(0);
    }
    
    // Create new contact
    const contact = new Contact({
      email: 'aryanshivatare35@gmail.com',
      name: 'Aryan Shivatare',
      segment: 'Premium',
      customerId: 'CUST-001',
      company: 'Test Company',
      phone: '+91-1234567890',
      status: 'active',
      source: 'manual',
      tags: ['test', 'vip']
    });
    
    await contact.save();
    
    console.log('✅ Test contact added successfully!\n');
    console.log('📧 Contact Details:');
    console.log(`   Email: ${contact.email}`);
    console.log(`   Name: ${contact.name}`);
    console.log(`   Segment: ${contact.segment}`);
    console.log(`   Customer ID: ${contact.customerId}`);
    console.log(`   Status: ${contact.status}`);
    console.log('\n🎉 You can now create campaigns that will send to this contact!\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addTestContact();
