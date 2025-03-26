/**
 * @swagger
 * tags:
 *   name: User API Guide
 *   description: Comprehensive guide to using the User Management API
 */

/**
 * @swagger
 * /api-documentation/guides/user-api:
 *   get:
 *     summary: User API Usage Guide
 *     description: |
 *       # User API Guide
 *       
 *       This guide provides detailed information on how to use the User Management API endpoints,
 *       with special attention to property naming and data formats.
 *       
 *       ## API Endpoints
 *       
 *       | Endpoint | Method | Description |
 *       |----------|--------|-------------|
 *       | `/users` | GET | List users with pagination and filtering |
 *       | `/users/:id` | GET | Get a specific user by ID |
 *       | `/users` | POST | Create a new user without role |
 *       | `/users/with-role` | POST | Create a user with role and optional assignments |
 *       | `/users/:id` | PUT | Update an existing user |
 *       | `/users/:id/roles` | POST | Assign a role to a user |
 *       | `/users/:id/roles/:roleId` | DELETE | Remove a role from a user |
 *       
 *       ## CamelCase vs. Snake_case
 *       
 *       The API consistently uses camelCase for all properties in requests and responses.
 *       Internally, the database uses snake_case, but this is automatically converted for you.
 *       
 *       **Examples of property naming:**
 *       
 *       ```json
 *       // Request body (correct format)
 *       {
 *         "name": "John Doe",
 *         "email": "john@example.com",
 *         "dateOfBirth": "1990-01-01",
 *         "idCardNum": "ID123456"
 *       }
 *       
 *       // NOT RECOMMENDED (snake_case will be converted, but not ideal)
 *       {
 *         "name": "John Doe",
 *         "email": "john@example.com",
 *         "date_of_birth": "1990-01-01",
 *         "id_card_num": "ID123456"
 *       }
 *       ```
 *       
 *       ## Creating Users with Roles
 *       
 *       When creating a user with a role, use the `/users/with-role` endpoint. You can optionally include
 *       assignments based on the role type:
 *       
 *       ```json
 *       // Example: Creating a teacher with subject assignments
 *       {
 *         "name": "John Smith",
 *         "email": "john.smith@school.com",
 *         "password": "secure123",
 *         "gender": "Male",
 *         "dateOfBirth": "1980-05-15",
 *         "phone": "1234567890",
 *         "address": "123 School St",
 *         "role": "TEACHER",
 *         "teacherAssignments": [
 *           { "subjectId": 1 },
 *           { "subjectId": 3 }
 *         ]
 *       }
 *       
 *       // Example: Creating a parent with student assignments
 *       {
 *         "name": "Jane Parent",
 *         "email": "jane@example.com",
 *         "password": "secure123",
 *         "gender": "Female",
 *         "dateOfBirth": "1975-08-20",
 *         "phone": "9876543210",
 *         "address": "456 Home St",
 *         "role": "PARENT",
 *         "parentAssignments": [
 *           { "studentId": 5 },
 *           { "studentId": 6 }
 *         ]
 *       }
 *       ```
 *       
 *       ## Role Assignments
 *       
 *       For certain roles, you may need to specify an academic year ID:
 *       
 *       ```json
 *       // Assigning a teacher role for a specific academic year
 *       {
 *         "role": "TEACHER",
 *         "academicYearId": 3
 *       }
 *       ```
 *       
 *       ## Error Handling
 *       
 *       All endpoints return standardized error responses:
 *       
 *       ```json
 *       {
 *         "success": false,
 *         "error": "Descriptive error message"
 *       }
 *       ```
 *       
 *     tags: [User API Guide]
 *     responses:
 *       200:
 *         description: Successful documentation retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "This endpoint is for documentation purposes only."
 */

export { }; 