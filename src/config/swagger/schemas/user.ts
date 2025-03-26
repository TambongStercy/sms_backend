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
 *         userRoles:
 *           type: array
 *           description: Roles assigned to the user
 *           items:
 *             $ref: '#/components/schemas/UserRole'
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
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: User ID
 *               example: 1
 *             name:
 *               type: string
 *               description: User's name
 *               example: "John Doe"
 *             email:
 *               type: string
 *               description: User's email
 *               example: "teacher@school.com"
 *             gender:
 *               $ref: '#/components/schemas/Gender'
 *               example: "Male"
 *             dateOfBirth:
 *               type: string
 *               format: date
 *               example: "1990-01-01"
 *             phone:
 *               type: string
 *               example: "1234567890"
 *             address:
 *               type: string
 *               example: "123 Main St, City, Country"
 *             idCardNum:
 *               type: string
 *               example: "ID12345678"
 *             userRoles:
 *               type: array
 *               description: Roles assigned to the user
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   role:
 *                     $ref: '#/components/schemas/Role'
 *                     example: "TEACHER"
 *                   academicYearId:
 *                     type: integer
 *                     example: 3
 *             subjectTeachers:
 *               type: array
 *               description: Subjects assigned to teacher (only included if role is TEACHER)
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   subject:
 *                     $ref: '#/components/schemas/Subject'
 *             parentStudents:
 *               type: array
 *               description: Students assigned to parent (only included if role is PARENT)
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   student:
 *                     $ref: '#/components/schemas/Student'
 *       description: Response for successfully creating a user with role and assignments
 *
 *     AssignRoleRequest:
 *       type: object
 *       required:
 *         - role
 *       properties:
 *         role:
 *           $ref: '#/components/schemas/Role'
 *           description: Role to assign to the user
 *           example: "TEACHER"
 *         academicYearId:
 *           type: integer
 *           description: Academic year ID (optional, but required for certain roles)
 *           example: 3
 *       description: Information required to assign a role to a user
 */

export { };