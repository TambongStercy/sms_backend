/**
 * @swagger
 * components:
 *   schemas:
 *     SchoolFee:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the school fee record
 *           example: 1
 *         amount_expected:
 *           type: number
 *           format: float
 *           description: Total amount expected to be paid
 *           example: 150000
 *         amount_paid:
 *           type: number
 *           format: float
 *           description: Amount already paid
 *           example: 75000
 *         academic_year_id:
 *           type: integer
 *           description: ID of the academic year
 *           example: 1
 *         due_date:
 *           type: string
 *           format: date-time
 *           description: Deadline for fee payment
 *           example: "2023-10-31T23:59:59Z"
 *         enrollment_id:
 *           type: integer
 *           description: ID of the student enrollment
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the fee record was created
 *           example: "2023-01-01T12:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the fee record was last updated
 *           example: "2023-01-01T12:00:00Z"
 *       description: School fee information
 *     
 *     PaymentTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the payment transaction
 *           example: 1
 *         enrollment_id:
 *           type: integer
 *           description: ID of the student enrollment
 *           example: 1
 *         academic_year_id:
 *           type: integer
 *           description: ID of the academic year
 *           example: 1
 *         amount:
 *           type: number
 *           format: float
 *           description: Amount paid in this transaction
 *           example: 50000
 *         payment_date:
 *           type: string
 *           format: date-time
 *           description: Date and time of the payment
 *           example: "2023-09-15T10:30:00Z"
 *         receipt_number:
 *           type: string
 *           description: Receipt number for the payment
 *           example: "REC-2023-001"
 *         payment_method:
 *           type: string
 *           enum: [CASH, CARD, ONLINE]
 *           description: Method of payment
 *           example: "CASH"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the transaction was recorded
 *           example: "2023-09-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the transaction was last updated
 *           example: "2023-09-15T10:30:00Z"
 *       description: Payment transaction information
 *     
 *     FeeDetail:
 *       type: object
 *       properties:
 *         fee:
 *           $ref: '#/components/schemas/SchoolFee'
 *         student:
 *           $ref: '#/components/schemas/Student'
 *         transactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PaymentTransaction'
 *       description: Detailed fee information including student and payment transactions
 *     
 *     CreateFeeRequest:
 *       type: object
 *       required:
 *         - student_id
 *         - academic_year_id
 *         - amount_expected
 *         - due_date
 *       properties:
 *         student_id:
 *           type: integer
 *           description: ID of the student
 *           example: 1
 *         academic_year_id:
 *           type: integer
 *           description: ID of the academic year
 *           example: 1
 *         amount_expected:
 *           type: number
 *           format: float
 *           description: Total amount expected to be paid
 *           example: 150000
 *         amount_paid:
 *           type: number
 *           format: float
 *           description: Initial amount paid (if any)
 *           example: 0
 *         due_date:
 *           type: string
 *           format: date-time
 *           description: Deadline for fee payment
 *           example: "2023-10-31T23:59:59Z"
 *       description: Information required to create a new fee record
 *     
 *     RecordPaymentRequest:
 *       type: object
 *       required:
 *         - amount
 *         - payment_method
 *         - student_id
 *       properties:
 *         student_id:
 *           type: integer
 *           description: ID of the student
 *           example: 1
 *         academic_year_id:
 *           type: integer
 *           description: ID of the academic year (optional, defaults to current academic year)
 *           example: 1
 *         amount:
 *           type: number
 *           format: float
 *           description: Amount paid in this transaction
 *           example: 50000
 *         payment_date:
 *           type: string
 *           format: date-time
 *           description: Date and time of the payment (defaults to current time if not provided)
 *           example: "2023-09-15T10:30:00Z"
 *         receipt_number:
 *           type: string
 *           description: Receipt number for the payment
 *           example: "REC-2023-001"
 *         payment_method:
 *           type: string
 *           enum: [CASH, CARD, ONLINE]
 *           description: Method of payment
 *           example: "CASH"
 *       description: Information required to record a payment transaction
 */

// Export empty object as this file is only used for Swagger documentation
export { }; 