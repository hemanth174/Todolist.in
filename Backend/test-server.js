// Simple test server to verify everything works
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Server is working!',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`✅ Test server running on http://localhost:${PORT}`);
    console.log(`🔍 Test endpoint: http://localhost:${PORT}/test`);
});