/**
 * @swagger
 * components:
 *   schemas:
 *     DisciplineIssue:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the discipline issue
 *           example: 1
 *         enrollment_id:
 *           type: integer
 *           description: ID of the student enrollment
 *           example: 1
 *         description:
 *           type: string
 *           description: Description of the discipline issue
 *           example: "Disrupted class by talking loudly"
 *         notes:
 *           type: string
 *           description: Additional notes about the issue
 *           example: "Student has been warned twice before"
 *         assigned_by_id:
 *           type: integer
 *           description: ID of the user who reported the issue
 *           example: 5
 *         reviewed_by_id:
 *           type: integer
 *           description: ID of the user who reviewed the issue
 *           example: 3
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the issue was recorded
 *           example: "2023-09-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the issue was last updated
 *           example: "2023-09-15T10:30:00Z"
 *       description: Discipline issue information
 *     
 *     StudentAbsence:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the absence record
 *           example: 1
 *         enrollment_id:
 *           type: integer
 *           description: ID of the student enrollment
 *           example: 1
 *         teacher_period_id:
 *           type: integer
 *           description: ID of the teacher period (class session)
 *           example: 5
 *         assigned_by_id:
 *           type: integer
 *           description: ID of the user who recorded the absence
 *           example: 5
 *       description: Student absence information
 *     
 *     TeacherAbsence:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the absence record
 *           example: 1
 *         teacher_id:
 *           type: integer
 *           description: ID of the teacher
 *           example: 5
 *         reason:
 *           type: string
 *           description: Reason for the absence
 *           example: "Sick leave"
 *         teacher_period_id:
 *           type: integer
 *           description: ID of the teacher period (class session)
 *           example: 10
 *         assigned_by_id:
 *           type: integer
 *           description: ID of the user who recorded the absence
 *           example: 3
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the absence was recorded
 *           example: "2023-09-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the absence record was last updated
 *           example: "2023-09-15T10:30:00Z"
 *       description: Teacher absence information
 *     
 *     RecordDisciplineIssueRequest:
 *       type: object
 *       required:
 *         - student_id
 *         - description
 *       properties:
 *         student_id:
 *           type: integer
 *           description: ID of the student
 *           example: 1
 *         academic_year_id:
 *           type: integer
 *           description: ID of the academic year (optional, defaults to current academic year)
 *           example: 1
 *         description:
 *           type: string
 *           description: Description of the discipline issue
 *           example: "Disrupted class by talking loudly"
 *         notes:
 *           type: string
 *           description: Additional notes about the issue
 *           example: "Student has been warned twice before"
 *       description: Information required to record a discipline issue
 *     
 *     RecordStudentAttendanceRequest:
 *       type: object
 *       required:
 *         - student_id
 *       properties:
 *         student_id:
 *           type: integer
 *           description: ID of the student
 *           example: 1
 *         academic_year_id:
 *           type: integer
 *           description: ID of the academic year (optional, defaults to current academic year)
 *           example: 1
 *         teacher_period_id:
 *           type: integer
 *           description: ID of the teacher period (class session)
 *           example: 5
 *       description: Information required to record a student absence
 *     
 *     RecordTeacherAttendanceRequest:
 *       type: object
 *       required:
 *         - teacher_id
 *         - reason
 *       properties:
 *         teacher_id:
 *           type: integer
 *           description: ID of the teacher
 *           example: 5
 *         reason:
 *           type: string
 *           description: Reason for the absence
 *           example: "Sick leave"
 *         teacher_period_id:
 *           type: integer
 *           description: ID of the teacher period (class session)
 *           example: 10
 *       description: Information required to record a teacher absence
 *
 *     DisciplineResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates whether the operation was successful
 *           example: true
 *         message:
 *           type: string
 *           description: A message describing the result of the operation
 *           example: "Discipline issue recorded successfully"
 *         data:
 *           $ref: '#/components/schemas/DisciplineIssue'
 *       description: Standard response format for discipline operations
 *
 *     StudentAttendanceResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates whether the operation was successful
 *           example: true
 *         message:
 *           type: string
 *           description: A message describing the result of the operation
 *           example: "Student attendance recorded successfully"
 *         data:
 *           $ref: '#/components/schemas/StudentAbsence'
 *       description: Standard response format for student attendance operations
 *
 *     TeacherAttendanceResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates whether the operation was successful
 *           example: true
 *         message:
 *           type: string
 *           description: A message describing the result of the operation
 *           example: "Teacher attendance recorded successfully"
 *         data:
 *           $ref: '#/components/schemas/TeacherAbsence'
 *       description: Standard response format for teacher attendance operations
 *
 *     DisciplineListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates whether the operation was successful
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DisciplineIssue'
 *             meta:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 15
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *       description: Standard response format for discipline listing
 *
 *     DisciplineHistoryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates whether the operation was successful
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DisciplineIssue'
 *       description: Standard response format for discipline history
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 