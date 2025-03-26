/**
 * @swagger
 * components:
 *   schemas:
 *     AttendanceStatus:
 *       type: string
 *       enum: [PRESENT, ABSENT, LATE, EXCUSED]
 *       description: Status options for student or teacher attendance
 *       example: PRESENT
 *
 *     DisciplineSeverity:
 *       type: string
 *       enum: [MINOR, MODERATE, MAJOR, CRITICAL]
 *       description: Severity levels for discipline issues
 *       example: MODERATE
 *
 *     DisciplineStatus:
 *       type: string
 *       enum: [PENDING, RESOLVED, ONGOING]
 *       description: Status options for discipline issues
 *       example: RESOLVED
 *
 *     ExamStatus:
 *       type: string
 *       enum: [DRAFT, PUBLISHED, COMPLETED, ARCHIVED]
 *       description: Status options for exam papers
 *       example: PUBLISHED
 *
 *     SubmissionStatus:
 *       type: string
 *       enum: [SUBMITTED, GRADED, PENDING_REVIEW]
 *       description: Status options for exam submissions
 *       example: SUBMITTED
 *
 *     PaymentStatus:
 *       type: string
 *       enum: [PAID, PARTIAL, UNPAID, OVERDUE]
 *       description: Status options for fee payments
 *       example: PARTIAL
 */

export { }; 