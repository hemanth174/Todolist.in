const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sgMail = require('@sendgrid/mail');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Secure Secret Key for JWT
const SECRET_KEY =
  process.env.SECRET_KEY ||
  crypto.randomBytes(64).toString("hex");

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid configured successfully');
} else {
    console.warn('⚠️  SENDGRID_API_KEY not found - emails will not be sent');
}

// Email helper functions
async function sendEmail(to, subject, html) {
    if (!process.env.SENDGRID_API_KEY) {
        console.log(`📧 Email skipped (no SendGrid key): ${to}`);
        return false;
    }

    const msg = {
        to: to,
        from: {
            email: 'atthulurihemanthramasai777@gmail.com',
            name: 'TodoList App'
        },
        subject: subject,
        html: html
    };

    try {
        await sgMail.send(msg);
        console.log(`✅ Email sent successfully to: ${to}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error.response ? error.response.body : error);
        return false;
    }
}

async function sendWelcomeEmail(email) {
    const loginLink = `https://todoist777.netlify.app`;
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 15px; background: linear-gradient(135deg, #6a5af9 0%, #5848e8 100%);">
            <div style="background: white; padding: 30px; border-radius: 10px;">
                <h2 style="text-align: center; color: #333; margin-bottom: 20px;">🎉 Welcome to Todo List App!</h2>
                
                <p style="font-size: 16px; color: #555; line-height: 1.6;">Hello and welcome!</p>
                
                <p style="font-size: 16px; color: #5565; line-height: 1.6;">
                    Thank you for joining our Todo List app! You're now ready to organize your tasks and boost your productivity.
                </p>
                
                <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6a5af9;">
                    <h3 style="color: #6a5af9; margin-top: 0;">🚀 Get Started</h3>
                    <ul style="color: #666; margin: 0; padding-left: 20px;">
                        <li>Add your first task</li>
                        <li>Mark tasks as completed</li>
                        <li>Stay organized and productive</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginLink}" style="background-color: #6a5af9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(106, 90, 249, 0.3);">
                        🏠 Go to App
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                
                <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">
                    Happy organizing!<br>
                    <strong>The Todo App Team</strong>
                </p>
            </div>
        </div>
    `;

    return await sendEmail(email, '🎉 Welcome to Your Todo List App!', html);
}

// Send session expiry notification
async function sendSessionExpiryEmail(email, deviceName) {
    const loginLink = `https://todoist777.netlify.app`;
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 15px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);">
            <div style="background: white; padding: 30px; border-radius: 10px;">
                <h2 style="text-align: center; color: #333; margin-bottom: 20px;">🔒 Session Expired</h2>
                
                <p style="font-size: 16px; color: #555; line-height: 1.6;">Hello,</p>
                
                <p style="font-size: 16px; color: #555; line-height: 1.6;">
                    Your session on <strong>${deviceName}</strong> has expired for security reasons.
                </p>
                
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                    <h3 style="color: #856404; margin-top: 0;">⚠️ Security Notice</h3>
                    <p style="color: #856404; margin: 0;">
                        If this wasn't you, please change your password immediately.
                    </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginLink}" style="background-color: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);">
                        🔐 Login Again
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                
                <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">
                    Stay secure!<br>
                    <strong>The Todo App Team</strong>
                </p>
            </div>
        </div>
    `;

    return await sendEmail(email, '🔒 Your Session Has Expired', html);
}

// Send task reminder email
async function sendTaskReminderEmail(email, taskTitle, dueDate) {
    const loginLink = `https://todoist777.netlify.app`;
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 15px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <div style="background: white; padding: 30px; border-radius: 10px;">
                <h2 style="text-align: center; color: #333; margin-bottom: 20px;">⏰ Task Reminder</h2>
                
                <p style="font-size: 16px; color: #555; line-height: 1.6;">Hello,</p>
                
                <p style="font-size: 16px; color: #555; line-height: 1.6;">
                    Don't forget about your upcoming task!
                </p>
                
                <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
                    <h3 style="color: #1976d2; margin-top: 0;">📝 ${taskTitle}</h3>
                    <p style="color: #1976d2; margin: 5px 0;">
                        <strong>Due:</strong> ${dueDate}
                    </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginLink}" style="background-color: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);">
                        ✅ Complete Task
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                
                <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">
                    Stay productive!<br>
                    <strong>The Todo App Team</strong>
                </p>
            </div>
        </div>
    `;

    return await sendEmail(email, `⏰ Reminder: ${taskTitle}`, html);
}



// SQLite Database setup
const dbPath = path.join(__dirname, "goodreads.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL,
        device_name TEXT,
        browser TEXT,
        os TEXT,
        ip_address TEXT,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS notification_subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS push_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        target_users TEXT DEFAULT 'all',
        sent_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sent_by) REFERENCES users(id)
      )
    `);

    console.log("Database and tables initialized successfully");

    app.listen(port, () => {
      console.log(`🚀 Server Running at http://localhost:${port}/`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();


// 🔐 Generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    SECRET_KEY,
    { expiresIn: "3d" } // Token valid for 3 days
  );
}

// 🧠 Middleware: Verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ error: "Access denied, token missing" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}


// 🧍 Create a new user (with password hashing)
app.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // hash it

    const result = await db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    // Send welcome email asynchronously (don't wait for it)
    sendWelcomeEmail(email).catch(err => console.error('Email send failed:', err));

    res.status(201).json({
      message: "✅ User created successfully",
      userId: result.lastID
    });
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});


