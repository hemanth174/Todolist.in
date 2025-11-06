# ✅ Render.com Deployment Checklist

Use this checklist to deploy your TodoList app to Render.com step by step.

---

## 📋 Pre-Deployment Preparation

- [ ] **Install Git** (if not already installed)
  ```powershell
  winget install Git.Git
  ```

- [ ] **Create GitHub account** at https://github.com

- [ ] **Create Render account** at https://render.com

- [ ] **Test servers locally**
  ```powershell
  # Terminal 1 - Auth Server
  cd Backend
  npm install
  node server.js
  
  # Terminal 2 - Tasks Server  
  cd Backend
  node json-server-simple.js
  ```
  - [ ] Auth server running at http://localhost:3000
  - [ ] Tasks server running at http://localhost:3001
  - [ ] Both servers responding correctly

---

## 🔐 Security Setup

- [ ] **Generate Secret Key**
  ```powershell
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
  Write it down: `_________________________________________________`

- [ ] **Verify Email Credentials**
  - Email: `todolist725@gmail.com`
  - App Password: `adap cjfs ohdu suct`
  - [ ] Test email working locally

---

## 📦 GitHub Setup

- [ ] **Initialize Git Repository**
  ```powershell
  cd c:\Users\heman\OneDrive\Desktop\TodoList
  git init
  ```

- [ ] **Add all files**
  ```powershell
  git add .
  ```

- [ ] **Commit changes**
  ```powershell
  git commit -m "Initial commit - TodoList ready for Render deployment"
  ```

- [ ] **Create GitHub Repository**
  1. Go to https://github.com/new
  2. Repository name: `todolist-app`
  3. Make it **Public**
  4. **Don't** initialize with README
  5. Click "Create repository"
  
  Your repo URL: `https://github.com/_______________/todolist-app`

- [ ] **Connect and Push**
  ```powershell
  git remote add origin https://github.com/YOUR_USERNAME/todolist-app.git
  git branch -M main
  git push -u origin main
  ```

- [ ] **Verify** - Check GitHub that files are uploaded

---

## 🌐 Deploy Auth Server (Login/Registration)

- [ ] **Go to Render Dashboard**
  - Visit: https://dashboard.render.com

- [ ] **Create New Web Service**
  - Click "New +" button
  - Select "Web Service"

- [ ] **Connect Repository**
  - Click "Connect GitHub"
  - Authorize Render
  - Select `todolist-app` repository

- [ ] **Configure Service**
  - **Name:** `todolist-auth-server`
  - **Region:** Oregon (US West) or closest to you
  - **Branch:** `main`
  - **Root Directory:** `Backend`
  - **Runtime:** Node
  - **Build Command:** `npm install`
  - **Start Command:** `node server.js`
  - **Instance Type:** Free

- [ ] **Add Environment Variables**
  Click "Advanced" → "Add Environment Variable"
  
  | Key | Value |
  |-----|-------|
  | `NODE_ENV` | `production` |
  | `SECRET_KEY` | Paste the key you generated above |
  | `EMAIL_USER` | `todolist725@gmail.com` |
  | `EMAIL_PASS` | `adap cjfs ohdu suct` |

- [ ] **Create Web Service**
  - Click "Create Web Service"
  - Wait 3-5 minutes for deployment

- [ ] **Note Your Auth Server URL**
  ```
  https://todolist-auth-server.onrender.com
  ```
  
- [ ] **Test Auth Server**
  - Visit: `https://todolist-auth-server.onrender.com`
  - Should see server response (might take 30-60 sec first time)

---

## 🌐 Deploy Tasks Server (Todo Tasks API)

- [ ] **Create Second Web Service**
  - Click "New +" button again
  - Select "Web Service"
  - Select `todolist-app` repository

- [ ] **Configure Tasks Service**
  - **Name:** `todolist-tasks-server`
  - **Region:** Same as auth server
  - **Branch:** `main`
  - **Root Directory:** `Backend`
  - **Runtime:** Node
  - **Build Command:** `npm install`
  - **Start Command:** `node json-server-simple.js`
  - **Instance Type:** Free

- [ ] **Add Environment Variables**
  
  | Key | Value |
  |-----|-------|
  | `NODE_ENV` | `production` |

- [ ] **Create Web Service**
  - Click "Create Web Service"
  - Wait for deployment

- [ ] **Note Your Tasks Server URL**
  ```
  https://todolist-tasks-server.onrender.com
  ```

- [ ] **Test Tasks Server**
  - Visit: `https://todolist-tasks-server.onrender.com/health`
  - Should return JSON with success message

---

## 🔧 Update Frontend Code

### Update login.js

- [ ] **Open:** `FORENTEND/USERFORM/login.js`

- [ ] **Find and replace:**
  ```javascript
  // OLD:
  const response = await fetch("http://localhost:3000/login", {
  
  // NEW:
  const response = await fetch("https://todolist-auth-server.onrender.com/login", {
  ```

### Update register.js

- [ ] **Open:** `FORENTEND/USERFORM/register.js`

