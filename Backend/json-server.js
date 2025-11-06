const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read database
function readDB() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        return { tasks: [], projects: [], users: [], categories: [] };
    }
}

// Helper function to write database
function writeDB(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing database:', error);
        return false;
    }
}

// Helper function to generate ID
function generateId(items) {
    return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
}

// ===================== TASKS ENDPOINTS =====================

// GET all tasks (FILTERED BY USER)
app.get('/api/tasks', (req, res) => {
    const db = readDB();
    const { status, priority, assignee, search, userId } = req.query;
    
    let tasks = db.tasks;
    
    // ⚠️ CRITICAL SECURITY FIX: Filter by userId if provided
    // Each user should ONLY see their own tasks
    if (userId) {
        tasks = tasks.filter(task => task.userId === userId || task.userId === userId.toString());
    } else {
        // If no userId provided, return empty array for security
        console.warn('⚠️ Security Warning: Tasks requested without userId filter');
        return res.json({
            success: true,
            data: [],
            total: 0,
            message: 'userId parameter is required'
        });
    }
    
    // Filter by status
    if (status) {
        tasks = tasks.filter(task => task.status === status);
    }
    
    // Filter by priority
    if (priority) {
        tasks = tasks.filter(task => task.priority === priority);
    }
    
    // Filter by assignee
    if (assignee) {
        tasks = tasks.filter(task => task.assignee === assignee);
    }
    
    // Search in title and description
    if (search) {
        const searchLower = search.toLowerCase();
        tasks = tasks.filter(task => 
            task.title.toLowerCase().includes(searchLower) ||
            task.description.toLowerCase().includes(searchLower) ||
            (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
    }
    
    res.json({
        success: true,
        data: tasks,
        total: tasks.length
    });
});

// GET single task
app.get('/api/tasks/:id', (req, res) => {
    const db = readDB();
    const { userId } = req.query;
    const task = db.tasks.find(t => t.id === parseInt(req.params.id));
    
    if (!task) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }
    
    // ⚠️ SECURITY CHECK: Verify user owns this task
    if (userId && task.userId && task.userId !== userId && task.userId !== userId.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Unauthorized: You do not have permission to view this task'
        });
    }
    
    res.json({
        success: true,
        data: task
    });
});

// POST new task
app.post('/api/tasks', (req, res) => {
    const db = readDB();
    const { title, description, priority, dueDate, tags, assignee, status, projectId, userId } = req.body;
    
    // Validation
    if (!title || !description) {
        return res.status(400).json({
            success: false,
            message: 'Title and description are required'
        });
    }
    
    // ⚠️ SECURITY CHECK: userId is required for task creation
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'userId is required to create a task'
        });
    }
    
    const newTask = {
        id: generateId(db.tasks),
        title,
        description,
        priority: priority || 'medium',
        status: status || 'todo',
        dueDate: dueDate || null,
        tags: tags || [],
        assignee: assignee || 'John Doe',
        projectId: projectId || null,
        userId: userId.toString(), // ⚠️ Store userId with task
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null
    };
    
    db.tasks.push(newTask);
    
    if (writeDB(db)) {
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: newTask
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Failed to create task'
        });
    }
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
    const db = readDB();
    const { userId } = req.body;
    const taskIndex = db.tasks.findIndex(t => t.id === parseInt(req.params.id));
    
    if (taskIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }
    
    const existingTask = db.tasks[taskIndex];
    
    // ⚠️ SECURITY CHECK: Verify user owns this task
    if (userId && existingTask.userId && existingTask.userId !== userId && existingTask.userId !== userId.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Unauthorized: You do not have permission to update this task'
        });
    }
    
    const { title, description, priority, dueDate, tags, assignee, status, progress } = req.body;
    
    // Update task fields (preserve userId)
    const updatedTask = {
        ...existingTask,
        title: title || existingTask.title,
        description: description || existingTask.description,
        priority: priority || existingTask.priority,
        status: status || existingTask.status,
        dueDate: dueDate !== undefined ? dueDate : existingTask.dueDate,
        tags: tags || existingTask.tags,
        assignee: assignee || existingTask.assignee,
        progress: progress !== undefined ? progress : existingTask.progress,
        userId: existingTask.userId, // ⚠️ Preserve original userId
        updatedAt: new Date().toISOString(),
        completedAt: status === 'completed' ? new Date().toISOString() : existingTask.completedAt
    };
    
    db.tasks[taskIndex] = updatedTask;
    
    if (writeDB(db)) {
        res.json({
            success: true,
            message: 'Task updated successfully',
            data: updatedTask
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Failed to update task'
        });
    }
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
    const db = readDB();
    const { userId } = req.query;
    const taskIndex = db.tasks.findIndex(t => t.id === parseInt(req.params.id));
    
    if (taskIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }
    
    const taskToDelete = db.tasks[taskIndex];
    
    // ⚠️ SECURITY CHECK: Verify user owns this task
    if (userId && taskToDelete.userId && taskToDelete.userId !== userId && taskToDelete.userId !== userId.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Unauthorized: You do not have permission to delete this task'
        });
    }
    
    const deletedTask = db.tasks.splice(taskIndex, 1)[0];
    
    if (writeDB(db)) {
        res.json({
            success: true,
            message: 'Task deleted successfully',
            data: deletedTask
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Failed to delete task'
        });
    }
});

