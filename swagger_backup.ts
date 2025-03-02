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
        './src/api/v1/routes/authRoutes.ts',
        './src/api/v1/routes/academicYearRoutes.ts',
        './src/api/v1/routes/subjectRoutes.ts',
        './src/api/v1/routes/examRoutes.ts',
        './src/api/v1/routes/mobileRoutes.ts',
        './src/api/v1/routes/userRoutes.ts',
        './src/api/v1/routes/classRoutes.ts',
        './src/api/v1/routes/studentRoutes.ts',
        './src/api/v1/routes/feeRoutes.ts',
        './src/api/v1/routes/disciplineRoutes.ts',
        './src/api/v1/routes/attendanceRoutes.ts',
        './src/config/swagger/schemas/*.ts',
        './src/api/v1/routes/docs/swagger/*.yaml'
    ],
};

// Generate the Swagger specification
const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 