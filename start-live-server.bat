@echo off
echo ========================================
echo      TodoList Live Server Launcher
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo 📥 Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

REM Check if dependencies are installed
if not exist node_modules (
    echo.
    echo 📦 Installing dependencies...
    echo.
    copy live-server-package.json package.json
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
)

echo.
echo 🚀 Starting Live Server...
echo 📂 Serving: ./FORENTEND/HomeTools
echo 🌐 URL: http://localhost:3000
echo.
echo 💡 The server will automatically reload when files change
echo 🛑 Press Ctrl+C to stop the server
echo.

REM Start the live server
node live-server.js --port=3000 --root=./FORENTEND/HomeTools

echo.
echo 👋 Live Server stopped
pause