import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { FaCheck, FaTimes, FaRocket, FaChartLine, FaEdit } from 'react-icons/fa';
import { campaignAPI } from '../services/api';

function StrategyPreview() {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedSubjectLine, setSelectedSubjectLine] = useState(null);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await campaignAPI.getById(campaignId);
      setCampaign(response.data);
      setSelectedSubjectLine(response.data.content.selectedSubjectLine);
    } catch (err) {
      setError('Failed to load campaign');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await campaignAPI.approve(campaignId, 'Admin', {
        subjectLine: selectedSubjectLine,
      });
      
      alert('✅ Campaign Approved! You can now execute it.');
      fetchCampaign();
    } catch (err) {
      alert('Failed to approve campaign');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      await campaignAPI.reject(campaignId, rejectReason);
      setShowRejectModal(false);
      alert('❌ Campaign Rejected');
      fetchCampaign();
    } catch (err) {
      alert('Failed to reject campaign');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!window.confirm('Execute this campaign now? Emails will be sent to all segments.')) {
      return;
    }

    try {
      setActionLoading(true);
      await campaignAPI.execute(campaignId);
      alert('🚀 Campaign Executed Successfully!');
      fetchCampaign();
    } catch (err) {
      alert('Failed to execute campaign');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const viewAnalytics = () => {
    navigate(`/analytics/${campaignId}`);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || !campaign) {
    return <Alert variant="danger">{error || 'Campaign not found'}</Alert>;
  }

  const { structuredData, strategy, content, approval, execution } = campaign;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>📋 Campaign Preview</h2>
          <p className="text-muted">
            <code>{campaign.campaignId}</code>
          </p>
        </div>
        <div>
          <span className={`status-badge status-${approval.status}`}>
            {approval.status.toUpperCase()}
          </span>
          {execution.status !== 'not_started' && (
            <span className={`status-badge status-${execution.status} ms-2`}>
              {execution.status.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Campaign Summary */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>📦 Campaign Summary</Card.Title>
          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>Product:</strong> {structuredData?.product || 'Campaign'}
              </p>
              <p>
                <strong>Base Offer:</strong> {structuredData?.baseOffer || 'N/A'}
              </p>
              <p>
                <strong>Special Offer:</strong> {structuredData?.specialOffer || 'None'}
              </p>
            </div>
            <div className="col-md-6">
              <p>
                <strong>Target Audience:</strong> {structuredData?.targetAudience || 'N/A'}
              </p>
              <p>
                <strong>Goals:</strong>{' '}
                {structuredData?.goals?.map((g) => (
                  <Badge key={g} bg="info" className="me-1">
                    {g}
                  </Badge>
                ))}
              </p>
              <p>
                <strong>CTA:</strong>{' '}
                <a href={structuredData.cta} target="_blank" rel="noopener noreferrer">
                  {structuredData.cta}
                </a>
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Strategy */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>🎯 Campaign Strategy</Card.Title>
          
          <h6 className="mt-3">Target Segments</h6>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {strategy.segments.map((seg, idx) => (
              <div key={idx} className="segment-badge">
                <strong>{seg.name}</strong>
                <br />
                <small>Size: ~{seg.estimatedSize || 'N/A'}</small>
              </div>
            ))}
          </div>

          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>Send Time:</strong> {strategy.sendTime.recommendedDay},{' '}
                {strategy.sendTime.recommendedTimeSlot}
              </p>
              <p>
                <strong>Tone:</strong>{' '}
                <Badge bg="primary">{strategy.tone}</Badge>
              </p>
            </div>
            <div className="col-md-6">
              <p>
                <strong>A/B Testing:</strong>{' '}
                {strategy.abTesting.enabled ? (
                  <Badge bg="success">Enabled ({strategy.abTesting.variants} variants)</Badge>
                ) : (
                  <Badge bg="secondary">Disabled</Badge>
                )}
              </p>
              <p>
                <strong>Expected Open Rate:</strong>{' '}
                {strategy.expectedOutcome?.estimatedOpenRate || 'N/A'}%
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Subject Lines */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>✉️ Subject Lines</Card.Title>
          <p className="text-muted">Select the subject line you want to use:</p>
          
          {content.subjectLines.map((sl, idx) => (
            <div
              key={idx}
              className={`subject-line-option ${
                selectedSubjectLine === sl.text ? 'selected' : ''
              }`}
              onClick={() => setSelectedSubjectLine(sl.text)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{sl.text}</strong>
                  <br />
                  <small className="text-muted">Type: {sl.type}</small>
                </div>
                {sl.estimatedOpenRate && (
                  <Badge bg="info">~{sl.estimatedOpenRate}% open rate</Badge>
                )}
              </div>
            </div>
          ))}
        </Card.Body>
      </Card>

      {/* Email Preview */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>📧 Email Preview</Card.Title>
          <div className="email-preview">
            <div className="mb-3">
              <strong>Subject:</strong> {selectedSubjectLine}
            </div>
            <div dangerouslySetInnerHTML={{ __html: content.emailBody }} />
          </div>
        </Card.Body>
      </Card>

      {/* Action Buttons */}
      <Card>
        <Card.Body>
          <Card.Title>👤 Human Approval Required</Card.Title>
          
          {approval.status === 'pending' && (
            <div className="d-flex gap-2">
              <Button
                variant="success"
                size="lg"
                onClick={handleApprove}
                disabled={actionLoading}
                className="btn-custom"
              >
                <FaCheck className="me-2" />
                Approve Campaign
              </Button>
              
              <Button
                variant="outline-secondary"
                size="lg"
                onClick={() => navigate('/create')}
                disabled={actionLoading}
              >
                <FaEdit className="me-2" />
                Edit Brief
              </Button>
              
              <Button
                variant="danger"
                size="lg"
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
              >
                <FaTimes className="me-2" />
                Reject
              </Button>
            </div>
          )}

          {approval.status === 'approved' && execution.status === 'not_started' && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleExecute}
              disabled={actionLoading}
              className="btn-custom"
            >
              <FaRocket className="me-2" />
              {actionLoading ? 'Executing...' : 'Execute Campaign Now'}
            </Button>
          )}

          {execution.status === 'completed' && (
            <div>
              <Alert variant="success">
                <strong>✅ Campaign Executed Successfully!</strong>
                <br />
                Sent: {execution.totalSent} | Failed: {execution.totalFailed}
              </Alert>
              <Button variant="primary" onClick={viewAnalytics}>
                <FaChartLine className="me-2" />
                View Analytics
              </Button>
            </div>
          )}

          {approval.status === 'rejected' && (
            <Alert variant="danger">
              <strong>Campaign Rejected</strong>
              <br />
              Reason: {approval.rejectionReason}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Campaign</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason for Rejection</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={actionLoading || !rejectReason.trim()}
          >
            Confirm Rejection
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default StrategyPreview;
