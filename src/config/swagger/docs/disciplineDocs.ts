/**
 * @swagger
 * tags:
 *   name: Discipline
 *   description: Discipline management and attendance tracking endpoints
 */

/**
 * @swagger
 * /discipline:
 *   get:
 *     summary: Get all discipline records
 *     description: Retrieves a list of all discipline records with optional filtering
 *     tags: [Discipline]
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
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         description: Filter discipline records by student ID
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: Filter discipline records by class ID
 *       - in: query
 *         name: subclassId
 *         schema:
 *           type: integer
 *         description: Filter discipline records by subclass ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter discipline records from this date (inclusive)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter discipline records until this date (inclusive)
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Filter discipline records by description text (case insensitive)
 *       - in: query
 *         name: includeAssignedBy
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include information about who assigned the discipline record
 *       - in: query
 *         name: includeReviewedBy
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include information about who reviewed the discipline record
 *       - in: query
 *         name: includeStudent
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include detailed student information with each record
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: integer
 *         description: Filter discipline records by academic year ID (defaults to current academic year if not provided)
 *     responses:
 *       200:
 *         description: List of discipline records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplineListResponse'
 *       401:
 *         description: Unauthorized - User is not authenticated
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
 * /discipline/{studentId}:
 *   get:
 *     summary: Get discipline records for a student
 *     description: Retrieves all discipline records for a specific student
 *     tags: [Discipline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: integer
 *         description: Filter by academic year ID (defaults to current academic year if not provided)
 *     responses:
 *       200:
 *         description: Discipline records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplineHistoryResponse'
 *       400:
 *         description: Invalid student ID
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
 * /discipline/attendance/students:
 *   post:
 *     summary: Record student attendance
 *     description: Records student absence or lateness. The user recording the attendance is automatically determined from the authenticated user. Accessible by ADMIN, PRINCIPAL, VICE_PRINCIPAL, DISCIPLINE_MASTER, TEACHER.
 *     tags: [Discipline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecordStudentAttendanceRequest'
 *     responses:
 *       201:
 *         description: Student attendance recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentAttendanceResponse'
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
 *         description: Student enrollment or teacher period not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Attendance record already exists for this student in this period
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
 * /discipline/attendance/teachers:
 *   post:
 *     summary: Record teacher attendance
 *     description: Records teacher absence. The user recording the attendance is automatically determined from the authenticated user. Only accessible by ADMIN, PRINCIPAL, VICE_PRINCIPAL.
 *     tags: [Discipline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecordTeacherAttendanceRequest'
 *     responses:
 *       201:
 *         description: Teacher attendance recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherAttendanceResponse'
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
 *         description: Teacher or teacher period not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Attendance record already exists for this teacher in this period
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
 * /discipline/discipline:
 *   post:
 *     summary: Record a discipline issue
 *     description: Records a discipline issue for a student. The user recording the issue is automatically determined from the authenticated user. Accessible by ADMIN, PRINCIPAL, VICE_PRINCIPAL, DISCIPLINE_MASTER, TEACHER.
 *     tags: [Discipline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecordDisciplineIssueRequest'
 *     responses:
 *       201:
 *         description: Discipline issue recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplineResponse'
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
 *         description: Student enrollment not found
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

export { }; 