# AI-Based Multi-Agent Email Campaign Manager for SuperBFSI

## 🏆 Project Overview

An intelligent, semi-autonomous AI system that understands natural language marketing briefs, plans email campaigns using multi-agent architecture, requests human approval, executes campaigns, and continuously optimizes performance based on real-time analytics.

## 🎯 Problem Statement

SuperBFSI (a BFSI service provider in India) needs an intelligent email campaign manager that:
- Understands campaign briefs in natural language
- Automatically creates strategy and content
- Requests human approval before execution
- Executes campaigns and monitors performance
- Optimizes future campaigns based on data

## 🏗️ Architecture

### Multi-Agent System (7 Agents)

1. **Campaign Understanding Agent** - Extracts structured data from natural language
2. **Strategy Agent** - Designs segmentation, timing, and approach
3. **Content Generation Agent** - Creates subject lines and email bodies
4. **Human-in-the-Loop Agent** - Approval interface
5. **Execution Agent** - Sends emails via API
6. **Analytics Agent** - Tracks open rate & click rate
7. **Optimization Agent** - Continuous improvement loop

### Workflow

```
User Input (NL) → Understanding → Strategy → Content → Human Approval → Execution → Analytics → Optimization ↺
```

## 📊 Optimization Formula

```
Campaign Score = (0.6 × Open Rate) + (0.4 × Click Rate)
```

System continuously maximizes this score through intelligent iteration.

## 🛠️ Tech Stack

### MERN Stack
- **MongoDB** - Database for campaigns, analytics, emails
- **Express.js** - REST API backend
- **React** - Frontend UI
- **Node.js** - Server runtime

### AI Integration
- **OpenAI API** - GPT-4 for all agents
- **SendGrid / Mock API** - Email delivery

### Additional Tools
- Mongoose - ODM for MongoDB
- Axios - HTTP client
- Chart.js - Analytics visualization
- JWT - Authentication

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally or MongoDB Atlas
- OpenAI API Key
- SendGrid API Key (optional)

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd aiemail
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Install client dependencies
```bash
cd ../client
npm install
```

4. Configure environment variables
```bash
# Copy .env.example to .env in server directory
cp .env.example server/.env
# Edit server/.env with your API keys
```

5. Start MongoDB (if running locally)
```bash
mongod
```

6. Run the application

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm start
```

7. Open browser at `http://localhost:3000`

## 📁 Project Structure

```
aiemail/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── services/      # API integration
│   │   ├── App.jsx
│   └── package.json
├── server/                # Node.js backend
│   ├── agents/           # 7 AI agents
│   ├── models/           # MongoDB schemas
│   ├── routes/           # Express routes
│   ├── config/           # Configuration
│   ├── server.js
│   └── package.json
├── .env.example
└── README.md
```

## 🎨 UI Pages

1. **Dashboard** - Campaign overview, metrics, performance graphs
2. **Create Campaign** - Natural language input interface
3. **Strategy Preview** - Review and approve before sending
4. **Analytics** - Detailed performance tracking and optimization insights

## 🔑 Key Features

✅ Natural language campaign brief processing
✅ Intelligent multi-agent decision making
✅ Human-in-the-loop approval system
✅ Real-time email campaign execution
✅ Open rate & click rate tracking
✅ Automated campaign optimization
✅ Segment-wise performance analysis
✅ A/B testing support
✅ Explainable AI decisions

## 🌟 Innovation Highlights

- **Multi-Agent Architecture** - Specialized agents working together
- **Self-Optimization Loop** - Continuous learning from campaign performance
- **Human Approval Layer** - Safety mechanism before execution
- **Explainable Decisions** - Transparent AI reasoning
- **Performance Scoring** - Data-driven campaign evaluation

## 📝 Example Campaign Brief

```
"Launch XDeposit term deposit product with 1% higher returns than market. 
Offer additional 0.25% for female senior citizens. Target both active and 
inactive customers. Priority is to maximize open rate and click rate. 
CTA: https://superbfsi.com/xdeposit/explore/"
```

## 🔒 Environment Variables

See `.env.example` for required configuration:
- MongoDB connection
- OpenAI API key
- SendGrid API key
- JWT secret
- Port configuration

## 📈 Monitoring & Analytics

The system tracks:
- Campaign performance metrics
- Segment-wise engagement
- Time-slot effectiveness
- A/B test results
- Optimization iteration history

## 🤝 Contributing

This is a hackathon/demonstration project for SuperBFSI.

## 📄 License

MIT License

## 👨‍💻 Author

Aryan Shivatare


---

**Status**: Development
**Target**: India BFSI Market
**Channel**: Email Marketing Only
