/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management endpoints
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     description: Retrieves a list of all students with optional filtering. Access varies by role.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort results by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort direction (ascending or descending)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter students by name (case insensitive, supports partial matching)
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [Female, Male]
 *         description: Filter students by gender
 *       - in: query
 *         name: matricule
 *         schema:
 *           type: string
 *         description: Filter students by matriculation number
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: Filter students by ID
 *       - in: query
 *         name: withEnrollment
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to include enrollment information with student data
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: Filter students by class ID (only works when withEnrollment=true)
 *       - in: query
 *         name: sub_classId
 *         schema:
 *           type: integer
 *         description: Filter students by sub_class ID (only works when withEnrollment=true)
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: integer
 *         description: Filter students by academic year ID (only works when withEnrollment=true, defaults to current academic year)
 *     responses:
 *       200:
 *         description: List of students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of students matching the filters
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Number of items per page
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Create a new student
 *     description: Creates a new student record. Only accessible by ADMIN, PRINCIPAL, VICE_PRINCIPAL.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentRequest'
 *           example:
 *             matricule: "STD20240001"
 *             name: "John Doe"
 *             dateOfBirth: "2005-01-15"
 *             placeOfBirth: "Douala"
 *             gender: "Male"
 *             residence: "123 Main St, Douala"
 *             formerSchool: "Primary School XYZ"
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Invalid request data or invalid gender value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidGender:
 *                 value:
 *                   success: false
 *                   error: "Invalid gender. Choose a valid gender."
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student details
 *     description: Retrieves details of a specific student by ID, including parents and enrollments (either for current academic year or all years). Access varies by role.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: integer
 *         description: Optional academic year ID (defaults to current academic year)
 *     responses:
 *       200:
 *         description: Student details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/StudentDetail'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have permission to view this student
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /students/{id}/parents:
 *   post:
 *     summary: Link a parent to a student
 *     description: Links a parent to a specific student. Only accessible by ADMIN, PRINCIPAL, VICE_PRINCIPAL.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LinkParentRequest'
 *           example:
 *             parentId: 123
 *     responses:
 *       201:
 *         description: Parent linked to student successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     studentId:
 *                       type: integer
 *                     parentId:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Student or parent not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /students/{id}/enroll:
 *   post:
 *     summary: Enroll student in a sub-class
 *     description: Enrolls a student in a specific sub-class for an academic year and automatically creates a school fee record based on the fee_amount defined in the parent class. Only accessible by ADMIN, PRINCIPAL, VICE_PRINCIPAL.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnrollStudentRequest'
 *           example:
 *             sub_classId: 123
 *             academicYearId: 2
 *             photo: "student_photo_url.jpg"
 *             repeater: false
 *     responses:
 *       201:
 *         description: Student enrolled successfully with fee record created automatically
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Enrollment'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Student, sub_class, or academic year not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Student is already enrolled in this sub_class for this academic year
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /students/{id}/photo:
 *   post:
 *     summary: Upload student photo
 *     description: |
 *       Upload a photo file for a student. The photo will be stored in the students directory
 *       with a filename that includes the student ID for easy identification.
 *       This endpoint is used to upload photos that can later be assigned to enrollment records.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Student photo file (JPEG, PNG, etc.)
 *     responses:
 *       201:
 *         description: Photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Student photo uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                       example: student-123-1640995200000.jpg
 *                     originalname:
 *                       type: string
 *                       example: john_doe_photo.jpg
 *                     size:
 *                       type: number
 *                       example: 102400
 *                     studentId:
 *                       type: number
 *                       example: 123
 *                     url:
 *                       type: string
 *                       example: http://localhost:3000/uploads/students/student-123-1640995200000.jpg
 *       400:
 *         description: Bad request (invalid student ID or no photo uploaded)
 *       404:
 *         description: Student not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 * /students/{id}/enrollment-photo:
 *   put:
 *     summary: Update student enrollment photo
 *     description: |
 *       Update the photo for a student's enrollment record. This assigns a previously uploaded
 *       photo to a specific enrollment (academic year). Students can have different photos
 *       for different academic years.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - photoFilename
 *             properties:
 *               photoFilename:
 *                 type: string
 *                 description: Filename of the previously uploaded photo
 *                 example: student-123-1640995200000.jpg
 *               academicYearId:
 *                 type: integer
 *                 description: Academic year ID (optional, defaults to current year)
 *                 example: 4
 *     responses:
 *       200:
 *         description: Enrollment photo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Student enrollment photo updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: number
 *                       example: 123
 *                     academicYearId:
 *                       type: number
 *                       example: 4
 *                     photo:
 *                       type: string
 *                       example: student-123-1640995200000.jpg
 *                     enrollment:
 *                       $ref: '#/components/schemas/Enrollment'
 *       400:
 *         description: Bad request (invalid photo filename or student ID)
 *       404:
 *         description: Student or enrollment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   get:
 *     summary: Get student enrollment photo info
 *     description: |
 *       Retrieve information about a student's enrollment photo including the filename
 *       and public URL. This endpoint helps check if a photo is assigned to an enrollment.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: integer
 *         description: Academic year ID (optional, defaults to current year)
 *         example: 4
 *     responses:
 *       200:
 *         description: Photo information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: number
 *                       example: 123
 *                     academicYearId:
 *                       type: number
 *                       example: 4
 *                     photo:
 *                       type: string
 *                       nullable: true
 *                       example: student-123-1640995200000.jpg
 *                     photoUrl:
 *                       type: string
 *                       nullable: true
 *                       example: http://localhost:3000/uploads/students/student-123-1640995200000.jpg
 *                     enrollmentId:
 *                       type: number
 *                       example: 456
 *       404:
 *         description: No enrollment photo found
 *       400:
 *         description: Invalid student ID format
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

export { }; 