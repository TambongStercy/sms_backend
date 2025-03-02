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
 *         matricule:
 *           type: string
 *           description: Student's matriculation number
 *           example: "STD2023001"
 *         name:
 *           type: string
 *           description: Student's full name
 *           example: "John Doe"
 *         date_of_birth:
 *           type: string
 *           format: date
 *           description: Student's date of birth
 *           example: "2005-05-15"
 *         place_of_birth:
 *           type: string
 *           description: Student's place of birth
 *           example: "Yaoundé"
 *         gender:
 *           type: string
 *           enum: [Female, Male]
 *           description: Student's gender
 *           example: "Male"
 *         residence:
 *           type: string
 *           description: Student's current residence
 *           example: "123 Student Housing, Yaoundé"
 *         former_school:
 *           type: string
 *           description: Student's previous school (if applicable)
 *           example: "Primary School XYZ"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the student record was created
 *           example: "2023-01-01T12:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the student record was last updated
 *           example: "2023-01-01T12:00:00Z"
 *       description: Student information
 *     
 *     StudentDetail:
 *       type: object
 *       properties:
 *         student:
 *           $ref: '#/components/schemas/Student'
 *         parents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         enrollments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Enrollment'
 *       description: Detailed student information including parents and enrollments
 *     
 *     CreateStudentRequest:
 *       type: object
 *       required:
 *         - name
 *         - matricule
 *         - date_of_birth
 *         - place_of_birth
 *         - gender
 *         - residence
 *       properties:
 *         name:
 *           type: string
 *           description: Student's full name
 *           example: "John Doe"
 *         matricule:
 *           type: string
 *           description: Student's matriculation number
 *           example: "STD2023001"
 *         date_of_birth:
 *           type: string
 *           format: date
 *           description: Student's date of birth
 *           example: "2005-05-15"
 *         place_of_birth:
 *           type: string
 *           description: Student's place of birth
 *           example: "Yaoundé"
 *         gender:
 *           type: string
 *           enum: [Female, Male]
 *           description: Student's gender
 *           example: "Male"
 *         residence:
 *           type: string
 *           description: Student's current residence
 *           example: "123 Student Housing, Yaoundé"
 *         former_school:
 *           type: string
 *           description: Student's previous school (if applicable)
 *           example: "Primary School XYZ"
 *       description: Information required to create a new student
 *     
 *     Enrollment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Enrollment ID
 *           example: 1
 *         student_id:
 *           type: integer
 *           description: ID of the enrolled student
 *           example: 1
 *         subclass_id:
 *           type: integer
 *           description: ID of the subclass the student is enrolled in
 *           example: 2
 *         academic_year_id:
 *           type: integer
 *           description: ID of the academic year
 *           example: 1
 *         repeater:
 *           type: boolean
 *           description: Whether the student is repeating this class
 *           example: false
 *         photo:
 *           type: string
 *           description: URL to student's photo
 *           example: "https://example.com/photos/student1.jpg"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the enrollment was created
 *           example: "2023-01-01T12:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the enrollment was last updated
 *           example: "2023-01-01T12:00:00Z"
 *       description: Student enrollment information
 *     
 *     EnrollStudentRequest:
 *       type: object
 *       required:
 *         - subclass_id
 *         - academic_year_id
 *         - photo
 *       properties:
 *         subclass_id:
 *           type: integer
 *           description: ID of the subclass to enroll the student in
 *           example: 2
 *         academic_year_id:
 *           type: integer
 *           description: ID of the academic year
 *           example: 1
 *         repeater:
 *           type: boolean
 *           description: Whether the student is repeating this class
 *           example: false
 *         photo:
 *           type: string
 *           description: URL or base64 encoded string of student's photo
 *           example: "https://example.com/photos/student1.jpg"
 *       description: Information required to enroll a student in a class
 *     
 *     LinkParentRequest:
 *       type: object
 *       required:
 *         - parent_id
 *       properties:
 *         parent_id:
 *           type: integer
 *           description: ID of the parent to link to the student
 *           example: 5
 *       description: Information required to link a parent to a student
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 