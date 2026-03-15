# 📁 Project Structure

Complete directory structure of the SuperBFSI AI Campaign Manager.

```
d:\aiemail/
│
├── 📄 README.md                          # Project documentation
├── 📄 SETUP.md                           # Detailed setup guide
├── 📄 PROJECT_STRUCTURE.md               # This file
├── 📄 .env.example                       # Environment variables template
├── 📄 .gitignore                         # Git ignore rules
├── 📄 start.ps1                          # Quick start script (Windows)
│
├── 📁 server/                            # Backend (Node.js + Express)
│   ├── 📄 package.json                   # Server dependencies
│   ├── 📄 server.js                      # Main server entry point
│   ├── 📄 .env                           # Environment config (create from .env.example)
│   │
│   ├── 📁 config/                        # Configuration files
│   │   ├── db.js                         # MongoDB connection
│   │   └── openai.js                     # OpenAI API client
│   │
│   ├── 📁 models/                        # MongoDB Schemas
│   │   ├── Campaign.js                   # Campaign data model
│   │   ├── Email.js                      # Email records model
│   │   └── Analytics.js                  # Analytics data model
│   │
│   ├── 📁 agents/                        # 7 AI Agents
│   │   ├── campaignUnderstandingAgent.js # Agent 1: NLP extraction
│   │   ├── strategyAgent.js              # Agent 2: Strategy generation
│   │   ├── contentGenerationAgent.js     # Agent 3: Content creation
│   │   ├── executionAgent.js             # Agent 4: Email sending
│   │   ├── analyticsAgent.js             # Agent 5: Performance analysis
│   │   └── optimizationAgent.js          # Agent 6: Campaign optimization
│   │
│   └── 📁 routes/                        # API Routes
│       ├── campaign.routes.js            # Campaign endpoints
│       └── analytics.routes.js           # Analytics endpoints
│
└── 📁 client/                            # Frontend (React)
    ├── 📄 package.json                   # Client dependencies
    │
    ├── 📁 public/                        # Static files
    │   └── index.html                    # HTML template
    │
    └── 📁 src/                           # React source code
        ├── 📄 index.js                   # App entry point
        ├── 📄 index.css                  # Global styles
        ├── 📄 App.jsx                    # Main app component with routing
        │
        ├── 📁 components/                # React Components
        │   ├── Dashboard.jsx             # Page 1: Main dashboard
        │   ├── CreateCampaign.jsx        # Page 2: Campaign creation
        │   ├── StrategyPreview.jsx       # Page 3: Review & approval
        │   ├── Analytics.jsx             # Page 4: Performance analytics
        │   └── CampaignList.jsx          # Campaign management list
        │
        └── 📁 services/                  # API Integration
            └── api.js                    # API client & endpoints
```

---

## 🔑 Key Files Explained

### Backend Core Files

| File | Purpose |
|------|---------|
| `server/server.js` | Main Express server, middleware, routes |
| `server/config/db.js` | MongoDB connection handler |
| `server/config/openai.js` | OpenAI API wrapper functions |

### Database Models

| Model | Schema Fields |
|-------|---------------|
| `Campaign.js` | briefText, structuredData, strategy, content, approval, execution, analytics |
| `Email.js` | campaignId, recipient, content, delivery, engagement, tracking |
| `Analytics.js` | campaignId, overall metrics, rates, segment performance, insights |

### AI Agents

| Agent | Responsibility | Input | Output |
|-------|----------------|-------|--------|
| **campaignUnderstandingAgent** | Extract structured data from natural language | briefText | structuredData JSON |
| **strategyAgent** | Design campaign strategy | structuredData | strategy (segments, timing, tone) |
| **contentGenerationAgent** | Generate email content | structuredData + strategy | subject lines + email body |
| **executionAgent** | Send emails via API | campaign + recipients | execution summary |
| **analyticsAgent** | Calculate performance metrics | campaignId | analytics data |
| **optimizationAgent** | Generate improvements | campaignId + analytics | optimization recommendations |

### API Routes

#### Campaign Routes (`/api/campaigns`)
- `POST /create` - Create campaign from brief
- `GET /:campaignId` - Get campaign details
- `GET /` - List all campaigns
- `PUT /:campaignId/approve` - Approve campaign
- `PUT /:campaignId/reject` - Reject campaign
- `POST /:campaignId/execute` - Execute campaign
- `POST /:campaignId/optimize` - Get optimization
- `POST /:campaignId/create-optimized` - Create optimized version
- `GET /:campaignId/history` - Get optimization history
- `DELETE /:campaignId` - Delete campaign

