/**
 * @swagger
 * components:
 *   schemas:
 *     DisciplineRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Discipline record ID
 *           example: 1
 *         studentId:
 *           type: integer
 *           description: ID of the student
 *           example: 10
 *         academicYearId:
 *           type: integer
 *           description: ID of the academic year
 *           example: 2
 *         description:
 *           type: string
 *           description: Description of the discipline issue
 *           example: "Disrupting class during Mathematics lesson"
 *         date:
 *           type: string
 *           format: date
 *           description: Date when the discipline issue occurred
 *           example: "2023-09-15"
 *         action:
 *           type: string
 *           description: Action taken in response to the discipline issue
 *           example: "Verbal warning and detention after school"
 *         severity:
 *           type: string
 *           enum: [MINOR, MODERATE, MAJOR, CRITICAL]
 *           description: Severity level of the discipline issue
 *           example: "MODERATE"
 *         status:
 *           type: string
 *           enum: [PENDING, RESOLVED, ONGOING]
 *           description: Current status of the discipline issue
 *           example: "RESOLVED"
 *         assignedById:
 *           type: integer
 *           description: ID of the user who assigned the discipline record
 *           example: 5
 *         reviewedById:
 *           type: integer
 *           description: ID of the user who reviewed the discipline record
 *           example: 3
 *         parentNotified:
 *           type: boolean
 *           description: Whether the parent has been notified
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the record was created
 *           example: 2023-09-15T14:30:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the record was last updated
 *           example: 2023-09-16T10:15:00.000Z
 *
 *     StudentAttendance:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Attendance record ID
 *           example: 1
 *         studentId:
 *           type: integer
 *           description: ID of the student
 *           example: 10
 *         academicYearId:
 *           type: integer
 *           description: ID of the academic year
 *           example: 2
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the attendance record
 *           example: "2023-09-15"
 *         status:
 *           type: string
 *           enum: [PRESENT, ABSENT, LATE, EXCUSED]
 *           description: Attendance status
 *           example: "ABSENT"
 *         reason:
 *           type: string
 *           description: Reason for absence or lateness
 *           example: "Medical appointment"
 *         periodId:
 *           type: integer
 *           description: ID of the period (class session)
 *           example: 3
 *         recordedById:
 *           type: integer
 *           description: ID of the user who recorded the attendance
 *           example: 5
 *         minutesLate:
 *           type: integer
 *           description: Minutes late (if status is LATE)
 *           example: 15
 *     
 *     TeacherAttendance:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Attendance record ID
 *           example: 1
 *         teacherId:
 *           type: integer
 *           description: ID of the teacher
 *           example: 5
 *         academicYearId:
 *           type: integer
 *           description: ID of the academic year
 *           example: 2
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the attendance record
 *           example: "2023-09-15"
 *         status:
 *           type: string
 *           enum: [PRESENT, ABSENT, LATE, EXCUSED]
 *           description: Attendance status
 *           example: "ABSENT"
 *         reason:
 *           type: string
 *           description: Reason for absence or lateness
 *           example: "Medical appointment"
 *         periodId:
 *           type: integer
 *           description: ID of the period (class session)
 *           example: 3
 *         recordedById:
 *           type: integer
 *           description: ID of the user who recorded the attendance
 *           example: 2
 *
 *     RecordStudentAttendanceRequest:
 *       type: object
 *       required:
 *         - studentId
 *         - date
 *         - status
 *         - periodId
 *       properties:
 *         studentId:
 *           type: integer
 *           description: ID of the student
 *           example: 10
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the attendance record
 *           example: "2023-09-15"
 *         status:
 *           type: string
 *           enum: [PRESENT, ABSENT, LATE, EXCUSED]
 *           description: Attendance status
 *           example: "ABSENT"
 *         reason:
 *           type: string
 *           description: Reason for absence or lateness
 *           example: "Medical appointment"
 *         periodId:
 *           type: integer
 *           description: ID of the period (class session)
 *           example: 3
 *         minutesLate:
 *           type: integer
 *           description: Minutes late (if status is LATE)
 *           example: 15
 *         academicYearId:
 *           type: integer
 *           description: ID of the academic year (optional, defaults to current)
 *           example: 2
 *
 *     RecordTeacherAttendanceRequest:
 *       type: object
 *       required:
 *         - teacherId
 *         - date
 *         - status
 *         - periodId
 *       properties:
 *         teacherId:
 *           type: integer
 *           description: ID of the teacher
 *           example: 5
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the attendance record
 *           example: "2023-09-15"
 *         status:
 *           type: string
 *           enum: [PRESENT, ABSENT, LATE, EXCUSED]
 *           description: Attendance status
 *           example: "ABSENT"
 *         reason:
 *           type: string
 *           description: Reason for absence or lateness
 *           example: "Medical appointment"
 *         periodId:
 *           type: integer
 *           description: ID of the period (class session)
 *           example: 3
 *         academicYearId:
 *           type: integer
 *           description: ID of the academic year (optional, defaults to current)
 *           example: 2
 *
 *     RecordDisciplineIssueRequest:
 *       type: object
 *       required:
 *         - studentId
 *         - description
 *         - date
 *         - severity
 *       properties:
 *         studentId:
 *           type: integer
 *           description: ID of the student
 *           example: 10
 *         description:
 *           type: string
 *           description: Description of the discipline issue
 *           example: "Disrupting class during Mathematics lesson"
 *         date:
 *           type: string
 *           format: date
 *           description: Date when the discipline issue occurred
 *           example: "2023-09-15"
 *         action:
 *           type: string
 *           description: Action taken in response to the discipline issue
 *           example: "Verbal warning and detention after school"
 *         severity:
 *           type: string
 *           enum: [MINOR, MODERATE, MAJOR, CRITICAL]
 *           description: Severity level of the discipline issue
 *           example: "MODERATE"
 *         status:
 *           type: string
 *           enum: [PENDING, RESOLVED, ONGOING]
 *           description: Current status of the discipline issue
 *           example: "PENDING"
 *         parentNotified:
 *           type: boolean
 *           description: Whether the parent has been notified
 *           example: false
 *         academicYearId:
 *           type: integer
 *           description: ID of the academic year (optional, defaults to current)
 *           example: 2
 *
 *     StudentAttendanceResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             attendance:
 *               $ref: '#/components/schemas/StudentAttendance'
 *             student:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 10
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 matricule:
 *                   type: string
 *                   example: "STD2023010"
 *             period:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 3
 *                 name:
 *                   type: string
 *                   example: "Period 3 (11:00 - 12:00)"
 *                 timeSlot:
 *                   type: string
 *                   example: "11:00 - 12:00"
 *
 *     TeacherAttendanceResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             attendance:
 *               $ref: '#/components/schemas/TeacherAttendance'
 *             teacher:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *                 name:
 *                   type: string
 *                   example: "Sarah Johnson"
 *             period:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 3
 *                 name:
 *                   type: string
 *                   example: "Period 3 (11:00 - 12:00)"
 *                 timeSlot:
 *                   type: string
 *                   example: "11:00 - 12:00"
 *
 *     DisciplineResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             discipline:
 *               $ref: '#/components/schemas/DisciplineRecord'
 *             student:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 10
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 matricule:
 *                   type: string
 *                   example: "STD2023010"
 *
 *     DisciplineListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DisciplineRecord'
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 25
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             totalPages:
 *               type: integer
 *               example: 3
 *
 *     DisciplineHistoryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             student:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 10
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 matricule:
 *                   type: string
 *                   example: "STD2023010"
 *             disciplineRecords:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DisciplineRecord'
 *             statistics:
 *               type: object
 *               properties:
 *                 totalRecords:
 *                   type: integer
 *                   example: 5
 *                 bySeverity:
 *                   type: object
 *                   properties:
 *                     MINOR:
 *                       type: integer
 *                       example: 2
 *                     MODERATE:
 *                       type: integer
 *                       example: 2
 *                     MAJOR:
 *                       type: integer
 *                       example: 1
 *                     CRITICAL:
 *                       type: integer
 *                       example: 0
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 
