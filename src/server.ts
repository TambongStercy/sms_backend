// src/server.ts
import http from 'http';
import app from './app';
import dotenv from 'dotenv';
import { AddressInfo } from 'net';
// import { scheduleAverageCalculations } from './scripts/scheduledTasks';
import { SyncService } from './sync/sync-service';
import { initRealtime } from './realtime/socket';
import { seedChatChannels } from './scripts/seedChatChannels';

// Load environment variables (if not already loaded in app.ts)
dotenv.config();

// Get port from environment variable or use default port (with fallbacks)
const DEFAULT_PORT = 4000;
const PORT = parseInt(process.env.PORT || DEFAULT_PORT.toString(), 10);

// Initialize sync service
const syncService = new SyncService();

// Function to start server with automatic port selection if default is in use
function startServer(port: number) {
    const httpServer = http.createServer(app);
    initRealtime(httpServer);

    const server = httpServer.listen(port, () => {
        const addressInfo = server.address() as AddressInfo;
        if (addressInfo) {
            console.log(`Server is running on port ${addressInfo.port}`);
            console.log(`API documentation available at http://localhost:${addressInfo.port}/api-docs`);
            console.log(`WebSocket (Socket.IO) available at ws://localhost:${addressInfo.port}/socket.io`);
        } else {
            console.log(`Server is running on port ${port}`);
            console.log(`API documentation available at http://localhost:${port}/api-docs`);
        }

        // Start scheduled tasks
        // scheduleAverageCalculations();

        // Initialize sync service
        syncService.initialize().catch(console.error);

        // Seed department / subject chat channels (idempotent)
        seedChatChannels().catch(err => console.error('seedChatChannels failed:', err));
    })
        .on('error', (error: NodeJS.ErrnoException) => {
            if (error.code === 'EACCES') {
                console.log(`Port ${port} requires elevated privileges. Trying port ${port + 1000}...`);
                startServer(port + 1000); // Try a higher port number
            } else if (error.code === 'EADDRINUSE') {
                console.log(`Port ${port} is already in use. Trying port ${port + 1}...`);
                startServer(port + 1); // Try next port
            } else {
                console.error('Server error:', error);
            }
        });
}
console.log("Starting server on port", PORT);
// Start the server
startServer(PORT);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await syncService.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await syncService.shutdown();
  process.exit(0);
});
