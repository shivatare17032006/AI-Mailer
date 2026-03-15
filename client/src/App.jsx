import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaChartLine, FaEnvelope, FaPlusCircle, FaHome, FaAddressBook } from 'react-icons/fa';

// Components
import Dashboard from './components/Dashboard';
import CreateCampaign from './components/CreateCampaign';
import StrategyPreview from './components/StrategyPreview';
import Analytics from './components/Analytics';
import CampaignList from './components/CampaignList';
import EmailManager from './components/EmailManager';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Navigation Bar */}
        <Navbar bg="primary" variant="dark" expand="lg" sticky="top">
          <Container>
            <Navbar.Brand as={Link} to="/">
              <FaEnvelope className="me-2" />
              SuperBFSI Campaign Manager
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/">
                  <FaHome className="me-1" /> Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/contacts">
                  <FaAddressBook className="me-1" /> Contacts
                </Nav.Link>
                <Nav.Link as={Link} to="/create">
                  <FaPlusCircle className="me-1" /> Create Campaign
                </Nav.Link>
                <Nav.Link as={Link} to="/campaigns">
                  <FaEnvelope className="me-1" /> Campaigns
                </Nav.Link>
                <Nav.Link as={Link} to="/analytics">
                  <FaChartLine className="me-1" /> Analytics
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Main Content */}
        <Container className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contacts" element={<EmailManager />} />
            <Route path="/create" element={<CreateCampaign />} />
            <Route path="/campaigns" element={<CampaignList />} />
            <Route path="/campaign/:campaignId" element={<StrategyPreview />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/analytics/:campaignId" element={<Analytics />} />
          </Routes>
        </Container>

        {/* Footer */}
        <footer className="footer">
          <Container>
            <p className="mb-0">
              &copy; 2026 SuperBFSI - AI Multi-Agent Email Campaign Manager
            </p>
            <p className="mb-0 mt-2">
              <small>Powered by Multi-Agent AI Architecture</small>
            </p>
          </Container>
        </footer>
      </div>
    </Router>
  );
}

export default App;
