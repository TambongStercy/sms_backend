/**
 * @swagger
 * components:
 *   schemas:
 *     StudentSequenceAverage:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the student average record
 *           example: 1
 *         enrollmentId:
 *           type: integer
 *           description: ID of the student enrollment
 *           example: 42
 *         examSequenceId:
 *           type: integer
 *           description: ID of the exam sequence
 *           example: 3
 *         average:
 *           type: number
 *           format: float
 *           description: The calculated average score
 *           example: 15.75
 *         rank:
 *           type: integer
 *           description: The student's rank in their class for this exam sequence
 *           example: 5
 *         totalStudents:
 *           type: integer
 *           description: Total number of students in the class used for calculating rank
 *           example: 45
 *         decision:
 *           type: string
 *           description: Academic decision based on the student's performance
 *           example: "Pass with distinction"
 *         status:
 *           type: string
 *           enum: [PENDING, CALCULATED, VERIFIED]
 *           description: Status of the average calculation
 *           example: "VERIFIED"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-05-20T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-05-20T15:30:00Z"
 *       description: Represents a student's average score for a specific exam sequence
 *
 *     StudentAverageDecisionUpdate:
 *       type: object
 *       required:
 *         - decision
 *       properties:
 *         decision:
 *           type: string
 *           description: Academic decision to be recorded
 *           example: "Admitted to next class"
 *       description: Request body for updating a student's academic decision
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 