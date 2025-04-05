/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         name:
 *           type: string
 *           description: User's full name
 *           example: John Doe
 *         email:
 *           type: string
 *           description: User email
 *           example: user@example.com
 *         gender:
 *           $ref: '#/components/schemas/Gender'
 *           description: User's gender
 *           example: Male
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: User's date of birth
 *           example: "1990-01-01"
 *         photo:
 *           type: string
 *           description: URL to user's profile photo
 *           example: "https://example.com/photos/user1.jpg"
 *         phone:
 *           type: string
 *           description: User's phone number
 *           example: "+1234567890"
 *         address:
 *           type: string
 *           description: User's address
 *           example: "123 Main St, City, Country"
 *         idCardNum:
 *           type: string
 *           description: User's ID card number
 *           example: "ID12345678"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Account last update timestamp
 *           example: 2023-01-01T12:00:00.000Z
 *     
 *     UserRole:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Role assignment ID
 *           example: 1
 *         userId:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         academicYearId:
 *           type: integer
 *           description: Academic year ID (if role is specific to an academic year)
 *           example: 3
 *           nullable: true
 *         role:
 *           $ref: '#/components/schemas/Role'
 *           description: User role
 *           example: "TEACHER"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the role was assigned
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the role assignment was last updated
 *           example: 2023-01-01T12:00:00.000Z
 *       description: Role assignment for a user
 * 
 *     UserWithRoles: # New schema combining User and UserRole[]
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             userRoles:
 *               type: array
 *               description: Roles assigned to the user
 *               items:
 *                 $ref: '#/components/schemas/UserRole'
 *       description: User object including their role assignments
 * 
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - gender
 *         - dateOfBirth
 *         - phone
 *         - address
 *       properties:
 *         name:
 *           type: string
 *           description: Full name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address (must be unique)
 *         password:
 *           type: string
 *           format: password
 *           description: User's password (will be hashed)
 *         gender:
 *           $ref: '#/components/schemas/Gender'
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: User's date of birth (YYYY-MM-DD)
 *         phone:
 *           type: string
 *           description: User's phone number
 *         address:
 *           type: string
 *           description: User's physical address
 *         idCardNum:
 *           type: string
 *           description: User's ID card number (optional)
 *         photo:
 *           type: string
 *           description: URL to user's profile photo (optional)
 *       example:
 *         name: "Jane Doe"
 *         email: "jane.doe@example.com"
 *         password: "password123"
 *         gender: "Female"
 *         dateOfBirth: "1985-05-20"
 *         phone: "+1987654321"
 *         address: "456 Oak Ave, Town"
 * 
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: User's full name
 *         password:
 *           type: string
 *           format: password
 *           description: New password (optional, will be hashed)
 *         gender:
 *           $ref: '#/components/schemas/Gender'
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: User's date of birth (YYYY-MM-DD)
 *         phone:
 *           type: string
 *           description: User's phone number
 *         address:
 *           type: string
 *           description: User's physical address
 *         idCardNum:
 *           type: string
 *           description: User's ID card number
 *         photo:
 *           type: string
 *           description: URL to user's profile photo
 *       example:
 *         name: "Jane D. Updated"
 *         phone: "+1987654322"
 * 
 *     AssignRoleRequest:
 *       type: object
 *       required:
 *         - role
 *       properties:
 *         role:
 *           $ref: '#/components/schemas/Role'
 *           description: Role to assign
 *         academicYearId:
 *           type: integer
 *           description: Academic year ID (optional, required for certain roles like TEACHER)
 *           example: 3
 *           nullable: true
 * 
 *     RegisterUserWithRolesRequest: # New Request Schema
 *       allOf:
 *         - $ref: '#/components/schemas/CreateUserRequest' # Inherit base user fields
 *         - type: object
 *           required:
 *             - roles
 *           properties:
 *             roles:
 *               type: array
 *               description: Array of roles to assign to the user
 *               minItems: 1
 *               items:
 *                 type: object
 *                 required:
 *                   - role
 *                 properties:
 *                   role:
 *                     $ref: '#/components/schemas/Role'
 *                     description: Role to assign
 *                   academicYearId:
 *                     type: integer
 *                     description: Academic year ID (optional, required for certain roles like TEACHER)
 *                     example: 3
 *                     nullable: true
 *       example:
 *         name: "New Manager"
 *         email: "manager.new@example.com"
 *         password: "managerPass123"
 *         gender: "Male"
 *         dateOfBirth: "1982-03-10"
 *         phone: "+1555123456"
 *         address: "789 Mgmt Blvd, City"
 *         roles: [
 *           { "role": "MANAGER" },
 *           { "role": "TEACHER", "academicYearId": 3 }
 *         ]
 * 
 *     # Standardized Response Schemas
 *     UserResponse: # Standard response for single user (without roles)
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/User'
 *       description: Standard response containing a single user object (roles not guaranteed)
 * 
 *     UserWithRolesResponse: # New standard response for single user with roles
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/UserWithRoles'
 *       description: Standard response containing a single user object with their roles
 *
 *     # --- Keeping legacy schemas for compatibility with /users/with-role endpoint --- 
 *     CreateUserWithRoleRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - gender
 *         - dateOfBirth
 *         - phone
 *         - address
 *         - role
 *       properties:
 *         name:
 *           type: string
 *           description: User's full name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           description: User's password
 *           format: password
 *           example: "Password123"
 *         gender:
 *           $ref: '#/components/schemas/Gender'
 *           description: User's gender
 *           example: "Male"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: User's date of birth
 *           example: "1990-01-01"
 *         phone:
 *           type: string
 *           description: User's phone number
 *           example: "1234567890"
 *         address:
 *           type: string
 *           description: User's address
 *           example: "123 Main St, City, Country"
 *         idCardNum:
 *           type: string
 *           description: User's ID card number (optional)
 *           example: "ID12345678"
 *         photo:
 *           type: string
 *           description: URL to user's profile photo (optional)
 *           example: "https://example.com/photos/user1.jpg"
 *         role:
 *           $ref: '#/components/schemas/Role'
 *           description: Role to assign to the user
 *           example: "TEACHER"
 *         academicYearId:
 *           type: integer
 *           description: Academic year ID (optional, required for certain roles)
 *           example: 3
 *         parentAssignments:
 *           type: array
 *           description: Array of student IDs to link to parent (only applicable if role is PARENT)
 *           items:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: integer
 *                 description: ID of the student to link to parent
 *                 example: 1
 *         teacherAssignments:
 *           type: array
 *           description: Array of subject IDs to link to teacher (only applicable if role is TEACHER)
 *           items:
 *             type: object
 *             properties:
 *               subjectId:
 *                 type: integer
 *                 description: ID of the subject to link to teacher
 *                 example: 1
 *       description: Information required to create a new user with role and optional assignments
 *     
 *     CreateUserWithRoleResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "User created successfully with role TEACHER"
 *         data:
 *           type: object # This structure differs from UserWithRoles, hence kept separate
 *           properties:
 *             # ... (User fields) ...
 *             userRoles:
 *               type: array
 *               description: Roles assigned to the user
 *               items:
 *                 # ... (UserRole fields) ...
 *             subjectTeachers: # Specific to TEACHER role in this legacy response
 *               type: array
 *               # ...
 *             parentStudents: # Specific to PARENT role in this legacy response
 *               type: array
 *               # ...
 *       description: Response for successfully creating a user with role and assignments (Legacy)
 */

export { };