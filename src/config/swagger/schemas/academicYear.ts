/**
 * @swagger
 * components:
 *   schemas:
 *     Term:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Term ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Term name
 *           example: First Term
 *         startDate:
 *           type: string
 *           format: date
 *           description: Term start date
 *           example: 2023-09-01
 *         endDate:
 *           type: string
 *           format: date
 *           description: Term end date
 *           example: 2023-12-15
 *         feeDeadline:
 *           type: string
 *           format: date
 *           description: Deadline for fee payment
 *           example: 2023-10-15
 *         academicYearId:
 *           type: integer
 *           description: ID of the academic year this term belongs to
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the term was created
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the term was last updated
 *           example: 2023-01-01T12:00:00.000Z
 *
 *     AcademicYear:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Academic year ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Academic year name
 *           example: 2023-2024 Academic Year
 *         startDate:
 *           type: string
 *           format: date
 *           description: Academic year start date
 *           example: 2023-09-01
 *         endDate:
 *           type: string
 *           format: date
 *           description: Academic year end date
 *           example: 2024-06-30
 *         isActive:
 *           type: boolean
 *           description: Indicates if this is the current academic year
 *           example: true
 *         terms:
 *           type: array
 *           description: Terms within this academic year
 *           items:
 *             $ref: '#/components/schemas/Term'
 *         examPapers:
 *           type: array
 *           description: Exam papers associated with this academic year
 *           items:
 *             type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: 2023-01-01T12:00:00.000Z
 *
 *     CreateAcademicYearRequest:
 *       type: object
 *       required:
 *         - name
 *         - startDate
 *         - endDate
 *       properties:
 *         name:
 *           type: string
 *           description: Academic year name
 *           example: 2024-2025 Academic Year
 *         startDate:
 *           type: string
 *           format: date
 *           description: Academic year start date
 *           example: 2024-09-01
 *         endDate:
 *           type: string
 *           format: date
 *           description: Academic year end date
 *           example: 2025-06-30
 *         terms:
 *           type: array
 *           description: Terms to create with this academic year
 *           items:
 *             $ref: '#/components/schemas/TermRequest'
 *
 *     UpdateAcademicYearRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Academic year name
 *           example: 2024-2025 Academic Year Update
 *         startDate:
 *           type: string
 *           format: date
 *           description: Academic year start date
 *           example: 2024-08-15
 *         endDate:
 *           type: string
 *           format: date
 *           description: Academic year end date
 *           example: 2025-06-15
 *
 *     TermRequest:
 *       type: object
 *       required:
 *         - name
 *         - startDate
 *         - endDate
 *       properties:
 *         name:
 *           type: string
 *           description: Term name
 *           example: Second Term
 *         startDate:
 *           type: string
 *           format: date
 *           description: Term start date
 *           example: 2024-01-10
 *         endDate:
 *           type: string
 *           format: date
 *           description: Term end date
 *           example: 2024-04-15
 *         feeDeadline:
 *           type: string
 *           format: date
 *           description: Deadline for fee payment
 *           example: 2024-02-15
 *
 *     # Standardized Response Schemas
 *     AcademicYearListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AcademicYear'
 *       description: Response for a successful request to retrieve a list of academic years
 *
 *     AcademicYearDetailResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/AcademicYear'
 *       description: Response for a successful request to retrieve details of a specific academic year
 *
 *     AcademicYearCreatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/AcademicYear'
 *       description: Response for a successful request to create a new academic year
 *
 *     AcademicYearUpdatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/AcademicYear'
 *       description: Response for a successful request to update an academic year
 *
 *     TermCreatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Term'
 *       description: Response for a successful request to create a new term
 *
 *     TermUpdatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Term'
 *       description: Response for a successful request to update a term
 *
 *     TermDeletedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Term deleted successfully
 *       description: Response for a successful request to delete a term
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "An error occurred"
 *       description: Response for an unsuccessful request
 */

export { }; 