# 🏗️ TodoList App - Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         RENDER.COM                               │
│                                                                   │
│  ┌────────────────────────────┐  ┌─────────────────────────────┐│
│  │  AUTH SERVER               │  │  TASKS SERVER               ││
│  │  (Port 3000)               │  │  (Port 3001)                ││
│  │                            │  │                             ││
│  │  📦 server.js              │  │  📦 json-server-simple.js   ││
│  │                            │  │                             ││
│  │  Endpoints:                │  │  Endpoints:                 ││
│  │  • POST /users             │  │  • GET /api/tasks           ││
│  │  • POST /login             │  │  • POST /api/tasks          ││
│  │  • GET /users              │  │  • PUT /api/tasks/:id       ││
│  │  • PUT /users/:id          │  │  • DELETE /api/tasks/:id    ││
│  │  • DELETE /users/:id       │  │  • GET /api/stats/dashboard ││
│  │  • POST /send-otp          │  │  • GET /health              ││
│  │                            │  │                             ││
│  │  Database:                 │  │  Database:                  ││
│  │  🗄️ SQLite (goodreads.db) │  │  🗄️ JSON (db.json)         ││
│  │                            │  │                             ││
│  │  Features:                 │  │  Features:                  ││
│  │  ✅ JWT Authentication     │  │  ✅ Task CRUD               ││
│  │  ✅ Password Hashing       │  │  ✅ Filtering/Search        ││
│  │  ✅ Email Notifications    │  │  ✅ Statistics              ││
│  │  ✅ CORS Enabled           │  │  ✅ CORS Enabled            ││
│  │                            │  │                             ││
│  │  URL:                      │  │  URL:                       ││
│  │  todolist-auth-server      │  │  todolist-tasks-server      ││
│  │  .onrender.com             │  │  .onrender.com              ││
│  └────────────────────────────┘  └─────────────────────────────┘│
│                    ▲                        ▲                    │
└────────────────────┼────────────────────────┼────────────────────┘
                     │                        │
                     │ HTTPS                  │ HTTPS
                     │ Requests               │ Requests
                     │                        │
          ┌──────────┴────────────────────────┴──────────┐
          │                                               │
          │         FRONTEND (Local/GitHub Pages)         │
          │                                               │
          │  📄 LandingPage.html                          │
          │  📄 RegisterPage.html                         │
          │  📄 Home.html / WorkSpace.html                │
          │                                               │
          │  JavaScript Files:                            │
          │  • login.js      → Calls Auth Server          │
          │  • register.js   → Calls Auth Server          │
          │  • task-api.js   → Calls Tasks Server         │
          │                                               │
          │  Features:                                    │
          │  ✅ User Registration/Login                   │
          │  ✅ Task Management                           │
          │  ✅ Local Storage Cache                       │
          │  ✅ Real-time Updates                         │
          │                                               │
          └───────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │                 │
                    │  👤 END USER    │
                    │                 │
                    └─────────────────┘
```

---

## 🔄 Request Flow

### User Registration Flow:
```
1. User fills registration form
   ↓
2. Frontend (register.js) sends POST to:
   https://todolist-auth-server.onrender.com/users
   ↓
3. Auth Server:
   - Validates data
   - Hashes password with bcrypt
   - Saves to SQLite database
   - Sends welcome email via Nodemailer
   ↓
4. Returns success response
   ↓
5. Frontend displays success message
```

### User Login Flow:
```
1. User enters credentials
   ↓
2. Frontend (login.js) sends POST to:
   https://todolist-auth-server.onrender.com/login
   ↓
3. Auth Server:
   - Finds user in database
   - Verifies password with bcrypt
   - Generates JWT token
   ↓
4. Returns JWT token + user data
   ↓
5. Frontend stores token in localStorage
   ↓
6. User redirected to dashboard
```

### Task Management Flow:
```
1. User creates/edits task
   ↓
2. Frontend sends request with JWT to:
   https://todolist-tasks-server.onrender.com/api/tasks
   ↓
3. Tasks Server:
   - Processes request
   - Updates db.json
   - Returns updated data
   ↓
4. Frontend updates UI
```

---

## 🔒 Security Features

1. **JWT Authentication**
   - Tokens expire after 3 days
   - Secure random secret key
   - Bearer token in Authorization header

2. **Password Security**
   - Bcrypt hashing (10 rounds)
   - Never stored in plain text
   - Passwords never returned in API responses

3. **CORS Configuration**
   - Enabled for all origins (development)
   - Should be restricted in production

4. **Environment Variables**
   - Secrets stored securely in Render
   - Never committed to Git

---

## 📊 Database Structure

### Auth Server - SQLite (goodreads.db)

Table: `users`
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Tasks Server - JSON (db.json)

```json
{
  "tasks": [...],
  "projects": [...],
  "users": [...],
  "categories": [...]
}
```

---

## 🌐 Environment Variables

### Auth Server:
- `PORT` - Auto-assigned by Render
- `NODE_ENV` - production
- `SECRET_KEY` - Random 64-byte hex string
- `EMAIL_USER` - Gmail address
- `EMAIL_PASS` - Gmail app password

### Tasks Server:
- `PORT` - Auto-assigned by Render
- `NODE_ENV` - production

---

## 📈 Monitoring & Maintenance

### Render Dashboard:
- Real-time logs
- Server metrics
- Auto-deployment on Git push
- Health checks
- SSL/HTTPS automatic

### Free Tier Limits:
- 750 hours/month per service
- Services sleep after 15 min inactivity
- 512 MB RAM
- Shared CPU
- Persistent disk storage

---

## 🚀 Deployment Steps Summary

1. ✅ Push code to GitHub
2. ✅ Create Auth Web Service on Render
3. ✅ Configure Auth environment variables
4. ✅ Create Tasks Web Service on Render
5. ✅ Configure Tasks environment variables
6. ✅ Update frontend URLs
7. ✅ Test all functionality
8. ✅ Deploy frontend (GitHub Pages/Netlify/Vercel)

---

## 🔄 Future Improvements

- [ ] Add rate limiting
- [ ] Implement refresh tokens
- [ ] Add database backups
- [ ] Set up monitoring alerts
- [ ] Add API documentation (Swagger)
- [ ] Implement caching (Redis)
- [ ] Add comprehensive logging
- [ ] Set up CI/CD pipeline
- [ ] Add unit/integration tests
- [ ] Implement WebSockets for real-time updates
