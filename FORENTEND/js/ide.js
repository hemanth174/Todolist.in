// IDE JavaScript Functions

// Navigation function (reused from other pages)
function navigateTo(page) {
    window.location.href = page;
}

// Global variables
let currentLanguage = 'html';
let savedProjects = JSON.parse(localStorage.getItem('ideProjects')) || [];

// Live Server variables
let isServerRunning = false;
let serverPort = 3000;
let serverUrl = '';
let liveReloadSocket = null;

// Initialize the IDE
document.addEventListener('DOMContentLoaded', function() {
    initializeIDE();
    loadSavedProjects();
    setupEventListeners();
    showEditor('html');
});

function initializeIDE() {
    // Set default content for different languages
    const defaultCode = {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>Welcome to your HTML project.</p>
</body>
</html>`,
        css: `/* Your CSS styles here */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f4f4f4;
}

h1 {
    color: #333;
    text-align: center;
}`,
        javascript: `// Your JavaScript code here
console.log("Hello World!");

function greet(name) {
    return "Hello, " + name + "!";
}

// Example usage
const message = greet("Developer");
console.log(message);`,
        python: `# Your Python code here
print("Hello World!")

def greet(name):
    return f"Hello, {name}!"

# Example usage
message = greet("Developer")
print(message)`,
        sql: `-- Your SQL queries here
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');

SELECT * FROM users;`
    };

    // Set default code in editors
    Object.keys(defaultCode).forEach(lang => {
        const editor = document.getElementById(lang + 'Code');
        if (editor && !editor.value) {
            editor.value = defaultCode[lang];
        }
    });
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const lang = this.dataset.lang;
            showEditor(lang);
        });
    });

    // Output tab switching
    document.querySelectorAll('.output-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const outputType = this.textContent.toLowerCase();
            showOutput(outputType);
        });
    });

    // Control buttons
    document.getElementById('runCodeBtn').addEventListener('click', runCode);
    document.getElementById('saveFileBtn').addEventListener('click', showSaveModal);
    document.getElementById('newFileBtn').addEventListener('click', newFile);
    document.getElementById('saveProjectBtn').addEventListener('click', showSaveModal);
    
    // Live Server buttons
    document.getElementById('liveServerBtn').addEventListener('click', toggleLiveServer);
    document.getElementById('openBrowserBtn').addEventListener('click', openInBrowser);
    document.getElementById('copyUrlBtn').addEventListener('click', copyServerUrl);

    // Language selector
    document.getElementById('languageSelect').addEventListener('change', function() {
        switchLanguage(this.value);
    });

    // Code editors - auto-run preview for web languages
    ['htmlCode', 'cssCode', 'jsCode'].forEach(id => {
        const editor = document.getElementById(id);
        if (editor) {
            editor.addEventListener('input', debounce(updatePreviewWithLiveServer, 500));
        }
    });

    // Save project modal
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeSaveModal();
        }
    });
}

// Tab management
function showEditor(language) {
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-lang="${language}"]`).classList.add('active');

    // Update active editor
    document.querySelectorAll('.editor').forEach(editor => {
        editor.classList.remove('active');
    });
    document.getElementById(language + '-editor').classList.add('active');

    currentLanguage = language;
    
    // Update language selector
    document.getElementById('languageSelect').value = language;

    // Update preview if it's a web language
    if (['html', 'css', 'javascript'].includes(language)) {
        updatePreview();
    }
}

function closeTab(language) {
    // Don't close if it's the only tab
    const activeTabs = document.querySelectorAll('.tab').length;
    if (activeTabs <= 1) return;

    // Remove tab and editor
    document.querySelector(`[data-lang="${language}"]`).style.display = 'none';
    document.getElementById(language + '-editor').style.display = 'none';

    // Switch to first available tab
    const remainingTabs = document.querySelectorAll('.tab:not([style*="display: none"])');
    if (remainingTabs.length > 0) {
        const firstTab = remainingTabs[0];
        showEditor(firstTab.dataset.lang);
    }
}

