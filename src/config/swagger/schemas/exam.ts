/**
 * @swagger
 * components:
 *   schemas:
 *     Exam:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Exam ID
 *           example: 1
 *         title:
 *           type: string
 *           description: Exam title
 *           example: Mid-Term Assessment
 *         description:
 *           type: string
 *           description: Exam description
 *           example: Mathematics mid-term assessment covering chapters 1-5
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date and time of the exam
 *           example: 2023-10-15T09:00:00.000Z
 *         duration:
 *           type: integer
 *           description: Duration of the exam in minutes
 *           example: 120
 *         maxScore:
 *           type: integer
 *           description: Maximum possible score for the exam
 *           example: 100
 *         passScore:
 *           type: integer
 *           description: Minimum score required to pass the exam
 *           example: 60
 *         subjectId:
 *           type: integer
 *           description: ID of the subject for this exam
 *           example: 1
 *         termId:
 *           type: integer
 *           description: ID of the term for this exam
 *           example: 2
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the exam was created
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the exam was last updated
 *           example: 2023-01-01T12:00:00.000Z
 *
 *     ExamDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Exam ID
 *           example: 1
 *         title:
 *           type: string
 *           description: Exam title
 *           example: Mid-Term Assessment
 *         description:
 *           type: string
 *           description: Exam description
 *           example: Mathematics mid-term assessment covering chapters 1-5
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date and time of the exam
 *           example: 2023-10-15T09:00:00.000Z
 *         duration:
 *           type: integer
 *           description: Duration of the exam in minutes
 *           example: 120
 *         maxScore:
 *           type: integer
 *           description: Maximum possible score for the exam
 *           example: 100
 *         passScore:
 *           type: integer
 *           description: Minimum score required to pass the exam
 *           example: 60
 *         subject:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: Subject ID
 *               example: 1
 *             name:
 *               type: string
 *               description: Subject name
 *               example: Mathematics
 *         term:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: Term ID
 *               example: 2
 *             name:
 *               type: string
 *               description: Term name
 *               example: Second Term
 *         marks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Mark'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the exam was created
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the exam was last updated
 *           example: 2023-01-01T12:00:00.000Z
 *
 *     Mark:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Mark ID
 *           example: 1
 *         score:
 *           type: number
 *           description: Student's score for the exam
 *           example: 85
 *         comment:
 *           type: string
 *           description: Teacher's comment on the mark
 *           example: Excellent work on problem-solving questions
 *         examId:
 *           type: integer
 *           description: ID of the exam this mark is for
 *           example: 1
 *         studentId:
 *           type: integer
 *           description: ID of the student this mark belongs to
 *           example: 10
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the mark was created
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the mark was last updated
 *           example: 2023-01-01T12:00:00.000Z
 *
 *     CreateExamRequest:
 *       type: object
 *       required:
 *         - title
 *         - date
 *         - maxScore
 *         - passScore
 *         - subjectId
 *         - termId
 *       properties:
 *         title:
 *           type: string
 *           description: Exam title
 *           example: Final Examination
 *         description:
 *           type: string
 *           description: Exam description
 *           example: Comprehensive assessment covering all course material
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the exam
 *           example: 2023-12-10
 *         duration:
 *           type: integer
 *           description: Duration of the exam in minutes
 *           example: 180
 *         maxScore:
 *           type: integer
 *           description: Maximum possible score for the exam
 *           example: 100
 *         passScore:
 *           type: integer
 *           description: Minimum score required to pass the exam
 *           example: 50
 *         subjectId:
 *           type: integer
 *           description: ID of the subject for this exam
 *           example: 2
 *         termId:
 *           type: integer
 *           description: ID of the term for this exam
 *           example: 3
 *
 *     UpdateExamRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Exam title
 *           example: Updated Final Examination
 *         description:
 *           type: string
 *           description: Exam description
 *           example: Comprehensive assessment with revised content
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the exam
 *           example: 2023-12-15
 *         duration:
 *           type: integer
 *           description: Duration of the exam in minutes
 *           example: 150
 *         maxScore:
 *           type: integer
 *           description: Maximum possible score for the exam
 *           example: 120
 *         passScore:
 *           type: integer
 *           description: Minimum score required to pass the exam
 *           example: 65
 *
 *     CreateMarkRequest:
 *       type: object
 *       required:
 *         - score
 *         - studentId
 *       properties:
 *         score:
 *           type: number
 *           description: Student's score for the exam
 *           example: 92
 *         comment:
 *           type: string
 *           description: Teacher's comment on the mark
 *           example: Outstanding performance in all sections
 *         studentId:
 *           type: integer
 *           description: ID of the student this mark belongs to
 *           example: 12
 *
 *     UpdateMarkRequest:
 *       type: object
 *       properties:
 *         score:
 *           type: number
 *           description: Student's score for the exam
 *           example: 95
 *         comment:
 *           type: string
 *           description: Teacher's comment on the mark
 *           example: Revised score after review - excellent work
 */

export {}; 