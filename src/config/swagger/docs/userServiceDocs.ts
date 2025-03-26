/**
 * @swagger
 * tags:
 *   name: User Service
 *   description: Documentation of internal User Service methods and how they map to API endpoints
 */

/**
 * @swagger
 * /api-documentation/services/user-service:
 *   get:
 *     summary: User Service Documentation
 *     description: |
 *       # User Service Internal Methods
 *       
 *       This documentation explains how the internal User Service methods map to the API endpoints,
 *       including the transformation between snake_case (database) and camelCase (API) properties.
 *       
 *       ## Property Mapping
 *       
 *       | Database Property (snake_case) | API Property (camelCase) |
 *       |-------------------------------|--------------------------|
 *       | `user.name`                   | `name`                   |
 *       | `user.email`                  | `email`                  |
 *       | `user.gender`                 | `gender`                 |
 *       | `user.date_of_birth`          | `dateOfBirth`            |
 *       | `user.phone`                  | `phone`                  |
 *       | `user.address`                | `address`                |
 *       | `user.id_card_num`            | `idCardNum`              |
 *       | `user.photo`                  | `photo`                  |
 *       | `user_roles`                  | `userRoles`              |
 *       | `user_role.user_id`           | `userRole.userId`        |
 *       | `user_role.academic_year_id`  | `userRole.academicYearId`|
 *       | `parent_students`             | `parentStudents`         |
 *       | `parent_student.parent_id`    | `parentStudent.parentId` |
 *       | `parent_student.student_id`   | `parentStudent.studentId`|
 *       | `subject_teachers`            | `subjectTeachers`        |
 *       | `subject_teacher.teacher_id`  | `subjectTeacher.teacherId`|
 *       | `subject_teacher.subject_id`  | `subjectTeacher.subjectId`|
 *       
 *       ## Method Documentation
 *       
 *       ### getAllUsers
 *       ```typescript
 *       async function getAllUsers(
 *           paginationOptions?: PaginationOptions, 
 *           filterOptions?: FilterOptions
 *       ): Promise<PaginatedResult<User>>
 *       ```
 *       - **Maps to API**: `GET /users`
 *       - **Description**: Retrieves a paginated list of users with optional filtering
 *       - **Filters**: Supports filtering by role using the `role` query parameter
 *       - **Includes**: Can include related entities by setting `includeRoles=true`
 *       
 *       ### createUser
 *       ```typescript
 *       async function createUser(data: {
 *           name: string;
 *           email: string;
 *           password: string;
 *           gender: string;
 *           date_of_birth: string;
 *           phone: string;
 *           address: string;
 *       }): Promise<User>
 *       ```
 *       - **Maps to API**: `POST /users`
 *       - **Description**: Creates a new user without role assignments
 *       - **Note**: Password is automatically hashed using bcrypt
 *       
 *       ### createUserWithRole
 *       ```typescript
 *       async function createUserWithRole(userData: {
 *           email: string;
 *           password: string;
 *           name: string;
 *           gender: Gender;
 *           date_of_birth: Date;
 *           phone: string;
 *           address: string;
 *           role: Role;
 *           parentAssignments?: { studentId: number }[];
 *           teacherAssignments?: { subjectId: number }[];
 *       }): Promise<any>
 *       ```
 *       - **Maps to API**: `POST /users/with-role`
 *       - **Description**: Creates a user and assigns a role in a single transaction
 *       - **Special Handling**: 
 *         - If role is PARENT, creates parent-student associations
 *         - If role is TEACHER, creates subject-teacher associations
 *       
 *       ### assignRole
 *       ```typescript
 *       async function assignRole(
 *           user_id: number, 
 *           data: { role: Role; academic_year_id?: number }
 *       ): Promise<any>
 *       ```
 *       - **Maps to API**: `POST /users/:userId/roles`
 *       - **Description**: Assigns a new role to an existing user
 *       - **Note**: Checks for existing role assignments to prevent duplicates
 *       
 *       ### removeRole
 *       ```typescript
 *       async function removeRole(user_id: number, role: Role): Promise<any>
 *       ```
 *       - **Maps to API**: `DELETE /users/:userId/roles/:roleId`
 *       - **Description**: Removes a role from a user
 *       
 *     tags: [User Service]
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