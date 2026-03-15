import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Alert, Spinner, Badge, Button, Table } from 'react-bootstrap';
import { FaEye, FaTrash, FaChartLine } from 'react-icons/fa';
import { campaignAPI } from '../services/api';

function CampaignList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchCampaigns(1);
  }, []);

  const fetchCampaigns = async (page) => {
    try {
      setLoading(true);
      setError(null);

      const response = await campaignAPI.getAll(page, 10);
      setCampaigns(response.data.campaigns);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Campaign fetch error:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      await campaignAPI.delete(campaignId);
      alert('Campaign deleted successfully');
      fetchCampaigns(pagination.page);
    } catch (err) {
      alert('Failed to delete campaign');
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return (
      <Badge bg={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>
    );
  };

  const getExecutionBadge = (status) => {
    const variants = {
      not_started: 'secondary',
      in_progress: 'info',
      completed: 'success',
      failed: 'danger',
    };
    return (
      <Badge bg={variants[status] || 'secondary'}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📧 All Campaigns</h2>
        <Button variant="primary" onClick={() => navigate('/create')}>
          + Create New Campaign
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {campaigns.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4 className="text-muted">No campaigns yet</h4>
            <p className="text-muted">Create your first campaign to get started!</p>
            <Button variant="primary" onClick={() => navigate('/create')}>
              Create Campaign
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Campaign ID</th>
                      <th>Product</th>
                      <th>Approval</th>
                      <th>Execution</th>
                      <th>Score</th>
                      <th>Open Rate</th>
                      <th>Click Rate</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.campaignId}>
                        <td>
                          <code className="small">{campaign.campaignId.substring(0, 15)}...</code>
                        </td>
                        <td>
                          <strong>{campaign.structuredData?.product || 'N/A'}</strong>
                        </td>
                        <td>{getStatusBadge(campaign.approval.status)}</td>
                        <td>{getExecutionBadge(campaign.execution.status)}</td>
                        <td>
                          <Badge
                            bg={
                              campaign.analytics.campaignScore > 15
                                ? 'success'
                                : campaign.analytics.campaignScore > 10
                                ? 'info'
                                : 'secondary'
                            }
                          >
                            {campaign.analytics.campaignScore > 0
                              ? campaign.analytics.campaignScore.toFixed(2)
                              : 'N/A'}
                          </Badge>
                        </td>
                        <td>
                          {campaign.analytics.openRate > 0
                            ? `${campaign.analytics.openRate.toFixed(2)}%`
                            : 'N/A'}
                        </td>
                        <td>
                          {campaign.analytics.clickRate > 0
                            ? `${campaign.analytics.clickRate.toFixed(2)}%`
                            : 'N/A'}
                        </td>
                        <td>
                          <small>
                            {new Date(campaign.createdAt).toLocaleDateString()}
                            <br />
                            {new Date(campaign.createdAt).toLocaleTimeString()}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() =>
                                navigate(`/campaign/${campaign.campaignId}`)
                              }
                              title="View Details"
                            >
                              <FaEye />
                            </Button>
                            {campaign.execution.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="outline-info"
                                onClick={() =>
                                  navigate(`/analytics/${campaign.campaignId}`)
                                }
                                title="View Analytics"
                              >
                                <FaChartLine />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(campaign.campaignId)}
                              title="Delete"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant="outline-primary"
                disabled={pagination.page === 1}
                onClick={() => fetchCampaigns(pagination.page - 1)}
                className="me-2"
              >
                Previous
              </Button>
              <span className="align-self-center mx-3">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline-primary"
                disabled={pagination.page === pagination.pages}
                onClick={() => fetchCampaigns(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}

          <div className="text-center mt-3 text-muted">
            <small>Total Campaigns: {pagination.total}</small>
          </div>
        </>
      )}
    </div>
  );
}

export default CampaignList;
