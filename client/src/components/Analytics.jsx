import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Alert, Spinner, Badge, Button, Row, Col } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FaSync, FaLightbulb, FaChartBar } from 'react-icons/fa';
import { analyticsAPI, campaignAPI } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function Analytics() {
  const { campaignId } = useParams();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState(null);
  const [optimizationData, setOptimizationData] = useState(null);

  useEffect(() => {
    if (campaignId) {
      fetchAnalytics(campaignId);
    } else {
      setError('No campaign ID provided');
      setLoading(false);
    }
  }, [campaignId]);

  const fetchAnalytics = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsResponse, campaignResponse] = await Promise.all([
        analyticsAPI.getForCampaign(id),
        campaignAPI.getById(id),
      ]);

      setAnalytics(analyticsResponse.data);
      setCampaign(campaignResponse.data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics. Campaign may not have been executed yet.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!campaignId) return;
    
    try {
      setLoading(true);
      await analyticsAPI.refresh(campaignId);
      await fetchAnalytics(campaignId);
      alert('✅ Analytics refreshed successfully!');
    } catch (err) {
      alert('Failed to refresh analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!campaignId) return;
    
    try {
      setLoading(true);
      const response = await campaignAPI.optimize(campaignId);
      
      if (response.status === 'pending') {
        alert(response.message);
      } else {
        setOptimizationData(response.data);
      }
    } catch (err) {
      alert('Failed to generate optimization');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="warning">{error}</Alert>;
  }

  if (!analytics) {
    return <Alert variant="info">No analytics data available yet.</Alert>;
  }

  const { overall, rates, campaignScore, segmentPerformance, insights, recommendations } =
    analytics;

  // Segment Performance Chart
  const segmentChartData = segmentPerformance
    ? {
        labels: segmentPerformance.map((s) => s.segmentName),
        datasets: [
          {
            label: 'Open Rate (%)',
            data: segmentPerformance.map((s) => s.openRate),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          },
          {
            label: 'Click Rate (%)',
            data: segmentPerformance.map((s) => s.clickRate),
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
          },
        ],
      }
    : null;

  // Performance Distribution Pie Chart
  const performancePieData = {
    labels: ['Opened', 'Clicked', 'No Engagement'],
    datasets: [
      {
        data: [
          overall.uniqueOpens,
          overall.uniqueClicks,
          overall.totalDelivered - overall.uniqueOpens,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(201, 203, 207, 0.6)',
        ],
      },
    ],
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>📊 Campaign Analytics</h2>
          {campaign && (
            <p className="text-muted">
              Product: <strong>{campaign.structuredData.product}</strong> |{' '}
              <code>{campaignId}</code>
            </p>
          )}
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={handleRefresh} disabled={loading}>
            <FaSync className="me-2" />
            Refresh
          </Button>
          <Button variant="warning" onClick={handleOptimize} disabled={loading}>
            <FaLightbulb className="me-2" />
            Optimize
          </Button>
        </div>
      </div>

      {/* Overall Metrics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">Total Sent</h6>
              <h2>{overall.totalSent}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">Open Rate</h6>
              <h2 className="text-success">{rates.openRate.toFixed(2)}%</h2>
              <small className="text-muted">{overall.uniqueOpens} unique opens</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">Click Rate</h6>
              <h2 className="text-info">{rates.clickRate.toFixed(2)}%</h2>
              <small className="text-muted">{overall.uniqueClicks} unique clicks</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">Campaign Score</h6>
              <h2 className="text-warning">
                {campaignScore.toFixed(2)}
              </h2>
              <small className="text-muted">
                {campaignScore > 15 ? '🏆 Excellent' : campaignScore > 10 ? '✅ Good' : '⚠️ Needs Improvement'}
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={8}>
          {segmentChartData && (
            <Card>
              <Card.Body>
                <Card.Title>
                  <FaChartBar className="me-2" />
                  Segment Performance
                </Card.Title>
                <div style={{ height: '300px' }}>
                  <Bar
                    data={segmentChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
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
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Engagement Distribution</Card.Title>
              <div style={{ height: '300px' }}>
                <Pie
                  data={performancePieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Insights */}
      {insights && insights.length > 0 && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>💡 Insights</Card.Title>
            <div className="d-flex flex-column gap-2">
              {insights.map((insight, idx) => (
                <Alert
                  key={idx}
                  variant={
                    insight.type === 'success'
                      ? 'success'
                      : insight.type === 'warning'
                      ? 'warning'
                      : 'info'
                  }
                  className="mb-0"
                >
                  <strong>
                    {insight.type === 'success' && '✅ '}
                    {insight.type === 'warning' && '⚠️ '}
                    {insight.type === 'improvement' && '📈 '}
                    {insight.metric}:
                  </strong>{' '}
                  {insight.message}
                </Alert>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>🎯 Recommendations for Next Campaign</Card.Title>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Suggestion</th>
                    <th>Priority</th>
                    <th>Expected Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map((rec, idx) => (
                    <tr key={idx}>
                      <td>
                        <Badge bg="primary">{rec.category}</Badge>
                      </td>
                      <td>{rec.suggestion}</td>
                      <td>
                        <Badge
                          bg={
                            rec.priority === 'high'
                              ? 'danger'
                              : rec.priority === 'medium'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {rec.priority}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">{rec.expectedImprovement}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Optimization Data */}
      {optimizationData && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>🔄 Optimization Recommendations</Card.Title>
            <Alert variant="info">
              <strong>Current Score:</strong> {optimizationData.currentScore.toFixed(2)}
              <br />
              <strong>Expected Improvement:</strong> {optimizationData.expectedImprovement}
            </Alert>
            
            <h6>Weak Points Identified:</h6>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {optimizationData.weakPoints.map((wp, idx) => (
                <Badge key={idx} bg="warning">
                  {wp.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
            
            <h6>AI Recommendations:</h6>
            <div className="bg-light p-3 rounded">
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {optimizationData.recommendations.aiGenerated}
              </pre>
            </div>
            
            <h6 className="mt-3">Optimized Campaign Brief:</h6>
            <div className="bg-light p-3 rounded">
              {optimizationData.optimizedBrief}
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default Analytics;
