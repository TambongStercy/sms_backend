import app from '../src/app';

import dotenv from 'dotenv';
import { AddressInfo } from 'net';
import { scheduleAverageCalculations } from '../src/scripts/scheduledTasks';

// Load environment variables (if not already loaded in app.ts)
dotenv.config();

// Get port from environment variable or use default port (with fallbacks)
const DEFAULT_PORT = 3000;
const PORT = parseInt(process.env.PORT || DEFAULT_PORT.toString(), 10);

// Function to start server with automatic port selection if default is in use
function startServer(port: number) {
    const server = app.listen(port, () => {
        const addressInfo = server.address() as AddressInfo;
        console.log(`Server is running on port ${addressInfo.port}`);
        console.log(`API documentation available at http://localhost:${addressInfo.port}/api-docs`);

        // Start scheduled tasks
        scheduleAverageCalculations();
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

// Start the server
startServer(PORT);

export default app;