// Output management
function showOutput(type) {
    // Update active output tab
    document.querySelectorAll('.output-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update active output
    document.querySelectorAll('.output').forEach(output => {
        output.classList.remove('active');
    });
    document.getElementById(type + '-output').classList.add('active');
}

// Code execution
function runCode() {
    const language = currentLanguage;
    const code = document.getElementById(language + 'Code').value;

    if (!code.trim()) {
        logToConsole('error', 'No code to execute!');
        return;
    }

    logToConsole('info', `Running ${language} code...`);

    switch (language) {
        case 'html':
        case 'css':
        case 'javascript':
            updatePreview();
            showOutput('preview');
            break;
        case 'python':
            executePython(code);
            break;
        case 'sql':
            executeSQL(code);
            break;
        default:
            logToConsole('error', `Execution not supported for ${language}`);
    }
}

function updatePreview() {
    const html = document.getElementById('htmlCode').value;
    const css = document.getElementById('cssCode').value;
    const js = document.getElementById('jsCode').value;

    const previewFrame = document.getElementById('previewFrame');
    const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;

    const fullHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${css}</style>
        </head>
        <body>
            ${html}
            <script>
                // Capture console logs
                const originalLog = console.log;
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.log = function(...args) {
                    parent.postMessage({type: 'console', level: 'log', message: args.join(' ')}, '*');
                    originalLog.apply(console, args);
                };
                
                console.error = function(...args) {
                    parent.postMessage({type: 'console', level: 'error', message: args.join(' ')}, '*');
                    originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                    parent.postMessage({type: 'console', level: 'warn', message: args.join(' ')}, '*');
                    originalWarn.apply(console, args);
                };
                
                try {
                    ${js}
                } catch (error) {
                    parent.postMessage({type: 'console', level: 'error', message: 'JavaScript Error: ' + error.message}, '*');
                }
            </script>
        </body>
        </html>
    `;

    previewDoc.open();
    previewDoc.write(fullHTML);
    previewDoc.close();
}

// Listen for console messages from preview frame
window.addEventListener('message', function(event) {
    if (event.data.type === 'console') {
        logToConsole(event.data.level, event.data.message);
    }
});

function executePython(code) {
    // Simulate Python execution (in a real implementation, you'd need a Python interpreter)
    logToConsole('info', 'Python execution simulated:');
    logToConsole('log', '>>> ' + code.split('\n').join('\n>>> '));
    
    // Simple simulation for common Python functions
    if (code.includes('print(')) {
        const matches = code.match(/print\(["'](.*)["']\)/g);
        if (matches) {
            matches.forEach(match => {
                const content = match.match(/print\(["'](.*)["']\)/)[1];
                logToConsole('log', content);
            });
        }
    }
    
    showOutput('console');
}

function executeSQL(code) {
    // Simulate SQL execution
    logToConsole('info', 'SQL execution simulated:');
    logToConsole('log', code);
    
    if (code.toUpperCase().includes('SELECT')) {
        logToConsole('log', 'Query executed successfully. Results would appear here in a real database.');
    } else if (code.toUpperCase().includes('CREATE')) {
        logToConsole('log', 'Table created successfully.');
    } else if (code.toUpperCase().includes('INSERT')) {
        logToConsole('log', '1 row(s) affected.');
    }
    
    showOutput('console');
}

// Console logging
function logToConsole(level, message) {
    const consoleLog = document.getElementById('consoleLog');
    const timestamp = new Date().toLocaleTimeString();
    const levelColor = {
        'log': '#fff',
        'error': '#ff6b6b',
        'warn': '#ffa726',
        'info': '#42a5f5'
    };
    
    const logEntry = document.createElement('div');
    logEntry.style.color = levelColor[level] || '#fff';
    logEntry.style.marginBottom = '5px';
    logEntry.textContent = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    consoleLog.appendChild(logEntry);
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

function clearConsole() {
    document.getElementById('consoleLog').innerHTML = '';
}

function clearResult() {
    document.getElementById('resultContent').textContent = '';
}

// Language switching
function switchLanguage(language) {
    showEditor(language);
    
    // Show/hide relevant tabs
    const webLanguages = ['html', 'css', 'javascript'];
    document.querySelectorAll('.tab').forEach(tab => {
        const tabLang = tab.dataset.lang;
        if (language === 'web') {
            tab.style.display = webLanguages.includes(tabLang) ? 'flex' : 'none';
        } else {
            tab.style.display = tabLang === language ? 'flex' : 'none';
        }
    });
    
    // Add new tab if needed for single languages
    if (!webLanguages.includes(language) && language !== 'web') {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.style.display = 'none';
        });
        document.querySelector(`[data-lang="${language}"]`).style.display = 'flex';
    } else if (language === 'web') {
        webLanguages.forEach(lang => {
            document.querySelector(`[data-lang="${lang}"]`).style.display = 'flex';
        });
        showEditor('html');
    }
}

// Code formatting
function formatCode(language) {
    const editor = document.getElementById(language + 'Code');
    let code = editor.value;
    
    // Simple formatting (in a real implementation, you'd use proper formatters)
    switch (language) {
        case 'html':
            // Simple HTML formatting
            code = code.replace(/></g, '>\n<');
            break;
        case 'css':
            // Simple CSS formatting
            code = code.replace(/\{/g, ' {\n  ');
            code = code.replace(/\}/g, '\n}\n');
            code = code.replace(/;/g, ';\n  ');
            break;
        case 'javascript':
            // Simple JS formatting
            code = code.replace(/\{/g, ' {\n  ');
            code = code.replace(/\}/g, '\n}');
            code = code.replace(/;/g, ';\n');
            break;
    }
    
    editor.value = code;
}

function clearEditor(language) {
    if (confirm('Are you sure you want to clear this editor?')) {
        document.getElementById(language + 'Code').value = '';
        if (['html', 'css', 'javascript'].includes(language)) {
            updatePreview();
        }
    }
}

// File management
function newFile() {
    if (confirm('Create a new file? (This will clear current editors)')) {
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.value = '';
        });
        initializeIDE();
        updatePreview();
        logToConsole('info', 'New file created');
    }
}

function showSaveModal() {
    document.getElementById('saveModal').style.display = 'block';
    document.getElementById('projectName').focus();
}

function closeSaveModal() {
    document.getElementById('saveModal').style.display = 'none';
    document.getElementById('projectName').value = '';
}

function saveProject() {
    const projectName = document.getElementById('projectName').value.trim();
    
    if (!projectName) {
        alert('Please enter a project name');
        return;
    }
    
    const project = {
        id: Date.now().toString(),
        name: projectName,
        createdAt: new Date().toISOString(),
        code: {
            html: document.getElementById('htmlCode').value,
            css: document.getElementById('cssCode').value,
            javascript: document.getElementById('jsCode').value,
            python: document.getElementById('pythonCode').value,
            sql: document.getElementById('sqlCode').value
        }
    };
    
    savedProjects.push(project);
    localStorage.setItem('ideProjects', JSON.stringify(savedProjects));
    
    loadSavedProjects();
    closeSaveModal();
    logToConsole('info', `Project "${projectName}" saved successfully`);
}

function loadSavedProjects() {
    const savedFilesList = document.getElementById('savedFilesList');
    savedFilesList.innerHTML = '';
    
    savedProjects.forEach(project => {
        const fileElement = document.createElement('div');
        fileElement.className = 'saved-file';
        fileElement.innerHTML = `
            <div>
                <strong>${project.name}</strong>
                <small style="display: block; opacity: 0.7;">
                    ${new Date(project.createdAt).toLocaleDateString()}
                </small>
            </div>
            <button class="delete-btn" onclick="deleteProject('${project.id}')">×</button>
        `;
        
        fileElement.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-btn')) {
                loadProject(project);
            }
        });
        
        savedFilesList.appendChild(fileElement);
    });
}

function loadProject(project) {
    if (confirm(`Load project "${project.name}"? This will replace current code.`)) {
        Object.keys(project.code).forEach(lang => {
            const editor = document.getElementById(lang + 'Code');
            if (editor) {
                editor.value = project.code[lang];
            }
        });
        
        updatePreview();
        logToConsole('info', `Project "${project.name}" loaded`);
    }
}

function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        savedProjects = savedProjects.filter(p => p.id !== projectId);
        localStorage.setItem('ideProjects', JSON.stringify(savedProjects));
        loadSavedProjects();
        logToConsole('info', 'Project deleted');
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== LIVE SERVER FUNCTIONALITY =====

// Toggle live server on/off
function toggleLiveServer() {
    if (isServerRunning) {
        stopLiveServer();
    } else {
        startLiveServer();
    }
}

// Start live server
function startLiveServer() {
    try {
        // Generate a random port for display (browser simulation)
        serverPort = Math.floor(Math.random() * 6000) + 3000;
        serverUrl = `Live Preview (Port ${serverPort})`;
        
        // Create HTML content with current code
        const html = document.getElementById('htmlCode').value;
        const css = document.getElementById('cssCode').value;
        const js = document.getElementById('jsCode').value;
        
        // Create complete HTML document
        const fullHTML = createLiveServerHTML(html, css, js);
        
        // Create blob URL for the preview
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        
        // Store the blob URL for later use
        window.currentLiveServerUrl = blobUrl;
        
        // Update UI
        updateServerStatus(true);
        
        // Setup live reload functionality
        setupLiveReload();
        
        // Log success
        logToConsole('info', `✅ Live Server started successfully!`);
        logToConsole('info', `🌐 Preview URL: ${serverUrl}`);
        logToConsole('info', `🔄 Auto-reload enabled - changes will update automatically`);
        
        // Open in new browser window
        const newWindow = window.open(blobUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        
        if (newWindow) {
            // Store reference for live reload
            window.liveServerWindow = newWindow;
            logToConsole('info', '🚀 Opened in new browser window');
        } else {
            logToConsole('warn', '⚠️ Popup blocked - please allow popups and try again');
        }
        
    } catch (err) {
        logToConsole('error', '❌ Failed to start live server: ' + err.message);
        updateServerStatus(false);
    }
}

// Stop live server
function stopLiveServer() {
    try {
        // Close live server window if open
        if (window.liveServerWindow && !window.liveServerWindow.closed) {
            window.liveServerWindow.close();
            window.liveServerWindow = null;
        }
        
        // Clean up blob URL
        if (window.currentLiveServerUrl) {
            URL.revokeObjectURL(window.currentLiveServerUrl);
            window.currentLiveServerUrl = null;
        }
        
        // Close WebSocket if exists
        if (liveReloadSocket) {
            liveReloadSocket.close();
            liveReloadSocket = null;
        }
        
        // Update UI
        updateServerStatus(false);
        
        // Log success
        logToConsole('info', '🛑 Live server stopped');
        logToConsole('info', '✅ All resources cleaned up');
        
    } catch (err) {
        logToConsole('error', '❌ Error stopping live server: ' + err.message);
    }
}

// Find available port (simulated)
function findAvailablePort() {
    return new Promise((resolve) => {
        // In a real implementation, this would check for available ports
        // For demo purposes, we'll use a random port between 3000-9000
        const port = Math.floor(Math.random() * 6000) + 3000;
        setTimeout(() => resolve(port), 100);
    });
}

// Create live server HTML with enhanced features
function createLiveServerHTML(html, css, js) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Server Preview - TodoList IDE</title>
    <style>
        /* Live Server Status Bar */
        .live-server-bar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(90deg, #4CAF50, #45a049);
            color: white;
            padding: 8px 16px;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 999999;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .live-server-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .live-indicator {
            width: 8px;
            height: 8px;
            background: #fff;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .live-actions {
            display: flex;
            gap: 10px;
            font-size: 12px;
        }
        
        .live-btn {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
        }
        
        .live-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        /* Content wrapper to account for status bar */
        .live-content {
            margin-top: 45px;
        }
        
        /* User CSS */
        ${css}
    </style>
</head>
<body>
    <!-- Live Server Status Bar -->
    <div class="live-server-bar">
        <div class="live-server-info">
            <div class="live-indicator"></div>
            <span>🔴 TodoList IDE Live Server</span>
            <span style="opacity: 0.8;">Port ${Math.floor(Math.random() * 6000) + 3000}</span>
        </div>
        <div class="live-actions">
            <button class="live-btn" onclick="window.location.reload()">🔄 Refresh</button>
            <button class="live-btn" onclick="console.log('Live Server Active')">📝 Console</button>
        </div>
    </div>
    
    <!-- Main Content -->
    <div class="live-content">
        ${html}
    </div>
    
    <!-- Live Server Scripts -->
    <script>
        // Live Server Console
        console.log('🚀 TodoList IDE Live Server Active');
        console.log('🔄 Auto-reload enabled');
        console.log('💡 Make changes in the IDE to see live updates');
        
        // Enhanced console logging
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = function(...args) {
            originalLog.apply(console, ['[Live Server]', ...args]);
        };
        
        console.error = function(...args) {
            originalError.apply(console, ['[Live Server Error]', ...args]);
        };
        
        console.warn = function(...args) {
            originalWarn.apply(console, ['[Live Server Warning]', ...args]);
        };
        
        // Live reload listener
        let lastUpdate = Date.now();
        
        function checkForUpdates() {
            // Listen for messages from parent IDE
            window.addEventListener('message', function(event) {
                if (event.data && event.data.type === 'live-reload') {
                    console.log('🔄 Live reload triggered - refreshing...');
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                }
            });
        }
        
        // Initialize live reload
        checkForUpdates();
        
        // User JavaScript
        try {
            ${js}
        } catch (error) {
            console.error('JavaScript Error:', error);
        }
        
        // Live server ready notification
        console.log('✅ Live Server ready - Happy coding!');
    </script>
</body>
</html>`;
}

// Create server blob with current code (legacy support)
function createServerBlob() {
    const html = document.getElementById('htmlCode').value;
    const css = document.getElementById('cssCode').value;
    const js = document.getElementById('jsCode').value;
    
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Server Preview</title>
    <style>
        /* Live Server Styles */
        body { margin: 0; padding: 0; }
        .live-server-indicator {
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0, 255, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-family: Arial, sans-serif;
            z-index: 999999;
            animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* User CSS */
        ${css}
    </style>
</head>
<body>
    <!-- Live Server Indicator -->
    <div class="live-server-indicator">🔴 Live Server Active</div>
    
    <!-- User HTML -->
    ${html}
    
    <!-- Live Reload Script -->
    <script>
        // Live reload functionality
        let reloadCheckInterval;
        let lastModified = Date.now();
        
        function checkForReload() {
            // In a real server, this would check file modification times
            // For demo, we'll simulate periodic checks
            try {
                if (window.parent && window.parent.postMessage) {
                    window.parent.postMessage({type: 'live-reload-check'}, '*');
                }
            } catch(e) {
                // Handle cross-origin issues
            }
        }
        
        // Start checking for changes
        reloadCheckInterval = setInterval(checkForReload, 1000);
        
        // Listen for reload signals
        window.addEventListener('message', function(event) {
            if (event.data.type === 'live-reload') {
                console.log('🔄 Live reload triggered');
                window.location.reload();
            }
        });
        
        // User JavaScript
        try {
            ${js}
        } catch (error) {
            console.error('JavaScript Error:', error);
        }
    </script>
</body>
</html>`;
    
    return new Blob([fullHTML], { type: 'text/html' });
}

// Setup live reload functionality
function setupLiveReload() {
    // Listen for code changes
    ['htmlCode', 'cssCode', 'jsCode'].forEach(id => {
        const editor = document.getElementById(id);
        if (editor) {
            editor.addEventListener('input', debounce(triggerLiveReload, 1000));
        }
    });
}

// Trigger live reload
function triggerLiveReload() {
    if (!isServerRunning) return;
    
    try {
        // Update the main preview frame
        updatePreview();
        
        // Update the live server window if it's open
        if (window.liveServerWindow && !window.liveServerWindow.closed) {
            // Create new HTML with current code
            const html = document.getElementById('htmlCode').value;
            const css = document.getElementById('cssCode').value;
            const js = document.getElementById('jsCode').value;
            
            const newHTML = createLiveServerHTML(html, css, js);
            
            // Create new blob URL
            const newBlob = new Blob([newHTML], { type: 'text/html' });
            const newBlobUrl = URL.createObjectURL(newBlob);
            
            // Clean up old blob URL
            if (window.currentLiveServerUrl) {
                URL.revokeObjectURL(window.currentLiveServerUrl);
            }
            
            // Update current URL
            window.currentLiveServerUrl = newBlobUrl;
            
            // Navigate the live server window to new content
            window.liveServerWindow.location.href = newBlobUrl;
            
            logToConsole('info', '🔄 Live reload triggered - window updated');
        }
        
        // Also try to message the preview frame
        const previewFrame = document.getElementById('previewFrame');
        if (previewFrame && previewFrame.contentWindow) {
            try {
                previewFrame.contentWindow.postMessage({type: 'live-reload'}, '*');
            } catch(e) {
                // Handle cross-origin issues silently
            }
        }
        
    } catch (error) {
        logToConsole('error', '❌ Live reload error: ' + error.message);
    }
}

// Update server status UI
function updateServerStatus(running) {
    isServerRunning = running;
    const liveServerBtn = document.getElementById('liveServerBtn');
    const serverIndicator = document.getElementById('serverIndicator');
    const serverText = document.getElementById('serverText');
    const serverPort = document.getElementById('serverPort');
    const openBrowserBtn = document.getElementById('openBrowserBtn');
    const copyUrlBtn = document.getElementById('copyUrlBtn');
    
    if (running) {
        liveServerBtn.textContent = '🟢 Go Live';
        liveServerBtn.classList.add('active');
        serverIndicator.classList.remove('offline');
        serverIndicator.classList.add('online');
        serverText.textContent = 'Server Running';
        serverPort.textContent = `Port: ${serverPort}`;
        openBrowserBtn.disabled = false;
        copyUrlBtn.disabled = false;
    } else {
        liveServerBtn.textContent = '🔴 Go Live';
        liveServerBtn.classList.remove('active');
        serverIndicator.classList.remove('online');
        serverIndicator.classList.add('offline');
        serverText.textContent = 'Server Offline';
        serverPort.textContent = '';
        openBrowserBtn.disabled = true;
        copyUrlBtn.disabled = true;
    }
}

// Open in browser
function openInBrowser() {
    if (isServerRunning) {
        try {
            if (window.currentLiveServerUrl) {
                // If we already have a live server running, open that URL
                const newWindow = window.open(window.currentLiveServerUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                
                if (newWindow) {
                    logToConsole('info', '🌐 Opened live server in new browser window');
                } else {
                    logToConsole('warn', '⚠️ Popup blocked - please allow popups and try again');
                }
            } else {
                // Create a new live server instance
                const html = document.getElementById('htmlCode').value;
                const css = document.getElementById('cssCode').value;
                const js = document.getElementById('jsCode').value;
                
                const fullHTML = createLiveServerHTML(html, css, js);
                const blob = new Blob([fullHTML], { type: 'text/html' });
                const blobUrl = URL.createObjectURL(blob);
                
                const newWindow = window.open(blobUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                
                if (newWindow) {
                    logToConsole('info', '🌐 Opened preview in new browser window');
                } else {
                    logToConsole('warn', '⚠️ Popup blocked - please allow popups and try again');
                }
                
                // Clean up the blob URL after a delay
                setTimeout(() => {
                    URL.revokeObjectURL(blobUrl);
                }, 5000);
            }
        } catch (error) {
            logToConsole('error', '❌ Failed to open in browser: ' + error.message);
        }
    } else {
        logToConsole('warn', '⚠️ Live server is not running. Please start the server first.');
    }
}

// Copy server URL
function copyServerUrl() {
    if (isServerRunning) {
        const urlToCopy = window.currentLiveServerUrl || 'Live Server Active';
        
        try {
            navigator.clipboard.writeText(urlToCopy).then(() => {
                logToConsole('info', `✅ Server info copied to clipboard`);
                
                // Show temporary feedback
                const copyBtn = document.getElementById('copyUrlBtn');
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✓ Copied!';
                copyBtn.style.background = 'rgba(0, 255, 0, 0.3)';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.background = '';
                }, 2000);
            }).catch(err => {
                logToConsole('error', '❌ Failed to copy: ' + err.message);
                
                // Fallback: show the URL in console
                logToConsole('info', `Live Server URL: ${urlToCopy}`);
            });
        } catch (err) {
            logToConsole('error', '❌ Clipboard not supported: ' + err.message);
            logToConsole('info', `Live Server URL: ${urlToCopy}`);
        }
    } else {
        logToConsole('warn', '⚠️ Live server is not running');
    }
}

// Enhanced preview update with live server support
function updatePreviewWithLiveServer() {
    updatePreview();
    
    if (isServerRunning) {
        triggerLiveReload();
    }
}

// Initialize live server status
function initializeLiveServer() {
    updateServerStatus(false);
}

// Call initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeLiveServer();
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 's':
                e.preventDefault();
                showSaveModal();
                break;
            case 'r':
                e.preventDefault();
                runCode();
                break;
            case 'n':
                e.preventDefault();
                newFile();
                break;
            case 'l':
                e.preventDefault();
                toggleLiveServer();
                break;
        }
    }
});

// Initialize on load
window.addEventListener('load', function() {
    // Auto-update preview for web development
    updatePreview();
});