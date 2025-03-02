/**
 * @swagger
 * components:
 *   schemas:
 *     Exam:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the exam
 *           example: 1
 *         name:
 *           type: string
 *           description: Name of the exam
 *           example: "First Term Examination"
 *         term_id:
 *           type: integer
 *           description: ID of the term
 *           example: 1
 *         academic_year_id:
 *           type: integer
 *           description: ID of the academic year
 *           example: 2
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the exam was created
 *           example: "2023-09-01T12:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the exam was last updated
 *           example: "2023-09-01T12:00:00Z"
 *       description: Exam information
 *     
 *     ExamDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Exam'
 *         - type: object
 *           properties:
 *             term:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "First Term"
 *             academic_year:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 2
 *                 name:
 *                   type: string
 *                   example: "2023-2024"
 *                 start_date:
 *                   type: string
 *                   format: date
 *                   example: "2023-09-01"
 *                 end_date:
 *                   type: string
 *                   format: date
 *                   example: "2024-06-30"
 *       description: Detailed exam information including term and academic year
 *     
 *     Mark:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the mark
 *           example: 1
 *         enrollment_id:
 *           type: integer
 *           description: ID of the student enrollment
 *           example: 5
 *         subclass_subject_id:
 *           type: integer
 *           description: ID of the subclass subject
 *           example: 3
 *         teacher_id:
 *           type: integer
 *           description: ID of the teacher who recorded the mark
 *           example: 8
 *         exam_sequence_id:
 *           type: integer
 *           description: ID of the exam sequence
 *           example: 2
 *         score:
 *           type: number
 *           format: float
 *           description: Score achieved by the student
 *           example: 85.5
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the mark was created
 *           example: "2023-10-20T14:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the mark was last updated
 *           example: "2023-10-20T14:30:00Z"
 *       description: Mark information
 *     
 *     CreateExamRequest:
 *       type: object
 *       required:
 *         - name
 *         - term_id
 *         - academic_year_id
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the exam
 *           example: "First Term Examination"
 *         term_id:
 *           type: integer
 *           description: ID of the term
 *           example: 1
 *         academic_year_id:
 *           type: integer
 *           description: ID of the academic year
 *           example: 2
 *       description: Information required to create a new exam
 *     
 *     UpdateExamRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Updated name of the exam
 *           example: "First Term Midterm Examination"
 *         term_id:
 *           type: integer
 *           description: Updated ID of the term
 *           example: 2
 *       description: Information required to update an exam
 *
 *     # Standardized Response Schemas
 *     ExamListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exam'
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
 *       description: Response for a list of exams with pagination
 *
 *     ExamDetailResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/ExamDetail'
 *       description: Response for a detailed view of an exam
 *
 *     ExamCreatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Exam'
 *         message:
 *           type: string
 *           example: "Exam created successfully"
 *       description: Response after successfully creating an exam
 *
 *     ExamUpdatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Exam'
 *         message:
 *           type: string
 *           example: "Exam updated successfully"
 *       description: Response after successfully updating an exam
 *
 *     ExamDeletedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Exam deleted successfully"
 *       description: Response after successfully deleting an exam
 *
 *     MarkListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mark'
 *             meta:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 28
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *       description: Response for a list of marks with pagination
 *
 *     ReportCardResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             file_url:
 *               type: string
 *               example: "/reports/report_cards/student_123_term_1_2023.pdf"
 *             student_name:
 *               type: string
 *               example: "John Doe"
 *             term:
 *               type: string
 *               example: "First Term"
 *             academic_year:
 *               type: string
 *               example: "2023-2024"
 *         message:
 *           type: string
 *           example: "Report card generated successfully"
 *       description: Response after successfully generating a report card
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "An error occurred while processing your request"
 *       description: Standard error response
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Validation failed"
 *         validation_errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: "name"
 *               message:
 *                 type: string
 *                 example: "Name is required"
 *       description: Response for validation errors
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 