// 🔑 Login route (password check + token issue)
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid password" });

    const token = generateToken(user);

    // Extract device information from headers
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';
    
    // Parse user agent for device info
    let deviceName = 'Unknown Device';
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';
    
    // Simple user agent parsing
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) os = 'iOS';
    
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    deviceName = `${os} - ${browser}`;

    // Create session record asynchronously (don't block login response)
    db.run(
      `INSERT INTO sessions (user_id, token, device_name, browser, os, ip_address, last_active) 
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [user.id, token, deviceName, browser, os, ipAddress]
    ).catch(err => console.error('Session creation failed:', err));

    // NO EMAIL ON LOGIN - Only on registration, session expiry, or reminders

    // Return response immediately
    res.json({
      message: "✅ Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 👥 Get all users (Protected route)
app.get("/users", authenticateToken, async (req, res) => {
  try {
    const users = await db.all("SELECT id, name, email, created_at FROM users");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 🔎 Get user by ID
app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.get("SELECT id, name, email, created_at FROM users WHERE id = ?", [id]);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✏️ Update user
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
    if (!user) return res.status(404).json({ error: "User not found" });

    const updatedName = name || user.name;
    const updatedEmail = email || user.email;
    const updatedPassword = password
      ? await bcrypt.hash(password, 10)
      : user.password;

    await db.run(
      "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?",
      [updatedName, updatedEmail, updatedPassword, id]
    );

    res.json({ message: "✅ User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 🗑️ Delete user
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
    if (!user) return res.status(404).json({ error: "User not found" });

    await db.run("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "🗑️ User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SESSION MANAGEMENT ENDPOINTS ---

// 📱 Get active sessions for a user
app.get("/users/:userId/sessions", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user can only see their own sessions
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: "Unauthorized to view these sessions" });
    }

    // Check if sessions table exists
    const tableExists = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'"
    );

    if (!tableExists) {
      console.log('Sessions table does not exist, returning empty sessions');
      return res.json({
        success: true,
        count: 0,
        sessions: [],
        message: "Sessions table not yet initialized. Please log out and log back in."
      });
    }

    const sessions = await db.all(
      `SELECT id, device_name, browser, os, ip_address, last_active, created_at, is_active 
       FROM sessions 
       WHERE user_id = ? AND is_active = 1 
       ORDER BY last_active DESC`,
      [userId]
    );

    res.json({
      success: true,
      count: sessions.length,
      sessions: sessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🔄 Update session last active time
app.put("/sessions/heartbeat", authenticateToken, async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    
    await db.run(
      `UPDATE sessions 
       SET last_active = datetime('now') 
       WHERE token = ? AND is_active = 1`,
      [token]
    );

    res.json({ success: true, message: "Session updated" });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🚪 Logout from specific device/session
app.delete("/sessions/:sessionId", authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Get session details including device name
    const session = await db.get(
      "SELECT s.user_id, s.device_name, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ?",
      [sessionId]
    );

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.user_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to delete this session" });
    }

    // Mark session as inactive instead of deleting
    await db.run(
      "UPDATE sessions SET is_active = 0 WHERE id = ?",
      [sessionId]
    );

    // Send session expiry email asynchronously (optional - only if you want notifications for manual logouts)
    // Uncomment the next line if you want email notifications when users manually logout from a device
    // sendSessionExpiryEmail(session.email, session.device_name).catch(err => console.error('Email send failed:', err));

    res.json({ 
      success: true,
      message: "🚪 Logged out from device successfully" 
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🚪 Logout from all devices except current
app.post("/users/:userId/logout-all-except-current", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentToken = req.headers['authorization'].split(' ')[1];
    
    // Verify user can only logout their own sessions
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await db.run(
      `UPDATE sessions 
       SET is_active = 0 
       WHERE user_id = ? AND token != ? AND is_active = 1`,
      [userId, currentToken]
    );

    res.json({ 
      success: true,
      message: `🚪 Logged out from ${result.changes} other device(s)`,
      count: result.changes
    });
  } catch (error) {
    console.error('Error logging out from all devices:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- EMAIL NOTIFICATION ENDPOINTS ---

// 📧 Send session expiry notification (RE-ENABLED for session expiry only)
app.post('/send-session-expiry', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email address is required' });
    }

    const loginLink = `https://todoist777.netlify.app`;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div style="background: white; padding: 30px; border-radius: 10px;">
                <h2 style="text-align: center; color: #333; margin-bottom: 20px;">📋 Todo List App - Session Expired</h2>
                
                <p style="font-size: 16px; color: #555; line-height: 1.6;">Hello there!</p>
                
                <p style="font-size: 16px; color: #555; line-height: 1.6;">
                    We noticed that you haven't opened your Todo List app for more than 3 days. 
                    For security reasons, your session has automatically expired.
                </p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6a5af9;">
                    <h3 style="color: #6a5af9; margin-top: 0;">🔐 Security Notice</h3>
                    <p style="margin: 0; color: #666;">Your account and todos are safe! This is just an automatic security measure to keep your data protected.</p>
                </div>
                
                <p style="font-size: 16px; color: #555; line-height: 1.6;">
                    To continue using your Todo List app, please log in again by clicking the button below:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginLink}" style="background-color: #6a5af9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(106, 90, 249, 0.3);">
                        🔑 Login Again
                    </a>
                </div>
                
                <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #28a745; font-weight: 500;">✅ Your todos are still saved and waiting for you!</p>
                </div>
                
                <p style="font-size: 14px; color: #888; line-height: 1.6;">
                    If you didn't expect this email or have any concerns, please contact our support team.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                
                <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">
                    Thanks for using Todo List App!<br>
                    <strong>The Todo App Team</strong>
                </p>
            </div>
        </div>
    `;

    const success = await sendEmail(email, '🔔 Your Todo List Session Has Expired - Please Login Again', htmlContent);
    
    if (success) {
        res.status(200).json({ message: 'Session expiry notification sent successfully!' });
    } else {
        res.status(500).json({ message: 'Failed to send session expiry email. Please try again later.' });
    }
});

// --- Endpoint to send reminder email for inactive users (DISABLED) ---
// app.post('/send-reminder-email', async (req, res) => {
//     const { email, daysSinceLastActive } = req.body;

//     if (!email) {
//         return res.status(400).json({ message: 'Email address is required' });
//     }

//     const loginLink = `https://dm25m3rt-${port}.inc1.devtunnels.ms/`;

