/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique subject ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Subject name
 *           example: Mathematics
 *         category:
 *           $ref: '#/components/schemas/SubjectCategory'
 *           description: Subject category
 *           example: SCIENCE_AND_TECHNOLOGY
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
 *         subjectTeachers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubjectTeacher'
 *         subclassSubjects:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubclassSubject'
 *
 *     SubjectTeacher:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         subjectId:
 *           type: integer
 *           example: 1
 *         teacherId:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00.000Z
 *
 *     AssignSubjectToClassRequest:
 *       type: object
 *       required:
 *         - coefficient
 *         - mainTeacherId
 *       properties:
 *         coefficient:
 *           type: number
 *           description: Coefficient (weight) of the subject in the curriculum
 *           example: 4
 *         mainTeacherId:
 *           type: integer
 *           description: ID of the main teacher for this subject
 *           example: 3
 *       description: Information required to assign a subject to all subclasses of a class
 *     
 *     SubclassSubjectResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: SubclassSubject ID
 *           example: 1
 *         subjectId:
 *           type: integer
 *           description: Subject ID
 *           example: 1
 *         subclassId:
 *           type: integer
 *           description: Subclass ID
 *           example: 2
 *         coefficient:
 *           type: number
 *           description: Subject coefficient
 *           example: 4
 *         mainTeacherId:
 *           type: integer
 *           description: Main teacher ID
 *           example: 3
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the relationship was created
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the relationship was last updated
 *           example: 2023-01-01T12:00:00.000Z
 *         subject:
 *           $ref: '#/components/schemas/Subject'
 *         subclass:
 *           $ref: '#/components/schemas/Subclass'
 *         mainTeacher:
 *           $ref: '#/components/schemas/User'
 *       description: SubclassSubject relationship information
 *     
 *     AssignSubjectToClassResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Subject successfully assigned to all subclasses of class ID 1"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubclassSubjectResponse'
 *       description: Response for successfully assigning a subject to all subclasses of a class
 */

export { }; 
