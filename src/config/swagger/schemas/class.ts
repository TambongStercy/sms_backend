/**
 * @swagger
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Class ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Class name
 *           example: "Form 1"
 *         level:
 *           type: integer
 *           description: Hierarchical level of the class (used to determine class progression)
 *           example: 1
 *         feeAmount:
 *           type: number
 *           format: float
 *           description: Fee amount to be paid for this class
 *           example: 75000
 *         description:
 *           type: string
 *           description: Class description
 *           example: "First year of secondary school"
 *         studentCount:
 *           type: integer
 *           description: Total number of students enrolled in all subclasses of this class for the current academic year
 *           example: 45
 *         academicYearId:
 *           type: integer
 *           description: ID of the current academic year used for student count
 *           example: 3
 *         subclasses:
 *           type: array
 *           description: Subclasses belonging to this class
 *           items:
 *             $ref: '#/components/schemas/Subclass'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the class was created
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the class was last updated
 *           example: 2023-01-01T12:00:00.000Z
 *       description: Class information
 *     
 *     Subclass:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Subclass ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Subclass name
 *           example: "Form 1A"
 *         description:
 *           type: string
 *           description: Subclass description
 *           example: "Form 1, Section A"
 *         studentCount:
 *           type: integer
 *           description: Number of students enrolled in this subclass for the current academic year
 *           example: 25
 *         academicYearId:
 *           type: integer
 *           description: ID of the current academic year used for student count
 *           example: 3
 *         classId:
 *           type: integer
 *           description: ID of the parent class
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the subclass was created
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the subclass was last updated
 *           example: 2023-01-01T12:00:00.000Z
 *       description: Subclass information
 *     
 *     ClassDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Class ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Class name
 *           example: "Form 1"
 *         level:
 *           type: integer
 *           description: Hierarchical level of the class (used to determine class progression)
 *           example: 1
 *         feeAmount:
 *           type: number
 *           format: float
 *           description: Fee amount to be paid for this class
 *           example: 75000
 *         description:
 *           type: string
 *           description: Class description
 *           example: "First year of secondary school"
 *         studentCount:
 *           type: integer
 *           description: Total number of students enrolled in all subclasses of this class for the current academic year
 *           example: 45
 *         academicYearId:
 *           type: integer
 *           description: ID of the current academic year used for student count
 *           example: 3
 *         subclasses:
 *           type: array
 *           description: Subclasses belonging to this class
 *           items:
 *             $ref: '#/components/schemas/Subclass'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the class was created
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the class was last updated
 *           example: 2023-01-01T12:00:00.000Z
 *       description: Detailed class information including subclasses
 *     
 *     CreateClassRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Class name
 *           example: "Form 2"
 *         level:
 *           type: integer
 *           description: Hierarchical level of the class (used to determine class progression)
 *           example: 2
 *         feeAmount:
 *           type: number
 *           format: float
 *           description: Fee amount to be paid for this class
 *           example: 85000
 *         description:
 *           type: string
 *           description: Class description
 *           example: "Second year of secondary school"
 *       description: Information required to create a new class
 *     
 *     CreateSubclassRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Subclass name
 *           example: "Form 1B"
 *         description:
 *           type: string
 *           description: Subclass description
 *           example: "Form 1, Section B"
 *       description: Information required to create a new subclass
 *     
 *     PaginatedClassResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Class'
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 6
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 20
 *             totalPages:
 *               type: integer
 *               example: 1
 *       description: Response for a list of classes with pagination
 *     
 *     ClassCreatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Class created successfully"
 *         data:
 *           $ref: '#/components/schemas/Class'
 *       description: Response after successfully creating a class
 *     
 *     SubclassCreatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Subclass created successfully"
 *         data:
 *           $ref: '#/components/schemas/Subclass'
 *       description: Response after successfully creating a subclass
 *     
 *     SubclassDeletedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Subclass deleted successfully"
 *       description: Response after successfully deleting a subclass
 *     
 *     ClassFilterOptions:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Filter classes by name
 *           example: "Form 1"
 *         id:
 *           type: integer
 *           description: Filter classes by ID
 *           example: 1
 *       description: Filter options for class queries
 *     
 *     StandardResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           description: Response data (varies by endpoint)
 *         message:
 *           type: string
 *           description: Optional success message
 *           example: "Class created successfully"
 *       description: Standard response format for all endpoints
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           description: Error message
 *           example: "Invalid request parameters"
 *       description: Standard error response format
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 
