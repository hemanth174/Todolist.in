# 🔧 Render.com Deployment - Troubleshooting Guide

Common issues and solutions when deploying to Render.com.

---

## 🚨 Common Deployment Issues

### 1. Build Failed

**Symptoms:**
- Deployment shows "Build failed"
- Red error in Render dashboard

**Solutions:**

✅ **Check package.json exists in Backend folder**
```powershell
# Verify file exists
dir c:\Users\heman\OneDrive\Desktop\TodoList\Backend\package.json
```

✅ **Verify Root Directory is set to "Backend"**
- In Render dashboard → Settings → Root Directory → Should be `Backend`

✅ **Check build logs**
- Render dashboard → Logs tab
- Look for specific error messages

✅ **Verify dependencies in package.json**
```json
{
  "dependencies": {
    "bcrypt": "^6.0.0",
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^6.10.1",
    "sqlite3": "^5.1.7"
  }
}
```

---

### 2. Server Not Starting

**Symptoms:**
- Build succeeds but service doesn't start
- "Service Unavailable" error

**Solutions:**

✅ **Check Start Command**
- Auth server: `node server.js`
- Tasks server: `node json-server-simple.js`

✅ **Verify PORT environment variable**
```javascript
// In server.js
const port = process.env.PORT || 3000;

// In json-server-simple.js  
const PORT = process.env.PORT || 3001;
```

✅ **Check server logs**
```
Render Dashboard → Your Service → Logs
```

✅ **Verify server is listening**
```javascript
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

---

### 3. 502 Bad Gateway

**Symptoms:**
- Service shows as running
- Returns 502 error when accessed

**Solutions:**

✅ **Wait 30-60 seconds**
- Free tier has "cold start" delay
- First request after sleep takes time

✅ **Check if server crashed**
- View logs for errors
- Look for uncaught exceptions

✅ **Verify app is binding to 0.0.0.0**
```javascript
// Correct - binds to all interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
```

✅ **Check if server is using correct PORT**
```javascript
// Must use process.env.PORT
const port = process.env.PORT || 3000;
```

---

### 4. Database Not Persisting

**Symptoms:**
- Data disappears after restart
- Users/tasks not saved

**Solutions:**

✅ **Check database file path**
```javascript
// Ensure relative path
const dbPath = path.join(__dirname, "goodreads.db");
```

✅ **Verify disk writes**
- Render's free tier includes persistent disk
- Data should persist in working directory

✅ **Check write permissions**
```javascript
// Ensure database can be created/written
try {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  console.log("✅ Database opened successfully");
} catch (error) {
  console.error("❌ Database error:", error);
}
```

✅ **Check JSON file writes**
```javascript
// For tasks server
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    console.log("✅ Database written successfully");
    return true;
  } catch (error) {
    console.error("❌ Write error:", error);
    return false;
  }
}
```

---

### 5. CORS Errors

**Symptoms:**
- Frontend can't connect to backend
- Browser console shows CORS error
- "Access-Control-Allow-Origin" error

**Solutions:**

✅ **Verify CORS is enabled**
```javascript
const cors = require('cors');
app.use(cors()); // Enable for all origins
```

✅ **Use HTTPS in frontend**
```javascript
// Wrong - mixing HTTP/HTTPS
fetch("http://todolist-auth-server.onrender.com/login")

// Correct - use HTTPS
fetch("https://todolist-auth-server.onrender.com/login")
```

✅ **Check credentials mode**
```javascript
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  credentials: 'include', // If using cookies
  body: JSON.stringify(data)
})
```

✅ **Configure CORS for specific origin (production)**
```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

---

### 6. Email Not Sending

**Symptoms:**
- Welcome emails not received
- OTP emails not arriving

**Solutions:**

✅ **Verify environment variables**
```
EMAIL_USER = todolist725@gmail.com
EMAIL_PASS = adap cjfs ohdu suct
```

✅ **Check Gmail App Password**
- Not your Gmail password
- Must be an "App Password" from Google
- Generate at: https://myaccount.google.com/apppasswords

✅ **Check Nodemailer configuration**
```javascript
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Add error handling
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email config error:', error);
  } else {
    console.log('✅ Email server ready');
  }
});
```

✅ **Test email function**
```javascript
// Add logs to email function
async function sendWelcomeEmail(email) {
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to: ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error);
        return false;
    }
}
```

---

### 7. JWT Token Issues

**Symptoms:**
- "Invalid token" errors
- "Token expired" messages
- Authentication fails

**Solutions:**

✅ **Verify SECRET_KEY is set**
```javascript
const SECRET_KEY = process.env.SECRET_KEY || 'fallback-key';

// Check if it's set
console.log('SECRET_KEY set:', !!process.env.SECRET_KEY);
```

✅ **Check token format**
```javascript
// Frontend
localStorage.setItem('token', data.token);

// When sending request
headers: {
  'Authorization': 'Bearer ' + localStorage.getItem('token')
}
```

✅ **Verify token middleware**
```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: "Token missing" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
}
```

✅ **Check token expiration**
```javascript
// Token valid for 3 days
jwt.sign(payload, SECRET_KEY, { expiresIn: '3d' })
```

