import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== Campaign APIs ====================

export const campaignAPI = {
  // Create new campaign from brief
  create: async (briefText) => {
    const response = await api.post('/campaigns/create', { briefText });
    return response.data;
  },

  // Get all campaigns with pagination
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get(`/campaigns?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get single campaign
  getById: async (campaignId) => {
    const response = await api.get(`/campaigns/${campaignId}`);
    return response.data;
  },

  // Approve campaign
  approve: async (campaignId, approvedBy, modifications = null) => {
    const response = await api.put(`/campaigns/${campaignId}/approve`, {
      approvedBy,
      modifications,
    });
    return response.data;
  },

  // Reject campaign
  reject: async (campaignId, reason) => {
    const response = await api.put(`/campaigns/${campaignId}/reject`, {
      reason,
    });
    return response.data;
  },

  // Execute campaign
  execute: async (campaignId) => {
    const response = await api.post(`/campaigns/${campaignId}/execute`);
    return response.data;
  },

  // Get optimization recommendations
  optimize: async (campaignId) => {
    const response = await api.post(`/campaigns/${campaignId}/optimize`);
    return response.data;
  },

  // Create optimized version
  createOptimized: async (campaignId) => {
    const response = await api.post(`/campaigns/${campaignId}/create-optimized`);
    return response.data;
  },

  // Get optimization history
  getHistory: async (campaignId) => {
    const response = await api.get(`/campaigns/${campaignId}/history`);
    return response.data;
  },

  // Delete campaign
  delete: async (campaignId) => {
    const response = await api.delete(`/campaigns/${campaignId}`);
    return response.data;
  },
};

// ==================== Analytics APIs ====================

export const analyticsAPI = {
  // Get analytics for campaign
  getForCampaign: async (campaignId) => {
    const response = await api.get(`/analytics/${campaignId}`);
    return response.data;
  },

  // Refresh analytics
  refresh: async (campaignId) => {
    const response = await api.post(`/analytics/${campaignId}/refresh`);
    return response.data;
  },

  // Get real-time stats
  getRealtime: async (campaignId) => {
    const response = await api.get(`/analytics/${campaignId}/realtime`);
    return response.data;
  },

  // Compare with historical
  compare: async (campaignId) => {
    const response = await api.get(`/analytics/${campaignId}/compare`);
    return response.data;
  },

  // Get dashboard overview
  getDashboardOverview: async () => {
    const response = await api.get('/analytics/dashboard/overview');
    return response.data;
  },

  // Get performance chart data
  getPerformanceCharts: async () => {
    const response = await api.get('/analytics/charts/performance');
    return response.data;
  },

  // Get segment performance
  getSegmentPerformance: async () => {
    const response = await api.get('/analytics/segments/performance');
    return response.data;
  },
};

// ==================== Health Check ====================

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
