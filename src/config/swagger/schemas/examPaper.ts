/**
 * @swagger
 * components:
 *   schemas:
 *     ExamPaper:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Exam paper ID
 *           example: 1
 *         title:
 *           type: string
 *           description: Exam paper title
 *           example: Mathematics Exam Paper
 *         description:
 *           type: string
 *           description: Description of the exam paper
 *           example: Final mathematics examination for term 1
 *         subjectId:
 *           type: integer
 *           description: ID of the subject associated with this exam paper
 *           example: 3
 *         termId:
 *           type: integer
 *           description: ID of the term associated with this exam paper
 *           example: 1
 *         classId:
 *           type: integer
 *           description: ID of the class for which this exam paper is designated
 *           example: 2
 *         academicYearId:
 *           type: integer
 *           description: ID of the academic year for this exam paper
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the exam paper was created
 *           example: 2023-03-01T12:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the exam paper was last updated
 *           example: 2023-03-05T15:30:00Z
 *         questions:
 *           type: array
 *           description: List of questions in this exam paper
 *           items:
 *             $ref: '#/components/schemas/Question'
 * 
 *     Question:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Question ID
 *           example: 1
 *         examPaperId:
 *           type: integer
 *           description: ID of the exam paper this question belongs to
 *           example: 1
 *         text:
 *           type: string
 *           description: Question text
 *           example: Solve for x in the equation 2x + 5 = 15
 *         type:
 *           $ref: '#/components/schemas/QuestionType'
 *           description: Type of question
 *           example: MCQ
 *         points:
 *           type: integer
 *           description: Maximum points for this question
 *           example: 5
 *         sequence:
 *           type: integer
 *           description: Order of the question in the exam paper
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the question was created
 *           example: 2023-03-02T10:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the question was last updated
 *           example: 2023-03-02T10:00:00Z
 *         options:
 *           type: array
 *           description: List of answer options for multiple choice questions
 *           items:
 *             $ref: '#/components/schemas/Option'
 * 
 *     Option:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Option ID
 *           example: 1
 *         questionId:
 *           type: integer
 *           description: ID of the question this option belongs to
 *           example: 1
 *         text:
 *           type: string
 *           description: Option text
 *           example: x = 5
 *         sequence:
 *           type: integer
 *           description: Order of the option in the list
 *           example: 1
 *         isCorrect:
 *           type: boolean
 *           description: Whether this option is correct
 *           example: true
 * 
 *     ExamSubmission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Submission ID
 *           example: 1
 *         examPaperId:
 *           type: integer
 *           description: ID of the exam paper this submission is for
 *           example: 1
 *         studentId:
 *           type: integer
 *           description: ID of the student who made the submission
 *           example: 15
 *         submittedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the submission was made
 *           example: 2023-03-15T14:30:00Z
 *         totalScore:
 *           type: integer
 *           description: Total score achieved
 *           example: 85
 *         totalPossible:
 *           type: integer
 *           description: Maximum possible score
 *           example: 100
 *         status:
 *           type: string
 *           enum: [SUBMITTED, GRADED, PENDING_REVIEW]
 *           description: Status of the submission
 *           example: GRADED
 *         answers:
 *           type: array
 *           description: List of answers provided in this submission
 *           items:
 *             $ref: '#/components/schemas/Answer'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the submission record was created
 *           example: 2023-03-15T14:30:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the submission was last updated
 *           example: 2023-03-16T09:00:00Z
 * 
 *     Answer:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Answer ID
 *           example: 1
 *         submissionId:
 *           type: integer
 *           description: ID of the submission this answer belongs to
 *           example: 1
 *         questionId:
 *           type: integer
 *           description: ID of the question this answer responds to
 *           example: 1
 *         text:
 *           type: string
 *           description: Text answer
 *           example: x = 5
 *         selectedOptions:
 *           type: array
 *           description: IDs of selected options (for multiple choice questions)
 *           items:
 *             type: integer
 *           example: [1]
 *         points:
 *           type: integer
 *           description: Points awarded for this answer
 *           example: 5
 *         comment:
 *           type: string
 *           description: Teacher's comment on this answer
 *           example: Correct solution with clear working
 *         isCorrect:
 *           type: boolean
 *           description: Whether the answer is correct
 *           example: true
 * 
 *     CreateExamPaperRequest:
 *       type: object
 *       required:
 *         - title
 *         - subjectId
 *         - termId
 *         - classId
 *         - academicYearId
 *       properties:
 *         title:
 *           type: string
 *           description: Exam paper title
 *           example: Mathematics Exam Paper
 *         description:
 *           type: string
 *           description: Description of the exam paper
 *           example: Final mathematics examination for term 1
 *         subjectId:
 *           type: integer
 *           description: ID of the subject
 *           example: 3
 *         termId:
 *           type: integer
 *           description: ID of the term
 *           example: 1
 *         classId:
 *           type: integer
 *           description: ID of the class
 *           example: 2
 *         academicYearId:
 *           type: integer
 *           description: ID of the academic year
 *           example: 1
 *         totalTimeMinutes:
 *           type: integer
 *           description: Total time allowed for the exam in minutes
 *           example: 120
 *         passingPercentage:
 *           type: integer
 *           description: Percentage score required to pass
 *           example: 50
 *         questions:
 *           type: array
 *           description: Questions to include in the exam paper
 *           items:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Question text
 *                 example: Solve for x in the equation 2x + 5 = 15
 *               type:
 *                 $ref: '#/components/schemas/QuestionType'
 *                 description: Type of question
 *                 example: MCQ
 *               points:
 *                 type: integer
 *                 description: Maximum points for this question
 *                 example: 5
 *               sequence:
 *                 type: integer
 *                 description: Order of the question in the exam paper
 *                 example: 1
 *               options:
 *                 type: array
 *                 description: Answer options for multiple choice questions
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                       description: Option text
 *                       example: x = 5
 *                     isCorrect:
 *                       type: boolean
 *                       description: Whether this option is correct
 *                       example: true
 *                     sequence:
 *                       type: integer
 *                       description: Order of the option in the list
 *                       example: 1
 * 
 *     SubmitExamRequest:
 *       type: object
 *       required:
 *         - examPaperId
 *         - studentId
 *         - answers
 *       properties:
 *         examPaperId:
 *           type: integer
 *           description: ID of the exam paper
 *           example: 1
 *         studentId:
 *           type: integer
 *           description: ID of the student making the submission
 *           example: 15
 *         answers:
 *           type: array
 *           description: Answers to questions
 *           items:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: integer
 *                 description: ID of the question
 *                 example: 1
 *               text:
 *                 type: string
 *                 description: Text answer
 *                 example: x = 5
 *               selectedOptions:
 *                 type: array
 *                 description: IDs of selected options (for multiple choice questions)
 *                 items:
 *                   type: integer
 *                 example: [1]
 * 
 *     ExamPaperResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/ExamPaper'
 * 
 *     SubmissionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/ExamSubmission'
 * 
 *     GradeAnswerRequest:
 *       type: object
 *       required:
 *         - points
 *       properties:
 *         points:
 *           type: integer
 *           description: Points to award for the answer
 *           example: 4
 *         comment:
 *           type: string
 *           description: Comment on the student's answer
 *           example: Good attempt but missed one step in the solution
 *         isCorrect:
 *           type: boolean
 *           description: Whether the answer is correct
 *           example: false
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 