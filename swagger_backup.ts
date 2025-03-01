import swaggerJsdoc from 'swagger-jsdoc';

// Instead of importing from package.json, let's hardcode the version
const version = '1.0.0';

// Swagger options
const options = {
    openapi: '3.0.0',
    info: {
        title: 'School Management System API',
        version,
        description: 'API for School Management System including authentication, academic year, subjects, exams, and mobile integrations',
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
        },
        contact: {
            name: 'API Support',
            url: 'https://www.schoolmanagementsystem.com/support',
            email: 'support@schoolmanagementsystem.com',
        },
    },
    servers: [
        {
            url: '/api/v1',
            description: 'Development server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    error: {
                        type: 'string',
                    },
                },
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
    apis: [
        './src/api/v1/routes/auth.routes.ts',
        './src/api/v1/routes/academicYear.routes.ts',
        './src/api/v1/routes/subject.routes.ts',
        './src/api/v1/routes/exam.routes.ts',
        './src/api/v1/routes/mobile.routes.ts',
        './src/config/swagger/schemas/*.ts',
        './src/api/v1/routes/docs/swagger/*.yaml'
    ],
};

// Generate the Swagger specification
const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 