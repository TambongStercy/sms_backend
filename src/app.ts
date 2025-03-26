// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger/swagger';
import path from 'path';
import { convertCamelToSnakeCase, convertSnakeToCamelCase } from './api/v1/middleware/caseConversion.middleware';

// Load environment variables from .env file
dotenv.config();

// Import your API routes (you can create an index.ts inside src/api/v1/routes)
import routes from './api/v1/routes';

const app = express();

// Security middleware - but allow Swagger UI to work correctly
app.use(
    helmet({
        contentSecurityPolicy: false, // This helps with Swagger UI rendering
    })
);

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan('dev'));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Log the number of routes and schemas in Swagger
if (swaggerSpec && swaggerSpec.paths) {
    console.log(`Swagger loaded with ${Object.keys(swaggerSpec.paths).length} endpoints`);
    if (swaggerSpec.components && swaggerSpec.components.schemas) {
        console.log(`Swagger loaded with ${Object.keys(swaggerSpec.components.schemas).length} schemas`);
    }
}

// Setup Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true, // Enable the search functionality
    swaggerOptions: {
        persistAuthorization: true, // Persist authorization data
    },
}));

// Get Swagger JSON
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Apply case conversion middlewares for API routes
// These will convert between camelCase (client-side) and snake_case (server-side)
app.use('/api/v1', convertCamelToSnakeCase, convertSnakeToCamelCase);

// Mount API routes under /api/v1
app.use('/api/v1', routes);

// Health-check or root endpoint
app.get('/', (req, res) => {
    res.send('School Management System API is up and running!');
});

// Health check endpoint for monitoring
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Service is running', version: process.env.npm_package_version || '1.0.0' });
});

export default app;
