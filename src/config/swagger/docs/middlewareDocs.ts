/**
 * @swagger
 * tags:
 *   name: Middleware
 *   description: Documentation for API middleware components
 */

/**
 * @swagger
 * /api-documentation/middleware/case-conversion:
 *   get:
 *     summary: Case Conversion Middleware Documentation
 *     description: |
 *       This page documents how the API automatically converts between camelCase and snake_case formats.
 *       
 *       ## How Case Conversion Works
 *       
 *       The API uses two middleware functions to handle case conversion:
 *       
 *       1. **Input Conversion (camelCase to snake_case)**:
 *          - All incoming requests (body and query parameters) are automatically converted from camelCase to snake_case
 *          - For example, `studentId` becomes `student_id` internally
 *          - This allows client applications to use JavaScript naming conventions while the server uses database-friendly formats
 *       
 *       2. **Output Conversion (snake_case to camelCase)**:
 *          - All outgoing responses are automatically converted from snake_case to camelCase
 *          - For example, `user_roles` becomes `userRoles` in the response
 *          - This ensures clients receive consistently formatted data
 *       
 *       ## Benefits
 *       
 *       - Frontend developers can work with idiomatic JavaScript/TypeScript naming conventions
 *       - Backend systems can use database-friendly naming conventions
 *       - All conversions are handled automatically without additional code
 *       - Consistent API response format
 *       
 *       ## Implementation Details
 *       
 *       The middleware is implemented in `src/api/v1/middleware/caseConversion.middleware.ts` and includes two main functions:
 *       
 *       - `convertCamelToSnakeCase`: Applied to incoming requests
 *       - `convertSnakeToCamelCase`: Applied to outgoing responses
 *     tags: [Middleware]
 *     responses:
 *       200:
 *         description: Successful documentation retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "This endpoint is for documentation purposes only."
 */

/**
 * @swagger
 * /api-documentation/middleware/enum-standardization:
 *   get:
 *     summary: Enum Type Standardization Documentation
 *     description: |
 *       This page documents how the API standardizes enum types across all endpoints.
 *       
 *       ## Standardized Enum Types
 *       
 *       The API uses a set of standardized enum types to ensure consistency across all endpoints:
 *       
 *       - **Role**: User roles in the system (`SUPER_MANAGER`, `PRINCIPAL`, `TEACHER`, etc.)
 *       - **Gender**: Person gender options (`Male`, `Female`)
 *       - **SubjectCategory**: Categories for academic subjects (`SCIENCE_AND_TECHNOLOGY`, `LANGUAGES_AND_LITERATURE`, etc.)
 *       - **PaymentMethod**: Methods for fee payments (`CASH`, `CARD`, `ONLINE`)
 *       - **AverageStatus**: Status of student average calculations (`PENDING`, `CALCULATED`, `VERIFIED`)
 *       - **AttendanceStatus**: Status options for attendance (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`)
 *       - **DisciplineSeverity**: Severity levels for discipline issues (`MINOR`, `MODERATE`, `MAJOR`, `CRITICAL`)
 *       - **DisciplineStatus**: Status options for discipline issues (`PENDING`, `RESOLVED`, `ONGOING`)
 *       - **QuestionType**: Types of exam questions (`MCQ`, `LONG_ANSWER`)
 *       - **SubmissionStatus**: Status options for exam submissions (`SUBMITTED`, `GRADED`, `PENDING_REVIEW`)
 *       - **Audience**: Target audience for announcements (`INTERNAL`, `EXTERNAL`, `BOTH`)
 *       - **NotificationStatus**: Status of mobile notifications (`SENT`, `DELIVERED`, `READ`)
 *       - **DayOfWeek**: Days of the week (`MONDAY` through `SUNDAY`)
 *       
 *       ## How to Use Enum Types
 *       
 *       To use these standardized enum types in your API requests:
 *       
 *       1. Include the enum value exactly as documented (case-sensitive)
 *       2. For request parameters, use the appropriate enum value
 *       3. For responses, expect the enum value as documented
 *       
 *       ## Benefits
 *       
 *       - Consistent data format across the API
 *       - Clear documentation of valid options
 *       - Reduced errors due to invalid enum values
 *       - Improved code maintainability
 *     tags: [Middleware]
 *     responses:
 *       200:
 *         description: Successful documentation retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "This endpoint is for documentation purposes only."
 */

export { }; 