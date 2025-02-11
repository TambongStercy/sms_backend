// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Import your API routes (you can create an index.ts inside src/api/v1/routes)
import routes from './api/v1/routes';

const app = express();

// Security middleware
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// HTTP request logging
app.use(morgan('dev'));

// Mount API routes under /api/v1
app.use('/api/v1', routes);

// Health-check or root endpoint
app.get('/', (req, res) => {
    res.send('School Management System API is up and running!');
});

export default app;
