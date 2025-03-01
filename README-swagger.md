# Swagger Documentation for School Management System API

This project includes comprehensive API documentation using Swagger/OpenAPI. This makes it easy for developers to understand and interact with the API endpoints.

## Accessing Swagger Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api-docs
```

## Features

- **Interactive Documentation**: Test API endpoints directly from the browser
- **Request/Response Examples**: See example request bodies and responses
- **Authentication**: Understand authentication requirements for each endpoint
- **Models/Schemas**: View detailed data models used by the API

## Authentication

The API uses JWT (JSON Web Token) authentication. To authenticate:

1. First, use the `/api/v1/auth/login` endpoint to obtain a token
2. Click the "Authorize" button at the top of the Swagger UI
3. Enter your token in the format: `Bearer YOUR_TOKEN_HERE`
4. After authorizing, you'll have access to protected endpoints

## Available Tags

The API documentation is organized by the following tags:

- **Authentication**: User login, registration, and profile endpoints
- **Academic Years**: Academic year management
- **Users**: User management
- **Classes**: Class and subclass management
- **Students**: Student management
- **Subjects**: Subject management
- **Exams**: Exam paper creation and management
- **Marks**: Marking and grade management
- **Report Cards**: Report card generation

## Development Guide

### Adding Documentation to New Endpoints

When adding new endpoints, follow these steps to ensure they're properly documented:

1. Add JSDoc comments to your route files, following the OpenAPI 3.0 specification
2. Document the request parameters, body structure, and response format
3. Include appropriate tags to group related endpoints
4. Document possible error responses

Example:

```typescript
/**
 * @swagger
 * /resource:
 *   get:
 *     summary: Brief description
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: paramName
 *         schema:
 *           type: string
 *         description: Parameter description
 *     responses:
 *       200:
 *         description: Success response description
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseModel'
 */
router.get('/resource', controller.getResource);
```

### Defining New Schemas

To define new data models/schemas:

1. Create or update schema files in the `src/config/swagger/schemas/` directory
2. Follow the OpenAPI 3.0 specification format
3. Reference these schemas in your endpoint documentation

Example:

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     ModelName:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier
 *         name:
 *           type: string
 *           description: Name of the resource
 */
```

## Testing Documentation

To verify that your documentation is correctly formatted and complete:

```bash
npx ts-node scripts/swagger-test.ts
```

This will generate a JSON specification file and validate that all routes and schemas are properly documented. 