// ===================== PROJECTS ENDPOINTS =====================

// GET all projects
app.get('/api/projects', (req, res) => {
    const db = readDB();
    res.json({
        success: true,
        data: db.projects,
        total: db.projects.length
    });
});

// POST new project
app.post('/api/projects', (req, res) => {
    const db = readDB();
    const { name, description, color } = req.body;
    
    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Project name is required'
        });
    }
    
    const newProject = {
        id: generateId(db.projects),
        name,
        description: description || '',
        color: color || '#667eea',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    db.projects.push(newProject);
    
    if (writeDB(db)) {
        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: newProject
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Failed to create project'
        });
    }
});

// ===================== USERS ENDPOINTS =====================

// GET all users
app.get('/api/users', (req, res) => {
    const db = readDB();
    res.json({
        success: true,
        data: db.users,
        total: db.users.length
    });
});

// ===================== CATEGORIES ENDPOINTS =====================

// GET all categories
app.get('/api/categories', (req, res) => {
    const db = readDB();
    res.json({
        success: true,
        data: db.categories,
        total: db.categories.length
    });
});

// ===================== STATISTICS ENDPOINTS =====================

// GET dashboard statistics (FILTERED BY USER)
app.get('/api/stats/dashboard', (req, res) => {
    const db = readDB();
    const { userId } = req.query;
    
    // ⚠️ SECURITY: Only return stats for the specific user
    let tasks = db.tasks;
    if (userId) {
        tasks = tasks.filter(t => t.userId === userId || t.userId === userId.toString());
    } else {
        // No userId provided - return empty stats
        return res.json({
            success: true,
            data: {
                total: 0,
                todo: 0,
                inProgress: 0,
                review: 0,
                completed: 0,
                overdue: 0,
                completionRate: 0
            }
        });
    }
    
    const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        overdue: tasks.filter(t => {
            if (!t.dueDate) return false;
            return new Date(t.dueDate) < new Date() && t.status !== 'completed';
        }).length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
    };
    
    res.json({
        success: true,
        data: stats
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'TodoList JSON Server is running!',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 TodoList JSON Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📝 Tasks API: http://localhost:${PORT}/api/tasks`);
    console.log(`📁 Projects API: http://localhost:${PORT}/api/projects`);
    console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
    console.log(`📂 Categories API: http://localhost:${PORT}/api/categories`);
    console.log(`📈 Stats API: http://localhost:${PORT}/api/stats/dashboard`);
});