import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaChartLine, FaUserFriends, FaTrophy } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { analyticsAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overview and chart data
      const [overviewResponse, chartResponse] = await Promise.all([
        analyticsAPI.getDashboardOverview(),
        analyticsAPI.getPerformanceCharts(),
      ]);

      setDashboardData(overviewResponse.data);

      // Prepare chart data
      if (chartResponse.data && chartResponse.data.length > 0) {
        setChartData({
          labels: chartResponse.data.map((d) => d.product),
          datasets: [
            {
              label: 'Open Rate (%)',
              data: chartResponse.data.map((d) => d.openRate),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.3,
            },
            {
              label: 'Click Rate (%)',
              data: chartResponse.data.map((d) => d.clickRate),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.3,
            },
          ],
        });
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!dashboardData) {
    return <Alert variant="info">No data available yet. Create your first campaign!</Alert>;
  }

  const { overview, bestPerformers, recentCampaigns } = dashboardData;

  return (
    <div>
      <h2 className="mb-4">📊 Dashboard Overview</h2>

      {/* Metric Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="metric-card text-center p-3">
            <FaEnvelope size={40} className="text-primary mb-2" />
            <h3>{overview.totalCampaigns}</h3>
            <p className="text-muted mb-0">Total Campaigns</p>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card text-center p-3">
            <FaChartLine size={40} className="text-success mb-2" />
            <h3>{overview.averageOpenRate}%</h3>
            <p className="text-muted mb-0">Avg Open Rate</p>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card text-center p-3">
            <FaChartLine size={40} className="text-info mb-2" />
            <h3>{overview.averageClickRate}%</h3>
            <p className="text-muted mb-0">Avg Click Rate</p>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card text-center p-3">
            <FaTrophy size={40} className="text-warning mb-2" />
            <h3>{overview.averageCampaignScore}</h3>
            <p className="text-muted mb-0">Campaign Score</p>
          </Card>
        </Col>
      </Row>

      {/* Performance Chart */}
      {chartData && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>📈 Campaign Performance Trends</Card.Title>
                <div className="chart-container">
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Rate (%)',
                          },
                        },
                      },
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Best Performers */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>🏆 Best Performing Campaign</Card.Title>
              {bestPerformers.campaign ? (
                <div>
                  <p>
                    <strong>Product:</strong> {bestPerformers.campaign.product}
                  </p>
                  <p>
                    <strong>Campaign ID:</strong>{' '}
                    <code>{bestPerformers.campaign.campaignId}</code>
                  </p>
                  <p>
                    <strong>Score:</strong>{' '}
                    <Badge bg="success">{bestPerformers.campaign.score.toFixed(2)}</Badge>
                  </p>
                </div>
              ) : (
                <p className="text-muted">No campaigns yet</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>👥 Best Performing Segment</Card.Title>
              <div className="text-center">
                <FaUserFriends size={50} className="text-info mb-3" />
                <h4>{bestPerformers.segment}</h4>
                <p className="text-muted">Highest engagement across all campaigns</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Campaigns */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>📧 Recent Campaigns</Card.Title>
              {recentCampaigns && recentCampaigns.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Status</th>
                        <th>Execution</th>
                        <th>Score</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCampaigns.map((campaign) => (
                        <tr key={campaign.campaignId}>
                          <td>{campaign.product}</td>
                          <td>
                            <span className={`status-badge status-${campaign.status}`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge status-${campaign.executionStatus}`}>
                              {campaign.executionStatus}
                            </span>
                          </td>
                          <td>
                            <Badge bg={campaign.score > 15 ? 'success' : 'secondary'}>
                              {campaign.score.toFixed(2)}
                            </Badge>
                          </td>
                          <td>{new Date(campaign.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => navigate(`/campaign/${campaign.campaignId}`)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Alert variant="info">No campaigns yet. Create your first campaign!</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
