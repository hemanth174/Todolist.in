@echo off
echo Starting TodoList JSON Server...
cd /d "C:\Users\heman\OneDrive\Desktop\TodoList\Backend"
echo Current directory: %CD%
echo Starting server on http://localhost:3001
node json-server.js
pause