//     const mailOptions = {
//         from: '"Todo List App"',
//         to: email,
//         subject: '📝 We Miss You! Your Todos Are Waiting',
//         html: `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 15px; background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);">
//                 <div style="background: white; padding: 30px; border-radius: 10px;">
//                     <h2 style="text-align: center; color: #333; margin-bottom: 20px;">📝 We Miss You!</h2>
//                     
//                     <p style="font-size: 16px; color: #555; line-height: 1.6;">Hello!</p>
//                     
//                     <p style="font-size: 16px; color: #555; line-height: 1.6;">
//                         It's been ${daysSinceLastActive || 'a few'} days since you last visited your Todo List app. 
//                         Your tasks are patiently waiting for you!
//                     </p>
//                     
//                     <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e17055;">
//                         <h3 style="color: #e17055; margin-top: 0;">🎯 Stay On Track</h3>
//                         <p style="margin: 0; color: #666;">Don't let your goals slip away. A few minutes today can make a big difference!</p>
//                     </div>
//                     
//                     <div style="text-align: center; margin: 30px 0;">
//                         <a href="${loginLink}" style="background-color: #e17055; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(225, 112, 85, 0.3);">
//                             📋 Check My Todos
//                         </a>
//                     </div>
//                     
//                     <p style="font-size: 14px; color: #888; line-height: 1.6; text-align: center;">
//                         Remember: Your session will expire in ${3 - (daysSinceLastActive || 0)} days if you don't log in.
//                     </p>
//                     
//                     <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
//                     
//                     <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">
//                         Keep crushing your goals!<br>
//                         <strong>The Todo App Team</strong>
//                     </p>
//                 </div>
//             </div>
//         `
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log(`✅ Reminder email sent successfully to: ${email}`);
//         res.status(200).json({ message: 'Reminder email sent successfully!' });
//     } catch (error) {
//         console.error('❌ Error sending reminder email:', error);
//         res.status(500).json({ message: 'Failed to send reminder email. Please try again later.' });
//     }
// });

