/**
 * @swagger
 * components:
 *   schemas:
 *     StudentWithParentRequest:
 *       type: object
 *       required:
 *         - studentName
 *         - dateOfBirth
 *         - placeOfBirth
 *         - gender
 *         - residence
 *         - classId
 *         - parentName
 *         - parentPhone
 *         - parentAddress
 *       properties:
 *         studentName:
 *           type: string
 *           description: Full name of the student
 *           example: "John Doe"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Student's date of birth
 *           example: "2008-05-15"
 *         placeOfBirth:
 *           type: string
 *           description: Student's place of birth
 *           example: "Douala, Cameroon"
 *         gender:
 *           type: string
 *           enum: [MALE, FEMALE]
 *           description: Student's gender
 *           example: "MALE"
 *         residence:
 *           type: string
 *           description: Student's current residence address
 *           example: "123 Main Street, Douala"
 *         formerSchool:
 *           type: string
 *           description: Previous school attended (optional)
 *           example: "Primary School XYZ"
 *         classId:
 *           type: integer
 *           description: ID of the class to enroll student in
 *           example: 1
 *         isNewStudent:
 *           type: boolean
 *           description: Whether this is a new student
 *           example: true
 *         academicYearId:
 *           type: integer
 *           description: Academic year ID (optional, defaults to current)
 *           example: 1
 *         parentName:
 *           type: string
 *           description: Full name of the parent/guardian
 *           example: "Mr. James Doe"
 *         parentPhone:
 *           type: string
 *           description: Parent's phone number (unique identifier)
 *           example: "677123456"
 *         parentWhatsapp:
 *           type: string
 *           description: Parent's WhatsApp number (optional)
 *           example: "677123456"
 *         parentEmail:
 *           type: string
 *           format: email
 *           description: Parent's email address (optional)
 *           example: "james.doe@email.com"
 *         parentAddress:
 *           type: string
 *           description: Parent's address
 *           example: "123 Main Street, Douala"
 *         relationship:
 *           type: string
 *           description: Relationship to student
 *           enum: [Father, Mother, Guardian]
 *           example: "Father"
 *
 *     RegistrationResult:
 *       type: object
 *       properties:
 *         student:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 123
 *             matricule:
 *               type: string
 *               example: "SS24STU001"
 *             name:
 *               type: string
 *               example: "John Doe"
 *             status:
 *               type: string
 *               example: "ENROLLED"
 *         parent:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 456
 *             matricule:
 *               type: string
 *               example: "SS24SO0001"
 *             name:
 *               type: string
 *               example: "Mr. James Doe"
 *             email:
 *               type: string
 *               example: "james.doe@email.com"
 *             temporaryPassword:
 *               type: string
 *               description: Temporary password for parent login
 *               example: "TEMP123ABC"
 *         enrollment:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 789
 *             className:
 *               type: string
 *               example: "Form 1"
 *             status:
 *               type: string
 *               example: "AWAITING_VP_INTERVIEW"
 *         feeRecord:
 *           type: object
 *           description: Fee record if class has fee amount configured
 *           properties:
 *             id:
 *               type: integer
 *               example: 321
 *             amountExpected:
 *               type: number
 *               description: Fee amount in FCFA
 *               example: 100000
 *
 *     LinkExistingParentRequest:
 *       type: object
 *       required:
 *         - studentId
 *         - parentId
 *       properties:
 *         studentId:
 *           type: integer
 *           description: ID of the student
 *           example: 123
 *         parentId:
 *           type: integer
 *           description: ID of the existing parent
 *           example: 456
 *         relationship:
 *           type: string
 *           description: Relationship to student
 *           enum: [Father, Mother, Guardian]
 *           example: "Father"
 *
 *     ParentSearchResult:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 456
 *         name:
 *           type: string
 *           example: "Mrs. Jane Smith"
 *         email:
 *           type: string
 *           example: "jane.smith@email.com"
 *         phone:
 *           type: string
 *           example: "677654321"
 *         matricule:
 *           type: string
 *           example: "SS24SO0002"
 *         childrenCount:
 *           type: integer
 *           description: Number of children linked to this parent
 *           example: 2
 *         children:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 789
 *               name:
 *                 type: string
 *                 example: "Mary Smith"
 *               matricule:
 *                 type: string
 *                 example: "SS24STU002"
 *               className:
 *                 type: string
 *                 example: "Form 2A"
 *
 *     BursarDashboard:
 *       type: object
 *       properties:
 *         financialOverview:
 *           type: object
 *           properties:
 *             totalExpected:
 *               type: number
 *               description: Total fees expected in FCFA
 *               example: 15500000
 *             totalCollected:
 *               type: number
 *               description: Total fees collected in FCFA
 *               example: 12200000
 *             collectionRate:
 *               type: integer
 *               description: Collection rate percentage
 *               example: 79
 *             pendingPayments:
 *               type: integer
 *               description: Number of pending payment records
 *               example: 127
 *             targetAmount:
 *               type: number
 *               description: Target collection amount in FCFA
 *               example: 16000000
 *         recentActivity:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "PAYMENT"
 *               amount:
 *                 type: number
 *                 example: 75000
 *               studentName:
 *                 type: string
 *                 example: "John Doe"
 *               className:
 *                 type: string
 *                 example: "Form 5A"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-22T10:30:00.000Z"
 *               recordedBy:
 *                 type: string
 *                 example: "Bursar Name"
 *         pendingTasks:
 *           type: object
 *           properties:
 *             studentsWithoutFees:
 *               type: integer
 *               description: Number of students without fee records
 *               example: 15
 *             feeAdjustments:
 *               type: integer
 *               description: Number of pending fee adjustments
 *               example: 8
 *         recentRegistrations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 123
 *               name:
 *                 type: string
 *                 example: "Peter Johnson"
 *               matricule:
 *                 type: string
 *                 example: "SS24STU003"
 *               className:
 *                 type: string
 *                 example: "Form 1A"
 *               registrationDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-20T14:15:00.000Z"
 *
 *     CollectionAnalytics:
 *       type: object
 *       properties:
 *         monthlyTrends:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *                 example: "January"
 *               collected:
 *                 type: number
 *                 example: 2100000
 *               expected:
 *                 type: number
 *                 example: 2500000
 *               rate:
 *                 type: number
 *                 example: 84
 *         paymentMethods:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               method:
 *                 type: string
 *                 example: "EXPRESS_UNION"
 *               count:
 *                 type: integer
 *                 example: 45
 *               totalAmount:
 *                 type: number
 *                 example: 1500000
 *         collectionRate:
 *           type: number
 *           description: Overall collection rate percentage
 *           example: 79.2
 *         targetVsActual:
 *           type: object
 *           properties:
 *             target:
 *               type: number
 *               example: 16000000
 *             actual:
 *               type: number
 *               example: 12200000
 *             variance:
 *               type: number
 *               description: Difference between target and actual
 *               example: -3800000
 */

export { }; 