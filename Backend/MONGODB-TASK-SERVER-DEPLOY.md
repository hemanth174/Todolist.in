# 🚀 Deploy Task Server to Render with MongoDB Atlas

## 📋 Prerequisites
- ✅ GitHub repository with your code
- ✅ MongoDB Atlas free account
- ✅ Render.com account

---

## Step 1: Create Free MongoDB Atlas Database

### 1.1 Sign Up for MongoDB Atlas
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with **Google** or **GitHub** (easiest)
3. Choose **FREE M0 Cluster** (512MB storage)

### 1.2 Create Database Cluster
1. **Cloud Provider**: AWS
2. **Region**: Choose closest to you:
   - India: `ap-south-1` (Mumbai)
   - US: `us-east-1` (Virginia)
   - Europe: `eu-west-1` (Ireland)
3. **Cluster Name**: `TodoCluster` (or any name)
4. Click **"Create Deployment"**

### 1.3 Create Database User
1. **Username**: `todoapp`
2. **Password**: Click "Autogenerate Secure Password" and **SAVE IT!**
   ```
   Example: kX9mP2nQ4wR6sT8u
   ```
3. Click **"Create Database User"**

### 1.4 Allow Network Access
1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, use specific IPs only
4. Click **"Confirm"**

### 1.5 Get Connection String
1. Click **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Drivers"**
4. **Driver**: Node.js
5. **Version**: 4.1 or later
6. **Copy the connection string**:
   ```
   mongodb+srv://todoapp:<password>@todocluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **Replace `<password>`** with your actual password:
   ```
   mongodb+srv://todoapp:kX9mP2nQ4wR6sT8u@todocluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. **SAVE THIS CONNECTION STRING!** You'll need it for Render

---

## Step 2: Deploy to Render

### 2.1 Create New Web Service
1. Go to: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your **GitHub repository**: `hemanth174/Todolist.in`

### 2.2 Configure Service
**Basic Info:**
- **Name**: `todolist-task-server`
- **Region**: Same as MongoDB region (e.g., Oregon for us-west)
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Runtime**: `Node`
- **Build Command**: `cd Backend && npm install`
- **Start Command**: `cd Backend && node task-server.js`

**Instance Type:**
- **Free** ($0/month)

### 2.3 Add Environment Variables
Click **"Add Environment Variable"** and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://todoapp:YOUR_PASSWORD@todocluster.xxxxx.mongodb.net/todolist?retryWrites=true&w=majority` |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |

⚠️ **IMPORTANT**: Replace `YOUR_PASSWORD` with your actual MongoDB password!

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. You'll get a URL like: `https://todolist-task-server.onrender.com`

---

## Step 3: Test Your Deployment

### 3.1 Health Check
Open in browser:
```
https://todolist-task-server.onrender.com/health
```

Should return:
```json
{
  "success": true,
  "message": "TodoList MongoDB Task Server is running!",
  "timestamp": "2025-11-05T...",
  "database": "connected"
}
```

### 3.2 Test Task API
Use Postman or your frontend to test:

**Create Task:**
```http
POST https://todolist-task-server.onrender.com/api/tasks
Content-Type: application/json

{
  "title": "Test Task",
  "description": "Testing MongoDB task server",
  "priority": "high",
  "status": "todo",
  "userId": "123"
}
```

**Get All Tasks:**
```http
GET https://todolist-task-server.onrender.com/api/tasks?userId=123
```

---

## Step 4: Update Frontend to Use Task Server

Update your frontend API calls to point to:
```javascript
const TASK_API_URL = 'https://todolist-task-server.onrender.com/api';
```

Example API calls:
```javascript
// Get all tasks for a user
fetch(`${TASK_API_URL}/tasks?userId=${userId}`)

// Create new task
fetch(`${TASK_API_URL}/tasks`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Task',
    description: 'Task description',
    priority: 'medium',
    userId: userId
  })
})

// Update task
fetch(`${TASK_API_URL}/tasks/${taskId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'completed'
  })
})

// Delete task
fetch(`${TASK_API_URL}/tasks/${taskId}`, {
  method: 'DELETE'
})
```

---

## 📊 API Endpoints

### Tasks
- `GET /api/tasks?userId=xxx` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Projects
- `GET /api/projects?userId=xxx` - Get all projects
- `POST /api/projects` - Create project

### Categories
- `GET /api/categories?userId=xxx` - Get all categories
- `POST /api/categories` - Create category

### Statistics
- `GET /api/stats/dashboard?userId=xxx` - Get dashboard stats

---

## 🎯 Important Notes

### Multi-User Support
All endpoints now require `userId` parameter to separate data by user:
```javascript
// When creating/fetching tasks, always pass userId
{
  "title": "My Task",
  "userId": "user123" // From your auth system
}
```

### Free Tier Limits

**MongoDB Atlas (Free M0):**
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ No credit card required
- ✅ Forever free

**Render.com (Free):**
- ✅ 750 hours/month (enough for 1 server 24/7)
- ⚠️ Sleeps after 15 minutes of inactivity
- ⚠️ Cold start: 15-30 seconds to wake up
- ✅ Auto-deploys on GitHub push

### Render Free Tier with 2 Servers
You can run 2 servers on free tier, but:
- They share the 750 hours/month
- ~375 hours each if both run equally
- Both will sleep after inactivity
- Use "keep-alive" service if needed

---

## 🐛 Troubleshooting

### MongoDB Connection Errors
1. Check connection string has correct password
2. Verify IP whitelist includes 0.0.0.0/0
3. Check Render logs: https://dashboard.render.com/web/todolist-task-server/logs

### Server Not Responding
1. Wait 30 seconds (cold start from sleep)
2. Check Render deployment status
3. View logs for errors

### CORS Errors
Already configured in `task-server.js` with:
```javascript
app.use(cors()); // Allows all origins
```

---

## 🎉 You're Done!

Your MongoDB task server is now deployed and ready to use! 🚀

**Your Deployment URLs:**
- Auth Server: `https://todolist-auth-server.onrender.com`
- Task Server: `https://todolist-task-server.onrender.com` (you'll get this after deployment)
- Frontend: `https://todoist777.netlify.app`
