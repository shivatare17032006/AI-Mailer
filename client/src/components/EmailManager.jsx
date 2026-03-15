import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaUpload, FaTrash, FaEdit, FaDownload, FaSearch, FaFilter } from 'react-icons/fa';
import './EmailManager.css';

const API_BASE_URL = 'http://localhost:5000/api';

const EmailManager = () => {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegment, setFilterSegment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Form state for adding single contact
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    segment: 'Standard',
    customerId: '',
    company: '',
    phone: '',
    tags: ''
  });
  
  // CSV upload state
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [filterSegment, filterStatus, searchTerm]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterSegment) params.segment = filterSegment;
      if (filterStatus) params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;
      
      const response = await axios.get(`${API_BASE_URL}/contacts`, { params });
      setContacts(response.data.contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      alert('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contacts/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const contactData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        source: 'manual'
      };
      
      await axios.post(`${API_BASE_URL}/contacts`, contactData);
      alert('Contact added successfully!');
      setFormData({
        email: '',
        name: '',
        segment: 'Standard',
        customerId: '',
        company: '',
        phone: '',
        tags: ''
      });
      setShowAddForm(false);
      fetchContacts();
      fetchStats();
    } catch (error) {
      console.error('Error adding contact:', error);
      alert(error.response?.data?.error || 'Failed to add contact');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/contacts/${id}`);
      alert('Contact deleted successfully!');
      fetchContacts();
      fetchStats();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) {
      alert('Please select contacts to delete');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedContacts.length} selected contact(s)?`)) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/contacts`, {
        data: { ids: selectedContacts }
      });
      alert('Contacts deleted successfully!');
      setSelectedContacts([]);
      fetchContacts();
      fetchStats();
    } catch (error) {
      console.error('Error deleting contacts:', error);
      alert('Failed to delete contacts');
    }
  };

  const handleSelectContact = (id) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c._id));
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';
        
        // Map CSV headers to contact fields
        if (header.includes('email') || header === 'email') {
          row.email = value;
        } else if (header.includes('name') || header === 'name') {
          row.name = value;
        } else if (header.includes('segment') || header === 'segment') {
          row.segment = value || 'Standard';
        } else if (header.includes('customer') || header.includes('id')) {
          row.customerId = value;
        } else if (header.includes('company') || header === 'company') {
          row.company = value;
        } else if (header.includes('phone') || header === 'phone') {
          row.phone = value;
        }
      });
      
      if (row.email) {
        data.push(row);
      }
    }
    
    return data;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setCsvFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsed = parseCSV(text);
      setCsvPreview(parsed.slice(0, 5)); // Show first 5 rows
    };
    reader.readAsText(file);
  };

  const handleUploadCSV = async () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }
    
    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target.result;
        const parsed = parseCSV(text);
        
        if (parsed.length === 0) {
          alert('No valid contacts found in CSV');
          return;
        }
        
        const response = await axios.post(`${API_BASE_URL}/contacts/bulk`, {
          contacts: parsed
        });
        
        setUploadResult(response.data);
        alert(`Import completed! Added: ${response.data.summary.added}, Failed: ${response.data.summary.failed}, Duplicates: ${response.data.summary.duplicates}`);
        
        setCsvFile(null);
        setCsvPreview([]);
        setShowUploadModal(false);
        fetchContacts();
        fetchStats();
      };
      reader.readAsText(csvFile);
    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert('Failed to upload CSV');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sample = `email,name,segment,customerId,company,phone
john@example.com,John Doe,Premium,CUST001,Acme Corp,+1234567890
jane@example.com,Jane Smith,Standard,CUST002,Tech Solutions,+1234567891
bob@example.com,Bob Johnson,VIP,CUST003,Finance Inc,+1234567892`;
    
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_sample.csv';
    a.click();
  };

  return (
    <div className="email-manager">
      <div className="manager-header">
        <h2>📧 Email Contact Manager</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            <FaPlus /> Add Contact
          </button>
          <button className="btn btn-success" onClick={() => setShowUploadModal(true)}>
            <FaUpload /> Import CSV
          </button>
          {selectedContacts.length > 0 && (
            <button className="btn btn-danger" onClick={handleBulkDelete}>
              <FaTrash /> Delete ({selectedContacts.length})
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Contacts</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.active}</h3>
              <p>Active</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🚫</div>
            <div className="stat-content">
              <h3>{stats.unsubscribed}</h3>
              <p>Unsubscribed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>{stats.bounced}</h3>
              <p>Bounced</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by email, name, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label><FaFilter /> Segment:</label>
          <select value={filterSegment} onChange={(e) => setFilterSegment(e.target.value)}>
            <option value="">All Segments</option>
            <option value="Premium">Premium</option>
            <option value="Standard">Standard</option>
            <option value="Basic">Basic</option>
            <option value="VIP">VIP</option>
            <option value="New">New</option>
            <option value="At-Risk">At-Risk</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="bounced">Bounced</option>
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="contacts-table">
        {loading ? (
          <div className="loading">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="no-data">
            <p>No contacts found. Add your first contact above!</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === contacts.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Email</th>
                <th>Name</th>
                <th>Segment</th>
                <th>Company</th>
                <th>Status</th>
                <th>Source</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact._id)}
                      onChange={() => handleSelectContact(contact._id)}
                    />
                  </td>
                  <td>{contact.email}</td>
                  <td>{contact.name || '-'}</td>
                  <td>
                    <span className={`badge badge-${contact.segment.toLowerCase()}`}>
                      {contact.segment}
                    </span>
                  </td>
                  <td>{contact.company || '-'}</td>
                  <td>
                    <span className={`status-badge status-${contact.status}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td>
                    <span className="source-badge">{contact.source}</span>
                  </td>
                  <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleDeleteContact(contact._id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Contact</h3>
              <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleAddContact}>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="contact@example.com"
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Segment</label>
                  <select name="segment" value={formData.segment} onChange={handleInputChange}>
                    <option value="Premium">Premium</option>
                    <option value="Standard">Standard</option>
                    <option value="Basic">Basic</option>
                    <option value="VIP">VIP</option>
                    <option value="New">New</option>
                    <option value="At-Risk">At-Risk</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Customer ID</label>
                  <input
                    type="text"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    placeholder="CUST001"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                />
              </div>
              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="vip, high-value, active"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Import Contacts from CSV</h3>
              <button className="close-btn" onClick={() => setShowUploadModal(false)}>×</button>
            </div>
            <div className="upload-section">
              <p>Upload a CSV file with your contacts. Required column: <strong>email</strong></p>
              <p>Optional columns: name, segment, customerId, company, phone</p>
              
              <button className="btn btn-secondary mb-3" onClick={downloadSampleCSV}>
                <FaDownload /> Download Sample CSV
              </button>
              
              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="file-label">
                  {csvFile ? csvFile.name : 'Choose CSV file...'}
                </label>
              </div>
              
              {csvPreview.length > 0 && (
                <div className="csv-preview">
                  <h4>Preview (first 5 rows):</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Segment</th>
                        <th>Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((row, index) => (
                        <tr key={index}>
                          <td>{row.email}</td>
                          <td>{row.name || '-'}</td>
                          <td>{row.segment || 'Standard'}</td>
                          <td>{row.company || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleUploadCSV}
                disabled={!csvFile || loading}
              >
                {loading ? 'Uploading...' : 'Import Contacts'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailManager;
