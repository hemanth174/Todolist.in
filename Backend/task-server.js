const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todolist';

mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ===================== MONGOOSE SCHEMAS =====================

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['todo', 'progress', 'review', 'completed'], default: 'todo' },
    dueDate: { type: Date, default: null },
    tags: [String],
    assignee: { type: String, default: 'John Doe' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedAt: { type: Date, default: null },
    userId: { type: String, required: true } // Link to auth user
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt
});

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    color: { type: String, default: '#667eea' },
    userId: { type: String, required: true }
}, { 
    timestamps: true 
});

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    color: { type: String, default: '#667eea' },
    userId: { type: String, required: true }
}, { 
    timestamps: true 
});

// Create Models
const Task = mongoose.model('Task', TaskSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Category = mongoose.model('Category', CategorySchema);

// ===================== TASKS ENDPOINTS =====================

// GET all tasks (with filters)
app.get('/api/tasks', async (req, res) => {
    try {
        const { status, priority, assignee, search, userId } = req.query;
        
        let filter = {};
        
        // Filter by userId (IMPORTANT for multi-user)
        if (userId) filter.userId = userId;
        
        // Filter by status
        if (status) filter.status = status;
        
        // Filter by priority
        if (priority) filter.priority = priority;
        
        // Filter by assignee
        if (assignee) filter.assignee = assignee;
        
        // Search in title, description, and tags
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: tasks,
            total: tasks.length
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: error.message
        });
    }
});

// GET single task
app.get('/api/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
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
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task',
            error: error.message
        });
    }
});

// POST new task
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, description, priority, dueDate, tags, assignee, status, projectId, userId } = req.body;
        
        // Validation
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }
        
        const newTask = new Task({
            title,
            description,
            priority: priority || 'medium',
            status: status || 'todo',
            dueDate: dueDate || null,
            tags: tags || [],
            assignee: assignee || 'Unassigned',
            projectId: projectId || null,
            progress: 0,
            userId,
            completedAt: null
        });
        
        const savedTask = await newTask.save();
        
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: savedTask
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create task',
            error: error.message
        });
    }
});

// PUT update task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { title, description, priority, dueDate, tags, assignee, status, progress } = req.body;
        
        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (priority) updateData.priority = priority;
        if (status) updateData.status = status;
        if (dueDate !== undefined) updateData.dueDate = dueDate;
        if (tags) updateData.tags = tags;
        if (assignee) updateData.assignee = assignee;
        if (progress !== undefined) updateData.progress = progress;
        
        // Mark as completed if status is completed
        if (status === 'completed') {
            updateData.completedAt = new Date();
        }
        
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Task updated successfully',
            data: updatedTask
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task',
            error: error.message
        });
    }
});

// DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        
        if (!deletedTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Task deleted successfully',
            data: deletedTask
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete task',
            error: error.message
        });
    }
});

// ===================== PROJECTS ENDPOINTS =====================

// GET all projects
app.get('/api/projects', async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { userId } : {};
        const projects = await Project.find(filter).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: projects,
            total: projects.length
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects',
            error: error.message
        });
    }
});

// POST new project
app.post('/api/projects', async (req, res) => {
    try {
        const { name, description, color, userId } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Project name is required'
            });
        }
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }
        
        const newProject = new Project({
            name,
            description: description || '',
            color: color || '#667eea',
            userId
        });
        
        const savedProject = await newProject.save();
        
        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: savedProject
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create project',
            error: error.message
        });
    }
});

// ===================== CATEGORIES ENDPOINTS =====================

// GET all categories
app.get('/api/categories', async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { userId } : {};
        const categories = await Category.find(filter).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: categories,
            total: categories.length
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
});

// POST new category
app.post('/api/categories', async (req, res) => {
    try {
        const { name, color, userId } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }
        
        const newCategory = new Category({
            name,
            color: color || '#667eea',
            userId
        });
        
        const savedCategory = await newCategory.save();
        
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: savedCategory
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: error.message
        });
    }
});

// ===================== STATISTICS ENDPOINTS =====================

// GET dashboard statistics
app.get('/api/stats/dashboard', async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { userId } : {};
        
        const tasks = await Task.find(filter);
        
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
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'TodoList MongoDB Task Server is running!',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
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
    console.log(`🚀 TodoList MongoDB Task Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📝 Tasks API: http://localhost:${PORT}/api/tasks`);
    console.log(`📁 Projects API: http://localhost:${PORT}/api/projects`);
    console.log(`📂 Categories API: http://localhost:${PORT}/api/categories`);
    console.log(`📈 Stats API: http://localhost:${PORT}/api/stats/dashboard`);
});
