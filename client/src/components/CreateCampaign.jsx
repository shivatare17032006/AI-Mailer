import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaLightbulb } from 'react-icons/fa';
import { campaignAPI } from '../services/api';

function CreateCampaign() {
  const navigate = useNavigate();
  const [briefText, setBriefText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const exampleBrief = `Launch XDeposit term deposit product with 1% higher returns than market standard. 
Offer additional 0.25% for female senior citizens above 60 years. 
Target both active and inactive customers. 
Priority is to maximize open rate and click rate. 
CTA: https://superbfsi.com/xdeposit/explore/`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!briefText.trim()) {
      setError('Please enter a campaign brief');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('Creating campaign with brief:', briefText);
      const response = await campaignAPI.create(briefText);

      setSuccess('Campaign created successfully! Redirecting to preview...');
      
      setTimeout(() => {
        navigate(`/campaign/${response.data.campaignId}`);
      }, 1500);

    } catch (err) {
      console.error('Campaign creation error:', err);
      setError(err.response?.data?.message || 'Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setBriefText(exampleBrief);
  };

  return (
    <div>
      <h2 className="mb-4">📝 Create New Campaign</h2>

      <Card>
        <Card.Body>
          <Card.Title>
            <FaPaperPlane className="me-2" />
            Enter Campaign Brief
          </Card.Title>
          <Card.Text className="text-muted">
            Describe your email campaign in natural language. Our AI agents will understand and
            create an optimized strategy for you.
          </Card.Text>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Campaign Brief</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                className="campaign-brief-textarea"
                placeholder="Example: Launch XDeposit with 1% higher returns. Target senior citizens and inactive customers..."
                value={briefText}
                onChange={(e) => setBriefText(e.target.value)}
                disabled={loading}
              />
              <Form.Text className="text-muted">
                Include: Product name, offers, target audience, goals, and CTA URL
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={loading || !briefText.trim()}
                className="btn-custom"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Creating Campaign...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="me-2" />
                    Generate Strategy
                  </>
                )}
              </Button>

              <Button
                variant="outline-secondary"
                onClick={loadExample}
                disabled={loading}
              >
                <FaLightbulb className="me-2" />
                Load Example
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Info Cards */}
      <div className="row mt-4">
        <div className="col-md-4">
          <Card className="h-100">
            <Card.Body>
              <h5>🤖 AI Understanding</h5>
              <p className="text-muted small">
                Our AI extracts structured data from your natural language brief including
                product details, offers, and targeting criteria.
              </p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="h-100">
            <Card.Body>
              <h5>📊 Smart Strategy</h5>
              <p className="text-muted small">
                Generates optimal segmentation, timing, tone, and A/B testing strategy based
                on BFSI best practices for India.
              </p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="h-100">
            <Card.Body>
              <h5>✍️ Content Generation</h5>
              <p className="text-muted small">
                Creates compelling subject lines and email body optimized for maximum open
                rate and click rate.
              </p>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Tips Section */}
      <Card className="mt-4">
        <Card.Body>
          <Card.Title>💡 Tips for Better Results</Card.Title>
          <ul>
            <li>
              <strong>Be specific:</strong> Include product name, key offers, and target
              audience
            </li>
            <li>
              <strong>State goals:</strong> Mention if you want high open rate, click rate,
              or conversions
            </li>
            <li>
              <strong>Include CTA:</strong> Provide the landing page URL where customers
              should go
            </li>
            <li>
              <strong>Target segments:</strong> Specify if you want to target specific
              customer groups
            </li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CreateCampaign;
