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
 *         baseFee:
 *           type: number
 *           format: float
 *           description: Base tuition fee for the class
 *           example: 75000
 *         newStudentAddFee:
 *           type: number
 *           format: float
 *           description: Additional fee for new students enrolling in this class
 *           example: 10000
 *         oldStudentAddFee:
 *           type: number
 *           format: float
 *           description: Additional fee for returning students enrolling in this class
 *           example: 5000
 *         miscellaneousFee:
 *           type: number
 *           format: float
 *           description: Miscellaneous fees for the class
 *           example: 2500
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
 *         baseFee:
 *           type: number
 *           format: float
 *           description: Base tuition fee for the class
 *           example: 75000
 *         newStudentAddFee:
 *           type: number
 *           format: float
 *           description: Additional fee for new students enrolling in this class
 *           example: 10000
 *         oldStudentAddFee:
 *           type: number
 *           format: float
 *           description: Additional fee for returning students enrolling in this class
 *           example: 5000
 *         miscellaneousFee:
 *           type: number
 *           format: float
 *           description: Miscellaneous fees for the class
 *           example: 2500
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
 *           description: Name of the new class
 *           example: "Form 2"
 *         level:
 *           type: integer
 *           description: Class level (optional)
 *           example: 2
 *         baseFee:
 *           type: number
 *           format: float
 *           description: Base tuition fee (optional)
 *           example: 80000
 *         newStudentAddFee:
 *           type: number
 *           format: float
 *           description: Additional fee for new students (optional)
 *           example: 12000
 *         oldStudentAddFee:
 *           type: number
 *           format: float
 *           description: Additional fee for returning students (optional)
 *           example: 6000
 *         miscellaneousFee:
 *           type: number
 *           format: float
 *           description: Miscellaneous fees (optional)
 *           example: 3000
 *       description: Information required to create a new class
 *     
 *     UpdateClassRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: New name for the class
 *           example: "Form 1 Updated"
 *         level:
 *           type: integer
 *           description: New class level
 *           example: 1
 *         baseFee:
 *           type: number
 *           format: float
 *           description: New base tuition fee
 *           example: 78000
 *         newStudentAddFee:
 *           type: number
 *           format: float
 *           description: New additional fee for new students
 *           example: 11000
 *         oldStudentAddFee:
 *           type: number
 *           format: float
 *           description: New additional fee for returning students
 *           example: 5500
 *         miscellaneousFee:
 *           type: number
 *           format: float
 *           description: New miscellaneous fees
 *           example: 2800
 *     
 *     CreateSubclassRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the new subclass
 *           example: "Form 1B"
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
