# 🚀 TodoList Live Server Setup Guide

## Overview
The TodoList IDE now includes a powerful Live Server feature that provides:
- ✨ **Live Reload** - Automatic page refresh when code changes
- 🌐 **Local Development Server** - Professional development environment
- 📱 **Mobile Testing** - Test on mobile devices via network access
- 🔥 **Hot Reload** - Instant preview updates without manual refresh

## 🎯 Features Included

### 1. **Browser-Based Live Server**
- Click the "🔴 Go Live" button in the IDE
- Instant preview in new browser window
- Real-time code synchronization
- No additional setup required

### 2. **Professional Node.js Live Server** (Optional)
- Full-featured development server
- File watching with automatic reload
- WebSocket-based live reload
- Network access for mobile testing

## 🚀 Quick Start

### Method 1: Browser Live Server (Instant)
1. Open the TodoList IDE (`/FORENTEND/HomeTools/IDE.html`)
2. Write your HTML, CSS, and JavaScript code
3. Click the **"🔴 Go Live"** button
4. Your project opens in a new browser window
5. Make changes - they appear instantly!

### Method 2: Professional Live Server (Advanced)

#### Prerequisites
- **Node.js** installed on your system ([Download here](https://nodejs.org/))

#### Setup Steps

1. **Open Terminal/Command Prompt** in your TodoList project folder

2. **Quick Start** - Just double-click:
   ```
   start-live-server.bat
   ```

3. **Manual Start** (Alternative):
   ```bash
   # Install dependencies (one-time setup)
   copy live-server-package.json package.json
   npm install

   # Start live server
   node live-server.js --port=3000 --root=./FORENTEND/HomeTools
   ```

4. **Access Your IDE**:
   - Open browser to: `http://localhost:3000/IDE.html`
   - Your IDE is now running with full live reload!

## 🎮 How to Use

### IDE Controls
- **🔴 Go Live** - Toggle live server on/off
- **🟢 Go Live** - Server is running (green = active)
- **Open in Browser** - Launch in new window
- **Copy URL** - Copy server URL to clipboard

### Keyboard Shortcuts
- **Ctrl + L** - Toggle Live Server
- **Ctrl + S** - Save Project
- **Ctrl + R** - Run Code
- **Ctrl + N** - New File

### Live Server Status
- **🔴 Offline** - Server not running
- **🟢 Online** - Server active with live reload
- **Port Display** - Shows current server port
- **Auto-reload** - Changes update automatically

## 🌟 Advanced Features

### Network Access
When using the Node.js live server, you can access your project from:
- **Local**: `http://localhost:3000`
- **Network**: `http://YOUR_IP:3000` (for mobile testing)

### File Watching
The server automatically watches for changes in:
- `.html` files
- `.css` files
- `.js` files
- `.json` files

### Live Reload Indicators
- Browser console shows connection status
- Live server badge appears on preview pages
- Automatic reconnection if connection is lost

## 🔧 Customization

### Change Port
```bash
node live-server.js --port=5000 --root=./FORENTEND
```

### Serve Different Folder
```bash
node live-server.js --root=./your-custom-folder
```

## 🐛 Troubleshooting

### Port Already in Use
- The server automatically finds the next available port
- Check console output for the actual port being used

### Node.js Not Found
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal/command prompt after installation

### Files Not Reloading
- Check that you're editing files in the correct directory
- Ensure WebSocket connection is established (check browser console)

### Browser Not Opening
- Manually navigate to the displayed URL
- Check if antivirus/firewall is blocking the connection

## 📱 Mobile Testing

1. Start the Node.js live server
2. Find your computer's IP address:
   ```bash
   ipconfig    # Windows
   ifconfig    # Mac/Linux
   ```
3. On mobile browser, navigate to: `http://YOUR_IP:3000`

## 🎯 Best Practices

1. **Use Live Server for Development** - Real-time feedback speeds up development
2. **Test on Multiple Devices** - Use network access for mobile testing  
3. **Save Projects Frequently** - Use Ctrl+S or the Save button
4. **Monitor Console** - Check for JavaScript errors and live reload status
5. **Organize Code** - Use the tabbed interface for better code organization

## 🔄 Updates and Changes

The live server automatically detects and reloads when you:
- Modify HTML structure
- Update CSS styles  
- Change JavaScript code
- Add/remove files
- Update project settings

## 💡 Tips

- The browser-based live server works immediately with no setup
- The Node.js server provides more advanced features and better performance
- Both methods support the same IDE features and project saving
- Live reload works best with the web development languages (HTML/CSS/JS)
- For Python and SQL, use the "Run Code" button instead of live server

---

**Happy Coding! 🎉** Your TodoList IDE is now equipped with professional live server capabilities!