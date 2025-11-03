# 🚀 Quick Deployment Steps

## Step 1: Push to GitHub

```powershell
cd c:\Users\heman\OneDrive\Desktop\TodoList
git init
git add .
git commit -m "Initial commit - Ready for Render deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/todolist-app.git
git push -u origin main
```

## Step 2: Deploy Auth Server (Port 3000)

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Configure:
   - **Name:** todolist-auth-server
   - **Root Directory:** Backend
   - **Build Command:** npm install
   - **Start Command:** node server.js
   - **Add Environment Variables:**
     - `NODE_ENV` = production
     - `SECRET_KEY` = (generate random string)
     - `EMAIL_USER` = todolist725@gmail.com
     - `EMAIL_PASS` = adap cjfs ohdu suct

5. Click "Create Web Service"

Your auth server URL: `https://todolist-auth-server.onrender.com`

## Step 3: Deploy Tasks Server (Port 3001)

1. Click "New +" → "Web Service"
2. Select same GitHub repo
3. Configure:
   - **Name:** todolist-tasks-server
   - **Root Directory:** Backend
   - **Build Command:** npm install
   - **Start Command:** node json-server-simple.js
   - **Add Environment Variables:**
     - `NODE_ENV` = production

4. Click "Create Web Service"

Your tasks server URL: `https://todolist-tasks-server.onrender.com`

## Step 4: Update Frontend URLs

Replace all localhost URLs in your frontend with:

### Auth URLs:
- Replace: `http://localhost:3000` 
- With: `https://todolist-auth-server.onrender.com`

### Tasks URLs:
- Replace: `http://localhost:3001`
- With: `https://todolist-tasks-server.onrender.com`

## Files to Update:

1. `FORENTEND/USERFORM/login.js` - Line with `/login` endpoint
2. `FORENTEND/USERFORM/register.js` - Line with `/users` endpoint
3. Any file calling tasks API (`/api/tasks`)

## Step 5: Test

1. Visit your auth server: `https://todolist-auth-server.onrender.com`
2. Visit your tasks server: `https://todolist-tasks-server.onrender.com/health`
3. Test registration and login from your frontend
4. Test creating/updating tasks

## ⚠️ Important Notes:

- First request may take 30-60 seconds (cold start)
- Free tier: Services sleep after 15 min inactivity
- Database persists across deploys
- Both servers have CORS enabled

## Generate Secret Key:

Run this in PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your `SECRET_KEY` in Render.

## Need Help?

See full guide: `RENDER_DEPLOYMENT_GUIDE.md`
