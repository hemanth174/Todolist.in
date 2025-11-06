# 🚀 Deploying TodoList App to Render.com

This guide will help you deploy **two separate servers** to Render.com:
1. **Authentication Server** - User login/registration (Port 3000)
2. **Tasks API Server** - Todo tasks management (Port 3001)

---

## 📋 Prerequisites

- [ ] GitHub account (to push your code)
- [ ] Render.com account (free tier available at https://render.com)
- [ ] Your code pushed to a GitHub repository

---

## 🔧 Step 1: Prepare Your Code for Deployment

### A. Update Package.json Files

Both servers need to be configured properly. The files have been created for you.

### B. Environment Variables Setup

Create a `.env` file for sensitive data (we'll configure this on Render):
- `SECRET_KEY` - JWT secret key
- `EMAIL_USER` - Gmail address for sending emails
- `EMAIL_PASS` - Gmail app password
- `PORT` - Will be provided by Render

---

## 📦 Step 2: Push Code to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   cd c:\Users\heman\OneDrive\Desktop\TodoList
   git init
   git add .
   git commit -m "Initial commit - TodoList app ready for deployment"
   ```

2. **Create a GitHub repository:**
   - Go to https://github.com/new
   - Name it: `todolist-app`
   - Don't initialize with README (you already have files)
   - Click "Create repository"

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/todolist-app.git
   git branch -M main
   git push -u origin main
   ```

---

## 🌐 Step 3: Deploy Authentication Server to Render

### 3.1 Create New Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your `todolist-app` repository

### 3.2 Configure Authentication Server

Fill in the following settings:

| Field | Value |
|-------|-------|
| **Name** | `todolist-auth-server` |
| **Region** | Choose closest to you (e.g., Oregon, Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | `Backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | `Free` |

### 3.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `SECRET_KEY` | `your-super-secret-jwt-key-change-this-to-something-random` |
| `EMAIL_USER` | `todolist725@gmail.com` |
| `EMAIL_PASS` | `adap cjfs ohdu suct` |
| `PORT` | Leave empty (Render auto-assigns) |

**⚠️ Important:** Generate a strong SECRET_KEY. You can use this command:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3.4 Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Your auth server will be live at: `https://todolist-auth-server.onrender.com`

---

## 🌐 Step 4: Deploy Tasks Server to Render

### 4.1 Create Second Web Service

1. Click **"New +"** → **"Web Service"** again
2. Select your `todolist-app` repository

### 4.2 Configure Tasks Server

| Field | Value |
|-------|-------|
| **Name** | `todolist-tasks-server` |
| **Region** | Same as auth server |
| **Branch** | `main` |
| **Root Directory** | `Backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node json-server-simple.js` |
| **Instance Type** | `Free` |

### 4.3 Add Environment Variables

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | Leave empty (Render auto-assigns) |

### 4.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment
3. Your tasks server will be live at: `https://todolist-tasks-server.onrender.com`

---

## 📝 Step 5: Update Frontend to Use Deployed Servers

After both servers are deployed, update your frontend files:

### Update `FORENTEND/USERFORM/login.js`:

Replace:
```javascript
const response = await fetch("http://localhost:3000/login", {
```

With:
```javascript
const response = await fetch("https://todolist-auth-server.onrender.com/login", {
```

### Update `FORENTEND/USERFORM/register.js`:

Replace:
```javascript
const response = await fetch("http://localhost:3000/users", {
```

With:
```javascript
const response = await fetch("https://todolist-auth-server.onrender.com/users", {
```

### Update `FORENTEND/js/task-api.js` (or wherever you call tasks API):

Replace:
```javascript
const response = await fetch("http://localhost:3001/api/tasks", {
```

With:
```javascript
const response = await fetch("https://todolist-tasks-server.onrender.com/api/tasks", {
```

---

## 🎯 Step 6: Test Your Deployment

### Test Authentication Server:

1. **Health Check:**
   ```
   https://todolist-auth-server.onrender.com/
   ```

2. **Register New User:**
   Use Postman or your frontend to register

3. **Login:**
   Test login with registered credentials

### Test Tasks Server:

1. **Health Check:**
   ```
   https://todolist-tasks-server.onrender.com/health
   ```

2. **Get All Tasks:**
   ```
   https://todolist-tasks-server.onrender.com/api/tasks
   ```

3. **Create Task:**
   Use your frontend or Postman to create a task

---

## ⚠️ Important Notes

### Free Tier Limitations:

1. **Cold Starts:** Free services spin down after 15 minutes of inactivity
   - First request after inactivity takes ~30-60 seconds
   - Subsequent requests are fast

2. **Storage:** 
   - SQLite database (`goodreads.db`) persists on disk
   - JSON file (`db.json`) persists on disk
   - Data is preserved across deploys

3. **Monthly Hours:** 
   - 750 hours/month free (enough for 1 service running 24/7)
   - With 2 services, you get 375 hours each

### Database Persistence:

Render's free tier includes persistent disk storage:
- Your SQLite database will persist
- Your db.json file will persist
- Data survives restarts and deploys

### CORS Configuration:

Both servers have CORS enabled, so they'll work with any frontend domain.

---

## 🔧 Troubleshooting

### Problem: Server not starting

**Solution:** Check Render logs
- Go to your service dashboard
- Click "Logs" tab
- Look for error messages

### Problem: Database not persisting

**Solution:** Ensure you're using Render's disk
- The current setup should work automatically
- Data is stored in the service's working directory

### Problem: Environment variables not working

**Solution:** 
1. Go to service settings
2. Environment tab
3. Verify all variables are set correctly
4. Click "Save Changes"
5. Service will auto-redeploy

### Problem: CORS errors

**Solution:** Both servers have CORS enabled. If you still get errors:
1. Verify the fetch URL is correct (https, not http)
2. Check browser console for specific CORS error
3. Ensure credentials are sent properly

---

## 🚀 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Auth server deployed to Render
- [ ] Tasks server deployed to Render
- [ ] Environment variables configured
- [ ] Frontend updated with production URLs
- [ ] Registration tested
- [ ] Login tested
- [ ] Task creation tested
- [ ] Email notifications tested

---

## 📊 Your Deployed URLs

After deployment, you'll have:

1. **Auth Server:** `https://todolist-auth-server.onrender.com`
   - POST `/users` - Register
   - POST `/login` - Login
   - GET `/users` - Get all users
   - POST `/send-otp` - Send OTP
   - POST `/send-welcome-email` - Send welcome email

2. **Tasks Server:** `https://todolist-tasks-server.onrender.com`
   - GET `/api/tasks` - Get all tasks
   - POST `/api/tasks` - Create task
   - PUT `/api/tasks/:id` - Update task
   - DELETE `/api/tasks/:id` - Delete task
   - GET `/api/stats/dashboard` - Get statistics

---

## 🎉 Next Steps

1. **Custom Domain:** You can add a custom domain in Render settings
2. **HTTPS:** Automatically provided by Render
3. **Monitoring:** Use Render dashboard to monitor server health
4. **Logs:** Access real-time logs for debugging
5. **Scaling:** Upgrade to paid tier for better performance

---

## 💡 Tips

1. **Keep services warm:** Use a service like UptimeRobot to ping your servers every 5 minutes
2. **Monitor logs:** Regularly check logs for errors
3. **Backup data:** Export your database periodically
4. **Use environment variables:** Never hardcode secrets in your code

---

## 📞 Need Help?

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Your service logs: Check the "Logs" tab in Render dashboard

---

**Good luck with your deployment! 🚀**