- [ ] **Find and replace:**
  ```javascript
  // OLD:
  const response = await fetch("http://localhost:3000/users", {
  
  // NEW:
  const response = await fetch("https://todolist-auth-server.onrender.com/users", {
  ```

### Update task-api.js (or similar files)

- [ ] **Search for all files with:** `localhost:3001`

- [ ] **Replace with:** `https://todolist-tasks-server.onrender.com`

- [ ] **Common files to check:**
  - `FORENTEND/js/task-api.js`
  - `FORENTEND/HomeTools/WorkSpace.html`
  - Any file making API calls to tasks

---

## 🧪 Testing Deployment

### Test Authentication

- [ ] **Test User Registration**
  1. Open your frontend (locally or deployed)
  2. Go to registration page
  3. Fill in details
  4. Submit form
  5. Should see success message
  6. Check email for welcome message

- [ ] **Test User Login**
  1. Go to login page
  2. Enter registered credentials
  3. Submit
  4. Should receive JWT token
  5. Should be redirected to dashboard

### Test Tasks API

- [ ] **Test Get Tasks**
  - Visit: `https://todolist-tasks-server.onrender.com/api/tasks`
  - Should return JSON with tasks array

- [ ] **Test Create Task**
  - Use your frontend or Postman
  - Create a new task
  - Verify it appears in task list

- [ ] **Test Update Task**
  - Update an existing task
  - Verify changes persist

- [ ] **Test Delete Task**
  - Delete a task
  - Verify it's removed

### Test Email Functionality

- [ ] **Register new user** - Check welcome email arrives

- [ ] **Test OTP** (if used) - Check OTP email

---

## 📊 Monitor Your Deployment

### Check Render Logs

- [ ] **Auth Server Logs**
  1. Go to Render dashboard
  2. Click on `todolist-auth-server`
  3. Click "Logs" tab
  4. Verify no errors

- [ ] **Tasks Server Logs**
  1. Click on `todolist-tasks-server`
  2. Click "Logs" tab
  3. Verify no errors

### Check Database

- [ ] **Verify SQLite database** (auth server)
  - User registrations are saved
  - Data persists after restart

- [ ] **Verify JSON database** (tasks server)
  - Tasks are saved to db.json
  - Data persists after restart

---

## 🚀 Deploy Frontend (Optional)

Choose one platform:

### Option A: GitHub Pages

- [ ] Create `docs` folder
- [ ] Move frontend files to `docs`
- [ ] Enable GitHub Pages in repo settings
- [ ] Access at: `https://YOUR_USERNAME.github.io/todolist-app`

### Option B: Netlify

- [ ] Sign up at https://netlify.com
- [ ] Drag & drop `FORENTEND` folder
- [ ] Get URL: `https://your-site.netlify.app`

### Option C: Vercel

- [ ] Sign up at https://vercel.com
- [ ] Import GitHub repository
- [ ] Deploy frontend
- [ ] Get URL: `https://your-site.vercel.app`

---

## 🎯 Post-Deployment Checklist

- [ ] Both servers are running
- [ ] No errors in logs
- [ ] Registration works end-to-end
- [ ] Login works and returns token
- [ ] Tasks can be created
- [ ] Tasks can be updated
- [ ] Tasks can be deleted
- [ ] Email notifications working
- [ ] Frontend connected to backend
- [ ] HTTPS working (automatic with Render)

---

## 📝 Document Your Deployment

Write down your deployed URLs:

```
Auth Server: https://_________________________________.onrender.com

Tasks Server: https://_________________________________.onrender.com

Frontend: https://____________________________________________

GitHub Repo: https://github.com/_____________________________

Deployed: ___/___/2025

Notes:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🔄 Keep Services Awake (Optional)

Free tier services sleep after 15 min inactivity.

**Option 1: UptimeRobot**
- [ ] Sign up at https://uptimerobot.com
- [ ] Create monitor for auth server
- [ ] Create monitor for tasks server
- [ ] Set to ping every 5 minutes

**Option 2: Cron-job.org**
- [ ] Sign up at https://cron-job.org
- [ ] Create job to ping your servers
- [ ] Set schedule

---

## ⚠️ Troubleshooting

If something doesn't work:

- [ ] Check Render logs for errors
- [ ] Verify environment variables are set correctly
- [ ] Ensure frontend URLs are updated
- [ ] Check browser console for errors
- [ ] Verify CORS is not blocked
- [ ] Wait 60 seconds for cold start

Common issues:
- **500 error:** Check server logs
- **CORS error:** Verify fetch URLs use https://
- **Database error:** Check Render disk storage
- **Email not sending:** Verify EMAIL_USER and EMAIL_PASS

---

## ✅ Final Status

Date completed: _______________

Status:
- [ ] ✅ Everything working perfectly
- [ ] ⚠️ Some issues (describe below)
- [ ] ❌ Not working (get help)

Notes:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**Congratulations! Your TodoList app is now live on Render.com! 🎉**

Share your URLs:
- Auth API: _____________________________________________
- Tasks API: _____________________________________________
- Frontend: _____________________________________________
