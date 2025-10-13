const express = require('express');
const path = require('path');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const fs = require('fs');

class LiveServer {
    constructor(options = {}) {
        this.port = options.port || 3000;
        this.root = options.root || process.cwd();
        this.app = express();
        this.server = null;
        this.wss = null;
        this.watchers = [];
    }

    start() {
        return new Promise((resolve, reject) => {
            // Serve static files
            this.app.use(express.static(this.root));
            
            // Inject live reload script into HTML files
            this.app.get('*.html', (req, res, next) => {
                const filePath = path.join(this.root, req.path);
                
                if (fs.existsSync(filePath)) {
                    fs.readFile(filePath, 'utf8', (err, data) => {
                        if (err) {
                            return next(err);
                        }
                        
                        // Inject live reload script
                        const liveReloadScript = `
                        <script>
                            (function() {
                                const ws = new WebSocket('ws://localhost:${this.port + 1}');
                                ws.onmessage = function(event) {
                                    if (event.data === 'reload') {
                                        window.location.reload();
                                    }
                                };
                                ws.onopen = function() {
                                    console.log('📡 Live reload connected');
                                };
                                ws.onclose = function() {
                                    console.log('📡 Live reload disconnected');
                                    // Try to reconnect after 1 second
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 1000);
                                };
                            })();
                        </script>`;
                        
                        // Insert script before closing </body> tag
                        const modifiedData = data.replace('</body>', liveReloadScript + '</body>');
                        res.send(modifiedData);
                    });
                } else {
                    next();
                }
            });
            
            // Fallback to index.html for SPA routing
            this.app.get('*', (req, res) => {
                res.sendFile(path.join(this.root, 'index.html'));
            });

            // Start HTTP server
            this.server = this.app.listen(this.port, () => {
                console.log(`🚀 Live Server running on http://localhost:${this.port}`);
                console.log(`📁 Serving: ${this.root}`);
                
                // Start WebSocket server for live reload
                this.startWebSocketServer();
                
                // Start file watching
                this.startFileWatching();
                
                resolve(`http://localhost:${this.port}`);
            });

            this.server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log(`Port ${this.port} is busy, trying ${this.port + 1}...`);
                    this.port += 1;
                    this.start().then(resolve).catch(reject);
                } else {
                    reject(err);
                }
            });
        });
    }

    startWebSocketServer() {
        const wsPort = this.port + 1;
        this.wss = new WebSocket.Server({ port: wsPort });
        
        this.wss.on('connection', (ws) => {
            console.log('📡 Client connected to live reload');
            
            ws.on('close', () => {
                console.log('📡 Client disconnected from live reload');
            });
        });

        console.log(`📡 WebSocket server running on ws://localhost:${wsPort}`);
    }

    startFileWatching() {
        const watchPaths = [
            path.join(this.root, '**/*.html'),
            path.join(this.root, '**/*.css'),
            path.join(this.root, '**/*.js'),
            path.join(this.root, '**/*.json')
        ];

        const watcher = chokidar.watch(watchPaths, {
            ignored: /node_modules/,
            persistent: true,
            ignoreInitial: true
        });

        watcher.on('change', (filePath) => {
            console.log(`📝 File changed: ${path.relative(this.root, filePath)}`);
            this.broadcast('reload');
        });

        watcher.on('add', (filePath) => {
            console.log(`📄 File added: ${path.relative(this.root, filePath)}`);
            this.broadcast('reload');
        });

        watcher.on('unlink', (filePath) => {
            console.log(`🗑️  File deleted: ${path.relative(this.root, filePath)}`);
            this.broadcast('reload');
        });

        this.watchers.push(watcher);
        console.log('👀 Watching for file changes...');
    }

    broadcast(message) {
        if (this.wss) {
            this.wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    }

    stop() {
        return new Promise((resolve) => {
            console.log('🛑 Stopping live server...');
            
            // Close file watchers
            this.watchers.forEach(watcher => watcher.close());
            this.watchers = [];
            
            // Close WebSocket server
            if (this.wss) {
                this.wss.close();
                this.wss = null;
            }
            
            // Close HTTP server
            if (this.server) {
                this.server.close(() => {
                    console.log('✅ Live server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

// CLI Usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const port = parseInt(args.find(arg => arg.startsWith('--port=')))?.split('=')[1] || 3000;
    const root = args.find(arg => arg.startsWith('--root='))?.split('=')[1] || process.cwd();
    
    const server = new LiveServer({ port, root });
    
    server.start()
        .then(url => {
            console.log(`\n🎉 Live Server Started Successfully!`);
            console.log(`🌐 Local: ${url}`);
            console.log(`📂 Root: ${root}`);
            console.log(`\n💡 Press Ctrl+C to stop the server\n`);
        })
        .catch(err => {
            console.error('❌ Failed to start server:', err.message);
            process.exit(1);
        });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down live server...');
        server.stop().then(() => {
            process.exit(0);
        });
    });
}

module.exports = LiveServer;