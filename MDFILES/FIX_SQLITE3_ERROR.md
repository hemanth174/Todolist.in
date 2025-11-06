# 🔧 Fix: SQLite3 Build Error on Render

## Problem
```
Error: invalid ELF header
code: 'ERR_DLOPEN_FAILED'
```

This happens because SQLite3 has native binaries compiled for Windows, but Render uses Linux.

---

## ✅ Solution

### Option 1: Update Render Build Command (Recommended)

**In your Render Dashboard:**

1. Go to your `todolist-auth-server` service
2. Click **"Settings"** (or **"Environment"** tab)
3. Find **"Build Command"**
4. Change from:
   ```
   npm install
   ```
   To:
   ```
   npm install && npm rebuild sqlite3 --build-from-source
   ```

5. Click **"Save Changes"**
6. Render will automatically redeploy

**This rebuilds SQLite3 native bindings on Render's Linux servers.**

---

### Option 2: Use Updated package.json (Already Done)

I've updated `Backend/package.json` with a `postinstall` script that automatically rebuilds sqlite3 after installation.

**Just push the changes:**
```powershell
git add Backend/package.json
git commit -m "Fix sqlite3 build for Render deployment"
git push origin main
```

Render will detect the changes and automatically rebuild.

---

## 🚀 Quick Fix Steps

### Step 1: Push Updated package.json
```powershell
cd c:\Users\heman\OneDrive\Desktop\TodoList
git add Backend/package.json
git commit -m "Add postinstall script to rebuild sqlite3"
git push origin main
```

### Step 2: Update Render Build Command

**Go to Render Dashboard:**
1. Select `todolist-auth-server`
2. Settings → Build Command
3. Update to: `npm install && npm rebuild sqlite3 --build-from-source`
4. Save Changes

### Step 3: Manual Deploy (Optional)

If auto-deploy doesn't trigger:
1. Go to service dashboard
2. Click **"Manual Deploy"**
3. Select **"Deploy latest commit"**

---

## ✅ Verify Fix

After deployment completes:

1. **Check Logs:**
   - Should see: `Database and users table initialized successfully`
   - Should see: `🚀 Server Running at http://...`

2. **Test the Server:**
   ```
   https://todolist-auth-server.onrender.com
   ```
   Should respond (not error)

3. **Test Registration:**
   Use your frontend or Postman to register a user

---

## 🔍 Alternative Solution: Use better-sqlite3

If the issue persists, consider switching to `better-sqlite3` (doesn't have this issue):

**In `Backend/package.json`:**
```json
{
  "dependencies": {
    "better-sqlite3": "^9.2.0"
  }
}
```

**In `Backend/server.js`:**
```javascript
// Replace
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

// With
const Database = require('better-sqlite3');
const db = new Database('goodreads.db');
```

But the current fix should work! Try the postinstall script first.

---

## 📝 What Changed in package.json

```json
{
  "scripts": {
    "postinstall": "npm rebuild sqlite3 --build-from-source",
    "build": "npm rebuild sqlite3 --build-from-source"
  },
  "devDependencies": {
    "node-gyp": "^10.0.0"
  }
}
```

**postinstall** runs automatically after `npm install` completes.

---

## 🎯 Expected Result

After fix:
```
==> Build successful 🎉
==> Deploying...
==> Running 'node server.js'
Database and users table initialized successfully
🚀 Server Running at http://0.0.0.0:10000/
```

---

## ⚠️ If Still Failing

Try this build command instead:
```bash
npm ci && npm rebuild sqlite3 --build-from-source
```

Or add a `render-build.sh` script:
```bash
#!/bin/bash
npm install
npm rebuild sqlite3 --build-from-source
```

Then set Build Command to: `./render-build.sh`

---

**Push the changes now and your deployment should work! 🚀**
