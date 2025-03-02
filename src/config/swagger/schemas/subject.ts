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
 *         category:
 *           type: string
 *           enum: [SCIENCE_AND_TECHNOLOGY, LANGUAGES_AND_LITERATURE, HUMAN_AND_SOCIAL_SCIENCE, OTHERS]
 *           description: Subject category
 *           example: SCIENCE_AND_TECHNOLOGY
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the subject was created
 *           example: 2023-01-01T12:00:00.000Z
 *         updated_at:
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
 *         category:
 *           type: string
 *           enum: [SCIENCE_AND_TECHNOLOGY, LANGUAGES_AND_LITERATURE, HUMAN_AND_SOCIAL_SCIENCE, OTHERS]
 *           description: Subject category
 *           example: SCIENCE_AND_TECHNOLOGY
 *         subject_teachers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: SubjectTeacher ID
 *               teacher:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Teacher ID
 *                   name:
 *                     type: string
 *                     description: Teacher name
 *                   email:
 *                     type: string
 *                     description: Teacher email
 *         subclass_subjects:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: SubclassSubject ID
 *               coefficient:
 *                 type: number
 *                 description: Subject coefficient in this subclass
 *               subclass:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Subclass ID
 *                   name:
 *                     type: string
 *                     description: Subclass name
 *                   class:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Class ID
 *                       name:
 *                         type: string
 *                         description: Class name
 *               main_teacher:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Teacher ID
 *                   name:
 *                     type: string
 *                     description: Teacher name
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the subject was created
 *           example: 2023-01-01T12:00:00.000Z
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the subject was last updated
 *           example: 2023-01-01T12:00:00.000Z
 *
 *     CreateSubjectRequest:
 *       type: object
 *       required:
 *         - name
 *         - category
 *       properties:
 *         name:
 *           type: string
 *           description: Subject name
 *           example: Physics
 *         category:
 *           type: string
 *           enum: [SCIENCE_AND_TECHNOLOGY, LANGUAGES_AND_LITERATURE, HUMAN_AND_SOCIAL_SCIENCE, OTHERS]
 *           description: Subject category
 *           example: SCIENCE_AND_TECHNOLOGY
 *
 *     UpdateSubjectRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Subject name
 *           example: Advanced Physics
 *         category:
 *           type: string
 *           enum: [SCIENCE_AND_TECHNOLOGY, LANGUAGES_AND_LITERATURE, HUMAN_AND_SOCIAL_SCIENCE, OTHERS]
 *           description: Subject category
 *           example: SCIENCE_AND_TECHNOLOGY
 *
 *     AssignTeacherRequest:
 *       type: object
 *       required:
 *         - teacher_id
 *       properties:
 *         teacher_id:
 *           type: integer
 *           description: ID of the teacher to assign to the subject
 *           example: 5
 */

export { }; 