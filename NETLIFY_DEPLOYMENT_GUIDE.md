# 🚀 Deploying TodoList to Netlify (Frontend) + Render (Backend)

## 📋 Overview

This guide shows you how to deploy your TodoList app using:
- **Netlify** → Frontend (HTML/CSS/JavaScript)
- **Render** → Backend (Auth Server + Tasks Server)

This is the **recommended production setup**!

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         NETLIFY (Frontend)              │
│   https://your-app.netlify.app          │
│                                         │
│   • LandingPage.html                    │
│   • RegisterPage.html                   │
│   • Home.html / WorkSpace.html          │
│   • All CSS & JavaScript files          │
└─────────────────────────────────────────┘
              ↓
    API Calls (HTTPS)
              ↓
┌─────────────────────────────────────────┐
│       RENDER (Backend Servers)          │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Auth Server (Port 3000)          │  │
│  │  /users, /login, /send-otp       │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Tasks Server (Port 3001)         │  │
│  │  /api/tasks, /api/stats          │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## ✅ Step 1: Deploy Backend to Render (Do This First!)

You already have your code on GitHub. Now deploy the backend:

### Deploy Auth Server:
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo: `hemanth174/Todolist.in`
4. Configure:
   - **Name:** `todolist-auth-server`
   - **Root Directory:** `Backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment Variables:**
     ```
     NODE_ENV=production
     SECRET_KEY=(generate random: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
     EMAIL_USER=todolist725@gmail.com
     EMAIL_PASS=adap cjfs ohdu suct
     ```
5. Click "Create Web Service"

### Deploy Tasks Server:
1. Click "New +" → "Web Service" (again)
2. Select same repo: `hemanth174/Todolist.in`
3. Configure:
   - **Name:** `todolist-tasks-server`
   - **Root Directory:** `Backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node json-server-simple.js`
   - **Environment Variables:**
     ```
     NODE_ENV=production
     ```
4. Click "Create Web Service"

**Your Backend URLs will be:**
- Auth: `https://todolist-auth-server.onrender.com`
- Tasks: `https://todolist-tasks-server.onrender.com`

---

## 🎨 Step 2: Prepare Frontend for Netlify

### Update API URLs in Frontend:

Before deploying to Netlify, update all API calls to use your Render backend URLs.

**Files to update:**

1. `FORENTEND/USERFORM/login.js`
2. `FORENTEND/USERFORM/register.js`
3. Any files calling the tasks API

**Replace:**
```javascript
// OLD
"http://localhost:3000/login"
"http://localhost:3001/api/tasks"

// NEW
"https://todolist-auth-server.onrender.com/login"
"https://todolist-tasks-server.onrender.com/api/tasks"
```

---

## 🚀 Step 3: Deploy Frontend to Netlify

### Method 1: Drag & Drop (Easiest)

1. **Go to Netlify:** https://app.netlify.com
2. **Sign up/Login** (can use GitHub)
3. **Drag and drop** your `FORENTEND` folder directly onto the Netlify dashboard
4. **Done!** Your site is live instantly

**Your frontend URL:** `https://random-name.netlify.app`

### Method 2: Connect to GitHub (Recommended for Auto-Deploy)

1. **Go to Netlify:** https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. **Connect GitHub** and select `hemanth174/Todolist.in`
4. **Configure build settings:**
   - **Base directory:** `FORENTEND`
   - **Build command:** (leave empty)
   - **Publish directory:** `FORENTEND`
5. Click **"Deploy site"**

**Benefits:**
- Auto-deploys when you push to GitHub
- Free HTTPS
- Custom domain support
- Form handling
- Serverless functions (if needed)

---

## 🔧 Step 4: Configure Netlify (Optional but Recommended)

### Create `netlify.toml` in your project root:

This file configures Netlify settings.

---

## 🎯 Step 5: Update Frontend Code

After deployment, update your code to use the production URLs:

### Create a config file for easy management:

**Create:** `FORENTEND/js/config.js`

```javascript
// API Configuration
const API_CONFIG = {
  AUTH_URL: 'https://todolist-auth-server.onrender.com',
  TASKS_URL: 'https://todolist-tasks-server.onrender.com'
};

// For local development, uncomment:
// const API_CONFIG = {
//   AUTH_URL: 'http://localhost:3000',
//   TASKS_URL: 'http://localhost:3001'
// };
```

Then in your files, use:
```javascript
// login.js
fetch(`${API_CONFIG.AUTH_URL}/login`, {...})

// register.js
fetch(`${API_CONFIG.AUTH_URL}/users`, {...})

// task-api.js
fetch(`${API_CONFIG.TASKS_URL}/api/tasks`, {...})
```

---

## ✅ Deployment Checklist

### Backend (Render):
- [ ] Auth server deployed and live
- [ ] Tasks server deployed and live
- [ ] Environment variables configured
- [ ] Both servers responding to requests
- [ ] Database files created (SQLite, JSON)

### Frontend (Netlify):
- [ ] All API URLs updated to Render endpoints
- [ ] Tested locally with production API URLs
- [ ] Frontend deployed to Netlify
- [ ] Site is accessible
- [ ] Registration works
- [ ] Login works
- [ ] Tasks CRUD works
- [ ] No CORS errors

---

## 🎨 Customize Your Netlify Site

### Change Site Name:
1. Go to **Site settings** in Netlify
2. Click **"Change site name"**
3. Enter: `your-todolist-app`
4. Your URL becomes: `https://your-todolist-app.netlify.app`

### Add Custom Domain:
1. Go to **Domain settings**
2. Click **"Add custom domain"**
3. Follow instructions to point your domain to Netlify

---

## 🔒 Environment Variables in Frontend (Optional)

If you want to use environment variables in frontend:

### Create `.env` file (for local development):
```
VITE_AUTH_URL=http://localhost:3000
VITE_TASKS_URL=http://localhost:3001
```

### In Netlify Dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add:
   ```
   AUTH_URL=https://todolist-auth-server.onrender.com
   TASKS_URL=https://todolist-tasks-server.onrender.com
   ```

Note: Static sites can't use environment variables the same way. Better to use the config.js approach above.

---

## 🧪 Testing Your Deployment

### Test Backend (Render):
```bash
# Auth server
curl https://todolist-auth-server.onrender.com

# Tasks server
curl https://todolist-tasks-server.onrender.com/health
```

### Test Frontend (Netlify):
1. Visit your Netlify URL
2. Go to registration page
3. Register a new user
4. Check if welcome email arrives
5. Login with credentials
6. Create a task
7. Update/delete tasks

---

## 📊 Cost Breakdown

### Netlify (Frontend):
- **Free Tier:**
  - 100 GB bandwidth/month
  - 300 build minutes/month
  - Automatic HTTPS
  - Custom domains
  - Form submissions
  - **Perfect for your app!**

### Render (Backend):
- **Free Tier:**
  - 750 hours/month per service
  - Services sleep after 15 min inactivity
  - Persistent disk storage
  - Automatic HTTPS

**Total Cost: $0/month** 🎉

---

## 🚀 Advanced: Netlify Functions (Optional)

If you want to move some backend logic to Netlify:

### Create `netlify/functions/hello.js`:
```javascript
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Netlify!" })
  };
};
```

Access at: `https://your-site.netlify.app/.netlify/functions/hello`

**Note:** For your app, keeping backend on Render is simpler!

---

## 📝 Quick Commands

### Deploy Frontend to Netlify CLI (Alternative):

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy from FORENTEND folder
cd FORENTEND
netlify deploy --prod
```

---

## 🔄 Automatic Deployments

### GitHub → Netlify (Automatic):
- Push to GitHub main branch
- Netlify automatically rebuilds and deploys
- Takes ~30 seconds

### GitHub → Render (Automatic):
- Push to GitHub main branch
- Render automatically rebuilds and deploys
- Takes ~3-5 minutes

**Set it up once, deploy by just pushing to GitHub!** 🎯

---

## 💡 Pro Tips

1. **Use Netlify for Frontend:** 
   - Faster than serving from Node.js
   - Better CDN coverage
   - Free SSL/HTTPS

2. **Use Render for Backend:**
   - Better for databases
   - Persistent storage
   - Background processes

3. **Keep Backend URLs in Config:**
   - Easy to switch between local/production
   - One place to update

4. **Test Locally First:**
   - Always test with production URLs locally
   - Catch CORS issues early

5. **Monitor Both:**
   - Netlify: Check analytics
   - Render: Check logs

---

## 🆘 Common Issues

### CORS Errors:
- Ensure backend has `app.use(cors())` enabled
- Use HTTPS URLs, not HTTP
- Check browser console for specific errors

### Backend Cold Starts:
- Free Render services sleep after 15 min
- First request takes 30-60 seconds
- Use UptimeRobot to keep awake

### Frontend Not Updating:
- Netlify caches aggressively
- Hard refresh: Ctrl+Shift+R
- Clear deploy cache in Netlify settings

---

## ✅ Final Checklist

- [ ] Backend servers deployed to Render
- [ ] Backend URLs noted down
- [ ] Frontend code updated with backend URLs
- [ ] Config.js created for API endpoints
- [ ] Frontend deployed to Netlify
- [ ] Site name customized (optional)
- [ ] Registration tested end-to-end
- [ ] Login tested
- [ ] Task creation/editing tested
- [ ] Email notifications working
- [ ] No console errors in browser
- [ ] Mobile responsive (test on phone)

---

## 🎉 Success!

Your TodoList app is now live!

**URLs:**
- Frontend: `https://your-app.netlify.app`
- Auth API: `https://todolist-auth-server.onrender.com`
- Tasks API: `https://todolist-tasks-server.onrender.com`

---

## 📞 Support

- **Netlify Docs:** https://docs.netlify.com
- **Netlify Community:** https://answers.netlify.com
- **Render Docs:** https://render.com/docs

---

**Enjoy your fully deployed TodoList app! 🚀**
