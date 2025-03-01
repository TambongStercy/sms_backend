/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Subject ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Subject name
 *           example: Mathematics
 *         shortName:
 *           type: string
 *           description: Short form of the subject name
 *           example: Math
 *         code:
 *           type: string
 *           description: Subject code
 *           example: MATH101
 *         description:
 *           type: string
 *           description: Subject description
 *           example: Basic mathematical principles and concepts
 *         classLevel:
 *           type: string
 *           description: Grade or class level
 *           example: Grade 10
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the subject was created
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the subject was last updated
 *           example: 2023-01-01T12:00:00.000Z
 *
 *     SubjectDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Subject ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Subject name
 *           example: Mathematics
 *         shortName:
 *           type: string
 *           description: Short form of the subject name
 *           example: Math
 *         code:
 *           type: string
 *           description: Subject code
 *           example: MATH101
 *         description:
 *           type: string
 *           description: Subject description
 *           example: Basic mathematical principles and concepts
 *         classLevel:
 *           type: string
 *           description: Grade or class level
 *           example: Grade 10
 *         teachers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Teacher ID
 *               name:
 *                 type: string
 *                 description: Teacher name
 *               email:
 *                 type: string
 *                 description: Teacher email
 *         subclasses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Subclass ID
 *               name:
 *                 type: string
 *                 description: Subclass name
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the subject was created
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the subject was last updated
 *           example: 2023-01-01T12:00:00.000Z
 *
 *     CreateSubjectRequest:
 *       type: object
 *       required:
 *         - name
 *         - shortName
 *         - code
 *         - classLevel
 *       properties:
 *         name:
 *           type: string
 *           description: Subject name
 *           example: Physics
 *         shortName:
 *           type: string
 *           description: Short form of the subject name
 *           example: Phys
 *         code:
 *           type: string
 *           description: Subject code
 *           example: PHYS101
 *         description:
 *           type: string
 *           description: Subject description
 *           example: Introduction to basic principles of physics
 *         classLevel:
 *           type: string
 *           description: Grade or class level
 *           example: Grade 11
 *
 *     UpdateSubjectRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Subject name
 *           example: Advanced Physics
 *         shortName:
 *           type: string
 *           description: Short form of the subject name
 *           example: AP
 *         code:
 *           type: string
 *           description: Subject code
 *           example: PHYS201
 *         description:
 *           type: string
 *           description: Subject description
 *           example: Advanced physics concepts including mechanics and thermodynamics
 *         classLevel:
 *           type: string
 *           description: Grade or class level
 *           example: Grade 12
 *
 *     AssignTeacherRequest:
 *       type: object
 *       required:
 *         - teacherId
 *       properties:
 *         teacherId:
 *           type: integer
 *           description: ID of the teacher to assign to the subject
 *           example: 5
 */

export { }; 