#### Analytics Routes (`/api/analytics`)
- `GET /:campaignId` - Get analytics for campaign
- `POST /:campaignId/refresh` - Refresh analytics
- `GET /:campaignId/realtime` - Real-time stats
- `GET /:campaignId/compare` - Compare with historical
- `GET /dashboard/overview` - Dashboard aggregate data
- `GET /charts/performance` - Chart data
- `GET /segments/performance` - Segment analysis

### Frontend Components

| Component | Route | Features |
|-----------|-------|----------|
| **Dashboard** | `/` | Metrics cards, performance charts, recent campaigns |
| **CreateCampaign** | `/create` | Natural language input, example template, AI processing |
| **StrategyPreview** | `/campaign/:id` | Strategy review, subject line selection, approval interface |
| **CampaignList** | `/campaigns` | All campaigns, status badges, quick actions |
| **Analytics** | `/analytics/:id` | Charts, insights, recommendations, optimization |

---

## 🔄 Data Flow

```
1. User Input (Natural Language Brief)
           ↓
2. Campaign Understanding Agent (Extract Structure)
           ↓
3. Strategy Agent (Generate Segments, Timing, Tone)
           ↓
4. Content Generation Agent (Create Subject Lines & Body)
           ↓
5. Human Approval Interface (Review & Approve)
           ↓
6. Execution Agent (Send Emails)
           ↓
7. Analytics Agent (Calculate Metrics)
           ↓
8. Optimization Agent (Generate Improvements)
           ↓
9. Loop Back (Create Optimized Campaign)
```

---

## 🗄️ Database Collections

### campaigns
```javascript
{
  campaignId: String,
  briefText: String,
  structuredData: { product, baseOffer, specialOffer, goals, ... },
  strategy: { segments, sendTime, tone, ... },
  content: { subjectLines, emailBody, ... },
  approval: { status, approvedBy, ... },
  execution: { status, totalSent, ... },
  analytics: { openRate, clickRate, campaignScore, ... }
}
```

### emails
```javascript
{
  emailId: String,
  campaignId: String,
  recipient: { email, name, segment, ... },
  content: { subject, body, ctaUrl },
  delivery: { status, sentAt, ... },
  engagement: { opened, clicked, openCount, clickCount, ... }
}
```

### analytics
```javascript
{
  campaignId: String,
  overall: { totalSent, totalOpened, totalClicks, ... },
  rates: { openRate, clickRate, ... },
  campaignScore: Number,
  segmentPerformance: [ { segmentName, openRate, clickRate, ... } ],
  insights: [ { type, message, ... } ],
  recommendations: [ { category, suggestion, priority, ... } ]
}
```

---

## 🎨 UI Pages Architecture

```
App (Router Container)
├── Navbar (Navigation)
├── Routes
│   ├── / → Dashboard
│   ├── /create → CreateCampaign
│   ├── /campaigns → CampaignList
│   ├── /campaign/:id → StrategyPreview
│   └── /analytics/:id → Analytics
└── Footer
```

---

## 🔐 Environment Variables

Required in `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/superbfsi_campaigns
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4
SENDGRID_API_KEY=optional-for-live-mode
FROM_EMAIL=campaigns@superbfsi.com
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
EMAIL_MODE=mock
```

---

## 📦 Dependencies

### Backend (server/package.json)
- express - Web framework
- mongoose - MongoDB ODM
- openai - OpenAI API client
- cors - Cross-origin support
- dotenv - Environment variables
- axios - HTTP client
- jsonwebtoken - JWT auth
- morgan - Request logging

### Frontend (client/package.json)
- react - UI library
- react-router-dom - Routing
- axios - API calls
- bootstrap - CSS framework
- react-bootstrap - React components
- chart.js - Charts
- react-chartjs-2 - React chart wrapper
- react-icons - Icon library

---

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas for database
- [ ] Set strong `JWT_SECRET`
- [ ] Configure SendGrid for live emails
- [ ] Build React app (`npm run build`)
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy
- [ ] Set API rate limits

---

## 📈 Performance Optimization

1. **Backend:**
   - Use connection pooling for MongoDB
   - Cache OpenAI responses
   - Implement request rate limiting
   - Use indexes on frequently queried fields

2. **Frontend:**
   - Code splitting with React.lazy
   - Image optimization
   - Caching strategies
   - Minimize bundle size

---

## 🔨 Development Workflow

1. **Create Feature Branch**
2. **Make Changes**
3. **Test Locally**
4. **Commit Changes**
5. **Push & Deploy**

---

## 📚 Code Organization Principles

- **Separation of Concerns**: Agents, Models, Routes separated
- **Single Responsibility**: Each agent has one focused task
- **DRY Principle**: Reusable config and utilities
- **Error Handling**: Try-catch with meaningful messages
- **Documentation**: Comments and console logs

---

**This structure supports scalability, maintainability, and clear separation of multi-agent architecture! 🎯**
