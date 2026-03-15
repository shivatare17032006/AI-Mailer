const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

/**
 * @route   GET /api/contacts
 * @desc    Get all contacts with pagination and filters
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, segment, status, search } = req.query;
    
    const query = {};
    if (segment) query.segment = segment;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Contact.countDocuments(query);
    
    res.json({
      contacts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalContacts: total
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/contacts/stats
 * @desc    Get contact statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const active = await Contact.countDocuments({ status: 'active' });
    const unsubscribed = await Contact.countDocuments({ status: 'unsubscribed' });
    const bounced = await Contact.countDocuments({ status: 'bounced' });
    
    const bySegment = await Contact.aggregate([
      { $group: { _id: '$segment', count: { $sum: 1 } } }
    ]);
    
    const bySource = await Contact.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    
    res.json({
      total,
      active,
      unsubscribed,
      bounced,
      bySegment,
      bySource
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/contacts
 * @desc    Add a single contact
 */
router.post('/', async (req, res) => {
  try {
    const contactData = req.body;
    
    // Check if email already exists
    const existingContact = await Contact.findOne({ email: contactData.email });
    if (existingContact) {
      return res.status(400).json({ 
        error: 'Email already exists',
        contact: existingContact 
      });
    }
    
    const contact = new Contact(contactData);
    await contact.save();
    
    res.status(201).json({ 
      message: 'Contact added successfully',
      contact 
    });
  } catch (error) {
    console.error('Error adding contact:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/contacts/bulk
 * @desc    Add multiple contacts (CSV import)
 */
router.post('/bulk', async (req, res) => {
  try {
    const { contacts } = req.body;
    
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ error: 'No contacts provided' });
    }
    
    const results = {
      success: [],
      failed: [],
      duplicates: []
    };
    
    for (const contactData of contacts) {
      try {
        // Check for existing email
        const existing = await Contact.findOne({ email: contactData.email });
        if (existing) {
          results.duplicates.push({
            email: contactData.email,
            reason: 'Email already exists'
          });
          continue;
        }
        
        const contact = new Contact({
          ...contactData,
          source: 'csv'
        });
        await contact.save();
        results.success.push(contact);
      } catch (error) {
        results.failed.push({
          email: contactData.email,
          reason: error.message
        });
      }
    }
    
    res.json({
      message: 'Bulk import completed',
      summary: {
        total: contacts.length,
        added: results.success.length,
        failed: results.failed.length,
        duplicates: results.duplicates.length
      },
      results
    });
  } catch (error) {
    console.error('Error bulk importing contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/contacts/:id
 * @desc    Update a contact
 */
router.put('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({ 
      message: 'Contact updated successfully',
      contact 
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete a contact
 */
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({ 
      message: 'Contact deleted successfully',
      contact 
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/contacts
 * @desc    Delete multiple contacts
 */
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No contact IDs provided' });
    }
    
    const result = await Contact.deleteMany({ _id: { $in: ids } });
    
    res.json({ 
      message: 'Contacts deleted successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/contacts/export
 * @desc    Export contacts as CSV
 */
router.get('/export', async (req, res) => {
  try {
    const { segment, status } = req.query;
    
    const query = {};
    if (segment) query.segment = segment;
    if (status) query.status = status;
    
    const contacts = await Contact.find(query).select(
      'email name segment customerId company phone status tags'
    );
    
    res.json({ contacts });
  } catch (error) {
    console.error('Error exporting contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
