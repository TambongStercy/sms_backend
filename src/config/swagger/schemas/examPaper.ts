/**
 * @swagger
 * components:
 *   schemas:
 *     ExamPaper:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the exam paper
 *           example: 1
 *         name:
 *           type: string
 *           description: Name of the exam paper
 *           example: "Mathematics Mid-Term Exam"
 *         subject_id:
 *           type: integer
 *           description: ID of the subject
 *           example: 2
 *         academic_year_id:
 *           type: integer
 *           description: ID of the academic year
 *           example: 1
 *         exam_date:
 *           type: string
 *           format: date-time
 *           description: Date and time of the exam
 *           example: "2023-10-15T09:00:00Z"
 *         duration:
 *           type: integer
 *           description: Duration of the exam in minutes
 *           example: 120
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the exam paper was created
 *           example: "2023-09-01T12:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the exam paper was last updated
 *           example: "2023-09-01T12:00:00Z"
 *       description: Exam paper information
 *     
 *     Question:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the question
 *           example: 1
 *         subject_id:
 *           type: integer
 *           description: ID of the subject
 *           example: 2
 *         question_text:
 *           type: string
 *           description: Text of the question
 *           example: "What is the formula for the area of a circle?"
 *         question_type:
 *           type: string
 *           enum: [MCQ, LONG_ANSWER]
 *           description: Type of question
 *           example: "MCQ"
 *         options:
 *           type: object
 *           description: Options for multiple choice questions (JSON format)
 *           example: {"A": "πr", "B": "πr²", "C": "2πr", "D": "2πr²"}
 *         correct_answer:
 *           type: string
 *           description: Correct answer for the question
 *           example: "B"
 *         topic:
 *           type: string
 *           description: Topic or category of the question
 *           example: "Geometry"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the question was created
 *           example: "2023-08-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the question was last updated
 *           example: "2023-08-15T10:30:00Z"
 *       description: Question information
 *     
 *     ExamPaperQuestion:
 *       type: object
 *       properties:
 *         exam_paper_id:
 *           type: integer
 *           description: ID of the exam paper
 *           example: 1
 *         question_id:
 *           type: integer
 *           description: ID of the question
 *           example: 5
 *         order:
 *           type: integer
 *           description: Order of the question in the exam paper
 *           example: 3
 *       description: Relationship between an exam paper and a question
 *     
 *     CreateExamPaperRequest:
 *       type: object
 *       required:
 *         - name
 *         - subject_id
 *         - academic_year_id
 *         - exam_date
 *         - duration
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the exam paper
 *           example: "Mathematics Mid-Term Exam"
 *         subject_id:
 *           type: integer
 *           description: ID of the subject
 *           example: 2
 *         academic_year_id:
 *           type: integer
 *           description: ID of the academic year
 *           example: 1
 *         exam_date:
 *           type: string
 *           format: date-time
 *           description: Date and time of the exam
 *           example: "2023-10-15T09:00:00Z"
 *         duration:
 *           type: integer
 *           description: Duration of the exam in minutes
 *           example: 120
 *       description: Information required to create a new exam paper
 *     
 *     CreateQuestionRequest:
 *       type: object
 *       required:
 *         - subject_id
 *         - question_text
 *         - question_type
 *       properties:
 *         subject_id:
 *           type: integer
 *           description: ID of the subject
 *           example: 2
 *         question_text:
 *           type: string
 *           description: Text of the question
 *           example: "What is the formula for the area of a circle?"
 *         question_type:
 *           type: string
 *           enum: [MCQ, LONG_ANSWER]
 *           description: Type of question
 *           example: "MCQ"
 *         options:
 *           type: object
 *           description: Options for multiple choice questions (JSON format)
 *           example: {"A": "πr", "B": "πr²", "C": "2πr", "D": "2πr²"}
 *         correct_answer:
 *           type: string
 *           description: Correct answer for the question
 *           example: "B"
 *         topic:
 *           type: string
 *           description: Topic or category of the question
 *           example: "Geometry"
 *       description: Information required to create a new question
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
 *     CreateMarkRequest:
 *       type: object
 *       required:
 *         - student_id
 *         - subclass_subject_id
 *         - exam_sequence_id
 *         - score
 *       properties:
 *         student_id:
 *           type: integer
 *           description: ID of the student
 *           example: 5
 *         academic_year_id:
 *           type: integer
 *           description: ID of the academic year (optional, defaults to current academic year)
 *           example: 1
 *         subclass_subject_id:
 *           type: integer
 *           description: ID of the subclass subject
 *           example: 3
 *         exam_sequence_id:
 *           type: integer
 *           description: ID of the exam sequence
 *           example: 2
 *         score:
 *           type: number
 *           format: float
 *           description: Score achieved by the student
 *           example: 85.5
 *       description: Information required to create a new mark
 *     
 *     UpdateMarkRequest:
 *       type: object
 *       required:
 *         - score
 *       properties:
 *         score:
 *           type: number
 *           format: float
 *           description: Updated score achieved by the student
 *           example: 87.5
 *       description: Information required to update a mark
 *
 *     # Standardized Response Schemas
 *     ExamPaperListResponse:
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
 *                 $ref: '#/components/schemas/ExamPaper'
 *             meta:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 18
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *       description: Response for a list of exam papers with pagination
 *
 *     ExamPaperDetailResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: "Mathematics Mid-Term Exam"
 *             subject:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 2
 *                 name:
 *                   type: string
 *                   example: "Mathematics"
 *                 category:
 *                   type: string
 *                   example: "SCIENCE_AND_TECHNOLOGY"
 *             exam_date:
 *               type: string
 *               format: date-time
 *               example: "2023-10-15T09:00:00Z"
 *             duration:
 *               type: integer
 *               example: 120
 *             academic_year:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "2023-2024"
 *             questions:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 3
 *                   question_text:
 *                     type: string
 *                     example: "What is the formula for the area of a circle?"
 *                   question_type:
 *                     type: string
 *                     example: "MCQ"
 *                   options:
 *                     type: object
 *                     example: {"A": "πr", "B": "πr²", "C": "2πr", "D": "2πr²"}
 *                   order:
 *                     type: integer
 *                     example: 1
 *             created_at:
 *               type: string
 *               format: date-time
 *               example: "2023-09-01T12:00:00Z"
 *       description: Response for a detailed view of an exam paper including questions
 *
 *     ExamPaperCreatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/ExamPaper'
 *         message:
 *           type: string
 *           example: "Exam paper created successfully"
 *       description: Response after successfully creating an exam paper
 *
 *     QuestionListResponse:
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
 *                 $ref: '#/components/schemas/Question'
 *             meta:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 45
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 15
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *       description: Response for a list of questions with pagination
 *
 *     QuestionCreatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Question'
 *         message:
 *           type: string
 *           example: "Question created successfully"
 *       description: Response after successfully creating a question
 *
 *     QuestionsAddedToExamResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ExamPaperQuestion'
 *         message:
 *           type: string
 *           example: "Questions added to exam successfully"
 *       description: Response after successfully adding questions to an exam paper
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
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 