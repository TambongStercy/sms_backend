/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the student
 *           example: 1
 *         name:
 *           type: string
 *           description: Full name of the student
 *           example: "John Doe"
 *         matricule:
 *           type: string
 *           description: Student's matriculation number
 *           example: "2023001"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Student's date of birth
 *           example: "2010-05-15"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T12:00:00Z"
 *       description: Student information
 *
 *     EnrollStudentRequest:
 *       type: object
 *       required:
 *         - sub_classId
 *         - photo
 *       properties:
 *         sub_classId:
 *           type: integer
 *           description: ID of the sub_class to enroll the student in
 *           example: 5
 *         academicYearId:
 *           type: integer
 *           description: ID of the academic year (optional, defaults to current academic year)
 *           example: 2
 *         photo:
 *           type: string
 *           description: URL or path to the student's photo
 *           example: "student_photo_url.jpg"
 *         repeater:
 *           type: boolean
 *           description: Whether the student is repeating the class
 *           default: false
 *           example: false
 *       description: Information required to enroll a student in a sub_class. Upon enrollment, a school fee record will be automatically created based on the fee_amount set in the parent class.
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 
