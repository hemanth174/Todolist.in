# 🔧 Fix Email Connection Timeout on Render

## Problem
Render's **free tier blocks SMTP ports** (587, 465, 25) to prevent spam. This causes email sending to fail with `ETIMEDOUT` error.

## ✅ Solution Implemented

I've updated the code to make email sending **optional** - login/registration will work even if emails fail.

### Changes Made:
1. ✅ Added `SKIP_EMAIL` environment variable check
2. ✅ Email failures won't break login/registration
3. ✅ Proper error handling with try-catch

---

## 🚀 Quick Fix - Add Environment Variable on Render

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Click on your **todolist-auth-server** service

### Step 2: Add Environment Variable
1. Click **"Environment"** in left sidebar
2. Click **"Add Environment Variable"**
3. Add:
   ```
   Key:   SKIP_EMAIL
   Value: true
   ```
4. Click **"Save Changes"**

### Step 3: Redeploy
The service will **auto-redeploy** after saving the environment variable.

---

## 📧 What This Does

- **With `SKIP_EMAIL=true`**: 
  - Login/registration work normally ✅
  - No email sending attempted
  - Console logs: `📧 Email would be sent to: user@gmail.com (skipped on free tier)`

- **Without the variable** (or `SKIP_EMAIL=false`):
  - Tries to send emails
  - If it fails, continues anyway (doesn't break login)

---

## 💡 Alternative Solutions (If You Want Emails)

### Option 1: Use SendGrid (Free Tier - Recommended)
SendGrid has a free tier with 100 emails/day and works on Render:

1. Sign up at https://sendgrid.com
2. Get API key
3. Update `server.js` to use SendGrid:
   ```javascript
   const sgMail = require('@sendgrid/mail');
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   ```

### Option 2: Upgrade Render Plan
- Upgrade to **paid plan** ($7/month) which allows SMTP
- Keep current Gmail SMTP setup

### Option 3: Use Serverless Email Service
- AWS SES (free tier: 62,000 emails/month)
- Mailgun (free tier: 5,000 emails/month)

---

## 🧪 Test After Deployment

After adding `SKIP_EMAIL=true`:

1. **Register a new user** - should work without errors
2. **Login** - should work without email timeout
3. **Check Render logs** - should see:
   ```
   📧 Email would be sent to: user@gmail.com (skipped on free tier)
   ```

---

## ⚠️ Important Notes

- Email feature is **disabled** with `SKIP_EMAIL=true`
- Users will still see the Gmail note on register page (for future use)
- Login/registration functionality remains **100% working**
- When you upgrade or use SendGrid, just remove `SKIP_EMAIL` variable

---

## 🎯 Recommended Next Steps

1. ✅ Add `SKIP_EMAIL=true` on Render (5 minutes)
2. ✅ Test login/registration (working immediately)
3. 🔄 Optional: Set up SendGrid for free emails (30 minutes)
4. 📝 Update register page note to mention "Email notifications coming soon"

---

**Current Status**: 
- Code pushed to GitHub ✅
- Waiting for you to add `SKIP_EMAIL=true` on Render dashboard
- After that, app will work perfectly without email errors!
