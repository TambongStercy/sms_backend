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
 *           format: date-time
 *           description: Term start date
 *           example: 2023-09-01T00:00:00.000Z
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Term end date
 *           example: 2023-12-20T00:00:00.000Z
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
 *           example: 2023-2024
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Academic year start date
 *           example: 2023-09-01T00:00:00.000Z
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Academic year end date
 *           example: 2024-06-30T00:00:00.000Z
 *         isDefault:
 *           type: boolean
 *           description: Whether this is the default academic year
 *           example: true
 *         terms:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Term'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the academic year was created
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the academic year was last updated
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
 *           example: 2024-2025
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
 *         isDefault:
 *           type: boolean
 *           description: Whether this should be the default academic year
 *           example: false
 *
 *     UpdateAcademicYearRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Academic year name
 *           example: 2024-2025 Updated
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
 *         isDefault:
 *           type: boolean
 *           description: Whether this should be the default academic year
 *           example: false
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
 *     AcademicYearDeletedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Academic year deleted successfully"
 *       description: Response for a successful request to delete an academic year
 *
 *     AcademicYearDefaultResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Academic year 2023-2024 set as default"
 *         data:
 *           $ref: '#/components/schemas/AcademicYear'
 *       description: Response for a successful request to set an academic year as default
 *
 *     TermCreatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Term \"First Term\" added to academic year 2023-2024"
 *         data:
 *           $ref: '#/components/schemas/Term'
 *       description: Response for a successful request to add a term to an academic year
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