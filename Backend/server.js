const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Secure Secret Key for JWT
const SECRET_KEY =
  process.env.SECRET_KEY ||
  crypto.randomBytes(64).toString("hex");

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'todolist725@gmail.com',
        pass: process.env.EMAIL_PASS || 'adap cjfs ohdu suct'
    }
});

// Email helper functions
async function sendWelcomeEmail(email) {
    const loginLink = `http://localhost:3000`;
    
    const mailOptions = {
        from: '"Todo List App"',
        to: email,
        subject: '🎉 Welcome to Your Todo List App!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 15px; background: linear-gradient(135deg, #6a5af9 0%, #5848e8 100%);">
                <div style="background: white; padding: 30px; border-radius: 10px;">
                    <h2 style="text-align: center; color: #333; margin-bottom: 20px;">🎉 Welcome to Todo List App!</h2>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">Hello and welcome!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
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
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent successfully to: ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
        return false;
    }
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

    console.log("Database and users table initialized successfully");

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

    // Send welcome email to new user
    const emailSent = await sendWelcomeEmail(email);

    res.status(201).json({
      message: "✅ User created successfully",
      userId: result.lastID,
      emailSent: emailSent
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

// --- EMAIL NOTIFICATION ENDPOINTS ---

// 📧 Send session expiry notification
app.post('/send-session-expiry', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email address is required' });
    }

    const loginLink = `http://localhost:3000`;

    const mailOptions = {
        from: '"Todo List App" <todolist725@gmail.com>',
        to: email,
        subject: '🔔 Your Todo List Session Has Expired - Please Login Again',
        html: `
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
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Session expiry email sent successfully to: ${email}`);
        res.status(200).json({ message: 'Session expiry notification sent successfully!' });
    } catch (error) {
        console.error('❌ Error sending session expiry email:', error);
        res.status(500).json({ message: 'Failed to send session expiry email. Please try again later.' });
    }
});

// --- Endpoint to send reminder email for inactive users ---
app.post('/send-reminder-email', async (req, res) => {
    const { email, daysSinceLastActive } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email address is required' });
    }

    const loginLink = `https://dm25m3rt-${port}.inc1.devtunnels.ms/`;

    const mailOptions = {
        from: '"Todo List App"',
        to: email,
        subject: '📝 We Miss You! Your Todos Are Waiting',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 15px; background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);">
                <div style="background: white; padding: 30px; border-radius: 10px;">
                    <h2 style="text-align: center; color: #333; margin-bottom: 20px;">📝 We Miss You!</h2>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">Hello!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
                        It's been ${daysSinceLastActive || 'a few'} days since you last visited your Todo List app. 
                        Your tasks are patiently waiting for you!
                    </p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e17055;">
                        <h3 style="color: #e17055; margin-top: 0;">🎯 Stay On Track</h3>
                        <p style="margin: 0; color: #666;">Don't let your goals slip away. A few minutes today can make a big difference!</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${loginLink}" style="background-color: #e17055; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(225, 112, 85, 0.3);">
                            📋 Check My Todos
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #888; line-height: 1.6; text-align: center;">
                        Remember: Your session will expire in ${3 - (daysSinceLastActive || 0)} days if you don't log in.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                    
                    <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">
                        Keep crushing your goals!<br>
                        <strong>The Todo App Team</strong>
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Reminder email sent successfully to: ${email}`);
        res.status(200).json({ message: 'Reminder email sent successfully!' });
    } catch (error) {
        console.error('❌ Error sending reminder email:', error);
        res.status(500).json({ message: 'Failed to send reminder email. Please try again later.' });
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
