# 🚀 MongoDB Task Server Deployment Guide

## ✅ Your MongoDB Details

**Connection String:**
```
mongodb+srv://todolist725_db_user:n2DSxgYBB9YuKjjC@todocluster.diflxfz.mongodb.net/?appName=TodoCluster
```

**Database Name:** `todolist`  
**Username:** `todolist725_db_user`  
**Password:** `n2DSxgYBB9YuKjjC`  
**Cluster:** `TodoCluster`

---

## 📋 What You Have

### Task Server Features:
✅ **MongoDB-powered** (cloud database)  
✅ **Multi-user support** (filter by userId)  
✅ **CRUD operations** for tasks, projects, categories  
✅ **Advanced filters** (status, priority, search)  
✅ **Statistics dashboard** (completion rates, overdue tasks)  
✅ **Auto-timestamps** (createdAt, updatedAt)

### API Endpoints:
- `GET /api/tasks` - Get all tasks (filter by userId, status, priority)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `GET /api/stats/dashboard` - Get statistics
- `GET /health` - Health check

---

## 🧪 Step 1: Test Locally

### 1. Start the server:
```bash
cd Backend
node task-server.js
```

### 2. Test with curl/browser:
```bash
# Health check
curl http://localhost:3001/health

# Create a task
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Testing MongoDB",
    "priority": "high",
    "userId": "1"
  }'

# Get all tasks
curl http://localhost:3001/api/tasks?userId=1
```

---

## 🌐 Step 2: Deploy to Render

### A. Create New Web Service

1. **Go to Render Dashboard**: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. **Connect your GitHub repository**: `hemanth174/Todolist.in`
4. **Configure:**
   - **Name**: `todolist-task-server`
   - **Region**: `Singapore` (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `Backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node task-server.js`
   - **Instance Type**: `Free`

### B. Add Environment Variable

Click **"Environment"** tab and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://todolist725_db_user:n2DSxgYBB9YuKjjC@todocluster.diflxfz.mongodb.net/todolist?retryWrites=true&w=majority` |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |

### C. Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. **Your Task Server URL**: `https://todolist-task-server.onrender.com`

---

## 📊 Step 3: Test Production API

Once deployed, test your endpoints:

```bash
# Health check
https://todolist-task-server.onrender.com/health

# Get tasks (replace userId with actual user ID from auth server)
https://todolist-task-server.onrender.com/api/tasks?userId=1

# Create task (use Postman or curl)
POST https://todolist-task-server.onrender.com/api/tasks
{
  "title": "My First Task",
  "description": "Testing production MongoDB",
  "priority": "high",
  "status": "todo",
  "userId": "1"
}
```

---

## 🔗 Step 4: Update Frontend API URL

Update your frontend to use the production task server:

**In `FORENTEND/js/task-api.js` (or wherever you call task APIs):**

```javascript
// Production Task Server
const TASK_API_URL = 'https://todolist-task-server.onrender.com/api';

// Get tasks for logged-in user
async function getTasks(userId) {
    const response = await fetch(`${TASK_API_URL}/tasks?userId=${userId}`);
    const data = await response.json();
    return data.data;
}

// Create task
async function createTask(taskData) {
    const response = await fetch(`${TASK_API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });
    const data = await response.json();
    return data.data;
}
```

---

## 🎯 Important Notes

### Multi-User Support
**Always pass `userId`** in requests:
```javascript
// When creating a task
const user = JSON.parse(localStorage.getItem('loggedInUser'));
const taskData = {
    title: "My Task",
    description: "Task details",
    userId: user.id  // ← CRITICAL!
};

// When fetching tasks
const tasks = await fetch(`${API_URL}/tasks?userId=${user.id}`);
```

### Free Tier Limitations

**Render Free Tier:**
- ⚠️ Server sleeps after 15 minutes of inactivity
- ⚠️ First request after sleep = 15-30 second delay (cold start)
- ⚠️ 750 hours/month total (enough for 1 server 24/7)
- ✅ You now have 2 servers sharing 750 hours

**MongoDB Atlas Free Tier:**
- ✅ 512MB storage (enough for thousands of tasks)
- ✅ Shared cluster (may be slower)
- ✅ No credit card required
- ✅ Never expires

### Security Best Practices

**DO:**
- ✅ Always filter by userId to prevent users seeing others' tasks
- ✅ Keep MongoDB password in environment variables (not in code)
- ✅ Use HTTPS in production

**DON'T:**
- ❌ Commit MongoDB URI to GitHub (use env vars)
- ❌ Allow access without userId filtering
- ❌ Use HTTP (always HTTPS)

---

## 🚨 Troubleshooting

### "Connection timeout" error
- **Fix**: Add `0.0.0.0/0` to MongoDB Atlas Network Access (allows all IPs)
- **Where**: MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere

### "Authentication failed" error
- **Fix**: Check username/password in connection string
- **Where**: MongoDB Atlas → Database Access → Edit user → Reset password

### "Server not responding" error
- **Fix**: Wait 30 seconds for cold start on Render free tier
- **Where**: Check Render logs: https://dashboard.render.com/web/todolist-task-server/logs

### "CORS error" in frontend
- **Fix**: Task server already has `cors()` enabled - check API URL

---

## ✅ Deployment Checklist

Before deploying:
- [x] MongoDB connection string ready
- [x] Mongoose installed (`npm install mongoose`)
- [x] task-server.js uses MongoDB
- [ ] Test locally (run `node task-server.js`)
- [ ] Create Render web service
- [ ] Add MONGODB_URI environment variable
- [ ] Test production health endpoint
- [ ] Update frontend API URLs
- [ ] Test create/read tasks in production

---

## 📞 Need Help?

**MongoDB Atlas Support:**
- Dashboard: https://cloud.mongodb.com
- Docs: https://docs.mongodb.com/manual/

**Render Support:**
- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs

**Check Logs:**
- MongoDB: Atlas → Database → Browse Collections
- Render: Dashboard → Service → Logs tab

---

## 🎉 Summary

You now have:
1. ✅ **Auth Server** (Render) - SQLite database
2. ✅ **Task Server** (Render) - MongoDB Atlas database
3. ✅ **Frontend** (Netlify) - Static hosting

**Architecture:**
```
Frontend (Netlify)
    ↓
Auth Server (Render) ← SQLite (users, auth)
    ↓
Task Server (Render) ← MongoDB Atlas (tasks, projects)
```

**Next Step:** Deploy task server to Render and test! 🚀
