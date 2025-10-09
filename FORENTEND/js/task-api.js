// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// API Helper Class
class TaskAPI {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // ===================== TASKS METHODS =====================

    // Get all tasks with optional filters
    async getTasks(filters = {}) {
        const queryParams = new URLSearchParams();
        
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                queryParams.append(key, filters[key]);
            }
        });
        
        const queryString = queryParams.toString();
        const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;
        
        return this.request(endpoint);
    }

    // Get single task by ID
    async getTask(id) {
        return this.request(`/tasks/${id}`);
    }

    // Create new task
    async createTask(taskData) {
        return this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
        });
    }

    // Update existing task
    async updateTask(id, taskData) {
        return this.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(taskData),
        });
    }

    // Delete task
    async deleteTask(id) {
        return this.request(`/tasks/${id}`, {
            method: 'DELETE',
        });
    }

    // ===================== PROJECTS METHODS =====================

    // Get all projects
    async getProjects() {
        return this.request('/projects');
    }

    // Create new project
    async createProject(projectData) {
        return this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData),
        });
    }

    // ===================== USERS METHODS =====================

    // Get all users
    async getUsers() {
        return this.request('/users');
    }

    // ===================== CATEGORIES METHODS =====================

    // Get all categories
    async getCategories() {
        return this.request('/categories');
    }

    // ===================== STATISTICS METHODS =====================

    // Get dashboard statistics
    async getDashboardStats() {
        return this.request('/stats/dashboard');
    }

    // ===================== UTILITY METHODS =====================

    // Check server health
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return { success: false, message: 'Server unavailable' };
        }
    }

    // Search tasks
    async searchTasks(searchTerm) {
        return this.getTasks({ search: searchTerm });
    }

    // Get tasks by status
    async getTasksByStatus(status) {
        return this.getTasks({ status });
    }

    // Get tasks by priority
    async getTasksByPriority(priority) {
        return this.getTasks({ priority });
    }

    // Get tasks by assignee
    async getTasksByAssignee(assignee) {
        return this.getTasks({ assignee });
    }
}

// Create global instance
const taskAPI = new TaskAPI();

// Enhanced Task Manager with API integration
class TaskManager {
    constructor() {
        this.api = taskAPI;
        this.tasks = [];
        this.isOnline = true;
    }

    // Initialize and load tasks
    async initialize() {
        try {
            await this.checkConnection();
            if (this.isOnline) {
                await this.loadTasks();
                console.log('✅ TaskManager initialized with API connection');
            } else {
                console.warn('⚠️ TaskManager initialized in offline mode');
                this.loadTasksFromStorage();
            }
        } catch (error) {
            console.error('❌ Failed to initialize TaskManager:', error);
            this.isOnline = false;
            this.loadTasksFromStorage();
        }
    }

    // Check API connection
    async checkConnection() {
        try {
            const health = await this.api.healthCheck();
            this.isOnline = health.success;
            return this.isOnline;
        } catch (error) {
            this.isOnline = false;
            return false;
        }
    }

    // Load tasks from API
    async loadTasks() {
        try {
            const response = await this.api.getTasks();
            this.tasks = response.data || [];
            this.saveTasksToStorage();
            return this.tasks;
        } catch (error) {
            console.error('Failed to load tasks from API:', error);
            this.loadTasksFromStorage();
            throw error;
        }
    }

    // Create new task
    async createTask(taskData) {
        try {
            if (this.isOnline) {
                const response = await this.api.createTask(taskData);
                const newTask = response.data;
                this.tasks.push(newTask);
                this.saveTasksToStorage();
                return newTask;
            } else {
                // Offline mode - create task locally
                const newTask = {
                    id: Date.now(),
                    ...taskData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    _offline: true
                };
                this.tasks.push(newTask);
                this.saveTasksToStorage();
                return newTask;
            }
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        }
    }

    // Update task
    async updateTask(id, taskData) {
        try {
            if (this.isOnline) {
                const response = await this.api.updateTask(id, taskData);
                const updatedTask = response.data;
                const index = this.tasks.findIndex(t => t.id === id);
                if (index !== -1) {
                    this.tasks[index] = updatedTask;
                }
                this.saveTasksToStorage();
                return updatedTask;
            } else {
                // Offline mode - update locally
                const index = this.tasks.findIndex(t => t.id === id);
                if (index !== -1) {
                    this.tasks[index] = {
                        ...this.tasks[index],
                        ...taskData,
                        updatedAt: new Date().toISOString(),
                        _offline: true
                    };
                    this.saveTasksToStorage();
                    return this.tasks[index];
                }
            }
        } catch (error) {
            console.error('Failed to update task:', error);
            throw error;
        }
    }

    // Delete task
    async deleteTask(id) {
        try {
            if (this.isOnline) {
                await this.api.deleteTask(id);
            }
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasksToStorage();
            return true;
        } catch (error) {
            console.error('Failed to delete task:', error);
            throw error;
        }
    }

    // Get tasks by status
    getTasksByStatus(status) {
        return this.tasks.filter(task => task.status === status);
    }

    // Search tasks
    searchTasks(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.tasks.filter(task => 
            task.title.toLowerCase().includes(term) ||
            task.description.toLowerCase().includes(term) ||
            (task.tags && task.tags.some(tag => tag.toLowerCase().includes(term)))
        );
    }

    // Local storage methods
    saveTasksToStorage() {
        try {
            localStorage.setItem('todolist_tasks', JSON.stringify(this.tasks));
            localStorage.setItem('todolist_last_sync', new Date().toISOString());
        } catch (error) {
            console.error('Failed to save tasks to storage:', error);
        }
    }

    loadTasksFromStorage() {
        try {
            const stored = localStorage.getItem('todolist_tasks');
            this.tasks = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load tasks from storage:', error);
            this.tasks = [];
        }
    }

    // Get dashboard statistics
    getDashboardStats() {
        const stats = {
            total: this.tasks.length,
            todo: this.tasks.filter(t => t.status === 'todo').length,
            inProgress: this.tasks.filter(t => t.status === 'progress').length,
            review: this.tasks.filter(t => t.status === 'review').length,
            completed: this.tasks.filter(t => t.status === 'completed').length,
            overdue: this.tasks.filter(t => {
                if (!t.dueDate) return false;
                return new Date(t.dueDate) < new Date() && t.status !== 'completed';
            }).length
        };

        stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        return stats;
    }

    // Sync offline changes when back online
    async syncOfflineChanges() {
        if (!this.isOnline) return;

        const offlineTasks = this.tasks.filter(task => task._offline);
        
        for (const task of offlineTasks) {
            try {
                if (task.id < 1000000000000) { // Not a timestamp ID, so it's an existing task
                    await this.api.updateTask(task.id, task);
                } else {
                    // Create new task
                    const { id, _offline, ...taskData } = task;
                    await this.api.createTask(taskData);
                }
                
                // Remove offline flag
                delete task._offline;
            } catch (error) {
                console.error('Failed to sync task:', task.id, error);
            }
        }

        await this.loadTasks(); // Refresh from server
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TaskAPI, TaskManager, taskAPI };
}