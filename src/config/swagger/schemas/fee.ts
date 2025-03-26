/**
 * @swagger
 * components:
 *   schemas:
 *     SchoolFees:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Fee ID
 *           example: 1
 *         enrollmentId:
 *           type: integer
 *           description: Student enrollment ID
 *           example: 1
 *         academicYearId:
 *           type: integer
 *           description: Academic year ID
 *           example: 1
 *         feeAmount:
 *           type: number
 *           description: Total fee amount
 *           example: 100000
 *         amountPaid:
 *           type: number
 *           description: Amount already paid
 *           example: 75000
 *         remainingAmount:
 *           type: number
 *           description: Remaining amount to be paid
 *           example: 25000
 *         status:
 *           type: string
 *           enum: [PAID, PARTIAL, UNPAID]
 *           description: Payment status
 *           example: PARTIAL
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00.000Z
 *
 *     PaymentTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Transaction ID
 *           example: 1
 *         enrollmentId:
 *           type: integer
 *           description: Student enrollment ID
 *           example: 1
 *         academicYearId:
 *           type: integer
 *           description: Academic year ID
 *           example: 1
 *         amount:
 *           type: number
 *           description: Payment amount
 *           example: 25000
 *         paymentDate:
 *           type: string
 *           format: date-time
 *           description: Date of payment
 *           example: 2023-09-15T10:30:00.000Z
 *         feeId:
 *           type: integer
 *           description: School fees ID
 *           example: 1
 *         receiptNumber:
 *           type: string
 *           description: Receipt number
 *           example: "REC-2023-001"
 *         paymentMethod:
 *           $ref: '#/components/schemas/PaymentMethod'
 *           description: Method of payment
 *           example: CARD
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00.000Z
 */

export { }; 
