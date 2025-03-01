// Import Swagger options
import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

// Swagger definition
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'School Management System API',
        version: '1.0.0',
        description: 'API documentation for the School Management System',
        license: {
            name: 'Licensed Under MIT',
            url: 'https://spdx.org/licenses/MIT.html',
        },
        contact: {
            name: 'School Management System',
            url: 'https://school-management-system.example.com',
        },
    },
    servers: [
        {
            url: 'http://localhost:3000/api/v1',
            description: 'Development server',
        },
        {
            url: 'https://api.school-management-system.example.com/v1',
            description: 'Production server',
        }
    ],
    tags: [
        {
            name: 'Authentication',
            description: 'API endpoints for user authentication and authorization including registration, login, and session management.',
        },
        {
            name: 'Students',
            description: 'API endpoints for managing student data',
        },
        {
            name: 'Teachers',
            description: 'API endpoints for managing teacher data',
        },
        {
            name: 'Classes',
            description: 'API endpoints for managing classes',
        },
        {
            name: 'Exams',
            description: 'API endpoints for managing exams and results',
        },
        {
            name: 'Academic Years',
            description: 'API endpoints for managing academic years',
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT token obtained from the login endpoint. Valid for 24 hours.'
            }
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    error: {
                        type: 'string',
                        description: 'Error message',
                        example: 'Invalid credentials'
                    }
                }
            }
        }
    },
    security: [
        {
            bearerAuth: []
        }
    ]
};

// Options for the swagger docs
const options = {
    swaggerDefinition,
    // Path to the API docs - include all route files
    apis: [
        './src/api/v1/routes/*.ts',
        './src/api/v1/controllers/*.ts',
        './src/api/v1/middleware/*.ts',
        './src/api/v1/swagger/*.ts'  // Include schema definitions
    ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Ensure output directory exists
const outputDirectory = path.join(__dirname, '../swagger-output');
if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
}

// Write Swagger JSON file
fs.writeFileSync(
    path.join(outputDirectory, 'swagger-specification.json'),
    JSON.stringify(swaggerSpec, null, 2)
);

console.log('Swagger documentation generated successfully!');

// Export the Swagger specification
export default swaggerSpec; 