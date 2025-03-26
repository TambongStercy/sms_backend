import swaggerJsdoc from 'swagger-jsdoc';

// Hard-code the version
const version = '1.0.0';

// Swagger options
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'School Management System API',
            version,
            description: 'API for School Management System including authentication, academic year, subjects, exams, and mobile integrations.\n\n' +
                '## Case Conversion\n' +
                'This API automatically handles case conversion between client and server:\n' +
                '- **Client-side format**: All parameters should be sent in camelCase (e.g., `subclassId`, `academicYearId`)\n' +
                '- **Server-side format**: The server internally uses snake_case (e.g., `subclass_id`, `academic_year_id`)\n' +
                '- **Response format**: All responses are automatically converted from snake_case to camelCase\n\n' +
                'This conversion is handled by middleware, so you don\'t need to worry about it in your client code.\n' +
                'Just use camelCase everywhere in your requests and expect camelCase in all responses.\n\n' +
                '## Enumerated Types\n' +
                'The API uses standardized enum types across all endpoints. These include:\n' +
                '- **Role**: User roles like TEACHER, PARENT, PRINCIPAL, etc.\n' +
                '- **Gender**: Male/Female\n' +
                '- **SubjectCategory**: Categories for academic subjects\n' +
                '- **PaymentMethod**: Methods for fee payments\n' +
                '- **AverageStatus**: Status of student average calculations\n' +
                'See the schema definitions for complete enum values.',
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
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        error: {
                            type: 'string',
                            example: 'An error occurred'
                        }
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        // Schema definitions
        './src/config/swagger/schemas/*.ts',

        // Dedicated documentation files
        './src/config/swagger/docs/*.ts',

        // Other potential documentation formats
        './src/api/v1/swagger/*.ts',
        './src/api/v1/routes/docs/swagger/*.yaml'
    ],
};

// Generate the Swagger specification
const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 