// 📧 Send task deadline reminder
app.post('/send-task-reminder', authenticateToken, async (req, res) => {
    const { taskTitle, dueDate } = req.body;

    if (!taskTitle || !dueDate) {
        return res.status(400).json({ message: 'Task title and due date are required' });
    }

    const userEmail = req.user.email;
    
    // Send task reminder email using the new template
    const success = await sendTaskReminderEmail(userEmail, taskTitle, dueDate);
    
    if (success) {
        res.status(200).json({ message: 'Task reminder sent successfully!' });
    } else {
        res.status(500).json({ message: 'Failed to send task reminder. Please try again later.' });
    }
});

// ==================== NOTIFICATION ENDPOINTS ====================

// 🔔 Subscribe to push notifications
app.post('/notifications/subscribe', authenticateToken, async (req, res) => {
    try {
        const { endpoint, p256dh, auth } = req.body;
        const userId = req.user.id;

        if (!endpoint || !p256dh || !auth) {
            return res.status(400).json({ error: 'Missing subscription data' });
        }

        // Check if subscription already exists
        const existing = await db.get(
            'SELECT id FROM notification_subscriptions WHERE user_id = ? AND endpoint = ?',
            [userId, endpoint]
        );

        if (existing) {
            return res.json({ message: 'Already subscribed', success: true });
        }

        // Save subscription
        await db.run(
            `INSERT INTO notification_subscriptions (user_id, endpoint, p256dh, auth) 
             VALUES (?, ?, ?, ?)`,
            [userId, endpoint, p256dh, auth]
        );

        res.json({ message: 'Subscribed successfully', success: true });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 🔕 Unsubscribe from push notifications
app.post('/notifications/unsubscribe', authenticateToken, async (req, res) => {
    try {
        const { endpoint } = req.body;
        const userId = req.user.id;

        await db.run(
            'DELETE FROM notification_subscriptions WHERE user_id = ? AND endpoint = ?',
            [userId, endpoint]
        );

        res.json({ message: 'Unsubscribed successfully', success: true });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 📢 Send push notification (Admin only - simplified for now)
app.post('/notifications/send', authenticateToken, async (req, res) => {
    try {
        const { title, message, targetUsers } = req.body;
        const sentBy = req.user.id;

        if (!title || !message) {
            return res.status(400).json({ error: 'Title and message are required' });
        }

        // Save notification to database
        await db.run(
            `INSERT INTO push_notifications (title, message, target_users, sent_by) 
             VALUES (?, ?, ?, ?)`,
            [title, message, targetUsers || 'all', sentBy]
        );

        // Get all active subscriptions
        let subscriptions;
        if (targetUsers === 'all') {
            subscriptions = await db.all('SELECT * FROM notification_subscriptions');
        } else {
            // Can implement specific user targeting later
            subscriptions = await db.all('SELECT * FROM notification_subscriptions');
        }

        res.json({ 
            message: 'Notification sent successfully', 
            success: true,
            recipientCount: subscriptions.length
        });
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 📊 Get notification history (Admin)
app.get('/notifications/history', authenticateToken, async (req, res) => {
    try {
        const notifications = await db.all(
            `SELECT n.*, u.name as sent_by_name, u.email as sent_by_email 
             FROM push_notifications n 
             LEFT JOIN users u ON n.sent_by = u.id 
             ORDER BY n.created_at DESC 
             LIMIT 50`
        );

        res.json({ notifications, success: true });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 📊 Get user count for push notifications
app.get('/notifications/user-count', authenticateToken, async (req, res) => {
    try {
        const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');
        const subscribedUsers = await db.get('SELECT COUNT(DISTINCT user_id) as count FROM notification_subscriptions');

        res.json({ 
            total: totalUsers.count,
            subscribed: subscribedUsers.count,
            success: true 
        });
    } catch (error) {
        console.error('Get user count error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Endpoint to send the OTP email (keeping for backward compatibility) ---
app.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email address is required' });
    }

    // 1. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    const mailOptions = {
        from: '"Todo List App Verification" <ramasaiahemanth@gmail.com>',
        to: email,
        subject: 'Your One-Time Password (OTP)',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="text-align: center; color: #333;">OTP for Login Verification</h2>
                <p style="font-size: 16px;">Hello,</p>
                <p style="font-size: 16px;">Thank you for registering. Use the following One-Time Password (OTP) to complete your login. This OTP is valid for 10 minutes.</p>
                <div style="text-align: center; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; background-color: #f0f0f0; padding: 10px 20px; border-radius: 5px; letter-spacing: 5px;">${otp}</span>
                </div>
                <p style="font-size: 16px;">If you did not request this OTP, please ignore this email or contact our support.</p>
                <p style="font-size: 16px;">Thanks,<br>The Todo App Team</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent successfully to: ${email}`);
        res.status(200).json({ message: 'OTP has been sent to your email address!' });
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        res.status(500).json({ message: 'Failed to send OTP email. Please try again later.' });
    }
});
