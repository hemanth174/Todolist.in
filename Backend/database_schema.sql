-- Users Database Schema
-- This file contains the SQL commands to create the users table

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sample data insertion (optional)
-- INSERT INTO users (name, email, password) VALUES 
-- ('John Doe', 'john@example.com', 'hashed_password_here'),
-- ('Jane Smith', 'jane@example.com', 'hashed_password_here');

-- Useful queries for the users table:

-- Select all users (excluding passwords for security)
-- SELECT id, name, email, created_at FROM users;

-- Select user by email
-- SELECT id, name, email, created_at FROM users WHERE email = ?;

-- Count total users
-- SELECT COUNT(*) as total_users FROM users;

-- Delete a user by id
-- DELETE FROM users WHERE id = ?;

-- Update user information
-- UPDATE users SET name = ?, email = ? WHERE id = ?;