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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'TodoList JSON Server is running!',
        timestamp: new Date().toISOString()
    });
});

// GET all tasks
app.get('/api/tasks', (req, res) => {
    const db = readDB();
    const { status, priority, assignee, search } = req.query;
    
    let tasks = db.tasks;
    
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
    const task = db.tasks.find(t => t.id === parseInt(req.params.id));
    
    if (!task) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
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
    const { title, description, priority, dueDate, tags, assignee, status, projectId } = req.body;
    
    // Validation
    if (!title || !description) {
        return res.status(400).json({
            success: false,
            message: 'Title and description are required'
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
    const taskIndex = db.tasks.findIndex(t => t.id === parseInt(req.params.id));
    
    if (taskIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }
    
    const { title, description, priority, dueDate, tags, assignee, status, progress } = req.body;
    const existingTask = db.tasks[taskIndex];
    
    // Update task fields
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
    const taskIndex = db.tasks.findIndex(t => t.id === parseInt(req.params.id));
    
    if (taskIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
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

// GET all users
app.get('/api/users', (req, res) => {
    const db = readDB();
    res.json({
        success: true,
        data: db.users,
        total: db.users.length
    });
});

// GET dashboard statistics
app.get('/api/stats/dashboard', (req, res) => {
    const db = readDB();
    const tasks = db.tasks;
    
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 TodoList JSON Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📝 Tasks API: http://localhost:${PORT}/api/tasks`);
    console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
    console.log(`📈 Stats API: http://localhost:${PORT}/api/stats/dashboard`);
});