# 🚀 Setup Guide - SuperBFSI AI Campaign Manager

Complete step-by-step guide to set up and run the project.

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **MongoDB** installed locally OR MongoDB Atlas account ([Get Free](https://www.mongodb.com/cloud/atlas))
- **OpenAI API Key** ([Get Key](https://platform.openai.com/api-keys))
- **Git** (optional, for cloning)

---

## 🔧 Installation Steps

### Step 1: Navigate to Project Directory

```bash
cd d:\aiemail
```

### Step 2: Install Server Dependencies

```bash
cd server
npm install
```

This will install:
- Express.js
- MongoDB/Mongoose
- OpenAI SDK
- Other backend dependencies

### Step 3: Install Client Dependencies

```bash
cd ../client
npm install
```

This will install:
- React
- React Router
- Bootstrap
- Chart.js
- Axios

---

## ⚙️ Configuration

### Step 1: Configure Environment Variables

Copy the example environment file:

```bash
# From project root
copy .env.example server\.env
```

### Step 2: Edit `server/.env` File

Open `server/.env` in a text editor and configure:

```env
# MongoDB - Choose one:
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/superbfsi_campaigns

# Option 2: MongoDB Atlas (Recommended)
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/superbfsi_campaigns

# OpenAI API Key (REQUIRED)
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Server Port
PORT=5000

# Email Mode
EMAIL_MODE=mock
# Use 'mock' for development, 'live' for production with SendGrid
```

**Important:** Replace `sk-your-actual-openai-api-key-here` with your real OpenAI API key!

---

## 🗄️ Database Setup

### Option 1: Local MongoDB

1. **Install MongoDB**: [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)

2. **Start MongoDB Service**:

   **Windows:**
   ```powershell
   net start MongoDB
   ```

   **OR run manually:**
   ```powershell
   "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
   ```

3. **Verify Connection**:
   ```powershell
   mongo
   # Or
   mongosh
   ```

### Option 2: MongoDB Atlas (Cloud - Easier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get connection string
5. Whitelist your IP (or use 0.0.0.0/0 for development)
6. Update `MONGODB_URI` in `.env`

---

## ▶️ Running the Application

### Method 1: Run Backend and Frontend Separately (Recommended)

**Terminal 1 - Start Backend Server:**

```powershell
cd d:\aiemail\server
npm run dev
```

You should see:
```
╔════════════════════════════════════════════════╗
║   SuperBFSI AI Campaign Manager - Server      ║
╠════════════════════════════════════════════════╣
║   Port: 5000                                   ║
║   Environment: development                     ║
║   API: http://localhost:5000                   ║
╚════════════════════════════════════════════════╝

✅ MongoDB Connected: localhost
```

**Terminal 2 - Start React Frontend:**

```powershell
cd d:\aiemail\client
npm start
```

Browser will automatically open at `http://localhost:3000`

### Method 2: Production Build

```powershell
# Build frontend
cd d:\aiemail\client
npm run build

# Serve from backend (configure static serving in server.js)
cd ../server
npm start
```

---

## 🧪 Testing the Application

### 1. Check API Health

Open browser or use curl:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "success",
  "message": "SuperBFSI AI Campaign Manager API is running"
}
```

### 2. Test Frontend

Open `http://localhost:3000` - you should see the dashboard.

### 3. Create First Campaign

1. Click **"Create Campaign"**
2. Click **"Load Example"** button
3. Click **"Generate Strategy"**
4. Wait for AI to process (15-30 seconds)
5. Review the generated strategy
6. **Approve** the campaign
7. Click **"Execute Campaign Now"**
8. View analytics

---

## 📱 Application Pages

### 1. Dashboard (`/`)
- Overview of all campaigns
- Performance metrics
- Recent campaign list
- Charts

### 2. Create Campaign (`/create`)
- Enter natural language brief
- AI processes and generates strategy
- Example template provided

### 3. Campaign Preview (`/campaign/:id`)
- View generated strategy
- Review segments and timing
- Choose subject line
- Preview email
- **Approve/Reject/Execute**

### 4. Campaigns List (`/campaigns`)
- All campaigns with status
- Quick actions
- Pagination

### 5. Analytics (`/analytics/:id`)
- Open rate, click rate, campaign score
- Segment performance charts
- Insights and recommendations
- **Optimization suggestions**

---

## 🐛 Troubleshooting

### Problem: MongoDB Connection Failed

**Solution:**
1. Ensure MongoDB service is running
2. Check connection string in `.env`
3. For Atlas, whitelist your IP address

### Problem: OpenAI API Error

**Solution:**
1. Verify API key is correct
2. Check you have credits in OpenAI account
3. Ensure `OPENAI_API_KEY` in `.env` has no quotes

### Problem: Frontend Can't Connect to Backend

**Solution:**
1. Ensure backend is running on port 5000
2. Check `proxy` in `client/package.json` is set to `http://localhost:5000`
3. Clear browser cache

### Problem: Port Already in Use

**Solution:**
```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Problem: npm install fails

**Solution:**
```powershell
# Clear cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

---

## 🔑 OpenAI API Key Setup

### Get API Key:

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up / Log in
3. Navigate to **API Keys**
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-`)
6. Paste in `server/.env`:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

### Set Usage Limits (Recommended):

1. Go to **Settings > Billing > Usage limits**
2. Set monthly budget cap
3. Enable email alerts

---

## 📊 Data Persistence

All data is stored in MongoDB:

**Collections:**
- `campaigns` - Campaign records with strategy and content
- `emails` - Individual email records with engagement tracking
- `analytics` - Aggregated performance metrics

**View Data:**
```powershell
# Using MongoDB Compass (GUI)
# Connection string: mongodb://localhost:27017

# Or using mongosh
mongosh
use superbfsi_campaigns
db.campaigns.find().pretty()
```

---

## 🚀 Production Deployment

### Environment Variables for Production:

```env
NODE_ENV=production
MONGODB_URI=<production-mongodb-atlas-uri>
OPENAI_API_KEY=<your-key>
SENDGRID_API_KEY=<sendgrid-key>
EMAIL_MODE=live
JWT_SECRET=<generate-strong-secret>
CLIENT_URL=https://your-domain.com
```

### Build for Production:

```bash
# Build frontend
cd client
npm run build

# Deploy backend with built frontend
# Use PM2, Docker, or cloud platform (Heroku, AWS, Azure)
```

---

## 📖 API Documentation

### Campaign APIs:

- `POST /api/campaigns/create` - Create campaign from brief
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id/approve` - Approve campaign
- `POST /api/campaigns/:id/execute` - Execute campaign
- `POST /api/campaigns/:id/optimize` - Get optimization

### Analytics APIs:

- `GET /api/analytics/:id` - Get campaign analytics
- `POST /api/analytics/:id/refresh` - Refresh analytics
- `GET /api/analytics/dashboard/overview` - Dashboard data

---

## 🎯 Next Steps

After setup:

1. ✅ Create your first campaign
2. ✅ Review AI-generated strategy
3. ✅ Execute and monitor performance
4. ✅ Use optimization agent for improvements
5. ✅ Iterate and improve scores

---

## 💡 Tips for Best Results

- **Be specific** in campaign briefs
- **Include CTA URLs** for better content generation
- **Define target segments** clearly
- **Monitor analytics** after 1 hour for meaningful data
- **Use optimization agent** after 100+ emails sent

---

## 🆘 Support

For issues:
1. Check this guide
2. Review console logs in both terminals
3. Check MongoDB connection
4. Verify OpenAI API key and credits
5. Review error messages in browser console (F12)

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)

---

**Good luck with your AI Email Campaign Manager! 🎉**
