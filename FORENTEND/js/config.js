// API Configuration for TodoList App
// This file centralizes all API endpoints

// PRODUCTION - Use when deployed
const API_CONFIG = {
    AUTH_URL: 'https://todolist-auth-server.onrender.com',
    TASKS_URL: 'https://todolist-tasks-server.onrender.com'
};

// DEVELOPMENT - Uncomment for local testing
// const API_CONFIG = {
//     AUTH_URL: 'http://localhost:3000',
//     TASKS_URL: 'http://localhost:3001'
// };

// Helper function to detect environment
function getApiUrls() {
    // Auto-detect based on hostname
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    
    if (isLocal) {
        return {
            AUTH_URL: 'http://localhost:3000',
            TASKS_URL: 'http://localhost:3001'
        };
    }
    
    // Production URLs
    return {
        AUTH_URL: 'https://todolist-auth-server.onrender.com',
        TASKS_URL: 'https://todolist-tasks-server.onrender.com'
    };
}

// You can use either API_CONFIG or getApiUrls()
// Uncomment the one you prefer:

// Option 1: Manual configuration
// const { AUTH_URL, TASKS_URL } = API_CONFIG;

// Option 2: Auto-detection
const { AUTH_URL, TASKS_URL } = getApiUrls();

console.log('🔧 API Configuration:', { AUTH_URL, TASKS_URL });
