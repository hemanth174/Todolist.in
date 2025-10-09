# TodoList JSON Server API

## How to Run

1. **Start the JSON Server:**
   ```bash
   cd Backend
   npm run json-server
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run json-dev
   ```

2. **The server will run on:** `http://localhost:3001`

## API Endpoints

### Health Check
- **GET** `/health` - Check if server is running

### Tasks
- **GET** `/api/tasks` - Get all tasks
- **GET** `/api/tasks?status=todo` - Filter tasks by status
- **GET** `/api/tasks?priority=high` - Filter tasks by priority  
- **GET** `/api/tasks?search=keyword` - Search tasks
- **GET** `/api/tasks/:id` - Get single task
- **POST** `/api/tasks` - Create new task
- **PUT** `/api/tasks/:id` - Update task
- **DELETE** `/api/tasks/:id` - Delete task

### Projects
- **GET** `/api/projects` - Get all projects
- **POST** `/api/projects` - Create new project

### Users
- **GET** `/api/users` - Get all users

### Categories  
- **GET** `/api/categories` - Get all categories

### Statistics
- **GET** `/api/stats/dashboard` - Get dashboard statistics

## Example API Calls

### Create Task
```javascript
fetch('http://localhost:3001/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'My Task',
    description: 'Task description',
    priority: 'high',
    status: 'todo',
    dueDate: '2025-10-15',
    tags: ['work', 'urgent'],
    assignee: 'John Doe'
  })
})
```

### Update Task Status
```javascript
fetch('http://localhost:3001/api/tasks/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'completed'
  })
})
```

### Search Tasks
```javascript
fetch('http://localhost:3001/api/tasks?search=urgent&status=todo')
```

## Features

✅ **CRUD Operations** - Create, Read, Update, Delete tasks  
✅ **Filtering** - Filter by status, priority, assignee  
✅ **Search** - Full-text search in title, description, tags  
✅ **Statistics** - Dashboard analytics and metrics  
✅ **Offline Support** - Local storage fallback  
✅ **Real-time Sync** - Automatic synchronization  
✅ **Error Handling** - Robust error handling and recovery  

## Task Data Structure

```json
{
  "id": 1,
  "title": "Task Title",
  "description": "Task description",
  "priority": "high|medium|low",
  "status": "todo|progress|review|completed", 
  "dueDate": "2025-10-15",
  "tags": ["tag1", "tag2"],
  "assignee": "John Doe",
  "progress": 75,
  "createdAt": "2025-10-09T10:00:00.000Z",
  "updatedAt": "2025-10-09T10:00:00.000Z",
  "completedAt": null
}
```

## Frontend Integration

The WorkSpace.html now includes:
- TaskManager class for API communication
- Automatic task loading on page load
- Real-time updates when tasks are created/updated/deleted
- Offline mode with local storage backup
- Drag & drop with API sync
- Search integration with API
- Error handling and user notifications

## Testing the API

You can test the API using:
- Browser DevTools Console
- Postman or similar API testing tools
- The integrated frontend WorkSpace

## Troubleshooting

1. **Server not starting:** Make sure port 3001 is available
2. **CORS errors:** The server includes CORS middleware for frontend access
3. **Data not persisting:** Check if db.json file is writable
4. **Offline mode:** Tasks are stored locally if API is unavailable