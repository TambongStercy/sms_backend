/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentMethod:
 *       type: string
 *       enum: [CASH, CARD, ONLINE]
 *       description: Method used for making payments
 *
 *     Audience:
 *       type: string
 *       enum: [INTERNAL, EXTERNAL, BOTH]
 *       description: Target audience for announcements
 *
 *     NotificationStatus:
 *       type: string
 *       enum: [SENT, DELIVERED, READ]
 *       description: Status of a mobile notification
 *
 *     QuestionType:
 *       type: string
 *       enum: [MCQ, LONG_ANSWER]
 *       description: Type of exam question
 *
 *     Role:
 *       type: string
 *       enum: [SUPER_MANAGER, MANAGER, PRINCIPAL, VICE_PRINCIPAL, BURSAR, TEACHER, DISCIPLINE_MASTER, GUIDANCE_COUNSELOR, PARENT]
 *       description: User role in the school system
 *
 *     DayOfWeek:
 *       type: string
 *       enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *       description: Day of the week
 *
 *     Gender:
 *       type: string
 *       enum: [Female, Male]
 *       description: Gender of a person
 *
 *     SubjectCategory:
 *       type: string
 *       enum: [SCIENCE_AND_TECHNOLOGY, LANGUAGES_AND_LITERATURE, HUMAN_AND_SOCIAL_SCIENCE, OTHERS]
 *       description: Category of academic subject
 *
 *     AverageStatus:
 *       type: string
 *       enum: [PENDING, CALCULATED, VERIFIED]
 *       description: Status of a student's average calculation
 */

export { }; 