---

### 8. Environment Variables Not Working

**Symptoms:**
- process.env.VARIABLE is undefined
- Using fallback values

**Solutions:**

✅ **Set variables in Render dashboard**
1. Go to service settings
2. Click "Environment" tab
3. Add each variable
4. Click "Save Changes"

✅ **Trigger new deployment**
- Settings → Manual Deploy → "Deploy latest commit"

✅ **Check variable names match exactly**
```javascript
// In code
process.env.SECRET_KEY

// In Render dashboard
Key: SECRET_KEY (exact match, case-sensitive)
```

✅ **Don't use .env files in production**
- Render uses dashboard environment variables
- .env files are for local development only

---

### 9. Slow First Request (Cold Start)

**Symptoms:**
- First request takes 30-60 seconds
- "Gateway Timeout" on first request

**Solutions:**

✅ **This is normal for free tier**
- Services sleep after 15 minutes inactivity
- First request "wakes up" the service
- Subsequent requests are fast

✅ **Keep service awake with UptimeRobot**
```
1. Sign up at https://uptimerobot.com
2. Add monitor for your Render URL
3. Set interval to 5 minutes
4. Service stays awake 24/7
```

✅ **Upgrade to paid tier**
- No cold starts
- Always running
- Starting at $7/month

---

### 10. Frontend Can't Connect to Backend

**Symptoms:**
- Network errors in browser console
- Fetch requests fail
- API calls timeout

**Solutions:**

✅ **Verify URLs are correct**
```javascript
// Check your frontend code
const AUTH_URL = 'https://todolist-auth-server.onrender.com';
const TASKS_URL = 'https://todolist-tasks-server.onrender.com';

// Not localhost!
// Not http:// (must be https://)
```

✅ **Test API directly in browser**
```
https://todolist-auth-server.onrender.com
https://todolist-tasks-server.onrender.com/health
```

✅ **Check browser console for errors**
- Press F12 in browser
- Go to Console tab
- Look for error messages
- Check Network tab for failed requests

✅ **Verify Content-Type header**
```javascript
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
})
```

---

## 🔍 Debugging Steps

### Step 1: Check Service Status

```
Render Dashboard → Your Service
Look for: "Live" (green) or "Failed" (red)
```

### Step 2: Read the Logs

```
Render Dashboard → Your Service → Logs tab
Look for:
- Error messages
- Stack traces
- Console.log outputs
```

### Step 3: Test Locally First

```powershell
# Test auth server locally
cd Backend
node server.js

# Test tasks server locally
node json-server-simple.js

# If it works locally, issue is with Render config
# If it fails locally, fix the code first
```

### Step 4: Compare Local vs Production

| Aspect | Local | Render |
|--------|-------|--------|
| Port | 3000/3001 | process.env.PORT |
| Database | Relative path | Relative path |
| Env Variables | .env file | Render dashboard |
| CORS | All origins | All origins |

### Step 5: Test with Curl/Postman

```powershell
# Test auth server
curl https://todolist-auth-server.onrender.com

# Test tasks server health
curl https://todolist-tasks-server.onrender.com/health

# Test tasks API
curl https://todolist-tasks-server.onrender.com/api/tasks
```

---

## 📞 Getting Help

### Render Documentation
- https://render.com/docs
- https://render.com/docs/web-services

### Render Community
- https://community.render.com
- Search for similar issues
- Ask questions

### Check Service Status
- https://status.render.com
- Verify Render isn't having outages

### Render Support
- Email: support@render.com
- Include service name and error logs

### Your Logs
Always include:
1. Service name
2. Error message
3. Relevant log lines
4. Steps to reproduce

---

## ✅ Verification Checklist

Before asking for help, verify:

- [ ] Service is "Live" in dashboard
- [ ] Build completed successfully
- [ ] Start command is correct
- [ ] Environment variables are set
- [ ] Logs don't show errors
- [ ] Database files are created
- [ ] CORS is enabled
- [ ] Using HTTPS (not HTTP)
- [ ] URLs are correct in frontend
- [ ] Tested API with curl/Postman

---

## 🎯 Quick Fixes

### "Cannot find module"
```bash
# Ensure package.json has the dependency
# Trigger a rebuild in Render dashboard
```

### "ENOENT: no such file"
```javascript
// Use path.join for file paths
const dbPath = path.join(__dirname, "goodreads.db");
```

### "Address already in use"
```javascript
// Use process.env.PORT
const port = process.env.PORT || 3000;
```

### "CORS blocked"
```javascript
// Add CORS middleware
app.use(cors());
```

### "Database locked"
```javascript
// SQLite only supports one writer
// Ensure you're not opening DB multiple times
```

---

## 📊 Monitoring Your App

### Check regularly:
1. **Logs** - Any errors or warnings
2. **Metrics** - CPU and memory usage
3. **Response times** - API performance
4. **Database size** - Storage usage
5. **Email delivery** - Notification success

### Set up alerts:
- UptimeRobot for downtime alerts
- Render dashboard for deployment notifications
- Email for critical errors

---

**Remember:** Most issues are configuration problems, not code problems. Double-check environment variables and service settings first! 🔍
